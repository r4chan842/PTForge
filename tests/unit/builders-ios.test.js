"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const { run } = loadExtension();
const j = (code) => JSON.parse(JSON.stringify(run(code)));

test("basic setup", () => {
    assert.deepEqual(j('buildBasicSetup({ hostname: "R1", secret: "class", consolePassword: "cisco", vtyPassword: "cisco", banner: "No #access", domain: "lab.local" })'), [
        "hostname R1",
        "no ip domain-lookup",
        "ip domain-name lab.local",
        "enable secret class",
        "banner motd #No access#",
        "line console 0",
        " password cisco",
        " login",
        " logging synchronous",
        "exit",
        "line vty 0 15",
        " password cisco",
        " login",
        "exit",
        "service password-encryption"
    ]);
});

test("interface ip accepts CIDR and mask", () => {
    assert.deepEqual(j('buildInterfaceIp("Gi0/0", "10.0.0.1/24")'), ["interface Gi0/0", " ip address 10.0.0.1 255.255.255.0", " no shutdown", "exit"]);
    assert.deepEqual(j('buildInterfaceIp("Gi0/1", "10.0.0.1", "255.255.255.252", "WAN")'), ["interface Gi0/1", " description WAN", " ip address 10.0.0.1 255.255.255.252", " no shutdown", "exit"]);
});

test("subinterface", () => {
    assert.deepEqual(j('buildSubinterface("Gi0/0", 10, "192.168.10.1/24")'), [
        "interface Gi0/0", " no shutdown", "exit",
        "interface Gi0/0.10", " encapsulation dot1Q 10", " ip address 192.168.10.1 255.255.255.0", "exit"
    ]);
    assert.ok(j('buildSubinterface("Gi0/0", 99, "10.99.0.1/24", null, true)').includes(" encapsulation dot1Q 99 native"));
});

test("router dhcp pool", () => {
    assert.deepEqual(j('buildRouterDhcpPool({ name: "LAN", network: "192.168.1.0/24", gateway: "192.168.1.1", dns: ["8.8.8.8", "1.1.1.1"], domain: "lab.local", excluded: [["192.168.1.1", "192.168.1.10"]] })'), [
        "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
        "ip dhcp pool LAN",
        " network 192.168.1.0 255.255.255.0",
        " default-router 192.168.1.1",
        " dns-server 8.8.8.8 1.1.1.1",
        " domain-name lab.local",
        "exit"
    ]);
});

test("static routes", () => {
    assert.equal(run('buildStaticRoute("10.2.0.0/16", "10.0.0.2")'), "ip route 10.2.0.0 255.255.0.0 10.0.0.2");
    assert.equal(run('buildStaticRoute("10.2.0.0", "255.255.0.0", "Serial0/1/0", 5)'), "ip route 10.2.0.0 255.255.0.0 Serial0/1/0 5");
    assert.equal(run('buildStaticRoute("10.2.3.4/16", "10.0.0.2", 200)'), "ip route 10.2.0.0 255.255.0.0 10.0.0.2 200");
    assert.throws(() => run('buildStaticRoute("10.0.0.0/8")'));
});

test("ospf", () => {
    assert.deepEqual(j('buildOspf({ processId: 10, routerId: "1.1.1.1", networks: ["10.0.0.0/30", { network: "192.168.1.0/24", area: 1 }], passive: "Gi0/1", defaultOriginate: true })'), [
        "router ospf 10",
        " router-id 1.1.1.1",
        " network 10.0.0.0 0.0.0.3 area 0",
        " network 192.168.1.0 0.0.0.255 area 1",
        " passive-interface Gi0/1",
        " default-information originate",
        "exit"
    ]);
});

test("ospf interface", () => {
    assert.deepEqual(j('buildOspfInterface("Gi0/0", { cost: 10, priority: 0, hello: 5, dead: 20, md5Key: "k" })'), [
        "interface Gi0/0",
        " ip ospf cost 10",
        " ip ospf priority 0",
        " ip ospf hello-interval 5",
        " ip ospf dead-interval 20",
        " ip ospf authentication message-digest",
        " ip ospf message-digest-key 1 md5 k",
        "exit"
    ]);
});

test("ospfv3", () => {
    assert.deepEqual(j('buildOspfv3({ routerId: "1.1.1.1", interfaces: ["Gi0/0"] })'), [
        "ipv6 unicast-routing", "ipv6 router ospf 1", " router-id 1.1.1.1", "exit",
        "interface Gi0/0", " ipv6 ospf 1 area 0", "exit"
    ]);
    assert.throws(() => run("buildOspfv3({})"), /routerId/);
});

test("eigrp", () => {
    assert.deepEqual(j('buildEigrp({ as: 100, networks: ["10.0.0.0/30", "192.168.1.0"], passive: ["Gi0/1"] })'), [
        "router eigrp 100",
        " network 10.0.0.0 0.0.0.3",
        " network 192.168.1.0",
        " passive-interface Gi0/1",
        " no auto-summary",
        "exit"
    ]);
    assert.throws(() => run("buildEigrp({})"), /as/);
});

test("eigrp for ipv6", () => {
    assert.deepEqual(j('buildEigrpv6({ as: 1, routerId: "2.2.2.2", interfaces: "Gi0/0" })'), [
        "ipv6 unicast-routing", "ipv6 router eigrp 1", " eigrp router-id 2.2.2.2", " no shutdown", "exit",
        "interface Gi0/0", " ipv6 eigrp 1", "exit"
    ]);
});

test("rip uses classful networks without duplicates", () => {
    assert.deepEqual(j('buildRip({ networks: ["10.1.0.0/24", "10.2.0.0/24", "172.16.5.0/24", "192.168.1.0/24"] })'), [
        "router rip", " version 2",
        " network 10.0.0.0", " network 172.16.0.0", " network 192.168.1.0",
        " no auto-summary", "exit"
    ]);
});

test("bgp", () => {
    assert.deepEqual(j('buildBgp({ as: 65001, routerId: "1.1.1.1", neighbors: [{ ip: "10.0.0.2", remoteAs: 65002 }], networks: ["192.168.1.0/24"] })'), [
        "router bgp 65001",
        " bgp router-id 1.1.1.1",
        " neighbor 10.0.0.2 remote-as 65002",
        " network 192.168.1.0 mask 255.255.255.0",
        "exit"
    ]);
});

test("hsrp", () => {
    assert.deepEqual(j('buildHsrp("Gi0/0", { group: 10, virtualIp: "192.168.1.254", priority: 150, version: 2 })'), [
        "interface Gi0/0",
        " standby version 2",
        " standby 10 ip 192.168.1.254",
        " standby 10 priority 150",
        " standby 10 preempt",
        "exit"
    ]);
    assert.throws(() => run('buildHsrp("Gi0/0", {})'), /virtualIp/);
});
