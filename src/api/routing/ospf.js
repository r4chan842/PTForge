function normalizeOspfNetwork(entry, defaultArea) {
    if (typeof entry === "string") {
        return { network: entry, area: defaultArea };
    }
    return { network: entry.network, mask: entry.mask, area: isDefined(entry.area) ? entry.area : defaultArea };
}

function buildOspf(options) {
    var opts = options || {};
    var area = isDefined(opts.area) ? opts.area : 0;
    var commands = ["router ospf " + (opts.processId || 1)];

    if (opts.routerId) {
        commands.push(" router-id " + opts.routerId);
    }
    toList(opts.networks).forEach(function (entry) {
        var item = normalizeOspfNetwork(entry, area);
        commands.push(" network " + networkAndWildcard(item.network, item.mask) + " area " + item.area);
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    if (opts.referenceBandwidth) {
        commands.push(" auto-cost reference-bandwidth " + opts.referenceBandwidth);
    }
    commands.push("exit");
    return commands;
}

function configureOspf(deviceName, options) {
    return configureIosDevice(deviceName, buildOspf(options));
}

function buildOspfInterface(interfaceName, options) {
    var opts = options || {};
    var body = [];
    if (isDefined(opts.cost)) {
        body.push("ip ospf cost " + opts.cost);
    }
    if (isDefined(opts.priority)) {
        body.push("ip ospf priority " + opts.priority);
    }
    if (isDefined(opts.hello)) {
        body.push("ip ospf hello-interval " + opts.hello);
    }
    if (isDefined(opts.dead)) {
        body.push("ip ospf dead-interval " + opts.dead);
    }
    if (opts.processId && isDefined(opts.area)) {
        body.push("ip ospf " + opts.processId + " area " + opts.area);
    }
    if (opts.md5Key) {
        body.push("ip ospf authentication message-digest");
        body.push("ip ospf message-digest-key " + (opts.keyId || 1) + " md5 " + opts.md5Key);
    }
    if (opts.networkType) {
        body.push("ip ospf network " + opts.networkType);
    }
    return interfaceBlock(interfaceName, body);
}

function setOspfInterface(deviceName, interfaceName, options) {
    return configureIosDevice(deviceName, buildOspfInterface(interfaceName, options));
}

function buildOspfv3(options) {
    var opts = options || {};
    var processId = opts.processId || 1;
    var commands = ["ipv6 unicast-routing", "ipv6 router ospf " + processId];
    commands.push(" router-id " + requireValue(opts.routerId, "routerId"));
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    commands.push("exit");

    var interfaces = opts.interfaces || {};
    if (Array.isArray(interfaces)) {
        var mapped = {};
        interfaces.forEach(function (name) {
            mapped[name] = isDefined(opts.area) ? opts.area : 0;
        });
        interfaces = mapped;
    }
    Object.keys(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ipv6 ospf " + processId + " area " + interfaces[name]]));
    });
    return commands;
}

function configureOspfv3(deviceName, options) {
    return configureIosDevice(deviceName, buildOspfv3(options));
}

function removeOspf(deviceName, processId) {
    return configureIosDevice(deviceName, ["no router ospf " + (processId || 1)]);
}
