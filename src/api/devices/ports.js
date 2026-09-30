function describePort(port) {
    return {
        name: String(port.getName()),
        ip: String(callIfExists(port, "getIpAddress", "")),
        mask: String(callIfExists(port, "getSubnetMask", "")),
        mac: String(callIfExists(port, "getMacAddress", "")),
        up: callIfExists(port, "isPortUp", false) === true,
        protocolUp: callIfExists(port, "isProtocolUp", false) === true,
        connectedTo: String(callIfExists(port, "getRemotePortName", "")),
        description: String(callIfExists(port, "getDescription", "")),
        bandwidth: callIfExists(port, "getBandwidth", 0),
        fullDuplex: callIfExists(port, "isFullDuplex", false) === true,
        ipv6: String(callIfExists(port, "getUnicastIpv6Address", "")).replace(/^::$/, "")
    };
}

function portNeighbors(deviceName) {
    var map = {};
    try {
        getNeighbors(deviceName).forEach(function (n) {
            map[n.port] = n;
        });
    } catch (error) {
        return map;
    }
    return map;
}

function describePortOf(deviceName, port, neighbors) {
    var info = describePort(port);
    var near = (neighbors || portNeighbors(deviceName))[info.name];
    info.connectedDevice = near ? near.device : "";
    info.linkType = near ? near.type : "";
    return info;
}

function getPorts(deviceName) {
    var device = findDevice(deviceName);
    var ports = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        ports.push(String(device.getPortAt(i).getName()));
    }
    return ports;
}

function getPortInfo(deviceName, portName) {
    return describePortOf(deviceName, findPort(deviceName, portName));
}

function getFreePorts(deviceName, startsWith) {
    var device = findDevice(deviceName);
    var prefix = startsWith || "";
    var free = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        var port = device.getPortAt(i);
        var name = String(port.getName());
        var linked = callIfExists(port, "getLink", null);
        if (!linked && name.indexOf(prefix) === 0 && name.indexOf("Vlan") !== 0 && name.indexOf("Loopback") !== 0) {
            free.push(name);
        }
    }
    return free;
}

function setPortPower(deviceName, portName, on) {
    findPort(deviceName, portName).setPower(on !== false);
    return true;
}

function setPortDescription(deviceName, portName, text) {
    findPort(deviceName, portName).setDescription(String(text));
    return true;
}

function setPortSpeed(deviceName, portName, bandwidth, fullDuplex) {
    var port = findPort(deviceName, portName);
    if (bandwidth === "auto") {
        port.setBandwidthAutoNegotiate(true);
    } else if (isDefined(bandwidth)) {
        port.setBandwidthAutoNegotiate(false);
        port.setBandwidth(Number(bandwidth));
    }
    if (fullDuplex === "auto") {
        port.setDuplexAutoNegotiate(true);
    } else if (isDefined(fullDuplex)) {
        port.setDuplexAutoNegotiate(false);
        port.setFullDuplex(fullDuplex === true);
    }
    return true;
}

function setPortMac(deviceName, portName, mac) {
    findPort(deviceName, portName).setMacAddress(mac);
    return true;
}

function setPortClockRate(deviceName, portName, rate) {
    findPort(deviceName, portName).setClockRate(Number(rate));
    return true;
}
