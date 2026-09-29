addDevice("R1", "2911", 200, 100);
addDevice("R2", "2911", 500, 100);
addDevice("S1", "2960-24TT", 350, 250);
addDevice("PC1", "PC-PT", 350, 400);

addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("R2", "GigabitEthernet0/0", "S1", "GigabitEthernet0/2", "straight");
addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.2/24");
setInterfaceIp("R2", "GigabitEthernet0/0", "192.168.1.3/24");
configureHsrpPair("R1", "R2", "GigabitEthernet0/0", "192.168.1.1", 1);

configurePcIp("PC1", false, "192.168.1.10/24", null, "192.168.1.1");
