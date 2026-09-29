addDevice("R1", "2911", 300, 100);
addDevice("S1", "2960-24TT", 300, 250);
addDevice("PC1", "PC-PT", 200, 400);
addDevice("PC2", "PC-PT", 400, 400);

addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight");

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.1/24");

configurePcIp("PC1", false, "192.168.1.10", "255.255.255.0", "192.168.1.1");
configurePcIp("PC2", false, "192.168.1.11", "255.255.255.0", "192.168.1.1");
