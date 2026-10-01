"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "docs", "api");
const catalog = [];
const seen = new Set();

fs.readdirSync(apiDir).filter((f) => f !== "README").sort().forEach((file) => {
    const text = fs.readFileSync(path.join(apiDir, file), "utf8");
    const area = (text.match(/^# (.+)$/m) || text.match(/^(.+)\n=+$/m))[1];
    const lines = text.split("\n");
    lines.forEach((line, i) => {
        const match = line.match(/^(\w+)\((.*)\)(?: -> (.+))?$/);
        if (!match || seen.has(match[1])) {
            return;
        }
        seen.add(match[1]);
        const next = lines[i + 1] || "";
        const info = /^ {4}\S/.test(next) ? next.trim() : match[3] || "";
        catalog.push({ name: match[1], args: match[2], area, info });
    });
});

const body = "var functionCatalog = " + JSON.stringify(catalog, null, 1).replace(/\n\s*/g, " ") + ";\n";
fs.writeFileSync(path.join(root, "src", "ui", "catalog.js"), body);
console.log("src/ui/catalog.js " + catalog.length + " functions");
