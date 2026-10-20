function recoverErrDisabled(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["shutdown", "no shutdown"]));
    });
    if (!commands.length) {
        throw new Error("recoverErrDisabled needs at least one interface");
    }
    return configureIosDevice(deviceName, commands);
}
