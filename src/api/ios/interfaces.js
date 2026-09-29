function buildInterfaceIp(interfaceName, address, mask, description) {
    var parsed = ipAndMask(address, mask);
    var body = [];
    if (description) {
        body.push("description " + description);
    }
    body.push("ip address " + parsed.ip + " " + parsed.mask);
    body.push("no shutdown");
    return interfaceBlock(interfaceName, body);
}

function setInterfaceIp(deviceName, interfaceName, address, mask, description) {
    return configureIosDevice(deviceName, buildInterfaceIp(interfaceName, address, mask, description));
}

function setInterfaceDhcp(deviceName, interfaceName) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip address dhcp", "no shutdown"]));
}

function setInterfaceIpv6(deviceName, interfaceName, address, options) {
    var opts = options || {};
    var body = [];
    if (address) {
        body.push("ipv6 address " + address + (opts.eui64 ? " eui-64" : ""));
    }
    if (opts.linkLocal) {
        body.push("ipv6 address " + opts.linkLocal + " link-local");
    }
    if (opts.enable !== false) {
        body.push("ipv6 enable");
    }
    body.push("no shutdown");
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, body));
}

function shutdownInterface(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}

function enableInterface(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["no shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}

function setInterfaceDescription(deviceName, interfaceName, text) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["description " + text]));
}

function setClockRate(deviceName, interfaceName, rate) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["clock rate " + (rate || 64000)]));
}

function setBandwidth(deviceName, interfaceName, kbps) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["bandwidth " + kbps]));
}

function setSpeedDuplex(deviceName, interfaceName, speed, duplex) {
    var body = [];
    if (speed) {
        body.push("speed " + speed);
    }
    if (duplex) {
        body.push("duplex " + duplex);
    }
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, body));
}

function addLoopback(deviceName, number, address, mask) {
    return configureIosDevice(deviceName, buildInterfaceIp("Loopback" + number, address, isDefined(mask) ? mask : (String(address).indexOf("/") === -1 ? 32 : undefined)));
}

function buildSubinterface(parent, vlanId, address, mask, native) {
    var parsed = ipAndMask(address, mask);
    return interfaceBlock(parent, ["no shutdown"]).concat(interfaceBlock(parent + "." + vlanId, [
        "encapsulation dot1Q " + vlanId + (native ? " native" : ""),
        "ip address " + parsed.ip + " " + parsed.mask
    ]));
}

function addSubinterface(deviceName, parent, vlanId, address, mask, native) {
    return configureIosDevice(deviceName, buildSubinterface(parent, vlanId, address, mask, native));
}

function routerOnAStick(deviceName, parent, vlans) {
    var commands = [];
    Object.keys(vlans).forEach(function (vlanId) {
        commands = commands.concat(buildSubinterface(parent, vlanId, vlans[vlanId]));
    });
    return configureIosDevice(deviceName, commands);
}

