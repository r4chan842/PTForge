var skippedLogCommands = /^(show|sh|ping|traceroute|tracert|enable|en|disable|exit|end|copy|write|wr|do|reload|debug|undebug|clear|conf|configure)\b/i;

function runOnDevices(deviceNames, command, mode) {
    return toList(deviceNames).map(function (name) {
        try {
            var result = runCommand(name, command, mode);
            return { device: name, status: result.status, output: result.output };
        } catch (error) {
            return { device: name, status: "error", output: error.message };
        }
    });
}

function runOnAll(command, mode) {
    return runOnDevices(getDevices(iosDeviceTypes), command, mode);
}

function logCommandsByDevice(deviceName) {
    var grouped = {};
    var order = [];
    getCommandLog(deviceName).forEach(function (entry) {
        var command = entry.resolved.replace(/^\s+|\s+$/g, "");
        if (!command || skippedLogCommands.test(command)) {
            return;
        }
        if (!grouped[entry.device]) {
            grouped[entry.device] = [];
            order.push(entry.device);
        }
        grouped[entry.device].push(command);
    });
    return { grouped: grouped, order: order };
}

function commandsToScript(deviceName) {
    var data = logCommandsByDevice(deviceName);
    var text = data.order.map(function (name) {
        var body = data.grouped[name].map(function (cmd) {
            return "    " + JSON.stringify(cmd);
        }).join(",\n");
        return "configureIosDevice(" + JSON.stringify(name) + ", [\n" + body + "\n]);";
    }).join("\n\n");
    if (text) {
        notifyEditor("script", text + "\n");
    }
    return text;
}
