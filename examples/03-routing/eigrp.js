var links = pointToPointLinks("10.10.0.0/24", 3);

buildRing({ count: 3, prefix: "R", portA: "GigabitEthernet0/0", portB: "GigabitEthernet0/1" });

setInterfaceIp("R1", "GigabitEthernet0/0", links[0].a, links[0].mask);
setInterfaceIp("R2", "GigabitEthernet0/1", links[0].b, links[0].mask);
setInterfaceIp("R2", "GigabitEthernet0/0", links[1].a, links[1].mask);
setInterfaceIp("R3", "GigabitEthernet0/1", links[1].b, links[1].mask);
setInterfaceIp("R3", "GigabitEthernet0/0", links[2].a, links[2].mask);
setInterfaceIp("R1", "GigabitEthernet0/1", links[2].b, links[2].mask);

getDevices("router", "R").forEach(function (name, index) {
    addLoopback(name, 0, "192.168." + (index + 1) + ".1/24");
    configureEigrp(name, {
        as: 100,
        routerId: (index + 1) + "." + (index + 1) + "." + (index + 1) + "." + (index + 1),
        networks: ["10.10.0.0/24", "192.168." + (index + 1) + ".0/24"]
    });
});
