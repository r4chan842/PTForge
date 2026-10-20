var editorScriptFilter = "Scripts (*.js *.txt);;All files (*)";
var editorLastFolder = "";

function decodeArgument(value) {
    try {
        return decodeURIComponent(String(value));
    } catch (error) {
        return String(value);
    }
}

function editorSend(kind, data) {
    return notifyEditor(kind, JSON.stringify(data));
}

function baseName(path) {
    return String(path).split(/[\\/]/).pop();
}

function folderOf(path) {
    var text = String(path);
    var cut = Math.max(text.lastIndexOf("/"), text.lastIndexOf("\\"));
    return cut > 0 ? text.substring(0, cut) : text;
}

function startFolder() {
    if (editorLastFolder) {
        return editorLastFolder;
    }
    return String(callIfExists(appWindow(), "getDefaultFileSaveLocation", ""));
}

function guardBridge(action, work) {
    try {
        return work();
    } catch (error) {
        editorSend("bridge-error", { action: action, message: error && error.message ? error.message : String(error) });
        return false;
    }
}

function sendFile(path) {
    if (!fileManager().fileExists(path)) {
        throw new Error("File not found: " + path);
    }
    editorLastFolder = folderOf(path);
    editorSend("file-opened", { path: path, name: baseName(path), text: String(fileManager().getFileContents(path)) });
    return true;
}

function editorOpenFile() {
    return guardBridge("open", function () {
        var path = String(fileManager().getOpenFileName("Open script", startFolder(), editorScriptFilter) || "");
        return path ? sendFile(path) : false;
    });
}

function editorReadFile(encodedPath) {
    return guardBridge("open", function () {
        return sendFile(decodeArgument(encodedPath));
    });
}

function editorOpenFolder() {
    return guardBridge("folder", function () {
        var folder = String(fileManager().getSelectedDirectory("Open folder", startFolder()) || "");
        return folder ? editorListFolder(encodeURIComponent(folder)) : false;
    });
}

function editorListFolder(encodedFolder) {
    return guardBridge("folder", function () {
        var folder = decodeArgument(encodedFolder).replace(/[\\/]+$/, "");
        var names = toArray(fileManager().getFilesInDirectory(folder)).map(String).filter(function (name) {
            return /\.(js|txt|json|md|cfg)$/i.test(name);
        }).sort();
        editorLastFolder = folder;
        editorSend("folder-opened", {
            path: folder,
            name: baseName(folder),
            files: names.map(function (name) {
                return { name: name, path: folder + "/" + name };
            })
        });
        return true;
    });
}

function writeEditorFile(id, path, text) {
    if (fileManager().writePlainTextToFile(path, text) === false) {
        throw new Error("Could not write " + path);
    }
    editorLastFolder = folderOf(path);
    editorSend("file-saved", { id: id, path: path, name: baseName(path) });
    return true;
}

function editorSaveFile(encodedId, encodedPath, encodedText) {
    var path = decodeArgument(encodedPath);
    if (!path) {
        return editorSaveFileAs(encodedId, encodeURIComponent("script.js"), encodedText);
    }
    return guardBridge("save", function () {
        return writeEditorFile(decodeArgument(encodedId), path, decodeArgument(encodedText));
    });
}

function editorSaveFileAs(encodedId, encodedName, encodedText) {
    return guardBridge("save", function () {
        var suggested = startFolder() + "/" + decodeArgument(encodedName);
        var path = String(fileManager().getSaveFileName("Save script", suggested, editorScriptFilter) || "");
        return path ? writeEditorFile(decodeArgument(encodedId), path, decodeArgument(encodedText)) : false;
    });
}

function editorCopy(encodedText) {
    return guardBridge("clipboard", function () {
        appWindow().setClipboardText(decodeArgument(encodedText));
        return true;
    });
}

function editorDevices() {
    return guardBridge("devices", function () {
        var list = [];
        for (var i = 0; i < network().getDeviceCount(); i++) {
            var device = network().getDeviceAt(i);
            var ports = [];
            for (var j = 0; j < device.getPortCount(); j++) {
                var port = device.getPortAt(j);
                var info = describePort(port);
                if (info.connectedTo || isAssigned(info.ip)) {
                    ports.push({ name: info.name, ip: isAssigned(info.ip) ? info.ip + "/" + maskToCidr(info.mask) : "", up: info.up, peer: info.connectedTo });
                }
            }
            list.push({
                name: String(device.getName()),
                type: deviceTypeName(device.getType()),
                model: String(callIfExists(device, "getModel", "")),
                power: callIfExists(device, "getPower", true) !== false,
                ports: ports
            });
        }
        editorSend("devices", { devices: list, links: network().getLinkCount() });
        return true;
    });
}

function editorSnapshot(encodedAction, encodedFirst, encodedSecond) {
    var action = decodeArgument(encodedAction);
    var first = decodeArgument(encodedFirst || "");
    var second = decodeArgument(encodedSecond || "");
    return guardBridge("snapshot", function () {
        if (action === "take") {
            return takeSnapshot(first || undefined);
        }
        if (action === "delete") {
            return deleteSnapshot(first);
        }
        if (action === "diff") {
            showSnapshotDiff(first, second || undefined);
            return true;
        }
        editorSend("snapshots", getSnapshots());
        return true;
    });
}

function editorReachability() {
    return guardBridge("reachability", function () {
        reachability();
        return true;
    });
}

function sendPlugins(message) {
    editorSend("plugins", { folder: getPluginFolder(), plugins: listPlugins(), commands: getPluginCommands(), message: message || "" });
    return true;
}

function editorPlugins(encodedAction, encodedId, encodedExtra) {
    var action = decodeArgument(encodedAction);
    var id = decodeArgument(encodedId || "");
    var extra = decodeArgument(encodedExtra || "");
    return guardBridge("plugins", function () {
        if (action === "enable") {
            enablePlugin(id, extra === "grant");
            return sendPlugins("Enabled " + id);
        }
        if (action === "disable") {
            disablePlugin(id);
            return sendPlugins("Disabled " + id);
        }
        if (action === "reload") {
            return sendPlugins("Reloaded " + reloadPlugins().length + " plugins");
        }
        if (action === "create") {
            var path = createPlugin(id, extra);
            sendFile(path);
            return sendPlugins("Created " + baseName(path));
        }
        if (action === "open") {
            return sendFile(findPluginRecord(id).file);
        }
        if (action === "folder") {
            var chosen = String(fileManager().getSelectedDirectory("Plugin folder", getPluginFolder()) || "");
            if (chosen) {
                setPluginFolder(chosen);
                reloadPlugins();
            }
            return sendPlugins();
        }
        return sendPlugins();
    });
}
