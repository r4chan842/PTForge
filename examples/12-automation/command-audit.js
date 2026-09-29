clearCommandLog();
setCommandLogging(true);

addDevice("R1", "2911", 300, 150);
setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.0.1/24");

var entries = getCommandLog("R1");
log(entries.length + " commands recorded on R1");
entries.forEach(function (e) {
    log(e.time + "  " + e.prompt + " " + e.command);
});
