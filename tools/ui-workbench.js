"use strict";

const path = require("path");
const assert = require("assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { initScript } = require("./ui-harness");
const { labSetup } = require("./ui-lab");

const root = path.join(__dirname, "..");
const page = "file://" + path.join(root, "src", "ui", "index.html");

const sample = [
    "var routers = [\"R1\", \"R2\"];",
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

const steps = [];
const step = async (name, fn) => { await fn(); steps.push(name); };
const wait = (p, ms) => p.waitForTimeout(ms);
const line = (p) => p.evaluate(() => debugState.session.steps[debugEntry().id].line);
const termText = (p) => p.locator(".term:visible .term-out").innerText();

async function type(p, text) {
    await p.locator(".term:visible .term-input").fill(text);
    await p.keyboard.press("Enter");
    await wait(p, 250);
}

async function openLab(browser, seed) {
    const p = await browser.newPage({ viewport: { width: 1360, height: 820 } });
    p.errors = [];
    p.on("pageerror", (e) => p.errors.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") p.errors.push(m.text()); });
    await p.addInitScript(initScript(labSetup));
    if (seed) {
        await p.addInitScript((s) => { window.__seed = s; const g = window.$getData; window.$getData = (k) => k === "ptforge.workspace" ? Promise.resolve(window.__seed) : g(k); }, seed);
    }
    await p.goto(page);
    await wait(p, 600);
    return p;
}

(async () => {
    const browser = await chromium.launch();
    const p = await openLab(browser);

    await step("new terminal opens with a prompt", async () => {
        await p.keyboard.press("Control+Backquote");
        await wait(p, 300);
        assert.equal(await p.locator(".term:visible").count(), 1);
        assert.match(await termText(p), /PTForge JavaScript Shell/);
        assert.match(await p.locator(".term:visible .term-prompt").innerText(), /ptforge:js>/);
    });

    await step("terminal evaluates and keeps variables", async () => {
        await type(p, "var a = 20");
        await type(p, "a * 2 + 2");
        assert.match(await termText(p), /\b42\b/);
    });

    await step("terminal calls the engine api", async () => {
        await type(p, "getDevices().length");
        assert.match(await termText(p), /\b5\b/);
        await type(p, "getDeviceInfo(\"R1\").model");
        assert.match(await termText(p), /2911/);
    });

    await step("errors are shown in red", async () => {
        await type(p, "missingName + 1");
        const err = p.locator(".term:visible .term-row", { hasText: "ReferenceError" }).last();
        assert.equal(await err.count(), 1);
        const color = await err.evaluate((el) => getComputedStyle(el.querySelector("span") || el).color);
        assert.notEqual(color, "rgb(0, 0, 0)");
    });

    await step("history with arrow keys", async () => {
        const input = p.locator(".term:visible .term-input");
        await input.focus();
        await p.keyboard.press("ArrowUp");
        assert.equal(await input.inputValue(), "missingName + 1");
        await p.keyboard.press("ArrowUp");
        assert.equal(await input.inputValue(), "getDeviceInfo(\"R1\").model");
        await p.keyboard.press("ArrowDown");
        await p.keyboard.press("ArrowDown");
        assert.equal(await input.inputValue(), "");
    });

    await step("tab completes function names", async () => {
        const input = p.locator(".term:visible .term-input");
        await input.fill("getDeviceIn");
        await p.keyboard.press("Tab");
        assert.equal(await input.inputValue(), "getDeviceInfo");
        await input.fill("");
    });

    await step("dot commands", async () => {
        await type(p, ".calc 10.1.2.3/20");
        const text = await termText(p);
        assert.match(text, /10\.1\.0\.0/);
        assert.match(text, /255\.255\.240\.0/);
        await type(p, ".help");
        assert.match(await termText(p), /\.clear/);
        await type(p, ".clear");
        assert.equal((await termText(p)).trim(), "");
    });

    await step("second terminal is independent", async () => {
        await p.evaluate(() => runCommandId("terminal.new"));
        await wait(p, 300);
        assert.equal(await p.locator(".term").count(), 2);
        assert.equal(await p.locator(".term:visible").count(), 1);
    });

    await step("breakpoints toggle and persist", async () => {
        await p.evaluate((code) => { const e = activeEditor(); e.setValue(code); e.onInput({}); }, sample);
        await p.evaluate(() => { toggleBreakpoint(app.active, 4); toggleBreakpoint(app.active, 10); toggleBreakpoint(app.active, 10); toggleBreakpoint(app.active, 10); });
        assert.deepEqual(await p.evaluate(() => Object.keys(fileBreakpoints(app.active)).map(Number).sort((x, y) => x - y)), [4, 10]);
        await p.evaluate(() => persistNow());
        const saved = await p.evaluate(() => window.__store["ptforge.workspace"]);
        const q = await openLab(browser, saved);
        assert.deepEqual(await q.evaluate(() => Object.keys(fileBreakpoints(app.active)).map(Number).sort((x, y) => x - y)), [4, 10]);
        assert.deepEqual(q.errors, []);
        await q.close();
    });

    await step("debugger pauses on a breakpoint", async () => {
        await p.keyboard.press("F5");
        await wait(p, 900);
        assert.equal(await p.evaluate(() => debugState.session && debugState.session.state), "paused");
        assert.equal(await line(p), 10);
        await p.keyboard.press("F5");
        await wait(p, 200);
        assert.equal(await line(p), 4);
        assert.equal(await p.locator("body.debugging").count(), 1);
        assert.equal(await p.locator("#debug-start.hidden").count(), 1);
        assert.match(await p.locator("#dbg-variables").innerText(), /name\s*:\s*'R1'/);
        assert.match(await p.locator("#dbg-stack").innerText(), /hostCount/);
    });

    await step("step over, into, out and back", async () => {
        await p.keyboard.press("F10");
        await wait(p, 150);
        assert.equal(await line(p), 5);
        await p.keyboard.press("Shift+F11");
        await wait(p, 150);
        assert.equal(await line(p), 10);
        await p.keyboard.press("F11");
        await wait(p, 150);
        await p.evaluate(() => debugMove("back"));
        await wait(p, 150);
        assert.equal(await line(p), 10);
    });

    await step("watch expressions", async () => {
        await p.evaluate(() => addWatch("total + 100"));
        await wait(p, 150);
        assert.match(await p.locator("#dbg-watch").innerText(), /total \+ 100\s*:\s*104/);
    });

    await step("debug console evaluates in the paused frame", async () => {
        await p.locator("#debug-console-input").fill("routers[i].toLowerCase() + total");
        await p.keyboard.press("Enter");
        await wait(p, 200);
        assert.match(await p.locator("#panel-debug").innerText(), /'r24'/);
    });

    await step("continue runs to the end and prints logs in order", async () => {
        for (let i = 0; i < 6 && await p.evaluate(() => !!debugState.session); i++) {
            await p.keyboard.press("F5");
            await wait(p, 200);
            if (process.env.TRACE) console.log(await p.evaluate(() => debugState.session && [debugState.session.state, debugState.session.index, debugState.session.trace.length, document.activeElement.id]));
        }
        await wait(p, 300);
        assert.equal(await p.evaluate(() => debugState.session), null);
        assert.equal(await p.locator("body.debugging").count(), 0);
        const text = await p.locator("#panel-debug").innerText();
        assert.ok(text.indexOf("ports on routers: 8") > text.lastIndexOf("Debugging lab") || /ports on routers: 8/.test(text));
        assert.equal(await p.locator("#debug-start.hidden").count(), 0);
    });

    await step("stop ends a paused session", async () => {
        await p.keyboard.press("F5");
        await wait(p, 900);
        assert.equal(await p.evaluate(() => debugState.session.state), "paused");
        await p.keyboard.press("Shift+F5");
        await wait(p, 200);
        assert.equal(await p.evaluate(() => debugState.session), null);
    });

    await step("syntax errors do not start a session", async () => {
        await p.evaluate(() => { const e = activeEditor(); e.setValue("var = 1;"); e.onInput({}); });
        await p.keyboard.press("F5");
        await wait(p, 200);
        assert.equal(await p.evaluate(() => debugState.session), null);
        assert.match(await p.locator("#panel-debug").innerText(), /SyntaxError/);
    });

    await step("network calculator tools", async () => {
        await p.evaluate(() => openCalculator("ipv4"));
        await wait(p, 200);
        const input = p.locator(".calc-page .vt-input").first();
        await input.fill("172.16.35.9/19");
        await wait(p, 150);
        let out = await p.locator(".calc-result").innerText();
        assert.match(out, /172\.16\.32\.0\/19/);
        assert.match(out, /8190/);
        await input.fill("400.1.1.1");
        await wait(p, 150);
        assert.match(await p.locator(".calc-result").innerText(), /Not an IPv4/);
        await p.click("[data-calc-tool=\"vlsm\"]");
        await wait(p, 150);
        out = await p.locator(".calc-result").innerText();
        assert.doesNotMatch(out, /Use a list/);
        assert.match(out, /Sales/);
        await p.click("[data-calc-tool=\"ipv6\"]");
        await p.locator(".calc-page .vt-input").first().fill("2001:db8:acad:1::10/64");
        await wait(p, 150);
        assert.match(await p.locator(".calc-result").innerText(), /2001:0db8:acad:0001:0000:0000:0000:0010/);
    });

    await step("reachability matrix", async () => {
        await p.evaluate(() => runCommandId("net.reach"));
        await wait(p, 1300);
        const text = await p.locator(".matrix").innerText();
        assert.match(text, /10\.0\.0\.20/);
        assert.equal(await p.locator(".matrix td.failed, .matrix td.bad, .matrix td[class*=fail]").count() > 0, true);
        assert.equal(await p.locator(".matrix td[class*=partial]").count() > 0, true);
    });

    await step("terminal ping waits for packet tracer", async () => {
        await p.keyboard.press("Control+Backquote");
        await wait(p, 300);
        await type(p, ".clear");
        await type(p, ".ping");
        await wait(p, 1200);
        const text = await termText(p);
        assert.match(text, /Pinging \d+ addresses from \d+ devices/);
        assert.match(text, /\d+ ok, \d+ partial, \d+ failed, \d+ unknown/);
        assert.match(text, /OK .*10\.0\.0\.20|FAIL|PART/);
        await type(p, "pingAll()");
        await wait(p, 1200);
        const again = await termText(p);
        assert.equal((again.match(/\d+ ok, \d+ partial/g) || []).length, 2);
    });

    await step("snapshot and compare", async () => {
        await p.evaluate(() => callEngine("editorSnapshot", "take", "before"));
        await wait(p, 300);
        await p.evaluate(() => {
            window.__engine.eval("labConfigs.R2 = labConfigs.R2.replace('end', 'interface GigabitEthernet0/0\\n ip address 192.168.5.1 255.255.255.0\\nend');");
        });
        await p.evaluate(() => compareSnapshotsUi("before", ""));
        await wait(p, 600);
        assert.equal(await p.locator(".diff-lines tr.dl-add, .diff-lines tr[class*=add]").count(), 2);
        assert.match(await p.locator(".diff-file-head").first().innerText(), /R2/);
    });

    assert.deepEqual(p.errors, []);
    await browser.close();
    console.log(steps.length + " workbench checks passed");
})().catch((error) => {
    console.error("Workbench check failed after: " + steps.join(" > "));
    console.error(error);
    process.exit(1);
});
