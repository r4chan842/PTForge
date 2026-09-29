"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

test("runs multi-line scripts with comments and no semicolons", () => {
    const { runScript, world } = loadExtension();
    const result = runScript([
        "// build",
        'addDevice("R1", "2911", 0, 0)',
        'addDevice("R2", "2911", 0, 0)',
        "/* block */",
        "const names = getDevices()",
        "names.forEach(n => setHostname(n, n))"
    ].join("\n"));
    assert.equal(result.ok, true);
    assert.equal(result.messages.length, 0);
    assert.equal(world.order.length, 2);
});

test("unicode and special characters survive encoding", () => {
    const { runScript, world } = loadExtension();
    const result = runScript('addNote(0, 0, "سلام % & + ? #")');
    assert.equal(result.ok, true);
    assert.equal(Object.values(world.canvas)[0].text, "سلام % & + ? #");
});

test("syntax errors are reported", () => {
    const { runScript } = loadExtension();
    const result = runScript("addDevice(");
    assert.equal(result.ok, false);
    assert.equal(result.messages[0][1], "Syntax error:");
});

test("runtime errors show the message", () => {
    const { runScript } = loadExtension();
    const result = runScript('removeDevice("x"); setHostname("NOPE", "a")');
    assert.equal(result.ok, false);
    assert.match(result.messages[0][1], /^Runtime error/);
    assert.equal(result.messages[0][2], "Device not found: NOPE");
});

test("showResult prints objects", () => {
    const { runScript } = loadExtension();
    const result = runScript("showResult({ a: 1 })");
    assert.equal(result.ok, true);
    assert.equal(result.messages[0][2], '{\n  "a": 1\n}');
});

test("raw unencoded input still runs", () => {
    const { run, world } = loadExtension();
    assert.equal(run('runCode("addDevice(\\"P\\", \\"PC-PT\\", 0, 0)")'), true);
    assert.equal(world.order.length, 1);
});
