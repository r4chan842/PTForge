function deviceTypeName(code) {
    for (var key in deviceTypes) {
        if (deviceTypes[key] === code) {
            return key;
        }
    }
    return String(code);
}

function eachDevicePort(visit) {
    for (var i = 0; i < network().getDeviceCount(); i++) {
        var device = network().getDeviceAt(i);
        for (var j = 0; j < device.getPortCount(); j++) {
            visit(device, device.getPortAt(j));
        }
    }
}

function isAssigned(ip) {
    return ip !== "" && ip !== "0.0.0.0" && isValidIp(ip);
}

function getIpInventory() {
    var rows = [];
    eachDevicePort(function (device, port) {
        var ip = String(callIfExists(port, "getIpAddress", ""));
        if (isAssigned(ip)) {
            rows.push({
                device: String(device.getName()),
                port: String(port.getName()),
                ip: ip,
                mask: String(callIfExists(port, "getSubnetMask", "")),
                up: callIfExists(port, "isPortUp", false) === true
            });
        }
    });
    return rows;
}

function getSubnets() {
    var seen = {};
    getIpInventory().forEach(function (row) {
        var key = networkAddress(row.ip, row.mask) + "/" + maskToCidr(row.mask);
        seen[key] = seen[key] || [];
        seen[key].push(row.device + " " + row.port);
    });
    return Object.keys(seen).sort(function (a, b) {
        return ipToInt(a.split("/")[0]) - ipToInt(b.split("/")[0]);
    }).map(function (key) {
        return { network: key, members: seen[key] };
    });
}

function findDuplicateIps() {
    var owners = {};
    getIpInventory().forEach(function (row) {
        owners[row.ip] = owners[row.ip] || [];
        owners[row.ip].push(row.device + " " + row.port);
    });
    return Object.keys(owners).filter(function (ip) {
        return owners[ip].length > 1;
    }).map(function (ip) {
        return { ip: ip, owners: owners[ip] };
    });
}

function findDownLinks() {
    var down = [];
    for (var i = 0; i < network().getLinkCount(); i++) {
        var link = network().getLinkAt(i);
        if (typeof link.getPort1 !== "function") {
            continue;
        }
        var a = link.getPort1();
        var b = link.getPort2();
        var aUp = callIfExists(a, "isPortUp", false) === true;
        var bUp = callIfExists(b, "isPortUp", false) === true;
        if (!aUp || !bUp) {
            down.push({
                from: { device: portOwnerName(a), port: String(a.getName()), up: aUp },
                to: { device: portOwnerName(b), port: String(b.getName()), up: bUp }
            });
        }
    }
    return down;
}

function findSubnetMismatches() {
    var found = [];
    for (var i = 0; i < network().getLinkCount(); i++) {
        var link = network().getLinkAt(i);
        if (typeof link.getPort1 !== "function") {
            continue;
        }
        var a = link.getPort1();
        var b = link.getPort2();
        var ipA = String(callIfExists(a, "getIpAddress", ""));
        var ipB = String(callIfExists(b, "getIpAddress", ""));
        if (!isAssigned(ipA) || !isAssigned(ipB)) {
            continue;
        }
        var maskA = String(a.getSubnetMask());
        if (!isInSubnet(ipB, ipA, maskA)) {
            found.push({
                from: { device: portOwnerName(a), port: String(a.getName()), ip: ipA + "/" + maskToCidr(maskA) },
                to: { device: portOwnerName(b), port: String(b.getName()), ip: ipB + "/" + maskToCidr(String(b.getSubnetMask())) }
            });
        }
    }
    return found;
}

function findUnaddressedHosts() {
    var list = [];
    eachDevicePort(function (device, port) {
        if (isIosDevice(device) || !callIfExists(port, "getLink", null)) {
            return;
        }
        var ip = String(callIfExists(port, "getIpAddress", ""));
        if (!isAssigned(ip) && callIfExists(port, "isDhcpClientOn", false) !== true) {
            list.push({ device: String(device.getName()), port: String(port.getName()) });
        }
    });
    return list;
}

function getTopologySummary() {
    var byType = {};
    var linkTypes = {};
    for (var i = 0; i < network().getDeviceCount(); i++) {
        var type = deviceTypeName(network().getDeviceAt(i).getType());
        byType[type] = (byType[type] || 0) + 1;
    }
    getLinks().forEach(function (link) {
        linkTypes[link.type] = (linkTypes[link.type] || 0) + 1;
    });
    return {
        devices: network().getDeviceCount(),
        links: network().getLinkCount(),
        byType: byType,
        linkTypes: linkTypes,
        addresses: getIpInventory().length,
        subnets: getSubnets().map(function (s) {
            return s.network;
        })
    };
}
