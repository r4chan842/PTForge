var debugSession = null;
var debugPreviewItems = 50;
var debugPreviewDepth = 2;
var debugTextLimit = 300;

function debugShortText(text) {
    var value = String(text);
    return value.length > debugTextLimit ? value.substring(0, debugTextLimit) + "…" : value;
}

function debugFunctionLabel(value) {
    var source = "";
    try {
        source = Function.prototype.toString.call(value);
    } catch (error) {
        source = "";
    }
    var match = /^[^(]*\(([^)]*)\)/.exec(source);
    var name = "";
    try {
        name = value.name || "";
    } catch (error) {
        name = "";
    }
    return "ƒ " + name + "(" + (match ? match[1].replace(/\s+/g, " ").trim() : "") + ")";
}

function debugSummary(value) {
    if (Array.isArray(value)) {
        return "Array(" + value.length + ")";
    }
    var keys = shellObjectKeys(value);
    var parts = keys.slice(0, 4).map(function (key) {
        var read = readProperty(value, key);
        var item = read.value;
        var text;
        if (read.getter) {
            text = "(…)";
        } else if (item === null || typeof item !== "object") {
            text = typeof item === "string" ? shellQuote(debugShortText(item).substring(0, 24)) : typeof item === "function" ? "ƒ" : String(item);
        } else {
            text = Array.isArray(item) ? "Array(" + item.length + ")" : "{…}";
        }
        return shellKey(key) + ": " + text;
    });
    return "{" + parts.join(", ") + (keys.length > 4 ? ", …" : "") + "}";
}

function debugPreview(value, depth) {
    var level = depth || 0;
    if (value === null) {
        return { t: "null", d: "null" };
    }
    if (value === undefined) {
        return { t: "undefined", d: "undefined" };
    }
    var kind = typeof value;
    if (kind === "string") {
        return { t: "string", d: shellQuote(debugShortText(value)) };
    }
    if (kind === "number" || kind === "boolean") {
        return { t: kind, d: String(value) };
    }
    if (kind === "function") {
        return { t: "function", d: debugFunctionLabel(value) };
    }
    if (kind !== "object") {
        return { t: kind, d: String(value) };
    }
    if (value instanceof Date) {
        return { t: "date", d: isNaN(value.getTime()) ? "Invalid Date" : value.toISOString() };
    }
    if (value instanceof RegExp) {
        return { t: "regexp", d: String(value) };
    }
    if (value instanceof Error) {
        return { t: "error", d: (value.name || "Error") + ": " + value.message };
    }
    var result = { t: Array.isArray(value) ? "array" : "object", d: debugSummary(value) };
    if (level < debugPreviewDepth) {
        var keys = Array.isArray(value) ? value.map(function (item, index) { return String(index); }) : shellObjectKeys(value);
        result.c = keys.slice(0, debugPreviewItems).map(function (key) {
            var child;
            try {
                var read = readProperty(value, key);
                child = read.getter ? { t: "getter", d: "(…)" } : debugPreview(read.value, level + 1);
            } catch (error) {
                child = { t: "error", d: "<unreadable>" };
            }
            return [key, child];
        });
        if (keys.length > debugPreviewItems) {
            result.more = keys.length - debugPreviewItems;
        }
        if (Array.isArray(value)) {
            result.c.push(["length", { t: "number", d: String(value.length) }]);
        }
    }
    return result;
}

function debugPeek(peek, expression) {
    try {
        return { ok: true, value: peek(expression) };
    } catch (error) {
        return { ok: false, error: error };
    }
}

function debugReadScopes(step, peek) {
    return (step.scopes || []).map(function (scope) {
        return {
            name: scope.name,
            vars: scope.names.map(function (name) {
                var read = debugPeek(peek, name);
                if (!read.ok) {
                    return [name, { t: "unavailable", d: /before initialization|not initialized|TDZ/i.test(String(read.error && read.error.message)) ? "<uninitialized>" : "<unavailable>" }];
                }
                return [name, debugPreview(read.value, 0)];
            })
        };
    });
}

function debugHitMatches(rule, count) {
    var text = String(rule || "").replace(/\s+/g, "");
    if (!text) {
        return true;
    }
    var match = /^(>=|<=|==|>|<|%)?(\d+)$/.exec(text);
    if (!match) {
        return true;
    }
    var target = Number(match[2]);
    switch (match[1]) {
        case ">=": return count >= target;
        case "<=": return count <= target;
        case ">": return count > target;
        case "<": return count < target;
        case "%": return target > 0 && count % target === 0;
        default: return count === target;
    }
}

function debugInterpolate(message, peek) {
    return String(message).replace(/\{([^}]+)\}/g, function (whole, expression) {
        var read = debugPeek(peek, expression);
        if (!read.ok) {
            return "<" + (read.error && read.error.message ? read.error.message : "error") + ">";
        }
        return typeof read.value === "string" ? read.value : inspectValue(read.value);
    });
}

function debugStackCopy(session) {
    return session.stack.map(function (frame) {
        return [frame.fid, frame.line];
    });
}

function debugRecord(session, id, peek, reason, extra, stack) {
    var step = session.config.steps[id] || { line: 0, scopes: [] };
    var frames = stack || debugStackCopy(session);
    var entry = {
        id: id,
        n: session.count,
        depth: frames.length,
        top: session.topLine,
        stack: frames,
        scopes: debugReadScopes(step, peek),
        watches: session.config.watches.map(function (expression) {
            var read = debugPeek(peek, expression);
            return read.ok ? debugPreview(read.value, 0) : { t: "error", d: read.error && read.error.message ? read.error.message : String(read.error) };
        })
    };
    if (reason) {
        entry.reason = reason;
    }
    if (extra) {
        entry.message = extra;
    }
    session.trace.push(entry);
}

var debugRuntime = {
    s: function (id, peek) {
        var session = debugSession;
        if (!session || session.busy) {
            return;
        }
        session.count++;
        var step = session.config.steps[id] || { line: 0 };
        if (session.stack.length) {
            session.stack[session.stack.length - 1].line = step.line;
        } else {
            session.topLine = step.line;
        }
        session.last = id;
        session.lastPeek = peek;
        session.lastStack = debugStackCopy(session);
        var reason = "";
        var message = "";
        var point = session.config.breakpoints[id];
        if (point) {
            session.hits[id] = (session.hits[id] || 0) + 1;
            var passes = true;
            if (point.condition) {
                session.busy = true;
                var read = debugPeek(peek, point.condition);
                session.busy = false;
                passes = read.ok ? Boolean(read.value) : true;
                if (!read.ok) {
                    message = "Condition failed: " + (read.error && read.error.message ? read.error.message : String(read.error));
                }
            }
            passes = passes && debugHitMatches(point.hit, session.hits[id]);
            if (passes && point.log) {
                session.busy = true;
                try {
                    session.logs.push({ n: session.count, line: step.line, text: debugInterpolate(point.log, peek) });
                } finally {
                    session.busy = false;
                }
            } else if (passes) {
                reason = "breakpoint";
            }
        }
        var room = session.trace.length < session.config.limit;
        var extraRoom = session.trace.length < session.config.limit + 500;
        if (room || (reason && extraRoom)) {
            session.busy = true;
            try {
                debugRecord(session, id, peek, reason, message);
            } finally {
                session.busy = false;
            }
        } else {
            session.truncated = true;
        }
    },
    e: function (fid) {
        var session = debugSession;
        if (!session || session.busy) {
            return;
        }
        var fn = session.config.functions[fid] || { line: 0 };
        session.stack.push({ fid: fid, line: fn.line });
        if (session.stack.length > 2000) {
            throw new RangeError("Maximum call stack size exceeded");
        }
    },
    x: function () {
        if (debugSession && !debugSession.busy) {
            debugSession.stack.pop();
        }
    }
};

function debugParseConfig(text) {
    var config = JSON.parse(text);
    config.steps = config.steps || [];
    config.functions = config.functions || [];
    config.breakpoints = config.breakpoints || {};
    config.watches = config.watches || [];
    config.limit = Math.max(50, Math.min(20000, Number(config.limit) || 3000));
    return config;
}

function debugRun(encodedCode, encodedConfig) {
    var code = decodeArgument(encodedCode);
    var config;
    try {
        config = debugParseConfig(decodeArgument(encodedConfig));
    } catch (error) {
        editorSend("debug-trace", { ok: false, phase: "config", error: { name: "Error", message: "Bad debug configuration" }, trace: [], logs: [] });
        return false;
    }
    var compiled;
    try {
        compiled = new Function("__dbg", code);
    } catch (error) {
        editorSend("debug-trace", { ok: false, phase: "compile", error: { name: error.name || "SyntaxError", message: error.message || String(error) }, trace: [], logs: [] });
        return false;
    }
    debugSession = { config: config, trace: [], stack: [], hits: {}, logs: [], count: 0, last: -1, truncated: false, topLine: 0 };
    var session = debugSession;
    var started = new Date().getTime();
    var failure = null;
    try {
        compiled(debugRuntime);
    } catch (error) {
        failure = { name: error && error.name ? error.name : "Error", message: error && error.message ? error.message : inspectValue(error) };
        if (session.lastPeek) {
            debugRecord(session, session.last, session.lastPeek, "exception", failure.name + ": " + failure.message, session.lastStack);
        }
    }
    debugSession = null;
    editorSend("debug-trace", {
        ok: !failure,
        phase: "run",
        error: failure,
        errorStep: failure ? session.last : -1,
        trace: session.trace,
        logs: session.logs,
        steps: session.count,
        truncated: session.truncated,
        ms: new Date().getTime() - started
    });
    return !failure;
}
