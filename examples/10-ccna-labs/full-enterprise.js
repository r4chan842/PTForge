var p2p = pointToPointLinks("10.255.0.0/24", 2);

addDevice("ISP", "2911", 700, 60);
addDevice("EDGE", "2911", 450, 60);
addDevice("CORE", "3560-24PS", 450, 200);
addDevice("ACC1", "2960-24TT", 250, 340);
addDevice("ACC2", "2960-24TT", 650, 340);
addDevice("SRV", "Server-PT", 450, 340);
addDevice("PC1", "PC-PT", 180, 480);
addDevice("PC2", "PC-PT", 320, 480);
addDevice("PC3", "PC-PT", 580, 480);
addDevice("PC4", "PC-PT", 720, 480);

addLinks([
    ["EDGE", "GigabitEthernet0/1", "ISP", "GigabitEthernet0/0", "cross"],
    ["EDGE", "GigabitEthernet0/0", "CORE", "GigabitEthernet0/1", "straight"],
    ["CORE", "FastEthernet0/1", "ACC1", "GigabitEthernet0/1", "cross"],
    ["CORE", "FastEthernet0/2", "ACC2", "GigabitEthernet0/1", "cross"],
    ["CORE", "FastEthernet0/3", "SRV", "FastEthernet0", "straight"],
    ["ACC1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight"],
    ["ACC1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight"],
    ["ACC2", "FastEthernet0/1", "PC3", "FastEthernet0", "straight"],
    ["ACC2", "FastEthernet0/2", "PC4", "FastEthernet0", "straight"]
]);

getDevices(["router", "switch", "multilayerswitch"]).forEach(function (name) {
    basicSetup(name, { secret: "class", consolePassword: "cisco" });
});

["CORE", "ACC1", "ACC2"].forEach(function (sw) {
    createVlans(sw, { 10: "USERS", 20: "STAFF", 50: "SERVERS" });
});

setTrunkPort("CORE", ["FastEthernet0/1", "FastEthernet0/2"], [10, 20, 50]);
setTrunkPort("ACC1", "GigabitEthernet0/1", [10, 20, 50]);
setTrunkPort("ACC2", "GigabitEthernet0/1", [10, 20, 50]);
setAccessPort("CORE", "FastEthernet0/3", 50);

assignPorts("ACC1", { 10: "FastEthernet0/1", 20: "FastEthernet0/2" }, { portfast: true, bpduguard: true });
assignPorts("ACC2", { 10: "FastEthernet0/1", 20: "FastEthernet0/2" }, { portfast: true, bpduguard: true });

enableIpRouting("CORE");
addSvi("CORE", 10, "192.168.10.1/24");
addSvi("CORE", 20, "192.168.20.1/24");
addSvi("CORE", 50, "192.168.50.1/24");
configureIosDevice("CORE", ["interface GigabitEthernet0/1", " no switchport", " ip address " + p2p[0].b + " " + p2p[0].mask, " no shutdown", "exit"]);
setDhcpRelay("CORE", ["Vlan10", "Vlan20"], "192.168.50.10");

configurePcIp("SRV", false, "192.168.50.10/24", null, "192.168.50.1", "192.168.50.10");
addDhcpPool("SRV", { name: "USERS", start: "192.168.10.100", mask: 24, gateway: "192.168.10.1", dns: "192.168.50.10" });
addDhcpPool("SRV", { name: "STAFF", start: "192.168.20.100", mask: 24, gateway: "192.168.20.1", dns: "192.168.50.10" });
addDnsRecord("SRV", "intranet.lab", "192.168.50.10");
setHttpService("SRV", true);

setInterfaceIp("EDGE", "GigabitEthernet0/0", p2p[0].a, p2p[0].mask);
setInterfaceIp("EDGE", "GigabitEthernet0/1", p2p[1].a, p2p[1].mask);
setInterfaceIp("ISP", "GigabitEthernet0/0", p2p[1].b, p2p[1].mask);
addLoopback("ISP", 0, "8.8.8.8/32");

configureOspf("EDGE", { routerId: "1.1.1.1", networks: [p2p[0].network], defaultOriginate: true });
configureOspf("CORE", { routerId: "2.2.2.2", networks: [p2p[0].network, "192.168.0.0/16"], passive: ["Vlan10", "Vlan20", "Vlan50"] });
addDefaultRoute("EDGE", p2p[1].b);

configurePat("EDGE", { inside: "GigabitEthernet0/0", outside: "GigabitEthernet0/1", networks: ["192.168.0.0/16"] });
configureSsh("EDGE", { domain: "lab.local", username: "admin", password: "Cisco123!" });

["PC1", "PC2", "PC3", "PC4"].forEach(function (pc) {
    setPcDhcp(pc);
});

labelAllDevices();
drawZoneAround(["ACC1", "PC1", "PC2"], "Floor 1", "green");
drawZoneAround(["ACC2", "PC3", "PC4"], "Floor 2", "orange");
drawZoneAround(["EDGE", "ISP"], "WAN", "red");
