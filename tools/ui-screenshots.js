"use strict";

const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { initScript } = require("./ui-harness");
const { labSetup } = require("./ui-lab");

const root = path.join(__dirname, "..");
const page = "file://" + path.join(root, "src", "ui", "index.html");
const out = (name) => path.join(root, "assets", "screenshots", name);

const lab = [
    "// Campus lab: two VLANs, router on a stick, graded at the end",
    "var vlans = { 10: \"SALES\", 20: \"IT\" };",
    "",
    "addDevice(\"R1\", \"2911\", 320, 80);",
    "addDevice(\"S1\", \"2960-24TT\", 320, 220);",
    "addLink(\"R1\", \"GigabitEthernet0/0\", \"S1\", \"GigabitEthernet0/1\", \"straight\");",
    "",
    "createVlans(\"S1\", vlans);",
    "setTrunkPort(\"S1\", \"GigabitEthernet0/1\", [10, 20]);",
    "routerOnAStick(\"R1\", \"GigabitEthernet0/0\", {",
    "    10: \"192.168.10.1/24\",",
    "    20: \"192.168.20.1/24\"",
    "});",
    "",
    "/* Check the result */",
    "beginChecks(\"VLAN lab\");",
    "checkVlan(\"S1\", 10, 2);",
    "checkLinked(\"R1\", \"S1\");",
    "for (var i = 1; i <= 2; i++) {",
    "    check(\"PC\" + i + \" has an address\", function () {",
    "        return /^192\\.168\\./.test(getPortInfo(\"PC\" + i, \"FastEthernet0\").ip);",
    "    });",
    "}",
    "endChecks();",
    ""
].join("\n");

const report = { title: "VLAN lab", total: 5, passed: 4, failed: 1, score: 5, maxScore: 6, percent: 83, items: [
    { name: "VLAN 10 exists on S1", passed: true, points: 2, hint: "" },
    { name: "R1 is cabled to S1", passed: true, points: 1, hint: "" },
    { name: "S1 config contains \"switchport mode trunk\"", passed: true, points: 1, hint: "" },
    { name: "PC1 has an address", passed: true, points: 1, hint: "" },
    { name: "PC2 has an address", passed: false, points: 1, hint: "found 0.0.0.0 0.0.0.0" }] };
const audit = { errors: 1, warnings: 2, infos: 1, findings: [
    { severity: "error", rule: "subnet-mismatch", device: "R1", port: "GigabitEthernet0/1", message: "10.0.0.1/30 and R2 GigabitEthernet0/0 10.0.0.9/30 are not in the same subnet" },
    { severity: "warning", rule: "vlan1-access", device: "S1", port: "FastEthernet0/5", message: "Active access port is still in VLAN 1" },
    { severity: "warning", rule: "link-down", device: "S1", port: "FastEthernet0/7", message: "Link to PC4 FastEthernet0 is down" },
    { severity: "info", rule: "no-port-security", device: "S1", port: "FastEthernet0/2", message: "Access port without port security" }] };
const devices = { links: 5, devices: [
    { name: "R1", type: "router", model: "2911", ports: [{ name: "GigabitEthernet0/0.10", ip: "192.168.10.1/24", up: true }, { name: "GigabitEthernet0/0.20", ip: "192.168.20.1/24", up: true }, { name: "GigabitEthernet0/1", ip: "10.0.0.1/30", up: true }] },
    { name: "R2", type: "router", model: "ISR4331", ports: [{ name: "GigabitEthernet0/0/0", ip: "10.0.0.2/30", up: true }] },
    { name: "S1", type: "switch", model: "2960-24TT", ports: [{ name: "FastEthernet0/1", ip: "", up: true }, { name: "FastEthernet0/2", ip: "", up: true }, { name: "FastEthernet0/7", ip: "", up: false }, { name: "GigabitEthernet0/1", ip: "", up: true }] },
    { name: "PC1", type: "pc", model: "PC-PT", ports: [{ name: "FastEthernet0", ip: "192.168.10.11/24", up: true }] },
    { name: "PC2", type: "pc", model: "PC-PT", ports: [{ name: "FastEthernet0", ip: "192.168.20.11/24", up: true }] },
    { name: "SRV", type: "server", model: "Server-PT", ports: [{ name: "FastEthernet0", ip: "192.168.10.10/24", up: true }] }] };

const debugSample = [
    "// Count router ports and find hosts without a gateway",
    "var routers = [\"R1\", \"R2\"];",
    "var plan = { network: \"10.0.0.0/24\", gateway: \"10.0.0.1\" };",
    "",
    "function portCount(name) {",
    "    var info = getDeviceInfo(name);",
    "    return info.ports.length;",
    "}",
    "",
    "var total = 0;",
    "for (var i = 0; i < routers.length; i++) {",
    "    total += portCount(routers[i]);",
    "}",
    "log(\"ports on routers: \" + total);",
    ""
].join("\n");

async function workbenchShots(browser) {
    const p = await browser.newPage({ viewport: { width: 1360, height: 820 }, deviceScaleFactor: 1.5 });
    await p.addInitScript(initScript(labSetup));
    await p.goto(page);
    await p.waitForTimeout(600);
    await p.evaluate((code) => { activeFile().name = "ports.js"; renderTabs(); renderExplorer(); activate(app.active); const e = activeEditor(); e.setValue(code); e.onInput({}); }, debugSample);

    await p.keyboard.press("Control+Backquote");
    await p.waitForTimeout(300);
    const say = async (text) => { await p.locator(".term:visible .term-input").fill(text); await p.keyboard.press("Enter"); await p.waitForTimeout(250); };
    await say("getDevices().length");
    await say("var r1 = getDeviceInfo(\"R1\")");
    await say("r1.ports.map(function (p) { return p.name + \" \" + (p.ip || \"-\"); })");
    await say(".calc 10.0.12.1/30");
    await say("pingAll ? \"ready\" : \"missing\"");
    await p.locator(".term:visible .term-input").fill("getDeviceIn");
    await p.evaluate(() => { app.panelHeight = 430; layout(); });
    await p.screenshot({ path: out("terminal.png") });
    await p.locator(".term:visible .term-input").fill("");

    await p.evaluate(() => { app.panelHeight = 230; layout(); toggleBreakpoint(app.active, 6); toggleBreakpoint(app.active, 12); addWatch("total + 1"); addWatch("routers.length"); });
    await p.keyboard.press("F5");
    await p.waitForTimeout(900);
    await p.keyboard.press("F5");
    await p.waitForTimeout(200);
    await p.evaluate(() => { debugState.expanded["scope:0/info"] = true; renderDebugView(); });
    await p.locator("#debug-console-input").fill("routers.join(\" + \")");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(200);
    await p.screenshot({ path: out("debugger.png") });
    await p.keyboard.press("Shift+F5");
    await p.waitForTimeout(200);

    await p.evaluate(() => openCalculator("ipv4"));
    await p.waitForTimeout(300);
    await p.locator(".calc-page .vt-input").first().fill("172.16.35.9/19");
    await p.waitForTimeout(200);
    await p.screenshot({ path: out("calculator.png") });
    await p.click("[data-calc-tool=\"vlsm\"]");
    await p.waitForTimeout(250);
    await p.screenshot({ path: out("vlsm.png") });

    await p.evaluate(() => runCommandId("net.reach"));
    await p.waitForTimeout(1300);
    await p.screenshot({ path: out("reachability.png") });

    await p.evaluate(() => callEngine("editorSnapshot", "take", "before"));
    await p.waitForTimeout(300);
    await p.evaluate(() => {
        window.__engine.eval("labConfigs.R2 = labConfigs.R2.replace('end', 'interface GigabitEthernet0/0\\n ip address 192.168.5.1 255.255.255.0\\n no shutdown\\nend'); world.devices.R2.ports.filter(function (x) { return x.name === 'GigabitEthernet0/0'; })[0].ip = '192.168.5.1'; world.devices.R2.ports.filter(function (x) { return x.name === 'GigabitEthernet0/0'; })[0].mask = '255.255.255.0';");
    });
    await p.evaluate(() => compareSnapshotsUi("before", ""));
    await p.waitForTimeout(600);
    await p.evaluate(() => showView("devices"));
    await p.waitForTimeout(400);
    await p.screenshot({ path: out("snapshot-diff.png") });
    await p.close();
}

(async () => {
    const browser = await chromium.launch();
    const p = await browser.newPage({ viewport: { width: 1360, height: 820 }, deviceScaleFactor: 1.5 });
    await p.addInitScript(() => {
        window.__store = {};
        window.$se = function () {};
        window.$putData = (k, v) => { window.__store[k] = v; return Promise.resolve(); };
        window.$getData = (k) => Promise.resolve(window.__store[k] || null);
    });
    await p.goto(page);
    await p.waitForTimeout(300);
    await p.evaluate((text) => {
        activeFile().name = "vlan-lab.js";
        newFile("ospf-area0.js", "configureOspf(\"R1\", { routerId: \"1.1.1.1\", networks: [\"10.0.0.0/30\"] });\n");
        newFile("audit.js", "auditNetwork();\n");
        activate(app.open[0]);
        activeEditor().setValue(text);
        activeFile().text = text;
        activeFile().saved = text;
        app.files[app.open[1]].saved = "";
        renderTabs();
        renderExplorer();
        receiveOutput({ kind: "run", text: "Running vlan-lab.js (25 lines)" });
        receiveOutput({ kind: "log", text: "R1 GigabitEthernet0/0.10 192.168.10.1\nR1 GigabitEthernet0/0.20 192.168.20.1" });
        receiveOutput({ kind: "done", text: "Finished in 184 ms" });
        showPanel("output");
        lintNow();
    }, lab);
    await p.evaluate(() => { app.folder = { name: "labs", path: "C:/labs", files: [{ name: "ccna-final.js", path: "C:/labs/ccna-final.js" }, { name: "dhcp-relay.js", path: "C:/labs/dhcp-relay.js" }, { name: "notes.md", path: "C:/labs/notes.md" }] }; renderExplorer(); });
    const ed = await p.evaluate(() => activeEditor().getValue().length);
    await p.evaluate((n) => { const e = activeEditor(); e.focus(); e.input.setSelectionRange(n, n); e.updateCursor(); }, ed);
    await p.keyboard.type("getSw");
    await p.waitForTimeout(200);
    await p.screenshot({ path: out("editor.png") });

    await p.keyboard.press("Escape");
    await p.evaluate((n) => { const e = activeEditor(); e.replaceRange(n, e.getValue().length, ""); e.goToLine(1); }, ed);
    await p.evaluate((data) => {
        receiveOutput({ kind: "report", text: JSON.stringify(data.report) });
        showView("devices");
        receiveOutput({ kind: "devices", text: JSON.stringify(data.devices) });
        document.querySelectorAll(".dev-head").forEach((h, i) => { if (i < 3) h.classList.remove("collapsed"); });
        app.panelHeight = 300; layout();
    }, { report, devices });
    await p.screenshot({ path: out("lab-check.png") });

    await p.evaluate((a) => { receiveOutput({ kind: "audit", text: JSON.stringify(a) }); showView("tools"); }, audit);
    await p.screenshot({ path: out("audit-tools.png") });

    await p.evaluate(() => { app.panelHeight = 200; showView("search"); layout(); });
    await p.fill("#fn-search", "ospf");
    await p.keyboard.press("Control+Shift+P");
    await p.keyboard.type("net");
    await p.screenshot({ path: out("command-palette.png") });
    await p.keyboard.press("Escape");

    await p.evaluate(() => { showView("explorer"); activeEditor().focus(); activeEditor().input.setSelectionRange(0, 0); });
    await p.keyboard.press("Control+h");
    await p.fill("#find-input", "S1");
    await p.fill("#replace-input", "ACCESS-1");
    await p.screenshot({ path: out("find-replace.png") });
    await workbenchShots(browser);
    await browser.close();
    console.log("screenshots written");
})();
