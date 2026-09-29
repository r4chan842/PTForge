function fileManager() {
    var manager = ipc.systemFileManager();
    if (!manager) {
        throw new Error("File access is not available in this Packet Tracer version");
    }
    return manager;
}

function readTextFile(path) {
    if (!fileManager().fileExists(String(path))) {
        throw new Error("File not found: " + path);
    }
    return String(fileManager().getFileContents(String(path)));
}

function writeTextFile(path, text) {
    return fileManager().writePlainTextToFile(String(path), String(text)) !== false;
}

function fileExists(path) {
    return !!fileManager().fileExists(String(path));
}

function folderExists(path) {
    return !!fileManager().directoryExists(String(path));
}

function makeFolder(path) {
    return fileManager().makeDirectory(String(path)) !== false;
}

function deleteFile(path) {
    return fileManager().removeFile(String(path)) !== false;
}

function runScriptFile(path) {
    var code = readTextFile(path);
    return new Function(code)();
}

function exportTopology(path) {
    var data = {
        devices: getDevices().map(function (name) {
            var p = getDevicePosition(name);
            return { name: name, model: getDeviceModel(name), x: p.x, y: p.y };
        }),
        links: getLinks()
    };
    writeTextFile(path, JSON.stringify(data, null, 2));
    return data;
}

function exportConfigs(folder, deviceNames) {
    var names = deviceNames ? toList(deviceNames) : getDevices(["router", "switch", "multilayerswitch", "switch3650"]);
    if (!folderExists(folder)) {
        makeFolder(folder);
    }
    return names.map(function (name) {
        var path = folder + "/" + name + ".txt";
        writeTextFile(path, getRunningConfig(name));
        return path;
    });
}
