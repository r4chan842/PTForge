"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const source = process.argv[2] || path.join(root, "node_modules", "@vscode", "codicons", "src", "icons");
const target = path.join(root, "src", "ui", "interface.js");
const map = JSON.parse(fs.readFileSync(path.join(__dirname, "icons.json"), "utf8"));

function inner(svg) {
    return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/"/g, "'").replace(/\s+/g, " ").trim();
}

const text = fs.readFileSync(target, "utf8");
const start = text.indexOf("var icons = {");
const end = text.indexOf("\n};", start) + 3;
const entries = Object.keys(map.codicons).map((name) => {
    const file = path.join(source, map.codicons[name] + ".svg");
    return "    " + name + ": \"" + inner(fs.readFileSync(file, "utf8")) + "\"";
}).concat(Object.keys(map.custom).map((name) => "    " + name + ": \"<g transform='scale(1.5)'>" + map.custom[name] + "</g>\""));
fs.writeFileSync(target, text.slice(0, start) + "var icons = {\n" + entries.join(",\n") + "\n};" + text.slice(end));
console.log("icons: " + Object.keys(map.codicons).length + " codicons, " + Object.keys(map.custom).length + " custom");
