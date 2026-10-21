function parseCommandResult(result) {
    if (Array.isArray(result)) {
        return { status: statusNameOf(statusCodeOf(result[0])), output: String(isDefined(result[1]) ? result[1] : "") };
    }
    if (result && isDefined(result.first)) {
        return { status: statusNameOf(statusCodeOf(result.first)), output: String(isDefined(result.second) ? result.second : "") };
    }
    if (result && isDefined(result.status)) {
        return { status: String(result.status), output: String(isDefined(result.output) ? result.output : "") };
    }
    if (typeof result === "number") {
        return { status: statusNameOf(result), output: "" };
    }
    return { status: "ok", output: isDefined(result) ? String(result) : "" };
}

function iosDevice(deviceName) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand !== "function") {
        throw new Error(deviceName + " is a " + String(device.getModel()) + " and has no Cisco IOS command line");
    }
    prepareIosDevice(device, String(deviceName));
    assertIosUsable(device, String(deviceName));
    return device;
}

function sendLine(device, line, mode, failures) {
    var result = parseCommandResult(device.enterCommand(line, mode));
    if (result.status !== "ok") {
        failures.push({ command: line, status: result.status, output: result.output });
    }
    return result;
}

function configureIosDevice(deviceName, commands, save) {
    var device = iosDevice(deviceName);
    var failures = [];

    device.enterCommand("!", "global");
    toLines(commands).forEach(function (line) {
        var command = oneLine(line);
        if (!command || command === "!") {
            return;
        }
        sendLine(device, command, "", failures);
    });
    device.enterCommand("end", "");

    if (save !== false) {
        sendLine(device, "write memory", "enable", failures);
    }
    return failures;
}

function applyConfig(deviceName, commands, save) {
    var failures = configureIosDevice(deviceName, commands, save);
    if (failures.length) {
        throw new Error(failureText(deviceName, failures));
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

var execCommandWords = "show ping traceroute tracert telnet ssh dir more copy write clock clear reload debug undebug help logout disable enable configure test send disconnect resume suspend verify license who where".split(" ");

var configSubModeWords = "interface router line vlan ip dhcp pool class-map policy-map crypto track route-map key access-list aaa username hostname banner".split(" ");

function firstCommandWord(command) {
    return (String(command).split(/\s+/)[0] || "").toLowerCase();
}

function isExecCommand(command) {
    var word = firstCommandWord(command);
    if (execCommandWords.indexOf(word) === -1) {
        return false;
    }
    if (word === "ip" || word === "no") {
        return false;
    }
    return true;
}

function isConfigSubMode(mode) {
    var value = String(mode || "").toLowerCase();
    return value !== "" && value !== "user" && value !== "enable" && value !== "global" && value !== "config";
}

function autoCliMode(device, command) {
    var mode = cliModeOf(device);
    if (isConfigSubMode(mode)) {
        if (/^(exit|end|do)\b/i.test(String(command))) {
            return "";
        }
        return isExecCommand(command) ? "enable" : "";
    }
    return isExecCommand(command) ? "enable" : "global";
}

function resolveRunMode(device, command, mode) {
    if (!isDefined(mode) || String(mode).toLowerCase() === "auto") {
        return autoCliMode(device, command);
    }
    return normalizeCliMode(mode);
}

function runCommand(deviceName, command, mode) {
    var device = iosDevice(deviceName);
    var line = oneLine(command);
    return parseCommandResult(device.enterCommand(line, resolveRunMode(device, line, isDefined(mode) ? mode : "auto")));
}

function runCommands(deviceName, commands, mode) {
    var device = iosDevice(deviceName);
    var automatic = !isDefined(mode) || String(mode).toLowerCase() === "auto";
    var fixed = automatic ? "" : normalizeCliMode(mode);
    var failures = [];
    var results = toLines(commands).map(function (line) {
        var command = oneLine(line);
        if (!command) {
            return null;
        }
        var result = sendLine(device, command, automatic ? autoCliMode(device, command) : fixed, failures);
        return { command: command, status: result.status, output: result.output };
    }).filter(function (item) {
        return item !== null;
    });
    return { device: String(device.getName()), ok: failures.length === 0, commands: results, failed: failures };
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
