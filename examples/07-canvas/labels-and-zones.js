addDevice("R1", "2911", 300, 100);
addDevice("S1", "2960-24TT", 150, 250);
addDevice("S2", "2960-24TT", 450, 250);

addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("R1", "GigabitEthernet0/1", "S2", "GigabitEthernet0/1", "straight");

labelAllDevices();
labelLink("R1", "S1", "VLAN 10");
labelLink("R1", "S2", "VLAN 20");

drawZoneAround(["S1"], "Building A", "green");
drawZoneAround(["S2"], "Building B", "orange");
drawArrow(620, 120, 520, 120, "red", 3);
addNote(630, 110, "Internet uplink");
drawDashedLine(100, 380, 600, 380, "gray", 1);
