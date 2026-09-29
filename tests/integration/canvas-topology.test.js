"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));
const kinds = (world, kind) => Object.values(world.canvas).filter((i) => i.kind === kind);

test("notes and popups", () => {
    const { run, world } = loadExtension();
    const id = run('addNote(10.4, 20.6, "hello")');
    assert.equal(world.canvas[id].x, 10);
    assert.equal(world.canvas[id].y, 21);
    assert.equal(world.canvas[id].layer, 7);
    assert.equal(run(`setNoteText(${JSON.stringify(id)}, "bye")`), true);
    assert.equal(run(`getNoteText(${JSON.stringify(id)})`), "bye");
    assert.equal(run('findNote("bye")'), id);
    assert.equal(run('findNote("none")'), null);
    assert.equal(j(run, "getNotes()").length, 1);
    const popup = run('addTextPopup(1, 2, "tip")');
    assert.equal(run(`removeTextPopup(${JSON.stringify(popup)})`), true);
    assert.equal(run("removeNotes()"), 1);
});

test("shapes use integers and colors", () => {
    const { run, world } = loadExtension();
    run('drawLine(0.5, 0, 100.2, 50, "#ff0000", 3)');
    const line = kinds(world, "line")[0];
    assert.deepEqual(line.rgb, [255, 0, 0]);
    assert.equal(line.w, 3);
    run('drawCircle(50, 50, 30.7, "green")');
    assert.equal(kinds(world, "circle")[0].radius, 31);
    assert.equal(j(run, 'drawRect(0, 0, 100, 50, "blue")').length, 4);
    assert.equal(j(run, "drawPolyline([[0,0],[10,0],[10,10]], 'red', 1, true)").length, 3);
    assert.ok(j(run, 'drawDashedLine(0, 0, 120, 0, "gray", 1, 10)').length >= 5);
    assert.equal(j(run, 'drawArrow(0, 0, 100, 100, "black")').length, 3);
    const zone = j(run, 'drawZone(10, 10, 200, 100, "VLAN 10", "green")');
    assert.equal(zone.length, 5);
    assert.equal(world.canvas[zone[4]].text, "VLAN 10");
});

test("zones around devices", () => {
    const { run, world } = loadExtension();
    run('addDevice("A", "PC-PT", 100, 100); addDevice("B", "PC-PT", 300, 200)');
    const ids = j(run, 'drawZoneAround(["A", "B"], "Office", "orange", 20)');
    assert.equal(ids.length, 5);
    const top = world.canvas[ids[0]];
    assert.equal(top.x1, 80);
    assert.equal(top.y1, 80);
    assert.equal(top.x2, 360);
    assert.throws(() => run("drawZoneAround([])"), /at least one device/);
});

test("item management", () => {
    const { run, world } = loadExtension();
    const ids = j(run, 'drawRect(0, 0, 10, 10, "red")');
    run(`moveItem(${JSON.stringify(ids)}, 5, 5)`);
    assert.equal(world.canvas[ids[0]].x, 5);
    run(`setItemPosition(${JSON.stringify(ids[0])}, 50, 60)`);
    assert.deepEqual(j(run, `getItemPosition(${JSON.stringify(ids[0])})`), { x: 50, y: 60 });
    assert.equal(j(run, `getLineData(${JSON.stringify(ids[1])})`).x1, 10);
    assert.equal(j(run, 'getRectData("x")').text, "zone");
    assert.deepEqual(j(run, 'getEllipseData("x")'), ["1", "2"]);
    assert.deepEqual(j(run, 'getPolygonData("x")'), ["3", "4"]);
    assert.equal(j(run, "getCanvasItems()").lines.length, 4);
    assert.equal(run(`removeItem(${JSON.stringify(ids.slice(0, 2))})`), true);
    run('addNote(0, 0, "n")');
    assert.equal(run("clearCanvas()"), 3);
    run('drawLine(0, 0, 1, 1)');
    assert.equal(run("clearLayer()"), true);
    assert.equal(Object.keys(world.canvas).length, 0);
});

test("layers", () => {
    const { run, world } = loadExtension();
    run("useLayer(3)");
    const id = run('addNote(0, 0, "x")');
    assert.equal(world.canvas[id].layer, 3);
    assert.equal(run("newLayer()"), 7);
    const other = run('addNote(0, 0, "y", 9)');
    assert.equal(world.canvas[other].layer, 9);
});

test("labels", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 100, 100); addDevice("PC1", "PC-PT", 300, 100)');
    run('configurePcIp("PC1", false, "10.0.0.10/24")');
    const a = run('labelDevice("R1")');
    assert.equal(world.canvas[a].text, "R1");
    assert.equal(world.canvas[a].y, 70);
    const b = run('labelWithIp("PC1", "FastEthernet0")');
    assert.equal(world.canvas[b].text, "PC1\n10.0.0.10/24");
    assert.deepEqual(Object.keys(j(run, 'labelDevices({ R1: "Edge" }, 50)')), ["R1"]);
    const all = j(run, 'labelAllDevices(function (n) { return "[" + n + "]"; })');
    assert.equal(world.canvas[all.PC1].text, "[PC1]");
    const mid = run('labelLink("R1", "PC1", "1 Gbps")');
    assert.equal(world.canvas[mid].x, 220);
});

test("layout helpers", () => {
    const { run, world } = loadExtension();
    assert.deepEqual(j(run, "gridPositions(4, { x: 0, y: 0, gapX: 10, gapY: 10 })"), [[0, 0], [10, 0], [0, 10], [10, 10]]);
    assert.deepEqual(j(run, "circlePositions(4, 0, 0, 10)"), [[0, -10], [10, 0], [0, 10], [-10, 0]]);
    assert.deepEqual(j(run, "rowPositions(3, 50, 0, 20)"), [[0, 50], [20, 50], [40, 50]]);
    run('addDevice("A", "PC-PT", 0, 0); addDevice("B", "PC-PT", 0, 0)');
    run('arrangeGrid(["A", "B"], { x: 10, y: 10, gapX: 50 })');
    assert.equal(world.devices.B.x, 60);
    run('arrangeCircle(["A", "B"], 100, 100, 50)');
    assert.equal(world.devices.A.x, 80);
});

test("generators", () => {
    const { run, world } = loadExtension();
    const star = j(run, 'buildStar({ count: 3 })');
    assert.deepEqual(star.leaves, ["PC1", "PC2", "PC3"]);
    assert.equal(world.links.length, 3);

    const ring = j(run, 'buildRing({ count: 3, prefix: "RR" })');
    assert.deepEqual(ring, ["RR1", "RR2", "RR3"]);
    assert.equal(world.links.length, 6);

    j(run, 'buildLine({ count: 3, prefix: "L" })');
    assert.equal(world.links.length, 8);

    j(run, 'buildFullMesh({ count: 4, prefix: "M" })');
    assert.equal(world.links.length, 14);
    assert.throws(() => run('buildFullMesh({ count: 5, prefix: "N" })'), /needs 4 ports/);

    const lan = j(run, 'buildLan({ switchName: "SW", hosts: 2, hostPrefix: "H", network: "10.1.1.0/24" })');
    assert.deepEqual(lan.hosts, ["H1", "H2"]);
    assert.equal(world.devices.H1.getPort("FastEthernet0").ip, "10.1.1.10");
    assert.equal(world.devices.H2.getPort("FastEthernet0").gateway, "10.1.1.1");
});

test("addressing", () => {
    const { run, world } = loadExtension();
    run('addDevice("A", "PC-PT", 0, 0); addDevice("B", "PC-PT", 0, 0)');
    assert.deepEqual(j(run, 'addressHosts(["A", "B"], "192.168.5.0/24", { startAt: 1, dns: "8.8.8.8" })'), { A: "192.168.5.2", B: "192.168.5.3" });
    assert.equal(world.devices.A.getPort("FastEthernet0").dns, "8.8.8.8");

    const plan = j(run, 'planSubnets("192.168.0.0/24", { small: 10, big: 100, mid: 50, p2p: 2 })');
    assert.equal(plan.big.network, "192.168.0.0/25");
    assert.equal(plan.mid.network, "192.168.0.128/26");
    assert.equal(plan.small.network, "192.168.0.192/28");
    assert.equal(plan.p2p.network, "192.168.0.208/30");
    assert.equal(plan.big.gateway, "192.168.0.1");
    assert.equal(plan.mid.usable, 62);
    assert.throws(() => run('planSubnets("10.0.0.0/28", { a: 100 })'), /Not enough space/);

    assert.deepEqual(j(run, 'pointToPointLinks("10.0.0.0/24", 2)'), [
        { network: "10.0.0.0/30", a: "10.0.0.1", b: "10.0.0.2", mask: "255.255.255.252" },
        { network: "10.0.0.4/30", a: "10.0.0.5", b: "10.0.0.6", mask: "255.255.255.252" }
    ]);
});
