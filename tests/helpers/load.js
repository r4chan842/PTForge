"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createWorld } = require("./mock-pt");

const root = path.resolve(__dirname, "..", "..");
const order = JSON.parse(fs.readFileSync(path.join(root, "tools", "load-order.json"), "utf8"));

function loadExtension() {
    const { world, ipc } = createWorld();
    const context = { ipc, console: { log: () => {} } };
    vm.createContext(context);
    order.scripts.forEach((file) => {
        vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
    });
    const run = (code) => vm.runInContext(code, context);
    const runScript = (code) => {
        world.messages.length = 0;
        const ok = vm.runInContext("runCode(" + JSON.stringify(encodeURIComponent(code)) + ")", context);
        return { ok, messages: world.messages.slice() };
    };
    const sent = [];
    const attachEditor = () => {
        context.extension = { editor: { webviewId: "w1", webview: { evaluateJavaScriptAsync: (code) => { sent.push(code); } } } };
        return sent;
    };
    const editorMessages = () => sent.map((code) => JSON.parse(code.slice(code.indexOf("(", code.indexOf("receiveOutput(")) + 1, code.lastIndexOf(")"))));
    return { world, ctx: context, run, runScript, root, order, attachEditor, editorMessages };
}

function commandsOf(world, name) {
    return world.devices[name].commands.map((c) => c.cmd);
}

function configBody(world, name) {
    return commandsOf(world, name).filter((c) => !["!", "end", "write memory"].includes(c));
}

module.exports = { loadExtension, commandsOf, configBody, root, order };
