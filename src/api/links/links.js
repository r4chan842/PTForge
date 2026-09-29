function resolveLinkType(linkType) {
    var key = isDefined(linkType) ? String(linkType).toLowerCase() : "auto";
    var type = allLinkTypes[key];
    if (type === undefined) {
        throw new Error("Unknown link type: " + linkType);
    }
    return type;
}

function addLink(device1Name, device1Port, device2Name, device2Port, linkType) {
    findDevice(device1Name);
    findDevice(device2Name);
    return logicalWorkspace().createLink(device1Name, device1Port, device2Name, device2Port, resolveLinkType(linkType)) === true;
}

function addLinks(list) {
    return list.map(function (entry) {
        return addLink(entry[0], entry[1], entry[2], entry[3], entry[4]);
    });
}

function deleteLink(deviceName, portName) {
    return logicalWorkspace().deleteLink(deviceName, portName) === true;
}

function autoConnect(device1Name, device2Name) {
    findDevice(device1Name);
    findDevice(device2Name);
    logicalWorkspace().autoConnectDevices(device1Name, device2Name);
    return true;
}

function linkTypeName(code) {
    for (var name in allLinkTypes) {
        if (allLinkTypes[name] === code && name.indexOf("ethernet-") !== 0) {
            return name;
        }
    }
    return String(code);
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
    var port = findDevice(deviceName).getPort(portName);
    return !!port && port.isPortUp() === true && port.isProtocolUp() === true;
}

