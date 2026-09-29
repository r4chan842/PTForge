function labelDevice(deviceName, text, offsetY) {
    var position = getDevicePosition(deviceName);
    var dy = isDefined(offsetY) ? offsetY : -30;
    return addNote(position.x, position.y + dy, isDefined(text) ? text : deviceName);
}

function labelDevices(map, offsetY) {
    var ids = {};
    Object.keys(map).forEach(function (name) {
        ids[name] = labelDevice(name, map[name], offsetY);
    });
    return ids;
}

function labelAllDevices(formatter, offsetY) {
    var ids = {};
    getDevices().forEach(function (name) {
        var text = typeof formatter === "function" ? formatter(name) : name;
        ids[name] = labelDevice(name, text, offsetY);
    });
    return ids;
}

function labelWithIp(deviceName, portName, offsetY) {
    var info = getPortInfo(deviceName, portName);
    var text = deviceName + (info.ip && info.ip !== "0.0.0.0" ? "\n" + info.ip + "/" + maskToCidr(info.mask) : "");
    return labelDevice(deviceName, text, offsetY);
}

function labelLink(device1Name, device2Name, text) {
    var a = getDevicePosition(device1Name);
    var b = getDevicePosition(device2Name);
    return addNote((a.centerX + b.centerX) / 2, (a.centerY + b.centerY) / 2, text);
}
