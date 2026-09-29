function aclPort(value) {
    if (!isDefined(value) || value === "") {
        return "";
    }
    var text = String(value);
    if (/^(eq|neq|gt|lt|range) /.test(text)) {
        return " " + text;
    }
    return " eq " + text;
}

function buildAclEntry(entry, extended) {
    if (typeof entry === "string") {
        return entry.trim();
    }
    var action = entry.action || "permit";
    if (action === "remark") {
        return "remark " + entry.text;
    }
    if (!extended) {
        return action + " " + aclAddress(entry.source || "any");
    }
    var line = action + " " + (entry.protocol || "ip") + " " + aclAddress(entry.source || "any") + aclPort(entry.sourcePort);
    line += " " + aclAddress(entry.destination || "any") + aclPort(entry.port);
    if (entry.established) {
        line += " established";
    }
    if (entry.icmpType) {
        line += " " + entry.icmpType;
    }
    if (entry.log) {
        line += " log";
    }
    return line;
}

function isNumberedAcl(id) {
    return /^\d+$/.test(String(id));
}

function buildAcl(id, entries, extended) {
    var list = toList(entries).map(function (entry) {
        return buildAclEntry(entry, extended);
    });
    if (isNumberedAcl(id)) {
        return list.map(function (line) {
            return "access-list " + id + " " + line;
        });
    }
    return ["ip access-list " + (extended ? "extended " : "standard ") + id].concat(list.map(function (line) {
        return " " + line;
    })).concat(["exit"]);
}

function createStandardAcl(deviceName, id, entries) {
    if (isNumberedAcl(id) && !((id >= 1 && id <= 99) || (id >= 1300 && id <= 1999))) {
        throw new Error("Standard ACL numbers are 1-99 or 1300-1999");
    }
    return configureIosDevice(deviceName, buildAcl(id, entries, false));
}

function createExtendedAcl(deviceName, id, entries) {
    if (isNumberedAcl(id) && !((id >= 100 && id <= 199) || (id >= 2000 && id <= 2699))) {
        throw new Error("Extended ACL numbers are 100-199 or 2000-2699");
    }
    return configureIosDevice(deviceName, buildAcl(id, entries, true));
}

function applyAcl(deviceName, interfaceName, id, direction) {
    var dir = direction || "in";
    if (dir !== "in" && dir !== "out") {
        throw new Error("ACL direction must be in or out");
    }
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip access-group " + id + " " + dir]));
}

function removeAclFromInterface(deviceName, interfaceName, id, direction) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["no ip access-group " + id + " " + (direction || "in")]));
}

function applyAclToVty(deviceName, id, lines) {
    return configureIosDevice(deviceName, ["line vty " + (lines || "0 15"), " access-class " + id + " in", "exit"]);
}

function deleteAcl(deviceName, id, extended) {
    if (isNumberedAcl(id)) {
        return configureIosDevice(deviceName, ["no access-list " + id]);
    }
    return configureIosDevice(deviceName, ["no ip access-list " + (extended ? "extended " : "standard ") + id]);
}

function createIpv6Acl(deviceName, name, entries, interfaceName, direction) {
    var commands = ["ipv6 access-list " + name].concat(toList(entries).map(function (line) {
        return " " + line;
    })).concat(["exit"]);
    if (interfaceName) {
        commands = commands.concat(interfaceBlock(interfaceName, ["ipv6 traffic-filter " + name + " " + (direction || "in")]));
    }
    return configureIosDevice(deviceName, commands);
}
