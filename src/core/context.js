function appWindow() {
    return ipc.appWindow();
}

function activeWorkspace() {
    return ipc.appWindow().getActiveWorkspace();
}

function logicalWorkspace() {
    return activeWorkspace().getLogicalWorkspace();
}

function network() {
    return ipc.network();
}

function findDevice(name) {
    var device = network().getDevice(String(name));
    if (!device) {
        throw new Error("Device not found: " + name);
    }
    return device;
}

function deviceExists(name) {
    return !!network().getDevice(String(name));
}

function findPort(deviceName, portName) {
    var port = findDevice(deviceName).getPort(String(portName));
    if (!port) {
        throw new Error("Port not found: " + deviceName + " " + portName);
    }
    return port;
}

function isIosDevice(device) {
    return iosDeviceTypes.indexOf(device.getType()) !== -1;
}

function skipBootIfIos(device) {
    if (isIosDevice(device) && typeof device.skipBoot === "function") {
        device.skipBoot();
    }
}

function resolveDeviceType(value) {
    if (typeof value === "number") {
        return value;
    }
    var type = deviceTypes[String(value).toLowerCase()];
    if (type === undefined) {
        throw new Error("Unknown device type filter: " + value);
    }
    return type;
}

function callIfExists(target, method, fallback) {
    if (target && typeof target[method] === "function") {
        try {
            return target[method]();
        } catch (error) {
            return fallback;
        }
    }
    return fallback;
}

function getProcessOf(deviceName, processName) {
    var process = findDevice(deviceName).getProcess(processName);
    if (!process) {
        throw new Error(processName + " is not available on " + deviceName);
    }
    return process;
}
