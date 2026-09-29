var knownGlobals = toSet("JSON Math Object Array String Number Boolean Date RegExp Error TypeError SyntaxError RangeError Promise Map Set Symbol Function parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent encodeURI decodeURI setTimeout clearTimeout setInterval clearInterval console ipc");

function compileError(text) {
    try {
        new Function(text);
        return null;
    } catch (error) {
        return error;
    }
}

function lineAndColumn(text, offset) {
    var before = text.substring(0, offset).split("\n");
    return { line: before.length, column: before[before.length - 1].length + 1 };
}

function failsEarly(text) {
    var error = compileError(text);
    if (!error) {
        return null;
    }
    var probe = compileError(text + "\n@");
    return probe && probe.message === error.message ? error : null;
}

function lastFilledLine(lines) {
    var last = lines.length;
    while (last > 1 && !lines[last - 1].trim()) {
        last--;
    }
    return last;
}

function unclosedMessage(token) {
    var body = token.text;
    if (token.type === "string" && (body.length < 2 || body.charAt(body.length - 1) !== body.charAt(0) || /\\$/.test(body.slice(0, -1)) && !/\\\\$/.test(body.slice(0, -1)))) {
        return "Unterminated string";
    }
    if (token.type === "comment" && body.substr(0, 2) === "/*" && (body.length < 4 || body.substr(body.length - 2) !== "*/")) {
        return "Comment is never closed";
    }
    return "";
}

function bracketProblems(text) {
    var stack = [];
    var pairs = { ")": "(", "]": "[", "}": "{" };
    var problems = [];
    tokenize(text, {}).forEach(function (t) {
        if (problems.length) {
            return;
        }
        var unclosed = unclosedMessage(t);
        if (unclosed) {
            var spot = lineAndColumn(text, t.start);
            problems.push({ severity: "error", line: spot.line, column: spot.column, message: unclosed, source: "syntax" });
            return;
        }
        if (t.type !== "bracket") {
            return;
        }
        if (!pairs[t.text]) {
            stack.push(t);
            return;
        }
        var open = stack.pop();
        if (!open || open.text !== pairs[t.text]) {
            var where = lineAndColumn(text, t.start);
            problems.push({ severity: "error", line: where.line, column: where.column, message: open ? "'" + t.text + "' does not match '" + open.text + "' on line " + lineAndColumn(text, open.start).line : "Unexpected '" + t.text + "'", source: "syntax" });
        }
    });
    if (!problems.length && stack.length) {
        var open = stack[stack.length - 1];
        var at = lineAndColumn(text, open.start);
        problems.push({ severity: "error", line: at.line, column: at.column, message: "'" + open.text + "' is never closed", source: "syntax" });
    }
    return problems;
}

function syntaxProblems(text) {
    var error = compileError(text);
    if (!error) {
        return [];
    }
    var brackets = bracketProblems(text);
    if (brackets.length) {
        return brackets;
    }
    var lines = text.split("\n");
    if (!failsEarly(text)) {
        return [{ severity: "error", line: lastFilledLine(lines), column: 1, message: "Unexpected end of script, a bracket, quote or comment is not closed", source: "syntax" }];
    }
    var line = lines.length;
    if (lines.length <= 4000) {
        for (var n = 1; n <= lines.length; n++) {
            var early = failsEarly(lines.slice(0, n).join("\n"));
            if (early && early.message === error.message) {
                line = n;
                break;
            }
        }
    }
    return [{ severity: "error", line: line, column: 1, message: error.message, source: "syntax" }];
}

function editDistance(a, b) {
    var row = [];
    for (var j = 0; j <= b.length; j++) {
        row.push(j);
    }
    for (var i = 1; i <= a.length; i++) {
        var diagonal = row[0];
        row[0] = i;
        for (var k = 1; k <= b.length; k++) {
            var saved = row[k];
            var cost = a.charAt(i - 1).toLowerCase() === b.charAt(k - 1).toLowerCase() ? 0 : 1;
            row[k] = Math.min(row[k] + 1, row[k - 1] + 1, diagonal + cost);
            diagonal = saved;
        }
    }
    return row[b.length];
}

function closestName(word, names) {
    var limit = Math.max(1, Math.floor(word.length / 4));
    var best = null;
    var bestScore = limit + 1;
    names.forEach(function (name) {
        if (Math.abs(name.length - word.length) > limit) {
            return;
        }
        var score = editDistance(word, name);
        if (score < bestScore) {
            best = name;
            bestScore = score;
        }
    });
    return best;
}

function significant(tokens) {
    return tokens.filter(function (t) {
        return t.type !== "space" && t.type !== "comment";
    });
}

function declaredNames(tokens) {
    var declared = {};
    var list = significant(tokens);
    for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (t.text === "function" || t.text === "var" || t.text === "let" || t.text === "const" || t.text === "catch") {
            var j = i + 1;
            if (list[j] && list[j].text === "(") {
                j++;
            }
            if (list[j] && /^[A-Za-z_$]/.test(list[j].text)) {
                declared[list[j].text] = true;
            }
        }
        if (t.text === "function") {
            var p = i + 1;
            while (p < list.length && list[p].text !== "(") {
                p++;
            }
            for (p = p + 1; p < list.length && list[p].text !== ")"; p++) {
                if (/^[A-Za-z_$]/.test(list[p].text)) {
                    declared[list[p].text] = true;
                }
            }
        }
        if (/^[A-Za-z_$]/.test(t.text) && list[i + 1] && list[i + 1].text === "=" && list[i - 1] && list[i - 1].text !== ".") {
            declared[t.text] = true;
        }
    }
    return declared;
}

function unknownCalls(text, apiNames) {
    var api = namesToSet(apiNames);
    var tokens = tokenize(text, api);
    var declared = declaredNames(tokens);
    var names = Object.keys(api);
    var problems = [];
    tokens.forEach(function (t) {
        if (t.type !== "function" || declared[t.text] || knownGlobals[t.text]) {
            return;
        }
        var where = lineAndColumn(text, t.start);
        var guess = closestName(t.text, names);
        problems.push({
            severity: "warning",
            line: where.line,
            column: where.column,
            offset: t.start,
            length: t.text.length,
            message: "Unknown function '" + t.text + "'" + (guess ? ". Did you mean '" + guess + "'?" : ""),
            suggestion: guess || "",
            source: "ptforge"
        });
    });
    return problems;
}

function findProblems(text, apiNames) {
    var syntax = syntaxProblems(text);
    return syntax.concat(unknownCalls(text, apiNames)).sort(function (a, b) {
        return a.line - b.line || a.column - b.column;
    });
}
