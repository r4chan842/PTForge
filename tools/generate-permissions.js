"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const api = path.join(root, "src", "api");
const internal = new Set(fs.readFileSync(path.join(__dirname, "internal-functions.txt"), "utf8").split(/\s+/).filter(Boolean));
const readOnly = /^(get|is|find|has|list|count|describe|parse|build|plan|check|format|summarize|compare|diff|current|begin|end|run[A-Z]?hecks|to|ip|int|mask|cidr|network|broadcast|host|nth|split|acl|normalize|grid|circle|row|devicesIn|point|audit|show|ping|traceroute|reachability|stopPings|takeSnapshot|deleteSnapshot)/;

const areas = {
    cli: ["ios", "switching", "routing", "security", "redundancy", "simulation", "inspect"],
    topology: ["devices", "links", "hosts", "canvas", "topology", "services", "wireless", "events"],
    files: []
};
const byFile = {
    "workspace/files.js": "files",
    "workspace/project.js": "files",
    "workspace/command-log.js": "cli",
    "workspace/view.js": "topology",
    "workspace/remote.js": "topology",
    "snapshot/snapshot.js": "cli"
};
const fileNames = new Set(["saveSnapshot", "loadSnapshot", "exportTopology", "exportConfigs", "runScriptFile"]);

const map = { cli: [], topology: [], files: [] };
fs.readdirSync(api).sort().forEach((dir) => {
    fs.readdirSync(path.join(api, dir)).filter((f) => f.endsWith(".js")).sort().forEach((file) => {
        const key = dir + "/" + file;
        const permission = byFile[key] || Object.keys(areas).find((p) => areas[p].includes(dir));
        if (!permission) {
            return;
        }
        const text = fs.readFileSync(path.join(api, dir, file), "utf8");
        for (const match of text.matchAll(/^function (\w+)\(/gm)) {
            const name = match[1];
            if (internal.has(name)) {
                continue;
            }
            if (fileNames.has(name)) {
                map.files.push(name);
            } else if (permission === "files" || !readOnly.test(name)) {
                map[permission].push(name);
            }
        }
    });
});
map.raw = ["ipc", "network", "appWindow", "fileManager", "_ScriptModule", "$se", "Function", "eval"];

Object.keys(map).forEach((k) => map[k] = Array.from(new Set(map[k])).sort());
const body = "var pluginPermissionMap = " + JSON.stringify(map) + ";\n";
fs.writeFileSync(path.join(root, "src", "data", "permissions.js"), body);
console.log("src/data/permissions.js " + Object.keys(map).map((k) => k + " " + map[k].length).join(", "));
