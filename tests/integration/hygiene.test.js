"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { root, order } = require("../helpers/load");

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

const sourceFiles = walk(path.join(root, "src"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => path.relative(root, f).split(path.sep).join("/"));

test("load order lists every source script exactly once", () => {
    const scripts = sourceFiles.filter((f) => !f.startsWith("src/ui/"));
    assert.deepEqual([...order.scripts].sort(), [...scripts].sort());
    assert.equal(new Set(order.scripts).size, order.scripts.length);
    order.files.forEach((f) => assert.ok(fs.existsSync(path.join(root, f)), f));
});

test("main.js is loaded last", () => {
    assert.equal(order.scripts[order.scripts.length - 1], "src/core/main.js");
});

test("no comments in source, examples or tests", () => {
    const files = sourceFiles
        .concat(walk(path.join(root, "examples")).map((f) => path.relative(root, f)))
        .concat(walk(path.join(root, "tests")).map((f) => path.relative(root, f)))
        .concat(walk(path.join(root, "tools")).map((f) => path.relative(root, f)))
        .concat(walk(path.join(root, "templates")).map((f) => path.relative(root, f)))
        .filter((f) => (f.endsWith(".js") || f.endsWith(".html")) && !f.endsWith("hygiene.test.js"));
    files.forEach((file) => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        const stripped = text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, '""').replace(/\/(?![*\/])(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\n])+\/[gimsuy]*/g, "/r/");
        assert.ok(!/(^|[^:])\/\/(?!\/)/m.test(stripped.replace(/https?:\/\//g, "")), "line comment in " + file);
        assert.ok(!/\/\*/.test(stripped), "block comment in " + file);
        assert.ok(!/<!--/.test(stripped), "html comment in " + file);
    });
});

test("packet tracer code is plain es5", () => {
    const files = sourceFiles
        .concat(walk(path.join(root, "examples")).map((f) => path.relative(root, f)))
        .concat(walk(path.join(root, "templates")).map((f) => path.relative(root, f)))
        .filter((f) => f.endsWith(".js"));
    files.forEach((file) => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        const stripped = text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""');
        assert.ok(!/=>/.test(stripped), "arrow function in " + file);
        assert.ok(!/\b(let|const|class)\s/.test(stripped), "es6 declaration in " + file);
        assert.ok(!/`/.test(stripped), "template string in " + file);
    });
});

test("no duplicate global function names", () => {
    const seen = {};
    order.scripts.forEach((file) => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        for (const match of text.matchAll(/^function (\w+)\s*\(/gm)) {
            assert.ok(!seen[match[1]], match[1] + " defined in " + file + " and " + seen[match[1]]);
            seen[match[1]] = file;
        }
        for (const match of text.matchAll(/^var (\w+)\s*=/gm)) {
            assert.ok(!seen[match[1]], match[1] + " declared in " + file + " and " + seen[match[1]]);
            seen[match[1]] = file;
        }
    });
});

test("every documented function exists", () => {
    const { run } = require("../helpers/load").loadExtension();
    const docs = walk(path.join(root, "docs", "api")).filter((f) => f.endsWith(".md"));
    assert.ok(docs.length > 0);
    docs.forEach((file) => {
        const text = fs.readFileSync(file, "utf8");
        for (const match of text.matchAll(/^\| `(\w+)\(/gm)) {
            assert.equal(run("typeof " + match[1]), "function", match[1] + " documented in " + path.basename(file));
        }
    });
});

test("every public api function is documented", () => {
    const docsText = walk(path.join(root, "docs", "api")).map((f) => fs.readFileSync(f, "utf8")).join("\n");
    const internal = new Set(fs.readFileSync(path.join(root, "tools", "internal-functions.txt"), "utf8").split(/\s+/).filter(Boolean));
    order.scripts.filter((f) => f.startsWith("src/api/")).forEach((file) => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        for (const match of text.matchAll(/^function (\w+)\s*\(/gm)) {
            if (internal.has(match[1])) continue;
            assert.ok(docsText.includes("`" + match[1] + "("), match[1] + " from " + file + " is not documented");
        }
    });
});

test("ui sends encoded code", () => {
    const text = fs.readFileSync(path.join(root, "src/ui/interface.js"), "utf8");
    assert.match(text, /\$se\("runCode", encodeURIComponent\(/);
});

test("editor function catalog matches the api docs", () => {
    const file = path.join(root, "src", "ui", "catalog.js");
    const before = fs.readFileSync(file, "utf8");
    require("child_process").execFileSync(process.execPath, [path.join(root, "tools", "generate-catalog.js")]);
    assert.equal(fs.readFileSync(file, "utf8"), before, "run node tools/generate-catalog.js");
});
