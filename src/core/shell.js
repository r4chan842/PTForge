var shellSessionId = "";
var shellInspectDepth = 2;
var shellMaxItems = 100;

function shellQuote(text) {
    var body = String(text).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    return "'" + body.replace(/'/g, "\\'") + "'";
}

function shellKey(key) {
    return /^[A-Za-z_$][\w$]*$/.test(key) ? key : shellQuote(key);
}

function shellFunctionLabel(value) {
    var name = "";
    try {
        name = value.name || "";
    } catch (error) {
        name = "";
    }
    return name ? "[Function: " + name + "]" : "[Function (anonymous)]";
}

function readProperty(target, key) {
    var descriptor = null;
    try {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    } catch (error) {
        descriptor = null;
    }
    if (descriptor && typeof descriptor.get === "function") {
        return { getter: true };
    }
    return { value: descriptor ? descriptor.value : target[key] };
}

function shellObjectKeys(value) {
    try {
        return Object.keys(value);
    } catch (error) {
        return [];
    }
}

function shellJoin(open, parts, close, indent) {
    if (!parts.length) {
        return open + close;
    }
    var single = open + " " + parts.join(", ") + " " + close;
    if (single.length <= 76 && single.indexOf("\n") === -1) {
        return single;
    }
    var pad = new Array(indent + 2).join("  ");
    var end = new Array(indent + 1).join("  ");
    return open + "\n" + pad + parts.join(",\n" + pad) + "\n" + end + close;
}

function inspectValue(value, depth, seen, indent) {
    var level = isDefined(depth) ? depth : 0;
    var stack = seen || [];
    var pad = indent || 0;
    if (value === null) {
        return "null";
    }
    if (value === undefined) {
        return "undefined";
    }
    var kind = typeof value;
    if (kind === "string") {
        return shellQuote(value);
    }
    if (kind === "number" || kind === "boolean") {
        return value === 0 && 1 / value < 0 ? "-0" : String(value);
    }
    if (kind === "function") {
        return shellFunctionLabel(value);
    }
    if (kind !== "object") {
        return String(value);
    }
    if (stack.indexOf(value) !== -1) {
        return "[Circular]";
    }
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
    }
    if (value instanceof RegExp) {
        return String(value);
    }
    if (value instanceof Error) {
        return (value.name || "Error") + ": " + value.message;
    }
    var isArray = Array.isArray(value);
    if (level > shellInspectDepth) {
        return isArray ? "[Array]" : "[Object]";
    }
    var inner = stack.concat([value]);
    var parts = [];
    if (isArray) {
        var shown = Math.min(value.length, shellMaxItems);
        for (var i = 0; i < shown; i++) {
            parts.push(inspectValue(value[i], level + 1, inner, pad + 1));
        }
        if (value.length > shown) {
            parts.push("... " + (value.length - shown) + " more items");
        }
        return shellJoin("[", parts, "]", pad);
    }
    var keys = shellObjectKeys(value);
    keys.slice(0, shellMaxItems).forEach(function (key) {
        var item;
        try {
            var read = readProperty(value, key);
            item = read.getter ? "[Getter]" : inspectValue(read.value, level + 1, inner, pad + 1);
        } catch (error) {
            item = "[Unreadable]";
        }
        parts.push(shellKey(key) + ": " + item);
    });
    if (keys.length > shellMaxItems) {
        parts.push("... " + (keys.length - shellMaxItems) + " more properties");
    }
    if (!keys.length && typeof value.getClassName === "function") {
        try {
            return "[" + value.getClassName() + "]";
        } catch (error) {
            return "[Object]";
        }
    }
    return shellJoin("{", parts, "}", pad);
}

function shellErrorText(error) {
    if (error && error.message) {
        var line = error.lineNumber ? " (line " + error.lineNumber + ")" : "";
        return (error.name || "Error") + ": " + error.message + line;
    }
    return "Uncaught " + inspectValue(error);
}

function shellGlobalEval(code) {
    var indirect = eval;
    return indirect(code);
}

function shellEval(encodedId, encodedCode) {
    var id = decodeArgument(encodedId);
    var code = decodeArgument(encodedCode);
    var started = new Date().getTime();
    shellSessionId = id;
    try {
        var value = shellGlobalEval(code);
        var raw = typeof value === "string" && value.indexOf("\n") !== -1;
        editorSend("shell-result", { id: id, ok: true, type: raw ? "text" : value === null ? "null" : typeof value, text: raw ? value : inspectValue(value), ms: new Date().getTime() - started });
        return true;
    } catch (error) {
        editorSend("shell-result", { id: id, ok: false, text: shellErrorText(error), ms: new Date().getTime() - started });
        return false;
    } finally {
        shellSessionId = "";
    }
}

function shellOutput(kind, text) {
    if (!shellSessionId) {
        return false;
    }
    return editorSend("shell-log", { id: shellSessionId, kind: kind, text: String(text) });
}

function shellDeviceKind(device) {
    if (typeof device.enterCommand === "function") {
        return "ios";
    }
    if (typeof device.getCommandPrompt === "function") {
        return "host";
    }
    return "";
}

function shellAttach(encodedId, encodedDevice) {
    var id = decodeArgument(encodedId);
    var name = decodeArgument(encodedDevice);
    try {
        var device = findDevice(name);
        var kind = shellDeviceKind(device);
        if (!kind) {
            throw new Error(name + " has no command line");
        }
        if (kind === "ios") {
            skipBootIfIos(device);
        }
        editorSend("shell-cli", { id: id, device: String(device.getName()), kind: kind, attached: true, output: "", status: "ok", prompt: kind === "ios" ? getPrompt(name) : "C:\\>" });
        return true;
    } catch (error) {
        editorSend("shell-cli", { id: id, device: name, attached: false, output: "", status: "error", error: shellErrorText(error) });
        return false;
    }
}

function shellCli(encodedId, encodedDevice, encodedCommand) {
    var id = decodeArgument(encodedId);
    var name = decodeArgument(encodedDevice);
    var command = decodeArgument(encodedCommand);
    try {
        var device = findDevice(name);
        if (shellDeviceKind(device) === "host") {
            runHostCommand(name, command);
            editorSend("shell-cli", { id: id, device: name, kind: "host", output: "", status: "sent", prompt: "C:\\>" });
            return true;
        }
        var result = runCommand(name, command, "");
        editorSend("shell-cli", { id: id, device: name, kind: "ios", output: result.output, status: result.status, prompt: getPrompt(name) });
        return true;
    } catch (error) {
        editorSend("shell-cli", { id: id, device: name, output: "", status: "error", error: shellErrorText(error) });
        return false;
    }
}
