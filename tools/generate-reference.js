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

const back = "\n\n← [Documentation](../README.md)\n";

let byType = {};
Object.keys(context.allDeviceTypes).forEach((model) => {
    const t = context.allDeviceTypes[model];
    (byType[t] = byType[t] || []).push(model);
});
let out = "# Device models\n\nEvery model accepted by `addDevice`. Model names are case sensitive." + back + "\n| Type | Models |\n|------|--------|\n";
Object.keys(byType).sort((a, b) => a - b).forEach((t) => {
    out += "| " + (typeNames[t] || t) + " | " + byType[t].map((m) => "`" + m + "`").join(", ") + " |\n";
});
write("device-models.md", out);

out = "# Device types\n\nNames and numbers accepted by `getDevices(filter)`." + back + "\n| Name | Number |\n|------|--------|\n";
Object.keys(context.deviceTypes).forEach((name) => {
    out += "| `" + name + "` | " + context.deviceTypes[name] + " |\n";
});
write("device-types.md", out);

out = "# Modules\n\nEvery module accepted by `addModule`. Whether a module fits depends on the device and slot, check with `getSupportedModules(device)`." + back + "\n| Module | Module type |\n|--------|-------------|\n";
Object.keys(context.allModuleTypes).forEach((name) => {
    out += "| `" + name + "` | " + context.allModuleTypes[name] + " |\n";
});
write("modules.md", out);

out = "# Link types\n\nNames accepted by `addLink`." + back + "\n| Name | Packet Tracer constant |\n|------|------------------------|\n";
Object.keys(context.allLinkTypes).forEach((name) => {
    out += "| `" + name + "` | " + context.allLinkTypes[name] + " |\n";
});
write("link-types.md", out);

console.log("reference written");
