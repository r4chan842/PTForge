"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadExtension, root } = require("../helpers/load");

function uiContext() {
    const context = {};
    vm.createContext(context);
    ["acorn.js", "instrument.js"].forEach((file) => {
        vm.runInContext(fs.readFileSync(path.join(root, "src", "ui", file), "utf8"), context, { filename: file });
    });
    return context;
}

const ui = uiContext();

function uiCall(name, ...args) {
    ui.__args = JSON.stringify(args);
    return JSON.parse(vm.runInContext("JSON.stringify(" + name + ".apply(null, JSON.parse(__args)))", ui));
}

function lastMessage(ext, kind) {
    const all = ext.editorMessages().filter((m) => m.kind === kind);
    assert.ok(all.length, "no " + kind + " message");
    return JSON.parse(all[all.length - 1].text);
}

function shell(ext, code) {
    ext.run("shellEval(" + JSON.stringify(encodeURIComponent("t1")) + ", " + JSON.stringify(encodeURIComponent(code)) + ")");
    return lastMessage(ext, "shell-result");
}

function debug(source, options) {
    const ext = loadExtension();
    ext.attachEditor();
    const settings = options || {};
    const result = uiCall("instrumentScript", source);
    const bps = uiCall("breakpointConfig", result.steps, settings.breakpoints || []);
    const config = { steps: result.steps, functions: result.functions, breakpoints: bps.map, watches: settings.watches || [], limit: settings.limit || 3000 };
    ext.run("debugRun(" + JSON.stringify(encodeURIComponent(result.code)) + ", " + JSON.stringify(encodeURIComponent(JSON.stringify(config))) + ")");
    const trace = lastMessage(ext, "debug-trace");
    return { ext, trace, steps: result.steps, functions: result.functions, code: result.code, lines: trace.trace.map((e) => result.steps[e.id].line) };
}

function scopeVar(entry, scope, name) {
    const found = entry.scopes.find((s) => s.name === scope);
    assert.ok(found, "scope " + scope + " missing");
    const item = found.vars.find((v) => v[0] === name);
    assert.ok(item, name + " missing in " + scope);
    return item[1];
}

test("shell evaluates expressions and keeps variables between lines", () => {
    const ext = loadExtension();
    ext.attachEditor();
    const sum = shell(ext, "1 + 2");
    assert.equal(typeof sum.ms, "number");
    delete sum.ms;
    assert.deepEqual(sum, { id: "t1", ok: true, type: "number", text: "3" });
    assert.equal(shell(ext, "var answer = 40").text, "undefined");
    assert.equal(shell(ext, "answer + 2").text, "42");
    assert.equal(shell(ext, "function twice(x) { return x * 2; }").ok, true);
    assert.equal(shell(ext, "twice(answer)").text, "80");
    assert.equal(shell(ext, "'it\\'s'").text, "'it\\'s'");
    assert.equal(shell(ext, "({ a: 1, list: [1, 2, 3], nested: { deep: { deeper: { x: 1 } } } })").text, "{ a: 1, list: [ 1, 2, 3 ], nested: { deep: { deeper: [Object] } } }");
    assert.equal(shell(ext, "[]").text, "[]");
    assert.equal(shell(ext, "null").type, "null");
    assert.equal(shell(ext, "addDevice").text, "[Function: addDevice]");
    assert.equal(shell(ext, "\"a\\nb\"").type, "text");
    assert.equal(shell(ext, "\"a\\nb\"").text, "a\nb");
});

test("shell reports errors and routes log output to the terminal", () => {
    const ext = loadExtension();
    ext.attachEditor();
    const bad = shell(ext, "missingThing + 1");
    assert.equal(bad.ok, false);
    assert.match(bad.text, /^ReferenceError: missingThing is not defined/);
    assert.equal(shell(ext, "throw 'plain'").text, "Uncaught 'plain'");
    shell(ext, "log('hello'); showResult({ n: 1 }); 5");
    const logs = ext.editorMessages().filter((m) => m.kind === "shell-log").map((m) => JSON.parse(m.text));
    assert.deepEqual(logs.map((l) => [l.kind, l.text]), [["log", "hello"], ["result", "{\n  \"n\": 1\n}"]]);
    ext.run("log('after')");
    const plain = ext.editorMessages().filter((m) => m.kind === "log");
    assert.equal(plain[plain.length - 1].text, "after");
});

test("shell long objects break over several lines", () => {
    const ext = loadExtension();
    ext.attachEditor();
    const text = shell(ext, "({ first: 'aaaaaaaaaaaaaaaa', second: 'bbbbbbbbbbbbbbbbbb', third: 'cccccccccccccccccc', fourth: 1 })").text;
    assert.equal(text, "{\n  first: 'aaaaaaaaaaaaaaaa',\n  second: 'bbbbbbbbbbbbbbbbbb',\n  third: 'cccccccccccccccccc',\n  fourth: 1\n}");
    assert.match(shell(ext, "var big = []; for (var i = 0; i < 150; i++) big.push(i); big").text, /\.\.\. 50 more items/);
    assert.equal(shell(ext, "var loop = {}; loop.self = loop; loop").text, "{ self: [Circular] }");
});

test("shell attaches to a device and sends CLI commands", () => {
    const ext = loadExtension();
    ext.attachEditor();
    ext.run('addDevice("R1", "2911", 0, 0); addDevice("PC1", "PC-PT", 50, 0)');
    const enc = (v) => JSON.stringify(encodeURIComponent(v));
    ext.run("shellAttach(" + enc("t2") + ", " + enc("R1") + ")");
    let msg = lastMessage(ext, "shell-cli");
    assert.equal(msg.attached, true);
    assert.equal(msg.kind, "ios");
    assert.equal(msg.prompt, "R#");
    ext.run("shellCli(" + enc("t2") + ", " + enc("R1") + ", " + enc("show version") + ")");
    msg = lastMessage(ext, "shell-cli");
    assert.equal(msg.status, "ok");
    assert.deepEqual(ext.world.devices.R1.commands.slice(-1)[0], { cmd: "show version", mode: "" });
    ext.run("shellCli(" + enc("t2") + ", " + enc("PC1") + ", " + enc("ipconfig") + ")");
    assert.equal(lastMessage(ext, "shell-cli").status, "sent");
    assert.deepEqual(ext.world.devices.PC1.hostCommands, ["ipconfig"]);
    ext.run("shellAttach(" + enc("t3") + ", " + enc("Nope") + ")");
    msg = lastMessage(ext, "shell-cli");
    assert.equal(msg.attached, false);
    assert.match(msg.error, /Nope/);
});

test("instrumented code behaves like the original", () => {
    const source = [
        "var total = 0;",
        "function add(a, b) { return a + b; }",
        "var square = x => x * x;",
        "for (var i = 0; i < 3; i++) total = add(total, square(i));",
        "if (total > 3) total++; else total--;",
        "outer: for (var a = 0; a < 3; a++) { for (var b = 0; b < 3; b++) { if (b === 1) continue outer; total += 10; } }",
        "switch (total) { case 36: total = 'ok'; break; default: total = 'bad'; }",
        "var obj = { get v() { return 7; }, m: function () { 'use strict'; return this.v; } };",
        "var r = (function () { try { throw new Error('x'); } catch (e) { return e.message; } finally { total += '!'; } })();",
        "total + r + obj.m();"
    ].join("\n");
    const plain = vm.runInNewContext("(function () {\n" + source.replace(/total \+ r \+ obj\.m\(\);$/, "return total + r + obj.m();") + "\n})()");
    assert.equal(plain, "ok!x7");
    const { trace, code } = debug(source.replace(/total \+ r \+ obj\.m\(\);$/, "log(total + r + obj.m());"));
    assert.equal(trace.ok, true, JSON.stringify(trace.error));
    assert.ok(trace.trace.length > 20);
    assert.doesNotThrow(() => new vm.Script("(function(__dbg){" + code + "})"));
});

test("debugger records lines, scopes, call stack and watches", () => {
    const source = [
        "var devices = [\"R1\", \"R2\"];",
        "function label(name, index) {",
        "    var text = name + \"-\" + index;",
        "    return text;",
        "}",
        "var names = [];",
        "for (var i = 0; i < devices.length; i++) {",
        "    names.push(label(devices[i], i));",
        "}",
        "var done = true;"
    ].join("\n");
    const { trace, lines, functions, steps } = debug(source, { watches: ["names.length", "i * 10"] });
    assert.equal(trace.ok, true);
    assert.deepEqual(lines, [1, 6, 7, 8, 3, 4, 8, 3, 4, 10]);
    const inside = trace.trace[5];
    assert.equal(inside.depth, 1);
    assert.deepEqual(scopeVar(inside, "Local", "text"), { t: "string", d: "'R1-0'" });
    assert.deepEqual(scopeVar(inside, "Local", "index"), { t: "number", d: "0" });
    assert.equal(scopeVar(inside, "Script", "devices").d, "Array(2)");
    assert.deepEqual(scopeVar(inside, "Script", "devices").c[0], ["0", { t: "string", d: "'R1'" }]);
    const stack = uiCall("callStackOf", inside, steps, functions);
    assert.deepEqual(stack, [{ name: "label", line: 4 }, { name: "(script)", line: 8 }]);
    const last = trace.trace[trace.trace.length - 1];
    assert.deepEqual(last.watches, [{ t: "number", d: "2" }, { t: "number", d: "20" }]);
    assert.equal(trace.trace[0].scopes[0].vars.find((v) => v[0] === "names")[1].t, "undefined");
});

test("breakpoints, conditions, hit counts and logpoints", () => {
    const source = "var sum = 0;\nfor (var i = 0; i < 5; i++) {\n    sum += i;\n}\nvar end = sum;";
    const { trace } = debug(source, { breakpoints: [{ line: 3, condition: "i === 3" }, { line: 5 }, { line: 2, log: "loop starts at {i}" }] });
    const stops = trace.trace.filter((e) => e.reason === "breakpoint");
    assert.equal(stops.length, 2);
    assert.equal(stops[0].scopes[0].vars.find((v) => v[0] === "i")[1].d, "3");
    assert.deepEqual(trace.logs.map((l) => l.text), ["loop starts at undefined"]);
    const hits = debug(source, { breakpoints: [{ line: 3, hit: ">=4" }] }).trace.trace.filter((e) => e.reason === "breakpoint");
    assert.equal(hits.length, 2);
    const moved = uiCall("breakpointConfig", uiCall("instrumentScript", "var a = 1;\n\n\nvar b = 2;").steps, [{ line: 2 }, { line: 9 }]);
    assert.deepEqual(moved.resolved, [{ line: 2, actual: 4, verified: true }, { line: 9, verified: false }]);
});

test("exceptions pause with the state at the throw", () => {
    const source = "var x = 5;\nfunction fail(v) {\n    var local = v * 2;\n    return local.missing.deep;\n}\nfail(x);\nvar never = 1;";
    const { trace, lines, steps, functions } = debug(source);
    assert.equal(trace.ok, false);
    assert.equal(trace.error.name, "TypeError");
    const last = trace.trace[trace.trace.length - 1];
    assert.equal(last.reason, "exception");
    assert.match(last.message, /TypeError/);
    assert.equal(lines[lines.length - 1], 4);
    assert.equal(last.scopes[0].vars.find((v) => v[0] === "local")[1].d, "10");
    assert.deepEqual(uiCall("callStackOf", last, steps, functions).map((f) => f.name), ["fail", "(script)"]);
});

test("step over, into, out, back and continue walk the trace", () => {
    const source = "function f() {\n    var a = 1;\n    return a;\n}\nf();\nf();\nvar z = 0;";
    const { trace, lines } = debug(source, { breakpoints: [{ line: 6 }] });
    assert.deepEqual(lines, [5, 2, 3, 6, 2, 3, 7]);
    const t = trace.trace;
    assert.equal(uiCall("firstStop", t, false), 3);
    assert.equal(uiCall("firstStop", t, true), 0);
    assert.equal(uiCall("traceStep", t, 0, "over"), 3);
    assert.equal(uiCall("traceStep", t, 0, "into"), 1);
    assert.equal(uiCall("traceStep", t, 1, "out"), 3);
    assert.equal(uiCall("traceStep", t, 3, "over"), 6);
    assert.equal(uiCall("traceStep", t, 4, "out"), 6);
    assert.equal(uiCall("traceStep", t, 6, "into"), -1);
    assert.equal(uiCall("traceStep", t, 0, "continue"), 3);
    assert.equal(uiCall("traceStep", t, 3, "continue"), -1);
    assert.equal(uiCall("traceStep", t, 5, "reverse"), 3);
    assert.equal(uiCall("traceStep", t, 2, "back"), 1);
    assert.equal(uiCall("firstStop", debug("var q = 1;").trace.trace, false), -1);
});

test("long loops are truncated but breakpoints past the limit are kept", () => {
    const { trace } = debug("var n = 0;\nfor (var i = 0; i < 400; i++) {\n    n++;\n}\nvar end = n;", { limit: 50, breakpoints: [{ line: 5 }] });
    assert.equal(trace.truncated, true);
    assert.equal(trace.trace.length, 51);
    assert.equal(trace.trace[50].reason, "breakpoint");
    assert.equal(trace.trace[50].scopes[0].vars.find((v) => v[0] === "n")[1].d, "400");
    assert.equal(trace.steps, 403);
});

test("syntax errors in the engine are reported", () => {
    const ext = loadExtension();
    ext.attachEditor();
    ext.run("debugRun(" + JSON.stringify(encodeURIComponent("var = ;")) + ", " + JSON.stringify(encodeURIComponent("{}")) + ")");
    const trace = lastMessage(ext, "debug-trace");
    assert.equal(trace.ok, false);
    assert.equal(trace.phase, "compile");
    ext.run("debugRun(" + JSON.stringify(encodeURIComponent("1")) + ", " + JSON.stringify(encodeURIComponent("nope")) + ")");
    assert.equal(lastMessage(ext, "debug-trace").phase, "config");
});

test("getters are not called while recording and conditions do not add steps", () => {
    const source = "var calls = 0;\nfunction bump() { calls++; return true; }\nvar o = { get g() { calls += 100; return 1; } };\nvar k = 1;\nvar last = calls;";
    const { trace } = debug(source, { breakpoints: [{ line: 4, condition: "bump()" }] });
    assert.equal(trace.ok, true);
    const end = trace.trace[trace.trace.length - 1];
    assert.equal(end.scopes[0].vars.find((v) => v[0] === "o")[1].c[0][1].t, "getter");
    assert.equal(trace.trace.filter((e) => e.depth > 0).length, 0);
    assert.equal(trace.trace.find((e) => e.reason === "breakpoint").scopes[0].vars.find((v) => v[0] === "calls")[1].d, "1");
});
