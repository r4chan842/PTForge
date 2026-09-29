addDevice("S1", "2960-24TT", 200, 150);
addDevice("S2", "2960-24TT", 500, 150);
addDevice("PC1", "PC-PT", 120, 320);
addDevice("PC2", "PC-PT", 280, 320);
addDevice("PC3", "PC-PT", 420, 320);
addDevice("PC4", "PC-PT", 580, 320);

addLink("S1", "GigabitEthernet0/1", "S2", "GigabitEthernet0/1", "cross");
addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/11", "PC2", "FastEthernet0", "straight");
addLink("S2", "FastEthernet0/1", "PC3", "FastEthernet0", "straight");
addLink("S2", "FastEthernet0/11", "PC4", "FastEthernet0", "straight");

["S1", "S2"].forEach(function (sw) {
    createVlans(sw, { 10: "SALES", 20: "IT", 99: "NATIVE" });
    setAccessPort(sw, "FastEthernet0/1", 10, { portfast: true });
    setAccessPort(sw, "FastEthernet0/11", 20, { portfast: true });
    setTrunkPort(sw, "GigabitEthernet0/1", [10, 20, 99], 99);
});

configurePcIp("PC1", false, "192.168.10.11/24");
configurePcIp("PC2", false, "192.168.20.11/24");
configurePcIp("PC3", false, "192.168.10.12/24");
configurePcIp("PC4", false, "192.168.20.12/24");

drawZoneAround(["PC1", "PC3"], "VLAN 10", "green", 30);
