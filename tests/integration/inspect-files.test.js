"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

function json(run, code) {
    return JSON.parse(run("JSON.stringify(" + code + ")"));
}

function lab() {
    const ext = loadExtension();
    ext.run('addDevice("S1", "2960-24TT", 0, 0); addDevice("S2", "2960-24TT", 0, 0); addDevice("R1", "2911", 0, 0); addDevice("PC1", "PC-PT", 0, 0)');
    return ext;
}

test("switchport info and table", () => {
    const { run, world } = lab();
    world.devices.S1.ports.find((p) => p.name === "FastEthernet0/3").accessVlan = 20;
    const info = json(run, 'getSwitchportInfo("S1", "FastEthernet0/3")');
    assert.equal(info.accessVlan, 20);
    assert.equal(info.access, true);
    assert.equal(json(run, 'getSwitchportTable("S1")').length, 26);
    assert.throws(() => run('getSwitchportInfo("R1", "GigabitEthernet0/0")'), /Not a switch port/);
});

test("port security status and violations", () => {
    const { run, world } = lab();
    const port = world.devices.S1.ports.find((p) => p.name === "FastEthernet0/5");
    port.security.enabled = true;
    port.security.violations = 3;
    assert.equal(json(run, 'getPortSecurityStatus("S1", "FastEthernet0/5")').enabled, true);
    assert.deepEqual(json(run, 'findSecurityViolations("S1")'), [{ port: "FastEthernet0/5", violations: 3 }]);
});

test("cdp per port", () => {
    const { run, world } = lab();
    run('setPortCdp("S1", "FastEthernet0/1", false)');
    assert.equal(world.devices.S1.ports.find((p) => p.name === "FastEthernet0/1").cdp, false);
});

test("vlans from the vlan manager", () => {
    const { run, world } = lab();
    world.devices.S1.vlans.push([10, "SALES"]);
    assert.deepEqual(json(run, 'getVlans("S1")').map((v) => v.id), [1, 1002, 10]);
    assert.equal(run('hasVlan("S1", 10)'), true);
    assert.equal(run('hasVlan("S1", "30")'), false);
    assert.throws(() => run('getVlans("PC1")'), /not available/);
});

test("spanning tree and root bridge", () => {
    const { run } = lab();
    assert.equal(json(run, 'getStpInfo("S1")').isRoot, true);
    assert.equal(json(run, 'getStpInfo("S2", 1)').rootPort, "GigabitEthernet0/1");
    assert.equal(run('findRootBridge()'), "S1");
    assert.throws(() => run('getStpInfo("S1", 99)'), /No spanning tree/);
});

test("vtp, static mac, ospf and eigrp state", () => {
    const { run, world } = lab();
    assert.equal(json(run, 'getVtpInfo("S1")').domain, "LAB");
    assert.equal(run('addStaticMac("S1", "0001.aaaa.bbbb", 10, "FastEthernet0/2")'), true);
    assert.deepEqual(world.devices.S1.macs, [["0001.aaaa.bbbb", 10, "FastEthernet0/2"]]);
    assert.equal(run('removeStaticMac("S1", "0001.aaaa.bbbb", 10, "FastEthernet0/2")'), true);
    assert.throws(() => run('addStaticMac("S1", "0001.aaaa.bbbb", 10, "Fa0/2")'), /not found/i);
    assert.equal(json(run, 'getOspfInfo("R1")')[0].routerId, "1.1.1.1");
    assert.equal(json(run, 'getEigrpInfo("R1")')[0].as, 100);
});

test("command log", () => {
    const { run, world } = lab();
    run("setCommandLogging(true)");
    assert.equal(run("isCommandLogging()"), true);
    world.log.entries.push(["R1", "show ip route"], ["S1", "show vlan"]);
    assert.equal(json(run, 'getCommandLog("R1")')[0].command, "show ip route");
    assert.equal(json(run, "getCommandLog()").length, 2);
    run("clearCommandLog()");
    assert.equal(json(run, "getCommandLog()").length, 0);
});

test("text files, script files and exports", () => {
    const { run, world } = lab();
    assert.equal(run('writeTextFile("C:/lab/a.txt", "hello")'), true);
    assert.equal(run('readTextFile("C:/lab/a.txt")'), "hello");
    assert.equal(run('fileExists("C:/lab/a.txt")'), true);
    assert.throws(() => run('readTextFile("C:/none.txt")'), /File not found/);
    world.fs["C:/lab/build.js"] = 'addDevice("R9", "2911", 5, 5);';
    run('runScriptFile("C:/lab/build.js")');
    assert.ok(world.devices.R9);
    const data = json(run, 'exportTopology("C:/lab/topo.json")');
    assert.equal(data.devices.length, 5);
    assert.ok(JSON.parse(world.fs["C:/lab/topo.json"]).links);
    const paths = json(run, 'exportConfigs("C:/lab/configs", ["R1"])');
    assert.deepEqual(paths, ["C:/lab/configs/R1.txt"]);
    assert.equal(world.fs["C:/lab/configs"], "<dir>");
    assert.equal(run('deleteFile("C:/lab/a.txt")'), true);
});

test("output goes to the editor when it is open", () => {
    const { run, ctx, world } = lab();
    const sent = [];
    ctx.extension = { editor: { webviewId: "w1", webview: { evaluateJavaScriptAsync: (js) => sent.push(js) } } };
    run('showResult({ a: 1 }); log("step")');
    assert.equal(world.messages.length, 0);
    assert.equal(sent.length, 2);
    assert.match(sent[0], /receiveOutput\(\{"kind":"result"/);
    ctx.extension = null;
    run('showResult("x")');
    assert.equal(world.messages.length, 1);
});
