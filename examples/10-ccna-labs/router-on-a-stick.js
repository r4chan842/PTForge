addDevice("R1", "2911", 350, 80);
addDevice("S1", "2960-24TT", 350, 230);
addDevice("PC-SALES", "PC-PT", 200, 380);
addDevice("PC-IT", "PC-PT", 500, 380);

addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("S1", "FastEthernet0/1", "PC-SALES", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/2", "PC-IT", "FastEthernet0", "straight");

createVlans("S1", { 10: "SALES", 20: "IT" });
setAccessPort("S1", "FastEthernet0/1", 10);
setAccessPort("S1", "FastEthernet0/2", 20);
setTrunkPort("S1", "GigabitEthernet0/1", [10, 20]);

routerOnAStick("R1", "GigabitEthernet0/0", {
    10: "192.168.10.1/24",
    20: "192.168.20.1/24"
});

configurePcIp("PC-SALES", false, "192.168.10.10/24", null, "192.168.10.1");
configurePcIp("PC-IT", false, "192.168.20.10/24", null, "192.168.20.1");

drawZoneAround(["PC-SALES"], "VLAN 10", "green", 30);
drawZoneAround(["PC-IT"], "VLAN 20", "orange", 30);
