function dhcpServer(deviceName, portName) {
    var main = getProcessOf(deviceName, "DhcpServerMain");
    var dhcp = main.getDhcpServerProcessByPortName(portName || "FastEthernet0");
    if (!dhcp) {
        throw new Error("DHCP server not available on " + deviceName + " " + (portName || "FastEthernet0"));
    }
    return dhcp;
}

function setDhcpService(deviceName, enabled, portName) {
    dhcpServer(deviceName, portName).setEnable(enabled !== false);
    return true;
}

function addDhcpPool(deviceName, pool, portName) {
    var dhcp = dhcpServer(deviceName, portName);
    var mask = normalizeMask(requireValue(pool.mask, "mask"));
    dhcp.setEnable(true);
    dhcp.addNewPool(
        requireValue(pool.name, "name"),
        pool.gateway || "0.0.0.0",
        pool.dns || "0.0.0.0",
        requireValue(pool.start, "start"),
        mask,
        pool.maxUsers || 256,
        pool.tftp || "0.0.0.0",
        pool.wlc || "0.0.0.0"
    );
    return true;
}

function removeDhcpPool(deviceName, poolName, portName) {
    dhcpServer(deviceName, portName).removePool(poolName);
    return true;
}

function excludeDhcpRange(deviceName, startIp, endIp, portName) {
    dhcpServer(deviceName, portName).addExcludedAddress(startIp, endIp || startIp);
    return true;
}

function getDhcpPools(deviceName, portName) {
    var dhcp = dhcpServer(deviceName, portName);
    var pools = [];
    for (var i = 0; i < dhcp.getPoolCount(); i++) {
        var pool = dhcp.getPoolAt(i);
        pools.push({
            name: String(pool.getDhcpPoolName()),
            gateway: String(pool.getDefaultRouter()),
            dns: String(pool.getDnsServerIp()),
            start: String(pool.getStartIp()),
            end: String(pool.getEndIp()),
            mask: String(pool.getSubnetMask()),
            maxUsers: pool.getMaxUsers()
        });
    }
    return pools;
}
