function withPowerOff(device, action) {
    var wasOn = device.getPower();
    if (wasOn) {
        device.setPower(false);
    }
    var result;
    try {
        result = action();
    } finally {
        if (wasOn) {
            device.setPower(true);
            skipBootIfIos(device);
        }
    }
    return result;
}

function addModule(deviceName, slot, model) {
    var device = findDevice(deviceName);
    var moduleType = allModuleTypes[model];
    if (moduleType === undefined) {
        throw new Error("Unknown module: " + model);
    }
    return withPowerOff(device, function () {
        return device.addModule(String(slot), moduleType, model) === true;
    });
}

function addModules(deviceName, modules) {
    return Object.keys(modules).map(function (slot) {
        return addModule(deviceName, slot, modules[slot]);
    });
}

function removeModule(deviceName, slot) {
    var device = findDevice(deviceName);
    return withPowerOff(device, function () {
        return device.removeModule(String(slot)) === true;
    });
}

function getSupportedModules(deviceName) {
    var list = findDevice(deviceName).getSupportedModule();
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(String(list[i]));
    }
    return result;
}
