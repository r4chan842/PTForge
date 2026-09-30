var snapshotStore = {};
var snapshotOrder = [];
var snapshotNoise = /^(Building configuration|Current configuration|Last configuration change|NVRAM config last updated|!\s*$|\s*$|--More--)/;

function configLines(text) {
    return String(text || "").replace(/\r/g, "").split("\n").map(function (line) {
        return line.replace(/\s+$/, "");
    }).filter(function (line) {
        return !snapshotNoise.test(line);
    });
}

function diffLines(before, after) {
    var a = toList(before);
    var b = toList(after);
    var start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) {
        start++;
    }
    var endA = a.length;
    var endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
        endA--;
        endB--;
    }
    var midA = a.slice(start, endA);
    var midB = b.slice(start, endB);
    var result = [];
    var i;
    for (i = 0; i < start; i++) {
        result.push({ op: " ", text: a[i] });
    }
    if (midA.length * midB.length > 4000000) {
        midA.forEach(function (line) { result.push({ op: "-", text: line }); });
        midB.forEach(function (line) { result.push({ op: "+", text: line }); });
    } else {
        var table = [];
        for (i = 0; i <= midA.length; i++) {
            var row = [];
            for (var k = 0; k <= midB.length; k++) {
                row.push(0);
            }
            table.push(row);
        }
        for (i = midA.length - 1; i >= 0; i--) {
            for (var j = midB.length - 1; j >= 0; j--) {
                table[i][j] = midA[i] === midB[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
            }
        }
        var x = 0;
        var y = 0;
        while (x < midA.length && y < midB.length) {
            if (midA[x] === midB[y]) {
                result.push({ op: " ", text: midA[x] });
                x++;
                y++;
            } else if (table[x + 1][y] >= table[x][y + 1]) {
                result.push({ op: "-", text: midA[x] });
                x++;
            } else {
                result.push({ op: "+", text: midB[y] });
                y++;
            }
        }
        for (; x < midA.length; x++) {
            result.push({ op: "-", text: midA[x] });
        }
        for (; y < midB.length; y++) {
            result.push({ op: "+", text: midB[y] });
        }
    }
    for (i = endA; i < a.length; i++) {
        result.push({ op: " ", text: a[i] });
    }
    return result;
}

function captureState() {
    var devices = [];
    for (var i = 0; i < network().getDeviceCount(); i++) {
        var device = network().getDeviceAt(i);
        var name = String(device.getName());
        var ports = [];
        for (var j = 0; j < device.getPortCount(); j++) {
            var info = describePort(device.getPortAt(j));
            ports.push({ name: info.name, ip: isAssigned(info.ip) ? info.ip + "/" + maskToCidr(info.mask) : "", up: info.up, peer: info.connectedTo });
        }
        var config = "";
        if (isIosDevice(device)) {
            try {
                config = getRunningConfig(name);
            } catch (error) {
                config = "";
            }
        }
        devices.push({
            name: name,
            model: String(callIfExists(device, "getModel", "")),
            type: deviceTypeName(device.getType()),
            power: callIfExists(device, "getPower", true) !== false,
            ports: ports,
            config: configLines(config)
        });
    }
    var links = getLinks().filter(function (link) {
        return link.from;
    }).map(function (link) {
        var ends = [link.from.device + " " + link.from.port, link.to.device + " " + link.to.port].sort();
        return ends[0] + " <-> " + ends[1];
    }).sort();
    return { devices: devices, links: links };
}

function snapshotSummary(snapshot) {
    return { name: snapshot.name, time: snapshot.time, devices: snapshot.state.devices.length, links: snapshot.state.links.length };
}

function takeSnapshot(name) {
    var label = name ? String(name) : "snapshot-" + (snapshotOrder.length + 1);
    if (!snapshotStore[label]) {
        snapshotOrder.push(label);
    }
    snapshotStore[label] = { name: label, time: new Date().toISOString(), state: captureState() };
    editorSend("snapshots", getSnapshots());
    return label;
}

function getSnapshots() {
    return snapshotOrder.map(function (name) {
        return snapshotSummary(snapshotStore[name]);
    });
}

function getSnapshot(name) {
    var snapshot = snapshotStore[name];
    if (!snapshot) {
        throw new Error("Unknown snapshot: " + name + ". Existing: " + (snapshotOrder.join(", ") || "none"));
    }
    return snapshot;
}

function deleteSnapshot(name) {
    getSnapshot(name);
    delete snapshotStore[name];
    snapshotOrder = snapshotOrder.filter(function (item) {
        return item !== name;
    });
    editorSend("snapshots", getSnapshots());
    return true;
}

function byName(list) {
    var map = {};
    list.forEach(function (item) {
        map[item.name] = item;
    });
    return map;
}

function compareStates(before, after) {
    var oldDevices = byName(before.devices);
    var newDevices = byName(after.devices);
    var result = {
        devicesAdded: [],
        devicesRemoved: [],
        linksAdded: [],
        linksRemoved: [],
        powerChanges: [],
        addressChanges: [],
        portChanges: [],
        configChanges: []
    };
    after.devices.forEach(function (device) {
        if (!oldDevices[device.name]) {
            result.devicesAdded.push(device.name);
        }
    });
    before.devices.forEach(function (device) {
        var next = newDevices[device.name];
        if (!next) {
            result.devicesRemoved.push(device.name);
            return;
        }
        if (device.power !== next.power) {
            result.powerChanges.push({ device: device.name, before: device.power, after: next.power });
        }
        var nextPorts = byName(next.ports);
        device.ports.forEach(function (port) {
            var later = nextPorts[port.name];
            if (!later) {
                return;
            }
            if (port.ip !== later.ip) {
                result.addressChanges.push({ device: device.name, port: port.name, before: port.ip, after: later.ip });
            }
            if (port.up !== later.up) {
                result.portChanges.push({ device: device.name, port: port.name, before: port.up ? "up" : "down", after: later.up ? "up" : "down" });
            }
        });
        var lines = diffLines(device.config, next.config);
        var added = lines.filter(function (l) { return l.op === "+"; }).map(function (l) { return l.text; });
        var removed = lines.filter(function (l) { return l.op === "-"; }).map(function (l) { return l.text; });
        if (added.length || removed.length) {
            result.configChanges.push({ device: device.name, added: added, removed: removed, diff: lines });
        }
    });
    var oldLinks = {};
    var newLinks = {};
    before.links.forEach(function (l) { oldLinks[l] = true; });
    after.links.forEach(function (l) {
        newLinks[l] = true;
        if (!oldLinks[l]) {
            result.linksAdded.push(l);
        }
    });
    before.links.forEach(function (l) {
        if (!newLinks[l]) {
            result.linksRemoved.push(l);
        }
    });
    result.changes = result.devicesAdded.length + result.devicesRemoved.length + result.linksAdded.length + result.linksRemoved.length +
        result.powerChanges.length + result.addressChanges.length + result.portChanges.length + result.configChanges.length;
    return result;
}

function compareSnapshots(from, to) {
    var before = getSnapshot(from);
    var after = to ? getSnapshot(to) : { name: "current", time: new Date().toISOString(), state: captureState() };
    var result = compareStates(before.state, after.state);
    result.from = before.name;
    result.to = after.name;
    return result;
}

function showSnapshotDiff(from, to) {
    var result = compareSnapshots(from, to);
    if (!editorSend("snapshot-diff", result)) {
        showMessage(result.changes + " changes between " + result.from + " and " + result.to);
    }
    return result;
}

function saveSnapshot(name, path) {
    writeTextFile(path, JSON.stringify(getSnapshot(name), null, 2));
    return path;
}

function loadSnapshot(path, name) {
    var data = JSON.parse(readTextFile(path));
    if (!data || !data.state || !data.state.devices) {
        throw new Error("Not a PTForge snapshot: " + path);
    }
    var label = name ? String(name) : String(data.name || baseName(path).replace(/\.json$/i, ""));
    if (!snapshotStore[label]) {
        snapshotOrder.push(label);
    }
    snapshotStore[label] = { name: label, time: String(data.time || ""), state: data.state };
    editorSend("snapshots", getSnapshots());
    return label;
}
