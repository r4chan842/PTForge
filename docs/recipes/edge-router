Edge router
===========

    basicSetup("EDGE", { secret: "Cl4ss!", consolePassword: "C0ns0le!", banner: "Authorized access only" });
    configureSsh("EDGE", { domain: "corp.local", username: "admin", password: "Adm1n!Pass" });
    setLoginBlock("EDGE", 120, 3, 60);
    setMinPasswordLength("EDGE", 8);

    setInterfaceIp("EDGE", "GigabitEthernet0/0", "192.168.1.1/24");
    setInterfaceIp("EDGE", "GigabitEthernet0/1", "203.0.113.2/30");
    addDefaultRoute("EDGE", "203.0.113.1");

    addRouterDhcpPool("EDGE", {
        name: "LAN",
        network: "192.168.1.0/24",
        gateway: "192.168.1.1",
        dns: ["8.8.8.8", "1.1.1.1"],
        excluded: [["192.168.1.1", "192.168.1.19"]]
    });

    configurePat("EDGE", {
        inside: "GigabitEthernet0/0",
        outside: "GigabitEthernet0/1",
        networks: "192.168.1.0/24"
    });

    createStandardAcl("EDGE", "MGMT", [{ source: "192.168.1.0/28" }]);
    applyAclToVty("EDGE", "MGMT");
