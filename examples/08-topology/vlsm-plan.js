var plan = planSubnets("192.168.100.0/24", {
    SALES: 60,
    IT: 25,
    GUEST: 10,
    WAN: 2
});

addDevice("R1", "2911", 300, 80);
buildLan({ switchName: "S-SALES", hosts: 3, hostPrefix: "SALES", x: 150, y: 220, network: plan.SALES.network });
buildLan({ switchName: "S-IT", hosts: 2, hostPrefix: "IT", x: 500, y: 220, network: plan.IT.network });

addLink("R1", "GigabitEthernet0/0", "S-SALES", "GigabitEthernet0/1", "straight");
addLink("R1", "GigabitEthernet0/1", "S-IT", "GigabitEthernet0/1", "straight");
setInterfaceIp("R1", "GigabitEthernet0/0", plan.SALES.gateway, plan.SALES.mask);
setInterfaceIp("R1", "GigabitEthernet0/1", plan.IT.gateway, plan.IT.mask);

addNote(20, 20, "SALES " + plan.SALES.network + "\nIT " + plan.IT.network + "\nGUEST " + plan.GUEST.network + "\nWAN " + plan.WAN.network);
