"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const enc = (v) => JSON.stringify(encodeURIComponent(v));

function editor() {
    const ext = loadExtension();
    ext.attachEditor();
    const last = () => {
        const m = ext.editorMessages().at(-1);
        return m ? { kind: m.kind, data: JSON.parse(m.text) } : null;
    };
    return { ext, last };
}

test("open file dialog sends the file to the editor", () => {
    const { ext, last } = editor();
    ext.world.fs["C:/labs/vlan.js"] = "addDevice(\"S1\", \"2960-24TT\", 0, 0);\n// note\n";
    ext.world.dialog.open = "C:/labs/vlan.js";
    assert.equal(ext.run("editorOpenFile()"), true);
    assert.deepEqual(ext.world.dialogs[0], ["open", "Open script", "C:/Users/lab/Documents", "Scripts (*.js *.txt);;All files (*)"]);
    assert.deepEqual(last(), { kind: "file-opened", data: { path: "C:/labs/vlan.js", name: "vlan.js", text: ext.world.fs["C:/labs/vlan.js"] } });
    ext.world.dialog.open = "";
    assert.equal(ext.run("editorOpenFile()"), false);
    assert.equal(ext.world.dialogs[1][2], "C:/labs");
});

test("cancelled dialogs send nothing", () => {
    const { ext } = editor();
    ext.run("editorOpenFile(); editorOpenFolder()");
    ext.run(`editorSaveFileAs(${enc("t1")}, ${enc("a.js")}, ${enc("x")})`);
    assert.equal(ext.editorMessages().length, 0);
});

test("open folder lists script files only", () => {
    const { ext, last } = editor();
    Object.assign(ext.world.fs, { "D:/w/b.js": "1", "D:/w/a.txt": "2", "D:/w/pic.png": "3", "D:/w/sub/c.js": "4", "D:/w/notes.md": "5" });
    ext.world.dialog.folder = "D:/w/";
    ext.run("editorOpenFolder()");
    assert.deepEqual(last(), {
        kind: "folder-opened",
        data: { path: "D:/w", name: "w", files: [{ name: "a.txt", path: "D:/w/a.txt" }, { name: "b.js", path: "D:/w/b.js" }, { name: "notes.md", path: "D:/w/notes.md" }] }
    });
    ext.run(`editorReadFile(${enc("D:/w/b.js")})`);
    assert.equal(last().data.text, "1");
});

test("save writes text with unicode and new lines intact", () => {
    const { ext, last } = editor();
    const text = "log(\"سلام ۱۲۳\");\n\tvar s = \"50% & more\";\r\n";
    ext.run(`editorSaveFile(${enc("t7")}, ${enc("C:/x/lab.js")}, ${enc(text)})`);
    assert.equal(ext.world.fs["C:/x/lab.js"], text);
    assert.deepEqual(last(), { kind: "file-saved", data: { id: "t7", path: "C:/x/lab.js", name: "lab.js" } });
});

test("save without a path asks where to save", () => {
    const { ext, last } = editor();
    ext.world.dialog.save = "C:/Users/lab/Documents/new.js";
    ext.run(`editorSaveFile(${enc("t2")}, ${enc("")}, ${enc("abc")})`);
    assert.deepEqual(ext.world.dialogs[0].slice(0, 3), ["save", "Save script", "C:/Users/lab/Documents/script.js"]);
    assert.equal(ext.world.fs["C:/Users/lab/Documents/new.js"], "abc");
    assert.equal(last().data.id, "t2");
    ext.world.dialog.save = "C:/Users/lab/Documents/copy.js";
    ext.run(`editorSaveFileAs(${enc("t2")}, ${enc("lab one.js")}, ${enc("abc")})`);
    assert.equal(ext.world.dialogs[1][2], "C:/Users/lab/Documents/lab one.js");
    assert.equal(last().data.name, "copy.js");
});

test("bridge errors are reported instead of thrown", () => {
    const { ext, last } = editor();
    ext.run(`editorReadFile(${enc("C:/missing.js")})`);
    assert.deepEqual(last(), { kind: "bridge-error", data: { action: "open", message: "File not found: C:/missing.js" } });
    ext.ctx.ipc.systemFileManager = () => ({ writePlainTextToFile: () => false });
    assert.equal(ext.run(`editorSaveFile(${enc("t")}, ${enc("C:/ro/a.js")}, ${enc("x")})`), false);
    assert.deepEqual(last(), { kind: "bridge-error", data: { action: "save", message: "Could not write C:/ro/a.js" } });
    ext.ctx.ipc.systemFileManager = () => null;
    ext.run("editorOpenFile()");
    assert.equal(last().data.action, "open");
    assert.match(last().data.message, /not available/);
});

test("clipboard copy", () => {
    const { ext } = editor();
    ext.run(`editorCopy(${enc("line 1\nline 2")})`);
    assert.equal(ext.world.clipboard, "line 1\nline 2");
});

test("devices panel data", () => {
    const { ext, last } = editor();
    ext.run('addDevice("R1", "2911", 0, 0); addDevice("PC1", "PC-PT", 0, 0); addLink("R1", "GigabitEthernet0/0", "PC1", "FastEthernet0", "cross")');
    ext.world.devices.R1.ports[1].ip = "10.9.9.1";
    ext.world.devices.R1.ports[1].mask = "255.255.255.252";
    ext.run("editorDevices()");
    const data = last().data;
    assert.equal(last().kind, "devices");
    assert.equal(data.links, 1);
    assert.deepEqual(data.devices[0].ports, [
        { name: "GigabitEthernet0/0", ip: "", up: true, peer: "FastEthernet0" },
        { name: "GigabitEthernet0/1", ip: "10.9.9.1/30", up: false, peer: "" }
    ]);
    assert.equal(data.devices[0].type, "router");
    assert.equal(data.devices[0].model, "2911");
    assert.equal(data.devices[1].type, "pc");
});
