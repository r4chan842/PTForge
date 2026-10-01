"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const context = {};
vm.createContext(context);
["devices", "modules", "types", "links"].forEach((name) => {
    const code = fs.readFileSync(path.join(root, "src/data", name + ".js"), "utf8");
    vm.runInContext(code.replace(/^var /gm, "this."), context);
});

const typeNames = {};
Object.keys(context.deviceTypes).forEach((name) => {
    if (!(context.deviceTypes[name] in typeNames)) {
        typeNames[context.deviceTypes[name]] = name;
    }
});

function write(file, text) {
    fs.writeFileSync(path.join(root, "docs/reference", file), text);
}

function title(text) {
    return text + "\n" + "=".repeat(text.length) + "\n\n";
}

function columns(head, rows) {
    const all = [head].concat(rows);
    const width = head.map((_, i) => Math.max(...all.map((r) => String(r[i]).length)));
    const line = (r) => "    " + r.map((c, i) => String(c).padEnd(width[i])).join("  ").trimEnd();
    return [line(head), "    " + width.map((w) => "-".repeat(w)).join("  ")].concat(rows.map(line)).join("\n") + "\n";
}

let byType = {};
Object.keys(context.allDeviceTypes).forEach((model) => {
    const t = context.allDeviceTypes[model];
    (byType[t] = byType[t] || []).push(model);
});
let out = title("Device models") + "Every model accepted by addDevice. Model names are case sensitive.\n";
Object.keys(byType).sort((a, b) => a - b).forEach((t) => {
    out += "\n" + (typeNames[t] || t) + "\n" + "-".repeat(String(typeNames[t] || t).length) + "\n\n" + byType[t].map((m) => "* " + m).join("\n") + "\n";
});
write("device-models.md", out);

out = title("Device types") + "Names and numbers accepted by getDevices(filter).\n\n" +
    columns(["Name", "Number"], Object.keys(context.deviceTypes).map((n) => [n, context.deviceTypes[n]]));
write("device-types.md", out);

out = title("Modules") + "Every module accepted by addModule. Whether a module fits depends on the\ndevice and slot, check with getSupportedModules(device).\n\n" +
    columns(["Module", "Module type"], Object.keys(context.allModuleTypes).map((n) => [n, context.allModuleTypes[n]]));
write("modules.md", out);

out = title("Link types") + "Names accepted by addLink.\n\n" +
    columns(["Name", "Packet Tracer constant"], Object.keys(context.allLinkTypes).map((n) => [n, context.allLinkTypes[n]]));
write("link-types.md", out);

console.log("reference written");
