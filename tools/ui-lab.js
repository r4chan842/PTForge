"use strict";

const fs = require("fs");
const path = require("path");

function labPluginFiles() {
    const dir = path.join(__dirname, "..", "plugins");
    const files = {};
    fs.readdirSync(dir).filter((f) => f.endsWith(".pf")).forEach((f) => { files[f] = fs.readFileSync(path.join(dir, f), "utf8"); });
    return files;
}

const labSetup = `
var labConfigs = {
    R1: "hostname R1\\ninterface GigabitEthernet0/0\\n ip address 10.0.0.1 255.255.255.0\\n no shutdown\\ninterface GigabitEthernet0/1\\n ip address 10.0.12.1 255.255.255.252\\nrouter ospf 1\\n network 10.0.0.0 0.0.0.255 area 0\\nend",
    R2: "hostname R2\\ninterface GigabitEthernet0/1\\n ip address 10.0.12.2 255.255.255.252\\nend"
};
world.respond = function (device, cmd) {
    if (cmd === "show running-config") {
        return labConfigs[device] || "";
    }
    if (cmd === "show version") {
        return "Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4\\nROM: System Bootstrap, Version 15.1(4)M4\\n" + device + " uptime is 12 minutes";
    }
    if (cmd === "show ip interface brief") {
        return "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.0.0.1        YES manual up                    up\\nGigabitEthernet0/1     10.0.12.1       YES manual up                    up";
    }
    if (/^ping /.test(cmd)) {
        var ip = cmd.split(" ").pop();
        if (ip === "10.0.0.20") {
            return "Type escape sequence to abort.\\nSending 5, 100-byte ICMP Echos to " + ip + ", timeout is 2 seconds:\\n.....\\nSuccess rate is 0 percent (0/5)";
        }
        if (device === "R2" && ip === "10.0.0.10") {
            return "Type escape sequence to abort.\\nSending 5, 100-byte ICMP Echos to " + ip + ", timeout is 2 seconds:\\n.!!!!\\nSuccess rate is 80 percent (4/5), round-trip min/avg/max = 1/3/7 ms";
        }
        return "Type escape sequence to abort.\\nSending 5, 100-byte ICMP Echos to " + ip + ", timeout is 2 seconds:\\n!!!!!\\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms";
    }
    return undefined;
};
addDevice("R1", "2911", 100, 100);
addDevice("R2", "2911", 300, 100);
addDevice("S1", "2960-24TT", 100, 250);
addDevice("PC1", "PC-PT", 50, 380);
addDevice("PC2", "PC-PT", 160, 380);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("R1", "GigabitEthernet0/1", "R2", "GigabitEthernet0/1", "cross");
addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight");
addLink("S1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight");
function labIp(device, port, ip, mask) {
    var p = world.devices[device].ports.filter(function (x) { return x.name === port; })[0];
    p.ip = ip;
    p.mask = mask;
}
labIp("R1", "GigabitEthernet0/0", "10.0.0.1", "255.255.255.0");
labIp("R1", "GigabitEthernet0/1", "10.0.12.1", "255.255.255.252");
labIp("R2", "GigabitEthernet0/1", "10.0.12.2", "255.255.255.252");
labIp("PC1", "FastEthernet0", "10.0.0.10", "255.255.255.0");
labIp("PC2", "FastEthernet0", "10.0.0.20", "255.255.255.0");
world.fs = world.fs || {};
var labPlugins = ${JSON.stringify(labPluginFiles())};
Object.keys(labPlugins).forEach(function (name) {
    world.fs["C:/Users/lab/Documents/PTForge/plugins/" + name] = labPlugins[name];
});
`;

module.exports = { labSetup };
