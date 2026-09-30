var editorPairs = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'", "`": "`" };
var editorClosers = { ")": true, "]": true, "}": true };
var editorIndent = "    ";
var editorKeywords = "var function return if else for while do switch case break continue new typeof instanceof try catch finally throw true false null undefined this delete in".split(" ");

function el(tag, className, parent) {
    var node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (parent) {
        parent.appendChild(node);
    }
    return node;
}

function CodeEditor(host, options) {
    this.options = options || {};
    this.api = namesToSet(this.options.catalog || []);
    this.catalog = this.options.catalog || [];
    this.catalogByName = {};
    for (var i = 0; i < this.catalog.length; i++) {
        this.catalogByName[this.catalog[i].name] = this.catalog[i];
    }
    this.problems = [];
    this.marks = {};
    this.matches = [];
    this.matchIndex = -1;
    this.lineCount = 0;
    this.suggestions = [];
    this.suggestIndex = 0;
    this.bracketMarks = {};
    this.breakpoints = {};
    this.execLine = 0;
    this.execKind = "";
    this.build(host);
    this.setFontSize(this.options.fontSize || 14);
    this.bind();
}

CodeEditor.prototype.build = function (host) {
    this.root = el("div", "ed", host);
    this.gutter = el("div", "ed-gutter", this.root);
    this.lines = el("div", "ed-lines", this.gutter);
    this.scroller = el("div", "ed-scroll", this.root);
    this.inner = el("div", "ed-inner", this.scroller);
    this.current = el("div", "ed-current", this.inner);
    this.execBar = el("div", "ed-exec hidden", this.inner);
    this.findLayer = el("pre", "ed-layer ed-find", this.inner);
    this.hl = el("pre", "ed-layer ed-hl", this.inner);
    this.input = el("textarea", "ed-input", this.inner);
    this.input.setAttribute("spellcheck", "false");
    this.input.setAttribute("wrap", "off");
    this.input.setAttribute("autocomplete", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.probe = el("span", "ed-probe", this.inner);
    this.probe.textContent = new Array(101).join("M");
    this.suggestBox = el("div", "ed-suggest hidden", this.root);
    this.suggestList = el("div", "ed-suggest-list", this.suggestBox);
    this.suggestDoc = el("div", "ed-suggest-doc", this.suggestBox);
    this.hint = el("div", "ed-hint hidden", this.root);
    this.zone = el("div", "ed-zone hidden", this.inner);
};

CodeEditor.prototype.bind = function () {
    var self = this;
    this.input.addEventListener("input", function (event) {
        self.onInput(event);
    });
    this.input.addEventListener("keydown", function (event) {
        self.onKeyDown(event);
    });
    ["keyup", "click", "select", "focus"].forEach(function (name) {
        self.input.addEventListener(name, function () {
            self.scheduleCursor();
        });
    });
    this.input.addEventListener("blur", function () {
        setTimeout(function () {
            if (document.activeElement !== self.input) {
                self.closeSuggest();
                self.hint.classList.add("hidden");
            }
        }, 150);
    });
    this.scroller.addEventListener("scroll", function () {
        self.lines.style.transform = "translateY(" + (-self.scroller.scrollTop) + "px)";
        self.closeSuggest();
        self.hint.classList.add("hidden");
    });
    this.suggestList.addEventListener("mousedown", function (event) {
        var row = event.target.closest(".ed-suggest-row");
        if (row) {
            event.preventDefault();
            self.suggestIndex = Number(row.getAttribute("data-index"));
            self.acceptSuggestion();
        }
    });
    this.gutter.addEventListener("mousedown", function (event) {
        var row = event.target.closest(".ed-ln");
        if (!row || event.button !== 0) {
            return;
        }
        event.preventDefault();
        var line = Number(row.getAttribute("data-line"));
        if (event.target.closest(".ed-glyph") && self.options.onGlyphClick) {
            self.options.onGlyphClick(line, event);
        } else {
            self.selectLine(line);
        }
    });
    this.gutter.addEventListener("contextmenu", function (event) {
        var row = event.target.closest(".ed-ln");
        if (row && self.options.onGutterMenu) {
            event.preventDefault();
            self.options.onGutterMenu(Number(row.getAttribute("data-line")), event);
        }
    });
    this.input.addEventListener("beforeinput", function () {
        self.rememberLines();
    });
    this.input.addEventListener("mousemove", function (event) {
        self.onHoverMove(event);
    });
    this.input.addEventListener("mouseleave", function () {
        clearTimeout(self.hoverTimer);
        if (self.options.onHover) {
            self.options.onHover(null);
        }
    });
};

CodeEditor.prototype.rememberLines = function () {
    var sel = this.selection();
    var text = this.input.value;
    var startLine = text.substring(0, sel.start).split("\n").length;
    var endLine = text.substring(0, sel.end).split("\n").length;
    var lineStart = text.lastIndexOf("\n", sel.start - 1) + 1;
    this.before = { count: text.split("\n").length, start: startLine, end: endLine, atLineStart: sel.start === lineStart && sel.start === sel.end };
};

CodeEditor.prototype.trackLines = function () {
    var before = this.before;
    this.before = null;
    if (!before) {
        return;
    }
    var delta = this.input.value.split("\n").length - before.count;
    if (!delta || !this.options.onLinesShift) {
        return;
    }
    this.options.onLinesShift({ start: before.start, end: before.end, delta: delta, atLineStart: before.atLineStart });
};

CodeEditor.prototype.positionAt = function (clientX, clientY) {
    var box = this.scroller.getBoundingClientRect();
    var y = clientY - box.top + this.scroller.scrollTop;
    var x = clientX - box.left + this.scroller.scrollLeft - 8;
    var lines = this.input.value.split("\n");
    var line = Math.floor(y / this.lineHeight) + 1;
    if (line < 1 || line > lines.length || x < 0) {
        return null;
    }
    var column = Math.floor(x / this.measure());
    if (column >= lines[line - 1].length) {
        return null;
    }
    return { line: line, column: column + 1, offset: this.offsetOfLine(line) + column };
};

CodeEditor.prototype.expressionAt = function (offset) {
    var text = this.input.value;
    if (!/[\w$]/.test(text.charAt(offset))) {
        return null;
    }
    var start = offset;
    var end = offset;
    while (end < text.length && /[\w$]/.test(text.charAt(end))) {
        end++;
    }
    while (start > 0 && /[\w$.]/.test(text.charAt(start - 1))) {
        start--;
    }
    var expression = text.substring(start, end).replace(/^\.+/, "");
    if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(expression) || this.inStringOrComment(offset)) {
        return null;
    }
    return { expression: expression, start: start, end: end };
};

CodeEditor.prototype.onHoverMove = function (event) {
    var self = this;
    if (!this.options.onHover) {
        return;
    }
    clearTimeout(this.hoverTimer);
    var x = event.clientX;
    var y = event.clientY;
    this.hoverTimer = setTimeout(function () {
        var pos = self.positionAt(x, y);
        var found = pos ? self.expressionAt(pos.offset) : null;
        self.options.onHover(found ? { expression: found.expression, line: pos.line, x: x, y: y } : null);
    }, 350);
};

CodeEditor.prototype.setBreakpoints = function (map) {
    this.breakpoints = map || {};
    this.gutterDirty = true;
    this.renderGutter(this.input.value.split("\n").length);
};

CodeEditor.prototype.setExecution = function (line, kind, message) {
    this.execLine = line || 0;
    this.execKind = kind || "";
    this.execBar.classList.toggle("hidden", !this.execLine);
    this.execBar.classList.toggle("focus", this.execKind === "frame");
    if (this.execLine) {
        this.execBar.style.top = (this.execLine - 1) * this.lineHeight + "px";
    }
    this.zone.classList.toggle("hidden", !(this.execLine && message));
    if (this.execLine && message) {
        this.zone.style.top = this.execLine * this.lineHeight + "px";
        this.zone.innerHTML = "<div class=\"ed-zone-head\">Exception has occurred: " + escapeHtml(message.split(":")[0]) + "</div><div class=\"ed-zone-body\">" + escapeHtml(message) + "</div>";
    }
    this.gutterDirty = true;
    this.renderGutter(this.input.value.split("\n").length);
    if (this.execLine) {
        var top = (this.execLine - 1) * this.lineHeight;
        var view = this.scroller.clientHeight;
        if (top < this.scroller.scrollTop || top + this.lineHeight * 3 > this.scroller.scrollTop + view) {
            this.scroller.scrollTop = Math.max(0, top - Math.round(view / 3));
        }
    }
};

CodeEditor.prototype.setFontSize = function (size) {
    this.fontSize = size;
    this.lineHeight = Math.round(size * 1.5);
    this.root.style.setProperty("--ed-font", size + "px");
    this.root.style.setProperty("--ed-line", this.lineHeight + "px");
    this.charWidth = 0;
    this.render();
};

CodeEditor.prototype.measure = function () {
    if (!this.charWidth) {
        var width = this.probe.getBoundingClientRect().width / 100;
        this.charWidth = width > 0 ? width : this.fontSize * 0.6;
    }
    return this.charWidth;
};

CodeEditor.prototype.getValue = function () {
    return this.input.value;
};

CodeEditor.prototype.setValue = function (text) {
    this.before = null;
    this.input.value = String(text).replace(/\r\n?/g, "\n");
    this.input.setSelectionRange(0, 0);
    this.render();
    this.updateCursor();
};

CodeEditor.prototype.focus = function () {
    this.input.focus();
};

CodeEditor.prototype.show = function (visible) {
    this.root.classList.toggle("hidden", !visible);
    if (visible) {
        this.charWidth = 0;
        this.render();
        this.updateCursor();
    }
};

CodeEditor.prototype.selection = function () {
    return { start: this.input.selectionStart, end: this.input.selectionEnd };
};

CodeEditor.prototype.selectedText = function () {
    var sel = this.selection();
    return this.input.value.substring(sel.start, sel.end);
};

CodeEditor.prototype.replaceRange = function (start, end, text, selStart, selEnd) {
    var input = this.input;
    input.focus();
    input.setSelectionRange(start, end);
    this.rememberLines();
    this.programmatic = true;
    var done = false;
    try {
        done = text === "" ? (start === end || document.execCommand("delete", false)) : document.execCommand("insertText", false, text);
    } catch (error) {
        done = false;
    }
    if (!done || input.value.substring(start, start + text.length) !== text) {
        input.setSelectionRange(start, end);
        this.rememberLines();
        input.setRangeText(text, start, end, "end");
        this.onInput({ inputType: "insertReplacementText" });
    }
    this.before = null;
    this.programmatic = false;
    var caretStart = selStart === undefined ? start + text.length : selStart;
    input.setSelectionRange(caretStart, selEnd === undefined ? caretStart : selEnd);
    this.scheduleCursor();
};

CodeEditor.prototype.insert = function (text) {
    var sel = this.selection();
    this.replaceRange(sel.start, sel.end, text);
};

CodeEditor.prototype.onInput = function (event) {
    this.trackLines();
    this.render();
    this.updateCursor();
    if (this.options.onChange) {
        this.options.onChange(this);
    }
    var type = event && event.inputType;
    if (this.programmatic) {
        this.closeSuggest();
    } else if (type === "insertText" && event.data && event.data.length === 1 && /[\w$]/.test(event.data)) {
        this.openSuggest(false);
    } else if (type === "deleteContentBackward" && !this.suggestBox.classList.contains("hidden")) {
        this.openSuggest(false);
    } else {
        this.closeSuggest();
    }
};

CodeEditor.prototype.render = function () {
    var text = this.input.value;
    var marks = {};
    var key;
    for (key in this.marks) {
        marks[key] = this.marks[key];
    }
    for (key in this.bracketMarks) {
        marks[key] = marks[key] ? marks[key] + " tk-" + this.bracketMarks[key] : this.bracketMarks[key];
    }
    this.hl.innerHTML = highlightHtml(text, this.api, marks) + "\n";
    this.renderFind();
    var lines = text.split("\n");
    if (lines.length !== this.lineCount || this.gutterDirty) {
        this.renderGutter(lines.length);
    }
    var longest = 0;
    for (var i = 0; i < lines.length; i++) {
        var width = lines[i].replace(/\t/g, editorIndent).length;
        if (width > longest) {
            longest = width;
        }
    }
    var viewHeight = this.scroller.clientHeight || 400;
    var viewWidth = this.scroller.clientWidth || 600;
    this.inner.style.height = Math.max(viewHeight, lines.length * this.lineHeight + Math.round(viewHeight * 0.6)) + "px";
    this.inner.style.width = Math.max(viewWidth, Math.ceil(longest * this.measure()) + 80) + "px";
};

CodeEditor.prototype.renderGutter = function (count) {
    var byLine = {};
    this.problems.forEach(function (p) {
        if (!byLine[p.line] || p.severity === "error") {
            byLine[p.line] = p.severity;
        }
    });
    var html = [];
    for (var i = 1; i <= count; i++) {
        var css = "ed-ln" + (byLine[i] ? " ed-ln-" + byLine[i] : "") + (i === this.activeLine ? " active" : "");
        var bp = this.breakpoints[i];
        if (bp) {
            css += " bp" + (bp.enabled === false ? " bp-off" : "") + (bp.log ? " bp-log" : bp.condition || bp.hit ? " bp-cond" : "") + (bp.verified === false ? " bp-unverified" : "");
        }
        if (i === this.execLine) {
            css += this.execKind === "frame" ? " exec-frame" : " exec";
        }
        html.push("<div class=\"" + css + "\" data-line=\"" + i + "\"><span class=\"ed-glyph\"></span><span class=\"ed-num\">" + i + "</span></div>");
    }
    this.lines.innerHTML = html.join("");
    this.lineCount = count;
    this.gutterDirty = false;
    this.root.style.setProperty("--ed-gutter", Math.max(3, String(count).length) + 3 + "ch");
};

CodeEditor.prototype.lineColumn = function (offset) {
    var before = this.input.value.substring(0, offset);
    var line = before.split("\n").length;
    return { line: line, column: offset - before.lastIndexOf("\n") };
};

CodeEditor.prototype.offsetOfLine = function (line) {
    var text = this.input.value;
    var offset = 0;
    for (var i = 1; i < line; i++) {
        var next = text.indexOf("\n", offset);
        if (next === -1) {
            return text.length;
        }
        offset = next + 1;
    }
    return offset;
};

CodeEditor.prototype.scheduleCursor = function () {
    var self = this;
    if (this.cursorTimer) {
        return;
    }
    this.cursorTimer = setTimeout(function () {
        self.cursorTimer = null;
        self.updateCursor();
    }, 0);
};

CodeEditor.prototype.updateCursor = function () {
    var sel = this.selection();
    var pos = this.lineColumn(sel.end);
    this.current.style.top = (pos.line - 1) * this.lineHeight + "px";
    if (pos.line !== this.activeLine) {
        var rows = this.lines.children;
        if (rows[this.activeLine - 1]) {
            rows[this.activeLine - 1].classList.remove("active");
        }
        if (rows[pos.line - 1]) {
            rows[pos.line - 1].classList.add("active");
        }
        this.activeLine = pos.line;
    }
    this.current.classList.toggle("hidden", sel.start !== sel.end);
    this.updateBracketMatch(sel);
    this.updateHint();
    if (this.options.onCursor) {
        this.options.onCursor(pos, sel.end - sel.start);
    }
};

CodeEditor.prototype.updateBracketMatch = function (sel) {
    var next = {};
    if (sel.start === sel.end) {
        var match = findBracketMatch(this.input.value, sel.start, this.api);
        if (match) {
            next[match[0]] = "match";
            next[match[1]] = "match";
        }
    }
    if (JSON.stringify(next) !== JSON.stringify(this.bracketMarks)) {
        this.bracketMarks = next;
        this.render();
    }
};

function findBracketMatch(text, caret, api) {
    var tokens = tokenize(text, api).filter(function (t) {
        return t.type === "bracket";
    });
    var target = -1;
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].start === caret - 1 || tokens[i].start === caret) {
            target = i;
            if (tokens[i].start === caret - 1) {
                break;
            }
        }
    }
    if (target === -1) {
        return null;
    }
    var opens = "([{";
    var closes = ")]}";
    var token = tokens[target];
    var isOpen = opens.indexOf(token.text) !== -1;
    var depth = 0;
    var step = isOpen ? 1 : -1;
    for (var j = target; j >= 0 && j < tokens.length; j += step) {
        var t = tokens[j].text;
        if ((isOpen ? opens : closes).indexOf(t) !== -1) {
            depth++;
        } else {
            depth--;
        }
        if (depth === 0) {
            var pairOk = isOpen ? closes.indexOf(t) === opens.indexOf(token.text) : opens.indexOf(t) === closes.indexOf(token.text);
            return pairOk ? [token.start, tokens[j].start] : null;
        }
    }
    return null;
}

CodeEditor.prototype.setProblems = function (problems) {
    var text = this.input.value;
    var marks = {};
    var self = this;
    this.problems = problems || [];
    this.problems.forEach(function (p) {
        if (p.severity === "warning" && isFinite(p.offset)) {
            marks[p.offset] = "warn";
            return;
        }
        var offset = self.offsetOfLine(p.line) + Math.max(0, (p.column || 1) - 1);
        while (offset < text.length && /[ \t]/.test(text.charAt(offset))) {
            offset++;
        }
        var start = tokenStartAt(text, offset, self.api);
        if (start !== -1) {
            marks[start] = "err";
        }
    });
    this.marks = marks;
    this.gutterDirty = true;
    this.render();
};

function tokenStartAt(text, offset, api) {
    var tokens = tokenize(text, api);
    for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.type !== "space" && offset >= t.start && offset < t.start + t.text.length) {
            return t.start;
        }
    }
    return -1;
}

CodeEditor.prototype.problemAt = function (line) {
    for (var i = 0; i < this.problems.length; i++) {
        if (this.problems[i].line === line) {
            return this.problems[i];
        }
    }
    return null;
};

CodeEditor.prototype.caretPixel = function (offset) {
    var pos = this.lineColumn(offset);
    var lineText = this.input.value.substring(offset - pos.column + 1, offset).replace(/\t/g, editorIndent);
    return {
        top: pos.line * this.lineHeight - this.scroller.scrollTop + 4,
        left: this.gutter.offsetWidth + lineText.length * this.measure() - this.scroller.scrollLeft + 8
    };
};

CodeEditor.prototype.scrollToCaret = function (center) {
    var pos = this.lineColumn(this.input.selectionEnd);
    var top = (pos.line - 1) * this.lineHeight;
    var view = this.scroller.clientHeight;
    if (center) {
        this.scroller.scrollTop = Math.max(0, top - view / 2);
    } else if (top < this.scroller.scrollTop) {
        this.scroller.scrollTop = Math.max(0, top - this.lineHeight * 2);
    } else if (top + this.lineHeight * 2 > this.scroller.scrollTop + view) {
        this.scroller.scrollTop = top - view + this.lineHeight * 3;
    }
    var left = (pos.column - 1) * this.measure();
    if (left < this.scroller.scrollLeft) {
        this.scroller.scrollLeft = Math.max(0, left - 40);
    } else if (left + 40 > this.scroller.scrollLeft + this.scroller.clientWidth) {
        this.scroller.scrollLeft = left - this.scroller.clientWidth + 80;
    }
};

CodeEditor.prototype.goToLine = function (line) {
    var target = Math.max(1, Math.min(line, this.input.value.split("\n").length));
    var offset = this.offsetOfLine(target);
    this.input.focus();
    this.input.setSelectionRange(offset, offset);
    this.scrollToCaret(true);
    this.updateCursor();
};

CodeEditor.prototype.selectLine = function (line) {
    var start = this.offsetOfLine(line);
    var end = this.input.value.indexOf("\n", start);
    this.input.focus();
    this.input.setSelectionRange(start, end === -1 ? this.input.value.length : end + 1);
    this.updateCursor();
};

CodeEditor.prototype.lineBlock = function () {
    var text = this.input.value;
    var sel = this.selection();
    var start = text.lastIndexOf("\n", sel.start - 1) + 1;
    var endPos = sel.end > sel.start && text.charAt(sel.end - 1) === "\n" ? sel.end - 1 : sel.end;
    var end = text.indexOf("\n", endPos);
    if (end === -1) {
        end = text.length;
    }
    return { start: start, end: end, text: text.substring(start, end), sel: sel };
};

CodeEditor.prototype.rewriteLines = function (transform) {
    var block = this.lineBlock();
    var lines = block.text.split("\n");
    var result = transform(lines);
    var joined = result.lines.join("\n");
    if (joined === block.text) {
        return;
    }
    var firstShift = result.firstShift || 0;
    var selStart = Math.max(block.start, block.sel.start + firstShift);
    var selEnd = block.sel.start === block.sel.end ? selStart : block.sel.end + (joined.length - block.text.length);
    this.replaceRange(block.start, block.end, joined, selStart, Math.max(selStart, selEnd));
};

CodeEditor.prototype.indentLines = function (outdent) {
    this.rewriteLines(function (lines) {
        var firstShift = 0;
        var out = lines.map(function (line, index) {
            var next;
            if (outdent) {
                var remove = /^( {1,4}|\t)/.exec(line);
                next = remove ? line.substring(remove[0].length) : line;
            } else {
                next = line.length ? editorIndent + line : line;
            }
            if (index === 0) {
                firstShift = next.length - line.length;
            }
            return next;
        });
        return { lines: out, firstShift: firstShift };
    });
};

CodeEditor.prototype.toggleComment = function () {
    this.rewriteLines(function (lines) {
        var filled = lines.filter(function (line) {
            return line.trim().length > 0;
        });
        if (!filled.length) {
            return { lines: lines };
        }
        var commented = filled.every(function (line) {
            return line.trim().substr(0, 2) === "//";
        });
        var indent = Math.min.apply(null, filled.map(function (line) {
            return /^\s*/.exec(line)[0].length;
        }));
        var firstShift = 0;
        var out = lines.map(function (line, index) {
            var next = line;
            if (commented) {
                next = line.replace(/^(\s*)\/\/ ?/, "$1");
            } else if (line.trim().length) {
                next = line.substring(0, indent) + "// " + line.substring(indent);
            }
            if (index === 0) {
                firstShift = next.length - line.length;
            }
            return next;
        });
        return { lines: out, firstShift: firstShift };
    });
};

CodeEditor.prototype.moveLines = function (direction, copy) {
    var text = this.input.value;
    var block = this.lineBlock();
    var sel = block.sel;
    if (copy) {
        var insertAt = direction < 0 ? block.start : block.end;
        var added = direction < 0 ? block.text + "\n" : "\n" + block.text;
        var shift = direction < 0 ? 0 : block.text.length + 1;
        this.replaceRange(insertAt, insertAt, added, sel.start + shift, sel.end + shift);
        return;
    }
    if (direction < 0) {
        if (block.start === 0) {
            return;
        }
        var prevStart = text.lastIndexOf("\n", block.start - 2) + 1;
        var prev = text.substring(prevStart, block.start - 1);
        var moved = prev.length + 1;
        this.replaceRange(prevStart, block.end, block.text + "\n" + prev, sel.start - moved, sel.end - moved);
    } else {
        if (block.end >= text.length) {
            return;
        }
        var nextEnd = text.indexOf("\n", block.end + 1);
        if (nextEnd === -1) {
            nextEnd = text.length;
        }
        var next = text.substring(block.end + 1, nextEnd);
        this.replaceRange(block.start, nextEnd, next + "\n" + block.text, sel.start + next.length + 1, sel.end + next.length + 1);
    }
};

CodeEditor.prototype.deleteLines = function () {
    var text = this.input.value;
    var block = this.lineBlock();
    var start = block.start;
    var end = block.end < text.length ? block.end + 1 : block.end;
    if (end === text.length && start > 0 && block.end === text.length) {
        start--;
    }
    this.replaceRange(start, end, "", Math.min(start === block.start ? start : start + 1, text.length - (end - start)));
};

CodeEditor.prototype.handleEnter = function () {
    var text = this.input.value;
    var sel = this.selection();
    var lineStart = text.lastIndexOf("\n", sel.start - 1) + 1;
    var indent = /^[ \t]*/.exec(text.substring(lineStart, sel.start))[0];
    var before = text.substring(lineStart, sel.start).replace(/\s+$/, "").slice(-1);
    var after = text.charAt(sel.end);
    if (editorPairs[before] && editorClosers[editorPairs[before]]) {
        if (after === editorPairs[before]) {
            var middle = "\n" + indent + editorIndent;
            this.replaceRange(sel.start, sel.end, middle + "\n" + indent, sel.start + middle.length);
            return;
        }
        this.replaceRange(sel.start, sel.end, "\n" + indent + editorIndent);
        return;
    }
    this.replaceRange(sel.start, sel.end, "\n" + indent);
};

CodeEditor.prototype.handlePair = function (key) {
    var text = this.input.value;
    var sel = this.selection();
    var close = editorPairs[key];
    var prev = text.charAt(sel.start - 1);
    var next = text.charAt(sel.end);
    if (sel.start !== sel.end) {
        var inner = text.substring(sel.start, sel.end);
        this.replaceRange(sel.start, sel.end, key + inner + close, sel.start + 1, sel.end + 1);
        return true;
    }
    var isQuote = key === close;
    if (isQuote && next === key) {
        this.input.setSelectionRange(sel.start + 1, sel.start + 1);
        this.scheduleCursor();
        return true;
    }
    if (isQuote && (/[\w$\\]/.test(prev) || this.inStringOrComment(sel.start))) {
        return false;
    }
    if (next && !/[\s)\]};,]/.test(next)) {
        return false;
    }
    this.replaceRange(sel.start, sel.end, key + close, sel.start + 1);
    return true;
};

CodeEditor.prototype.inStringOrComment = function (offset) {
    var text = this.input.value;
    var lineStart = text.lastIndexOf("\n", offset - 1) + 1;
    var tokens = tokenize(text.substring(lineStart, offset), {});
    var last = tokens[tokens.length - 1];
    if (!last) {
        return false;
    }
    if (last.type === "comment") {
        return true;
    }
    return last.type === "string" && (last.text.length < 2 || last.text.charAt(last.text.length - 1) !== last.text.charAt(0));
};

CodeEditor.prototype.onKeyDown = function (event) {
    var key = event.key;
    var ctrl = event.ctrlKey || event.metaKey;
    var suggestOpen = !this.suggestBox.classList.contains("hidden");
    var sel = this.selection();
    var text = this.input.value;
    var handled = true;

    if (suggestOpen && !ctrl && !event.altKey) {
        if (key === "ArrowDown" || key === "ArrowUp") {
            this.moveSuggest(key === "ArrowDown" ? 1 : -1);
            event.preventDefault();
            return;
        }
        if (key === "Enter" || key === "Tab") {
            this.acceptSuggestion();
            event.preventDefault();
            return;
        }
        if (key === "Escape") {
            this.closeSuggest();
            event.preventDefault();
            event.stopPropagation();
            return;
        }
    }

    if (ctrl && !event.altKey && (key === "/" || event.code === "Slash")) {
        this.toggleComment();
    } else if (ctrl && key === " ") {
        this.openSuggest(true);
    } else if (ctrl && event.shiftKey && (key === "K" || key === "k")) {
        this.deleteLines();
    } else if (ctrl && !event.shiftKey && (key === "l" || key === "L")) {
        this.selectLine(this.lineColumn(sel.end).line);
    } else if (ctrl && key === "]") {
        this.indentLines(false);
    } else if (ctrl && key === "[") {
        this.indentLines(true);
    } else if (event.altKey && !ctrl && (key === "ArrowUp" || key === "ArrowDown")) {
        this.moveLines(key === "ArrowUp" ? -1 : 1, event.shiftKey);
    } else if (key === "Tab" && !ctrl && !event.altKey) {
        if (event.shiftKey || text.substring(sel.start, sel.end).indexOf("\n") !== -1) {
            this.indentLines(event.shiftKey);
        } else {
            this.insert(editorIndent);
        }
    } else if (key === "Enter" && !ctrl && !event.altKey && !event.shiftKey) {
        this.handleEnter();
    } else if (key === "Backspace" && !ctrl && sel.start === sel.end && editorPairs[text.charAt(sel.start - 1)] === text.charAt(sel.start) && text.charAt(sel.start)) {
        this.replaceRange(sel.start - 1, sel.start + 1, "");
    } else if (editorClosers[key] && !ctrl && sel.start === sel.end && text.charAt(sel.start) === key) {
        this.input.setSelectionRange(sel.start + 1, sel.start + 1);
        this.scheduleCursor();
    } else if (editorPairs[key] && !ctrl && !event.altKey) {
        handled = this.handlePair(key);
    } else if (key === "Home" && !ctrl) {
        var lineStart = text.lastIndexOf("\n", sel.end - 1) + 1;
        var firstChar = lineStart + /^[ \t]*/.exec(text.substring(lineStart))[0].length;
        var target = sel.end === firstChar ? lineStart : firstChar;
        this.input.setSelectionRange(event.shiftKey ? Math.min(sel.start, target) : target, event.shiftKey ? Math.max(sel.start, target) : target);
        this.scheduleCursor();
    } else if (key === "Escape" && !this.hint.classList.contains("hidden")) {
        this.hint.classList.add("hidden");
    } else {
        handled = false;
    }

    if (handled) {
        event.preventDefault();
        if (key !== "Escape") {
            this.scrollToCaret(false);
        }
    }
};

CodeEditor.prototype.wordBeforeCaret = function () {
    var text = this.input.value;
    var end = this.input.selectionStart;
    var start = end;
    while (start > 0 && /[\w$]/.test(text.charAt(start - 1))) {
        start--;
    }
    return { start: start, end: end, word: text.substring(start, end), afterDot: text.charAt(start - 1) === "." };
};

CodeEditor.prototype.documentWords = function (skip) {
    var seen = {};
    var words = [];
    var found = this.input.value.match(/[A-Za-z_$][\w$]{2,}/g) || [];
    for (var i = 0; i < found.length; i++) {
        var w = found[i];
        if (!seen[w] && w !== skip && !this.api[w]) {
            seen[w] = true;
            words.push(w);
        }
    }
    return words;
};

function suggestScore(name, word) {
    var lower = name.toLowerCase();
    var needle = word.toLowerCase();
    if (name.indexOf(word) === 0) {
        return 0;
    }
    if (lower.indexOf(needle) === 0) {
        return 1;
    }
    if (lower.indexOf(needle) !== -1) {
        return 2;
    }
    var at = 0;
    for (var i = 0; i < needle.length; i++) {
        at = lower.indexOf(needle.charAt(i), at);
        if (at === -1) {
            return -1;
        }
        at++;
    }
    return 3;
}

function buildSuggestions(word, catalog, extraWords, force) {
    if (!word && !force) {
        return [];
    }
    var items = [];
    catalog.forEach(function (fn) {
        items.push({ label: fn.name, kind: "api", detail: fn.name + "(" + fn.args + ")", info: fn.info, area: fn.area });
    });
    editorKeywords.forEach(function (kw) {
        items.push({ label: kw, kind: "keyword", detail: "keyword", info: "" });
    });
    (extraWords || []).forEach(function (w) {
        items.push({ label: w, kind: "word", detail: "word in this file", info: "" });
    });
    var ranked = [];
    var seen = {};
    items.forEach(function (item) {
        if (seen[item.label] || item.label === word) {
            return;
        }
        var score = word ? suggestScore(item.label, word) : 0;
        if (score >= 0) {
            seen[item.label] = true;
            ranked.push({ item: item, score: score });
        }
    });
    ranked.sort(function (a, b) {
        return a.score - b.score || (a.item.kind === "api" ? 0 : 1) - (b.item.kind === "api" ? 0 : 1) || a.item.label.length - b.item.label.length || (a.item.label < b.item.label ? -1 : 1);
    });
    return ranked.slice(0, 40).map(function (r) {
        return r.item;
    });
}

CodeEditor.prototype.openSuggest = function (force) {
    var info = this.wordBeforeCaret();
    if (info.afterDot || this.inStringOrComment(info.start) || (!force && !info.word)) {
        this.closeSuggest();
        return;
    }
    this.suggestions = buildSuggestions(info.word, this.catalog, this.documentWords(info.word), force);
    if (!this.suggestions.length) {
        this.closeSuggest();
        return;
    }
    this.suggestRange = info;
    this.suggestIndex = 0;
    this.renderSuggest();
    var pixel = this.caretPixel(info.start);
    this.suggestBox.style.top = pixel.top + "px";
    this.suggestBox.style.left = Math.max(0, pixel.left - 20) + "px";
    this.suggestBox.classList.remove("hidden");
    if (pixel.top + this.suggestBox.offsetHeight > this.root.clientHeight && pixel.top - this.lineHeight > this.suggestBox.offsetHeight) {
        this.suggestBox.style.top = pixel.top - this.lineHeight - this.suggestBox.offsetHeight - 4 + "px";
    }
};

CodeEditor.prototype.renderSuggest = function () {
    var self = this;
    var word = this.suggestRange ? this.suggestRange.word : "";
    this.suggestList.innerHTML = this.suggestions.map(function (item, index) {
        var label = escapeHtml(item.label);
        if (word && item.label.toLowerCase().indexOf(word.toLowerCase()) === 0) {
            label = "<b>" + escapeHtml(item.label.substring(0, word.length)) + "</b>" + escapeHtml(item.label.substring(word.length));
        }
        return "<div class=\"ed-suggest-row" + (index === self.suggestIndex ? " selected" : "") + "\" data-index=\"" + index + "\">" +
            "<i class=\"sg-icon sg-" + item.kind + "\"></i><span class=\"sg-label\">" + label + "</span>" +
            "<span class=\"sg-area\">" + escapeHtml(item.area || item.detail) + "</span></div>";
    }).join("");
    var current = this.suggestions[this.suggestIndex];
    this.suggestDoc.innerHTML = current && current.kind === "api" ? "<code>" + highlightHtml(current.detail, this.api) + "</code><p>" + escapeHtml(current.info) + "</p>" : "";
    this.suggestDoc.classList.toggle("hidden", !this.suggestDoc.innerHTML);
    var row = this.suggestList.children[this.suggestIndex];
    if (row && row.scrollIntoView) {
        row.scrollIntoView({ block: "nearest" });
    }
};

CodeEditor.prototype.moveSuggest = function (step) {
    var count = this.suggestions.length;
    this.suggestIndex = (this.suggestIndex + step + count) % count;
    this.renderSuggest();
};

CodeEditor.prototype.closeSuggest = function () {
    this.suggestBox.classList.add("hidden");
    this.suggestions = [];
};

CodeEditor.prototype.acceptSuggestion = function () {
    var item = this.suggestions[this.suggestIndex];
    var range = this.suggestRange;
    this.closeSuggest();
    if (!item || !range) {
        return;
    }
    var text = this.input.value;
    var end = range.end;
    while (end < text.length && /[\w$]/.test(text.charAt(end))) {
        end++;
    }
    if (item.kind === "api" && text.charAt(end) !== "(") {
        this.replaceRange(range.start, end, item.label + "()", range.start + item.label.length + 1);
    } else {
        this.replaceRange(range.start, end, item.label);
    }
    this.updateHint();
};

function enclosingCall(text, caret) {
    var depth = 0;
    var commas = 0;
    var floor = Math.max(0, caret - 3000);
    var quote = "";
    for (var i = caret - 1; i >= floor; i--) {
        var ch = text.charAt(i);
        if (quote) {
            if (ch === quote && text.charAt(i - 1) !== "\\") {
                quote = "";
            }
            continue;
        }
        if (ch === "\"" || ch === "'" || ch === "`") {
            quote = ch;
        } else if (ch === ")" || ch === "]" || ch === "}") {
            depth++;
        } else if (ch === "[" || ch === "{") {
            if (depth === 0) {
                return null;
            }
            depth--;
        } else if (ch === "(") {
            if (depth === 0) {
                var match = /([A-Za-z_$][\w$]*)\s*$/.exec(text.substring(Math.max(0, i - 80), i));
                return match ? { name: match[1], argument: commas } : null;
            }
            depth--;
        } else if (ch === "," && depth === 0) {
            commas++;
        } else if (ch === ";" && depth === 0) {
            return null;
        }
    }
    return null;
}

CodeEditor.prototype.updateHint = function () {
    var sel = this.selection();
    var call = sel.start === sel.end && document.activeElement === this.input ? enclosingCall(this.input.value, sel.start) : null;
    var fn = call && this.catalogByName[call.name];
    if (!fn || !this.suggestBox.classList.contains("hidden")) {
        this.hint.classList.add("hidden");
        return;
    }
    var args = fn.args ? fn.args.split(/\s*,\s*/) : [];
    var parts = args.map(function (arg, index) {
        return index === call.argument ? "<b>" + escapeHtml(arg) + "</b>" : escapeHtml(arg);
    });
    this.hint.innerHTML = "<div class=\"hint-sig\"><span class=\"tk-api\">" + fn.name + "</span>(" + parts.join(", ") + ")</div><div class=\"hint-info\">" + escapeHtml(fn.info) + "</div>";
    var pixel = this.caretPixel(sel.start);
    var above = pixel.top - this.lineHeight - 8;
    this.hint.style.left = Math.max(4, pixel.left - 30) + "px";
    this.hint.classList.remove("hidden");
    this.hint.style.top = (above - this.hint.offsetHeight > 0 ? above - this.hint.offsetHeight : pixel.top + 4) + "px";
};

function searchText(text, query, opts) {
    var found = [];
    if (!query) {
        return found;
    }
    var pattern;
    try {
        var source = opts.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (opts.wholeWord) {
            source = "\\b" + source + "\\b";
        }
        pattern = new RegExp(source, opts.caseSensitive ? "g" : "gi");
    } catch (error) {
        return null;
    }
    var match;
    while ((match = pattern.exec(text)) && found.length < 5000) {
        if (match[0] === "") {
            pattern.lastIndex++;
            continue;
        }
        found.push({ start: match.index, end: match.index + match[0].length });
    }
    return found;
}

CodeEditor.prototype.setSearch = function (query, opts) {
    this.searchQuery = query;
    this.searchOptions = opts || {};
    var found = searchText(this.input.value, query, this.searchOptions);
    this.searchInvalid = found === null;
    this.matches = found || [];
    this.matchIndex = -1;
    var caret = this.input.selectionStart;
    for (var i = 0; i < this.matches.length; i++) {
        if (this.matches[i].start >= caret) {
            this.matchIndex = i;
            break;
        }
    }
    if (this.matchIndex === -1 && this.matches.length) {
        this.matchIndex = 0;
    }
    this.renderFind();
    return this.matches.length;
};

CodeEditor.prototype.clearSearch = function () {
    this.searchQuery = "";
    this.matches = [];
    this.matchIndex = -1;
    this.renderFind();
};

CodeEditor.prototype.refreshSearch = function () {
    if (this.searchQuery) {
        var found = searchText(this.input.value, this.searchQuery, this.searchOptions);
        this.matches = found || [];
        if (this.matchIndex >= this.matches.length) {
            this.matchIndex = this.matches.length - 1;
        }
    }
};

CodeEditor.prototype.renderFind = function () {
    if (!this.findLayer) {
        return;
    }
    this.refreshSearch();
    if (!this.matches.length) {
        this.findLayer.innerHTML = "";
        return;
    }
    var text = this.input.value;
    var html = [];
    var at = 0;
    var self = this;
    this.matches.forEach(function (m, index) {
        html.push(escapeHtml(text.substring(at, m.start)));
        html.push("<mark" + (index === self.matchIndex ? " class=\"current\"" : "") + ">" + escapeHtml(text.substring(m.start, m.end)) + "</mark>");
        at = m.end;
    });
    html.push(escapeHtml(text.substring(at)));
    this.findLayer.innerHTML = html.join("") + "\n";
};

CodeEditor.prototype.findStep = function (step) {
    if (!this.matches.length) {
        return 0;
    }
    this.matchIndex = (this.matchIndex + step + this.matches.length) % this.matches.length;
    var m = this.matches[this.matchIndex];
    this.input.setSelectionRange(m.start, m.end);
    this.scrollToCaret(true);
    this.renderFind();
    this.updateCursor();
    return this.matchIndex + 1;
};

CodeEditor.prototype.replaceCurrent = function (replacement) {
    var m = this.matches[this.matchIndex];
    if (!m) {
        return false;
    }
    var sel = this.selection();
    if (sel.start !== m.start || sel.end !== m.end) {
        this.findStep(0);
        return false;
    }
    var value = this.expandReplacement(this.input.value.substring(m.start, m.end), replacement);
    this.replaceRange(m.start, m.end, value, m.start + value.length);
    this.refreshSearch();
    this.setSearch(this.searchQuery, this.searchOptions);
    this.findStep(0);
    return true;
};

CodeEditor.prototype.expandReplacement = function (found, replacement) {
    if (!this.searchOptions.regex) {
        return replacement;
    }
    return found.replace(new RegExp(this.searchQuery, this.searchOptions.caseSensitive ? "" : "i"), replacement);
};

CodeEditor.prototype.replaceAll = function (replacement) {
    if (!this.matches.length) {
        return 0;
    }
    var text = this.input.value;
    var out = [];
    var at = 0;
    var self = this;
    this.matches.forEach(function (m) {
        out.push(text.substring(at, m.start));
        out.push(self.expandReplacement(text.substring(m.start, m.end), replacement));
        at = m.end;
    });
    out.push(text.substring(at));
    var count = this.matches.length;
    var caret = this.input.selectionStart;
    this.replaceRange(0, text.length, out.join(""), Math.min(caret, out.join("").length));
    this.setSearch(this.searchQuery, this.searchOptions);
    return count;
};
