addDevice("CORE1", "2960-24TT", 200, 100);
addDevice("CORE2", "2960-24TT", 500, 100);
addDevice("ACC1", "2960-24TT", 350, 280);

addLink("CORE1", "GigabitEthernet0/1", "CORE2", "GigabitEthernet0/1", "cross");
addLink("CORE1", "GigabitEthernet0/2", "ACC1", "GigabitEthernet0/1", "cross");
addLink("CORE2", "GigabitEthernet0/2", "ACC1", "GigabitEthernet0/2", "cross");

getDevices("switch").forEach(function (sw) {
    setStpMode(sw, "rapid-pvst");
    createVlans(sw, [10, 20]);
});

setStpRoot("CORE1", [1, 10], "primary");
setStpRoot("CORE2", [1, 10], "secondary");
setStpRoot("CORE2", 20, "primary");
setStpRoot("CORE1", 20, "secondary");

enablePortfastDefault("ACC1");
