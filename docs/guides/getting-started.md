Getting started
===============

This guide walks through a first script. PTForge must be installed first, see https://github.com/r4chan842/PTForge/blob/main/docs/guides/installation.md.

Open the editor
---------------

Extensions → PTForge Editor.

The window is laid out like Visual Studio Code. The activity bar on the left
opens the Explorer, the function reference, Run and Debug, snippets, devices,
network tools and plugins. Scripts open in tabs. The panel at the bottom holds
Problems, Output, the Debug Console, the Terminal and Lab Check reports.

Ctrl+F5 runs the active script and F5 runs it under the debugger.

Your first network
------------------

    addDevice("R1", "2911", 300, 100);
    addDevice("S1", "2960-24TT", 300, 250);
    addDevice("PC1", "PC-PT", 200, 400);
    addDevice("PC2", "PC-PT", 400, 400);

    addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
    addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");
    addLink("S1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight");

    basicSetup("R1", { secret: "class", consolePassword: "cisco", banner: "Authorized access only" });
    setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.1/24");

    setPcStatic("PC1", "192.168.1.10/24", "192.168.1.1");
    setPcStatic("PC2", "192.168.1.11/24", "192.168.1.1");

    labelAllDevices();

Wait a few seconds for the link lights to turn green, then:

    ping("PC1", "192.168.1.1", 4, function (row) { showResult(row); });
    log(getVlans("S1"));

showResult and log print to the Output panel. log never interrupts the script, so use it for progress messages.

Everything is a function call
-----------------------------

- Devices are referred to by name
- Ports are full names like GigabitEthernet0/0
- IOS functions send commands through the CLI, exactly like typing them
- IOS functions return an array of rejected lines. Empty means success

    var failed = setInterfaceIp("R1", "GigabitEthernet0/5", "10.0.0.1/24");
    showResult(failed);

Raw IOS when you need it
------------------------

Anything the helpers do not cover can be sent directly:

    configureIosDevice("R1", [
        "ip dhcp pool LAN",
        " network 192.168.1.0 255.255.255.0",
        " default-router 192.168.1.1"
    ]);

Mix loops and data
------------------

It is plain JavaScript:

    var vlans = { 10: "SALES", 20: "HR", 30: "IT" };
    ["S1", "S2", "S3"].forEach(function (sw) {
        createVlans(sw, vlans);
        setTrunkPort(sw, "GigabitEthernet0/1", [10, 20, 30]);
    });

Next
----

- Writing scripts (https://github.com/r4chan842/PTForge/blob/main/docs/guides/writing-scripts.md)
- API reference (https://github.com/r4chan842/PTForge/blob/main/docs/api/README.md)
- Recipes (https://github.com/r4chan842/PTForge/blob/main/docs/recipes/README.md)
- The https://github.com/r4chan842/PTForge/tree/main/examples folder has 27 complete labs
