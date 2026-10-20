function statusCodeOf(value) {
    if (typeof value === "number") {
        return value;
    }
    var name = String(value === undefined || value === null ? "" : value).toLowerCase();
    if (isDefined(commandStatusCodes[name])) {
        return commandStatusCodes[name];
    }
    return -1;
}

function statusNameOf(code) {
    var name = commandStatusNames[code];
    return isDefined(name) ? name : String(code);
}

function statusHint(status) {
    var hint = commandStatusHints[String(status).toLowerCase()];
    return hint ? " (" + hint + ")" : "";
}

function failureText(deviceName, failures) {
    var lines = failures.map(function (item) {
        return "  " + item.command + " -> " + item.status + statusHint(item.status);
    });
    return deviceName + " rejected " + failures.length + (failures.length === 1 ? " command" : " commands") + ":\n" + lines.join("\n");
}

function normalizeCliMode(mode) {
    if (!isDefined(mode)) {
        return "";
    }
    var key = String(mode).toLowerCase().replace(/^\s+|\s+$/g, "");
    if (!Object.prototype.hasOwnProperty.call(cliModeAliases, key)) {
        throw new Error("Invalid CLI mode: " + mode + ". Valid modes are " + joinNames(["user", "enable", "global"]) + " or an empty string to stay in the current mode");
    }
    return cliModeAliases[key];
}
