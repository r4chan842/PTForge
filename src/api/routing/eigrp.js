function buildEigrp(options) {
    var opts = options || {};
    var commands = ["router eigrp " + requireValue(opts.as, "as")];
    if (opts.routerId) {
        commands.push(" eigrp router-id " + opts.routerId);
    }
    toList(opts.networks).forEach(function (entry) {
        var text = String(entry);
        commands.push(" network " + (text.indexOf("/") !== -1 ? networkAndWildcard(text) : text));
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.autoSummary !== true) {
        commands.push(" no auto-summary");
    }
    toList(opts.redistribute).forEach(function (source) {
        commands.push(" redistribute " + source);
    });
    commands.push("exit");
    return commands;
}

function configureEigrp(deviceName, options) {
    return configureIosDevice(deviceName, buildEigrp(options));
}

function buildEigrpv6(options) {
    var opts = options || {};
    var as = requireValue(opts.as, "as");
    var commands = ["ipv6 unicast-routing", "ipv6 router eigrp " + as];
    commands.push(" eigrp router-id " + requireValue(opts.routerId, "routerId"));
    commands.push(" no shutdown");
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    commands.push("exit");
    toList(opts.interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ipv6 eigrp " + as]));
    });
    return commands;
}

function configureEigrpv6(deviceName, options) {
    return configureIosDevice(deviceName, buildEigrpv6(options));
}

function setEigrpSummary(deviceName, interfaceName, as, network, mask) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip summary-address eigrp " + as + " " + networkAndMask(network, mask)]));
}

function removeEigrp(deviceName, as) {
    return configureIosDevice(deviceName, ["no router eigrp " + as]);
}
