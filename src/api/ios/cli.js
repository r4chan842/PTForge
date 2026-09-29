function parseCommandResult(result) {
    if (Array.isArray(result)) {
        return { status: commandStatusNames[result[0]] || String(result[0]), output: String(isDefined(result[1]) ? result[1] : "") };
    }
    if (result && isDefined(result.first)) {
        return { status: commandStatusNames[result.first] || String(result.first), output: String(isDefined(result.second) ? result.second : "") };
    }
    return { status: "ok", output: isDefined(result) ? String(result) : "" };
}

function iosDevice(deviceName) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand !== "function") {
        throw new Error("Not a Cisco IOS device: " + deviceName);
    }
    skipBootIfIos(device);
    return device;
}

function configureIosDevice(deviceName, commands, save) {
    var device = iosDevice(deviceName);
    var failed = [];

    device.enterCommand("!", "global");
    toLines(commands).forEach(function (line) {
        var command = line.replace(/\s+$/, "");
        if (!command.trim() || command.trim() === "!") {
            return;
        }
        var result = parseCommandResult(device.enterCommand(command, ""));
        if (result.status !== "ok") {
            failed.push({ command: command.trim(), status: result.status });
        }
    });
    device.enterCommand("end", "");

    if (save !== false) {
        device.enterCommand("write memory", "enable");
    }
    return failed;
}

function applyConfig(deviceName, commands, save) {
    var failed = configureIosDevice(deviceName, commands, save);
    if (failed.length) {
        throw new Error(deviceName + " rejected: " + failed.map(function (item) {
            return item.command + " (" + item.status + ")";
        }).join(", "));
    }
    return true;
}

function applyToDevices(deviceNames, commands, save) {
    var report = {};
    toList(deviceNames).forEach(function (name) {
        report[name] = configureIosDevice(name, commands, save);
    });
    return report;
}

function runCommand(deviceName, command, mode) {
    var device = iosDevice(deviceName);
    return parseCommandResult(device.enterCommand(String(command), isDefined(mode) ? mode : "enable"));
}

function saveConfig(deviceName) {
    iosDevice(deviceName).enterCommand("write memory", "enable");
    return true;
}

function saveAllConfigs() {
    var saved = [];
    getDevices(iosDeviceTypes).forEach(function (name) {
        saveConfig(name);
        saved.push(name);
    });
    return saved;
}

function getPrompt(deviceName) {
    var line = callIfExists(iosDevice(deviceName), "getCommandLine", null);
    return line ? String(line.getPrompt()) : "";
}

function getCliMode(deviceName) {
    var line = callIfExists(iosDevice(deviceName), "getCommandLine", null);
    return line ? String(line.getMode()) : "";
}
