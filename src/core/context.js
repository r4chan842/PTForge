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

var setupPromptAnswers = [
    { pattern: /initial configuration dialog/i, answer: "no" },
    { pattern: /terminate autoinstall/i, answer: "yes" },
    { pattern: /press return to get started/i, answer: "" }
];

function cliLineOf(device) {
    if (!device) {
        return null;
    }
    if (typeof device.getCommandLine === "function") {
        return device.getCommandLine();
    }
    return null;
}

function cliPromptOf(device) {
    var line = cliLineOf(device);
    var prompt = line ? callIfExists(line, "getPrompt", "") : "";
    return String(prompt === null || prompt === undefined ? "" : prompt);
}

function cliModeOf(device) {
    var line = cliLineOf(device);
    var mode = line ? callIfExists(line, "getMode", "") : "";
    return String(mode === null || mode === undefined ? "" : mode);
}

function isSetupPrompt(text) {
    var value = String(text || "");
    for (var i = 0; i < setupPromptAnswers.length; i++) {
        if (setupPromptAnswers[i].pattern.test(value)) {
            return true;
        }
    }
    return false;
}

function answerSetupPrompt(device) {
    if (typeof device.enterCommand !== "function") {
        return false;
    }
    var answered = false;
    for (var round = 0; round < 4; round++) {
        var prompt = cliPromptOf(device);
        var hit = null;
        for (var i = 0; i < setupPromptAnswers.length; i++) {
            if (setupPromptAnswers[i].pattern.test(prompt)) {
                hit = setupPromptAnswers[i];
                break;
            }
        }
        if (!hit) {
            break;
        }
        device.enterCommand(hit.answer, "");
        answered = true;
    }
    return answered;
}

function finishBoot(device) {
    var attempts = 0;
    while (attempts < 4) {
        var booting = false;
        try {
            booting = typeof device.isBooting === "function" && device.isBooting() === true;
        } catch (error) {
            booting = false;
        }
        if (!booting) {
            break;
        }
        device.skipBoot();
        attempts++;
    }
    return attempts;
}

function prepareIosDevice(device, label) {
    var name = label || String(callIfExists(device, "getName", "device"));
    if (isIosDevice(device)) {
        finishBoot(device);
    }
    answerSetupPrompt(device);
    return device;
}

function assertIosUsable(device, name) {
    var prompt = cliPromptOf(device);
    if (isSetupPrompt(prompt)) {
        throw new Error(name + " is still at its first boot dialog (" + prompt.replace(/\s+$/, "") + "). The device did not reach the command line, so nothing was sent. Answer it with enterCommand(\"" + name + "\", \"no\") or call ensureIosReady(\"" + name + "\") and run the script again");
    }
    return true;
}

function ensureIosReady(deviceName) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand !== "function") {
        throw new Error(deviceName + " is a " + String(device.getModel()) + " and has no Cisco IOS command line");
    }
    prepareIosDevice(device, String(deviceName));
    return {
        device: String(device.getName()),
        prompt: cliPromptOf(device),
        mode: cliModeOf(device),
        booting: typeof device.isBooting === "function" ? device.isBooting() === true : false
    };
}

function skipBootIfIos(device) {
    if (isIosDevice(device)) {
        prepareIosDevice(device, String(callIfExists(device, "getName", "")));
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
