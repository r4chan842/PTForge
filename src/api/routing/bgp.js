function buildBgp(options) {
    var opts = options || {};
    var commands = ["router bgp " + requireValue(opts.as, "as")];
    if (opts.routerId) {
        commands.push(" bgp router-id " + opts.routerId);
    }
    toList(opts.neighbors).forEach(function (neighbor) {
        commands.push(" neighbor " + requireValue(neighbor.ip, "neighbor ip") + " remote-as " + requireValue(neighbor.remoteAs, "remoteAs"));
        if (neighbor.description) {
            commands.push(" neighbor " + neighbor.ip + " description " + neighbor.description);
        }
    });
    toList(opts.networks).forEach(function (entry) {
        commands.push(" network " + networkAndMask(entry).replace(" ", " mask "));
    });
    commands.push("exit");
    return commands;
}

function configureBgp(deviceName, options) {
    return configureIosDevice(deviceName, buildBgp(options));
}

function removeBgp(deviceName, as) {
    return configureIosDevice(deviceName, ["no router bgp " + as]);
}
