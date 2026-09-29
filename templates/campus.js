var vlans = { 10: "USERS", 20: "VOICE", 30: "PRINTERS", 99: "MGMT" };
var access = ["A1", "A2"];
var distribution = ["D1", "D2"];

addDevices([
    ["D1", "3560-24PS", 200, 100],
    ["D2", "3560-24PS", 500, 100],
    ["A1", "2960-24TT", 200, 280],
    ["A2", "2960-24TT", 500, 280]
]);

addLinks([
    ["D1", "GigabitEthernet0/1", "D2", "GigabitEthernet0/1", "cross"],
    ["D1", "FastEthernet0/1", "A1", "GigabitEthernet0/1", "straight"],
    ["D1", "FastEthernet0/2", "A2", "GigabitEthernet0/1", "straight"],
    ["D2", "FastEthernet0/1", "A1", "GigabitEthernet0/2", "straight"],
    ["D2", "FastEthernet0/2", "A2", "GigabitEthernet0/2", "straight"]
]);

distribution.concat(access).forEach(function (sw) {
    basicSetup(sw, { secret: "class" });
    createVlans(sw, vlans);
    setStpMode(sw);
});

distribution.forEach(function (sw, i) {
    enableIpRouting(sw);
    setTrunkPort(sw, ["GigabitEthernet0/1", "FastEthernet0/1", "FastEthernet0/2"], [10, 20, 30, 99], 99);
    setStpRoot(sw, [10, 30], i === 0 ? "primary" : "secondary");
    setStpRoot(sw, [20, 99], i === 0 ? "secondary" : "primary");
    [10, 20, 30, 99].forEach(function (vlan) {
        addSvi(sw, vlan, "10." + vlan + ".0." + (i + 2) + "/24");
    });
});

access.forEach(function (sw, i) {
    setTrunkPort(sw, ["GigabitEthernet0/1", "GigabitEthernet0/2"], [10, 20, 30, 99], 99);
    setAccessPort(sw, ["FastEthernet0/1", "FastEthernet0/2", "FastEthernet0/3"], 10, { voiceVlan: 20, portfast: true, bpduguard: true });
    setManagementIp(sw, 99, "10.99.0." + (i + 10) + "/24", null, "10.99.0.2");
});

drawZoneAround(distribution, "Distribution", "orange");
drawZoneAround(access, "Access", "green");
labelAllDevices();
