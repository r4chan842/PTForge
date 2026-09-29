"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { root } = require("../helpers/load");

function loadUi() {
    const context = {};
    vm.createContext(context);
    ["catalog.js", "highlight.js", "lint.js", "netcalc.js"].forEach((file) => {
        vm.runInContext(fs.readFileSync(path.join(root, "src", "ui", file), "utf8"), context, { filename: file });
    });
    return (code) => JSON.parse(vm.runInContext("JSON.stringify(" + code + ")", context));
}

const ui = loadUi();
const types = (src) => ui("tokenize(" + JSON.stringify(src) + ", functionCatalog).filter(function (t) { return t.type !== 'space'; }).map(function (t) { return t.type + ':' + t.text; })");

test("comments, strings and numbers", () => {
    assert.deepEqual(types("// hi \"x\"\nvar a = 'b'; /* c\nd */ 0x1F 1.5e3 .5"), [
        "comment:// hi \"x\"", "keyword:var", "variable:a", "operator:=", "string:'b'", "punctuation:;", "comment:/* c\nd */", "number:0x1F", "number:1.5e3", "number:.5"
    ]);
    assert.deepEqual(types("x = \"a // not a comment\";"), ["variable:x", "operator:=", "string:\"a // not a comment\"", "punctuation:;"]);
    assert.deepEqual(types("s = `multi\nline`"), ["variable:s", "operator:=", "string:`multi\nline`"]);
});

test("keywords, api, functions and properties", () => {
    assert.deepEqual(types("if (true) return addDevice(x.y, foo(), JSON.parse(s));"), [
        "control:if", "bracket:(", "constant:true", "bracket:)", "control:return", "api:addDevice", "bracket:(", "variable:x", "punctuation:.", "property:y", "punctuation:,",
        "function:foo", "bracket:(", "bracket:)", "punctuation:,", "type:JSON", "punctuation:.", "method:parse", "bracket:(", "variable:s", "bracket:)", "bracket:)", "punctuation:;"
    ]);
});

test("regex versus division", () => {
    assert.deepEqual(types("a = b / c / d"), ["variable:a", "operator:=", "variable:b", "operator:/", "variable:c", "operator:/", "variable:d"]);
    assert.deepEqual(types("r = /a\\/b[/]c/gi.test(x)"), ["variable:r", "operator:=", "regex:/a\\/b[/]c/gi", "punctuation:.", "method:test", "bracket:(", "variable:x", "bracket:)"]);
    assert.deepEqual(types("f(x) / 2"), ["function:f", "bracket:(", "variable:x", "bracket:)", "operator:/", "number:2"]);
});

test("bracket depth colors", () => {
    const depths = ui("tokenize('f([{a}])', {}).filter(function (t) { return t.type === 'bracket'; }).map(function (t) { return t.depth; })");
    assert.deepEqual(depths, [1, 2, 3, 3, 2, 1]);
});

test("html output is escaped and covers all text", () => {
    const src = "log(\"<b>&</b>\"); // <i>";
    const html = ui("highlightHtml(" + JSON.stringify(src) + ", functionCatalog)");
    assert.ok(!html.includes("<b>"));
    assert.ok(html.includes("&lt;b&gt;&amp;&lt;/b&gt;"));
    assert.equal(html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), src);
    assert.match(html, /class="tk-comment">\/\/ &lt;i&gt;/);
    assert.match(html, /class="tk-api">log</);
});

test("tokens always rebuild the source", () => {
    const samples = fs.readdirSync(path.join(root, "examples"), { recursive: true }).filter((f) => f.endsWith(".js"));
    assert.ok(samples.length > 10);
    samples.forEach((file) => {
        const src = fs.readFileSync(path.join(root, "examples", file), "utf8");
        assert.equal(ui("tokenize(" + JSON.stringify(src) + ", []).map(function (t) { return t.text; }).join('')"), src, file);
        assert.deepEqual(ui("findProblems(" + JSON.stringify(src) + ", functionCatalog)"), [], file);
    });
});

const problems = (src) => ui("findProblems(" + JSON.stringify(src) + ", functionCatalog).map(function (p) { return p.line + ':' + p.severity + ':' + p.message; })");

test("syntax problems with the right line", () => {
    assert.deepEqual(problems("var a = 1;\nlog(a));\n"), ["2:error:Unexpected ')'"]);
    assert.deepEqual(problems("if (a) {\n  log(1);\n"), ["1:error:'{' is never closed"]);
    assert.deepEqual(problems("f([1, 2)];"), ["1:warning:Unknown function 'f'", "1:error:')' does not match '[' on line 1"]);
    assert.deepEqual(problems("log('abc);\nvar b;"), ["1:error:Unterminated string"]);
    assert.deepEqual(problems("log(1);\n/* open"), ["2:error:Comment is never closed"]);
    assert.deepEqual(problems("var x = {\n a: 1,,\n};"), ["2:error:Unexpected token ','"]);
    assert.deepEqual(problems("var s = '}'; // )\nlog(s);"), []);
});

test("unknown functions and suggestions", () => {
    assert.deepEqual(problems("addDevise();\ngetDevcies();\nfoo();"), [
        "1:warning:Unknown function 'addDevise'. Did you mean 'addDevice'?", "2:warning:Unknown function 'getDevcies'. Did you mean 'getDevices'?", "3:warning:Unknown function 'foo'"
    ]);
    assert.deepEqual(problems("function build(cb) { cb(); helper(); }\nfunction helper() {}\nvar go = function () {};\ngo(); x.anything(); parseInt('1'); JSON.stringify({});\ntry { a(); } catch (e) { e(); }"), ["5:warning:Unknown function 'a'"]);
});

test("subnet calculator", () => {
    const s = ui("subnetInfo('192.168.10.77/26')");
    assert.deepEqual([s.network, s.broadcast, s.firstHost, s.lastHost, s.hosts, s.mask, s.wildcard], ["192.168.10.64", "192.168.10.127", "192.168.10.65", "192.168.10.126", 62, "255.255.255.192", "0.0.0.63"]);
    assert.equal(ui("subnetInfo('10.1.2.3 255.255.255.252').prefix"), 30);
    assert.equal(ui("subnetInfo('172.20.0.1/31').hosts"), 2);
    assert.equal(ui("subnetInfo('8.8.8.8/32').scope"), "public");
    assert.equal(ui("subnetInfo('10.0.0.1').prefix"), 24);
    assert.throws(() => ui("subnetInfo('300.1.1.1/24')"), /Not an IPv4 address/);
    assert.throws(() => ui("subnetInfo('1.1.1.1 255.0.255.0')"), /contiguous/);
});

test("vlsm planner and wildcard", () => {
    const plan = ui("vlsmPlan('192.168.1.0/24', parseVlsmRequests('Sales:50, IT:20, 12, WAN:2'))");
    assert.deepEqual(plan.map((p) => p.name + " " + p.network), ["Sales 192.168.1.0/26", "IT 192.168.1.64/27", "Net3 192.168.1.96/28", "WAN 192.168.1.112/30"]);
    assert.throws(() => ui("vlsmPlan('10.0.0.0/28', [{ name: 'A', hosts: 30 }])"), /Not enough space/);
    assert.throws(() => ui("parseVlsmRequests('a b')"), /Use a list/);
    assert.deepEqual(ui("wildcardFor('255.255.255.224')"), { prefix: 27, mask: "255.255.255.224", wildcard: "0.0.0.31" });
    assert.deepEqual(ui("wildcardFor('0.0.0.63')"), { prefix: 26, mask: "255.255.255.192", wildcard: "0.0.0.63" });
    assert.equal(ui("wildcardFor('/20').wildcard"), "0.0.15.255");
});
