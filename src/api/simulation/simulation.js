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

function ping(deviceName, target, count) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand === "function") {
        var command = "ping " + target + (count ? " repeat " + count : "");
        return runCommand(deviceName, command, "enable");
    }
    runHostCommand(deviceName, "ping " + (count ? "-n " + count + " " : "") + target);
    return { status: "sent", output: "" };
}

function traceroute(deviceName, target) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand === "function") {
        return runCommand(deviceName, "traceroute " + target, "enable");
    }
    runHostCommand(deviceName, "tracert " + target);
    return { status: "sent", output: "" };
}

function pingAll(sourceDevice, targets) {
    if (!isDefined(sourceDevice)) {
        return reachability();
    }
    return reachability({ sources: toList(sourceDevice), targets: isDefined(targets) ? toList(targets) : undefined });
}
