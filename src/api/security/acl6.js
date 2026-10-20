function aclIpv6Name(name) {
    var text = oneLine(name);
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(text)) {
        throw new Error("IPv6 ACL names start with a letter and use letters, digits, _ or -: got " + name);
    }
    return text;
}

function aclIpv6Entry(line) {
    var text = oneLine(line);
    if (!/^(permit|deny|remark)\s+\S/i.test(text)) {
        throw new Error("IPv6 ACL entries start with permit, deny or remark, got " + line);
    }
    return text;
}

function buildIpv6Acl(name, entries) {
    var list = toList(entries).map(aclIpv6Entry);
    if (!list.length) {
        throw new Error("buildIpv6Acl needs at least one entry, for example \"permit ipv6 any any\"");
    }
    return ["ipv6 access-list " + aclIpv6Name(name)].concat(list.map(function (line) {
        return " " + line;
    })).concat(["exit"]);
}

function createIpv6Acl(deviceName, name, entries, interfaceName, direction) {
    var acl = aclIpv6Name(name);
    var commands = buildIpv6Acl(acl, entries);
    var dir = isDefined(direction) ? String(direction).toLowerCase() : "in";

    if (isDefined(interfaceName) && interfaceName !== "") {
        if (dir !== "in" && dir !== "out") {
            throw new Error("IPv6 ACL direction must be in or out, got " + direction);
        }
        findPort(deviceName, interfaceName);
        commands = commands.concat(interfaceBlock(interfaceName, ["ipv6 traffic-filter " + acl + " " + dir]));
    }
    return configureIosDevice(deviceName, commands);
}

function deleteIpv6Acl(deviceName, name) {
    return configureIosDevice(deviceName, ["no ipv6 access-list " + aclIpv6Name(name)]);
}

function applyIpv6Acl(deviceName, interfaceName, name, direction) {
    var dir = isDefined(direction) ? String(direction).toLowerCase() : "in";
    if (dir !== "in" && dir !== "out") {
        throw new Error("IPv6 ACL direction must be in or out, got " + direction);
    }
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ipv6 traffic-filter " + aclIpv6Name(name) + " " + dir]));
}

function removeIpv6AclFromInterface(deviceName, interfaceName, name, direction) {
    var dir = isDefined(direction) ? String(direction).toLowerCase() : "in";
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["no ipv6 traffic-filter " + aclIpv6Name(name) + " " + dir]));
}
