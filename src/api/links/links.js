function resolveLinkType(linkType) {
    var key = isDefined(linkType) && linkType !== "" ? String(linkType).toLowerCase().replace(/^\s+|\s+$/g, "") : "auto";
    if (!Object.prototype.hasOwnProperty.call(allLinkTypes, key)) {
        throw new Error("Unknown link type: " + linkType + ". Valid types are " + joinNames(linkTypeAliases));
    }
    return allLinkTypes[key];
}

function portForLink(deviceName, portName) {
    var device = findDevice(deviceName);
    var port = device.getPort(String(portName));
    if (!port) {
        var free = getFreePorts(deviceName);
        throw new Error(deviceName + " has no port named " + portName + (free.length ? ". Free ports: " + joinNames(free.slice(0, 10)) : ""));
    }
    return port;
}

function describeLinkEnd(deviceName, portName) {
    return deviceName + " " + portName;
}

function addLink(device1Name, device1Port, device2Name, device2Port, linkType) {
    var portA = portForLink(device1Name, device1Port);
    var portB = portForLink(device2Name, device2Port);
    if (String(device1Name) === String(device2Name) && String(device1Port) === String(device2Port)) {
        throw new Error("A port cannot be cabled to itself: " + describeLinkEnd(device1Name, device1Port));
    }

    var type = resolveLinkType(linkType);
    [[portA, device1Name, device1Port], [portB, device2Name, device2Port]].forEach(function (end) {
        var existing = callIfExists(end[0], "getLink", null);
        if (existing) {
            throw new Error(describeLinkEnd(end[1], end[2]) + " is already cabled. Call deleteLink first");
        }
    });

    var created = logicalWorkspace().createLink(String(device1Name), String(device1Port), String(device2Name), String(device2Port), type) === true;
    if (!created) {
        throw new Error("Packet Tracer refused the link " + describeLinkEnd(device1Name, device1Port) + " to " + describeLinkEnd(device2Name, device2Port) + " as " + linkType + " (" + connectTypeNames[type] + "). Check that both ports are of a matching kind and that the device is powered");
    }
    return true;
}

function addLinks(list) {
    toList(list).forEach(function (entry) {
        addLink(entry[0], entry[1], entry[2], entry[3], entry[4]);
    });
    return true;
}

function deleteLink(deviceName, portName) {
    var port = portForLink(deviceName, portName);
    if (!callIfExists(port, "getLink", null)) {
        throw new Error(describeLinkEnd(deviceName, portName) + " has no cable");
    }
    return logicalWorkspace().deleteLink(String(deviceName), String(portName)) === true;
}

function autoConnect(device1Name, device2Name) {
    findDevice(device1Name);
    findDevice(device2Name);
    if (String(device1Name) === String(device2Name)) {
        throw new Error("autoConnect needs two different devices");
    }
    logicalWorkspace().autoConnectDevices(String(device1Name), String(device2Name));
    return true;
}

function linkTypeName(code) {
    if (isDefined(connectTypeNames[code])) {
        var name = null;
        Object.keys(allLinkTypes).forEach(function (key) {
            if (!name && allLinkTypes[key] === code && key.indexOf("ethernet-") !== 0) {
                name = key;
            }
        });
        return name || connectTypeNames[code];
    }
    throw new Error("Unknown link type code: " + code + ". Valid codes are " + Object.keys(connectTypeNames).join(", ") + " (ETHERNET_STRAIGHT is 8100, ETHERNET_CROSS is 8101 and so on)");
}

function portOwnerName(port) {
    var owner = callIfExists(port, "getOwnerDevice", null);
    return owner ? String(owner.getName()) : "";
}

function getLinks() {
    var links = [];
    for (var i = 0; i < network().getLinkCount(); i++) {
        var link = network().getLinkAt(i);
        var entry = { type: linkTypeName(link.getConnectionType()) };
        if (typeof link.getPort1 === "function") {
            var a = link.getPort1();
            var b = link.getPort2();
            entry.from = { device: portOwnerName(a), port: String(a.getName()) };
            entry.to = { device: portOwnerName(b), port: String(b.getName()) };
        }
        links.push(entry);
    }
    return links;
}

function getLinkCount() {
    return network().getLinkCount();
}

function getNeighbors(deviceName) {
    return getLinks().filter(function (link) {
        return link.from && (link.from.device === deviceName || link.to.device === deviceName);
    }).map(function (link) {
        var local = link.from.device === deviceName ? link.from : link.to;
        var remote = link.from.device === deviceName ? link.to : link.from;
        return { port: local.port, device: remote.device, remotePort: remote.port, type: link.type };
    });
}

function isLinkUp(deviceName, portName) {
    var port = findDevice(deviceName).getPort(String(portName));
    return !!port && port.isPortUp() === true && port.isProtocolUp() === true;
}
