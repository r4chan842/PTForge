function setSimulationMode(on) {
    ipc.simulation().setSimulationMode(on !== false);
    return true;
}

function isSimulationMode() {
    return ipc.simulation().isSimulationMode() === true;
}

function resetSimulation() {
    ipc.simulation().resetSimulation();
    return true;
}

function stepForward(steps) {
    for (var i = 0; i < (steps || 1); i++) {
        ipc.simulation().forward();
    }
    return true;
}

function stepBack(steps) {
    for (var i = 0; i < (steps || 1); i++) {
        ipc.simulation().backward();
    }
    return true;
}

function playSimulation() {
    appWindow().getSimulationPanel().play();
    return true;
}

function setSimulationFilter(protocol, visible) {
    appWindow().getSimulationPanel().setFilter(String(protocol).toUpperCase(), visible !== false);
    return true;
}

function showAllSimulationFilters() {
    appWindow().getSimulationPanel().setAllFilters();
    return true;
}

function getSimulationTime() {
    return ipc.simulation().getCurrentSimTime();
}

function getSimulationEventCount() {
    return ipc.simulation().getFrameInstanceCount();
}

function addSimplePdu(sourceDevice, destinationDevice) {
    findDevice(sourceDevice);
    findDevice(destinationDevice);
    return appWindow().getUserCreatedPDU().addSimplePdu(sourceDevice, destinationDevice);
}

function firePdu(index) {
    appWindow().getUserCreatedPDU().firePDU(index || 0);
    return true;
}

function deletePdu(index) {
    appWindow().getUserCreatedPDU().deletePDU(index || 0);
    return true;
}

function ping(deviceName, target, count, onDone) {
    var device = findDevice(deviceName);
    return runLineCommand(deviceName, pingCommand(device, target, count), onDone, function (row, text) {
        finishPingRow(row, text);
        row.target = String(target);
    });
}

function traceroute(deviceName, target, onDone) {
    var device = findDevice(deviceName);
    var command = (typeof device.enterCommand === "function" ? "traceroute " : "tracert ") + target;
    return runLineCommand(deviceName, command, onDone, function (row, text) {
        row.target = String(target);
        row.hops = parseTraceOutput(text);
    });
}

function parseTraceOutput(text) {
    var hops = [];
    String(text || "").split(/\r?\n/).forEach(function (line) {
        var match = /^\s*(\d+)\s+(.*)$/.exec(line);
        if (!match) {
            return;
        }
        var ip = /(\d{1,3}(?:\.\d{1,3}){3})/.exec(match[2]);
        var times = (match[2].match(/(\d+)\s*ms(ec)?/g) || []).map(function (t) {
            return Number(/\d+/.exec(t)[0]);
        });
        hops.push({ hop: Number(match[1]), ip: ip ? ip[1] : null, times: times, timeout: !ip });
    });
    return hops;
}

function pingAll(sourceDevice, targets) {
    if (!isDefined(sourceDevice)) {
        return reachability();
    }
    return reachability({ sources: toList(sourceDevice), targets: isDefined(targets) ? toList(targets) : undefined });
}
