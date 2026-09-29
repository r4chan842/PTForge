addDevice("EDGE", "2911", 300, 150);
addDevice("ISP", "2911", 550, 150);
addDevice("S1", "2960-24TT", 100, 150);

addLink("EDGE", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("EDGE", "GigabitEthernet0/1", "ISP", "GigabitEthernet0/0", "cross");

setInterfaceIp("EDGE", "GigabitEthernet0/0", "192.168.1.1/24");
setInterfaceIp("EDGE", "GigabitEthernet0/1", "203.0.113.1/30");
setInterfaceIp("ISP", "GigabitEthernet0/0", "203.0.113.2/30");
addDefaultRoute("EDGE", "203.0.113.2");

configurePat("EDGE", {
    inside: "GigabitEthernet0/0",
    outside: "GigabitEthernet0/1",
    networks: ["192.168.1.0/24"]
});
