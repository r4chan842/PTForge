"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const order = JSON.parse(fs.readFileSync(path.join(__dirname, "load-order.json"), "utf8")).scripts;
const body = order.map((file) => fs.readFileSync(path.join(root, file), "utf8").trim()).join("\n\n") + "\n";

const target = path.join(root, "release", "ptforge.js");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, body);
console.log("release/ptforge.js " + body.length + " bytes from " + order.length + " files");
