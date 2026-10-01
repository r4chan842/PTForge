"use strict";

const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { initScript } = require("./ui-harness");
const { labSetup } = require("./ui-lab");

const root = path.join(__dirname, "..");
const page = "file://" + path.join(root, "src", "ui", "index.html");
const shots = path.join(require("os").tmpdir(), "ptforge-shots");
require("fs").mkdirSync(shots, { recursive: true });

const debugSample = [
    "var routers = [\"R1\", \"R2\"];",
    "var plan = { network: \"10.0.0.0/24\", gateway: \"10.0.0.1\" };",
    "",
    "function hostCount(name) {",
    "    var info = getDeviceInfo(name);",
    "    return info.ports.length;",
    "}",
    "",
    "var total = 0;",
    "for (var i = 0; i < routers.length; i++) {",
    "    total += hostCount(routers[i]);",
    "}",
    "log(\"ports on routers: \" + total);",
    ""
].join("\n");

(async () => {
    const browser = await chromium.launch();
    const p = await browser.newPage({ viewport: { width: 1360, height: 820 } });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await p.addInitScript(initScript(labSetup));
    await p.goto(page);
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(shots, "explore-1-start.png") });

    await p.keyboard.press("Control+Backquote");
    await p.waitForTimeout(300);
    await p.keyboard.type("getDevices()");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    await p.keyboard.type("var s = getDeviceInfo(\"R1\")");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(200);
    await p.keyboard.type("s.ports.map(function (x) { return x.name; })");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    await p.keyboard.type(".calc 10.0.0.77/26");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    await p.keyboard.type("nope + 1");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(shots, "explore-2-terminal.png") });

    await p.evaluate((code) => { const e = activeEditor(); e.setValue(code); e.onInput({}); }, debugSample);
    await p.evaluate(() => { toggleBreakpoint(app.active, 5); toggleBreakpoint(app.active, 11); });
    await p.keyboard.press("F5");
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(shots, "explore-3-debug.png") });
    await p.keyboard.press("F10");
    await p.waitForTimeout(200);
    await p.evaluate(() => { debugState.expanded["scope:0/info"] = true; renderDebugView(); });
    await p.screenshot({ path: path.join(shots, "explore-4-step.png") });
    await p.keyboard.press("Shift+F5");
    await p.waitForTimeout(200);

    await p.evaluate(() => openCalculator("ipv4"));
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(shots, "explore-5-calc.png") });
    await p.evaluate(() => openCalculator("vlsm"));
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(shots, "explore-6-vlsm.png") });

    await p.evaluate(() => runCommandId("net.reach"));
    await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(shots, "explore-7-reach.png") });

    await p.evaluate(() => callEngine("editorSnapshot", "take", "before"));
    await p.waitForTimeout(300);
    await p.evaluate(() => {
        window.__engine.eval("labConfigs.R2 = labConfigs.R2.replace('end', 'interface GigabitEthernet0/0\\n ip address 192.168.5.1 255.255.255.0\\n no shutdown\\nend'); world.devices.R2.ports.filter(function (x) { return x.name === 'GigabitEthernet0/0'; })[0].ip = '192.168.5.1'; world.devices.R2.ports.filter(function (x) { return x.name === 'GigabitEthernet0/0'; })[0].mask = '255.255.255.0';");
    });
    await p.evaluate(() => compareSnapshotsUi("before", ""));
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(shots, "explore-8-diff.png") });
    await p.evaluate(() => showView("devices"));
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(shots, "explore-9-devices.png") });

    console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no page errors");
    await browser.close();
})();
