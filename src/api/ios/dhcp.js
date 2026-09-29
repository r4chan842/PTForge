function buildRouterDhcpPool(pool) {
    var info = parseNetwork(requireValue(pool.network, "network"), pool.mask);
    var commands = [];

    toList(pool.excluded).forEach(function (range) {
        var pair = toList(range);
        commands.push("ip dhcp excluded-address " + pair[0] + (pair[1] ? " " + pair[1] : ""));
    });

    commands.push("ip dhcp pool " + requireValue(pool.name, "name"));
    commands.push(" network " + info.network + " " + info.mask);
    if (pool.gateway) {
        commands.push(" default-router " + pool.gateway);
    }
    if (pool.dns) {
        commands.push(" dns-server " + toList(pool.dns).join(" "));
    }
    if (pool.domain) {
        commands.push(" domain-name " + pool.domain);
    }
    if (pool.tftp) {
        commands.push(" option 150 ip " + pool.tftp);
    }
    commands.push("exit");
    return commands;
}

function addRouterDhcpPool(deviceName, pool) {
    return configureIosDevice(deviceName, buildRouterDhcpPool(pool));
}

function excludeRouterDhcp(deviceName, startIp, endIp) {
    return configureIosDevice(deviceName, ["ip dhcp excluded-address " + startIp + (endIp ? " " + endIp : "")]);
}

function removeRouterDhcpPool(deviceName, name) {
    return configureIosDevice(deviceName, ["no ip dhcp pool " + name]);
}

function setDhcpRelay(deviceName, interfaceName, serverIp) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, toList(serverIp).map(function (ip) {
        return "ip helper-address " + ip;
    })));
}
