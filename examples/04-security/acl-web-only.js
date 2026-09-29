addDevice("R1", "2911", 300, 100);
addDevice("SRV", "Server-PT", 500, 250);
addDevice("PC1", "PC-PT", 100, 250);

addLink("R1", "GigabitEthernet0/0", "PC1", "FastEthernet0", "cross");
addLink("R1", "GigabitEthernet0/1", "SRV", "FastEthernet0", "cross");

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.1/24");
setInterfaceIp("R1", "GigabitEthernet0/1", "10.0.0.1/24");
configurePcIp("PC1", false, "192.168.1.10/24", null, "192.168.1.1");
configurePcIp("SRV", false, "10.0.0.10/24", null, "10.0.0.1");

createExtendedAcl("R1", "WEB_ONLY", [
    { action: "remark", text: "Users may browse the web server only" },
    { protocol: "tcp", source: "192.168.1.0/24", destination: "10.0.0.10", port: 80 },
    { protocol: "tcp", source: "192.168.1.0/24", destination: "10.0.0.10", port: 443 },
    { action: "deny", protocol: "ip", source: "any", destination: "any" }
]);
applyAcl("R1", "GigabitEthernet0/0", "WEB_ONLY", "in");
