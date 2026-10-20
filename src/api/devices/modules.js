function withPowerOff(device, action) {
    var wasOn = device.getPower();
    if (wasOn) {
        device.setPower(false);
    }
    var result;
    try {
        result = action();
    } finally {
        if (wasOn) {
            device.setPower(true);
            skipBootIfIos(device);
        }
    }
    return result;
}

function supportedModuleList(device) {
    var list = callIfExists(device, "getSupportedModule", null);
    if (!list) {
        return [];
    }
    var names = [];
    for (var i = 0; i < list.length; i++) {
        names.push(String(list[i]));
    }
    return names;
}

function resolveModuleModel(deviceName, model) {
    if (typeof model === "number") {
        throw new Error("Module models are strings, not numbers: addModule(\"" + deviceName + "\", \"0/0\", \"HWIC-2T\"). Run getSupportedModules(\"" + deviceName + "\") for the list");
    }
    var text = oneLine(model);
    if (!text) {
        throw new Error("addModule needs a module model, for example \"HWIC-2T\"");
    }
    if (!Object.prototype.hasOwnProperty.call(allModuleTypes, text)) {
        var known = Object.keys(allModuleTypes).filter(function (name) {
            return name.toLowerCase().indexOf(text.toLowerCase()) !== -1;
        }).slice(0, 5);
        throw new Error("Unknown module: " + text + (known.length ? ". Did you mean " + joinNames(known) + "?" : ". Run getSupportedModules(\"" + deviceName + "\") for the list"));
    }
    return text;
}

function addModule(deviceName, slot, model) {
    var device = findDevice(deviceName);
    var name = isDefined(slot) ? String(slot) : "";
    if (!name) {
        throw new Error("addModule needs a slot name, for example \"0/0\"");
    }
    var moduleModel = resolveModuleModel(deviceName, model);
    var installed = withPowerOff(device, function () {
        return device.addModule(name, allModuleTypes[moduleModel], moduleModel) === true;
    });
    if (!installed) {
        var supported = supportedModuleList(device);
        throw new Error(deviceName + " refused " + moduleModel + " in slot " + name + "." + (supported.length ? " Supported modules: " + joinNames(supported.slice(0, 12)) : "") + " Check that the slot is free and that the model fits the device");
    }
    return true;
}

function addModules(deviceName, modules) {
    var results = [];
    Object.keys(modules || {}).forEach(function (slot) {
        results.push(addModule(deviceName, slot, modules[slot]));
    });
    return results;
}

function removeModule(deviceName, slot) {
    var device = findDevice(deviceName);
    var name = isDefined(slot) ? String(slot) : "";
    var removed = withPowerOff(device, function () {
        return device.removeModule(name) === true;
    });
    if (!removed) {
        throw new Error(deviceName + " has no module in slot " + name);
    }
    return true;
}

function getSupportedModules(deviceName) {
    return supportedModuleList(findDevice(deviceName));
}
