"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { loadExtension, root } = require("../helpers/load");

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

walk(path.join(root, "examples")).concat(walk(path.join(root, "templates"))).filter((f) => f.endsWith(".js")).forEach((file) => {
    test("example " + path.relative(root, file), () => {
        const { run, runScript, world } = loadExtension();
        run("var strictLink = addLink; addLink = function () { var ok = strictLink.apply(null, arguments); if (!ok) { throw new Error('Link failed: ' + Array.prototype.join.call(arguments, ' ')); } return ok; };");
        run("var strictConfig = configureIosDevice; configureIosDevice = function (name, commands, save) { var failed = strictConfig(name, commands, save); if (failed.length) { throw new Error('Rejected on ' + name); } return failed; };");
        const result = runScript(fs.readFileSync(file, "utf8"));
        assert.equal(result.ok, true, JSON.stringify(result.messages));
        assert.ok(world.order.length > 0 || Object.keys(world.canvas).length > 0);
    });
});
