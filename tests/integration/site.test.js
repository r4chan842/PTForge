const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..", "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "ptforge-site-"));
execFileSync(process.execPath, [path.join(root, "tools", "build-site.js"), out]);

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

const html = walk(out).filter((f) => f.endsWith(".html"));

test("site has the index, introduction, search and every translation", () => {
    ["index.html", "introduction.html", "search.html", "api/links.html"].forEach((f) => assert.ok(fs.existsSync(path.join(out, f)), f));
    fs.readdirSync(path.join(root, "docs", "translations")).forEach((l) => assert.ok(fs.existsSync(path.join(out, "translations", l + ".html")), l));
    assert.ok(html.length > 60);
});

test("every local link and asset in the site resolves", () => {
    const missing = [];
    html.forEach((file) => {
        const text = fs.readFileSync(file, "utf8");
        for (const m of text.matchAll(/(?:href|src|value)="([^"#]+)(?:#[^"]*)?"/g)) {
            if (/^(https?:|mailto:)/.test(m[1])) continue;
            const target = path.join(path.dirname(file), m[1].split("?")[0]);
            if (!fs.existsSync(target)) missing.push(path.relative(out, file) + " -> " + m[1]);
        }
    });
    assert.deepStrictEqual(missing, []);
});

test("every anchor in the site points to an existing id", () => {
    const ids = {};
    html.forEach((f) => { ids[f] = new Set([...fs.readFileSync(f, "utf8").matchAll(/id="([^"]+)"/g)].map((m) => m[1])); });
    const missing = [];
    html.forEach((file) => {
        for (const m of fs.readFileSync(file, "utf8").matchAll(/href="([^"]*)#([^"]+)"/g)) {
            if (/^https?:/.test(m[1])) continue;
            const target = m[1] ? path.join(path.dirname(file), m[1]) : file;
            if (ids[target] && !ids[target].has(m[2])) missing.push(path.relative(out, file) + " -> " + m[1] + "#" + m[2]);
        }
    });
    assert.deepStrictEqual(missing, []);
});

test("every documented function has an entry", () => {
    const text = fs.readFileSync(path.join(out, "api", "links.html"), "utf8");
    assert.match(text, /id="fn-addlink"/);
    assert.ok(!/\$\{|undefined/.test(text));
});

test("rtl translations are marked", () => {
    assert.match(fs.readFileSync(path.join(out, "translations", "fa.html"), "utf8"), /dir="rtl"/);
});
