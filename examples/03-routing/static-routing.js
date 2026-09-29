addDevice("R1", "2911", 100, 150);
addDevice("R2", "2911", 350, 150);
addDevice("R3", "2911", 600, 150);

addLink("R1", "GigabitEthernet0/1", "R2", "GigabitEthernet0/0", "cross");
addLink("R2", "GigabitEthernet0/1", "R3", "GigabitEthernet0/0", "cross");

setInterfaceIp("R1", "GigabitEthernet0/1", "10.0.12.1/30");
setInterfaceIp("R2", "GigabitEthernet0/0", "10.0.12.2/30");
setInterfaceIp("R2", "GigabitEthernet0/1", "10.0.23.1/30");
setInterfaceIp("R3", "GigabitEthernet0/0", "10.0.23.2/30");

addLoopback("R1", 0, "1.1.1.1/32");
addLoopback("R3", 0, "3.3.3.3/32");

addStaticRoute("R1", "3.3.3.3/32", "10.0.12.2");
addStaticRoute("R1", "10.0.23.0/30", "10.0.12.2");
addStaticRoute("R2", "1.1.1.1/32", "10.0.12.1");
addStaticRoute("R2", "3.3.3.3/32", "10.0.23.2");
addDefaultRoute("R3", "10.0.23.1");
