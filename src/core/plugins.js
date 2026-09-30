var pluginExtension = ".pf";
var pluginStateFile = "plugins.json";
var pluginPermissions = ["topology", "cli", "files", "raw"];
var pluginReserved = ["enablePlugin", "disablePlugin", "reloadPlugins", "setPluginFolder", "loadEnabledPlugins", "editorPlugins"];
var pluginBuiltinCommands = ["help", "clear", "devices", "ping", "trace", "show", "cli", "audit", "snap", "diff", "calc", "run", "history", "exit", "plugins"];
var pluginFolderPath = "";
var pluginRecords = {};
var pluginActive = {};
var pluginCommands = {};

function pluginGlobal() {
    return Function("return this")();
}

function joinPath(folder, name) {
    var base = String(folder).replace(/[\\/]+$/, "");
    return base + (base.indexOf("\\") !== -1 && base.indexOf("/") === -1 ? "\\" : "/") + name;
}

function pluginHome() {
    return joinPath(String(callIfExists(appWindow(), "getDefaultFileSaveLocation", "")), "PTForge");
}

function getPluginFolder() {
    if (!pluginFolderPath) {
        var pointer = joinPath(pluginHome(), "plugin-folder.txt");
        var saved = "";
        try {
            saved = fileManager().fileExists(pointer) ? String(fileManager().getFileContents(pointer)).trim() : "";
        } catch (error) {
            saved = "";
        }
        pluginFolderPath = saved || joinPath(pluginHome(), "plugins");
    }
    return pluginFolderPath;
}

function setPluginFolder(path) {
    Object.keys(pluginActive).forEach(pluginDeactivate);
    pluginFolderPath = String(path || "");
    pluginRecords = {};
    try {
        if (!fileManager().directoryExists(pluginHome())) {
            fileManager().makeDirectory(pluginHome());
        }
        fileManager().writePlainTextToFile(joinPath(pluginHome(), "plugin-folder.txt"), pluginFolderPath);
    } catch (error) {
        console.log("Plugin folder was not saved: " + error);
    }
    return getPluginFolder();
}

function ensurePluginFolder() {
    var folder = getPluginFolder();
    if (!fileManager().directoryExists(folder)) {
        fileManager().makeDirectory(folder);
    }
    return folder;
}

function readPluginState() {
    var path = joinPath(getPluginFolder(), pluginStateFile);
    try {
        if (fileManager().fileExists(path)) {
            var state = JSON.parse(String(fileManager().getFileContents(path)));
            if (state && typeof state.enabled === "object" && state.enabled) {
                return state;
            }
        }
    } catch (error) {
        return { enabled: {} };
    }
    return { enabled: {} };
}

function writePluginState(state) {
    ensurePluginFolder();
    return fileManager().writePlainTextToFile(joinPath(getPluginFolder(), pluginStateFile), JSON.stringify(state, null, 2)) !== false;
}

function fileCheckSum(path) {
    try {
        return typeof fileManager().getFileCheckSum === "function" ? String(fileManager().getFileCheckSum(path) || "") : "";
    } catch (error) {
        return "";
    }
}

function mul32(a, b) {
    return (((a & 0xffff) * b) + ((((a >>> 16) * b) & 0xffff) << 16)) >>> 0;
}

function textHash(text) {
    var a = 0x811c9dc5;
    var b = 0x01000193;
    for (var i = 0; i < text.length; i++) {
        var c = text.charCodeAt(i);
        a = mul32((a ^ c) >>> 0, 0x01000193);
        b = mul32((b ^ c ^ (i & 255)) >>> 0, 0x5bd1e995);
    }
    return ("0000000" + a.toString(16)).slice(-8) + ("0000000" + b.toString(16)).slice(-8) + text.length.toString(16);
}

function parsePlugin(text, file) {
    var source = String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    var record = { file: file, name: baseName(file), permissions: [], error: "" };
    var match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);
    if (!match) {
        record.error = "Missing the --- manifest --- header";
        return record;
    }
    var manifest;
    try {
        manifest = JSON.parse(match[1]);
    } catch (error) {
        record.error = "Manifest is not valid JSON: " + error.message;
        return record;
    }
    record.id = String(manifest.id || "");
    record.name = String(manifest.name || record.id);
    record.version = String(manifest.version || "0.0.0");
    record.description = String(manifest.description || "");
    record.author = String(manifest.author || "");
    record.permissions = toList(manifest.permissions || []).map(String);
    record.body = match[2];
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(record.id)) {
        record.error = "id must be 1 to 41 lowercase letters, digits or dashes";
    } else {
        var unknown = record.permissions.filter(function (p) {
            return pluginPermissions.indexOf(p) === -1;
        });
        if (unknown.length) {
            record.error = "Unknown permission: " + unknown.join(", ");
        }
    }
    return record;
}

function scanPlugins() {
    var folder = ensurePluginFolder();
    var found = {};
    toList(fileManager().getFilesInDirectory(folder) || []).map(String).filter(function (name) {
        return name.toLowerCase().slice(-pluginExtension.length) === pluginExtension;
    }).sort().forEach(function (name) {
        var path = joinPath(folder, name);
        var text;
        try {
            text = String(fileManager().getFileContents(path));
        } catch (error) {
            text = "";
        }
        var record = parsePlugin(text, path);
        record.checksum = fileCheckSum(path) || textHash(text);
        if (!record.error && found[record.id]) {
            record.error = "Duplicate id " + record.id + " also used by " + baseName(found[record.id].file);
        }
        found[record.error ? "!" + name : record.id] = record;
    });
    pluginRecords = found;
    return found;
}

function samePermissions(a, b) {
    return toList(a || []).slice().sort().join(",") === toList(b || []).slice().sort().join(",");
}

function pluginConsent(record, state) {
    var saved = state.enabled[record.id];
    if (!saved) {
        return "none";
    }
    return saved.checksum === record.checksum && samePermissions(saved.permissions, record.permissions) ? "granted" : "changed";
}

function listPlugins() {
    scanPlugins();
    var state = readPluginState();
    return Object.keys(pluginRecords).map(function (key) {
        var r = pluginRecords[key];
        var active = pluginActive[r.id];
        return {
            id: r.id || "",
            name: r.name,
            version: r.version || "",
            description: r.description || "",
            author: r.author || "",
            permissions: r.permissions,
            file: r.file,
            checksum: r.checksum,
            enabled: !!active,
            consent: r.error ? "none" : pluginConsent(r, state),
            error: r.error || (active ? "" : (state.errors || {})[r.id] || ""),
            commands: active ? active.commands.slice() : [],
            functions: active ? active.functions.slice() : [],
            rules: active ? active.rules.map(function (x) { return x.name; }) : [],
            checks: active ? active.checks.map(function (x) { return x.name; }) : []
        };
    });
}

function pluginBlocker(id, name, permission) {
    var fail = function () {
        throw new Error("Plugin " + id + " needs the \"" + permission + "\" permission to use " + name);
    };
    if (typeof Proxy === "function") {
        return new Proxy(fail, {
            get: function (target, key) {
                if (key === "call" || key === "apply" || key === "bind") {
                    return Function.prototype[key];
                }
                return fail();
            }
        });
    }
    return fail;
}

function pluginSandboxNames(record) {
    var names = [];
    var values = [];
    Object.keys(pluginPermissionMap).forEach(function (permission) {
        if (record.permissions.indexOf(permission) !== -1) {
            return;
        }
        pluginPermissionMap[permission].forEach(function (name) {
            if (names.indexOf(name) === -1) {
                names.push(name);
                values.push(pluginBlocker(record.id, name, permission));
            }
        });
    });
    pluginReserved.forEach(function (name) {
        names.push(name);
        values.push(pluginBlocker(record.id, name, "plugin manager"));
    });
    return { names: names, values: values };
}

function pluginHandle(record, active) {
    var handle = {
        id: record.id,
        name: record.name,
        version: record.version,
        permissions: record.permissions.slice(),
        command: function (name, description, fn) {
            if (typeof description === "function") {
                fn = description;
                description = "";
            }
            var key = String(name).replace(/^\./, "");
            if (!/^[a-z][a-z0-9-]{0,30}$/.test(key)) {
                throw new Error("Bad command name ." + key);
            }
            if (pluginBuiltinCommands.indexOf(key) !== -1 || pluginCommands[key]) {
                throw new Error("Command ." + key + " is already taken");
            }
            if (typeof fn !== "function") {
                throw new Error("Command ." + key + " needs a function");
            }
            pluginCommands[key] = { id: record.id, description: String(description || ""), fn: fn };
            active.commands.push(key);
            return handle;
        },
        fn: function (name, fn) {
            var key = String(name);
            if (!/^[A-Za-z_$][\w$]*$/.test(key) || typeof fn !== "function") {
                throw new Error("fn needs a valid name and a function");
            }
            if (typeof pluginGlobal()[key] !== "undefined") {
                throw new Error(key + " already exists");
            }
            pluginGlobal()[key] = fn;
            active.functions.push(key);
            return handle;
        },
        rule: function (name, fn) {
            if (typeof fn !== "function") {
                throw new Error("Rule " + name + " needs a function");
            }
            active.rules.push({ name: String(name), fn: fn });
            return handle;
        },
        check: function (name, fn, hint, points) {
            if (typeof fn !== "function") {
                throw new Error("Check " + name + " needs a function");
            }
            active.checks.push({ name: String(name), fn: fn, hint: hint, points: points });
            return handle;
        },
        onDisable: function (fn) {
            if (typeof fn === "function") {
                active.cleanup.push(fn);
            }
            return handle;
        },
        log: function (value) {
            return log("[" + record.id + "] " + formatValue(value));
        }
    };
    return handle;
}

function pluginActivate(record) {
    var active = { id: record.id, record: record, commands: [], functions: [], rules: [], checks: [], cleanup: [] };
    var sandbox = pluginSandboxNames(record);
    try {
        var run = Function.apply(null, ["plugin"].concat(sandbox.names).concat([record.body]));
        pluginActive[record.id] = active;
        run.apply(null, [pluginHandle(record, active)].concat(sandbox.values));
    } catch (error) {
        pluginDeactivate(record.id);
        throw new Error("Plugin " + record.id + " failed to load: " + (error && error.message ? error.message : String(error)));
    }
    return active;
}

function pluginDeactivate(id) {
    var active = pluginActive[id];
    if (!active) {
        return false;
    }
    active.cleanup.forEach(function (fn) {
        try {
            fn();
        } catch (error) {
            console.log("Plugin " + id + " cleanup failed: " + error);
        }
    });
    active.commands.forEach(function (key) {
        delete pluginCommands[key];
    });
    active.functions.forEach(function (key) {
        try {
            delete pluginGlobal()[key];
        } catch (error) {
            pluginGlobal()[key] = undefined;
        }
    });
    delete pluginActive[id];
    return true;
}

function findPluginRecord(id) {
    scanPlugins();
    var record = pluginRecords[String(id)];
    if (!record) {
        record = Object.keys(pluginRecords).map(function (key) {
            return pluginRecords[key];
        }).filter(function (r) {
            return r.id === String(id);
        })[0];
    }
    if (!record) {
        throw new Error("Plugin not found: " + id);
    }
    return record;
}

function enablePlugin(id, grant) {
    var record = findPluginRecord(id);
    var state = readPluginState();
    if (record.error) {
        throw new Error(record.error);
    }
    if (pluginConsent(record, state) !== "granted" && grant !== true) {
        throw new Error("Plugin " + id + " needs your consent. Review its permissions and pass true to grant them");
    }
    pluginDeactivate(record.id);
    state.errors = state.errors || {};
    try {
        pluginActivate(record);
    } catch (error) {
        state.errors[record.id] = error.message;
        writePluginState(state);
        throw error;
    }
    delete state.errors[record.id];
    state.enabled[record.id] = { checksum: record.checksum, permissions: record.permissions.slice(), file: baseName(record.file) };
    writePluginState(state);
    return true;
}

function disablePlugin(id) {
    var state = readPluginState();
    var was = pluginDeactivate(String(id));
    if (state.enabled[id] || (state.errors || {})[id]) {
        delete state.enabled[id];
        if (state.errors) {
            delete state.errors[id];
        }
        writePluginState(state);
        return true;
    }
    return was;
}

function loadEnabledPlugins() {
    var loaded = [];
    var state = readPluginState();
    scanPlugins();
    Object.keys(pluginActive).forEach(pluginDeactivate);
    Object.keys(state.enabled).forEach(function (id) {
        var record = pluginRecords[id];
        if (!record || record.error || pluginConsent(record, state) !== "granted") {
            return;
        }
        try {
            pluginActivate(record);
            loaded.push(id);
        } catch (error) {
            console.log(error.message);
        }
    });
    return loaded;
}

function reloadPlugins() {
    return loadEnabledPlugins();
}

function getPluginCommands() {
    return Object.keys(pluginCommands).sort().map(function (key) {
        return { name: "." + key, plugin: pluginCommands[key].id, info: pluginCommands[key].description };
    });
}

function splitCommandArgs(text) {
    var args = [];
    String(text || "").replace(/"([^"]*)"|'([^']*)'|(\S+)/g, function (all, a, b, c) {
        args.push(a !== undefined ? a : b !== undefined ? b : c);
        return all;
    });
    return args;
}

function runPluginCommand(name, argsText) {
    var key = String(name).replace(/^\./, "");
    var command = pluginCommands[key];
    if (!command) {
        throw new Error("Unknown command ." + key);
    }
    var later = shellLater();
    return command.fn(splitCommandArgs(argsText), function (text) {
        later("log", formatValue(text));
    });
}

function pluginFindings() {
    var findings = [];
    Object.keys(pluginActive).sort().forEach(function (id) {
        pluginActive[id].rules.forEach(function (rule) {
            var result;
            try {
                result = rule.fn();
            } catch (error) {
                findings.push(finding("warning", id + "/" + rule.name, "", "", "Rule failed: " + (error && error.message ? error.message : error)));
                return;
            }
            toList(result || []).forEach(function (item) {
                if (typeof item === "string") {
                    findings.push(finding("warning", id + "/" + rule.name, "", "", item));
                } else if (item) {
                    var severity = /^(error|warning|info)$/.test(item.severity) ? item.severity : "warning";
                    findings.push(finding(severity, id + "/" + rule.name, item.device || "", item.port || "", String(item.message || "")));
                }
            });
        });
    });
    return findings;
}

function runPluginChecks(title) {
    var list = [];
    Object.keys(pluginActive).sort().forEach(function (id) {
        pluginActive[id].checks.forEach(function (item) {
            list.push({ name: id + ": " + item.name, test: item.fn, hint: item.hint, points: item.points });
        });
    });
    return runChecks(title || "Plugin checks", list);
}

function pluginTemplate(id, name) {
    return "---\n" + JSON.stringify({ id: id, name: name, version: "1.0.0", description: "", author: "", permissions: [] }, null, 2) + "\n---\n" +
        "plugin.command(\"" + id + "\", \"Say hello\", function (args, out) {\n    out(\"Hello from " + name + "\");\n    return getDeviceCount() + \" devices\";\n});\n";
}

function createPlugin(id, name) {
    var key = String(id || "");
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(key)) {
        throw new Error("id must be 1 to 41 lowercase letters, digits or dashes");
    }
    var path = joinPath(ensurePluginFolder(), key + pluginExtension);
    if (fileManager().fileExists(path)) {
        throw new Error("File already exists: " + path);
    }
    fileManager().writePlainTextToFile(path, pluginTemplate(key, String(name || key)));
    return path;
}
