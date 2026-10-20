"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ui = path.join(root, "src", "ui");
const source = fs.readFileSync(path.join(ui, "index.html"), "utf8");

const guard = /(\s*)<link\s+href="style\.css"\s+rel="stylesheet">/g;
const scriptTag = /(\s*)<script\s+src="([\w.-]+\.js)"><\/script>/g;

let html = source.replace(guard, (match, indent) => "\n" + indent + "<style>\n" + fs.readFileSync(path.join(ui, "style.css"), "utf8").trim() + "\n" + indent + "</style>");

html = html.replace(scriptTag, (match, indent, file) => {
    const code = fs.readFileSync(path.join(ui, file), "utf8").trim().replace(/<\/script/gi, "<\\/script");
    return "\n" + indent + "<script>\n" + code + "\n" + indent + "</script>";
});

const leftOver = html.match(/(?:src|href)="([^"]+\.(?:css|js))"/g);
if (leftOver) {
    throw new Error("build-ui left external files in the page: " + leftOver.join(", "));
}

const target = path.join(root, "release", "index.html");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, html);
console.log("release/index.html " + html.length + " bytes, single file");
