function buildNatInterfaces(inside, outside) {
    var commands = [];
    toList(inside).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip nat inside"]));
    });
    toList(outside).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip nat outside"]));
    });
    return commands;
}

function setNatInterfaces(deviceName, inside, outside) {
    return configureIosDevice(deviceName, buildNatInterfaces(inside, outside));
}

function addStaticNat(deviceName, insideLocal, insideGlobal, options) {
    var opts = options || {};
    var commands = [];
    if (opts.inside || opts.outside) {
        commands = buildNatInterfaces(opts.inside, opts.outside);
    }
    if (opts.protocol) {
        commands.push("ip nat inside source static " + opts.protocol + " " + insideLocal + " " + opts.localPort + " " + insideGlobal + " " + opts.globalPort);
    } else {
        commands.push("ip nat inside source static " + insideLocal + " " + insideGlobal);
    }
    return configureIosDevice(deviceName, commands);
}

function buildNatAcl(aclId, networks) {
    return toList(networks).map(function (network) {
        return "access-list " + aclId + " permit " + aclAddress(network);
    });
}

function configurePat(deviceName, options) {
    var opts = options || {};
    var aclId = opts.acl || 1;
    var commands = buildNatInterfaces(opts.inside, requireValue(opts.outside, "outside"));
    commands = commands.concat(buildNatAcl(aclId, opts.networks));
    commands.push("ip nat inside source list " + aclId + " interface " + opts.outside + " overload");
    return configureIosDevice(deviceName, commands);
}

function configureNatPool(deviceName, options) {
    var opts = options || {};
    var aclId = opts.acl || 1;
    var poolName = opts.name || "NATPOOL";
    var commands = buildNatInterfaces(opts.inside, opts.outside);
    commands.push("ip nat pool " + poolName + " " + requireValue(opts.start, "start") + " " + requireValue(opts.end, "end") + " netmask " + normalizeMask(requireValue(opts.mask, "mask")));
    commands = commands.concat(buildNatAcl(aclId, opts.networks));
    commands.push("ip nat inside source list " + aclId + " pool " + poolName + (opts.overload ? " overload" : ""));
    return configureIosDevice(deviceName, commands);
}

function clearNatTranslations(deviceName) {
    return runCommand(deviceName, "clear ip nat translation *", "enable");
}
