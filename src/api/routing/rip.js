function classfulNetwork(entry) {
    var text = String(entry);
    var ip = text.split("/")[0];
    var first = Number(ip.split(".")[0]);
    var prefix = first < 128 ? 8 : first < 192 ? 16 : 24;
    return networkAddress(ip, prefix);
}

function buildRip(options) {
    var opts = options || {};
    var commands = ["router rip", " version " + (opts.version || 2)];
    var seen = {};
    toList(opts.networks).forEach(function (entry) {
        var network = classfulNetwork(entry);
        if (!seen[network]) {
            seen[network] = true;
            commands.push(" network " + network);
        }
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.autoSummary !== true) {
        commands.push(" no auto-summary");
    }
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    commands.push("exit");
    return commands;
}

function configureRip(deviceName, options) {
    return configureIosDevice(deviceName, buildRip(options));
}

function configureRipng(deviceName, name, interfaces) {
    var commands = ["ipv6 unicast-routing", "ipv6 router rip " + name, "exit"];
    toList(interfaces).forEach(function (item) {
        commands = commands.concat(interfaceBlock(item, ["ipv6 rip " + name + " enable"]));
    });
    return configureIosDevice(deviceName, commands);
}

function removeRip(deviceName) {
    return configureIosDevice(deviceName, ["no router rip"]);
}
