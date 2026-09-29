addDevice("ISP", "2911", 450, 150);
addDevice("EDGE", "2911", 150, 150);

addLink("EDGE", "GigabitEthernet0/0", "ISP", "GigabitEthernet0/0", "cross");

setInterfaceIp("EDGE", "GigabitEthernet0/0", "203.0.113.1/30");
setInterfaceIp("ISP", "GigabitEthernet0/0", "203.0.113.2/30");
addLoopback("EDGE", 0, "198.51.100.1/24");
addLoopback("ISP", 0, "8.8.8.8/32");

configureBgp("EDGE", {
    as: 65001,
    neighbors: [{ ip: "203.0.113.2", remoteAs: 65000 }],
    networks: ["198.51.100.0/24"]
});
configureBgp("ISP", {
    as: 65000,
    neighbors: [{ ip: "203.0.113.1", remoteAs: 65001 }],
    networks: ["8.8.8.8/32"]
});
