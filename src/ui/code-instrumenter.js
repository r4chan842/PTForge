var instrumentPeek = "function (__e) { return eval(__e); }";

function patternNames(node, into) {
    if (!node) {
        return into;
    }
    switch (node.type) {
        case "Identifier":
            into.push(node.name);
            break;
        case "ObjectPattern":
            node.properties.forEach(function (p) {
                patternNames(p.type === "RestElement" ? p.argument : p.value, into);
            });
            break;
        case "ArrayPattern":
            node.elements.forEach(function (e) {
                patternNames(e, into);
            });
            break;
        case "AssignmentPattern":
            patternNames(node.left, into);
            break;
        case "RestElement":
            patternNames(node.argument, into);
            break;
    }
    return into;
}

function isFunctionNode(node) {
    return node && (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression");
}

function childNodes(node) {
    var list = [];
    for (var key in node) {
        if (key === "loc" || key === "start" || key === "end" || key === "type" || key === "range") {
            continue;
        }
        var value = node[key];
        if (value && typeof value.type === "string") {
            list.push(value);
        } else if (Array.isArray(value)) {
            value.forEach(function (item) {
                if (item && typeof item.type === "string") {
                    list.push(item);
                }
            });
        }
    }
    return list;
}

function hoistedNames(body) {
    var names = [];
    function visit(node) {
        if (!node || typeof node.type !== "string") {
            return;
        }
        if (node.type === "VariableDeclaration" && node.kind === "var") {
            node.declarations.forEach(function (d) {
                patternNames(d.id, names);
            });
        }
        if (node.type === "FunctionDeclaration") {
            if (node.id) {
                names.push(node.id.name);
            }
            return;
        }
        if (isFunctionNode(node) || node.type === "ClassExpression" || node.type === "ClassDeclaration") {
            return;
        }
        childNodes(node).forEach(visit);
    }
    toNodeList(body).forEach(visit);
    return names;
}

function toNodeList(value) {
    return Array.isArray(value) ? value : [value];
}

function lexicalNames(statements) {
    var names = [];
    statements.forEach(function (s) {
        if (s.type === "VariableDeclaration" && s.kind !== "var") {
            s.declarations.forEach(function (d) {
                patternNames(d.id, names);
            });
        } else if (s.type === "ClassDeclaration" && s.id) {
            names.push(s.id.name);
        }
    });
    return names;
}

function unique(list) {
    var seen = {};
    return list.filter(function (name) {
        if (seen[name] || name === "__dbg" || name === "__e") {
            return false;
        }
        seen[name] = true;
        return true;
    });
}

function functionLabel(node, parent) {
    if (node.id && node.id.name) {
        return node.id.name;
    }
    if (parent) {
        if (parent.type === "VariableDeclarator" && parent.id.type === "Identifier") {
            return parent.id.name;
        }
        if (parent.type === "AssignmentExpression") {
            var left = parent.left;
            if (left.type === "Identifier") {
                return left.name;
            }
            if (left.type === "MemberExpression" && !left.computed && left.property.type === "Identifier") {
                return left.property.name;
            }
        }
        if ((parent.type === "Property" || parent.type === "MethodDefinition") && parent.key) {
            return parent.key.name || String(parent.key.value);
        }
    }
    return "(anonymous)";
}

function Instrumenter(source) {
    this.source = source;
    this.edits = [];
    this.steps = [];
    this.functions = [];
    this.scopes = [];
}

Instrumenter.prototype.edit = function (pos, text, closer, depth) {
    this.edits.push({ pos: pos, text: text, closer: closer, depth: depth, order: this.edits.length });
};

Instrumenter.prototype.visibleScopes = function () {
    var groups = [];
    var current = null;
    for (var i = this.scopes.length - 1; i >= 0; i--) {
        var scope = this.scopes[i];
        if (!current) {
            current = { name: scope.kind === "script" ? "Script" : "Local", names: [] };
            groups.push(current);
        }
        current.names = current.names.concat(scope.names);
        if (scope.kind === "function" && i > 0) {
            var outer = this.scopes.slice(0, i).some(function (s) {
                return s.kind === "function";
            });
            current = { name: outer ? "Closure" : "Script", names: [] };
            groups.push(current);
        }
    }
    var merged = [];
    groups.forEach(function (g) {
        var last = merged[merged.length - 1];
        if (last && last.name === g.name && g.name !== "Local") {
            last.names = last.names.concat(g.names);
        } else {
            merged.push(g);
        }
    });
    var seen = {};
    return merged.map(function (g) {
        var names = unique(g.names).filter(function (name) {
            if (seen[name]) {
                return false;
            }
            seen[name] = true;
            return true;
        }).sort();
        return { name: g.name, names: names };
    }).filter(function (g) {
        return g.names.length;
    });
};

Instrumenter.prototype.addStep = function (node, depth) {
    var id = this.steps.length;
    this.steps.push({ line: node.loc.start.line, col: node.loc.start.column + 1, scopes: this.visibleScopes() });
    this.edit(node.start, "__dbg.s(" + id + ", " + instrumentPeek + "); ", false, depth);
    return id;
};

Instrumenter.prototype.statementList = function (statements, depth) {
    var self = this;
    statements.forEach(function (s) {
        if (s.type !== "FunctionDeclaration" && s.type !== "EmptyStatement" && !s.directive) {
            self.addStep(s, depth);
        }
        self.visit(s, null, depth);
    });
};

Instrumenter.prototype.wrapBody = function (body, parent, depth) {
    if (!body) {
        return;
    }
    if (body.type === "BlockStatement") {
        this.visit(body, parent, depth);
        return;
    }
    this.edit(body.start, "{ ", false, depth);
    if (body.type !== "EmptyStatement") {
        this.addStep(body, depth + 1);
    }
    this.visit(body, parent, depth + 1);
    this.edit(body.end, " }", true, depth);
};

Instrumenter.prototype.withScope = function (kind, names, work) {
    this.scopes.push({ kind: kind, names: names });
    work();
    this.scopes.pop();
};

Instrumenter.prototype.visitFunction = function (node, parent, depth) {
    var self = this;
    var fid = this.functions.length;
    var params = [];
    node.params.forEach(function (p) {
        patternNames(p, params);
    });
    this.functions.push({ name: functionLabel(node, parent), line: node.loc.start.line });
    var body = node.body;
    if (body.type !== "BlockStatement") {
        this.withScope("function", params, function () {
            self.edit(body.start, "{ __dbg.e(" + fid + "); try { ", false, depth);
            self.addStep(body, depth + 1);
            self.edit(body.start, "return (", false, depth + 2);
            self.visit(body, node, depth + 2);
            self.edit(body.end, "); } finally { __dbg.x(); } }", true, depth);
        });
        return;
    }
    var names = params.concat(hoistedNames(body.body), lexicalNames(body.body));
    this.withScope("function", names, function () {
        var statements = body.body;
        var first = 0;
        while (first < statements.length && statements[first].directive) {
            first++;
        }
        var open = first > 0 ? statements[first - 1].end : body.start + 1;
        self.edit(open, " __dbg.e(" + fid + "); try {", false, depth);
        self.statementList(statements.slice(first), depth + 1);
        self.edit(body.end - 1, "} finally { __dbg.x(); } ", true, depth);
    });
};

Instrumenter.prototype.visit = function (node, parent, depth) {
    var self = this;
    if (!node || typeof node.type !== "string") {
        return;
    }
    if (isFunctionNode(node)) {
        this.visitFunction(node, parent, depth);
        return;
    }
    switch (node.type) {
        case "Program":
            this.withScope("script", hoistedNames(node.body).concat(lexicalNames(node.body)), function () {
                self.statementList(node.body, depth);
            });
            return;
        case "BlockStatement":
            this.withScope("block", lexicalNames(node.body), function () {
                self.statementList(node.body, depth + 1);
            });
            return;
        case "StaticBlock":
            return;
        case "SwitchStatement":
            this.visit(node.discriminant, node, depth);
            this.withScope("block", lexicalNames([].concat.apply([], node.cases.map(function (c) { return c.consequent; }))), function () {
                node.cases.forEach(function (c) {
                    if (c.test) {
                        self.visit(c.test, c, depth);
                    }
                    self.statementList(c.consequent, depth + 1);
                });
            });
            return;
        case "IfStatement":
            this.visit(node.test, node, depth);
            this.wrapBody(node.consequent, node, depth);
            this.wrapBody(node.alternate, node, depth);
            return;
        case "ForStatement":
        case "ForInStatement":
        case "ForOfStatement":
            var head = node.init || node.left;
            var loopNames = head && head.type === "VariableDeclaration" && head.kind !== "var" ? lexicalNames([head]) : [];
            this.withScope("block", loopNames, function () {
                [node.init, node.test, node.update, node.left, node.right].forEach(function (part) {
                    self.visit(part, node, depth);
                });
                self.wrapBody(node.body, node, depth);
            });
            return;
        case "WhileStatement":
        case "DoWhileStatement":
        case "WithStatement":
            this.visit(node.test || node.object, node, depth);
            this.wrapBody(node.body, node, depth);
            return;
        case "LabeledStatement":
            this.visit(node.body, node, depth);
            return;
        case "CatchClause":
            this.withScope("block", patternNames(node.param, []), function () {
                self.visit(node.body, node, depth);
            });
            return;
    }
    childNodes(node).forEach(function (child) {
        self.visit(child, node, depth);
    });
};

Instrumenter.prototype.output = function () {
    var edits = this.edits.slice().sort(function (a, b) {
        if (a.pos !== b.pos) {
            return a.pos - b.pos;
        }
        if (a.closer !== b.closer) {
            return a.closer ? -1 : 1;
        }
        if (a.closer) {
            return b.depth - a.depth || b.order - a.order;
        }
        return a.depth - b.depth || a.order - b.order;
    });
    var parts = [];
    var cursor = 0;
    edits.forEach(function (e) {
        parts.push(this.source.substring(cursor, e.pos), e.text);
        cursor = e.pos;
    }, this);
    parts.push(this.source.substring(cursor));
    return parts.join("");
};

function instrumentScript(source) {
    var parser = typeof acorn !== "undefined" ? acorn : null;
    if (!parser) {
        throw new Error("The JavaScript parser is not loaded");
    }
    var ast = parser.parse(source, { ecmaVersion: "latest", sourceType: "script", locations: true, allowReturnOutsideFunction: true, allowHashBang: true });
    var tool = new Instrumenter(source);
    tool.visit(ast, null, 0);
    return { code: tool.output(), steps: tool.steps, functions: tool.functions };
}

function stepsByLine(steps) {
    var map = {};
    steps.forEach(function (step, id) {
        (map[step.line] = map[step.line] || []).push(id);
    });
    return map;
}

function resolveBreakpointLine(steps, line) {
    var best = -1;
    for (var i = 0; i < steps.length; i++) {
        var candidate = steps[i].line;
        if (candidate >= line && (best === -1 || candidate < best)) {
            best = candidate;
        }
    }
    return best;
}

function breakpointConfig(steps, breakpoints) {
    var byLine = stepsByLine(steps);
    var config = {};
    var resolved = [];
    breakpoints.forEach(function (bp) {
        if (bp.enabled === false) {
            return;
        }
        var line = resolveBreakpointLine(steps, bp.line);
        if (line === -1) {
            resolved.push({ line: bp.line, verified: false });
            return;
        }
        var id = byLine[line][0];
        config[id] = { condition: bp.condition || "", hit: bp.hit || "", log: bp.log || "" };
        resolved.push({ line: bp.line, actual: line, verified: true });
    });
    return { map: config, resolved: resolved };
}

function traceStep(trace, index, mode) {
    var last = trace.length - 1;
    if (last < 0) {
        return -1;
    }
    var here = trace[Math.max(0, Math.min(index, last))];
    var i;
    var stop = function (entry) {
        return entry.reason === "breakpoint" || entry.reason === "exception";
    };
    switch (mode) {
        case "into":
            return index < last ? index + 1 : -1;
        case "back":
            return Math.max(0, index - 1);
        case "reverse":
            for (i = index - 1; i >= 0; i--) {
                if (stop(trace[i])) {
                    return i;
                }
            }
            return 0;
        case "over":
            for (i = index + 1; i <= last; i++) {
                if (trace[i].depth <= here.depth || stop(trace[i])) {
                    return i;
                }
            }
            return -1;
        case "out":
            for (i = index + 1; i <= last; i++) {
                if (trace[i].depth < here.depth || stop(trace[i])) {
                    return i;
                }
            }
            return -1;
        default:
            for (i = index + 1; i <= last; i++) {
                if (stop(trace[i])) {
                    return i;
                }
            }
            return -1;
    }
}

function firstStop(trace, stopOnEntry) {
    if (!trace.length) {
        return -1;
    }
    if (stopOnEntry) {
        return 0;
    }
    for (var i = 0; i < trace.length; i++) {
        if (trace[i].reason === "breakpoint" || trace[i].reason === "exception") {
            return i;
        }
    }
    return -1;
}

function callStackOf(entry, steps, functions) {
    var frames = [];
    var line = steps[entry.id] ? steps[entry.id].line : 0;
    for (var i = entry.stack.length - 1; i >= 0; i--) {
        var fn = functions[entry.stack[i][0]] || { name: "(anonymous)" };
        frames.push({ name: fn.name, line: i === entry.stack.length - 1 ? line : entry.stack[i][1] });
    }
    frames.push({ name: "(script)", line: entry.stack.length ? entry.top : line });
    return frames;
}

