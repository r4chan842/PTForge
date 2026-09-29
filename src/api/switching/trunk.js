function buildTrunkPorts(interfaces, allowedVlans, nativeVlan, options) {
    var opts = options || {};
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = [];
        if (opts.encapsulation) {
            body.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        body.push("switchport mode trunk");
        if (isDefined(allowedVlans) && allowedVlans !== "") {
            body.push("switchport trunk allowed vlan " + joinVlans(allowedVlans));
        }
        if (nativeVlan) {
            body.push("switchport trunk native vlan " + nativeVlan);
        }
        if (opts.nonegotiate) {
            body.push("switchport nonegotiate");
        }
        body.push("no shutdown");
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function setTrunkPort(deviceName, interfaces, allowedVlans, nativeVlan, options) {
    var opts = Object.assign({}, options || {});
    if (!opts.encapsulation && findDevice(deviceName).getType() === deviceTypes.multilayerswitch) {
        opts.encapsulation = "dot1q";
    }
    return configureIosDevice(deviceName, buildTrunkPorts(interfaces, allowedVlans, nativeVlan, opts));
}

function setDtpMode(deviceName, interfaces, mode) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["switchport mode " + mode]));
    });
    return configureIosDevice(deviceName, commands);
}
