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
