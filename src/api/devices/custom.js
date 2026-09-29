function setCustomVar(deviceName, key, value) {
    findDevice(deviceName).addCustomVar(String(key), String(value));
    return true;
}

function getCustomVar(deviceName, key) {
    var device = findDevice(deviceName);
    return device.hasCustomVar(String(key)) ? String(device.getCustomVarStr(String(key))) : null;
}

function removeCustomVar(deviceName, key) {
    return findDevice(deviceName).removeCustomVar(String(key)) === true;
}

function getCustomVars(deviceName) {
    var device = findDevice(deviceName);
    var result = {};
    for (var i = 0; i < device.getCustomVarsCount(); i++) {
        result[String(device.getCustomVarNameAt(i))] = String(device.getCustomVarValueStrAt(i));
    }
    return result;
}

function setDeviceImage(deviceName, logicalPath, physicalPath) {
    var device = findDevice(deviceName);
    if (logicalPath) {
        device.setCustomLogicalImage(logicalPath);
    }
    if (physicalPath) {
        device.setCustomPhysicalImage(physicalPath);
    }
    return true;
}
