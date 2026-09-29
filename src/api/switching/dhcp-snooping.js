function buildDhcpSnooping(vlans, trusted, options) {
    var opts = options || {};
    var commands = ["ip dhcp snooping", "ip dhcp snooping vlan " + joinVlans(vlans)];
    if (opts.option82 === false) {
        commands.push("no ip dhcp snooping information option");
    }
    toList(trusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip dhcp snooping trust"]));
    });
    toList(opts.untrusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip dhcp snooping limit rate " + (opts.rateLimit || 15)]));
    });
    return commands;
}

function enableDhcpSnooping(deviceName, vlans, trusted, options) {
    return configureIosDevice(deviceName, buildDhcpSnooping(vlans, trusted, options));
}

function enableArpInspection(deviceName, vlans, trusted) {
    var commands = ["ip arp inspection vlan " + joinVlans(vlans)];
    toList(trusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip arp inspection trust"]));
    });
    return configureIosDevice(deviceName, commands);
}
