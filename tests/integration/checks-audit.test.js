"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

function json(run, code) {
    return JSON.parse(run("JSON.stringify(" + code + ")"));
}

function lab() {
    const ext = loadExtension();
    ext.run([
        'addDevice("R1", "2911", 0, 0)',
        'addDevice("S1", "2960-24TT", 100, 0)',
        'addDevice("PC1", "PC-PT", 200, 0)',
        'addDevice("PC2", "PC-PT", 300, 0)',
        'addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight")',
        'addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight")',
        'addLink("S1", "FastEthernet0/2", "PC2", "FastEthernet0", "straight")'
    ].join(";"));
    return ext;
}

test("lab check scores passed and failed items", () => {
    const ext = lab();
    const sent = ext.attachEditor();
    ext.world.devices.R1.ports[0].ip = "10.0.0.1";
    ext.world.devices.R1.ports[0].mask = "255.255.255.0";
    const report = json(ext.run, `(function () {
        beginChecks("Lab 1");
        checkDeviceExists("R1");
        checkDeviceExists("R9", 2);
        checkLinked("R1", "S1");
        checkLinked("PC1", "PC2");
        checkIpAddress("R1", "GigabitEthernet0/0", "10.0.0.1", 24);
        checkIpAddress("R1", "GigabitEthernet0/0", "10.0.0.1", 30);
        checkPortUp("S1", "FastEthernet0/1");
        checkPortUp("S1", "FastEthernet0/9");
        checkVlan("S1", 1);
        checkVlan("S1", 99);
        check("throws", function () { return findDevice("nope"); });
        checkEqual("same list", function () { return [1, 2]; }, [1, 2], 3);
        checkEqual("different", 5, 6);
        return endChecks();
    })()`);
    assert.equal(report.title, "Lab 1");
    assert.equal(report.total, 13);
    assert.deepEqual(report.items.filter((i) => i.passed).map((i) => i.name), [
        "Device R1 exists", "R1 is cabled to S1", "R1 GigabitEthernet0/0 has 10.0.0.1 24", "S1 FastEthernet0/1 is up", "VLAN 1 exists on S1", "same list"
    ]);
    assert.equal(report.passed, 6);
    assert.equal(report.maxScore, 16);
    assert.equal(report.score, 8);
    assert.equal(report.percent, 50);
    assert.match(report.items.find((i) => i.name === "throws").hint, /nope/);
    assert.equal(report.items.find((i) => i.name === "different").hint, "expected 6, got 5");
    assert.equal(ext.editorMessages().at(-1).kind, "report");
    assert.equal(JSON.parse(ext.editorMessages().at(-1).text).score, 8);
    assert.equal(sent.length, 1);
});

test("runChecks and a fresh report after endChecks", () => {
    const ext = lab();
    const report = json(ext.run, 'runChecks("Quick", [{ name: "a", test: function () { return true; } }, { name: "b", test: false, hint: "fix b", points: 3 }])');
    assert.deepEqual([report.passed, report.failed, report.score, report.maxScore], [1, 1, 1, 4]);
    assert.equal(report.items[1].hint, "fix b");
    const next = json(ext.run, "(function () { check('x', 1); return endChecks(); })()");
    assert.equal(next.title, "Lab check");
    assert.equal(next.total, 1);
});

test("lab check without editor falls back to a message box", () => {
    const ext = lab();
    ext.run('beginChecks("Box"); check("one", true); endChecks()');
    assert.equal(ext.world.messages.length, 1);
    assert.match(ext.world.messages[0][2], /Box: 1\/1 passed/);
});

test("ip inventory, subnets and duplicates", () => {
    const ext = lab();
    const set = (d, i, ip, mask) => { const p = ext.world.devices[d].ports[i]; p.ip = ip; p.mask = mask; };
    set("R1", 0, "192.168.1.1", "255.255.255.0");
    set("PC1", 0, "192.168.1.10", "255.255.255.0");
    set("PC2", 0, "192.168.1.10", "255.255.255.0");
    set("R1", 1, "10.0.0.1", "255.255.255.252");
    const inventory = json(ext.run, "getIpInventory()");
    assert.equal(inventory.length, 4);
    assert.deepEqual(inventory[0], { device: "R1", port: "GigabitEthernet0/0", ip: "192.168.1.1", mask: "255.255.255.0", up: true });
    assert.deepEqual(json(ext.run, "getSubnets()").map((s) => s.network), ["10.0.0.0/30", "192.168.1.0/24"]);
    assert.deepEqual(json(ext.run, "findDuplicateIps()"), [{ ip: "192.168.1.10", owners: ["PC1 FastEthernet0", "PC2 FastEthernet0"] }]);
});

test("down links, subnet mismatches and unaddressed hosts", () => {
    const ext = lab();
    ext.world.devices.PC2.ports[0].power = false;
    ext.world.devices.PC1.ports[0].ip = "10.1.1.10";
    ext.world.devices.PC1.ports[0].mask = "255.255.255.0";
    ext.run('addDevice("R2", "2911", 0, 0); addLink("R1", "GigabitEthernet0/1", "R2", "GigabitEthernet0/0", "cross")');
    const r1 = ext.world.devices.R1.ports[1];
    const r2 = ext.world.devices.R2.ports[0];
    r1.ip = "10.0.0.1"; r1.mask = "255.255.255.252";
    r2.ip = "10.0.0.9"; r2.mask = "255.255.255.252";
    const down = json(ext.run, "findDownLinks()");
    assert.equal(down.length, 1);
    assert.deepEqual(down[0].to, { device: "PC2", port: "FastEthernet0", up: false });
    const mismatch = json(ext.run, "findSubnetMismatches()");
    assert.equal(mismatch.length, 1);
    assert.equal(mismatch[0].from.ip, "10.0.0.1/30");
    assert.equal(mismatch[0].to.ip, "10.0.0.9/30");
    assert.deepEqual(json(ext.run, "findUnaddressedHosts()"), [{ device: "PC2", port: "FastEthernet0" }]);
    ext.world.devices.PC2.ports[0].dhcpClient = true;
    assert.deepEqual(json(ext.run, "findUnaddressedHosts()"), []);
});

test("switch audit rules", () => {
    const ext = lab();
    const s1 = ext.world.devices.S1;
    s1.ports[1].accessVlan = 10;
    s1.ports[1].security.enabled = true;
    const findings = json(ext.run, 'auditSwitch("S1")');
    const on = (port) => findings.filter((f) => f.port === port).map((f) => f.rule).sort();
    assert.deepEqual(on("FastEthernet0/1"), ["no-port-security", "vlan1-access"]);
    assert.deepEqual(on("FastEthernet0/2"), []);
    assert.deepEqual(on("FastEthernet0/3"), ["unused-enabled"]);
    assert.deepEqual(on("Vlan1"), []);
    s1.ports[3].power = false;
    assert.deepEqual(json(ext.run, 'auditSwitch("S1")').filter((f) => f.port === "FastEthernet0/4"), []);
});

test("auditNetwork collects everything and notifies the editor", () => {
    const ext = lab();
    ext.attachEditor();
    ext.world.devices.PC1.ports[0].ip = "192.168.1.5";
    ext.world.devices.PC1.ports[0].mask = "255.255.255.0";
    ext.world.devices.PC2.ports[0].ip = "192.168.1.5";
    ext.world.devices.PC2.ports[0].mask = "255.255.255.0";
    const report = json(ext.run, "auditNetwork()");
    assert.equal(report.errors, 1);
    assert.equal(report.findings[0].rule, "duplicate-ip");
    assert.equal(report.findings[0].message, "192.168.1.5 is used by PC1 FastEthernet0, PC2 FastEthernet0");
    assert.equal(report.warnings, 3);
    assert.deepEqual(report.findings.filter((f) => f.rule === "vlan1-access").map((f) => f.port), ["FastEthernet0/1", "FastEthernet0/2", "GigabitEthernet0/1"]);
    assert.equal(report.errors + report.warnings + report.infos, report.findings.length);
    const message = ext.editorMessages().at(-1);
    assert.equal(message.kind, "audit");
    assert.equal(JSON.parse(message.text).findings.length, report.findings.length);
});

test("topology summary", () => {
    const ext = lab();
    const summary = json(ext.run, "getTopologySummary()");
    assert.equal(summary.devices, 4);
    assert.equal(summary.links, 3);
    assert.deepEqual(summary.byType, { router: 1, switch: 1, pc: 2 });
    assert.equal(summary.addresses, 0);
});

test("runOnDevices and runOnAll", () => {
    const ext = lab();
    ext.world.rejectCommands.push(/^bogus/);
    const all = json(ext.run, 'runOnAll("show version")');
    assert.deepEqual(all.map((r) => r.device), ["R1", "S1"]);
    assert.ok(all.every((r) => r.status === "ok"));
    const mixed = json(ext.run, 'runOnDevices(["R1", "PC1", "R7"], "bogus")');
    assert.equal(mixed[0].status, "invalid");
    assert.equal(mixed[1].status, "error");
    assert.match(mixed[1].output, /Not a Cisco IOS device/);
    assert.equal(mixed[2].status, "error");
});

test("commandsToScript builds a runnable script from the command log", () => {
    const ext = lab();
    ext.attachEditor();
    ext.world.log.entries = [
        ["R1", "enable"], ["R1", "configure terminal"], ["R1", "hostname Edge"], ["R1", "interface g0/0"],
        ["R1", " ip address 10.0.0.1 255.255.255.0"], ["R1", "exit"], ["S1", "vlan 10"], ["R1", "do show ip int brief"],
        ["R1", "show run"], ["S1", "name USERS"], ["R1", "end"], ["R1", "write memory"]
    ];
    const text = ext.run("commandsToScript()");
    assert.equal(text, [
        'configureIosDevice("R1", [', '    "hostname Edge",', '    "interface g0/0",', '    "ip address 10.0.0.1 255.255.255.0"', ']);',
        "", 'configureIosDevice("S1", [', '    "vlan 10",', '    "name USERS"', ']);'
    ].join("\n"));
    assert.equal(ext.editorMessages().at(-1).kind, "script");
    assert.match(ext.run('commandsToScript("S1")'), /^configureIosDevice\("S1"/);
    assert.equal(ext.run('commandsToScript("PC1")'), "");
    const again = loadExtension();
    again.run('addDevice("R1", "2911", 0, 0)');
    again.run(ext.run("commandsToScript('R1')"));
    assert.ok(again.world.devices.R1.commands.map((c) => c.cmd.trim()).includes("hostname Edge"));
});
