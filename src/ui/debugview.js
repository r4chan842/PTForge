var debugState = {
    session: null,
    breakpoints: {},
    watches: [],
    expanded: { "scope:0": true },
    stopOnEntry: false,
    pauseOnExceptions: true,
    breakpointsActive: true,
    limit: 3000,
    consoleHistory: [],
    consoleIndex: -1
};

var debugReasons = {
    breakpoint: "breakpoint",
    exception: "exception",
    entry: "entry",
    step: "step",
    frame: "step"
};

function fileBreakpoints(fileId) {
    return debugState.breakpoints[fileId] || (debugState.breakpoints[fileId] = {});
}

function breakpointList() {
    var list = [];
    Object.keys(debugState.breakpoints).forEach(function (fileId) {
        if (!app.files[fileId]) {
            return;
        }
        var map = debugState.breakpoints[fileId];
        Object.keys(map).forEach(function (line) {
            var bp = map[line];
            list.push({ fileId: fileId, line: Number(line), enabled: bp.enabled !== false, condition: bp.condition || "", hit: bp.hit || "", log: bp.log || "", verified: bp.verified });
        });
    });
    return list.sort(function (a, b) {
        return a.fileId === b.fileId ? a.line - b.line : app.files[a.fileId].name.localeCompare(app.files[b.fileId].name);
    });
}

function refreshBreakpointGlyphs(fileId) {
    var ids = fileId ? [fileId] : Object.keys(app.editors);
    ids.forEach(function (id) {
        var editor = app.editors[id];
        if (!editor) {
            return;
        }
        var map = {};
        var own = debugState.breakpoints[id] || {};
        Object.keys(own).forEach(function (line) {
            var bp = own[line];
            map[line] = { enabled: debugState.breakpointsActive && bp.enabled !== false, condition: bp.condition, hit: bp.hit, log: bp.log, verified: bp.verified };
        });
        editor.setBreakpoints(map);
    });
}

function breakpointsChanged(fileId) {
    refreshBreakpointGlyphs(fileId);
    renderDebugView();
    persist();
}

function toggleBreakpoint(fileId, line) {
    var map = fileBreakpoints(fileId);
    if (map[line]) {
        delete map[line];
    } else {
        map[line] = { enabled: true };
    }
    breakpointsChanged(fileId);
}

function toggleBreakpointAtCursor() {
    var file = activeFile();
    var editor = activeEditor();
    if (!file || !editor) {
        return;
    }
    toggleBreakpoint(file.id, editor.lineColumn().line);
}

function setBreakpointEnabled(fileId, line, enabled) {
    var bp = fileBreakpoints(fileId)[line];
    if (bp) {
        bp.enabled = enabled;
        breakpointsChanged(fileId);
    }
}

function removeAllBreakpoints() {
    debugState.breakpoints = {};
    breakpointsChanged();
}

function setAllBreakpoints(enabled) {
    breakpointList().forEach(function (bp) {
        debugState.breakpoints[bp.fileId][bp.line].enabled = enabled;
    });
    breakpointsChanged();
}

function toggleBreakpointsActive() {
    debugState.breakpointsActive = !debugState.breakpointsActive;
    breakpointsChanged();
}

function shiftBreakpoints(fileId, change) {
    var map = debugState.breakpoints[fileId];
    if (!map) {
        return;
    }
    var next = {};
    var changed = false;
    Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).forEach(function (line) {
        var target = line;
        if (line > change.end) {
            target = line + change.delta;
        } else if (line > change.start) {
            target = -1;
        } else if (line === change.start && change.atLineStart && change.start === change.end) {
            target = line + change.delta;
        }
        if (target !== line) {
            changed = true;
        }
        if (target >= 1 && !next[target]) {
            next[target] = map[line];
        } else if (target >= 1) {
            changed = true;
        }
    });
    if (changed) {
        debugState.breakpoints[fileId] = next;
        breakpointsChanged(fileId);
    }
}

function breakpointMenu(fileId, line, event) {
    var bp = fileBreakpoints(fileId)[line];
    var items = [];
    if (bp) {
        items.push({ label: "Remove Breakpoint", run: function () { toggleBreakpoint(fileId, line); } });
        items.push({ label: "Edit Breakpoint...", run: function () { editBreakpoint(fileId, line, bp.log ? "log" : bp.hit ? "hit" : "condition"); } });
        items.push({ label: bp.enabled === false ? "Enable Breakpoint" : "Disable Breakpoint", run: function () { setBreakpointEnabled(fileId, line, bp.enabled === false); } });
    } else {
        items.push({ label: "Add Breakpoint", run: function () { toggleBreakpoint(fileId, line); } });
        items.push({ label: "Add Conditional Breakpoint...", run: function () { editBreakpoint(fileId, line, "condition"); } });
        items.push({ label: "Add Logpoint...", run: function () { editBreakpoint(fileId, line, "log"); } });
    }
    showContextMenu(event.clientX, event.clientY, items);
}

function editBreakpoint(fileId, line, mode) {
    if (app.active !== fileId) {
        activate(fileId);
    }
    var editor = app.editors[fileId];
    if (!editor) {
        return;
    }
    closeBreakpointWidget();
    var bp = fileBreakpoints(fileId)[line] || {};
    var widget = document.createElement("div");
    widget.className = "bp-widget";
    widget.innerHTML = "<select class=\"bp-kind\"><option value=\"condition\">Expression</option><option value=\"hit\">Hit Count</option><option value=\"log\">Log Message</option></select><input class=\"bp-text\" spellcheck=\"false\">";
    editor.inner.appendChild(widget);
    widget.style.top = line * editor.lineHeight + "px";
    var kind = widget.querySelector(".bp-kind");
    var input = widget.querySelector(".bp-text");
    var placeholders = {
        condition: "Break when expression evaluates to true. Enter to accept, Escape to cancel.",
        hit: "Break when hit count condition is met, for example > 3 or % 2. Enter to accept.",
        log: "Message to log when breakpoint is hit. Expressions within {} are interpolated. Enter to accept."
    };
    var values = { condition: bp.condition || "", hit: bp.hit || "", log: bp.log || "" };
    var show = function () {
        input.placeholder = placeholders[kind.value];
        input.value = values[kind.value];
    };
    kind.value = mode;
    show();
    kind.addEventListener("change", function () {
        show();
        input.focus();
    });
    input.addEventListener("input", function () {
        values[kind.value] = input.value;
    });
    input.addEventListener("keydown", function (event) {
        event.stopPropagation();
        if (event.key === "Enter") {
            event.preventDefault();
            values[kind.value] = input.value;
            var map = fileBreakpoints(fileId);
            map[line] = { enabled: true, condition: values.condition.trim(), hit: values.hit.trim(), log: values.log.trim() };
            closeBreakpointWidget();
            breakpointsChanged(fileId);
            editor.focus();
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeBreakpointWidget();
            editor.focus();
        }
    });
    debugState.widget = widget;
    input.focus();
}

function closeBreakpointWidget() {
    if (debugState.widget && debugState.widget.parentNode) {
        debugState.widget.parentNode.removeChild(debugState.widget);
    }
    debugState.widget = null;
}

function showContextMenu(x, y, items) {
    closeContextMenu();
    var menu = document.createElement("div");
    menu.className = "ctx-menu";
    menu.innerHTML = items.map(function (item, i) {
        return item.separator ? "<div class=\"menu-sep\"></div>" : "<div class=\"menu-item" + (item.disabled ? " disabled" : "") + "\" data-ctx=\"" + i + "\"><span>" + escapeHtml(item.label) + "</span>" + (item.key ? "<span class=\"menu-key\">" + escapeHtml(item.key) + "</span>" : "") + "</div>";
    }).join("");
    document.body.appendChild(menu);
    var box = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, window.innerWidth - box.width - 4) + "px";
    menu.style.top = Math.min(y, window.innerHeight - box.height - 4) + "px";
    menu.addEventListener("mousedown", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var row = event.target.closest("[data-ctx]");
        if (row && !row.classList.contains("disabled")) {
            var item = items[Number(row.getAttribute("data-ctx"))];
            closeContextMenu();
            item.run();
        }
    });
    debugState.menu = menu;
}

function closeContextMenu() {
    if (debugState.menu && debugState.menu.parentNode) {
        debugState.menu.parentNode.removeChild(debugState.menu);
    }
    debugState.menu = null;
}

function debugConsoleWrite(kind, html) {
    var box = byId("debug-console-out");
    if (!box) {
        return;
    }
    var row = document.createElement("div");
    row.className = "dc-row dc-" + kind;
    row.innerHTML = html;
    box.appendChild(row);
    while (box.children.length > 2000) {
        box.removeChild(box.firstChild);
    }
    box.scrollTop = box.scrollHeight;
}

function debugConsoleText(kind, text, line) {
    var link = line ? "<span class=\"dc-src\" data-debug-line=\"" + line + "\">" + escapeHtml((debugState.session ? debugState.session.fileName : "") + ":" + line) + "</span>" : "";
    debugConsoleWrite(kind, link + "<span class=\"dc-text\">" + escapeHtml(text) + "</span>");
}

function clearDebugConsole() {
    var box = byId("debug-console-out");
    if (box) {
        box.innerHTML = "";
    }
}

function previewHtml(preview) {
    var type = preview ? preview.t : "undefined";
    return "<span class=\"dv-value dv-" + escapeHtml(type) + "\">" + escapeHtml(preview ? preview.d : "undefined") + "</span>";
}

function unquoteRecorded(text) {
    var escapes = { n: "\n", r: "\r", t: "\t" };
    return text.slice(1, -1).replace(/\\(.)/g, function (all, ch) {
        return escapes[ch] || ch;
    });
}

function rebuildRecorded(preview) {
    switch (preview.t) {
        case "null":
            return null;
        case "undefined":
            return undefined;
        case "number":
            return Number(preview.d);
        case "boolean":
            return preview.d === "true";
        case "string":
            return unquoteRecorded(preview.d);
        case "date":
            return new Date(preview.d);
        case "array":
        case "object":
            if (!preview.c || preview.more) {
                throw new Error("the value was recorded only in part");
            }
            var result = preview.t === "array" ? [] : {};
            preview.c.forEach(function (pair) {
                if (preview.t === "array" && pair[0] === "length") {
                    return;
                }
                if (pair[1].t === "getter" || pair[1].t === "function" || pair[1].t === "error") {
                    return;
                }
                result[pair[0]] = rebuildRecorded(pair[1]);
            });
            return result;
        default:
            throw new Error("a " + preview.t + " cannot be rebuilt from the recording");
    }
}

function previewValue(value, depth) {
    if (value === null) {
        return { t: "null", d: "null" };
    }
    var kind = typeof value;
    if (kind === "undefined") {
        return { t: "undefined", d: "undefined" };
    }
    if (kind === "string") {
        return { t: "string", d: "'" + value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'" };
    }
    if (kind === "number" || kind === "boolean") {
        return { t: kind, d: String(value) };
    }
    if (kind === "function") {
        return { t: "function", d: "ƒ " + (value.name || "anonymous") + "()" };
    }
    if (value instanceof Date) {
        return { t: "date", d: value.toISOString() };
    }
    var isArray = Array.isArray(value);
    var keys = Object.keys(value);
    var out = { t: isArray ? "array" : "object", d: isArray ? "Array(" + value.length + ")" : "{" + keys.slice(0, 4).join(", ") + (keys.length > 4 ? ", …" : "") + "}" };
    if ((depth || 0) < 3) {
        out.c = keys.slice(0, 100).map(function (key) {
            return [key, previewValue(value[key], (depth || 0) + 1)];
        });
        if (isArray) {
            out.c.push(["length", { t: "number", d: String(value.length) }]);
        }
    }
    return out;
}

var recordedBuiltins = {};
["Math", "JSON", "Number", "String", "Boolean", "Array", "Object", "Date", "RegExp", "parseInt", "parseFloat", "isNaN", "isFinite", "NaN", "Infinity", "encodeURIComponent", "decodeURIComponent"].forEach(function (name) {
    recordedBuiltins[name] = true;
});

function evaluateRecorded(expression, entry) {
    var names = {};
    entry.scopes.forEach(function (scope) {
        scope.vars.forEach(function (pair) {
            if (!Object.prototype.hasOwnProperty.call(names, pair[0])) {
                names[pair[0]] = pair[1];
            }
        });
    });
    var scope = new Proxy({}, {
        has: function (target, key) {
            return typeof key === "string" && key !== "__scope" && !recordedBuiltins.hasOwnProperty(key);
        },
        get: function (target, key) {
            if (key === Symbol.unscopables) {
                return undefined;
            }
            if (!Object.prototype.hasOwnProperty.call(names, key)) {
                if (key === "undefined") {
                    return undefined;
                }
                throw new ReferenceError(String(key) + " is not defined here");
            }
            try {
                return rebuildRecorded(names[key]);
            } catch (error) {
                throw new Error(String(key) + ": " + error.message);
            }
        },
        set: function () {
            throw new Error("Recorded values are read only");
        }
    });
    var run = new Function("__scope", "with (__scope) { return (" + expression + "\n); }");
    return run(scope);
}

function resolveRecorded(expression, entry, session) {
    var direct = resolveRecordedPath(expression, entry, session);
    if (direct || !entry) {
        return direct;
    }
    try {
        return previewValue(evaluateRecorded(expression, entry), 0);
    } catch (error) {
        return null;
    }
}

function resolveRecordedPath(expression, entry, session) {
    if (!entry) {
        return null;
    }
    var watchIndex = session.watches.indexOf(expression);
    if (watchIndex !== -1 && entry.watches[watchIndex]) {
        return entry.watches[watchIndex];
    }
    var parts = [];
    var re = /([A-Za-z_$][\w$]*)|\[(\d+)\]|\["([^"]*)"\]|\['([^']*)'\]/g;
    var rest = expression.replace(/\s+/g, "");
    var m;
    var consumed = 0;
    while ((m = re.exec(rest))) {
        var gap = rest.substring(consumed, m.index);
        if (gap !== "" && gap !== ".") {
            return null;
        }
        parts.push(m[1] || m[2] || m[3] || m[4]);
        consumed = m.index + m[0].length;
    }
    if (!parts.length || consumed !== rest.length) {
        return null;
    }
    var current = null;
    for (var s = 0; s < entry.scopes.length && !current; s++) {
        entry.scopes[s].vars.forEach(function (pair) {
            if (!current && pair[0] === parts[0]) {
                current = pair[1];
            }
        });
    }
    for (var i = 1; current && i < parts.length; i++) {
        var next = null;
        (current.c || []).forEach(function (pair) {
            if (!next && pair[0] === parts[i]) {
                next = pair[1];
            }
        });
        if (!next && current.t === "string" && parts[i] === "length") {
            next = { t: "number", d: String(current.d.length - 2) };
        }
        current = next;
    }
    return current;
}

function debugEntry() {
    var session = debugState.session;
    return session && session.index >= 0 ? session.trace[session.index] : null;
}

function startDebugging() {
    var session = debugState.session;
    if (session && session.state === "paused") {
        debugContinue();
        return;
    }
    if (session) {
        return;
    }
    var file = activeFile();
    if (!file || !/\.js$/i.test(file.name)) {
        notify("warning", "Open a JavaScript file to start debugging");
        return;
    }
    if (!inPacketTracer) {
        showPanel("output");
        addOutput("warn", "Preview mode: debugging runs only inside Packet Tracer. Open this window from Extensions > PTForge.");
        return;
    }
    var source = activeEditor().getValue();
    var built;
    try {
        built = instrumentScript(source);
    } catch (error) {
        showPanel("debug");
        var line = error.loc ? error.loc.line : 0;
        debugConsoleText("error", "SyntaxError: " + String(error.message).replace(/\s*\(\d+:\d+\)$/, ""), line);
        if (line) {
            activeEditor().goToLine(line);
        }
        return;
    }
    var list = [];
    var own = fileBreakpoints(file.id);
    Object.keys(own).forEach(function (line) {
        var bp = own[line];
        if (debugState.breakpointsActive && bp.enabled !== false) {
            list.push({ line: Number(line), condition: bp.condition, hit: bp.hit, log: bp.log });
        }
    });
    var resolved = breakpointConfig(built.steps, list);
    resolved.resolved.forEach(function (r) {
        if (own[r.line]) {
            own[r.line].verified = r.verified;
        }
    });
    refreshBreakpointGlyphs(file.id);
    debugState.session = {
        fileId: file.id,
        fileName: file.name,
        source: source,
        steps: built.steps,
        functions: built.functions,
        watches: debugState.watches.slice(),
        trace: [],
        logs: [],
        printedLogs: 0,
        output: [],
        index: -1,
        frame: 0,
        state: "running",
        started: new Date().getTime()
    };
    var config = { steps: built.steps, functions: built.functions, breakpoints: resolved.map, watches: debugState.watches.slice(), limit: debugState.limit };
    showView("debug");
    showPanel("debug");
    debugConsoleWrite("info", "<span class=\"dc-text\">Debugging " + escapeHtml(file.name) + (inPacketTracer ? "" : " (preview)") + "</span>");
    setDebugChrome(true);
    renderDebugView();
    if (!callEngine("debugRun", built.code, JSON.stringify(config))) {
        debugConsoleText("warning", "The debugger runs the script inside Packet Tracer. Open PTForge from Extensions in Packet Tracer to debug.");
        endDebugging(true);
    }
}

function receiveDebugTrace(data) {
    var session = debugState.session;
    if (!session) {
        return;
    }
    if (data.phase !== "run") {
        debugConsoleText("error", (data.error ? data.error.name + ": " + data.error.message : "The script could not start"));
        endDebugging(true);
        return;
    }
    session.trace = data.trace || [];
    session.logs = data.logs || [];
    session.error = data.error;
    session.truncated = data.truncated;
    session.total = data.steps;
    session.ms = data.ms;
    if (!debugState.pauseOnExceptions) {
        session.trace.forEach(function (entry) {
            if (entry.reason === "exception") {
                entry.reason = "";
            }
        });
    }
    if (session.truncated) {
        debugConsoleText("warning", "Recorded the first " + session.trace.length + " of " + session.total + " steps. Breakpoints later in the run still stop. Raise the step limit in Run and Debug for more.");
    }
    var first = firstStop(session.trace, debugState.stopOnEntry);
    if (first === -1) {
        finishDebugging();
        return;
    }
    pauseAt(first, debugState.stopOnEntry && first === 0 && !session.trace[0].reason ? "entry" : "");
}

function flushLogs(upTo) {
    var session = debugState.session;
    while (session.printedLogs < session.logs.length && (upTo === undefined || session.logs[session.printedLogs].n <= upTo)) {
        var item = session.logs[session.printedLogs++];
        debugConsoleText("log", item.text, item.line);
    }
}

function pauseAt(index, reason) {
    var session = debugState.session;
    var entry = session.trace[index];
    session.index = index;
    session.frame = 0;
    session.state = "paused";
    session.reason = reason || entry.reason || "step";
    flushLogs(entry.n);
    if (entry.reason === "exception" && entry.message) {
        debugConsoleText("error", "Uncaught " + entry.message, session.steps[entry.id].line);
    }
    if (entry.message && entry.reason !== "exception") {
        debugConsoleText("warning", entry.message, session.steps[entry.id].line);
    }
    showExecution();
    renderDebugView();
    setDebugChrome(true);
}

function showExecution() {
    var session = debugState.session;
    var entry = debugEntry();
    if (!session || !entry) {
        return;
    }
    if (app.active !== session.fileId && app.files[session.fileId]) {
        activate(session.fileId);
    }
    var editor = app.editors[session.fileId];
    if (!editor) {
        return;
    }
    var frames = callStackOf(entry, session.steps, session.functions);
    var frame = frames[Math.min(session.frame, frames.length - 1)];
    var message = entry.reason === "exception" && session.frame === 0 ? entry.message : "";
    editor.setExecution(frame.line, session.frame === 0 ? "top" : "frame", message);
}

function debugMove(mode) {
    var session = debugState.session;
    if (!session || session.state !== "paused") {
        return;
    }
    var next = traceStep(session.trace, session.index, mode);
    if (next === -1) {
        finishDebugging();
        return;
    }
    pauseAt(next, mode === "continue" || mode === "reverse" ? "" : "step");
}

function debugContinue() {
    debugMove("continue");
}

function finishDebugging() {
    var session = debugState.session;
    if (!session) {
        return;
    }
    flushLogs();
    session.output.forEach(function (text) {
        debugConsoleText("log", text);
    });
    if (session.error) {
        var line = session.trace.length ? session.steps[session.trace[session.trace.length - 1].id].line : 0;
        if (!debugState.pauseOnExceptions || !session.trace.some(function (e) { return e.reason === "exception"; })) {
            debugConsoleText("error", "Uncaught " + session.error.name + ": " + session.error.message, line);
        }
    }
    debugConsoleWrite("info", "<span class=\"dc-text\">Finished " + escapeHtml(session.fileName) + " in " + (session.ms || 0) + " ms, " + (session.total || 0) + " steps</span>");
    endDebugging(false);
}

function stopDebugging() {
    if (!debugState.session) {
        return;
    }
    debugConsoleWrite("info", "<span class=\"dc-text\">Debugging stopped</span>");
    endDebugging(false);
}

function endDebugging() {
    var session = debugState.session;
    debugState.session = null;
    if (session && app.editors[session.fileId]) {
        app.editors[session.fileId].setExecution(0);
    }
    hideDebugHover();
    setDebugChrome(false);
    renderDebugView();
}

function restartDebugging() {
    var session = debugState.session;
    if (session) {
        endDebugging(false);
        if (app.files[session.fileId] && app.active !== session.fileId) {
            activate(session.fileId);
        }
    }
    startDebugging();
}

function debugSourceChanged(fileId) {
    var session = debugState.session;
    if (session && session.fileId === fileId && session.state === "paused" && app.editors[fileId].getValue() !== session.source) {
        debugConsoleText("warning", "The file changed. Debugging stopped, start again to debug the new code.");
        endDebugging(false);
    }
}

function selectFrame(index) {
    var session = debugState.session;
    if (!session || session.state !== "paused") {
        return;
    }
    session.frame = index;
    showExecution();
    renderDebugView();
}

function setDebugChrome(active) {
    var bar = byId("debug-toolbar");
    var session = debugState.session;
    document.body.classList.toggle("debugging", Boolean(active && session));
    if (!bar) {
        return;
    }
    bar.classList.toggle("hidden", !(active && session));
    var paused = Boolean(session && session.state === "paused");
    Array.prototype.forEach.call(bar.querySelectorAll("[data-needs-pause]"), function (button) {
        button.classList.toggle("disabled", !paused);
    });
    var status = byId("sb-debug");
    if (status) {
        status.classList.toggle("hidden", !session);
        status.innerHTML = session ? icon("debug") + "<span>" + escapeHtml(session.fileName) + (paused ? " (paused)" : " (running)") + "</span>" : "";
    }
}

function treeRows(pairs, path, depth, out) {
    pairs.forEach(function (pair) {
        var key = path + "/" + pair[0];
        var preview = pair[1];
        var expandable = Boolean(preview.c && preview.c.length);
        var open = expandable && debugState.expanded[key];
        out.push("<div class=\"dv-row" + (expandable ? " expandable" : "") + "\" style=\"padding-left:" + (8 + depth * 12) + "px\"" + (expandable ? " data-dv-toggle=\"" + escapeHtml(key) + "\"" : "") + ">" +
            "<span class=\"dv-twisty" + (expandable ? (open ? " open" : "") : " none") + "\">" + icon("chevron") + "</span>" +
            "<span class=\"dv-name" + (/^\d+$/.test(pair[0]) || pair[0] === "length" ? " index" : "") + "\">" + escapeHtml(pair[0]) + "</span><span class=\"dv-sep\">: </span>" + previewHtml(preview) + "</div>");
        if (open) {
            treeRows(preview.c, key, depth + 1, out);
            if (preview.more) {
                out.push("<div class=\"dv-row dv-more\" style=\"padding-left:" + (20 + (depth + 1) * 12) + "px\">… " + preview.more + " more</div>");
            }
        }
    });
}

function renderVariables(entry) {
    if (!entry) {
        return "";
    }
    var out = [];
    entry.scopes.forEach(function (scope, i) {
        var key = "scope:" + i;
        var open = debugState.expanded[key] !== undefined ? debugState.expanded[key] : i === 0;
        out.push("<div class=\"dv-row dv-scope expandable\" data-dv-toggle=\"" + key + "\"><span class=\"dv-twisty" + (open ? " open" : "") + "\">" + icon("chevron") + "</span><span>" + escapeHtml(scope.name) + "</span></div>");
        if (open) {
            if (!scope.vars.length) {
                out.push("<div class=\"dv-row dv-more\" style=\"padding-left:28px\">No variables</div>");
            }
            treeRows(scope.vars, key, 1, out);
        }
    });
    return out.join("");
}

function renderWatches(entry, session) {
    var out = debugState.watches.map(function (expression, i) {
        var value = null;
        var note = "";
        if (entry) {
            value = resolveRecorded(expression, entry, session);
            if (!value) {
                note = session.watches.indexOf(expression) === -1 ? "not recorded, restart to evaluate" : "not available";
            }
        }
        var pairs = value ? [[expression, value]] : [];
        var rows = [];
        if (value) {
            treeRows(pairs, "watch:" + i, 0, rows);
        } else {
            rows.push("<div class=\"dv-row\" style=\"padding-left:8px\"><span class=\"dv-twisty none\">" + icon("chevron") + "</span><span class=\"dv-name\">" + escapeHtml(expression) + "</span>" + (entry ? "<span class=\"dv-sep\">: </span><span class=\"dv-value dv-unavailable\">" + escapeHtml(note) + "</span>" : "") + "</div>");
        }
        return "<div class=\"dv-watch\" data-watch=\"" + i + "\">" + rows.join("") + "<span class=\"dv-watch-acts\"><span data-watch-edit=\"" + i + "\" title=\"Edit Expression\">" + icon("edit") + "</span><span data-watch-remove=\"" + i + "\" title=\"Remove Expression\">" + icon("close") + "</span></span></div>";
    });
    if (debugState.addingWatch) {
        out.push("<div class=\"dv-watch-input\"><input id=\"watch-input\" spellcheck=\"false\" placeholder=\"Expression to watch\"></div>");
    }
    return out.join("") || "<div class=\"tree-hint\">Add an expression with the + button. Values are recorded while the script runs.</div>";
}

function renderCallStack(entry, session) {
    if (!entry) {
        return "";
    }
    var frames = callStackOf(entry, session.steps, session.functions);
    var label = { breakpoint: "PAUSED ON BREAKPOINT", exception: "PAUSED ON EXCEPTION", entry: "PAUSED ON ENTRY", step: "PAUSED ON STEP" }[debugReasons[session.reason] || "step"];
    return "<div class=\"cs-thread\"><span>" + escapeHtml(session.fileName) + "</span><span class=\"cs-state\">" + label + "</span></div>" + frames.map(function (frame, i) {
        return "<div class=\"cs-frame" + (i === session.frame ? " selected" : "") + "\" data-frame=\"" + i + "\"><span class=\"cs-name\">" + escapeHtml(frame.name) + "</span><span class=\"cs-loc\">" + escapeHtml(session.fileName) + " " + frame.line + "</span></div>";
    }).join("");
}

function renderBreakpoints() {
    var rows = ["<label class=\"bp-row bp-exc\"><input type=\"checkbox\" data-bp-exceptions" + (debugState.pauseOnExceptions ? " checked" : "") + "><span>Uncaught Exceptions</span></label>"];
    breakpointList().forEach(function (bp) {
        var file = app.files[bp.fileId];
        var detail = bp.log ? "Log: " + bp.log : bp.condition ? "When " + bp.condition : bp.hit ? "Hit count " + bp.hit : "";
        var dot = "bp-dot" + (bp.log ? " log" : bp.condition || bp.hit ? " cond" : "") + (bp.enabled && debugState.breakpointsActive ? "" : " off") + (bp.verified === false ? " unverified" : "");
        rows.push("<div class=\"bp-row\" data-bp-file=\"" + bp.fileId + "\" data-bp-line=\"" + bp.line + "\"><input type=\"checkbox\" data-bp-enable" + (bp.enabled ? " checked" : "") + "><span class=\"" + dot + "\"></span><span class=\"bp-file\">" + escapeHtml(file.name) + "</span><span class=\"bp-detail\">" + escapeHtml(detail) + "</span><span class=\"bp-line\">" + bp.line + "</span><span class=\"bp-remove\" data-bp-remove title=\"Remove Breakpoint\">" + icon("close") + "</span></div>");
    });
    return rows.join("");
}

function renderDebugView() {
    var host = byId("view-debug");
    if (!host) {
        return;
    }
    var session = debugState.session;
    var entry = debugEntry();
    var idle = !session;
    byId("debug-start").classList.toggle("hidden", !idle);
    byId("debug-sections").classList.toggle("hidden", idle && !breakpointList().length && !debugState.watches.length);
    byId("dbg-variables").innerHTML = entry ? renderVariables(entry) : "<div class=\"tree-hint\">" + (session ? "Running" : "Not paused") + "</div>";
    byId("dbg-watch").innerHTML = renderWatches(entry, session);
    byId("dbg-stack").innerHTML = entry ? renderCallStack(entry, session) : "<div class=\"tree-hint\">" + (session ? "Running" : "Not paused") + "</div>";
    byId("dbg-breakpoints").innerHTML = renderBreakpoints();
    byId("sec-variables").classList.toggle("hidden", idle);
    byId("sec-stack").classList.toggle("hidden", idle);
    var entryBox = byId("debug-entry");
    if (entryBox) {
        entryBox.checked = debugState.stopOnEntry;
    }
    var limit = byId("debug-limit");
    if (limit) {
        limit.value = String(debugState.limit);
    }
    var input = byId("watch-input");
    if (input) {
        input.focus();
    }
    var progress = byId("debug-progress");
    if (progress) {
        progress.textContent = session && session.index >= 0 ? "Step " + (session.index + 1) + " of " + session.trace.length : "";
    }
}

function onDebugViewClick(event) {
    var toggle = event.target.closest("[data-dv-toggle]");
    if (toggle) {
        var key = toggle.getAttribute("data-dv-toggle");
        var isScope = key.indexOf("scope:") === 0 && key.indexOf("/") === -1;
        var current = debugState.expanded[key] !== undefined ? debugState.expanded[key] : isScope && key === "scope:0";
        debugState.expanded[key] = !current;
        renderDebugView();
        return true;
    }
    var frame = event.target.closest("[data-frame]");
    if (frame) {
        selectFrame(Number(frame.getAttribute("data-frame")));
        return true;
    }
    var remove = event.target.closest("[data-watch-remove]");
    if (remove) {
        debugState.watches.splice(Number(remove.getAttribute("data-watch-remove")), 1);
        renderDebugView();
        persist();
        return true;
    }
    var edit = event.target.closest("[data-watch-edit]");
    if (edit) {
        var index = Number(edit.getAttribute("data-watch-edit"));
        var old = debugState.watches[index];
        debugState.watches.splice(index, 1);
        debugState.addingWatch = true;
        renderDebugView();
        byId("watch-input").value = old;
        return true;
    }
    var bpRow = event.target.closest("[data-bp-file]");
    if (bpRow) {
        var fileId = bpRow.getAttribute("data-bp-file");
        var line = Number(bpRow.getAttribute("data-bp-line"));
        if (event.target.closest("[data-bp-remove]")) {
            toggleBreakpoint(fileId, line);
        } else if (event.target.matches("[data-bp-enable]")) {
            setBreakpointEnabled(fileId, line, event.target.checked);
        } else {
            activate(fileId);
            app.editors[fileId].goToLine(line);
        }
        return true;
    }
    if (event.target.matches("[data-bp-exceptions]")) {
        debugState.pauseOnExceptions = event.target.checked;
        persist();
        return true;
    }
    return false;
}

function onWatchKey(event) {
    if (event.target.id !== "watch-input") {
        return false;
    }
    if (event.key === "Enter") {
        var value = event.target.value.trim();
        debugState.addingWatch = false;
        if (value) {
            debugState.watches.push(value);
        }
        renderDebugView();
        persist();
        return true;
    }
    if (event.key === "Escape") {
        debugState.addingWatch = false;
        renderDebugView();
        return true;
    }
    return false;
}

function addWatch(expression) {
    if (expression) {
        if (debugState.watches.indexOf(expression) === -1) {
            debugState.watches.push(expression);
        }
        showView("debug");
    } else {
        showView("debug");
        debugState.addingWatch = true;
    }
    renderDebugView();
    persist();
}

function evaluateInDebugConsole(text) {
    var expression = text.trim();
    if (!expression) {
        return;
    }
    debugState.consoleHistory.push(expression);
    debugState.consoleIndex = -1;
    debugConsoleWrite("input", "<span class=\"dc-text\">" + escapeHtml(expression) + "</span>");
    var session = debugState.session;
    var entry = debugEntry();
    if (session && entry) {
        var value = resolveRecorded(expression, entry, session);
        if (value) {
            var rows = [];
            treeRows([[expression, value]], "console:" + debugState.consoleHistory.length, 0, rows);
            debugConsoleWrite("value", rows.join(""));
        } else {
            var reason = "";
            try {
                evaluateRecorded(expression, entry);
            } catch (error) {
                reason = error && error.message ? error.message : String(error);
            }
            debugConsoleText("error", (reason ? reason + ". " : "") + "Add " + expression + " to Watch and restart to record its live value.");
        }
        return;
    }
    if (!inPacketTracer) {
        debugConsoleText("warning", "Expressions run inside Packet Tracer.");
        return;
    }
    callEngine("shellEval", "debug-console", globalizeDeclarations(expression));
}

function receiveConsoleShell(kind, data) {
    if (kind === "shell-log") {
        debugConsoleText("log", data.text);
    } else if (kind === "shell-result") {
        debugConsoleWrite(data.ok ? "value" : "error", data.ok && data.type !== "text" ? "<span class=\"dc-text\">" + colorizeValue(data.text) + "</span>" : "<span class=\"dc-text\">" + escapeHtml(data.text) + "</span>");
    }
}

function onDebugConsoleKey(event) {
    var input = event.target;
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        var value = input.value;
        input.value = "";
        evaluateInDebugConsole(value);
        return;
    }
    var list = debugState.consoleHistory;
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && list.length) {
        event.preventDefault();
        var index = debugState.consoleIndex === -1 ? list.length : debugState.consoleIndex;
        index += event.key === "ArrowUp" ? -1 : 1;
        if (index >= list.length) {
            debugState.consoleIndex = -1;
            input.value = "";
        } else {
            debugState.consoleIndex = Math.max(0, index);
            input.value = list[debugState.consoleIndex];
        }
    }
}

function showDebugHover(info) {
    var session = debugState.session;
    var entry = debugEntry();
    if (!info || !session || !entry || app.active !== session.fileId || session.frame !== 0) {
        if (!info) {
            debugState.hoverTimer = setTimeout(function () {
                var box = byId("debug-hover");
                if (box && !box.matches(":hover")) {
                    hideDebugHover();
                }
            }, 200);
        }
        return;
    }
    var value = resolveRecordedPath(info.expression, entry, session);
    if (!value) {
        hideDebugHover();
        return;
    }
    clearTimeout(debugState.hoverTimer);
    var box = byId("debug-hover");
    var rows = [];
    treeRows([[info.expression, value]], "hover", 0, rows);
    box.innerHTML = rows.join("");
    box.classList.remove("hidden");
    var rect = box.getBoundingClientRect();
    box.style.left = Math.max(4, Math.min(info.x, window.innerWidth - rect.width - 8)) + "px";
    box.style.top = (info.y + 14 + rect.height > window.innerHeight ? info.y - rect.height - 10 : info.y + 14) + "px";
}

function hideDebugHover() {
    var box = byId("debug-hover");
    if (box) {
        box.classList.add("hidden");
    }
}

function onDebugHoverClick(event) {
    var toggle = event.target.closest("[data-dv-toggle]");
    if (!toggle) {
        return;
    }
    var key = toggle.getAttribute("data-dv-toggle");
    debugState.expanded[key] = !debugState.expanded[key];
    var session = debugState.session;
    var entry = debugEntry();
    var box = byId("debug-hover");
    var first = box.querySelector(".dv-name");
    if (!session || !entry || !first) {
        return;
    }
    var expression = first.textContent;
    var rows = [];
    treeRows([[expression, resolveRecordedPath(expression, entry, session)]], "hover", 0, rows);
    box.innerHTML = rows.join("");
}

function debugSettings() {
    return {
        breakpoints: debugState.breakpoints,
        watches: debugState.watches,
        stopOnEntry: debugState.stopOnEntry,
        pauseOnExceptions: debugState.pauseOnExceptions,
        breakpointsActive: debugState.breakpointsActive,
        limit: debugState.limit
    };
}

function restoreDebugSettings(saved) {
    if (!saved) {
        return;
    }
    var clean = {};
    Object.keys(saved.breakpoints || {}).forEach(function (fileId) {
        clean[fileId] = {};
        Object.keys(saved.breakpoints[fileId]).forEach(function (line) {
            var bp = saved.breakpoints[fileId][line];
            clean[fileId][line] = { enabled: bp.enabled !== false, condition: bp.condition || "", hit: bp.hit || "", log: bp.log || "" };
        });
    });
    debugState.breakpoints = clean;
    debugState.watches = Array.isArray(saved.watches) ? saved.watches.filter(function (w) { return typeof w === "string"; }) : [];
    debugState.stopOnEntry = Boolean(saved.stopOnEntry);
    debugState.pauseOnExceptions = saved.pauseOnExceptions !== false;
    debugState.breakpointsActive = saved.breakpointsActive !== false;
    debugState.limit = Number(saved.limit) || 3000;
}
