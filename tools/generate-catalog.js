"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "docs", "api");
const catalog = [];
const seen = new Set();

fs.readdirSync(apiDir).filter((f) => f.endsWith(".md") && f !== "README.md").sort().forEach((file) => {
    const text = fs.readFileSync(path.join(apiDir, file), "utf8");
    const area = (text.match(/^# (.+)$/m) || text.match(/^(.+)\n=+$/m))[1];
    text.split("\n").forEach((line) => {
        const match = line.match(/^\| `(\w+)\(([^`]*)\)` \|(.*)\|\s*$/);
        if (!match || seen.has(match[1])) {
            return;
        }
        seen.add(match[1]);
        const cells = match[3].split("|").map((c) => c.trim().replace(/`/g, ""));
        catalog.push({ name: match[1], args: match[2], area, info: cells[cells.length - 1] });
    });
});

const body = "var functionCatalog = " + JSON.stringify(catalog, null, 1).replace(/\n\s*/g, " ") + ";\n";
fs.writeFileSync(path.join(root, "src", "ui", "catalog.js"), body);
console.log("src/ui/catalog.js " + catalog.length + " functions");
