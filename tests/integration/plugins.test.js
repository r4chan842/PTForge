"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const folder = "C:/Users/lab/Documents/PTForge/plugins";

function pf(manifest, body) {
    return "---\n" + JSON.stringify(manifest, null, 2) + "\n---\n" + body;
}

function setup(files) {
    const ext = loadExtension();
    ext.world.fs = ext.world.fs || {};
    Object.keys(files || {}).forEach((name) => { ext.world.fs[folder + "/" + name] = files[name]; });
    return ext;
}

function list(ext) {
    return JSON.parse(ext.run("JSON.stringify(listPlugins())"));
}

const hello = pf({ id: "hello", name: "Hello", version: "1.2.0", permissions: [] },
    "plugin.command(\"hi\", \"Greets\", function (args, out) { out(\"hey \" + args.join(\"|\")); return args.length; });\n" +
    "plugin.fn(\"helloCount\", function () { return getDeviceCount(); });\n" +
    "plugin.rule(\"no-r9\", function () { return getDevices().indexOf(\"R9\") === -1 ? [] : [{ severity: \"error\", device: \"R9\", message: \"R9 is banned\" }, \"plain text\"]; });\n" +
    "plugin.check(\"has R1\", function () { return getDevices().indexOf(\"R1\") !== -1; }, \"Add R1\", 5);\n" +
    "plugin.onDisable(function () { helloGone = true; });\n");

test("plugins are discovered from the folder with their manifest", () => {
    const ext = setup({ "hello.pf": hello, "notes.txt": "x", "broken.pf": "no header", "bad.pf": pf({ id: "Bad Id" }, ""), "perm.pf": pf({ id: "perm", permissions: ["root"] }, "") });
    const items = list(ext);
    assert.deepEqual(items.map((p) => p.file.split("/").pop()), ["bad.pf", "broken.pf", "hello.pf", "perm.pf"]);
    const byFile = Object.fromEntries(items.map((p) => [p.file.split("/").pop(), p]));
    assert.equal(byFile["hello.pf"].name, "Hello");
    assert.equal(byFile["hello.pf"].version, "1.2.0");
    assert.equal(byFile["hello.pf"].enabled, false);
    assert.equal(byFile["hello.pf"].consent, "none");
    assert.match(byFile["broken.pf"].error, /manifest/);
    assert.match(byFile["bad.pf"].error, /lowercase/);
    assert.match(byFile["perm.pf"].error, /Unknown permission: root/);
    assert.equal(ext.world.fs[folder], "<dir>");
});

test("enabling needs consent and registers commands, functions, rules and checks", () => {
    const ext = setup({ "hello.pf": hello });
    ext.run('addDevice("R9", "2911", 0, 0)');
    assert.throws(() => ext.run('enablePlugin("hello")'), /needs your consent/);
    assert.equal(ext.run('enablePlugin("hello", true)'), true);
    const item = list(ext)[0];
    assert.equal(item.enabled, true);
    assert.equal(item.consent, "granted");
    assert.deepEqual(item.commands, ["hi"]);
    assert.deepEqual(item.functions, ["helloCount"]);
    assert.equal(ext.run("helloCount()"), 1);
    assert.equal(JSON.parse(ext.run("JSON.stringify(getPluginCommands())"))[0].name, ".hi");
    const state = JSON.parse(ext.world.fs[folder + "/plugins.json"]);
    assert.ok(state.enabled.hello.checksum);

    const audit = JSON.parse(ext.run("JSON.stringify(auditNetwork())"));
    const mine = audit.findings.filter((f) => f.rule === "hello/no-r9");
    assert.equal(mine.length, 2);
    assert.equal(mine[0].severity, "error");
    assert.equal(mine[1].message, "plain text");

    const report = JSON.parse(ext.run("JSON.stringify(runPluginChecks())"));
    assert.equal(report.total, 1);
    assert.equal(report.failed, 1);
    assert.equal(report.items[0].name, "hello: has R1");

    assert.equal(ext.run('var helloGone = false; disablePlugin("hello")'), true);
    assert.equal(ext.run("helloGone"), true);
    assert.equal(ext.run("typeof helloCount"), "undefined");
    assert.equal(JSON.parse(ext.run("JSON.stringify(getPluginCommands())")).length, 0);
    assert.equal(JSON.parse(ext.world.fs[folder + "/plugins.json"]).enabled.hello, undefined);
});

test("a changed file or new permissions ask for consent again", () => {
    const ext = setup({ "hello.pf": hello });
    ext.run('enablePlugin("hello", true)');
    ext.world.fs[folder + "/hello.pf"] = hello + "\nplugin.fn(\"extra\", function () {});\n";
    assert.equal(list(ext)[0].consent, "changed");
    assert.deepEqual(JSON.parse(ext.run("JSON.stringify(loadEnabledPlugins())")), []);
    assert.equal(ext.run("typeof helloCount"), "undefined");
    assert.throws(() => ext.run('enablePlugin("hello")'), /consent/);
    ext.run('enablePlugin("hello", true)');
    assert.equal(ext.run("typeof extra"), "function");
    ext.world.fs[folder + "/hello.pf"] = hello.replace("\"permissions\": []", "\"permissions\": [\"cli\"]");
    assert.equal(list(ext)[0].consent, "changed");
});

test("enabled plugins load again at start", () => {
    const ext = setup({ "hello.pf": hello });
    ext.run('enablePlugin("hello", true)');
    ext.run("pluginDeactivate(\"hello\")");
    assert.equal(ext.run("typeof helloCount"), "undefined");
    assert.deepEqual(JSON.parse(ext.run("JSON.stringify(loadEnabledPlugins())")), ["hello"]);
    assert.equal(ext.run("typeof helloCount"), "function");
});

test("functions outside the granted permissions are blocked", () => {
    const body = "plugin.fn(\"tryWrite\", function () { addDevice(\"X\", \"2911\", 0, 0); });\n" +
        "plugin.fn(\"tryCli\", function () { setHostname(\"R1\", \"X\"); });\n" +
        "plugin.fn(\"tryFile\", function () { return writeTextFile(\"C:/a.txt\", \"x\"); });\n" +
        "plugin.fn(\"tryRaw\", function () { return ipc.network(); });\n" +
        "plugin.fn(\"tryManager\", function () { return enablePlugin(\"other\", true); });\n" +
        "plugin.fn(\"tryRead\", function () { return getDevices().length + getPorts(\"R1\").length; });\n";
    const ext = setup({ "guard.pf": pf({ id: "guard", permissions: [] }, body), "cli.pf": pf({ id: "cli", permissions: ["cli", "topology"] }, "plugin.fn(\"cliOk\", function () { setHostname(\"R1\", \"Core\"); addDevice(\"PC7\", \"PC-PT\", 0, 0); return getDeviceCount(); });") });
    ext.run('addDevice("R1", "2911", 0, 0)');
    ext.run('enablePlugin("guard", true); enablePlugin("cli", true)');
    assert.throws(() => ext.run("tryWrite()"), /guard needs the "topology" permission to use addDevice/);
    assert.throws(() => ext.run("tryCli()"), /"cli" permission to use setHostname/);
    assert.throws(() => ext.run("tryFile()"), /"files" permission to use writeTextFile/);
    assert.throws(() => ext.run("tryRaw()"), /"raw" permission to use ipc/);
    assert.throws(() => ext.run("tryManager()"), /plugin manager/);
    assert.ok(ext.run("tryRead()") > 1);
    assert.equal(ext.run("cliOk()"), 2);
});

test("conflicts and load errors are reported and leave nothing behind", () => {
    const ext = setup({
        "a.pf": pf({ id: "a" }, "plugin.command(\"help\", function () {});"),
        "b.pf": pf({ id: "b" }, "plugin.fn(\"addDevice\", function () {});"),
        "c.pf": pf({ id: "c" }, "plugin.command(\"cc\", function () {}); plugin.fn(\"cFn\", function () {}); throw new Error(\"boom\");"),
        "d.pf": pf({ id: "d" }, "plugin.command(\"cc\", function () {}); plugin.command(\"cc\", function () {});"),
        "e.pf": pf({ id: "e" }, "this is not javascript"),
        "f.pf": pf({ id: "a" }, "")
    });
    assert.throws(() => ext.run('enablePlugin("a", true)'), /\.help is already taken/);
    assert.throws(() => ext.run('enablePlugin("b", true)'), /addDevice already exists/);
    assert.throws(() => ext.run('enablePlugin("c", true)'), /c failed to load: boom/);
    assert.equal(ext.run("typeof cFn"), "undefined");
    assert.equal(JSON.parse(ext.run("JSON.stringify(getPluginCommands())")).length, 0);
    assert.throws(() => ext.run('enablePlugin("d", true)'), /\.cc is already taken/);
    assert.throws(() => ext.run('enablePlugin("e", true)'), /e failed to load/);
    assert.throws(() => ext.run('enablePlugin("zzz", true)'), /Plugin not found/);
    const dup = list(ext).find((p) => p.file.endsWith("f.pf"));
    assert.match(dup.error, /Duplicate id a/);
    const c = list(ext).find((p) => p.id === "c");
    assert.match(c.error, /boom/);
    assert.equal(c.enabled, false);
});

test("dot commands run in the terminal and parse quoted arguments", () => {
    const ext = setup({ "hello.pf": hello });
    ext.attachEditor();
    ext.run('enablePlugin("hello", true)');
    ext.run("shellEval(" + JSON.stringify(encodeURIComponent("t1")) + ", " + JSON.stringify(encodeURIComponent('runPluginCommand("hi", "a \\"b c\\" \'d\'")')) + ")");
    const logs = ext.editorMessages().filter((m) => m.kind === "shell-log").map((m) => JSON.parse(m.text));
    assert.equal(logs[0].text, "hey a|b c|d");
    assert.equal(logs[0].id, "t1");
    const result = ext.editorMessages().filter((m) => m.kind === "shell-result").pop();
    assert.equal(JSON.parse(result.text).text, "3");
    assert.throws(() => ext.run('runPluginCommand("nope", "")'), /Unknown command \.nope/);
});

test("the editor bridge lists, creates, opens and toggles plugins", () => {
    const ext = setup({ "hello.pf": hello });
    ext.attachEditor();
    const last = () => JSON.parse(ext.editorMessages().filter((m) => m.kind === "plugins").pop().text);
    ext.run('editorPlugins("list")');
    assert.equal(last().folder, folder);
    assert.equal(last().plugins.length, 1);
    ext.run('editorPlugins("enable", "hello")');
    assert.match(JSON.parse(ext.editorMessages().filter((m) => m.kind === "bridge-error").pop().text).message, /consent/);
    ext.run('editorPlugins("enable", "hello", "grant")');
    assert.equal(last().plugins[0].enabled, true);
    assert.equal(last().commands[0].name, ".hi");
    ext.run('editorPlugins("disable", "hello")');
    assert.equal(last().plugins[0].enabled, false);
    ext.run('editorPlugins("create", "my-tool", "My Tool")');
    assert.ok(ext.world.fs[folder + "/my-tool.pf"].includes("\"name\": \"My Tool\""));
    const opened = JSON.parse(ext.editorMessages().filter((m) => m.kind === "file-opened").pop().text);
    assert.equal(opened.name, "my-tool.pf");
    ext.run('editorPlugins("enable", "my-tool", "grant")');
    assert.equal(last().plugins.find((p) => p.id === "my-tool").enabled, true);
    ext.run('editorPlugins("create", "my-tool", "Again")');
    assert.match(JSON.parse(ext.editorMessages().filter((m) => m.kind === "bridge-error").pop().text).message, /already exists/);
    ext.world.dialog = { folder: "D:/pf" };
    ext.run('editorPlugins("folder")');
    assert.equal(last().folder, "D:/pf");
    assert.equal(ext.world.fs["C:/Users/lab/Documents/PTForge/plugin-folder.txt"], "D:/pf");
    assert.equal(ext.run("typeof helloCount"), "undefined");
});

test("the bundled plugins load read-only where they say so and work", () => {
    const fs = require("fs");
    const path = require("path");
    const dir = path.join(__dirname, "..", "..", "plugins");
    const files = {};
    fs.readdirSync(dir).filter((f) => f.endsWith(".pf")).forEach((f) => { files[f] = fs.readFileSync(path.join(dir, f), "utf8"); });
    const ext = setup(files);
    ext.run('addDevice("R1", "2911", 0, 0); addDevice("S1", "2960-24TT", 0, 0); addDevice("PC1", "PC-PT", 0, 0)');
    ext.run('addLink("S1", "FastEthernet0/1", "PC1", "FastEthernet0", "straight"); setPcStatic("PC1", "192.168.1.10/24", "10.0.0.1", "8.8.8.8")');
    const items = list(ext);
    assert.deepEqual(items.map((p) => p.id), ["config-tools", "host-audit", "port-map"]);
    assert.ok(items.every((p) => !p.error));
    assert.deepEqual(items.find((p) => p.id === "config-tools").permissions, ["cli"]);
    items.forEach((p) => ext.run('enablePlugin("' + p.id + '", true)'));
    assert.match(ext.run('runPluginCommand("hosts", "")'), /PC1 {2}static {2}192\.168\.1\.10\/24 {2}10\.0\.0\.1 {2}8\.8\.8\.8 {2}! gateway 10\.0\.0\.1 is outside/);
    assert.match(ext.run('runPluginCommand("ports", "S1")'), /FastEthernet0\/1 {2}-> {2}PC1 FastEthernet0/);
    assert.equal(ext.run('runPluginCommand("motd", "Keep out")'), "Banner set on 2 devices");
    const rules = JSON.parse(ext.run("JSON.stringify(auditNetwork().findings.filter(function (f) { return f.rule.indexOf('/') > 0; }))"));
    assert.ok(rules.some((f) => f.rule === "host-audit/host-addressing" && f.severity === "error" && f.device === "PC1"));
    assert.equal(JSON.parse(ext.run("JSON.stringify(portMap('S1'))"))[0].device, "PC1");
    assert.equal(JSON.parse(ext.run("JSON.stringify(runPluginChecks())")).failed, 1);
});
