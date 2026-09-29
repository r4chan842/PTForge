"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const { run } = loadExtension();
const j = (code) => JSON.parse(JSON.stringify(run(code)));

test("vlans from object and array", () => {
    assert.deepEqual(j('buildVlans({ 10: "SALES", 20: "IT" })'), ["vlan 10", " name SALES", "exit", "vlan 20", " name IT", "exit"]);
    assert.deepEqual(j("buildVlans([30, 40])"), ["vlan 30", "exit", "vlan 40", "exit"]);
});

test("access ports with options", () => {
    assert.deepEqual(j('buildAccessPorts(["Fa0/1"], 10, { voiceVlan: 150, portfast: true, bpduguard: true })'), [
        "interface Fa0/1",
        " switchport mode access",
        " switchport access vlan 10",
        " switchport voice vlan 150",
        " spanning-tree portfast",
        " spanning-tree bpduguard enable",
        " no shutdown",
        "exit"
    ]);
});

test("svi", () => {
    assert.deepEqual(j('buildSvi(99, "10.99.0.2/24")'), ["interface Vlan99", " ip address 10.99.0.2 255.255.255.0", " no shutdown", "exit"]);
});

test("trunk ports", () => {
    assert.deepEqual(j('buildTrunkPorts("Gi0/1", [10, 20], 99, { encapsulation: "dot1q", nonegotiate: true })'), [
        "interface Gi0/1",
        " switchport trunk encapsulation dot1q",
        " switchport mode trunk",
        " switchport trunk allowed vlan 10,20",
        " switchport trunk native vlan 99",
        " switchport nonegotiate",
        " no shutdown",
        "exit"
    ]);
    assert.deepEqual(j('buildTrunkPorts("Gi0/2")'), ["interface Gi0/2", " switchport mode trunk", " no shutdown", "exit"]);
});

test("etherchannel trunk", () => {
    assert.deepEqual(j('buildEtherChannel(1, ["Fa0/1", "Fa0/2"], "active", { trunk: true, allowedVlans: [10, 20] })'), [
        "interface Fa0/1", " switchport mode trunk", " channel-group 1 mode active", " no shutdown", "exit",
        "interface Fa0/2", " switchport mode trunk", " channel-group 1 mode active", " no shutdown", "exit",
        "interface Port-channel1", " switchport mode trunk", " switchport trunk allowed vlan 10,20", " no shutdown", "exit"
    ]);
});

test("etherchannel layer 3", () => {
    const out = j('buildEtherChannel(2, "Gi0/1", "on", { address: "10.0.0.1/30" })');
    assert.deepEqual(out, [
        "interface Gi0/1", " no switchport", " channel-group 2 mode on", " no shutdown", "exit",
        "interface Port-channel2", " no switchport", " ip address 10.0.0.1 255.255.255.252", " no shutdown", "exit"
    ]);
    assert.throws(() => run('buildEtherChannel(1, "Fa0/1", "turbo")'), /Invalid/);
});

test("vtp", () => {
    assert.deepEqual(j('buildVtp({ domain: "LAB", mode: "client", password: "p", version: 2 })'), ["vtp domain LAB", "vtp mode client", "vtp password p", "vtp version 2"]);
    assert.throws(() => run('buildVtp({ mode: "master" })'));
});

test("port security", () => {
    assert.deepEqual(j('buildPortSecurity("Fa0/5", { maximum: 2, violation: "restrict" })'), [
        "interface Fa0/5",
        " switchport mode access",
        " switchport port-security",
        " switchport port-security maximum 2",
        " switchport port-security violation restrict",
        " switchport port-security mac-address sticky",
        "exit"
    ]);
    assert.throws(() => run('buildPortSecurity("Fa0/5", { violation: "explode" })'));
});

test("dhcp snooping", () => {
    assert.deepEqual(j('buildDhcpSnooping([10, 20], "Gi0/1", { untrusted: ["Fa0/1"], rateLimit: 10, option82: false })'), [
        "ip dhcp snooping",
        "ip dhcp snooping vlan 10,20",
        "no ip dhcp snooping information option",
        "interface Gi0/1", " ip dhcp snooping trust", "exit",
        "interface Fa0/1", " ip dhcp snooping limit rate 10", "exit"
    ]);
});
