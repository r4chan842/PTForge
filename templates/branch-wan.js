var sites = [
    { name: "HQ", lan: "10.1.0.0/24", x: 400, y: 80 },
    { name: "BR1", lan: "10.2.0.0/24", x: 200, y: 300 },
    { name: "BR2", lan: "10.3.0.0/24", x: 600, y: 300 }
];
var wan = pointToPointLinks("172.16.0.0/24", 2);

sites.forEach(function (site, i) {
    addDevice(site.name, "2911", site.x, site.y);
    addModule(site.name, "0/1", "HWIC-2T");
    basicSetup(site.name, { secret: "class" });
    setInterfaceIp(site.name, "GigabitEthernet0/0", nthHost(site.lan, 1) + "/24");
});

addLink("HQ", "Serial0/1/0", "BR1", "Serial0/1/0", "serial");
addLink("HQ", "Serial0/1/1", "BR2", "Serial0/1/0", "serial");

setInterfaceIp("HQ", "Serial0/1/0", wan[0].a, wan[0].mask);
setInterfaceIp("BR1", "Serial0/1/0", wan[0].b, wan[0].mask);
setInterfaceIp("HQ", "Serial0/1/1", wan[1].a, wan[1].mask);
setInterfaceIp("BR2", "Serial0/1/0", wan[1].b, wan[1].mask);
setClockRate("HQ", "Serial0/1/0", 128000);
setClockRate("HQ", "Serial0/1/1", 128000);

sites.forEach(function (site, i) {
    configureOspf(site.name, {
        routerId: (i + 1) + "." + (i + 1) + "." + (i + 1) + "." + (i + 1),
        networks: [site.lan, "172.16.0.0/24"],
        passive: "GigabitEthernet0/0"
    });
});

labelLink("HQ", "BR1", wan[0].network + "/30");
labelLink("HQ", "BR2", wan[1].network + "/30");
labelAllDevices();
