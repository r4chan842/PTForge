"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

function json(run, code) {
    return JSON.parse(run("JSON.stringify(" + code + ")"));
}

const configs = {
    R1: "Building configuration...\n\nCurrent configuration : 812 bytes\n!\nhostname R1\n!\ninterface GigabitEthernet0/0\n ip address 10.0.0.1 255.255.255.0\n!\nend\n"
};

function lab() {
    const ext = loadExtension();
    ext.attachEditor();
    ext.world.respond = (device, cmd) => {
        if (cmd === "show running-config") return configs[device] || "";
        if (/^ping /.test(cmd)) return ext.world.pingReply ? ext.world.pingReply(device, cmd) : undefined;
        return undefined;
    };
    ext.run([
        'addDevice("R1", "2911", 0, 0)',
        'addDevice("S1", "2960-24TT", 100, 0)',
        'addDevice("PC1", "PC-PT", 200, 0)',
        'addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight")',
        'addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight")'
    ].join(";"));
    const r1 = ext.world.devices.R1.ports.find((p) => p.name === "GigabitEthernet0/0");
    r1.ip = "10.0.0.1";
    r1.mask = "255.255.255.0";
    const pc = ext.world.devices.PC1.ports.find((p) => p.name === "FastEthernet0");
    pc.ip = "10.0.0.10";
    pc.mask = "255.255.255.0";
    return ext;
}

test("config lines drop the header noise", () => {
    const ext = lab();
    const state = json(ext.run, "captureState()");
    const r1 = state.devices.find((d) => d.name === "R1");
    assert.deepEqual(r1.config, ["hostname R1", "interface GigabitEthernet0/0", " ip address 10.0.0.1 255.255.255.0", "end"]);
    assert.equal(r1.ports.find((p) => p.name === "GigabitEthernet0/0").ip, "10.0.0.1/24");
    assert.deepEqual(state.links, ["PC1 FastEthernet0 <-> S1 FastEthernet0/1", "R1 GigabitEthernet0/0 <-> S1 GigabitEthernet0/1"]);
    assert.equal(state.devices.find((d) => d.name === "PC1").config.length, 0);
});

test("line diff keeps order and marks changes", () => {
    const ext = lab();
    assert.deepEqual(json(ext.run, 'diffLines(["a", "b", "c", "d"], ["a", "x", "c", "d", "e"])'), [
        { op: " ", text: "a" }, { op: "-", text: "b" }, { op: "+", text: "x" }, { op: " ", text: "c" }, { op: " ", text: "d" }, { op: "+", text: "e" }
    ]);
    assert.deepEqual(json(ext.run, "diffLines([], [])"), []);
    assert.deepEqual(json(ext.run, 'diffLines(["same"], ["same"])'), [{ op: " ", text: "same" }]);
});

test("snapshots find address, config, device and link changes", () => {
    const ext = lab();
    assert.equal(json(ext.run, 'takeSnapshot("before")'), "before");
    assert.equal(json(ext.run, "takeSnapshot()"), "snapshot-2");
    configs.R1 = configs.R1.replace("10.0.0.1 255.255.255.0", "10.0.0.2 255.255.255.0") + "router ospf 1\n";
    ext.world.devices.R1.ports.find((p) => p.name === "GigabitEthernet0/0").ip = "10.0.0.2";
    ext.run('addDevice("PC2", "PC-PT", 300, 0); addLink("S1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight")');
    const diff = json(ext.run, 'compareSnapshots("before")');
    assert.equal(diff.from, "before");
    assert.equal(diff.to, "current");
    assert.deepEqual(diff.devicesAdded, ["PC2"]);
    assert.deepEqual(diff.linksAdded, ["PC2 FastEthernet0 <-> S1 FastEthernet0/2"]);
    assert.deepEqual(diff.addressChanges, [{ device: "R1", port: "GigabitEthernet0/0", before: "10.0.0.1/24", after: "10.0.0.2/24" }]);
    assert.deepEqual(diff.configChanges[0].removed, [" ip address 10.0.0.1 255.255.255.0"]);
    assert.deepEqual(diff.configChanges[0].added, [" ip address 10.0.0.2 255.255.255.0", "router ospf 1"]);
    assert.deepEqual(diff.portChanges, [{ device: "S1", port: "FastEthernet0/2", before: "down", after: "up" }]);
    assert.equal(diff.changes, 5);
    ext.run('removeDevice("PC2")');
    ext.run('takeSnapshot("after")');
    const between = json(ext.run, 'compareSnapshots("before", "after")');
    assert.equal(between.devicesAdded.length, 0);
    assert.deepEqual(between.addressChanges.length, 1);
    assert.equal(between.configChanges.length, 1);
    configs.R1 = configs.R1.replace("10.0.0.2 255.255.255.0", "10.0.0.1 255.255.255.0").replace("router ospf 1\n", "");
});

test("snapshot list, delete, errors and editor messages", () => {
    const ext = lab();
    ext.run('takeSnapshot("one"); takeSnapshot("two"); takeSnapshot("one")');
    assert.deepEqual(json(ext.run, "getSnapshots()").map((s) => s.name), ["one", "two"]);
    const listed = ext.editorMessages().filter((m) => m.kind === "snapshots");
    assert.equal(JSON.parse(listed[listed.length - 1].text).length, 2);
    ext.run('deleteSnapshot("one")');
    assert.deepEqual(json(ext.run, "getSnapshots()").map((s) => s.name), ["two"]);
    assert.throws(() => ext.run('compareSnapshots("missing")'), /Unknown snapshot: missing\. Existing: two/);
    ext.run('showSnapshotDiff("two")');
    const sent = ext.editorMessages().filter((m) => m.kind === "snapshot-diff");
    assert.equal(JSON.parse(sent[0].text).from, "two");
});

test("snapshots save to and load from files", () => {
    const ext = lab();
    ext.run('takeSnapshot("base")');
    ext.run('saveSnapshot("base", "/tmp/base.json")');
    const written = ext.world.fs["/tmp/base.json"];
    assert.ok(written && JSON.parse(written).state.devices.length === 3);
    assert.equal(json(ext.run, 'loadSnapshot("/tmp/base.json", "copy")'), "copy");
    assert.equal(json(ext.run, 'compareSnapshots("base", "copy")').changes, 0);
    ext.world.fs["/tmp/bad.json"] = "{\"x\":1}";
    assert.throws(() => ext.run('loadSnapshot("/tmp/bad.json")'), /Not a PTForge snapshot/);
});

test("ping output parsing for IOS and hosts", () => {
    const ext = lab();
    assert.deepEqual(json(ext.run, 'parsePingOutput("Type escape sequence to abort.\\nSending 5, 100-byte ICMP Echos to 10.0.0.10, timeout is 2 seconds:\\n.!!!!\\nSuccess rate is 80 percent (4/5), round-trip min/avg/max = 0/1/4 ms")'),
        { sent: 5, received: 4, percent: 80, rtt: { min: 0, avg: 1, max: 4 } });
    assert.deepEqual(json(ext.run, 'parsePingOutput("Success rate is 0 percent (0/5)")'), { sent: 5, received: 0, percent: 0, rtt: null });
    assert.deepEqual(json(ext.run, 'parsePingOutput("Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\\nMinimum = 0ms, Maximum = 3ms, Average = 1ms")'),
        { sent: 4, received: 4, percent: 100, rtt: { min: 0, avg: 1, max: 3 } });
    assert.deepEqual(json(ext.run, 'parsePingOutput("garbage")'), { sent: 0, received: 0, percent: null, rtt: null });
});

test("reachability pings every address from every router and switch", () => {
    const ext = lab();
    ext.world.pingReply = (device, cmd) => /10\.0\.0\.10/.test(cmd) ? "Success rate is 100 percent (5/5), round-trip min/avg/max = 0/0/1 ms" : "Success rate is 0 percent (0/5)";
    const report = json(ext.run, "pingAll()");
    assert.deepEqual(report.sources, ["R1"]);
    assert.deepEqual(report.targets, ["10.0.0.1", "10.0.0.10"]);
    assert.equal(report.total, 1);
    assert.equal(report.ok, 1);
    assert.equal(report.rows[0].target, "10.0.0.10");
    assert.deepEqual(report.rows[0].rtt, { min: 0, avg: 0, max: 1 });
    assert.ok(ext.editorMessages().some((m) => m.kind === "reachability"));
    assert.deepEqual(ext.world.devices.R1.commands.slice(-1)[0], { cmd: "ping 10.0.0.10", mode: "enable" });
});

test("ping matrix handles names, hosts, partial replies and errors", () => {
    const ext = lab();
    ext.world.pingReply = () => ".!!!!\nSuccess rate is 80 percent (4/5)";
    const report = json(ext.run, 'pingMatrix(["R1", "PC1"], ["PC1", "R1", "Ghost", "10.0.0.1"], 2)');
    const rows = report.rows.map((r) => [r.source, r.target, r.state]);
    assert.deepEqual(rows, [["R1", "PC1", "partial"], ["R1", "Ghost", "error"], ["PC1", "R1", "sent"], ["PC1", "Ghost", "error"], ["PC1", "10.0.0.1", "sent"]]);
    assert.equal(report.partial, 1);
    assert.equal(report.unknown, 4);
    assert.match(report.rows[1].output, /No IPv4 address found on Ghost/);
    assert.deepEqual(ext.world.devices.R1.commands.slice(-1)[0], { cmd: "ping 10.0.0.10 repeat 2", mode: "enable" });
    assert.deepEqual(ext.world.devices.PC1.hostCommands, ["ping -n 2 10.0.0.1", "ping -n 2 10.0.0.1"]);
    assert.deepEqual(json(ext.run, 'pingAll("R1", ["10.0.0.10"])')["10.0.0.10"].status, "ok");
});
