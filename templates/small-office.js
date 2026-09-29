addDevices([
    ["EDGE", "2911", 350, 60],
    ["S1", "2960-24TT", 350, 200],
    ["AP", "AccessPoint-PT", 550, 200],
    ["SRV", "Server-PT", 150, 340],
    ["PC1", "PC-PT", 300, 340],
    ["PC2", "PC-PT", 450, 340],
    ["ISP", "Cloud-PT", 600, 60]
]);

addLinks([
    ["EDGE", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight"],
    ["S1", "FastEthernet0/1", "SRV", "FastEthernet0", "straight"],
    ["S1", "FastEthernet0/2", "PC1", "FastEthernet0", "straight"],
    ["S1", "FastEthernet0/3", "PC2", "FastEthernet0", "straight"],
    ["S1", "FastEthernet0/4", "AP", "Port 0", "straight"]
]);

basicSetup("EDGE", { secret: "class", banner: "Office network" });
setInterfaceIp("EDGE", "GigabitEthernet0/0", "192.168.1.1/24");
setInterfaceIp("EDGE", "GigabitEthernet0/1", "203.0.113.2/30");
addDefaultRoute("EDGE", "203.0.113.1");

setPcStatic("SRV", "192.168.1.10/24", "192.168.1.1", "192.168.1.10");
addDhcpPool("SRV", { name: "OFFICE", start: "192.168.1.100", mask: 24, gateway: "192.168.1.1", dns: "192.168.1.10" });
addDnsRecord("SRV", "intranet.office", "192.168.1.10");
setHttpService("SRV", true);

setPcDhcp("PC1");
setPcDhcp("PC2");

configurePat("EDGE", { inside: "GigabitEthernet0/0", outside: "GigabitEthernet0/1", networks: "192.168.1.0/24" });
configureWireless("AP", { ssid: "OFFICE", security: "wpa2-psk", key: "Office2026!" });

drawZoneAround(["S1", "SRV", "PC1", "PC2", "AP"], "Office LAN 192.168.1.0/24", "blue");
labelAllDevices();
