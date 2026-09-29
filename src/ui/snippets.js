var snippets = [
    {
        name: "Small LAN",
        info: "Router, switch and four PCs with addresses",
        code: "addDevice(\"R1\", \"2911\", 300, 80);\nbuildLan({ switchName: \"S1\", hosts: 4, network: \"192.168.1.0/24\", x: 300, y: 230 });\naddLink(\"R1\", \"GigabitEthernet0/0\", \"S1\", \"GigabitEthernet0/1\", \"straight\");\nsetInterfaceIp(\"R1\", \"GigabitEthernet0/0\", \"192.168.1.1/24\");\nlabelAllDevices();\n"
    },
    {
        name: "Device hardening",
        info: "Hostname, passwords, banner and SSH",
        code: "basicSetup(\"R1\", { secret: \"class\", consolePassword: \"cisco\", banner: \"Authorized access only\" });\nconfigureSsh(\"R1\", { domain: \"lab.local\", username: \"admin\", password: \"Adm1n!Pass\" });\n"
    },
    {
        name: "VLANs and trunk",
        info: "VLANs, access ports and an uplink trunk",
        code: "createVlans(\"S1\", { 10: \"SALES\", 20: \"IT\", 99: \"MGMT\" });\nassignPorts(\"S1\", { 10: [\"FastEthernet0/1\", \"FastEthernet0/2\"], 20: [\"FastEthernet0/3\"] }, { portfast: true });\nsetTrunkPort(\"S1\", \"GigabitEthernet0/1\", [10, 20, 99], 99);\n"
    },
    {
        name: "Router on a stick",
        info: "Subinterfaces for inter VLAN routing",
        code: "routerOnAStick(\"R1\", \"GigabitEthernet0/0\", {\n    10: \"192.168.10.1/24\",\n    20: \"192.168.20.1/24\"\n});\n"
    },
    {
        name: "OSPF",
        info: "Single area OSPF with a passive LAN",
        code: "configureOspf(\"R1\", {\n    routerId: \"1.1.1.1\",\n    networks: [\"10.0.0.0/30\", \"192.168.1.0/24\"],\n    passive: \"GigabitEthernet0/1\"\n});\n"
    },
    {
        name: "Router DHCP",
        info: "Pool with excluded addresses",
        code: "addRouterDhcpPool(\"R1\", {\n    name: \"LAN\",\n    network: \"192.168.1.0/24\",\n    gateway: \"192.168.1.1\",\n    dns: \"8.8.8.8\",\n    excluded: [[\"192.168.1.1\", \"192.168.1.20\"]]\n});\n"
    },
    {
        name: "Server services",
        info: "DHCP, DNS and web on Server-PT",
        code: "addDhcpPool(\"SRV\", { name: \"LAN\", start: \"192.168.1.100\", mask: 24, gateway: \"192.168.1.1\", dns: \"192.168.1.10\" });\naddDnsRecord(\"SRV\", \"www.lab.local\", \"192.168.1.10\");\nsetHttpService(\"SRV\", true);\n"
    },
    {
        name: "Extended ACL",
        info: "Allow web to a server, deny the rest",
        code: "createExtendedAcl(\"R1\", \"WEB\", [\n    { protocol: \"tcp\", source: \"any\", destination: \"10.0.0.10\", port: 80 },\n    { action: \"deny\", source: \"any\", destination: \"any\" }\n]);\napplyAcl(\"R1\", \"GigabitEthernet0/1\", \"WEB\", \"in\");\n"
    },
    {
        name: "PAT",
        info: "Internet access for a LAN",
        code: "configurePat(\"R1\", {\n    inside: \"GigabitEthernet0/0\",\n    outside: \"GigabitEthernet0/1\",\n    networks: \"192.168.1.0/24\"\n});\n"
    },
    {
        name: "Inspect switch",
        info: "VLANs, trunk state and port security",
        code: "log(getVlans(\"S1\"));\nlog(getSwitchportTable(\"S1\"));\nlog(findSecurityViolations(\"S1\"));\n"
    },
    {
        name: "Document topology",
        info: "Zone, labels and IP notes",
        code: "drawZoneAround(getDevices([\"pc\", \"switch\"]), \"Users\", \"green\");\ngetDevices(\"pc\").forEach(function (pc) {\n    labelWithIp(pc, \"FastEthernet0\");\n});\n"
    },
    {
        name: "Lab check",
        info: "Graded checks with a score report",
        code: "beginChecks(\"My lab\");\ncheckDeviceExists(\"R1\");\ncheckLinked(\"R1\", \"S1\");\ncheckIpAddress(\"R1\", \"GigabitEthernet0/0\", \"192.168.1.1\", 24);\ncheckVlan(\"S1\", 10);\ncheckConfigContains(\"R1\", \"ip route 0.0.0.0\");\nendChecks();\n"
    },
    {
        name: "Audit network",
        info: "Duplicate IPs, subnet mismatches, VLAN 1 ports",
        code: "var result = auditNetwork();\nlog(getTopologySummary());\nlog(getSubnets());\n"
    },
    {
        name: "Show on every device",
        info: "One command on all routers and switches",
        code: "runOnAll(\"show ip interface brief\").forEach(function (r) {\n    log(r.device + \"\\n\" + r.output);\n});\n"
    },
    {
        name: "CLI history to script",
        info: "Turn typed IOS commands into a script",
        code: "setCommandLogging(true);\ncommandsToScript();\n"
    },
    {
        name: "IP inventory",
        info: "Every address in the topology",
        code: "showResult(getIpInventory());\nshowResult(findDuplicateIps());\n"
    }
];
