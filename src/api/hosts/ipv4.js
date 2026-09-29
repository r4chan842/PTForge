function hostPort(deviceName, portName) {
    return findPort(deviceName, portName || "FastEthernet0");
}

function configurePcIp(deviceName, dhcpEnabled, ipAddress, subnetMask, defaultGateway, dnsServer, portName) {
    var device = findDevice(deviceName);
    var port = hostPort(deviceName, portName);

    if (dhcpEnabled === true || dhcpEnabled === false) {
        device.setDhcpFlag(dhcpEnabled);
    }
    if (ipAddress) {
        var parsed = ipAndMask(ipAddress, subnetMask || (String(ipAddress).indexOf("/") === -1 ? 24 : undefined));
        port.setIpSubnetMask(parsed.ip, parsed.mask);
    }
    if (defaultGateway) {
        port.setDefaultGateway(defaultGateway);
    }
    if (dnsServer) {
        port.setDnsServerIp(dnsServer);
    }
    return true;
}

function setPcDhcp(deviceName, portName) {
    return configurePcIp(deviceName, true, undefined, undefined, undefined, undefined, portName);
}

function setPcStatic(deviceName, address, gateway, dns, portName) {
    return configurePcIp(deviceName, false, address, undefined, gateway, dns, portName);
}

function getPcIp(deviceName, portName) {
    var device = findDevice(deviceName);
    var port = hostPort(deviceName, portName);
    return {
        dhcp: callIfExists(device, "getDhcpFlag", false) === true,
        ip: String(port.getIpAddress()),
        mask: String(port.getSubnetMask()),
        ipv6: String(callIfExists(port, "getUnicastIpv6Address", ""))
    };
}

function setHostFirewall(deviceName, enabled, portName) {
    hostPort(deviceName, portName).setInboundFirewallService(enabled !== false);
    return true;
}

function runHostCommand(deviceName, command) {
    var device = findDevice(deviceName);
    if (typeof device.getCommandPrompt !== "function") {
        throw new Error("Device has no command prompt: " + deviceName);
    }
    device.getCommandPrompt().enterCommand(String(command));
    return true;
}
