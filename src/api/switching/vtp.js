function buildVtp(options) {
    var opts = options || {};
    var commands = [];
    if (opts.domain) {
        commands.push("vtp domain " + opts.domain);
    }
    if (opts.mode) {
        if (["server", "client", "transparent"].indexOf(opts.mode) === -1) {
            throw new Error("Invalid VTP mode: " + opts.mode);
        }
        commands.push("vtp mode " + opts.mode);
    }
    if (opts.password) {
        commands.push("vtp password " + opts.password);
    }
    if (opts.version) {
        commands.push("vtp version " + opts.version);
    }
    if (opts.pruning) {
        commands.push("vtp pruning");
    }
    return commands;
}

function configureVtp(deviceName, options) {
    return configureIosDevice(deviceName, buildVtp(options));
}
