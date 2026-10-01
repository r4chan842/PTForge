"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { loadExtension, root } = require("../helpers/load");

const routers = 'addDevice("R1", "2911", 100, 100); addDevice("R2", "2911", 300, 100); addModule("R1", "0/0", "HWIC-2T"); addModule("R2", "0/0", "HWIC-2T"); addLink("R1", "Serial0/0/0", "R2", "Serial0/0/0", "serial");';
const setups = {
    "campus-switching.md": 'addDevice("D1", "3560-24PS", 100, 100); addDevice("D2", "3560-24PS", 300, 100); addDevice("A1", "2960-24TT", 200, 300);',
    "routing-labs.md": 'addDevice("EDGE", "2911", 500, 500);',
    "edge-router.md": 'addDevice("EDGE", "2911", 100, 100);',
    "servers.md": "",
    "documenting.md": routers + 'addDevice("S1", "2960-24TT", 100, 250); addDevice("PC1", "PC-PT", 50, 400); addDevice("PC2", "PC-PT", 150, 400); addDevice("SRV", "Server-PT", 300, 400);'
};

function blocks(file) {
    const md = fs.readFileSync(path.join(root, "docs", "recipes", file), "utf8");
    return [...md.matchAll(/(?:^|\n\n)((?: {4}.*\n|\n(?= {4}))+)/g)].map((m) => m[1].replace(/^ {4}/gm, ""));
}

function allAccepted(result) {
    if (Array.isArray(result) && result.length && typeof result[0] === "object") {
        return false;
    }
    if (result && typeof result === "object" && !Array.isArray(result)) {
        return Object.keys(result).every((k) => !Array.isArray(result[k]) || result[k].length === 0);
    }
    return true;
}

Object.keys(setups).forEach((file) => {
    test("recipe " + file + " runs in one session", () => {
        const { run } = loadExtension();
        run(setups[file]);
        blocks(file).forEach((code, i) => {
            const result = run(code);
            assert.ok(allAccepted(result), file + " block " + i + " rejected " + JSON.stringify(result));
        });
    });
});

test("documenting recipe labels the serial link", () => {
    const { run } = loadExtension();
    run(setups["documenting.md"]);
    run(blocks("documenting.md")[0]);
    const texts = JSON.parse(run("JSON.stringify(getNotes().map(function (n) { return n.text; }))"));
    assert.ok(texts.includes("WAN"));
});
