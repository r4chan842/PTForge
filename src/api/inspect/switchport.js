function switchPortOf(deviceName, portName) {
    var port = findPort(deviceName, portName);
    if (typeof port.getAccessVlan !== "function") {
        throw new Error("Not a switch port: " + deviceName + " " + portName);
    }
    return port;
}

function getSwitchportInfo(deviceName, portName) {
    var port = switchPortOf(deviceName, portName);
    return {
        port: portName,
        access: callIfExists(port, "isAccessPort", null),
        modeCode: callIfExists(port, "getAdminOpMode", null),
        accessVlan: callIfExists(port, "getAccessVlan", null),
        nativeVlan: callIfExists(port, "getNativeVlanId", null),
        voiceVlan: callIfExists(port, "getVoipVlanId", null),
        nonegotiate: callIfExists(port, "isNonegotiate", null),
        cdp: callIfExists(port, "isCdpEnable", null),
        channel: callIfExists(port, "getChannel", null),
        up: callIfExists(port, "isPortUp", false),
        protocolUp: callIfExists(port, "isProtocolUp", false)
    };
}

function getSwitchportTable(deviceName) {
    var device = findDevice(deviceName);
    var rows = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        var port = device.getPortAt(i);
        if (typeof port.getAccessVlan === "function") {
            rows.push(getSwitchportInfo(deviceName, port.getName()));
        }
    }
    return rows;
}

function getPortSecurityStatus(deviceName, portName) {
    var security = switchPortOf(deviceName, portName).getPortSecurity();
    if (!security) {
        return null;
    }
    return {
        enabled: callIfExists(security, "isEnabled", false),
        maximum: callIfExists(security, "getMaxMacNumber", null),
        learned: callIfExists(security, "getTotalMac", null),
        secureMacs: callIfExists(security, "getSecureMacCount", null),
        violations: callIfExists(security, "getViolationCount", null),
        sticky: callIfExists(security, "isStickyOn", null)
    };
}

function findSecurityViolations(deviceName) {
    return getSwitchportTable(deviceName).map(function (row) {
        var status = getPortSecurityStatus(deviceName, row.port);
        return status && status.violations ? { port: row.port, violations: status.violations } : null;
    }).filter(function (row) {
        return row !== null;
    });
}

function setPortCdp(deviceName, portName, enabled) {
    switchPortOf(deviceName, portName).setCdpEnable(enabled !== false);
    return true;
}
