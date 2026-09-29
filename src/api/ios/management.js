function setNtpServer(deviceName, servers) {
    return configureIosDevice(deviceName, toList(servers).map(function (ip) {
        return "ntp server " + ip;
    }));
}

function setSyslogServer(deviceName, servers, trapLevel) {
    var commands = toList(servers).map(function (ip) {
        return "logging " + ip;
    });
    if (trapLevel) {
        commands.push("logging trap " + trapLevel);
    }
    commands.push("service timestamps log datetime msec");
    return configureIosDevice(deviceName, commands);
}

function setSnmpCommunity(deviceName, community, access) {
    return configureIosDevice(deviceName, ["snmp-server community " + community + " " + (access === "rw" ? "RW" : "RO")]);
}

function setCdp(deviceName, enabled) {
    return configureIosDevice(deviceName, [enabled === false ? "no cdp run" : "cdp run"]);
}

function setLldp(deviceName, enabled) {
    return configureIosDevice(deviceName, [enabled === false ? "no lldp run" : "lldp run"]);
}

function setDefaultGateway(deviceName, gateway) {
    return configureIosDevice(deviceName, ["ip default-gateway " + gateway]);
}

function enableIpRouting(deviceName) {
    return configureIosDevice(deviceName, ["ip routing"]);
}

function enableIpv6Routing(deviceName) {
    return configureIosDevice(deviceName, ["ipv6 unicast-routing"]);
}
