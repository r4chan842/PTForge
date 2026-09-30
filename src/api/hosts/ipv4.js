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

function cleanAddress(value) {
    if (!isDefined(value) || value === null) {
        return null;
    }
    var text = String(value).trim();
    if (!text || text === "0.0.0.0" || text === "::" || text === "null" || text === "undefined") {
        return null;
    }
    return text;
}

function hostProcessValue(deviceName, names, method) {
    try {
        return cleanAddress(processByNames(deviceName, names)[method]());
    } catch (error) {
        return null;
    }
}

function getPcIp(deviceName, portName) {
    var device = findDevice(deviceName);
    var port = hostPort(deviceName, portName);
    var ipv6 = cleanAddress(callIfExists(port, "getUnicastIpv6Address", null));
    var prefix = callIfExists(port, "getUnicastIpv6Prefix", null);
    return {
        port: String(port.getName()),
        dhcp: callIfExists(device, "getDhcpFlag", false) === true,
        ip: cleanAddress(port.getIpAddress()),
        mask: cleanAddress(port.getSubnetMask()),
        gateway: hostProcessValue(deviceName, ["HostIp"], "getDefaultGateway"),
        dns: hostProcessValue(deviceName, ["DnsClient"], "getServerIp"),
        mac: cleanAddress(callIfExists(port, "getMacAddress", null)),
        ipv6: ipv6,
        ipv6Prefix: ipv6 && prefix !== null && !isNaN(Number(prefix)) ? Number(prefix) : null,
        linkLocal: cleanAddress(callIfExists(port, "getIpv6LinkLocal", null)),
        ipv6Gateway: hostProcessValue(deviceName, ["HostIpv6"], "getDefaultGateway"),
        ipv6Dns: hostProcessValue(deviceName, ["DnsClient"], "getServerIpv6"),
        up: callIfExists(port, "isPortUp", null)
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
