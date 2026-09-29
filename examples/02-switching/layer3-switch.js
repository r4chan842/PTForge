addDevice("ML1", "3560-24PS", 350, 100);
addDevice("PC1", "PC-PT", 200, 300);
addDevice("PC2", "PC-PT", 500, 300);

addLink("ML1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");
addLink("ML1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight");

createVlans("ML1", { 10: "USERS", 20: "SERVERS" });
setAccessPort("ML1", "FastEthernet0/1", 10);
setAccessPort("ML1", "FastEthernet0/2", 20);
enableIpRouting("ML1");
addSvi("ML1", 10, "192.168.10.1/24");
addSvi("ML1", 20, "192.168.20.1/24");

configurePcIp("PC1", false, "192.168.10.10/24", null, "192.168.10.1");
configurePcIp("PC2", false, "192.168.20.10/24", null, "192.168.20.1");
