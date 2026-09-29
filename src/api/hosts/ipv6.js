function configurePcIpv6(deviceName, options) {
    var opts = options || {};
    var port = hostPort(deviceName, opts.port);

    port.setIpv6Enabled(true);

    if (opts.autoConfig === true || opts.autoConfig === false) {
        port.setIpv6AddressAutoConfig(opts.autoConfig);
    }
    if (opts.linkLocal) {
        port.setIpv6LinkLocal(opts.linkLocal);
    }
    if (opts.address) {
        var address = String(opts.address);
        var prefix = opts.prefix || 64;
        if (address.indexOf("/") !== -1) {
            prefix = Number(address.split("/")[1]);
            address = address.split("/")[0];
        }
        var type = ipv6AddressTypes[opts.type || "unicast"];
        if (type === undefined) {
            throw new Error("Unknown IPv6 address type: " + opts.type);
        }
        port.addIpv6Address(address, prefix, type, false);
    }
    if (opts.gateway) {
        port.setv6DefaultGateway(opts.gateway);
    }
    if (opts.dns) {
        port.setv6ServerIp(opts.dns);
    }
    return true;
}

function clearPcIpv6(deviceName, portName) {
    hostPort(deviceName, portName).removeAllIpv6Addresses();
    return true;
}

function disablePcIpv6(deviceName, portName) {
    hostPort(deviceName, portName).setIpv6Enabled(false);
    return true;
}
