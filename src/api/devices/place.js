function addDevice(deviceName, deviceModel, x, y) {
    var name = oneLine(deviceName);
    var model = resolveDeviceModel(deviceModel);
    var left = isDefined(x) ? x : 0;
    var top = isDefined(y) ? y : 0;

    if (!name) {
        throw new Error("addDevice needs a name, for example \"R1\"");
    }
    if (deviceExists(name)) {
        throw new Error("Device name already in use: " + name + ". Call removeDevice or renameDevice first");
    }
    if (typeof left !== "number" || typeof top !== "number" || !isFinite(left) || !isFinite(top)) {
        throw new Error("addDevice needs numeric x and y coordinates, got " + x + " and " + y);
    }

    var createdName = String(logicalWorkspace().addDevice(allDeviceTypes[model], model, left, top));
    if (!createdName) {
        throw new Error("Packet Tracer refused to add " + model + ": the model may not exist in this version. Run getDeviceModels(\"" + (deviceTypeNames[allDeviceTypes[model]] || "") + "\") to see the models this build knows");
    }

    var device = network().getDevice(createdName);
    if (!device) {
        throw new Error("Packet Tracer reported " + createdName + " but the device is not in the network");
    }
    device.setName(name);
    skipBootIfIos(device);
    return true;
}

function addDevices(list) {
    toList(list).forEach(function (entry) {
        addDevice(entry[0], entry[1], entry[2], entry[3]);
    });
    return true;
}

function removeDevice(deviceName) {
    if (Array.isArray(deviceName)) {
        return deviceName.map(removeDevice).every(Boolean);
    }
    return logicalWorkspace().removeDevice(String(deviceName)) === true;
}

function renameDevice(oldName, newName) {
    var target = oneLine(newName);
    if (!target) {
        throw new Error("renameDevice needs a new name");
    }
    if (deviceExists(target)) {
        throw new Error("Device name already in use: " + target);
    }
    findDevice(oldName).setName(target);
    return true;
}
