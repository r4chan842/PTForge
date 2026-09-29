addDevice("ABR", "2911", 350, 100);
addDevice("R1", "2911", 150, 280);
addDevice("R2", "2911", 550, 280);

addLink("ABR", "GigabitEthernet0/0", "R1", "GigabitEthernet0/0", "cross");
addLink("ABR", "GigabitEthernet0/1", "R2", "GigabitEthernet0/0", "cross");

setInterfaceIp("ABR", "GigabitEthernet0/0", "10.0.1.1/30");
setInterfaceIp("ABR", "GigabitEthernet0/1", "10.0.2.1/30");
setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.1.2/30");
setInterfaceIp("R2", "GigabitEthernet0/0", "10.0.2.2/30");
addLoopback("R1", 0, "172.16.1.1/24");
addLoopback("R2", 0, "172.16.2.1/24");

configureOspf("ABR", {
    routerId: "0.0.0.1",
    networks: [
        { network: "10.0.1.0/30", area: 0 },
        { network: "10.0.2.0/30", area: 1 }
    ]
});
configureOspf("R1", { routerId: "0.0.0.2", networks: ["10.0.1.0/30", "172.16.1.0/24"] });
configureOspf("R2", { routerId: "0.0.0.3", area: 1, networks: ["10.0.2.0/30", "172.16.2.0/24"] });

drawZoneAround(["ABR", "R1"], "Area 0", "blue");
drawZoneAround(["R2"], "Area 1", "orange");
