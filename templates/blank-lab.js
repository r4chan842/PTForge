var lab = {
    name: "My lab",
    secret: "class",
    password: "cisco"
};

var devices = [
    ["R1", "2911", 300, 80],
    ["S1", "2960-24TT", 300, 230]
];

var links = [
    ["R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight"]
];

addDevices(devices);
addLinks(links);

getDevices(["router", "switch"]).forEach(function (name) {
    basicSetup(name, { secret: lab.secret, consolePassword: lab.password, vtyPassword: lab.password });
});

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.1/24");

labelAllDevices();
addNote(20, 20, lab.name);
