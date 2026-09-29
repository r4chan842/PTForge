addDevice("S1", "2960-24TT", 200, 200);
addDevice("S2", "2960-24TT", 500, 200);

addLink("S1", "FastEthernet0/23", "S2", "FastEthernet0/23", "cross");
addLink("S1", "FastEthernet0/24", "S2", "FastEthernet0/24", "cross");

createEtherChannel("S1", 1, ["FastEthernet0/23", "FastEthernet0/24"], "active", { trunk: true });
createEtherChannel("S2", 1, ["FastEthernet0/23", "FastEthernet0/24"], "passive", { trunk: true });

labelLink("S1", "S2", "Po1 LACP");
