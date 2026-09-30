function addDevice(deviceName, deviceModel, x, y) {
    var deviceType = allDeviceTypes[deviceModel];
    if (deviceType === undefined) {
        throw new Error("Unknown device model: " + deviceModel);
    }
    if (deviceExists(deviceName)) {
        throw new Error("Device name already in use: " + deviceName);
    }

    var createdName = logicalWorkspace().addDevice(deviceType, deviceModel, x, y);
    if (!createdName) {
        return false;
    }

    var device = network().getDevice(createdName);
    device.setName(deviceName);
    skipBootIfIos(device);
    return true;
}

function addDevices(list) {
    return list.map(function (entry) {
        return addDevice(entry[0], entry[1], entry[2], entry[3]);
    });
}

function removeDevice(deviceName) {
    if (Array.isArray(deviceName)) {
        return deviceName.map(removeDevice).every(Boolean);
    }
    return logicalWorkspace().removeDevice(String(deviceName)) === true;
}

function renameDevice(oldName, newName) {
    if (deviceExists(newName)) {
        throw new Error("Device name already in use: " + newName);
    }
    findDevice(oldName).setName(newName);
    return true;
}

function moveDevice(deviceName, x, y, centered) {
    var device = findDevice(deviceName);
    return centered === true ? device.moveToLocationCentered(x, y) : device.moveToLocation(x, y);
}

function moveDeviceBy(deviceName, dx, dy) {
    var device = findDevice(deviceName);
    return device.moveToLocation(Math.round(device.getXCoordinate() + dx), Math.round(device.getYCoordinate() + dy));
}

function getDevicePosition(deviceName) {
    var device = findDevice(deviceName);
    return {
        x: device.getXCoordinate(),
        y: device.getYCoordinate(),
        centerX: device.getCenterXCoordinate(),
        centerY: device.getCenterYCoordinate()
    };
}

function getDevices(filter, startsWith) {
    var prefix = startsWith || "";
    var types = null;

    if (isDefined(filter) && filter !== "") {
        types = toList(filter).map(resolveDeviceType);
    }

    var names = [];
    for (var i = 0; i < network().getDeviceCount(); i++) {
        var device = network().getDeviceAt(i);
        var name = String(device.getName());
        if ((!types || types.indexOf(device.getType()) !== -1) && name.indexOf(prefix) === 0) {
            names.push(name);
        }
    }
    return names;
}

function getDeviceCount() {
    return network().getDeviceCount();
}

function getDeviceModel(deviceName) {
    return String(findDevice(deviceName).getModel());
}

function getDeviceType(deviceName) {
    return findDevice(deviceName).getType();
}

function setPower(deviceName, on) {
    var device = findDevice(deviceName);
    var state = on !== false;
    device.setPower(state);
    if (state) {
        skipBootIfIos(device);
    }
    return true;
}

function getPower(deviceName) {
    return findDevice(deviceName).getPower();
}

function restartDevice(deviceName) {
    setPower(deviceName, false);
    return setPower(deviceName, true);
}

function getDeviceInfo(deviceName) {
    var device = findDevice(deviceName);
    var ports = [];
    var neighbors = portNeighbors(deviceName);
    for (var i = 0; i < device.getPortCount(); i++) {
        ports.push(describePortOf(deviceName, device.getPortAt(i), neighbors));
    }
    return {
        name: String(device.getName()),
        model: String(device.getModel()),
        type: device.getType(),
        power: device.getPower(),
        serial: String(callIfExists(device, "getSerialNumber", "")),
        x: device.getXCoordinate(),
        y: device.getYCoordinate(),
        ports: ports
    };
}

function movePhysical(deviceName, x, y) {
    return findDevice(deviceName).moveToLocInPhysicalWS(x, y);
}

function movePhysicalBy(deviceName, dx, dy) {
    return findDevice(deviceName).moveByInPhysicalWS(dx, dy);
}

function setDeviceTime(deviceName, year, month, day, hour, minute, second) {
    findDevice(deviceName).setTime(year, month, day, hour || 0, minute || 0, second || 0);
    return true;
}
