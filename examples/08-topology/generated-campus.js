addDevice("CORE", "3560-24PS", 500, 60);

for (var n = 1; n <= 6; n++) {
    var sw = "ACC" + n;
    addDevice(sw, "2960-24TT", n * 140, 240);
    addLink("CORE", "FastEthernet0/" + n, sw, "GigabitEthernet0/1", "straight");
}

getDevices("switch", "ACC").forEach(function (name) {
    setHostname(name, name);
    setTrunkPort(name, "GigabitEthernet0/1");
});

labelAllDevices();
