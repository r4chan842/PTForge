function zoomIn() {
    activeWorkspace().zoomIn();
    return true;
}

function zoomOut() {
    activeWorkspace().zoomOut();
    return true;
}

function zoomReset() {
    activeWorkspace().zoomReset();
    return true;
}

function getZoom() {
    return logicalWorkspace().getCurrentZoom();
}

function centerOn(target, y) {
    if (typeof target === "string") {
        findDevice(target);
        logicalWorkspace().centerOnComponentByName(target);
    } else {
        logicalWorkspace().centerOn(target, y);
    }
    return true;
}

function setBackground(imagePath, tiled) {
    activeWorkspace().setLogicalBackgroundPath(String(imagePath), tiled === true);
    return true;
}

function devicesInArea(x1, y1, x2, y2) {
    return toArray(activeWorkspace().devicesAt(x1, y1, x2, y2, false)).map(String);
}

function getPacketTracerVersion() {
    return String(appWindow().getVersion());
}

function clearTopology() {
    var names = getDevices();
    names.forEach(function (name) {
        logicalWorkspace().removeDevice(name);
    });
    clearCanvas();
    return names.length;
}
