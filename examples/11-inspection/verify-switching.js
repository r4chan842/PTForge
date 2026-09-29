addDevice("S1", "2960-24TT", 200, 150);
addDevice("S2", "2960-24TT", 450, 150);
addLink("S1", "GigabitEthernet0/1", "S2", "GigabitEthernet0/1", "cross");

["S1", "S2"].forEach(function (sw) {
    createVlans(sw, { 10: "SALES", 20: "IT" });
    setTrunkPort(sw, "GigabitEthernet0/1", [10, 20]);
    setAccessPort(sw, ["FastEthernet0/1", "FastEthernet0/2"], 10, { portfast: true });
});
setStpRoot("S1", 1, "primary");

var report = [];
["S1", "S2"].forEach(function (sw) {
    report.push(sw + " VLANs: " + getVlans(sw).map(function (v) { return v.id; }).join(", "));
    var inVlan1 = getSwitchportTable(sw).filter(function (p) {
        return p.access && p.accessVlan === 1 && p.up;
    });
    report.push(sw + " active ports still in VLAN 1: " + inVlan1.length);
});
report.push("Root bridge for VLAN 1: " + findRootBridge(["S1", "S2"], 1));

log(report.join("\n"));
