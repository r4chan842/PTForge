function parsePingOutput(text) {
    var output = String(text || "");
    var result = { sent: 0, received: 0, percent: null, rtt: null };
    var ios = /Success +rate +is +(\d+) +percent +\((\d+)\/(\d+)\)/i.exec(output);
    if (ios) {
        result.percent = Number(ios[1]);
        result.received = Number(ios[2]);
        result.sent = Number(ios[3]);
        var times = /min\/avg\/max *= *(\d+)\/(\d+)\/(\d+)/i.exec(output);
        if (times) {
            result.rtt = { min: Number(times[1]), avg: Number(times[2]), max: Number(times[3]) };
        }
        return result;
    }
    var host = /Sent *= *(\d+), *Received *= *(\d+)/i.exec(output);
    if (host) {
        result.sent = Number(host[1]);
        result.received = Number(host[2]);
        result.percent = result.sent ? Math.round(result.received * 100 / result.sent) : 0;
        var hostTimes = /Minimum *= *(\d+)ms, *Maximum *= *(\d+)ms, *Average *= *(\d+)ms/i.exec(output);
        if (hostTimes) {
            result.rtt = { min: Number(hostTimes[1]), avg: Number(hostTimes[3]), max: Number(hostTimes[2]) };
        }
    }
    return result;
}

function pingState(percent) {
    if (percent === null) {
        return "unknown";
    }
    if (percent >= 100) {
        return "ok";
    }
    return percent > 0 ? "partial" : "failed";
}

function resolveTarget(target) {
    var text = String(target);
    if (isValidIp(text)) {
        return { label: text, ip: text };
    }
    var rows = getIpInventory().filter(function (row) {
        return row.device === text;
    });
    if (!rows.length) {
        throw new Error("No IPv4 address found on " + text);
    }
    return { label: text, ip: rows[0].ip };
}

function pingTest(source, target, count) {
    var resolved = resolveTarget(target);
    var device = findDevice(source);
    var row = { source: String(source), target: resolved.label, ip: resolved.ip, state: "unknown", percent: null, sent: 0, received: 0, rtt: null, output: "" };
    if (typeof device.enterCommand !== "function") {
        runHostCommand(source, "ping " + (count ? "-n " + count + " " : "") + resolved.ip);
        row.state = "sent";
        return row;
    }
    var answer = runCommand(source, "ping " + resolved.ip + (count ? " repeat " + count : ""), "enable");
    var parsed = parsePingOutput(answer.output);
    row.output = answer.output;
    row.percent = parsed.percent;
    row.sent = parsed.sent;
    row.received = parsed.received;
    row.rtt = parsed.rtt;
    row.state = pingState(parsed.percent);
    return row;
}

function reachabilityReport(rows) {
    var report = { rows: rows, total: rows.length, ok: 0, partial: 0, failed: 0, unknown: 0 };
    rows.forEach(function (row) {
        if (row.state === "ok" || row.state === "partial" || row.state === "failed") {
            report[row.state]++;
        } else {
            report.unknown++;
        }
    });
    return report;
}

function pingLine(device) {
    if (typeof device.getCommandLine === "function") {
        return device.getCommandLine();
    }
    if (typeof device.getCommandPrompt === "function") {
        return device.getCommandPrompt();
    }
    return null;
}

function eventText(args, key) {
    if (!args) {
        return "";
    }
    if (typeof args === "string") {
        return args;
    }
    if (isDefined(args[key])) {
        return String(args[key]);
    }
    if (isDefined(args[0])) {
        return String(args[0]);
    }
    return "";
}

function pingCommand(device, ip, count) {
    if (typeof device.enterCommand === "function") {
        return "ping " + ip + (count ? " repeat " + count : "");
    }
    return "ping " + (count ? "-n " + count + " " : "") + ip;
}

function finishPingRow(row, text) {
    var parsed = parsePingOutput(text);
    row.output = text;
    row.percent = parsed.percent;
    row.sent = parsed.sent;
    row.received = parsed.received;
    row.rtt = parsed.rtt;
    row.state = pingState(parsed.percent);
}

function refreshReport(report) {
    report.ok = 0;
    report.partial = 0;
    report.failed = 0;
    report.unknown = 0;
    report.pending = 0;
    report.rows.forEach(function (row) {
        if (row.state === "ok" || row.state === "partial" || row.state === "failed") {
            report[row.state]++;
        } else if (row.state === "pending") {
            report.pending++;
        } else {
            report.unknown++;
        }
    });
    report.total = report.rows.length;
    report.done = report.pending === 0;
    return report;
}

function PingRunner(source, device, line, rows, onFinished) {
    this.source = source;
    this.device = device;
    this.line = line;
    this.rows = rows;
    this.index = -1;
    this.buffer = "";
    this.onFinished = onFinished;
}

PingRunner.prototype.start = function () {
    this.line.registerEvent("outputWritten", this, this.onOutput);
    this.line.registerEvent("commandEnded", this, this.onEnded);
    if (typeof this.device.enterCommand === "function") {
        this.device.enterCommand("terminal length 0", "enable");
    }
    this.next();
};

PingRunner.prototype.next = function () {
    this.index++;
    if (this.index >= this.rows.length) {
        this.stop();
        this.onFinished();
        return;
    }
    this.buffer = "";
    this.line.enterCommand(this.rows[this.index].command);
};

PingRunner.prototype.stop = function () {
    try {
        this.line.unregisterEvent("outputWritten", this, this.onOutput);
        this.line.unregisterEvent("commandEnded", this, this.onEnded);
    } catch (error) {
        return;
    }
};

PingRunner.prototype.onOutput = function (src, args) {
    this.buffer += eventText(args, "newOutput");
};

PingRunner.prototype.onEnded = function (src, args) {
    var row = this.rows[this.index];
    if (!row) {
        return;
    }
    var input = eventText(args, "inputCommand");
    if (input && input.indexOf("ping") !== 0) {
        return;
    }
    finishPingRow(row, this.buffer);
    this.next();
};

var activePingRunners = [];

function stopPings() {
    var count = activePingRunners.length;
    activePingRunners.forEach(function (runner) {
        runner.stop();
    });
    activePingRunners = [];
    return count;
}

function pingMatrix(sources, targets, count, onDone) {
    var report = { rows: [], total: 0, ok: 0, partial: 0, failed: 0, unknown: 0, pending: 0, done: false };
    var inventory = getIpInventory();
    var runners = [];
    stopPings();
    toList(sources).forEach(function (source) {
        var ownIps = inventory.filter(function (r) { return r.device === source; }).map(function (r) { return r.ip; });
        var device = null;
        var line = null;
        try {
            device = findDevice(source);
            line = pingLine(device);
        } catch (error) {
            device = null;
        }
        var jobs = [];
        toList(targets).forEach(function (target) {
            try {
                var resolved = resolveTarget(target);
                if (String(target) === String(source) || ownIps.indexOf(resolved.ip) !== -1) {
                    return;
                }
                if (!device) {
                    throw new Error("No device named " + source);
                }
                var row = { source: String(source), target: resolved.label, ip: resolved.ip, state: "pending", percent: null, sent: 0, received: 0, rtt: null, output: "" };
                if (line && typeof line.registerEvent === "function") {
                    row.command = pingCommand(device, resolved.ip, count);
                    jobs.push(row);
                } else {
                    var direct = pingTest(source, target, count);
                    for (var key in direct) {
                        row[key] = direct[key];
                    }
                }
                report.rows.push(row);
            } catch (error) {
                report.rows.push({ source: String(source), target: String(target), ip: "", state: "error", percent: null, sent: 0, received: 0, rtt: null, output: error.message });
            }
        });
        if (jobs.length) {
            runners.push(new PingRunner(source, device, line, jobs, function () {
                refreshReport(report);
                if (report.done) {
                    report.rows.forEach(function (row) {
                        delete row.command;
                    });
                    activePingRunners = [];
                    if (onDone) {
                        onDone(report);
                    }
                }
            }));
        }
    });
    refreshReport(report);
    activePingRunners = runners;
    if (!runners.length) {
        if (onDone) {
            onDone(report);
        }
        return report;
    }
    runners.forEach(function (runner) {
        runner.start();
    });
    return report;
}

function reachabilitySources(inventory) {
    function withIp(name) {
        return inventory.some(function (row) {
            return row.device === name;
        });
    }
    var ios = getDevices(iosDeviceTypes).filter(withIp);
    if (ios.length) {
        return ios;
    }
    return getDevices().filter(function (name) {
        return withIp(name) && iosDeviceTypes.indexOf(getDeviceType(name)) === -1;
    });
}

function reachability(options) {
    var settings = options || {};
    var inventory = getIpInventory();
    var sources = settings.sources ? toList(settings.sources) : reachabilitySources(inventory);
    var targets = settings.targets ? toList(settings.targets) : inventory.filter(function (row) {
        return !/^(127\.|169\.254\.)/.test(row.ip);
    }).map(function (row) {
        return row.ip;
    }).filter(function (ip, index, list) {
        return list.indexOf(ip) === index;
    });
    var report = pingMatrix(sources, targets, settings.count, function (finished) {
        finished.sources = sources;
        finished.targets = targets;
        editorSend("reachability", finished);
        log("Reachability: " + finished.ok + " reachable, " + finished.partial + " partial, " + finished.failed + " failed, " + finished.unknown + " unknown");
        if (settings.onDone) {
            settings.onDone(finished);
        }
    });
    report.sources = sources;
    report.targets = targets;
    return report;
}
