"use strict";

const path = require("path");
const assert = require("assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const root = path.join(__dirname, "..");
const page = "file://" + path.join(root, "src", "ui", "index.html");
const shots = path.join(require("os").tmpdir(), "ptforge-shots");
require("fs").mkdirSync(shots, { recursive: true });

const fakePacketTracer = () => {
    window.__calls = [];
    window.__store = {};
    window.$se = function () { window.__calls.push(Array.prototype.slice.call(arguments)); };
    window.$putData = (k, v) => { window.__store[k] = v; return Promise.resolve(); };
    window.$getData = (k) => Promise.resolve(window.__store[k] || null);
};

async function open(browser, withPt) {
    const p = await browser.newPage({ viewport: { width: 1280, height: 780 } });
    p.errors = [];
    p.on("pageerror", (e) => p.errors.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") p.errors.push(m.text()); });
    if (withPt) await p.addInitScript(fakePacketTracer);
    await p.goto(page);
    await p.waitForTimeout(400);
    return p;
}

const value = (p) => p.evaluate(() => activeEditor().getValue());
const setValue = (p, text) => p.evaluate((t) => { const e = activeEditor(); e.setValue(t); e.onInput({}); e.focus(); }, text);
const caret = (p, at) => p.evaluate((a) => { const e = activeEditor(); e.focus(); e.input.setSelectionRange(a, a); e.updateCursor(); }, at);
const steps = [];
const step = async (name, fn) => { await fn(); steps.push(name); };

(async () => {
    const browser = await chromium.launch();
    const p = await open(browser, true);

    await step("workspace starts with a file", async () => {
        assert.equal(await p.locator(".tab").count(), 1);
        assert.match(await value(p), /addDevice/);
    });

    await step("typing and auto close pairs", async () => {
        await setValue(p, "");
        await p.keyboard.type("log(\"x");
        assert.equal(await value(p), "log(\"x\")");
        await p.keyboard.type("\")");
        assert.equal(await value(p), "log(\"x\")");
        await p.keyboard.press("Backspace");
        await p.keyboard.press("Backspace");
        await p.keyboard.press("Backspace");
        assert.equal(await value(p), "log(\"");
    });

    await step("enter indents inside braces", async () => {
        await setValue(p, "");
        await p.keyboard.type("if (a) {");
        await p.keyboard.press("Enter");
        await p.keyboard.type("b();");
        assert.equal(await value(p), "if (a) {\n    b();\n}");
    });

    await step("undo works after smart edits", async () => {
        await p.keyboard.press("Control+z");
        assert.notEqual(await value(p), "if (a) {\n    b();\n}");
    });

    await step("toggle comment", async () => {
        await setValue(p, "var a = 1;\n    var b = 2;\n");
        await p.evaluate(() => activeEditor().input.setSelectionRange(0, 20));
        await p.keyboard.press("Control+/");
        assert.equal(await value(p), "// var a = 1;\n//     var b = 2;\n");
        await p.keyboard.press("Control+/");
        assert.equal(await value(p), "var a = 1;\n    var b = 2;\n");
    });

    await step("tab indents and shift tab outdents", async () => {
        await setValue(p, "a\nb");
        await p.evaluate(() => activeEditor().input.setSelectionRange(0, 3));
        await p.keyboard.press("Tab");
        assert.equal(await value(p), "    a\n    b");
        await p.keyboard.press("Shift+Tab");
        assert.equal(await value(p), "a\nb");
    });

    await step("move, copy and delete lines", async () => {
        await setValue(p, "one\ntwo\nthree");
        await caret(p, 5);
        await p.keyboard.press("Alt+ArrowUp");
        assert.equal(await value(p), "two\none\nthree");
        await p.keyboard.press("Shift+Alt+ArrowDown");
        assert.equal(await value(p), "two\ntwo\none\nthree");
        await p.keyboard.press("Control+Shift+K");
        assert.equal(await value(p), "two\none\nthree");
        await caret(p, 10);
        await p.keyboard.press("Alt+ArrowDown");
        assert.equal(await value(p), "two\none\nthree");
    });

    await step("intellisense suggests catalog functions", async () => {
        await setValue(p, "");
        await p.keyboard.type("addLi");
        await p.waitForSelector(".ed-suggest:not(.hidden)");
        assert.equal(await p.locator(".ed-suggest-row.selected .sg-label").textContent(), "addLink");
        await p.keyboard.press("Enter");
        assert.equal(await value(p), "addLink()");
        await p.waitForSelector(".ed-hint:not(.hidden)");
        assert.match(await p.locator(".ed-hint").textContent(), /addLink\(/);
    });

    await step("problems and quick fix", async () => {
        await setValue(p, "addDevise(\"R1\", \"2911\", 0, 0);\nvar x = (1;\n");
        await p.evaluate(() => lintNow());
        const problems = await p.evaluate(() => app.problems.map((x) => x.severity + x.line));
        assert.deepEqual(problems.sort(), ["error2", "warning1"]);
        assert.equal(await p.locator("#problems-badge").textContent(), "2");
        await p.evaluate(() => showPanel("problems"));
        await p.screenshot({ path: path.join(shots, "problems.png") });
        await p.click(".quickfix");
        assert.match(await value(p), /^addDevice\(/);
    });

    await step("find and replace", async () => {
        await setValue(p, "R1 r1 R1x R1");
        await p.keyboard.press("Control+h");
        await p.fill("#find-input", "R1");
        assert.equal(await p.locator("#find-count").textContent(), "1 of 4");
        await p.click("#find-case");
        assert.equal(await p.locator("#find-count").textContent(), "1 of 3");
        await p.click("#find-word");
        assert.equal(await p.locator("#find-count").textContent(), "1 of 2");
        await p.fill("#replace-input", "Core");
        await p.click("#replace-all");
        assert.equal(await value(p), "Core r1 R1x Core");
        await p.keyboard.press("Escape");
        assert.equal(await p.locator("#find").isHidden(), true);
    });

    await step("command palette runs commands", async () => {
        await p.keyboard.press("Control+Shift+P");
        await p.keyboard.type("new file");
        await p.keyboard.press("Enter");
        assert.equal(await p.locator(".tab").count(), 2);
        assert.equal(await p.evaluate(() => activeFile().name), "untitled.js");
        await p.keyboard.press("Control+g");
        await p.keyboard.type("1");
        await p.keyboard.press("Enter");
    });

    await step("dirty dot and save to workspace", async () => {
        await p.keyboard.type("log(1);");
        assert.equal(await p.locator(".tab.active.dirty").count(), 1);
        await p.keyboard.press("Control+s");
        assert.equal(await p.locator(".tab.active.dirty").count(), 0);
        await p.waitForTimeout(400);
        const stored = await p.evaluate(() => JSON.parse(window.__store["ptforge.workspace"]));
        assert.equal(stored.files.find((f) => f.name === "untitled.js").text, "log(1);");
    });

    await step("run sends encoded code to packet tracer", async () => {
        await p.keyboard.press("Control+F5");
        const call = await p.evaluate(() => window.__calls.at(-1));
        assert.deepEqual(call, ["runCode", encodeURIComponent("log(1);")]);
        assert.equal(await p.locator(".statusbar.running").count(), 1);
        await p.evaluate(() => receiveOutput({ kind: "done", text: "Finished in 4 ms" }));
        assert.equal(await p.locator(".statusbar.running").count(), 0);
    });

    await step("open and save files through the bridge", async () => {
        await p.keyboard.press("Control+o");
        assert.deepEqual(await p.evaluate(() => window.__calls.at(-1)), ["editorOpenFile"]);
        await p.evaluate(() => receiveOutput({ kind: "file-opened", text: JSON.stringify({ path: "C:/labs/ospf.js", name: "ospf.js", text: "configureOspf(\"R1\", {});\n" }) }));
        assert.equal(await p.evaluate(() => activeFile().name), "ospf.js");
        await p.keyboard.press("End");
        await p.keyboard.type(" ");
        await p.keyboard.press("Control+s");
        const call = await p.evaluate(() => window.__calls.at(-1));
        assert.equal(call[0], "editorSaveFile");
        assert.equal(decodeURIComponent(call[2]), "C:/labs/ospf.js");
        const id = decodeURIComponent(call[1]);
        await p.evaluate((i) => receiveOutput({ kind: "file-saved", text: JSON.stringify({ id: i, path: "C:/labs/ospf.js", name: "ospf.js" }) }), id);
        assert.equal(await p.locator(".tab.active.dirty").count(), 0);
        await p.evaluate(() => receiveOutput({ kind: "folder-opened", text: JSON.stringify({ path: "C:/labs", name: "labs", files: [{ name: "ospf.js", path: "C:/labs/ospf.js" }, { name: "vlan.js", path: "C:/labs/vlan.js" }] }) }));
        await p.click("[data-path=\"C:/labs/vlan.js\"]");
        assert.deepEqual(await p.evaluate(() => window.__calls.at(-1)), ["editorReadFile", encodeURIComponent("C:/labs/vlan.js")]);
    });

    await step("closing a dirty disk file asks to save", async () => {
        await p.evaluate(() => activeEditor().focus());
        await p.keyboard.type("x");
        await p.keyboard.press("Control+w");
        await p.waitForSelector("#dialog:not(.hidden)");
        await p.click("[data-choice=\"2\"]");
        assert.equal(await p.evaluate(() => activeFile().name), "ospf.js");
        await p.keyboard.press("Control+z");
    });

    await step("lab check and audit reports", async () => {
        await p.evaluate(() => {
            receiveOutput({ kind: "report", text: JSON.stringify({ title: "VLAN lab", total: 4, passed: 3, failed: 1, score: 4, maxScore: 5, percent: 80, items: [
                { name: "Device S1 exists", passed: true, points: 1, hint: "" }, { name: "VLAN 10 exists on S1", passed: true, points: 2, hint: "" },
                { name: "S1 is cabled to PC1", passed: true, points: 1, hint: "" }, { name: "PC1 FastEthernet0 has 192.168.10.11 24", passed: false, points: 1, hint: "found 0.0.0.0 0.0.0.0" }] }) });
            receiveOutput({ kind: "audit", text: JSON.stringify({ errors: 1, warnings: 1, infos: 1, findings: [
                { severity: "error", rule: "duplicate-ip", device: "PC1", port: "", message: "192.168.1.5 is used by PC1 FastEthernet0, PC2 FastEthernet0" },
                { severity: "warning", rule: "vlan1-access", device: "S1", port: "FastEthernet0/3", message: "Active access port is still in VLAN 1" },
                { severity: "info", rule: "unused-enabled", device: "S1", port: "FastEthernet0/9", message: "Unused port is not shut down" }] }) });
        });
        assert.equal(await p.locator(".report").count(), 2);
        assert.equal(await p.locator(".panel-tab.active").textContent(), "Lab Check");
    });

    await step("devices view", async () => {
        await p.evaluate(() => showView("devices"));
        assert.equal(await p.evaluate(() => window.__calls.some((c) => c[0] === "editorDevices")), true);
        await p.evaluate(() => receiveOutput({ kind: "devices", text: JSON.stringify({ links: 3, devices: [
            { name: "R1", type: "router", model: "2911", power: true, ports: [{ name: "GigabitEthernet0/0", ip: "192.168.1.1/24", up: true, peer: "GigabitEthernet0/1" }, { name: "GigabitEthernet0/1", ip: "10.0.0.1/30", up: false, peer: "" }] },
            { name: "S1", type: "switch", model: "2960-24TT", power: true, ports: [{ name: "FastEthernet0/1", ip: "", up: true, peer: "FastEthernet0" }] },
            { name: "PC1", type: "pc", model: "PC-PT", power: true, ports: [{ name: "FastEthernet0", ip: "192.168.1.10/24", up: true, peer: "FastEthernet0/1" }] },
            { name: "SRV", type: "server", model: "Server-PT", power: true, ports: [] }] }) }));
        await p.click("[data-section=\"dev-R1\"] .twisty");
        assert.equal(await p.locator(".port-row").first().isVisible(), true);
    });

    await step("tools view", async () => {
        await p.evaluate(() => showView("tools"));
        await p.fill("#calc-subnet", "10.10.5.200/22");
        assert.match(await p.locator("#calc-subnet-out").textContent(), /10\.10\.4\.0\/22.*255\.255\.252\.0/);
        await p.fill("#calc-subnet", "999.1.1.1");
        assert.match(await p.locator("#calc-subnet-out").textContent(), /Not an IPv4/);
        await p.fill("#calc-subnet", "192.168.10.77/26");
    });

    await step("workspace survives a reload", async () => {
        await p.evaluate(() => persistNow());
        const saved = await p.evaluate(() => window.__store["ptforge.workspace"]);
        const q = await browser.newPage({ viewport: { width: 1280, height: 780 } });
        await q.addInitScript(fakePacketTracer);
        await q.addInitScript((s) => { window.__seed = s; }, saved);
        await q.addInitScript(() => { const g = window.$getData; window.$getData = (k) => k === "ptforge.workspace" ? Promise.resolve(window.__seed) : g(k); });
        await q.goto(page);
        await q.waitForTimeout(400);
        assert.equal(await q.locator(".tab").count(), await p.locator(".tab").count());
        await q.close();
    });

    await step("old code slots are migrated", async () => {
        const q = await browser.newPage();
        await q.addInitScript(fakePacketTracer);
        await q.addInitScript(() => { window.__store.code = "log(1);"; window.__store.code3 = "log(3);"; });
        await q.goto(page);
        await q.waitForTimeout(400);
        assert.deepEqual(await q.evaluate(() => app.order.map((id) => app.files[id].name + "=" + app.files[id].text)), ["script-1.js=log(1);", "script-2.js=log(3);"]);
        await q.close();
    });

    await step("preview mode does not crash", async () => {
        const q = await open(browser, false);
        await q.keyboard.press("F5");
        assert.match(await q.locator("#panel-output").textContent(), /Preview mode/);
        assert.deepEqual(q.errors, []);
        await q.close();
    });

    assert.deepEqual(p.errors, []);
    await browser.close();
    console.log(steps.length + " ui checks passed");
})().catch((error) => {
    console.error("UI check failed after: " + steps.join(" > "));
    console.error(error);
    process.exit(1);
});
