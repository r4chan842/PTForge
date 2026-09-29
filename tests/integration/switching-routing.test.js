"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension, commandsOf } = require("../helpers/load");

function setup() {
    const env = loadExtension();
    env.run('addDevice("R1", "2911", 0, 0); addDevice("R2", "2911", 0, 0); addDevice("S1", "2960-24TT", 0, 0); addDevice("ML1", "3560-24PS", 0, 0)');
    return env;
}

test("vlan workflow on access switch", () => {
    const { run, world } = setup();
    run('createVlans("S1", { 10: "SALES", 20: "IT", 99: "MGMT" })');
    run('assignPorts("S1", { 10: ["FastEthernet0/1", "FastEthernet0/2"], 20: "FastEthernet0/3" }, { portfast: true })');
    run('setTrunkPort("S1", "GigabitEthernet0/1", [10, 20, 99], 99)');
    run('setManagementIp("S1", 99, "10.99.0.2/24", null, "10.99.0.1")');
    run('setVoiceVlan("S1", "FastEthernet0/4", 150); parkUnusedPorts("S1", ["FastEthernet0/20"], 999); deleteVlan("S1", [30]); setDtpMode("S1", "FastEthernet0/24", "dynamic desirable")');
    const text = commandsOf(world, "S1").join("\n");
    assert.match(text, /vlan 99\n name MGMT/);
    assert.match(text, /interface FastEthernet0\/3\n switchport mode access\n switchport access vlan 20\n spanning-tree portfast/);
    assert.match(text, /interface GigabitEthernet0\/1\n switchport mode trunk\n switchport trunk allowed vlan 10,20,99\n switchport trunk native vlan 99/);
    assert.ok(!/encapsulation/.test(text));
    assert.match(text, /interface Vlan99\n ip address 10\.99\.0\.2 255\.255\.255\.0\n no shutdown\nexit\nip default-gateway 10\.99\.0\.1/);
    assert.match(text, / switchport access vlan 999\n shutdown/);
    assert.match(text, /no vlan 30/);
});

test("multilayer switch gets dot1q encapsulation automatically", () => {
    const { run, world } = setup();
    run('setTrunkPort("ML1", "GigabitEthernet0/1", "all")');
    run('createEtherChannel("ML1", 1, ["FastEthernet0/1", "FastEthernet0/2"], "active", { trunk: true })');
    run('addSvi("ML1", 10, "192.168.10.1", "255.255.255.0", "SALES GW")');
    const text = commandsOf(world, "ML1").join("\n");
    assert.match(text, /switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan all/);
    assert.match(text, /interface Port-channel1\n switchport trunk encapsulation dot1q/);
    assert.match(text, /interface Vlan10\n description SALES GW/);
});

test("stp vtp port security snooping", () => {
    const { run, world } = setup();
    run('setStpMode("S1"); setStpRoot("S1", [10, 20]); setStpRoot("S1", 30, "secondary"); setStpPriority("S1", 10, 4096)');
    assert.throws(() => run('setStpPriority("S1", 10, 5000)'), /multiple of 4096/);
    assert.throws(() => run('setStpMode("S1", "mst")'), /Invalid STP/);
    run('enablePortfast("S1", ["FastEthernet0/1"]); enablePortfastDefault("S1"); setStpPortCost("S1", "FastEthernet0/1", 19, 10)');
    run('configureVtp("S1", { domain: "LAB", mode: "transparent" })');
    run('configurePortSecurity("S1", "FastEthernet0/1", { maximum: 3, macs: ["0001.0001.0001"], agingTime: 10 })');
    run('recoverErrDisabled("S1", "FastEthernet0/1")');
    run('enableDhcpSnooping("S1", 10, "GigabitEthernet0/1"); enableArpInspection("S1", [10], "GigabitEthernet0/1"); setEtherChannelLoadBalance("S1", "src-dst-mac")');
    const text = commandsOf(world, "S1").join("\n");
    assert.match(text, /spanning-tree mode rapid-pvst/);
    assert.match(text, /spanning-tree vlan 10,20 root primary/);
    assert.match(text, /spanning-tree vlan 30 root secondary/);
    assert.match(text, /spanning-tree vlan 10 priority 4096/);
    assert.match(text, /spanning-tree portfast bpduguard default/);
    assert.match(text, / spanning-tree vlan 10 cost 19/);
    assert.match(text, /vtp mode transparent/);
    assert.match(text, / switchport port-security mac-address 0001\.0001\.0001/);
    assert.match(text, / switchport port-security aging time 10/);
    assert.match(text, / shutdown\n no shutdown/);
    assert.match(text, /ip arp inspection vlan 10/);
    assert.match(text, /port-channel load-balance src-dst-mac/);
});

test("routing protocols", () => {
    const { run, world } = setup();
    run('addStaticRoute("R1", "10.2.0.0/16", "10.0.0.2")');
    run('addStaticRoutes("R1", [["172.16.0.0/12", "10.0.0.2"], ["192.168.0.0", "255.255.0.0", "10.0.0.2", 10]])');
    run('removeStaticRoute("R1", "10.2.0.0/16", "10.0.0.2"); addDefaultRoute("R1", "Serial0/1/0"); addFloatingRoute("R1", "10.3.0.0/16", "10.0.0.6")');
    run('addIpv6StaticRoute("R1", "2001:db8:2::/64", "2001:db8::2"); addIpv6DefaultRoute("R1", "2001:db8::2")');
    run('configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] }); setOspfInterface("R1", "GigabitEthernet0/0", { cost: 5, processId: 1, area: 0 })');
    run('configureOspfv3("R1", { routerId: "1.1.1.1", interfaces: { "GigabitEthernet0/0": 0 } }); removeOspf("R1", 5)');
    run('configureEigrp("R2", { as: 10, networks: ["10.0.0.0/30"], redistribute: ["static"] }); configureEigrpv6("R2", { as: 10, routerId: "2.2.2.2" })');
    run('setEigrpSummary("R2", "GigabitEthernet0/0", 10, "192.168.0.0/22"); removeEigrp("R2", 20)');
    run('configureRip("R2", { networks: ["192.168.1.0/24"], passive: "GigabitEthernet0/1" }); configureRipng("R2", "RIPNG", ["GigabitEthernet0/0"]); removeRip("R2")');
    run('configureBgp("R1", { as: 65001, neighbors: [{ ip: "10.0.0.2", remoteAs: 65002, description: "ISP" }] }); removeBgp("R1", 1)');
    run('redistribute("R1", { protocol: "ospf", id: 1 }, "static"); redistribute("R2", { protocol: "eigrp", id: 10 }, "ospf 1", { metric: "10000 100 255 1 1500" }); redistribute("R2", { protocol: "rip" }, "static", { metric: 2 })');
    assert.throws(() => run('redistribute("R1", { protocol: "isis" }, "static")'), /Unknown routing protocol/);

    const r1 = commandsOf(world, "R1").join("\n");
    const r2 = commandsOf(world, "R2").join("\n");
    assert.match(r1, /ip route 10\.2\.0\.0 255\.255\.0\.0 10\.0\.0\.2/);
    assert.match(r1, /ip route 192\.168\.0\.0 255\.255\.0\.0 10\.0\.0\.2 10/);
    assert.match(r1, /no ip route 10\.2\.0\.0 255\.255\.0\.0 10\.0\.0\.2/);
    assert.match(r1, /ip route 0\.0\.0\.0 0\.0\.0\.0 Serial0\/1\/0/);
    assert.match(r1, /ip route 10\.3\.0\.0 255\.255\.0\.0 10\.0\.0\.6 200/);
    assert.match(r1, /ipv6 route ::\/0 2001:db8::2/);
    assert.match(r1, / ip ospf cost 5\n ip ospf 1 area 0/);
    assert.match(r1, /router ospf 1\n redistribute static subnets/);
    assert.match(r1, / neighbor 10\.0\.0\.2 description ISP/);
    assert.match(r2, / redistribute static/);
    assert.match(r2, / ip summary-address eigrp 10 192\.168\.0\.0 255\.255\.252\.0/);
    assert.match(r2, /router eigrp 10\n redistribute ospf 1 metric 10000 100 255 1 1500/);
    assert.match(r2, /router rip\n redistribute static metric 2/);
    assert.match(r2, / ipv6 rip RIPNG enable/);
});
