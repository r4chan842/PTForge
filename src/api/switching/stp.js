function setStpMode(deviceName, mode) {
    var value = mode || "rapid-pvst";
    if (["pvst", "rapid-pvst"].indexOf(value) === -1) {
        throw new Error("Invalid STP mode: " + value);
    }
    return configureIosDevice(deviceName, ["spanning-tree mode " + value]);
}

function setStpRoot(deviceName, vlans, role) {
    return configureIosDevice(deviceName, ["spanning-tree vlan " + joinVlans(vlans) + " root " + (role === "secondary" ? "secondary" : "primary")]);
}

function setStpPriority(deviceName, vlans, priority) {
    var value = Number(priority);
    if (value % 4096 !== 0 || value < 0 || value > 61440) {
        throw new Error("STP priority must be a multiple of 4096 between 0 and 61440");
    }
    return configureIosDevice(deviceName, ["spanning-tree vlan " + joinVlans(vlans) + " priority " + value]);
}

function enablePortfast(deviceName, interfaces, bpduguard) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["spanning-tree portfast"];
        if (bpduguard !== false) {
            body.push("spanning-tree bpduguard enable");
        }
        commands = commands.concat(interfaceBlock(name, body));
    });
    return configureIosDevice(deviceName, commands);
}

function enablePortfastDefault(deviceName, bpduguard) {
    var commands = ["spanning-tree portfast default"];
    if (bpduguard !== false) {
        commands.push("spanning-tree portfast bpduguard default");
    }
    return configureIosDevice(deviceName, commands);
}

function setStpPortCost(deviceName, interfaceName, cost, vlan) {
    var line = isDefined(vlan) ? "spanning-tree vlan " + vlan + " cost " + cost : "spanning-tree cost " + cost;
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, [line]));
}
