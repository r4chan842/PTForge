var modelAliases = {
    "1841": "1841",
    "1941": "1941",
    "2811": "2811",
    "2901": "2901",
    "2911": "2911",
    "4321": "ISR4321",
    "4331": "ISR4331",
    "5505": "5505",
    "5506": "5506-X",
    "5506x": "5506-X",
    "7960": "7960",
    "3650": "3650-24PS",
    "2960": "2960-24TT",
    "3560": "3560-24PS",
    isr4321: "ISR4321",
    isr4331: "ISR4331",
    "router": "Router-PT",
    "switch": "Switch-PT",
    "pc": "PC-PT",
    "server": "Server-PT",
    laptop: "Laptop-PT",
    "tablet": "TabletPC-PT",
    "access point": "AccessPoint-PT",
    "wlc": "WLC-PT",
    "cloud": "Cloud-PT"
};

function modelNameOf(model) {
    return String(model === undefined || model === null ? "" : model).replace(/^\s+|\s+$/g, "");
}

function knownModel(model) {
    return Object.prototype.hasOwnProperty.call(allDeviceTypes, model);
}

function similarModels(model, limit) {
    var needle = modelNameOf(model).toLowerCase();
    var hits = [];
    Object.keys(allDeviceTypes).forEach(function (name) {
        var lower = name.toLowerCase();
        if (hits.length < limit && (lower.indexOf(needle) === 0 || lower.indexOf(needle) !== -1 || needle.indexOf(lower) === 0)) {
            hits.push(name);
        }
    });
    return hits;
}

function resolveDeviceModel(model) {
    var text = modelNameOf(model);
    if (!text) {
        throw new Error("addDevice needs a model, for example \"2911\" or \"2960-24TT\". Run getDeviceModels() for the full list");
    }
    if (knownModel(text)) {
        return text;
    }
    var aliasKey = text.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(modelAliases, aliasKey)) {
        return modelAliases[aliasKey];
    }
    var match = null;
    Object.keys(allDeviceTypes).forEach(function (name) {
        if (!match && name.toLowerCase() === aliasKey) {
            match = name;
        }
    });
    if (match) {
        return match;
    }
    var guesses = similarModels(text, 5);
    throw new Error("Unknown device model: " + text + (guesses.length ? ". Did you mean " + joinNames(guesses) + "?" : ". Run getDeviceModels() for the full list"));
}

function getDeviceModels(kind) {
    var names = Object.keys(allDeviceTypes);
    if (isDefined(kind) && kind !== "") {
        var wanted = resolveDeviceType(kind);
        names = names.filter(function (model) {
            return allDeviceTypes[model] === wanted;
        });
    }
    return names.sort();
}

function getDeviceModelType(model) {
    return allDeviceTypes[resolveDeviceModel(model)];
}
