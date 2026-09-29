function commandLog() {
    return ipc.commandLog();
}

function setCommandLogging(enabled) {
    commandLog().setEnabled(enabled !== false);
    return true;
}

function isCommandLogging() {
    return !!commandLog().isEnabled();
}

function getCommandLog(deviceName) {
    var log = commandLog();
    var entries = [];
    for (var i = 0; i < log.getEntryCount(); i++) {
        var entry = log.getEntryAt(i);
        var device = String(entry.getDeviceName());
        if (!deviceName || device === deviceName) {
            entries.push({
                time: String(entry.getTimeToString()),
                device: device,
                prompt: String(entry.getPrompt()),
                command: String(entry.getCommand()),
                resolved: String(callIfExists(entry, "getResolvedCommand", entry.getCommand()))
            });
        }
    }
    return entries;
}

function clearCommandLog() {
    commandLog().clear();
    return true;
}
