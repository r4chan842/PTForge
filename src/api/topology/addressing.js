function addressHosts(deviceNames, network, options) {
    var opts = options || {};
    var info = parseNetwork(network);
    var gateway = opts.gateway || nthHost(network, 1);
    var index = opts.startAt || 10;
    var assigned = {};

    toList(deviceNames).forEach(function (name) {
        var ip = nthHost(network, index++);
        if (ip === gateway) {
            ip = nthHost(network, index++);
        }
        configurePcIp(name, false, ip, info.mask, gateway, opts.dns, opts.port);
        assigned[name] = ip;
    });
    return assigned;
}

function planSubnets(baseNetwork, sizes) {
    var ordered = Object.keys(sizes).map(function (name) {
        return { name: name, hosts: sizes[name] };
    }).sort(function (a, b) {
        return b.hosts - a.hosts;
    });

    var base = parseNetwork(baseNetwork);
    var cursor = ipToInt(base.network);
    var end = ipToInt(base.broadcast);
    var plan = {};

    ordered.forEach(function (item) {
        var prefix = 32;
        while (prefix > 0 && Math.pow(2, 32 - prefix) - 2 < item.hosts) {
            prefix--;
        }
        var size = Math.pow(2, 32 - prefix);
        if (cursor % size !== 0) {
            cursor += size - (cursor % size);
        }
        if (cursor + size - 1 > end) {
            throw new Error("Not enough space in " + baseNetwork + " for " + item.name);
        }
        var network = intToIp(cursor) + "/" + prefix;
        plan[item.name] = {
            network: network,
            mask: cidrToMask(prefix),
            gateway: nthHost(network, 1),
            firstHost: hostRange(network).first,
            lastHost: hostRange(network).last,
            broadcast: broadcastAddress(network),
            usable: hostRange(network).count
        };
        cursor += size;
    });
    return plan;
}

function pointToPointLinks(baseNetwork, count) {
    return splitSubnet(baseNetwork, 30).slice(0, count).map(function (network) {
        return { network: network, a: nthHost(network, 1), b: nthHost(network, 2), mask: "255.255.255.252" };
    });
}
