addDevice("R1", "2911", 200, 120);
addDevice("R2", "2911", 460, 120);
addLink("R1", "GigabitEthernet0/0", "R2", "GigabitEthernet0/0", "cross");

setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.0.1/30");
setInterfaceIp("R2", "GigabitEthernet0/0", "10.0.0.2/30");
takeSnapshot("before-ospf");

configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
configureOspf("R2", { routerId: "2.2.2.2", networks: ["10.0.0.0/30"] });

var diff = showSnapshotDiff("before-ospf");
log(diff);
saveSnapshot("before-ospf", "before-ospf.json");
