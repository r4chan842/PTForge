addDevice("R1", "2911", 300, 100);
addDevice("SRV", "Server-PT", 550, 100);
addDevice("PC1", "PC-PT", 100, 250);

addLink("R1", "GigabitEthernet0/0", "PC1", "FastEthernet0", "cross");
addLink("R1", "GigabitEthernet0/1", "SRV", "FastEthernet0", "cross");

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
setInterfaceIp("R1", "GigabitEthernet0/1", "10.0.0.1/24");
configurePcIp("SRV", false, "10.0.0.5/24", null, "10.0.0.1");

addDhcpPool("SRV", { name: "VLAN10", start: "192.168.10.100", mask: 24, gateway: "192.168.10.1" });
setDhcpRelay("R1", "GigabitEthernet0/0", "10.0.0.5");
setPcDhcp("PC1");
