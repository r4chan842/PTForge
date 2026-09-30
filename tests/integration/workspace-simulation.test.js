"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension, commandsOf } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

test("view and background", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 0, 0)');
    run("zoomIn()");
    assert.equal(world.zoom, "in");
    run("zoomOut(); zoomReset()");
    assert.equal(world.zoom, "reset");
    assert.equal(run("getZoom()"), 100);
    run('centerOn("R1")');
    assert.equal(world.center, "R1");
    assert.throws(() => run('centerOn("NOPE")'), /not found/);
    run("centerOn(10, 20)");
    assert.deepEqual(world.center, [10, 20]);
    run('setBackground("C:/map.png", true)');
    assert.deepEqual(world.background, ["C:/map.png", true]);
    assert.deepEqual(j(run, "devicesInArea(0, 0, 10, 10)"), ["R1"]);
    assert.equal(run("getPacketTracerVersion()"), "8.2.2.0400");
});

test("clear topology", () => {
    const { run, world } = loadExtension();
    run('addDevice("A", "PC-PT", 0, 0); addDevice("B", "PC-PT", 0, 0); addNote(0, 0, "x")');
    assert.equal(run("clearTopology()"), 2);
    assert.equal(world.order.length, 0);
    assert.equal(Object.keys(world.canvas).length, 0);
});

test("remote networks", () => {
    const { run, world } = loadExtension();
    const name = run("addRemoteNetwork(100, 200)");
    assert.deepEqual(world.remote[name], [100, 200]);
    assert.equal(run(`moveRemoteNetwork(${JSON.stringify(name)}, 5, 5)`), true);
    assert.equal(run(`removeRemoteNetwork(${JSON.stringify(name)})`), true);
    assert.equal(run('moveRemoteNetwork("ghost", 1, 1)'), false);
});

test("project files", () => {
    const { run, world } = loadExtension();
    assert.equal(run("newProject()"), true);
    run("saveProject()");
    run('saveProjectAs("C:/labs/a.pkt")');
    run('openProject("C:/labs/b.pkt")');
    assert.deepEqual(world.files, [["new", false], ["save"], ["saveAs", "C:/labs/a.pkt", false], ["open", "C:/labs/b.pkt"]]);
    assert.throws(() => run('saveProjectAs("")'), /path/);
    assert.equal(run("getDefaultSaveFolder()"), "C:/Users/lab/Documents");
});

test("simulation", () => {
    const { run, world } = loadExtension();
    run('addDevice("PC1", "PC-PT", 0, 0); addDevice("PC2", "PC-PT", 0, 0); addDevice("R1", "2911", 0, 0)');
    run("setSimulationMode()");
    assert.equal(run("isSimulationMode()"), true);
    run("stepForward(3); stepBack()");
    assert.equal(world.simulation.steps, 2);
    run("resetSimulation(); playSimulation()");
    assert.equal(world.simulation.steps, 0);
    assert.equal(world.simulation.playing, true);
    run('setSimulationFilter("icmp")');
    assert.deepEqual(world.simulation.filter, ["ICMP", true]);
    run("showAllSimulationFilters()");
    assert.equal(world.simulation.filter, "all");
    assert.equal(run("getSimulationTime()"), 1234);
    assert.equal(run("getSimulationEventCount()"), 5);
    run('addSimplePdu("PC1", "PC2")');
    assert.deepEqual(world.pdus, [["PC1", "PC2"]]);
    assert.throws(() => run('addSimplePdu("PC1", "NOPE")'), /not found/);
    run("firePdu(); deletePdu(0)");
    assert.equal(world.pdus.length, 0);
    run("setSimulationMode(false)");
    assert.equal(run("isSimulationMode()"), false);
});

test("ping and traceroute", () => {
    const { run, world } = loadExtension();
    run('addDevice("PC1", "PC-PT", 0, 0); addDevice("R1", "2911", 0, 0)');
    run('ping("PC1", "10.0.0.1"); ping("PC1", "10.0.0.1", 2); traceroute("PC1", "8.8.8.8")');
    assert.deepEqual(world.devices.PC1.hostCommands, ["ping 10.0.0.1", "ping -n 2 10.0.0.1", "tracert 8.8.8.8"]);
    assert.equal(run('ping("R1", "10.0.0.2", 10).state'), "pending");
    run('traceroute("R1", "10.0.0.2")');
    world.flushLines();
    assert.deepEqual(world.devices.R1.lineCommands, ["ping 10.0.0.2 repeat 10", "traceroute 10.0.0.2"]);
    assert.deepEqual(j(run, 'pingAll("R1", ["1.1.1.1", "2.2.2.2"])').targets, ["1.1.1.1", "2.2.2.2"]);
});

test("ping and traceroute report through onDone", () => {
    const { run, world, ctx } = loadExtension();
    run('addDevice("R1", "2911", 0, 0)');
    world.respond = (device, cmd, mode) => mode !== "line" ? undefined : /^traceroute/.test(cmd)
        ? "Tracing the route to 10.0.0.9\n  1   10.0.0.2   1 msec 0 msec 1 msec\n  2   *    *    *\n  3   10.0.0.9   2 msec 3 msec 2 msec"
        : "!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/3 ms";
    const got = [];
    ctx.__done = (r) => got.push(JSON.parse(r));
    run('ping("R1", "10.0.0.9", 0, function (r) { __done(JSON.stringify(r)); }); traceroute("R1", "10.0.0.9", function (r) { __done(JSON.stringify(r)); })');
    assert.equal(got.length, 0);
    world.flushLines();
    assert.equal(got.length, 2);
    assert.equal(got[0].state, "ok");
    assert.equal(got[0].percent, 100);
    assert.equal(got[0].target, "10.0.0.9");
    assert.deepEqual(got[1].hops.map((h) => [h.hop, h.ip, h.timeout]), [[1, "10.0.0.2", false], [2, null, true], [3, "10.0.0.9", false]]);
    assert.deepEqual(got[1].hops[2].times, [2, 3, 2]);
    assert.equal(world.devices.R1.getCommandLine().listeners.length, 0);
});

test("events", () => {
    const { run, world } = loadExtension();
    run('var seen = []; var id = onWorkspaceEvent("deviceAdded", function (args) { seen.push(args); })');
    assert.equal(world.events.length, 1);
    world.events[0].fn(null, { name: "R9" });
    assert.equal(run("seen.length"), 1);
    world.events[0].fn(null, null);
    run('onWorkspaceEvent("linkCreated", function () { throw new Error("boom"); })');
    world.events[1].fn(null, {});
    assert.throws(() => run('onWorkspaceEvent("explode", function () {})'), /Unsupported event/);
    assert.equal(run("offWorkspaceEvent(id)"), true);
    assert.equal(run("offWorkspaceEvent(id)"), false);
    assert.equal(run("offAllEvents()"), 1);
    assert.equal(world.events.length, 0);
});
