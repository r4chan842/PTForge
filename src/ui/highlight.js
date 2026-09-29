var controlKeywords = toSet("if else for while do switch case break continue return throw try catch finally default yield await import export from");
var storageKeywords = toSet("var let const function new typeof instanceof in of delete void this class extends super async static get set");
var constantWords = toSet("true false null undefined NaN Infinity");
var builtinTypes = toSet("JSON Math Object Array String Number Boolean Date RegExp Error TypeError SyntaxError RangeError Promise Map Set Symbol Function");
var builtinFunctions = toSet("parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent encodeURI decodeURI setTimeout clearTimeout setInterval clearInterval alert require");
var builtinObjects = toSet("console ipc window document arguments");
var regexAllowedAfter = toSet("( , = : [ ! & | ? { } ; + - * % < > ~ ^ return typeof case do else in of instanceof new delete void throw");
var bracketOpen = "([{";
var bracketClose = ")]}";

function toSet(words) {
    var set = {};
    words.split(" ").forEach(function (word) {
        set[word] = true;
    });
    return set;
}

function namesToSet(list) {
    var set = {};
    (list || []).forEach(function (item) {
        set[typeof item === "string" ? item : item.name] = true;
    });
    return set;
}

function isIdentStart(ch) {
    return /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch) {
    return /[\w$]/.test(ch);
}

function readUntilLineEnd(text, start) {
    var end = text.indexOf("\n", start);
    return end === -1 ? text.length : end;
}

function readQuoted(text, start) {
    var quote = text.charAt(start);
    var i = start + 1;
    while (i < text.length) {
        var ch = text.charAt(i);
        if (ch === "\\") {
            i += 2;
            continue;
        }
        if (ch === quote) {
            return i + 1;
        }
        if (ch === "\n" && quote !== "`") {
            return i;
        }
        i++;
    }
    return text.length;
}

function readRegex(text, start) {
    var i = start + 1;
    var inClass = false;
    while (i < text.length) {
        var ch = text.charAt(i);
        if (ch === "\n") {
            return -1;
        }
        if (ch === "\\") {
            i += 2;
            continue;
        }
        if (ch === "[") {
            inClass = true;
        } else if (ch === "]") {
            inClass = false;
        } else if (ch === "/" && !inClass) {
            i++;
            while (i < text.length && /[gimsuy]/.test(text.charAt(i))) {
                i++;
            }
            return i;
        }
        i++;
    }
    return -1;
}

function nextNonSpace(text, start) {
    var i = start;
    while (i < text.length && /\s/.test(text.charAt(i))) {
        i++;
    }
    return text.charAt(i);
}

function classifyWord(word, previous, following, api) {
    if (previous === "." ) {
        return following === "(" ? "method" : "property";
    }
    if (controlKeywords[word]) {
        return "control";
    }
    if (storageKeywords[word]) {
        return "keyword";
    }
    if (constantWords[word]) {
        return "constant";
    }
    if (builtinTypes[word]) {
        return "type";
    }
    if (following === "(") {
        if (api[word]) {
            return "api";
        }
        return builtinFunctions[word] ? "builtin" : "function";
    }
    if (api[word]) {
        return "api";
    }
    return builtinObjects[word] ? "builtin" : "variable";
}

function tokenize(text, apiNames) {
    var api = apiNames && !Array.isArray(apiNames) ? apiNames : namesToSet(apiNames);
    var tokens = [];
    var depth = 0;
    var previous = "";
    var i = 0;

    function push(type, end, extra) {
        var token = { type: type, text: text.substring(i, end), start: i };
        if (extra) {
            token.depth = extra;
        }
        tokens.push(token);
        i = end;
    }

    while (i < text.length) {
        var ch = text.charAt(i);
        var pair = text.substr(i, 2);
        if (/\s/.test(ch)) {
            var j = i;
            while (j < text.length && /\s/.test(text.charAt(j))) {
                j++;
            }
            push("space", j);
        } else if (pair === "//") {
            push("comment", readUntilLineEnd(text, i));
        } else if (pair === "/*") {
            var close = text.indexOf("*/", i + 2);
            push("comment", close === -1 ? text.length : close + 2);
        } else if (ch === "\"" || ch === "'" || ch === "`") {
            push("string", readQuoted(text, i));
            previous = "value";
        } else if (/\d/.test(ch) || (ch === "." && /\d/.test(text.charAt(i + 1)))) {
            var number = /^(0[xX][0-9a-fA-F]+|0[bB][01]+|(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/.exec(text.substring(i));
            push("number", i + number[0].length);
            previous = "value";
        } else if (isIdentStart(ch)) {
            var k = i + 1;
            while (k < text.length && isIdentPart(text.charAt(k))) {
                k++;
            }
            var word = text.substring(i, k);
            push(classifyWord(word, previous, nextNonSpace(text, k), api), k);
            previous = controlKeywords[word] || storageKeywords[word] ? word : "value";
        } else if (ch === "/" && (previous === "" || regexAllowedAfter[previous])) {
            var end = readRegex(text, i);
            if (end === -1) {
                push("operator", i + 1);
                previous = "/";
            } else {
                push("regex", end);
                previous = "value";
            }
        } else if (bracketOpen.indexOf(ch) !== -1) {
            push("bracket", i + 1, depth % 3 + 1);
            depth++;
            previous = ch;
        } else if (bracketClose.indexOf(ch) !== -1) {
            depth = Math.max(0, depth - 1);
            push("bracket", i + 1, depth % 3 + 1);
            previous = ch === "(" ? ch : "value";
            if (ch === "}") {
                previous = "}";
            }
        } else {
            push(ch === "." ? "punctuation" : ch === "," || ch === ";" ? "punctuation" : "operator", i + 1);
            previous = ch;
        }
    }
    return tokens;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightHtml(text, apiNames, marks) {
    var flagged = marks || {};
    return tokenize(text, apiNames).map(function (token) {
        var body = escapeHtml(token.text);
        if (token.type === "space") {
            return body;
        }
        var css = "tk-" + token.type;
        if (token.depth) {
            css += " tk-b" + token.depth;
        }
        if (flagged[token.start]) {
            css += " tk-" + flagged[token.start];
        }
        return "<span class=\"" + css + "\">" + body + "</span>";
    }).join("");
}
