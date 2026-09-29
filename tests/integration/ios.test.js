"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension, commandsOf, configBody } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

function setup() {
    const env = loadExtension();
    env.run('addDevice("R1", "2911", 0, 0); addDevice("S1", "2960-24TT", 0, 0); addDevice("ML1", "3560-24PS", 0, 0); addDevice("PC1", "PC-PT", 0, 0)');
    return env;
}

test("configureIosDevice wraps commands and saves", () => {
    const { run, world } = setup();
    const failed = j(run, 'configureIosDevice("R1", "hostname EDGE\\n\\n  !\\ninterface Gi0/0\\n no shutdown  ")');
    assert.deepEqual(failed, []);
    assert.deepEqual(commandsOf(world, "R1"), ["!", "hostname EDGE", "interface Gi0/0", " no shutdown", "end", "write memory"]);
    assert.equal(world.devices.R1.commands[0].mode, "global");
    assert.equal(world.devices.R1.commands[5].mode, "enable");
});

test("save can be skipped and arrays are accepted", () => {
    const { run, world } = setup();
    run('configureIosDevice("R1", ["ip routing"], false)');
    assert.deepEqual(commandsOf(world, "R1"), ["!", "ip routing", "end"]);
});

test("rejected commands are reported, applyConfig throws", () => {
    const { run, world } = setup();
    world.rejectCommands.push(/^bogus/);
    assert.deepEqual(j(run, 'configureIosDevice("R1", "bogus command\\nhostname R1")'), [{ command: "bogus command", status: "invalid" }]);
    assert.throws(() => run('applyConfig("R1", "bogus")'), /R1 rejected: bogus \(invalid\)/);
    assert.equal(run('applyConfig("R1", "hostname R1")'), true);
});

test("non IOS devices are refused", () => {
    const { run } = setup();
    assert.throws(() => run('configureIosDevice("PC1", "hostname X")'), /Not a Cisco IOS device/);
    assert.throws(() => run('runCommand("NOPE", "show version")'), /not found/);
});

test("runCommand and helpers", () => {
    const { run, world } = setup();
    assert.deepEqual(j(run, 'runCommand("R1", "show version")'), { status: "ok", output: "" });
    assert.equal(world.devices.R1.commands[0].mode, "enable");
    run('showCommand("R1", "ip route")');
    assert.equal(world.devices.R1.commands[1].cmd, "show ip route");
    run('getRunningConfig("R1"); getRoutingTable("R1"); getInterfacesBrief("R1"); getVlanBrief("S1")');
    assert.equal(run('getHostname("R1")'), "Router");
    assert.equal(run('getPrompt("R1")'), "R#");
    assert.equal(run('getCliMode("R1")'), "enable");
    assert.deepEqual(j(run, "saveAllConfigs()"), ["R1", "S1", "ML1"]);
    assert.deepEqual(Object.keys(j(run, 'applyToDevices(["R1", "S1"], "no ip domain-lookup")')), ["R1", "S1"]);
});

test("basic device setup", () => {
    const { run, world } = setup();
    run('basicSetup("R1", { secret: "class", consolePassword: "cisco" })');
    const body = configBody(world, "R1");
    assert.equal(body[0], "hostname R1");
    assert.ok(body.includes("enable secret class"));
    assert.ok(body.includes("service password-encryption"));

    const all = [
        'setHostname("R1", "CORE")',
        'setBanner("R1", "Authorized only")',
        'setEnableSecret("R1", "s")',
        'setConsolePassword("R1", "c")',
        'setVtyPassword("R1", "v")',
        'addLocalUser("R1", "admin", "pw", 15)',
        'enablePasswordEncryption("R1")',
        'setDomainName("R1", "lab.local")',
        'setNameServer("R1", ["8.8.8.8", "1.1.1.1"])',
        'addHostEntry("R1", "srv", "10.0.0.5")'
    ];
    all.forEach((code) => assert.deepEqual(j(run, code), [], code));
    const text = commandsOf(world, "R1").join("\n");
    assert.match(text, /username admin privilege 15 secret pw/);
    assert.match(text, /ip name-server 8\.8\.8\.8 1\.1\.1\.1/);
    assert.throws(() => run('setHostname("R1", "")'), /hostname/);
});

test("interfaces", () => {
    const { run, world } = setup();
    run('setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.0.1/30", null, "to R2")');
    run('setInterfaceDhcp("R1", "GigabitEthernet0/1")');
    run('setInterfaceIpv6("R1", "GigabitEthernet0/0", "2001:db8::1/64", { linkLocal: "fe80::1" })');
    run('shutdownInterface("R1", ["GigabitEthernet0/2"]); enableInterface("R1", "GigabitEthernet0/2")');
    run('setInterfaceDescription("R1", "Serial0/1/0", "WAN"); setClockRate("R1", "Serial0/1/0"); setBandwidth("R1", "Serial0/1/0", 1544); setSpeedDuplex("R1", "GigabitEthernet0/0", 100, "full")');
    run('addLoopback("R1", 0, "1.1.1.1")');
    run('routerOnAStick("R1", "GigabitEthernet0/1", { 10: "192.168.10.1/24", 20: "192.168.20.1/24" })');
    const text = commandsOf(world, "R1").join("\n");
    assert.match(text, /interface GigabitEthernet0\/0\n description to R2\n ip address 10\.0\.0\.1 255\.255\.255\.252/);
    assert.match(text, / ip address dhcp/);
    assert.match(text, / ipv6 address 2001:db8::1\/64\n ipv6 address fe80::1 link-local\n ipv6 enable/);
    assert.match(text, / clock rate 64000/);
    assert.match(text, /interface Loopback0\n ip address 1\.1\.1\.1 255\.255\.255\.255/);
    assert.match(text, /interface GigabitEthernet0\/1\.20\n encapsulation dot1Q 20\n ip address 192\.168\.20\.1 255\.255\.255\.0/);
    assert.match(text, / speed 100\n duplex full/);
});

test("router services", () => {
    const { run, world } = setup();
    run('addRouterDhcpPool("R1", { name: "LAN", network: "192.168.1.0/24", gateway: "192.168.1.1", tftp: "10.0.0.9" })');
    run('excludeRouterDhcp("R1", "192.168.1.1", "192.168.1.9"); removeRouterDhcpPool("R1", "OLD"); setDhcpRelay("R1", "GigabitEthernet0/1", ["10.0.0.5", "10.0.0.6"])');
    run('setNtpServer("R1", "10.0.0.1"); setSyslogServer("R1", "10.0.0.2", "warnings"); setSnmpCommunity("R1", "public"); setSnmpCommunity("R1", "private", "rw")');
    run('setCdp("R1", false); setLldp("R1"); setDefaultGateway("S1", "10.0.0.1"); enableIpRouting("ML1"); enableIpv6Routing("R1")');
    const text = commandsOf(world, "R1").join("\n");
    assert.match(text, / option 150 ip 10\.0\.0\.9/);
    assert.match(text, /no ip dhcp pool OLD/);
    assert.match(text, / ip helper-address 10\.0\.0\.5\n ip helper-address 10\.0\.0\.6/);
    assert.match(text, /logging 10\.0\.0\.2\nlogging trap warnings/);
    assert.match(text, /snmp-server community public RO/);
    assert.match(text, /snmp-server community private RW/);
    assert.match(text, /no cdp run/);
    assert.match(text, /lldp run/);
    assert.match(text, /ipv6 unicast-routing/);
    assert.ok(commandsOf(world, "ML1").includes("ip routing"));
    assert.ok(commandsOf(world, "S1").includes("ip default-gateway 10.0.0.1"));
});
