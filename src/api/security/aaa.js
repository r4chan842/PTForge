function aaaServerOptions(server, label) {
    if (!isDefined(server)) {
        return null;
    }
    var host = oneLine(server.host);
    var key = oneLine(server.key);
    if (!host) {
        throw new Error("AAA needs a " + label + " host, for example { radius: { host: \"192.168.10.50\", key: \"shared\" } }");
    }
    if (!key) {
        throw new Error("AAA needs a " + label + " key, for example { radius: { host: \"192.168.10.50\", key: \"shared\" } }");
    }
    return { host: host, key: key };
}

function buildAaa(options) {
    var opts = options || {};
    var radius = aaaServerOptions(opts.radius, "radius");
    var tacacs = aaaServerOptions(opts.tacacs, "tacacs");
    if (!radius && !tacacs && !toList(opts.users).length && opts.localFallback === false) {
        throw new Error("AAA needs a server or a local user: pass radius, tacacs or users");
    }

    var commands = ["aaa new-model"];
    var methods = [];

    if (radius) {
        var port = isDefined(opts.radius.port) ? " auth-port " + requireWholeNumber(opts.radius.port, "RADIUS port", 1, 65535) : "";
        commands.push("radius-server host " + radius.host + port + " key " + radius.key);
        methods.push("group radius");
    }
    if (tacacs) {
        commands.push("tacacs-server host " + tacacs.host);
        commands.push("tacacs-server key " + tacacs.key);
        methods.push("group tacacs+");
    }
    if (opts.localFallback !== false || methods.length === 0) {
        methods.push("local");
    }
    toList(opts.users).forEach(function (user) {
        commands.push("username " + requireValue(oneLine(user.name), "user name") + " secret " + requireValue(oneLine(user.password), "user password"));
    });
    commands.push("aaa authentication login default " + methods.join(" "));
    if (opts.authorization === true) {
        commands.push("aaa authorization exec default " + methods.join(" "));
    }
    return commands;
}

function configureAaa(deviceName, options) {
    return configureIosDevice(deviceName, buildAaa(options));
}
