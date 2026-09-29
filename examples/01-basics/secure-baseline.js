addDevice("R1", "2911", 200, 150);
addDevice("S1", "2960-24TT", 400, 150);

getDevices(["router", "switch"]).forEach(function (name) {
    basicSetup(name, {
        secret: "class",
        consolePassword: "cisco",
        vtyPassword: "cisco",
        banner: "Authorized access only"
    });
});
