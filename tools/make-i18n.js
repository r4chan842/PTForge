"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourceDir = path.join(root, "i18n", "source");
const order = ["fa", "de", "es", "fr", "pt-BR", "ru", "tr", "ar", "zh-CN", "ja"];
const repo = "https://github.com/r4chan842/PTForge";

const banner = [
    "```",
    " ____ _____ _____",
    "|  _ \\_   _|  ___|__  _ __ __ _  ___",
    "| |_) || | | |_ / _ \\| '__/ _` |/ _ \\",
    "|  __/ | | |  _| (_) | | | (_| |  __/",
    "|_|    |_| |_|  \\___/|_|  \\__, |\\___|",
    "                          |___/",
    "```"
];

function underline(text, mark) {
    const width = [...text].reduce((n, c) => n + (c.codePointAt(0) > 0x2e80 ? 2 : 1), 0);
    return text + "\n" + mark.repeat(Math.max(3, width));
}

function load(lang) {
    return JSON.parse(fs.readFileSync(path.join(sourceDir, lang + ".json"), "utf8"));
}

function languages(current) {
    return order.map((lang) => lang === current ? load(lang).lang : "[" + load(lang).lang + "](README." + lang + ".md)")
        .concat(["[English](../README.md)"]).join(", ");
}

function page(lang) {
    const s = load(lang);
    const body = banner.concat([
        "",
        underline("PTForge", "="),
        "",
        s.intro,
        "",
        "> [!WARNING]",
        "> " + s.warning,
        "",
        s.note,
        "",
        languages(lang),
        "",
        "",
        underline(s.quick, "-"),
        "",
        "* " + s.latest + ": " + repo + "/releases/latest",
        "* " + s.install + ": [docs/guides/installation.md](../docs/guides/installation.md)",
        "* " + s.first + ": [docs/guides/getting-started.md](../docs/guides/getting-started.md)",
        "* " + s.report + ": " + repo + "/issues",
        "",
        "",
        underline(s.docs, "-"),
        "",
        s.docsText,
        "",
        "",
        underline(s.support, "-"),
        "",
        "* " + s.issues + ": " + repo + "/issues",
        "* " + s.disc + ": " + repo + "/discussions",
        "",
        "",
        underline(s.license, "-"),
        "",
        s.licenseText + " [LICENSE](../LICENSE)",
        "",
        s.tm,
        ""
    ]).join("\n");
    return s.dir === "rtl" ? "<div dir=\"rtl\">\n\n" + body + "\n</div>\n" : body;
}

order.forEach((lang) => fs.writeFileSync(path.join(root, "i18n", "README." + lang + ".md"), page(lang)));
console.log("wrote " + order.length + " translations");
