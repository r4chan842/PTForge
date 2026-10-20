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
        .filter((f) => f.endsWith(".js") && f !== path.join("src", "ui", "acorn.js"));
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
    const docs = walk(path.join(root, "docs", "api")).filter((f) => path.basename(f) !== "README");
    assert.ok(docs.length > 0);
    docs.forEach((file) => {
        const text = fs.readFileSync(file, "utf8");
        for (const match of text.matchAll(/^(\w+)\(.*\)(?: -> .+)?$/gm)) {
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
            assert.ok(new RegExp("^" + match[1] + "\\(", "m").test(docsText), match[1] + " from " + file + " is not documented");
        }
    });
});

test("stylesheet stays inside what the packet tracer web view understands", () => {
    const css = fs.readFileSync(path.join(root, "src", "ui", "style.css"), "utf8");
    ["inset:", "backdrop-filter", ":focus-visible", "--ed-"].forEach((rule) => {
        assert.equal(css.indexOf(rule), -1, rule + " in style.css");
    });
    assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, "unbalanced braces");
});

test("menu rows and icons keep their size in the packet tracer web view", () => {
    const css = fs.readFileSync(path.join(root, "src", "ui", "style.css"), "utf8");
    const block = (selector) => {
        const start = css.lastIndexOf("\n" + selector + " {");
        assert.ok(start !== -1, selector + " is missing from style.css");
        return css.slice(start, css.indexOf("}", start));
    };
    assert.match(block(".menu-item"), /white-space: nowrap/, "menu labels can wrap over the shortcut");
    assert.match(block(".menu-item"), /display: flex/, "menu rows need a flex layout");
    assert.match(block(".menu-item"), /line-height:/, "menu rows need an explicit line height");
    assert.match(block(".menu-key"), /white-space: nowrap/, "shortcuts can wrap");
    assert.match(block(".menu-key"), /margin-left: auto/, "shortcuts can sit on top of the label");
    assert.match(block(".menu-drop"), /max-height:/, "tall menus can run off the screen");
    assert.match(block(".ico"), /flex: none/, "icons can be squeezed by long labels");
});

test("every icon carries its own size", () => {
    const shell = fs.readFileSync(path.join(root, "src", "ui", "app-shell.js"), "utf8");
    assert.match(shell, /<svg class=\\"ico[^>]*width=\\"16\\" height=\\"16\\"/, "icon() does not size its svg");
    const layout = fs.readFileSync(path.join(root, "src", "ui", "index.html"), "utf8");
    const tags = layout.match(/<svg class="ico[^>]*>/g) || [];
    assert.ok(tags.length > 0, "no icons in index.html");
    tags.forEach((tag) => {
        assert.match(tag, /width="16"/, "icon without a width in index.html: " + tag);
        assert.match(tag, /height="16"/, "icon without a height in index.html: " + tag);
        assert.match(tag, /viewBox="/, "icon without a viewBox in index.html: " + tag);
    });
});

test("interface files are all referenced by the layout", () => {
    const layout = fs.readFileSync(path.join(root, "src", "ui", "index.html"), "utf8");
    fs.readdirSync(path.join(root, "src", "ui")).filter((f) => f.endsWith(".js")).forEach((file) => {
        assert.ok(layout.indexOf(file) !== -1, file + " is not loaded by index.html");
    });
});

test("ui sends encoded code", () => {
    const text = fs.readFileSync(path.join(root, "src/ui/app-shell.js"), "utf8");
    assert.match(text, /\$se\("runCode", encodeURIComponent\(/);
});

test("editor function catalog matches the api docs", () => {
    const file = path.join(root, "src", "ui", "catalog.js");
    const before = fs.readFileSync(file, "utf8");
    require("child_process").execFileSync(process.execPath, [path.join(root, "tools", "generate-catalog.js")]);
    assert.equal(fs.readFileSync(file, "utf8"), before, "run node tools/generate-catalog.js");
});
