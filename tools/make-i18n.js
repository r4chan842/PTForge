"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourceDir = path.join(root, "i18n", "source");
const outDir = path.join(root, "i18n");

const languages = [
    ["en", "English", "../README.md"],
    ["fa", "فارسی"],
    ["de", "Deutsch"],
    ["es", "Español"],
    ["fr", "Français"],
    ["pt-BR", "Português"],
    ["ru", "Русский"],
    ["tr", "Türkçe"],
    ["ar", "العربية"],
    ["zh-CN", "中文"],
    ["ja", "日本語"]
];

const rtl = { fa: true, ar: true };

const featureKeys = ["devices", "links", "hosts", "ios", "switching", "routing", "security", "redundancy", "servers", "wireless", "inspection", "reachability", "snapshots", "files", "canvas", "topology", "simulation", "labcheck", "audit", "batch", "workspace"];
const exampleFolders = ["01-basics", "02-switching", "03-routing", "04-security", "05-services", "06-wireless", "07-canvas", "08-topology", "09-simulation", "10-ccna-labs", "11-inspection", "12-automation", "13-operations"];
const docLinks = ["docs/guides/getting-started.md", "docs/guides/editor.md", "docs/guides/terminal.md", "docs/guides/debugger.md", "docs/guides/network-tools.md", "docs/guides/writing-scripts.md", "docs/api/README.md", "docs/recipes/README.md", "docs/ccna/README.md", "docs/cheatsheets/ios-to-ptforge.md", "docs/architecture/overview.md", "docs/guides/troubleshooting.md", "docs/guides/limitations.md", "docs/guides/faq.md"];
const devCommands = ["npm test", "npm run bundle", "npm run catalog", "npm run reference", "npm run check", "npm run ui-test", "npm run screenshots"];

const taste = [
    "buildLan({ switchName: \"S1\", hosts: 4, network: \"192.168.10.0/24\", x: 300, y: 250 });",
    "addDevice(\"R1\", \"2911\", 300, 80);",
    "addLink(\"R1\", \"GigabitEthernet0/0\", \"S1\", \"GigabitEthernet0/1\", \"straight\");",
    "",
    "basicSetup(\"R1\", { secret: \"class\", consolePassword: \"cisco\", banner: \"Authorized access only\" });",
    "setInterfaceIp(\"R1\", \"GigabitEthernet0/0\", \"192.168.10.1/24\");",
    "configureSsh(\"R1\", { domain: \"lab.local\", username: \"admin\", password: \"Adm1n!Pass\" });",
    "",
    "createVlans(\"S1\", { 10: \"USERS\", 99: \"MGMT\" });",
    "setAccessPort(\"S1\", [\"FastEthernet0/1\", \"FastEthernet0/2\"], 10, { portfast: true, bpduguard: true });",
    "configurePortSecurity(\"S1\", [\"FastEthernet0/1\", \"FastEthernet0/2\"], { maximum: 2 });",
    "",
    "drawZoneAround([\"S1\", \"PC1\", \"PC2\", \"PC3\", \"PC4\"], \"VLAN 10 - Users\", \"green\");",
    "labelAllDevices();",
    "",
    "takeSnapshot(\"baseline\");",
    "pingAll();"
].join("\n");

const toolsCode = [
    "pingAll();",
    "takeSnapshot(\"before\");",
    "configureOspf(\"R1\", { routerId: \"1.1.1.1\", networks: [\"10.0.0.0/30\"] });",
    "compareSnapshots(\"before\");"
].join("\n");

const verifyCode = [
    "beginChecks(\"VLAN lab\");",
    "checkVlan(\"S1\", 10, 2);",
    "checkLinked(\"R1\", \"S1\");",
    "checkIpAddress(\"PC1\", \"FastEthernet0\", \"192.168.10.11\", 24);",
    "checkConfigContains(\"S1\", \"switchport mode trunk\");",
    "endChecks();",
    "",
    "auditNetwork();",
    "runOnAll(\"show ip interface brief\");"
].join("\n");

const layout = [
    "PTForge/",
    "├── .github/",
    "├── assets/",
    "│   ├── brand/",
    "│   ├── banners/",
    "│   └── screenshots/",
    "├── docs/",
    "│   ├── api/",
    "│   ├── architecture/",
    "│   ├── ccna/",
    "│   ├── cheatsheets/",
    "│   ├── guides/",
    "│   ├── recipes/",
    "│   └── reference/",
    "├── examples/",
    "├── i18n/",
    "├── release/",
    "├── src/",
    "│   ├── api/",
    "│   ├── core/",
    "│   ├── data/",
    "│   ├── lib/",
    "│   └── ui/",
    "├── templates/",
    "├── tests/",
    "└── tools/"
];

const uiFiles = "`index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`";

function up(link) {
    return /^(https?:|#|mailto:)/.test(link) ? link : "../" + link;
}

function localize(text) {
    return String(text).replace(/\]\(([^)\s]+)\)/g, (all, link) => "](" + up(link) + ")");
}

function table(head, rows) {
    return ["| " + head.join(" | ") + " |", "|" + head.map(() => "---").join("|") + "|"].concat(rows.map((r) => "| " + r.join(" | ") + " |")).join("\n");
}

function need(s, key, count) {
    const value = s[key];
    if (value === undefined) {
        throw new Error(s.__lang + ": missing " + key);
    }
    if (count !== undefined && (!Array.isArray(value) || value.length !== count)) {
        throw new Error(s.__lang + ": " + key + " needs " + count + " items");
    }
    return value;
}

function img(src, alt, width) {
    return "<img src=\"../" + src + "\" alt=\"" + alt + "\" width=\"" + width + "\">";
}

function pair(a, b) {
    return "<table>\n<tr>\n<td>" + a + "</td>\n<td>" + b + "</td>\n</tr>\n</table>";
}

function cell(src, caption) {
    return img(src, caption.replace(/<[^>]+>/g, ""), "100%") + "<br><sub>" + caption + "</sub>";
}

function build(code, name) {
    const s = JSON.parse(fs.readFileSync(path.join(sourceDir, code + ".json"), "utf8"));
    s.__lang = code;
    const L = (key, count) => localize(need(s, key, count));
    const A = (key, count) => need(s, key, count).map(localize);
    const bar = languages.map(([c, label, link]) => c === code ? "**" + label + "**" : "[" + label + "](" + (link || "README." + c + ".md") + ")").join(" ·\n");
    const nav = A("nav", 6);
    const navLinks = ["#quick-start", "../docs/guides/installation.md", "../docs/README.md", "../docs/api/README.md", "../examples/README.md", "../docs/ccna/README.md"];
    const heads = need(s, "headings");
    const H = (key) => {
        if (!heads[key]) {
            throw new Error(code + ": missing heading " + key);
        }
        return heads[key];
    };
    const out = [];
    if (rtl[code]) {
        out.push("<div dir=\"rtl\">", "");
    }
    out.push(
        "> [!WARNING]", "> " + L("warning"), "",
        "<div align=\"center\">", "",
        "<picture>",
        "  <source media=\"(prefers-color-scheme: dark)\" srcset=\"../assets/brand/logo-dark.svg\">",
        "  <img src=\"../assets/brand/logo.svg\" alt=\"PTForge\" width=\"300\">",
        "</picture>", "", "<br><br>", "",
        "**" + L("tagline") + "**", "",
        "[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)",
        "[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)",
        "![Functions](https://img.shields.io/badge/functions-388-1A5DB7)",
        "![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)",
        "![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)", "",
        nav.map((t, i) => "[" + t + "](" + (i === 0 ? "#" + slug(H("quick")) : navLinks[i]) + ")").join(" ·\n"), "",
        bar, "",
        "</div>", "", "---", "",
        "> " + L("note"), "",
        "## " + H("why"), "",
        L("why1"), "", L("why2"), "",
        A("bullets", 6).map((b) => "- " + b).join("\n"), "",
        "<div align=\"center\">", img("assets/screenshots/editor.png", "PTForge", "95%"), "<br><sub>" + L("editorCaption") + "</sub>", "</div>", "",
        "## " + H("new"), "",
        table(["", ""], need(s, "news", 6).map((r) => ["**" + r[0] + "**", localize(r[1])])), "",
        "## " + H("quick"), "",
        A("quick", 5).map((q, i) => (i + 1) + ". " + q).join("\n"), "",
        "## " + H("taste"), "",
        "```js", taste, "```", "",
        L("tasteAfter"), "",
        "## " + H("features"), "",
        table(A("featureHead", 2), featureKeys.map((k, i) => {
            const row = need(s.features, k, 2);
            return ["**" + row[0] + "**", localize(row[1])];
        })), "",
        L("buildNote"), "",
        "## " + H("editor"), "",
        "<div align=\"center\">" + img("assets/banners/editor.svg", "Editor", "100%") + "</div>", "",
        L("editorIntro"), "",
        table(A("partHead", 2), need(s, "editorRows", 12).map((r) => ["**" + r[0] + "**", localize(r[1])])), "",
        pair(cell("assets/screenshots/lab-check.png", L("shotLab")), cell("assets/screenshots/command-palette.png", L("shotPalette"))).replace("</tr>\n</table>", "</tr>\n<tr>\n<td>" + cell("assets/screenshots/problems.png", L("shotProblems")) + "</td>\n<td>" + cell("assets/screenshots/find-replace.png", L("shotFind")) + "</td>\n</tr>\n</table>"), "",
        "## " + H("terminal"), "",
        "<div align=\"center\">" + img("assets/banners/terminal.svg", "Terminal", "100%") + "</div>", "",
        L("terminalIntro"), "",
        table(A("featureHead2", 2), need(s, "terminalRows", 5).map((r) => ["**" + r[0] + "**", localize(r[1])])), "",
        "<div align=\"center\">" + img("assets/screenshots/terminal.png", "Terminal", "95%") + "</div>", "",
        L("terminalRead"), "",
        "## " + H("debugger"), "",
        "<div align=\"center\">" + img("assets/banners/debugger.svg", "Debugger", "100%") + "</div>", "",
        L("debuggerIntro"), "",
        table(A("featureHead2", 2), need(s, "debuggerRows", 8).map((r) => ["**" + r[0] + "**", localize(r[1])])), "",
        "<div align=\"center\">" + img("assets/screenshots/debugger.png", "Debugger", "95%") + "</div>", "",
        L("debuggerRead"), "",
        "## " + H("tools"), "",
        "<div align=\"center\">" + img("assets/banners/network-tools.svg", "Network tools", "100%") + "</div>", "",
        "```js", toolsCode, "```", "",
        "<table>\n<tr>\n<td>" + cell("assets/screenshots/reachability.png", L("shotReach")) + "</td>\n<td>" + cell("assets/screenshots/snapshot-diff.png", L("shotDiff")) + "</td>\n</tr>\n<tr>\n<td>" + cell("assets/screenshots/calculator.png", L("shotCalc")) + "</td>\n<td>" + cell("assets/screenshots/vlsm.png", L("shotVlsm")) + "</td>\n</tr>\n</table>", "",
        L("toolsRead"), "",
        "## " + H("verify"), "",
        "<div align=\"center\">" + img("assets/banners/lab-check.svg", "Lab Check", "100%") + "</div>", "",
        "```js", verifyCode, "```", "",
        L("verifyRead"), "",
        "## " + H("install"), "",
        L("installIntro"), "",
        A("installSteps", 6).map((q, i) => (i + 1) + ". " + q.replace("{files}", uiFiles)).join("\n"), "",
        L("installMore"), "",
        "## " + H("examples"), "",
        L("examplesIntro"), "",
        table(A("exampleHead", 2), exampleFolders.map((f, i) => ["`" + f + "`", localize(need(s, "exampleRows", 13)[i])])), "",
        L("templates"), "",
        "## " + H("docs"), "",
        table(A("docHead", 2), need(s, "docRows", 14).map((r, i) => ["[" + r[0] + "](../" + docLinks[i] + ")", localize(r[1])])), "",
        "## " + H("layout"), "",
        "```", layout.join("\n"), "```", "",
        "## " + H("dev"), "",
        L("devIntro"), "",
        "```", "git clone https://github.com/r4chan842/PTForge.git", "cd PTForge", "npm run check", "```", "",
        table(A("devHead", 2), devCommands.map((c, i) => ["`" + c + "`", localize(need(s, "devRows", 7)[i])])), "",
        L("devNote"), "",
        "## " + H("contributing"), "",
        L("contributing"), "",
        "## " + H("license"), "",
        L("license"), "",
        "## " + H("thanks"), "",
        L("thanks1"), "", L("thanks2"), "",
        "<div align=\"center\">", "<sub>" + L("footer") + "</sub>", "</div>"
    );
    if (rtl[code]) {
        out.push("", "</div>");
    }
    fs.writeFileSync(path.join(outDir, "README." + code + ".md"), out.join("\n") + "\n");
    return name;
}

function slug(text) {
    return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
}

const built = languages.filter(([code]) => code !== "en" && fs.existsSync(path.join(sourceDir, code + ".json"))).map(([code, name]) => build(code, name));
console.log("wrote " + built.length + " translations: " + built.join(", "));
