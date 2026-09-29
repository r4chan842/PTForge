addDevice("S1", "2960-24TT", 300, 150);
addDevice("PC1", "PC-PT", 300, 320);

addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");

setManagementIp("S1", 1, "192.168.1.2/24", null, "192.168.1.1");
configureSsh("S1", { domain: "lab.local", username: "admin", password: "Cisco123!" });

configurePortSecurity("S1", "FastEthernet0/1", { maximum: 2, violation: "restrict" });
parkUnusedPorts("S1", ["FastEthernet0/20", "FastEthernet0/21", "FastEthernet0/22"], 999);
configurePcIp("PC1", false, "192.168.1.10/24", null, "192.168.1.1");
