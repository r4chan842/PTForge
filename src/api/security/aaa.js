function buildAaa(options) {
    var opts = options || {};
    var commands = ["aaa new-model"];
    var methods = [];

    if (opts.radius) {
        commands.push("radius-server host " + requireValue(opts.radius.host, "radius host") + " key " + requireValue(opts.radius.key, "radius key"));
        methods.push("group radius");
    }
    if (opts.tacacs) {
        commands.push("tacacs-server host " + requireValue(opts.tacacs.host, "tacacs host"));
        commands.push("tacacs-server key " + requireValue(opts.tacacs.key, "tacacs key"));
        methods.push("group tacacs+");
    }
    if (opts.localFallback !== false || methods.length === 0) {
        methods.push("local");
    }
    toList(opts.users).forEach(function (user) {
        commands.push("username " + user.name + " secret " + user.password);
    });
    commands.push("aaa authentication login default " + methods.join(" "));
    return commands;
}

function configureAaa(deviceName, options) {
    return configureIosDevice(deviceName, buildAaa(options));
}

