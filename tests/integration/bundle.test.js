"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");
const { createWorld } = require("../helpers/mock-pt");
const { root } = require("../helpers/load");

test("release bundle builds and runs a lab on its own", () => {
    execFileSync(process.execPath, [path.join(root, "tools", "bundle.js")]);
    const code = fs.readFileSync(path.join(root, "release", "ptforge.js"), "utf8");
    const { world, ipc } = createWorld();
    const context = { ipc, console: { log: () => {} } };
    vm.createContext(context);
    vm.runInContext(code, context, { filename: "ptforge.js" });
    assert.strictEqual(typeof context.main, "function");
    vm.runInContext([
        "addDevice('R1', '2911', 100, 100);",
        "addDevice('S1', '2960-24TT', 100, 250);",
        "addLink('R1', 'GigabitEthernet0/0', 'S1', 'GigabitEthernet0/1', 'straight');",
        "setInterfaceIp('R1', 'GigabitEthernet0/0', '10.0.0.1/24');"
    ].join("\n"), context);
    assert.ok(world.devices.R1);
    assert.ok(world.devices.R1.commands.some((c) => c.cmd.trim() === "ip address 10.0.0.1 255.255.255.0"));
});
