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

function pingMatrix(sources, targets, count) {
    var rows = [];
    var inventory = getIpInventory();
    toList(sources).forEach(function (source) {
        var ownIps = inventory.filter(function (r) { return r.device === source; }).map(function (r) { return r.ip; });
        toList(targets).forEach(function (target) {
            try {
                var resolved = resolveTarget(target);
                if (String(target) === String(source) || ownIps.indexOf(resolved.ip) !== -1) {
                    return;
                }
                rows.push(pingTest(source, target, count));
            } catch (error) {
                rows.push({ source: String(source), target: String(target), ip: "", state: "error", percent: null, sent: 0, received: 0, rtt: null, output: error.message });
            }
        });
    });
    return reachabilityReport(rows);
}

function reachability(options) {
    var settings = options || {};
    var inventory = getIpInventory();
    var sources = settings.sources ? toList(settings.sources) : getDevices(iosDeviceTypes).filter(function (name) {
        return inventory.some(function (row) {
            return row.device === name;
        });
    });
    var targets = settings.targets ? toList(settings.targets) : inventory.filter(function (row) {
        return !/^(127\.|169\.254\.)/.test(row.ip);
    }).map(function (row) {
        return row.ip;
    }).filter(function (ip, index, list) {
        return list.indexOf(ip) === index;
    });
    var report = pingMatrix(sources, targets, settings.count);
    report.sources = sources;
    report.targets = targets;
    editorSend("reachability", report);
    return report;
}
