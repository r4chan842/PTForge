var terminalState = { list: [], active: null, nextId: 1, history: [], host: null };

var shellCommands = [
    { name: ".help", args: "", info: "Show this list" },
    { name: ".clear", args: "", info: "Clear the terminal (Ctrl+L)" },
    { name: ".devices", args: "", info: "Devices with model and addresses" },
    { name: ".ping", args: "[source target]", info: "Ping matrix of the whole network, or one ping" },
    { name: ".trace", args: "source target", info: "Traceroute from a router, switch or host" },
    { name: ".show", args: "device command", info: "Run a show command, for example .show R1 ip route" },
    { name: ".cli", args: "device", info: "Talk to a device CLI in this terminal, exit to leave" },
    { name: ".audit", args: "", info: "Audit the network" },
    { name: ".snap", args: "[name]", info: "Take a snapshot of the network" },
    { name: ".diff", args: "name [other]", info: "Compare a snapshot with now or with another snapshot" },
    { name: ".calc", args: "address", info: "Subnet or IPv6 calculator, for example .calc 10.1.2.3/20" },
    { name: ".run", args: "file", info: "Run a workspace file in this shell, its variables stay available" },
    { name: ".history", args: "", info: "Commands typed in this session" },
    { name: ".exit", args: "", info: "Leave CLI mode, or close the terminal" }
];

function termEscape(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function colorizeValue(text) {
    var pattern = /('(?:\\.|[^'\\])*')|(\[(?:Function|Object|Array|Circular|Getter|Unreadable)[^\]]*\])|\b(true|false)\b|\b(null)\b|\b(undefined)\b|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)/g;
    var html = "";
    var cursor = 0;
    var match;
    while ((match = pattern.exec(text))) {
        html += termEscape(text.substring(cursor, match.index));
        var css = match[1] ? "t-green" : match[2] ? "t-cyan" : match[3] ? "t-yellow" : match[4] ? "t-bold" : match[5] ? "t-dim" : "t-yellow";
        html += "<span class=\"" + css + "\">" + termEscape(match[0]) + "</span>";
        cursor = match.index + match[0].length;
    }
    return html + termEscape(text.substring(cursor));
}

function isIncomplete(code) {
    var tokens = tokenize(code, {});
    var depth = 0;
    for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.type === "string" && t.text.length > 1 && t.text.charAt(0) === "`" && t.text.charAt(t.text.length - 1) !== "`") {
            return true;
        }
        if (t.type === "comment" && t.text.indexOf("/*") === 0 && t.text.slice(-2) !== "*/") {
            return true;
        }
        if (t.type === "punctuation" || t.type === "bracket" || /^b\d$/.test(t.type)) {
            if (/[([{]/.test(t.text)) {
                depth++;
            } else if (/[)\]}]/.test(t.text)) {
                depth--;
            }
        }
    }
    return depth > 0;
}

function globalizeDeclarations(code) {
    var tokens = tokenize(code, {});
    var depth = 0;
    var out = "";
    for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (/[([{]/.test(t.text) && t.text.length === 1 && t.type !== "string" && t.type !== "comment") {
            depth++;
        } else if (/[)\]}]/.test(t.text) && t.text.length === 1 && t.type !== "string" && t.type !== "comment") {
            depth--;
        }
        if (depth === 0 && t.type !== "string" && t.type !== "comment" && (t.text === "let" || t.text === "const")) {
            out += "var";
        } else {
            out += t.text;
        }
    }
    return out;
}

function splitArgs(text) {
    var parts = [];
    var re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    var m;
    while ((m = re.exec(text))) {
        parts.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
    }
    return parts;
}

function Terminal(kind, device) {
    this.id = "term" + terminalState.nextId++;
    this.kind = kind || "js";
    this.device = device || "";
    this.deviceKind = "";
    this.prompt = "";
    this.busy = false;
    this.historyIndex = -1;
    this.draft = "";
    this.defined = {};
    this.lastTab = 0;
    this.name = this.kind === "cli" ? (device || "CLI") : "PTForge JS";
    this.build();
}

Terminal.prototype.build = function () {
    var self = this;
    this.root = document.createElement("div");
    this.root.className = "term";
    this.root.setAttribute("data-term", this.id);
    this.root.innerHTML = "<div class=\"term-scroll\"><div class=\"term-out\"></div><div class=\"term-line\"><span class=\"term-prompt\"></span><textarea class=\"term-input\" rows=\"1\" spellcheck=\"false\" autocomplete=\"off\" autocapitalize=\"off\"></textarea></div><div class=\"term-busy hidden\"><span class=\"spin\"></span>running</div></div>";
    this.scroll = this.root.querySelector(".term-scroll");
    this.out = this.root.querySelector(".term-out");
    this.line = this.root.querySelector(".term-line");
    this.promptEl = this.root.querySelector(".term-prompt");
    this.input = this.root.querySelector(".term-input");
    this.busyEl = this.root.querySelector(".term-busy");
    this.input.addEventListener("keydown", function (event) {
        self.onKey(event);
    });
    this.input.addEventListener("input", function () {
        self.autosize();
    });
    this.root.addEventListener("mouseup", function () {
        var selected = window.getSelection ? String(window.getSelection()) : "";
        if (!selected) {
            self.focus();
        }
    });
    this.setPrompt();
};

Terminal.prototype.autosize = function () {
    this.input.style.height = "auto";
    this.input.style.height = this.input.scrollHeight + "px";
};

Terminal.prototype.setPrompt = function () {
    if (this.kind === "cli") {
        this.promptEl.innerHTML = "<span class=\"t-bgreen\">" + termEscape(this.prompt || this.device + ">") + "</span> ";
    } else {
        this.promptEl.innerHTML = "<span class=\"t-bcyan\">ptforge</span><span class=\"t-dim\">:</span><span class=\"t-bblue\">js</span><span class=\"t-dim\">&gt;</span> ";
    }
};

Terminal.prototype.scrollDown = function () {
    this.scroll.scrollTop = this.scroll.scrollHeight;
};

Terminal.prototype.writeHtml = function (html, css) {
    var row = document.createElement("div");
    row.className = "term-row" + (css ? " " + css : "");
    row.innerHTML = html;
    this.out.appendChild(row);
    while (this.out.children.length > 3000) {
        this.out.removeChild(this.out.firstChild);
    }
    this.scrollDown();
    return row;
};

Terminal.prototype.write = function (text, css) {
    return this.writeHtml(termEscape(text), css);
};

Terminal.prototype.echo = function (code) {
    var promptHtml = this.promptEl.innerHTML;
    this.writeHtml(promptHtml + termEscape(code), "term-echo");
};

Terminal.prototype.clear = function () {
    this.out.innerHTML = "";
};

Terminal.prototype.focus = function () {
    if (!this.busy) {
        this.input.focus();
    }
};

Terminal.prototype.setBusy = function (busy) {
    var self = this;
    this.busy = busy;
    this.line.classList.toggle("hidden", busy);
    clearTimeout(this.busyTimer);
    this.busyEl.classList.add("hidden");
    if (busy) {
        this.busyTimer = setTimeout(function () {
            self.busyEl.classList.remove("hidden");
            self.scrollDown();
        }, 400);
    } else {
        this.setPrompt();
        if (terminalState.active === this.id && terminalFocusAllowed()) {
            this.input.focus();
        }
        this.scrollDown();
    }
    renderTerminalTabs();
};

Terminal.prototype.welcome = function () {
    if (this.kind === "cli") {
        this.write("Connecting to " + this.device + "...", "t-dim");
        return;
    }
    var count = typeof functionCatalog !== "undefined" ? functionCatalog.length : 0;
    this.writeHtml("<span class=\"t-bold\">PTForge JavaScript Shell</span> <span class=\"t-dim\">" + termEscape(terminalVersion()) + "</span>");
    this.writeHtml("<span class=\"t-dim\">" + count + " Packet Tracer functions are ready. Type </span><span class=\"t-byellow\">.help</span><span class=\"t-dim\"> for shell commands, </span><span class=\"t-byellow\">Tab</span><span class=\"t-dim\"> to complete, </span><span class=\"t-byellow\">Up</span><span class=\"t-dim\"> for history.</span>");
    if (!terminalHost().connected()) {
        this.writeHtml("<span class=\"t-yellow\">Preview mode: JavaScript and device commands run only inside Packet Tracer. .help, .calc and .clear work here.</span>");
    }
    this.write("");
};

Terminal.prototype.pushHistory = function (code) {
    var list = terminalState.history;
    if (code && list[list.length - 1] !== code) {
        list.push(code);
        if (list.length > 300) {
            list.shift();
        }
        terminalHost().saveHistory(list);
    }
    this.historyIndex = -1;
    this.draft = "";
};

Terminal.prototype.historyMove = function (step) {
    var list = terminalState.history;
    if (!list.length) {
        return;
    }
    if (this.historyIndex === -1) {
        if (step > 0) {
            return;
        }
        this.draft = this.input.value;
        this.historyIndex = list.length;
    }
    var next = this.historyIndex + step;
    if (next >= list.length) {
        this.historyIndex = -1;
        this.input.value = this.draft;
    } else {
        this.historyIndex = Math.max(0, next);
        this.input.value = list[this.historyIndex];
    }
    this.autosize();
    var end = this.input.value.length;
    this.input.setSelectionRange(end, end);
};

Terminal.prototype.onKey = function (event) {
    var input = this.input;
    var value = input.value;
    var before = value.substring(0, input.selectionStart);
    var after = value.substring(input.selectionEnd);
    var ctrl = event.ctrlKey || event.metaKey;
    if (event.key === "Enter" && !event.shiftKey) {
        if (this.kind === "js" && isIncomplete(value) && after.trim() === "") {
            return;
        }
        event.preventDefault();
        this.submit();
        return;
    }
    if (event.key === "Tab") {
        event.preventDefault();
        this.complete();
        return;
    }
    if (event.key === "ArrowUp" && before.indexOf("\n") === -1) {
        event.preventDefault();
        this.historyMove(-1);
        return;
    }
    if (event.key === "ArrowDown" && after.indexOf("\n") === -1) {
        event.preventDefault();
        this.historyMove(1);
        return;
    }
    if (ctrl && (event.key === "l" || event.key === "L")) {
        event.preventDefault();
        event.stopPropagation();
        this.clear();
        return;
    }
    if (ctrl && (event.key === "c" || event.key === "C") && input.selectionStart === input.selectionEnd) {
        event.preventDefault();
        event.stopPropagation();
        this.echo(value + "^C");
        input.value = "";
        this.historyIndex = -1;
        this.autosize();
        return;
    }
    if (ctrl && (event.key === "d" || event.key === "D") && value === "") {
        event.preventDefault();
        event.stopPropagation();
        this.runDot(".exit", []);
    }
};

Terminal.prototype.candidates = function (word) {
    var names = {};
    var add = function (name) {
        if (name.indexOf(word) === 0 && name !== word) {
            names[name] = true;
        }
    };
    if (word.charAt(0) === ".") {
        shellCommands.forEach(function (c) { add(c.name); });
    } else {
        (typeof functionCatalog !== "undefined" ? functionCatalog : []).forEach(function (f) { add(f.name); });
        editorKeywords.forEach(add);
        Object.keys(this.defined).forEach(add);
        ["Math", "JSON", "Object", "Array", "String", "Number", "Date", "console"].forEach(add);
    }
    return Object.keys(names).sort();
};

Terminal.prototype.complete = function () {
    if (this.kind === "cli") {
        return;
    }
    var input = this.input;
    var before = input.value.substring(0, input.selectionStart);
    var match = /(^\.[a-z]*|[A-Za-z_$][\w$]*)$/.exec(before);
    if (!match || (match[0].charAt(0) !== "." && /\.\s*$/.test(before.substring(0, before.length - match[0].length)))) {
        return;
    }
    var word = match[0];
    var list = this.candidates(word);
    if (!list.length) {
        return;
    }
    var common = list[0];
    list.forEach(function (name) {
        while (name.indexOf(common) !== 0) {
            common = common.substring(0, common.length - 1);
        }
    });
    if (list.length === 1) {
        common = list[0] + (word.charAt(0) === "." ? " " : "");
    }
    if (common.length > word.length) {
        var start = input.selectionStart - word.length;
        input.setRangeText(common, start, input.selectionStart, "end");
        this.lastTab = 0;
        return;
    }
    var now = new Date().getTime();
    if (now - this.lastTab < 900 || list.length <= 12) {
        this.echo(input.value);
        var width = list.reduce(function (w, n) { return Math.max(w, n.length); }, 0) + 2;
        var columns = Math.max(1, Math.floor(Math.max(40, this.scroll.clientWidth / 8) / width));
        var rows = [];
        for (var i = 0; i < Math.min(list.length, 120); i += columns) {
            rows.push(list.slice(i, i + columns).map(function (n) { return (n + new Array(width).join(" ")).substring(0, width); }).join(""));
        }
        this.write(rows.join("\n") + (list.length > 120 ? "\n... " + (list.length - 120) + " more" : ""), "t-cyan");
    }
    this.lastTab = now;
};

Terminal.prototype.remember = function (code) {
    var re = /\b(?:var|let|const|function)\s+([A-Za-z_$][\w$]*)/g;
    var m;
    while ((m = re.exec(code))) {
        this.defined[m[1]] = true;
    }
};

Terminal.prototype.submit = function () {
    var code = this.input.value;
    this.input.value = "";
    this.autosize();
    this.echo(code);
    var trimmed = code.trim();
    this.pushHistory(trimmed);
    if (!trimmed) {
        return;
    }
    if (this.kind === "cli") {
        this.sendCli(trimmed);
        return;
    }
    var word = trimmed.split(/\s+/)[0];
    if (trimmed.charAt(0) === "." && /^\.[a-z]+$/.test(word)) {
        this.runDot(word, splitArgs(trimmed.substring(word.length)));
        return;
    }
    if (/^(clear|cls)$/.test(trimmed)) {
        this.clear();
        return;
    }
    if (trimmed === "help") {
        this.runDot(".help", []);
        return;
    }
    if (trimmed === "exit") {
        this.runDot(".exit", []);
        return;
    }
    if (/\b(pingAll|reachability|pingMatrix)\s*\(/.test(trimmed)) {
        this.awaitReach = true;
    }
    this.remember(code);
    this.evaluate(globalizeDeclarations(code));
};

Terminal.prototype.showReach = function (report) {
    var lines = report.rows.map(function (x) {
        var tag = x.state === "ok" ? "  OK   " : x.state === "partial" ? "  PART " : x.state === "failed" ? "  FAIL " : "  ?    ";
        return tag + (x.source + "            ").substring(0, 12) + "-> " + x.target + (x.percent !== null ? "  " + x.percent + "%" : "") + (x.rtt ? "  " + x.rtt.avg + " ms" : "");
    });
    this.write(lines.join("\n") || "No pings", "");
    this.write(report.ok + " ok, " + report.partial + " partial, " + report.failed + " failed, " + report.unknown + " unknown", report.failed || report.unknown ? "t-yellow" : "t-green");
    this.awaitReach = false;
};

function terminalReachability(report) {
    terminalState.list.forEach(function (term) {
        if (term.awaitReach) {
            term.showReach(report);
        }
    });
}

Terminal.prototype.evaluate = function (code) {
    if (!terminalHost().connected()) {
        this.write("The JavaScript shell runs inside Packet Tracer. Open this window from Extensions > PTForge Editor.", "t-yellow");
        return;
    }
    this.setBusy(true);
    terminalHost().engine("shellEval", this.id, code);
};

Terminal.prototype.sendCli = function (command) {
    if (/^(\.exit|exit|quit|logout)$/i.test(command) && /[>]$/.test(this.prompt || ">") && this.deviceKind !== "host") {
        this.leaveCli();
        return;
    }
    if (!terminalHost().connected()) {
        this.write("Device CLI needs Packet Tracer.", "t-yellow");
        return;
    }
    if (/^(\.exit)$/i.test(command)) {
        this.leaveCli();
        return;
    }
    this.setBusy(true);
    terminalHost().engine("shellCli", this.id, this.device, command);
};

Terminal.prototype.attach = function (device) {
    this.kind = "cli";
    this.device = device;
    this.prompt = "";
    this.name = device;
    this.write("Connecting to " + device + "...", "t-dim");
    if (!terminalHost().connected()) {
        this.write("Device CLI needs Packet Tracer.", "t-yellow");
        this.kind = "js";
        this.name = "PTForge JS";
        this.setPrompt();
        return;
    }
    this.setBusy(true);
    terminalHost().engine("shellAttach", this.id, device);
};

Terminal.prototype.leaveCli = function () {
    this.write("Disconnected from " + this.device, "t-dim");
    if (this.startedAsCli) {
        killTerminal(this.id);
        return;
    }
    this.kind = "js";
    this.device = "";
    this.prompt = "";
    this.name = "PTForge JS";
    this.setPrompt();
    renderTerminalTabs();
};

Terminal.prototype.receive = function (kind, data) {
    if (kind === "shell-log") {
        this.write(data.text, data.kind === "result" ? "t-bwhite" : "");
        return;
    }
    if (kind === "shell-result") {
        if (data.ok) {
            if (data.type === "text") {
                this.write(data.text);
            } else {
                this.writeHtml(colorizeValue(data.text));
            }
        } else {
            this.write("Uncaught " + data.text.replace(/^Uncaught /, ""), "t-red");
        }
        this.setBusy(false);
        return;
    }
    if (kind === "shell-cli") {
        if (data.error) {
            this.write(data.error, "t-red");
            if (data.attached === false) {
                this.kind = "js";
                this.name = "PTForge JS";
                if (this.startedAsCli) {
                    this.kind = "cli";
                    this.name = this.device + " (not connected)";
                }
            }
        } else {
            if (data.attached) {
                this.deviceKind = data.kind;
                this.write("Connected to " + data.device + (data.kind === "host" ? ". Commands open in the device Command Prompt window." : ". Type exit at the user prompt or .exit to leave."), "t-dim");
            }
            if (data.output) {
                this.write(data.output.replace(/\r/g, "").replace(/\n+$/, ""));
            }
            if (data.status && data.status !== "ok" && data.status !== "sent") {
                this.write("% " + data.status.replace(/-/g, " "), "t-red");
            } else if (data.status === "sent") {
                this.write("Sent to " + data.device + ". The reply appears in its Command Prompt.", "t-dim");
            }
            this.prompt = data.prompt || this.prompt;
        }
        this.setBusy(false);
    }
};

Terminal.prototype.runEngineText = function (expression) {
    this.evaluate("(function () { " + expression + " })()");
};

Terminal.prototype.runDot = function (name, args) {
    var host = terminalHost();
    var q = function (value) { return JSON.stringify(String(value)); };
    switch (name) {
        case ".help":
            var width = 22;
            this.write("Shell commands", "t-bold");
            this.writeHtml(shellCommands.map(function (c) {
                var head = (c.name + " " + c.args + new Array(width).join(" ")).substring(0, width);
                return "  <span class=\"t-byellow\">" + termEscape(head) + "</span><span class=\"t-dim\">" + termEscape(c.info) + "</span>";
            }).join("\n"));
            this.write("Everything else is JavaScript: every PTForge function is available, for example", "t-dim");
            this.writeHtml("  <span class=\"t-cyan\">setPcStatic(\"PC1\", \"192.168.1.20/24\", \"192.168.1.1\")</span>");
            this.write("Keys: Enter runs, Shift+Enter adds a line, Tab completes, Up and Down walk the history, Ctrl+L clears, Ctrl+C cancels the line.", "t-dim");
            return;
        case ".clear":
            this.clear();
            return;
        case ".history":
            this.write(terminalState.history.map(function (h, i) { return ("   " + (i + 1)).slice(-4) + "  " + h; }).join("\n") || "No history yet", "t-dim");
            return;
        case ".calc":
            if (!args.length) {
                this.write("Usage: .calc 192.168.10.77/26  or  .calc 2001:db8::1/64", "t-yellow");
                return;
            }
            try {
                var input = args.join(" ");
                var info = input.indexOf(":") !== -1 ? ipv6Info(input) : subnetInfo(input);
                var keys = Object.keys(info);
                var pad = keys.reduce(function (w, k) { return Math.max(w, k.length); }, 0) + 2;
                this.writeHtml(keys.map(function (k) {
                    return "  <span class=\"t-dim\">" + termEscape((k + new Array(pad).join(" ")).substring(0, pad)) + "</span><span class=\"t-bwhite\">" + termEscape(String(info[k])) + "</span>";
                }).join("\n"));
            } catch (error) {
                this.write(error.message, "t-red");
            }
            return;
        case ".exit":
            if (this.kind === "cli") {
                this.leaveCli();
            } else {
                killTerminal(this.id);
            }
            return;
        case ".cli":
            if (!args[0]) {
                this.write("Usage: .cli R1", "t-yellow");
                return;
            }
            this.attach(args[0]);
            return;
        case ".run":
            if (!args[0]) {
                this.write("Usage: .run lab.js", "t-yellow");
                return;
            }
            var text = host.fileText(args[0]);
            if (text === null) {
                this.write("No workspace file named " + args[0], "t-red");
                return;
            }
            this.remember(text);
            this.evaluate(globalizeDeclarations(text));
            return;
        case ".devices":
            this.runEngineText("var inv = getIpInventory(); return getDevices().map(function (n) { var ips = inv.filter(function (r) { return r.device === n; }).map(function (r) { return r.port + \" \" + r.ip; }); return (n + \"                \").substring(0, 16) + (getDeviceModel(n) + \"              \").substring(0, 14) + ips.join(\", \"); }).join(\"\\n\") || \"No devices\";");
            return;
        case ".ping":
            this.awaitReach = true;
            if (args.length >= 2) {
                this.runEngineText("var r = reachability({ sources: [" + q(args[0]) + "], targets: [" + q(args[1]) + "]" + (args[2] ? ", count: " + Number(args[2]) : "") + " }); return r.done ? \"No ping to run\" : \"Pinging \" + r.pending + \" address from \" + " + q(args[0]) + " + \"...\";");
            } else {
                this.runEngineText("var r = reachability(); return r.done ? \"Nothing to ping. Give routers, switches or hosts an IPv4 address first\" : \"Pinging \" + r.pending + \" addresses from \" + r.sources.length + \" devices. Results appear here and in the Reachability tab when Packet Tracer finishes...\";");
            }
            return;
        case ".trace":
            if (args.length < 2) {
                this.write("Usage: .trace R1 10.0.0.2", "t-yellow");
                return;
            }
            this.runEngineText("var r = traceroute(" + q(args[0]) + ", " + q(args[1]) + "); return r.output || (\"Status: \" + r.status);");
            return;
        case ".show":
            if (args.length < 2) {
                this.write("Usage: .show R1 ip route", "t-yellow");
                return;
            }
            this.runEngineText("return showCommand(" + q(args[0]) + ", " + q(args.slice(1).join(" ")) + ");");
            return;
        case ".audit":
            this.runEngineText("var a = auditNetwork(); return a.findings.map(function (f) { return (f.severity + \"       \").substring(0, 8) + f.message; }).join(\"\\n\") + \"\\n\" + a.errors + \" errors, \" + a.warnings + \" warnings, \" + a.infos + \" notes\";");
            return;
        case ".snap":
            this.runEngineText("return \"Snapshot \" + takeSnapshot(" + (args[0] ? q(args[0]) : "") + ") + \" saved\";");
            return;
        case ".diff":
            if (!args[0]) {
                this.write("Usage: .diff before  or  .diff before after", "t-yellow");
                return;
            }
            this.runEngineText("var d = showSnapshotDiff(" + q(args[0]) + (args[1] ? ", " + q(args[1]) : "") + "); return d.changes + \" changes from \" + d.from + \" to \" + d.to;");
            return;
    }
    this.write("Unknown shell command " + name + ". Type .help for the list.", "t-red");
};

function terminalHost() {
    return terminalState.host || {
        connected: function () { return false; },
        engine: function () { return false; },
        fileText: function () { return null; },
        saveHistory: function () {},
        version: ""
    };
}

function terminalVersion() {
    return terminalHost().version || "";
}

function terminalFocusAllowed() {
    var active = document.activeElement;
    return !active || active === document.body || active.classList.contains("term-input");
}

function terminalById(id) {
    for (var i = 0; i < terminalState.list.length; i++) {
        if (terminalState.list[i].id === id) {
            return terminalState.list[i];
        }
    }
    return null;
}

function activeTerminal() {
    return terminalById(terminalState.active);
}

function createTerminal(kind, device) {
    var term = new Terminal(kind === "cli" ? "js" : "js");
    terminalState.list.push(term);
    document.getElementById("term-views").appendChild(term.root);
    activateTerminal(term.id);
    if (kind === "cli" && device) {
        term.startedAsCli = true;
        term.attach(device);
    } else {
        term.welcome();
    }
    renderTerminalTabs();
    return term;
}

function activateTerminal(id) {
    terminalState.active = id;
    terminalState.list.forEach(function (t) {
        t.root.classList.toggle("hidden", t.id !== id);
    });
    renderTerminalTabs();
    var term = activeTerminal();
    if (term) {
        term.scrollDown();
        setTimeout(function () {
            term.focus();
        }, 0);
    }
}

function killTerminal(id) {
    var term = terminalById(id || terminalState.active);
    if (!term) {
        return;
    }
    var index = terminalState.list.indexOf(term);
    terminalState.list.splice(index, 1);
    if (term.root.parentNode) {
        term.root.parentNode.removeChild(term.root);
    }
    if (terminalState.active === term.id) {
        var next = terminalState.list[Math.min(index, terminalState.list.length - 1)];
        terminalState.active = next ? next.id : null;
        if (next) {
            activateTerminal(next.id);
        }
    }
    renderTerminalTabs();
}

function renderTerminalTabs() {
    var box = document.getElementById("term-tabs");
    var empty = document.getElementById("term-empty");
    if (!box) {
        return;
    }
    var list = terminalState.list;
    box.classList.toggle("hidden", list.length < 2);
    if (empty) {
        empty.classList.toggle("hidden", list.length > 0);
    }
    box.innerHTML = list.map(function (t) {
        var glyph = t.kind === "cli" ? "&gt;_" : "JS";
        return "<div class=\"term-tab" + (t.id === terminalState.active ? " active" : "") + "\" data-term-tab=\"" + t.id + "\" title=\"" + termEscape(t.name) + "\"><span class=\"term-tab-icon " + (t.kind === "cli" ? "cli" : "js") + "\">" + glyph + "</span><span class=\"term-tab-name\">" + termEscape(t.name) + "</span>" + (t.busy ? "<span class=\"spin\"></span>" : "") + "<span class=\"term-tab-kill\" data-term-kill=\"" + t.id + "\" title=\"Kill Terminal\">&#x2715;</span></div>";
    }).join("");
    var label = document.getElementById("term-title");
    if (label) {
        var term = activeTerminal();
        label.textContent = term ? term.name : "";
    }
}

function routeShellMessage(kind, data) {
    var term = terminalById(data.id);
    if (term) {
        term.receive(kind, data);
        return true;
    }
    return false;
}
