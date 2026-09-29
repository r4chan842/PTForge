"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const { run } = loadExtension();
const j = (code) => JSON.parse(JSON.stringify(run(code)));

test("parses colors", () => {
    assert.deepEqual(j('toRgb("red")'), [220, 53, 69]);
    assert.deepEqual(j('toRgb("#ff8000")'), [255, 128, 0]);
    assert.deepEqual(j('toRgb("#0f0")'), [0, 255, 0]);
    assert.deepEqual(j("toRgb([300, -5, 12.6])"), [255, 0, 13]);
    assert.deepEqual(j('toRgb("nonsense")'), [0, 0, 0]);
    assert.deepEqual(j("toRgb(undefined)"), [0, 0, 0]);
});

test("named colors are not mutated by callers", () => {
    run('var c = toRgb("blue"); c[0] = 99;');
    assert.deepEqual(j('toRgb("blue")'), [13, 110, 253]);
});

test("list helpers", () => {
    assert.deepEqual(j("toList(undefined)"), []);
    assert.deepEqual(j('toList("a")'), ["a"]);
    assert.deepEqual(j('toList(["a", "b"])'), ["a", "b"]);
    assert.deepEqual(j('toLines("a\\r\\nb")'), ["a", "b"]);
    assert.equal(run("joinVlans([10, 20, 30])"), "10,20,30");
    assert.equal(run('joinVlans("1-100")'), "1-100");
    assert.deepEqual(j('toArray({ length: 2, 0: "x", 1: "y" })'), ["x", "y"]);
});

test("interface blocks", () => {
    assert.deepEqual(j('interfaceBlock("Gi0/0", ["no shutdown"])'), ["interface Gi0/0", " no shutdown", "exit"]);
});

test("required values", () => {
    assert.throws(() => run('requireValue("", "name")'), /name/);
    assert.equal(run('requireValue(0, "zero")'), 0);
});
