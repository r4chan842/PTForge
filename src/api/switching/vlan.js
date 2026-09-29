function buildVlans(vlans) {
    var commands = [];
    if (Array.isArray(vlans)) {
        vlans.forEach(function (id) {
            commands.push("vlan " + id);
            commands.push("exit");
        });
        return commands;
    }
    Object.keys(vlans).forEach(function (id) {
        commands.push("vlan " + id);
        if (vlans[id]) {
            commands.push(" name " + vlans[id]);
        }
        commands.push("exit");
    });
    return commands;
}

function createVlans(deviceName, vlans) {
    return configureIosDevice(deviceName, buildVlans(vlans));
}

function deleteVlan(deviceName, vlans) {
    return configureIosDevice(deviceName, toList(vlans).map(function (id) {
        return "no vlan " + id;
    }));
}

function buildAccessPorts(interfaces, vlanId, options) {
    var opts = options || {};
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["switchport mode access", "switchport access vlan " + vlanId];
        if (opts.voiceVlan) {
            body.push("switchport voice vlan " + opts.voiceVlan);
        }
        if (opts.portfast) {
            body.push("spanning-tree portfast");
        }
        if (opts.bpduguard) {
            body.push("spanning-tree bpduguard enable");
        }
        if (opts.description) {
            body.push("description " + opts.description);
        }
        body.push("no shutdown");
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function setAccessPort(deviceName, interfaces, vlanId, options) {
    return configureIosDevice(deviceName, buildAccessPorts(interfaces, vlanId, options));
}

function assignPorts(deviceName, map, options) {
    var commands = [];
    Object.keys(map).forEach(function (vlanId) {
        commands = commands.concat(buildAccessPorts(map[vlanId], vlanId, options));
    });
    return configureIosDevice(deviceName, commands);
}

function buildSvi(vlanId, address, mask, description) {
    var parsed = ipAndMask(address, mask);
    var body = [];
    if (description) {
        body.push("description " + description);
    }
    body.push("ip address " + parsed.ip + " " + parsed.mask);
    body.push("no shutdown");
    return interfaceBlock("Vlan" + vlanId, body);
}

function addSvi(deviceName, vlanId, address, mask, description) {
    return configureIosDevice(deviceName, buildSvi(vlanId, address, mask, description));
}

function setManagementIp(deviceName, vlanId, address, mask, gateway) {
    var commands = buildSvi(vlanId, address, mask);
    if (gateway) {
        commands.push("ip default-gateway " + gateway);
    }
    return configureIosDevice(deviceName, commands);
}

function setVoiceVlan(deviceName, interfaces, voiceVlan) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["switchport voice vlan " + voiceVlan]));
    });
    return configureIosDevice(deviceName, commands);
}

function parkUnusedPorts(deviceName, interfaces, vlanId) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, [
            "switchport mode access",
            "switchport access vlan " + vlanId,
            "shutdown"
        ]));
    });
    return configureIosDevice(deviceName, commands);
}
