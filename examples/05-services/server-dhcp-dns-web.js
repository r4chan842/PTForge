addDevice("R1", "2911", 300, 80);
addDevice("S1", "2960-24TT", 300, 220);
addDevice("SRV", "Server-PT", 120, 360);
addDevice("PC1", "PC-PT", 300, 360);
addDevice("PC2", "PC-PT", 480, 360);

addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("S1", "FastEthernet0/1", "SRV", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/2", "PC1", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/3", "PC2", "FastEthernet0", "straight");

setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.0.1/24");
configurePcIp("SRV", false, "10.0.0.2/24", null, "10.0.0.1", "10.0.0.2");

addDhcpPool("SRV", {
    name: "LAN",
    start: "10.0.0.100",
    mask: 24,
    gateway: "10.0.0.1",
    dns: "10.0.0.2",
    maxUsers: 50
});

addDnsRecords("SRV", { "www.lab.local": "10.0.0.2", "ftp.lab.local": "10.0.0.2" });
setHttpService("SRV", true);
setWebPage("SRV", "index.html", "<h1>PTForge lab</h1>");

setPcDhcp("PC1");
setPcDhcp("PC2");
