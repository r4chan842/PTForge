"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

test("adds, renames, moves and removes devices", () => {
    const { run, world } = loadExtension();
    assert.equal(run('addDevice("R1", "2911", 100, 100)'), true);
    assert.equal(world.devices.R1.booted, true);
    assert.throws(() => run('addDevice("R1", "2911", 0, 0)'), /already in use/);
    assert.throws(() => run('addDevice("X", "NoSuchModel", 0, 0)'), /Unknown device model/);

    run('renameDevice("R1", "EDGE")');
    assert.ok(world.devices.EDGE);
    assert.throws(() => run('renameDevice("Missing", "A")'), /not found/);

    run('moveDevice("EDGE", 300, 200)');
    assert.deepEqual(j(run, 'getDevicePosition("EDGE")'), { x: 300, y: 200, centerX: 320, centerY: 220 });
    run('moveDeviceBy("EDGE", 10, -10)');
    assert.equal(world.devices.EDGE.x, 310);

    assert.equal(run('removeDevice("EDGE")'), true);
    assert.equal(run("getDeviceCount()"), 0);
});

test("bulk add and filters", () => {
    const { run } = loadExtension();
    run('addDevices([["R1", "2911", 0, 0], ["S1", "2960-24TT", 0, 0], ["S2", "2960-24TT", 0, 0], ["PC1", "PC-PT", 0, 0], ["ML1", "3560-24PS", 0, 0]])');
    assert.deepEqual(j(run, 'getDevices("switch")'), ["S1", "S2"]);
    assert.deepEqual(j(run, 'getDevices(["router", "multilayerswitch"])'), ["R1", "ML1"]);
    assert.deepEqual(j(run, 'getDevices(null, "S")'), ["S1", "S2"]);
    assert.deepEqual(j(run, "getDevices(8)"), ["PC1"]);
    assert.throws(() => run('getDevices("toaster")'), /Unknown device type/);
    assert.equal(run('getDeviceModel("S1")'), "2960-24TT");
    assert.equal(run('getDeviceType("PC1")'), 8);
    assert.equal(run('removeDevice(["S1", "S2"])'), true);
    assert.deepEqual(j(run, "getDevices()"), ["R1", "PC1", "ML1"]);
});

test("power and modules restore state", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "1941", 0, 0)');
    assert.equal(run('addModule("R1", "0/0", "HWIC-2T")'), true);
    assert.equal(world.devices.R1.modules["0/0"], "HWIC-2T");
    assert.equal(world.devices.R1.power, true);
    assert.equal(run('removeModule("R1", "0/0")'), true);
    assert.throws(() => run('addModule("R1", "0/0", "FAKE")'), /Unknown module/);

    run('setPower("R1", false)');
    assert.equal(run('getPower("R1")'), false);
    run('addModule("R1", "0/1", "WIC-2T")');
    assert.equal(world.devices.R1.power, false);
    run('restartDevice("R1")');
    assert.equal(world.devices.R1.power, true);
    assert.deepEqual(j(run, 'addModules("R1", { "0/0": "HWIC-2T", "0/1": "WIC-2T" })'), [true, true]);
    assert.deepEqual(j(run, 'getSupportedModules("R1")'), ["HWIC-2T", "NIM-2T"]);
});

test("ports and device info", () => {
    const { run } = loadExtension();
    run('addDevice("S1", "2960-24TT", 0, 0); addDevice("PC1", "PC-PT", 0, 0)');
    run('addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight")');
    const ports = j(run, 'getPorts("S1")');
    assert.equal(ports.length, 27);
    const free = j(run, 'getFreePorts("S1", "FastEthernet")');
    assert.equal(free.length, 23);
    assert.ok(!free.includes("FastEthernet0/1"));

    const info = j(run, 'getPortInfo("S1", "FastEthernet0/1")');
    assert.equal(info.up, true);
    assert.equal(info.connectedTo, "FastEthernet0");
    assert.throws(() => run('getPortInfo("S1", "Gig9/9")'), /Port not found/);

    const device = j(run, 'getDeviceInfo("PC1")');
    assert.equal(device.model, "PC-PT");
    assert.equal(device.ports[0].name, "FastEthernet0");

    run('setPortDescription("S1", "FastEthernet0/2", "uplink"); setPortSpeed("S1", "FastEthernet0/2", 100, true); setPortSpeed("S1", "FastEthernet0/3", "auto", "auto"); setPortPower("S1", "FastEthernet0/4", false); setPortClockRate("S1", "FastEthernet0/5", 64000); setPortMac("S1", "FastEthernet0/6", "0001.0002.0003")');
    assert.equal(run('getPortInfo("S1", "FastEthernet0/2").description'), "uplink");
});

test("custom variables and images", () => {
    const { run, world } = loadExtension();
    run('addDevice("PC1", "PC-PT", 0, 0)');
    run('setCustomVar("PC1", "owner", "lab")');
    assert.equal(run('getCustomVar("PC1", "owner")'), "lab");
    assert.equal(run('getCustomVar("PC1", "none")'), null);
    assert.deepEqual(j(run, 'getCustomVars("PC1")'), { owner: "lab" });
    assert.equal(run('removeCustomVar("PC1", "owner")'), true);
    run('setDeviceImage("PC1", "a.png", "b.png")');
    assert.equal(world.devices.PC1.logicalImage, "a.png");
    run('setDeviceTime("PC1", 2026, 9, 29)');
    assert.deepEqual(world.devices.PC1.time, [2026, 9, 29, 0, 0, 0]);
    assert.equal(run('movePhysical("PC1", 1, 2)'), true);
    assert.equal(run('movePhysicalBy("PC1", 1, 2)'), true);
});
