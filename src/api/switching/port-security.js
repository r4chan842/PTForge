function buildPortSecurity(interfaces, options) {
    var opts = options || {};
    var violation = opts.violation || "shutdown";
    if (["shutdown", "restrict", "protect"].indexOf(violation) === -1) {
        throw new Error("Invalid violation mode: " + violation);
    }

    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["switchport mode access", "switchport port-security"];
        body.push("switchport port-security maximum " + (opts.maximum || 1));
        body.push("switchport port-security violation " + violation);
        if (opts.sticky !== false) {
            body.push("switchport port-security mac-address sticky");
        }
        toList(opts.macs).forEach(function (mac) {
            body.push("switchport port-security mac-address " + mac);
        });
        if (opts.agingTime) {
            body.push("switchport port-security aging time " + opts.agingTime);
        }
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function configurePortSecurity(deviceName, interfaces, options) {
    return configureIosDevice(deviceName, buildPortSecurity(interfaces, options));
}

function recoverErrDisabled(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["shutdown", "no shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}
