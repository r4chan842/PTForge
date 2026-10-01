"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const out = path.resolve(process.argv[2] || path.join(root, "site"));
const repo = "https://github.com/r4chan842/PTForge";
const blob = repo + "/blob/main/";
const tree = repo + "/tree/main/";
const version = require(path.join(root, "package.json")).version;

const languages = [
    ["en", "English"], ["fa", "فارسی"], ["de", "Deutsch"], ["es", "Español"], ["fr", "Français"],
    ["pt-BR", "Português"], ["ru", "Русский"], ["tr", "Türkçe"], ["ar", "العربية"], ["zh-CN", "中文"], ["ja", "日本語"]
];
const rtl = new Set(["fa", "ar"]);

const sources = execSync("git ls-files", { cwd: root }).toString().split("\n")
    .filter((f) => f && !path.basename(f).includes(".") && !f.startsWith("tools/") && !f.startsWith(".github/"))
    .concat(fs.readdirSync(path.join(root, "docs", "translations")).map((f) => "docs/translations/" + f))
    .filter((f, i, all) => all.indexOf(f) === i && fs.statSync(path.join(root, f)).isFile());

function pageOf(file) {
    if (file === "docs/README") {
        return "index.html";
    }
    if (file === "README") {
        return "introduction.html";
    }
    const rel = file.startsWith("docs/") ? file.slice(5) : "project/" + file;
    return rel.replace(/\/README$/, "/index") + ".html";
}

function titleOf(text, file) {
    const m = text.match(/^(.+)\n=+\s*$/m);
    if (file === "README") {
        return "Introduction";
    }
    return m ? m[1].trim() : path.basename(file);
}

const pages = {};
sources.forEach((file) => {
    const text = fs.readFileSync(path.join(root, file), "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    pages[file] = { file, text, page: pageOf(file), title: titleOf(text, file) };
});

function escape(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function relative(from, to) {
    const rel = path.posix.relative(path.posix.dirname(from), to);
    return rel || path.posix.basename(to);
}

function resolveUrl(url, from) {
    const local = url.startsWith(blob) ? url.slice(blob.length) : url.startsWith(tree) ? url.slice(tree.length) : null;
    if (local === null) {
        return { href: url, title: null };
    }
    const [file, hash] = local.split("#");
    const clean = file.replace(/\/$/, "");
    const target = pages[clean] || pages[clean + "/README"];
    if (target) {
        return { href: relative(from, target.page) + (hash ? "#" + hash : ""), title: target.title };
    }
    return { href: url, title: null };
}

function inline(text, from) {
    return text.split(/(https?:\/\/[^\s<>"]*[^\s<>".,;:)\u3002])/).map((part, i) => {
        if (i % 2 === 0) {
            return escape(part);
        }
        const link = resolveUrl(part, from);
        return "<a href=\"" + escape(link.href) + "\">" + escape(link.title || part) + "</a>";
    }).join("");
}

function listItem(text, from) {
    const m = text.match(/^([^:]{1,60}?):\s+(https?:\/\/\S+?)([.,;]?)(\s+(.*))?$/);
    if (m && !/https?:/.test(m[1])) {
        const link = resolveUrl(m[2], from);
        const rest = m[5] ? " <span class=\"note\">" + inline(m[5], from) + "</span>" : "";
        return "<a href=\"" + escape(link.href) + "\">" + escape(m[1]) + "</a>" + rest;
    }
    const lone = text.match(/^(https?:\/\/\S+)$/);
    if (lone) {
        return inline(lone[1], from);
    }
    return inline(text, from);
}

function slug(text, used) {
    let base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) {
        id = base + "-" + n;
    }
    used.add(id);
    return id;
}

function render(doc) {
    const lines = doc.text.split("\n");
    const html = [];
    const toc = [];
    const used = new Set();
    const bigHeads = lines.filter((l, i) => /^=+$/.test(l) && i > 0 && lines[i - 1].trim()).length;
    let first = true;
    let i = 0;

    if (doc.file === "LICENSE" || doc.file.endsWith("/LICENSE")) {
        return { html: "<pre class=\"text\">" + escape(doc.text) + "</pre>", toc };
    }

    while (i < lines.length) {
        const line = lines[i];
        const next = lines[i + 1] || "";

        if (!line.trim()) {
            i++;
            continue;
        }

        if (line.trim() && !line.startsWith(" ") && /^(=+|-+)$/.test(next) && next.length >= 3) {
            const text = line.trim();
            let level = next[0] === "=" ? 2 : bigHeads > 1 ? 3 : 2;
            if (first && next[0] === "=") {
                level = 1;
            }
            first = false;
            if (level === 1) {
                html.push("<h1>" + inline(text, doc.page) + "</h1>");
            } else {
                const id = slug(text, used);
                toc.push({ level, text, id });
                html.push("<h" + level + " id=\"" + id + "\">" + inline(text, doc.page) + "<a class=\"anchor\" href=\"#" + id + "\">¶</a></h" + level + ">");
            }
            i += 2;
            continue;
        }

        const sig = line.match(/^(\w+)\((.*)\)(?: -> (.+))?$/);
        if (sig && (!next.trim() || next.startsWith("    "))) {
            const desc = [];
            i++;
            while (i < lines.length && lines[i].startsWith("    ")) {
                desc.push(lines[i].trim());
                i++;
            }
            const id = slug("fn-" + sig[1], used);
            html.push("<dl class=\"function\" id=\"" + id + "\"><dt><code><span class=\"name\">" + escape(sig[1]) + "</span>(" + escape(sig[2]) + ")" +
                (sig[3] ? " <span class=\"returns\">→ " + escape(sig[3]) + "</span>" : "") + "</code><a class=\"anchor\" href=\"#" + id + "\">¶</a></dt>" +
                (desc.length ? "<dd>" + desc.map((d) => inline(d, doc.page)).join("<br>") + "</dd>" : "") + "</dl>");
            continue;
        }

        if (line.startsWith("    ")) {
            const block = [];
            while (i < lines.length && (lines[i].startsWith("    ") || (!lines[i].trim() && (lines[i + 1] || "").startsWith("    ")))) {
                block.push(lines[i].slice(4));
                i++;
            }
            html.push("<pre>" + escape(block.join("\n")) + "</pre>");
            continue;
        }

        const bullet = /^([*-]|\d+\.) /;
        if (bullet.test(line)) {
            const ordered = /^\d+\./.test(line);
            const items = [];
            while (i < lines.length && (bullet.test(lines[i]) || (/^ {2,3}\S/.test(lines[i]) && items.length))) {
                if (bullet.test(lines[i])) {
                    items.push(lines[i].replace(bullet, "").replace(/^\[( |x)\] /, (m, x) => x === "x" ? "\u2611 " : "\u2610 "));
                } else {
                    items[items.length - 1] += " " + lines[i].trim();
                }
                i++;
            }
            const tag = ordered ? "ol" : "ul";
            html.push("<" + tag + ">" + items.map((t) => "<li>" + listItem(t, doc.page) + "</li>").join("") + "</" + tag + ">");
            continue;
        }

        const para = [];
        while (i < lines.length && lines[i].trim() && !lines[i].startsWith("    ") && !bullet.test(lines[i]) && !/^(=+|-+)$/.test(lines[i + 1] || "")) {
            para.push(lines[i].trim());
            i++;
        }
        if (!para.length) {
            para.push(lines[i].trim());
            i++;
        }
        const text = para.join(" ");
        const warn = text.match(/^WARNING:\s*(.*)$/);
        if (warn) {
            html.push("<div class=\"admonition warning\"><p class=\"admonition-title\">Warning</p><p>" + inline(warn[1], doc.page) + "</p></div>");
        } else {
            html.push("<p>" + inline(text, doc.page) + "</p>");
        }
    }
    return { html: html.join("\n"), toc };
}

function sections(doc) {
    const result = [];
    let current = null;
    doc.text.split("\n").forEach((line, i, all) => {
        if (/^-{3,}$/.test(all[i + 1] || "") && line.trim()) {
            current = { title: line.trim(), items: [] };
            result.push(current);
            return;
        }
        const m = line.match(/^\* ([^:]+):\s+(https?:\/\/\S+)/);
        if (m && current) {
            current.items.push({ label: m[1], url: m[2] });
        }
    });
    return result;
}

const index = pages["docs/README"];
const contents = sections(index);

function sidebar(from) {
    const groups = contents.map((s) => "<p class=\"caption\">" + escape(s.title) + "</p><ul>" +
        s.items.map((it) => {
            const link = resolveUrl(it.url, from);
            return "<li><a href=\"" + escape(link.href) + "\">" + escape(it.label) + "</a></li>";
        }).join("") + "</ul>").join("");
    return groups + "<p class=\"caption\">Translations</p><ul><li><a href=\"" + relative(from, "index.html") + "#translations\">Translations</a></li></ul>";
}

function languageMenu(from, current) {
    const options = languages.map(([code, name]) => {
        const target = code === "en" ? "introduction.html" : "translations/" + code + ".html";
        return "<option value=\"" + escape(relative(from, target)) + "\"" + (code === current ? " selected" : "") + ">" + escape(name) + "</option>";
    }).join("");
    return "<select class=\"language\" aria-label=\"Language\" onchange=\"location.href=this.value\">" + options + "</select>";
}

function layout(doc, body, toc) {
    const from = doc.page;
    const up = (p) => relative(from, p);
    const lang = doc.file.startsWith("docs/translations/") ? path.basename(doc.file) : "en";
    const dir = rtl.has(lang) ? " dir=\"rtl\"" : "";
    const local = toc.length > 2 ? "<div class=\"localtoc\"><p class=\"caption\">This Page</p><ul>" +
        toc.map((t) => "<li class=\"l" + t.level + "\"><a href=\"#" + t.id + "\">" + escape(t.text) + "</a></li>").join("") + "</ul></div>" : "";
    const source = blob + doc.file;
    return "<!DOCTYPE html>\n<html lang=\"" + lang + "\">\n<head>\n<meta charset=\"utf-8\">\n" +
        "<meta name=\"viewport\" content=\"width=1000\">\n" +
        "<title>" + escape(doc.title) + (doc.page === "index.html" ? "" : " — PTForge documentation") + "</title>\n" +
        "<link rel=\"icon\" href=\"" + up("_static/logo.svg") + "\">\n" +
        "<link rel=\"stylesheet\" href=\"" + up("_static/style.css") + "\">\n</head>\n<body>\n" +
        "<div class=\"document\">\n<nav class=\"sidebar\">\n" +
        "<a class=\"brand\" href=\"" + up("index.html") + "\"><img src=\"" + up("_static/logo.svg") + "\" alt=\"PTForge logo\"></a>\n" +
        "<h1 class=\"project\"><a href=\"" + up("index.html") + "\">PTForge</a></h1>\n" +
        "<p class=\"version\">" + version + "</p>\n" +
        "<h3>Quick search</h3>\n<form class=\"search\" action=\"" + up("search.html") + "\" method=\"get\"><input type=\"text\" name=\"q\" aria-label=\"Search\"><button type=\"submit\">Go</button></form>\n" +
        "<h3>Contents</h3>\n<div class=\"contents\">" + sidebar(from) + "</div>\n" + local +
        "<h3>This Page</h3>\n<ul class=\"plain\"><li><a href=\"" + escape(source) + "\">Show Source</a></li></ul>\n" +
        "</nav>\n<main class=\"body\"" + dir + ">\n<div class=\"topbar\"" + (dir ? " dir=\"ltr\"" : "") + ">" + languageMenu(from, lang) + "</div>\n" +
        body + "\n</main>\n</div>\n<footer>© PTForge contributors. Licensed under the MIT License. " +
        "Cisco and Packet Tracer are trademarks of Cisco Systems, Inc.</footer>\n</body>\n</html>\n";
}

function indexBody(doc) {
    const parts = ["<h1>PTForge documentation</h1>",
        "<p>This is the top level of the PTForge documentation tree. It holds every guide, reference page " +
        "and project file of the source tree, generated from the plain text files in the repository. The project is in early development and the documentation changes with it. Corrections are welcome in the " +
        "<a href=\"" + repo + "/issues\">issue tracker</a>.</p>",
        "<ul><li><a href=\"introduction.html\">Introduction</a> <span class=\"note\">the README of the source tree</span></li>" +
        "<li><a href=\"https://tutorials.ptnetacad.net/help/default/IpcAPI/annotated.html\">Cisco Packet Tracer API</a> <span class=\"note\">the official IPC reference</span></li></ul>"];
    const used = new Set();
    const toc = [];
    contents.forEach((s) => {
        const id = slug(s.title, used);
        toc.push({ level: 2, text: s.title, id });
        parts.push("<h2 id=\"" + id + "\">" + escape(s.title) + "<a class=\"anchor\" href=\"#" + id + "\">¶</a></h2>");
        parts.push("<ul>" + s.items.map((it) => {
            const link = resolveUrl(it.url, doc.page);
            return "<li><a href=\"" + escape(link.href) + "\">" + escape(it.label) + "</a></li>";
        }).join("") + "</ul>");
    });
    const id = slug("Translations", used);
    toc.push({ level: 2, text: "Translations", id });
    parts.push("<h2 id=\"" + id + "\">Translations<a class=\"anchor\" href=\"#" + id + "\">¶</a></h2>");
    parts.push("<p>The introduction is available in other languages. The English text is the reference.</p>");
    parts.push("<ul>" + languages.filter(([c]) => c !== "en").map(([c, n]) => "<li><a href=\"translations/" + c + ".html\">" + escape(n) + "</a></li>").join("") + "</ul>");
    return { html: parts.join("\n"), toc };
}

function searchPage() {
    const doc = { file: "docs/README", page: "search.html", title: "Search" };
    const body = "<h1>Search</h1>\n<form class=\"search wide\" action=\"search.html\" method=\"get\"><input type=\"text\" name=\"q\" id=\"q\" aria-label=\"Search\"><button type=\"submit\">Search</button></form>\n" +
        "<p id=\"summary\"></p>\n<ul id=\"results\" class=\"results\"></ul>\n" +
        "<script src=\"_static/searchindex.js\"></script>\n<script src=\"_static/search.js\"></script>";
    return layout(doc, body, []);
}

function plainText(html) {
    return html.replace(/<a class="anchor"[^>]*>¶<\/a>/g, "").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

const searchScript = `(function () {
    var params = new URLSearchParams(location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("q");
    var list = document.getElementById("results");
    var summary = document.getElementById("summary");
    input.value = query;
    if (!query) {
        summary.textContent = "Enter one or more words.";
        return;
    }
    var words = query.toLowerCase().split(/\\s+/);
    var hits = [];
    searchIndex.forEach(function (page) {
        var title = page.title.toLowerCase();
        var text = page.text.toLowerCase();
        var score = 0;
        for (var i = 0; i < words.length; i++) {
            var inTitle = title.indexOf(words[i]) >= 0;
            var inText = text.indexOf(words[i]) >= 0;
            var inName = page.names.indexOf(words[i]) >= 0;
            if (!inTitle && !inText && !inName) {
                return;
            }
            score += (inName ? 20 : 0) + (inTitle ? 10 : 0) + (inText ? 1 : 0);
        }
        hits.push({ page: page, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    summary.textContent = hits.length ? "Found " + hits.length + " page" + (hits.length === 1 ? "" : "s") + " matching the search query." :
        "Your search did not match any documents.";
    hits.forEach(function (hit) {
        var text = hit.page.text;
        var at = text.toLowerCase().indexOf(words[0]);
        var start = Math.max(0, at - 80);
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = hit.page.url;
        a.textContent = hit.page.title;
        var p = document.createElement("p");
        p.className = "context";
        p.textContent = (start > 0 ? "\\u2026" : "") + text.substr(start, 220) + "\\u2026";
        li.appendChild(a);
        li.appendChild(p);
        list.appendChild(li);
    });
})();
`;

const style = `:root {
    --ink: #1f2933;
    --muted: #5b6774;
    --accent: #1d2b3e;
    --link: #0b5f7a;
    --link-line: #9cc4d1;
    --side: #eef2f5;
    --rule: #d5dde4;
    --code: #f3f6f8;
    --warn: #fbf3e3;
    --warn-line: #d9a441;
}
* { box-sizing: border-box; }
html { font-size: 15px; }
body { margin: 0; color: var(--ink); background: #fff; font-family: Georgia, "Times New Roman", "DejaVu Serif", serif; line-height: 1.5; }
.document { display: flex; max-width: 1100px; margin: 0 auto; padding: 18px 16px 0; gap: 28px; }
.sidebar { flex: 0 0 200px; font-size: 0.9rem; }
.sidebar .brand img { display: block; width: 120px; height: 120px; margin: 4px auto 14px; }
.sidebar .project { margin: 0; font-size: 1.75rem; font-weight: bold; line-height: 1.2; }
.sidebar .project a { color: var(--accent); text-decoration: none; border: 0; }
.sidebar .version { margin: 4px 0 18px; color: var(--muted); }
.sidebar h3 { margin: 20px 0 6px; font-size: 1.15rem; font-weight: normal; color: var(--accent); }
.sidebar ul { list-style: none; margin: 0; padding: 0; }
.sidebar a { color: var(--ink); text-decoration: none; border: 0; }
.sidebar a:hover { color: var(--link); text-decoration: underline; }
.contents { background: var(--side); padding: 2px 0; }
.contents .caption, .localtoc .caption { margin: 10px 0 2px; padding: 0 6px; font-weight: bold; color: var(--accent); }
.contents li, .localtoc li { padding: 1px 6px; }
.localtoc { margin-top: 18px; }
.localtoc .l3 { padding-left: 18px; }
.search { display: flex; }
.search input { flex: 1; min-width: 0; padding: 3px 5px; border: 1px solid #b9c3cc; font: inherit; }
.search button { padding: 3px 10px; border: 1px solid #b9c3cc; border-left: 0; background: var(--side); font: inherit; cursor: pointer; }
.search.wide { max-width: 520px; }
.body { flex: 1; min-width: 0; padding-bottom: 40px; }
.body::after { content: ""; display: block; height: 70vh; }
.topbar { display: flex; justify-content: flex-end; }
.language { font: inherit; font-size: 0.85rem; padding: 3px 6px; background: var(--side); border: 1px solid var(--rule); color: var(--ink); }
h1, h2, h3 { font-weight: normal; color: var(--accent); line-height: 1.25; }
h1 { font-size: 1.6rem; margin: 0 0 12px; }
h2 { font-size: 1.3rem; margin: 26px 0 8px; }
h3 { font-size: 1.2rem; margin: 24px 0 8px; }
.anchor { visibility: hidden; margin-left: 6px; font-size: 0.8em; color: var(--muted); border: 0; text-decoration: none; }
h2:hover .anchor, h3:hover .anchor, dt:hover .anchor { visibility: visible; }
p { margin: 0 0 12px; }
a { color: var(--link); text-decoration: none; border-bottom: 1px solid var(--link-line); }
a:hover { border-bottom-color: var(--link); }
ul, ol { margin: 0 0 14px; padding-left: 26px; }
li { margin: 2px 0; }
.note { color: var(--muted); }
pre { background: var(--code); border: 1px solid var(--rule); padding: 10px 12px; overflow-x: auto; font-size: 0.8rem; line-height: 1.4; }
pre, code { font-family: Consolas, "DejaVu Sans Mono", Menlo, monospace; }
pre.text { white-space: pre-wrap; background: #fff; border: 0; padding: 0; }
dl.function { margin: 0 0 12px; }
dl.function dt { font-size: 0.88rem; }
dl.function dt code { background: var(--code); padding: 1px 6px; border-left: 3px solid var(--accent); }
dl.function .name { font-weight: bold; color: var(--accent); }
dl.function .returns { color: var(--muted); }
dl.function dd { margin: 4px 0 0 24px; }
.admonition { margin: 0 0 16px; padding: 8px 14px; background: var(--warn); border-left: 4px solid var(--warn-line); }
.admonition-title { margin: 0 0 4px; font-weight: bold; }
.admonition p:last-child { margin-bottom: 0; }
.results { list-style: none; padding: 0; }
.results li { margin: 0 0 14px; }
.results .context { margin: 2px 0 0; color: var(--muted); font-size: 0.9rem; }
footer { max-width: 1180px; margin: 0 auto; padding: 18px 24px 28px; font-size: 0.8rem; color: var(--muted); text-align: right; }
[dir="rtl"] { text-align: right; }
[dir="rtl"] ul, [dir="rtl"] ol { padding-left: 0; padding-right: 26px; }
`;

function write(rel, data) {
    const file = path.join(out, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
}

fs.rmSync(out, { recursive: true, force: true });
const search = [];
Object.values(pages).forEach((doc) => {
    const result = doc === index ? indexBody(doc) : render(doc);
    write(doc.page, layout(doc, result.html, result.toc));
    search.push({
        title: doc.title,
        url: doc.page,
        names: (doc.text.match(/^\w+(?=\()/gm) || []).join(" ").toLowerCase(),
        text: plainText(result.html).slice(0, 20000)
    });
});
write("search.html", searchPage());
write("_static/style.css", style);
write("_static/search.js", searchScript);
write("_static/searchindex.js", "var searchIndex = " + JSON.stringify(search) + ";\n");
write("_static/logo.svg", fs.readFileSync(path.join(root, "assets", "brand", "icon.svg")));
write(".nojekyll", "");
console.log("site: " + (Object.keys(pages).length + 1) + " pages in " + path.relative(root, out));
