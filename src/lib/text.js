function toList(value) {
    if (value === undefined || value === null || value === "") {
        return [];
    }
    return Array.isArray(value) ? value.slice() : [value];
}

function toLines(value) {
    if (Array.isArray(value)) {
        return value.map(String);
    }
    return String(value === undefined || value === null ? "" : value).split(/\r?\n/);
}

function joinVlans(vlans) {
    return toList(vlans).join(",");
}

function requireValue(value, label) {
    if (value === undefined || value === null || value === "") {
        throw new Error("Missing required value: " + label);
    }
    return value;
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

function interfaceBlock(name, body) {
    return ["interface " + name].concat(body.map(function (line) {
        return " " + line;
    })).concat(["exit"]);
}


function toArray(list) {
    if (!list) {
        return [];
    }
    if (Array.isArray(list)) {
        return list.slice();
    }
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(list[i]);
    }
    return result;
}

function mergeInto(target, source) {
    var out = target || {};
    var extra = source || {};
    for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) {
            out[key] = extra[key];
        }
    }
    return out;
}

function oneLine(text) {
    return String(text === undefined || text === null ? "" : text).replace(/^\s+|\s+$/g, "");
}

function joinNames(list) {
    return toList(list).map(String).join(", ");
}

function pickFirst() {
    for (var i = 0; i < arguments.length; i++) {
        if (isDefined(arguments[i]) && arguments[i] !== "") {
            return arguments[i];
        }
    }
    return undefined;
}

function isWholeNumber(value) {
    return typeof value === "number" && isFinite(value) && value % 1 === 0;
}

function requireWholeNumber(value, label, low, high) {
    if (!isWholeNumber(value)) {
        throw new Error(label + " must be a whole number, got " + value);
    }
    if (value < low || value > high) {
        throw new Error(label + " must be between " + low + " and " + high + ", got " + value);
    }
    return value;
}
