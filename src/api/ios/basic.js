function buildBasicSetup(options) {
    var opts = options || {};
    var commands = [];

    if (opts.hostname) {
        commands.push("hostname " + opts.hostname);
    }
    if (opts.noDomainLookup !== false) {
        commands.push("no ip domain-lookup");
    }
    if (opts.domain) {
        commands.push("ip domain-name " + opts.domain);
    }
    if (opts.secret) {
        commands.push("enable secret " + opts.secret);
    }
    if (opts.banner) {
        commands.push("banner motd #" + String(opts.banner).replace(/#/g, "") + "#");
    }
    if (opts.consolePassword) {
        commands = commands.concat([
            "line console 0",
            " password " + opts.consolePassword,
            " login",
            " logging synchronous",
            "exit"
        ]);
    }
    if (opts.vtyPassword) {
        commands = commands.concat([
            "line vty 0 15",
            " password " + opts.vtyPassword,
            " login",
            "exit"
        ]);
    }
    if (opts.encryptPasswords !== false && (opts.secret || opts.consolePassword || opts.vtyPassword)) {
        commands.push("service password-encryption");
    }
    return commands;
}

function basicSetup(deviceName, options) {
    var opts = Object.assign({ hostname: deviceName }, options || {});
    return configureIosDevice(deviceName, buildBasicSetup(opts));
}

function setHostname(deviceName, hostname) {
    return configureIosDevice(deviceName, ["hostname " + requireValue(hostname, "hostname")]);
}

function setBanner(deviceName, text) {
    return configureIosDevice(deviceName, buildBasicSetup({ banner: text, noDomainLookup: false }));
}

function setEnableSecret(deviceName, secret) {
    return configureIosDevice(deviceName, ["enable secret " + requireValue(secret, "secret")]);
}

function setConsolePassword(deviceName, password) {
    return configureIosDevice(deviceName, buildBasicSetup({ consolePassword: password, noDomainLookup: false, encryptPasswords: false }));
}

function setVtyPassword(deviceName, password) {
    return configureIosDevice(deviceName, buildBasicSetup({ vtyPassword: password, noDomainLookup: false, encryptPasswords: false }));
}

function addLocalUser(deviceName, username, password, privilege) {
    var line = "username " + requireValue(username, "username");
    if (isDefined(privilege)) {
        line += " privilege " + privilege;
    }
    line += " secret " + requireValue(password, "password");
    return configureIosDevice(deviceName, [line]);
}

function enablePasswordEncryption(deviceName) {
    return configureIosDevice(deviceName, ["service password-encryption"]);
}

function setDomainName(deviceName, domain) {
    return configureIosDevice(deviceName, ["ip domain-name " + requireValue(domain, "domain")]);
}

function setNameServer(deviceName, servers) {
    return configureIosDevice(deviceName, ["ip name-server " + toList(servers).join(" ")]);
}

function addHostEntry(deviceName, hostname, ip) {
    return configureIosDevice(deviceName, ["ip host " + hostname + " " + ip]);
}
