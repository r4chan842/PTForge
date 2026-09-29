function buildSsh(options) {
    var opts = options || {};
    var commands = [];
    if (opts.hostname) {
        commands.push("hostname " + opts.hostname);
    }
    commands.push("ip domain-name " + requireValue(opts.domain, "domain"));
    if (opts.username) {
        commands.push("username " + opts.username + " privilege " + (opts.privilege || 15) + " secret " + requireValue(opts.password, "password"));
    }
    commands.push("crypto key generate rsa general-keys modulus " + (opts.modulus || 1024));
    commands.push("ip ssh version " + (opts.version || 2));
    if (opts.timeout) {
        commands.push("ip ssh time-out " + opts.timeout);
    }
    if (opts.retries) {
        commands.push("ip ssh authentication-retries " + opts.retries);
    }
    commands.push("line vty " + (opts.lines || "0 15"));
    commands.push(" login local");
    commands.push(" transport input " + (opts.allowTelnet ? "ssh telnet" : "ssh"));
    if (opts.execTimeout) {
        commands.push(" exec-timeout " + opts.execTimeout);
    }
    commands.push("exit");
    return commands;
}

function configureSsh(deviceName, options) {
    var opts = Object.assign({}, options || {});
    if (!opts.hostname) {
        var current = String(callIfExists(findDevice(deviceName), "getHostName", ""));
        if (!current || current === "Router" || current === "Switch") {
            opts.hostname = deviceName;
        }
    }
    return configureIosDevice(deviceName, buildSsh(opts));
}

function setLoginBlock(deviceName, seconds, attempts, within) {
    return configureIosDevice(deviceName, ["login block-for " + seconds + " attempts " + attempts + " within " + within]);
}

function setMinPasswordLength(deviceName, length) {
    return configureIosDevice(deviceName, ["security passwords min-length " + length]);
}
