"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const order = JSON.parse(fs.readFileSync(path.join(root, "tools", "load-order.json"), "utf8"));

function engineSource() {
    const mock = fs.readFileSync(path.join(root, "tests", "helpers", "mock-pt.js"), "utf8");
    const scripts = order.scripts.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n;\n");
    return [
        "var module = { exports: {} };",
        mock,
        "var __made = module.exports.createWorld();",
        "var world = __made.world;",
        "var ipc = __made.ipc;",
        scripts,
        "extension = { editor: { webviewId: 'w1', webview: { evaluateJavaScriptAsync: function (code) { setTimeout(function () { parent.eval(code); }, 0); } } } };"
    ].join("\n");
}

function initScript(setup) {
    const source = engineSource();
    return `(() => {
        if (window !== window.top) {
            return;
        }
        const queue = [];
        let engine = null;
        window.__store = {};
        window.__engineCalls = [];
        window.$se = function () {
            const args = Array.prototype.slice.call(arguments);
            window.__engineCalls.push(args);
            if (engine) {
                setTimeout(() => engine[args[0]].apply(null, args.slice(1)), 5);
            } else {
                queue.push(args);
            }
        };
        window.$putData = (k, v) => { window.__store[k] = v; return Promise.resolve(); };
        window.$getData = (k) => Promise.resolve(window.__store[k] || null);
        document.addEventListener("DOMContentLoaded", () => {
            const frame = document.createElement("iframe");
            frame.style.display = "none";
            frame.id = "engine-frame";
            document.body.appendChild(frame);
            engine = frame.contentWindow;
            engine.eval(${JSON.stringify(source)});
            engine.eval(${JSON.stringify(setup || "")});
            window.__engine = engine;
            queue.splice(0).forEach((args) => setTimeout(() => engine[args[0]].apply(null, args.slice(1)), 5));
        });
    })();`;
}

module.exports = { initScript, engineSource };
