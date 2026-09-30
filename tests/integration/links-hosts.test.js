"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

test("links", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 0, 0); addDevice("R2", "2911", 0, 0); addDevice("S1", "2960-24TT", 0, 0)');
    assert.equal(run('addLink("R1", "Serial0/1/0", "R2", "Serial0/1/0", "serial")'), false);
    run('addModule("R1", "0/1", "HWIC-2T"); addModule("R2", "0/1", "HWIC-2T")');
    assert.equal(run('addLink("R1", "GigabitEthernet0/0", "R2", "GigabitEthernet0/0", "cross")'), true);
    assert.equal(run('addLink("R1", "GigabitEthernet0/0", "S1", "FastEthernet0/1")'), false);
    assert.throws(() => run('addLink("R1", "GigabitEthernet0/1", "S1", "FastEthernet0/1", "laser")'), /Unknown link type/);
    assert.throws(() => run('addLink("R1", "GigabitEthernet0/1", "NOPE", "FastEthernet0/1")'), /not found/);
    assert.deepEqual(j(run, 'addLinks([["R1", "GigabitEthernet0/1", "S1", "GigabitEthernet0/1", "straight"], ["R2", "Serial0/1/0", "R1", "Serial0/1/0", "serial"]])'), [true, true]);

    const links = j(run, "getLinks()");
    assert.equal(links.length, 3);
    assert.deepEqual(links[0], { type: "cross", from: { device: "R1", port: "GigabitEthernet0/0" }, to: { device: "R2", port: "GigabitEthernet0/0" } });
    assert.equal(links[2].type, "serial");

    assert.deepEqual(j(run, 'getNeighbors("R1")').map((n) => n.device).sort(), ["R2", "R2", "S1"]);
    assert.equal(run('isLinkUp("R1", "GigabitEthernet0/0")'), true);
    assert.equal(run('deleteLink("R1", "GigabitEthernet0/0")'), true);
    assert.equal(run('isLinkUp("R1", "GigabitEthernet0/0")'), false);
    assert.equal(run("getLinkCount()"), 2);

    run('autoConnect("R2", "S1")');
    assert.deepEqual(world.autoConnected, ["R2", "S1"]);
});

test("ipv4 host configuration", () => {
    const { run, world } = loadExtension();
    run('addDevice("PC1", "PC-PT", 0, 0); addDevice("PC2", "PC-PT", 0, 0); addDevice("L1", "Laptop-PT", 0, 0)');
    run('configurePcIp("PC1", false, "192.168.1.10", "255.255.255.0", "192.168.1.1", "8.8.8.8")');
    const port = world.devices.PC1.getPort("FastEthernet0");
    assert.equal(port.ip, "192.168.1.10");
    assert.equal(port.mask, "255.255.255.0");
    assert.equal(port.gateway, "192.168.1.1");
    assert.equal(port.dns, "8.8.8.8");
    assert.equal(world.devices.PC1.dhcp, false);

    run('setPcStatic("PC2", "10.0.0.5/26", "10.0.0.1")');
    assert.equal(world.devices.PC2.getPort("FastEthernet0").mask, "255.255.255.192");

    run('configurePcIp("PC2", false, "10.0.0.6", 30)');
    assert.equal(world.devices.PC2.getPort("FastEthernet0").mask, "255.255.255.252");

    run('setPcDhcp("PC1")');
    assert.equal(world.devices.PC1.dhcp, true);
    run('configurePcIp("PC1", false)');
    assert.equal(world.devices.PC1.dhcp, false);

    assert.deepEqual(j(run, 'getPcIp("PC2")'), {
        port: "FastEthernet0", dhcp: false, ip: "10.0.0.6", mask: "255.255.255.252", gateway: "10.0.0.1", dns: null,
        mac: "0001.0001.0001", ipv6: null, ipv6Prefix: null, linkLocal: null, ipv6Gateway: null, ipv6Dns: null, up: false
    });
    run('configurePcIpv6("PC2", { address: "2001:db8::10/64", gateway: "2001:db8::1" })');
    const v6 = j(run, 'getPcIp("PC2")');
    assert.equal(v6.ipv6, "2001:db8::10");
    assert.equal(v6.ipv6Prefix, 64);
    assert.equal(v6.ipv6Gateway, "2001:db8::1");
    assert.equal(j(run, 'getPcIp("PC1")').dns, "8.8.8.8");
    assert.throws(() => run('configurePcIp("PC1", false, "10.0.0.1", "255.255.255.0", null, null, "Gig7")'), /Port not found/);
    assert.throws(() => run('configurePcIp("PC1", false, "10.0.0.999", 24)'), /Invalid IPv4/);

    run('configurePcIp("L1", false, "172.16.0.9/16", null, "172.16.0.1", null, "Wireless0")');
    assert.equal(world.devices.L1.getPort("Wireless0").ip, "172.16.0.9");

    run('setHostFirewall("PC1", true)');
    assert.equal(world.devices.PC1.getPort("FastEthernet0").firewall, true);
    run('runHostCommand("PC1", "ipconfig")');
    assert.deepEqual(world.devices.PC1.hostCommands, ["ipconfig"]);
});

test("ipv6 host configuration", () => {
    const { run, world } = loadExtension();
    run('addDevice("PC1", "PC-PT", 0, 0)');
    run('configurePcIpv6("PC1", { address: "2001:db8:1::10/64", gateway: "fe80::1", dns: "2001:db8::53", linkLocal: "fe80::10", autoConfig: false })');
    const port = world.devices.PC1.getPort("FastEthernet0");
    assert.equal(port.ipv6Enabled, true);
    assert.deepEqual(port.ipv6[0], { ip: "2001:db8:1::10", prefix: 64, type: 0, dup: false });
    assert.equal(port.gateway6, "fe80::1");
    assert.equal(port.dns6, "2001:db8::53");
    assert.equal(port.linkLocal, "fe80::10");
    assert.throws(() => run('configurePcIpv6("PC1", { address: "2001::1", type: "weird" })'), /Unknown IPv6/);
    run('clearPcIpv6("PC1")');
    assert.equal(port.ipv6.length, 0);
    run('disablePcIpv6("PC1")');
    assert.equal(port.ipv6Enabled, false);
});
