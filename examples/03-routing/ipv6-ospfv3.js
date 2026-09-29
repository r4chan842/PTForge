addDevice("R1", "2911", 150, 150);
addDevice("R2", "2911", 450, 150);

addLink("R1", "GigabitEthernet0/0", "R2", "GigabitEthernet0/0", "cross");

enableIpv6Routing("R1");
enableIpv6Routing("R2");
setInterfaceIpv6("R1", "GigabitEthernet0/0", "2001:db8:12::1/64");
setInterfaceIpv6("R2", "GigabitEthernet0/0", "2001:db8:12::2/64");

configureOspfv3("R1", { routerId: "1.1.1.1", interfaces: ["GigabitEthernet0/0"] });
configureOspfv3("R2", { routerId: "2.2.2.2", interfaces: ["GigabitEthernet0/0"] });
