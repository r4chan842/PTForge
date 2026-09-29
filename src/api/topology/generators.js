function numberedNames(prefix, count, start) {
    var names = [];
    for (var i = 0; i < count; i++) {
        names.push(prefix + ((start || 1) + i));
    }
    return names;
}

function buildStar(options) {
    var opts = options || {};
    var center = opts.center || "S1";
    var count = opts.count || 4;
    var cx = isDefined(opts.x) ? opts.x : 400;
    var cy = isDefined(opts.y) ? opts.y : 300;
    var leaves = numberedNames(opts.prefix || "PC", count, opts.start);
    var centerPort = opts.centerPort || function (i) { return "FastEthernet0/" + (i + 1); };
    var leafPort = opts.leafPort || function () { return "FastEthernet0"; };

    addDevice(center, opts.centerModel || "2960-24TT", cx, cy);
    circlePositions(count, cx, cy, opts.radius || 200).forEach(function (position, i) {
        addDevice(leaves[i], opts.leafModel || "PC-PT", position[0], position[1]);
        addLink(center, centerPort(i), leaves[i], leafPort(i), opts.linkType || "straight");
    });
    return { center: center, leaves: leaves };
}

function buildRing(options) {
    var opts = options || {};
    var count = opts.count || 4;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var portA = opts.portA || "GigabitEthernet0/0";
    var portB = opts.portB || "GigabitEthernet0/1";

    circlePositions(count, isDefined(opts.x) ? opts.x : 400, isDefined(opts.y) ? opts.y : 300, opts.radius || 200).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
    });
    for (var i = 0; i < count; i++) {
        addLink(names[i], portA, names[(i + 1) % count], portB, opts.linkType || "cross");
    }
    return names;
}

function buildLine(options) {
    var opts = options || {};
    var count = opts.count || 3;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var portA = opts.portA || "GigabitEthernet0/0";
    var portB = opts.portB || "GigabitEthernet0/1";

    rowPositions(count, isDefined(opts.y) ? opts.y : 200, opts.x, opts.gap || 160).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
    });
    for (var i = 0; i < count - 1; i++) {
        addLink(names[i], portA, names[i + 1], portB, opts.linkType || "cross");
    }
    return names;
}

function buildFullMesh(options) {
    var opts = options || {};
    var count = opts.count || 4;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var ports = opts.ports || ["GigabitEthernet0/0", "GigabitEthernet0/1", "GigabitEthernet0/2"];
    var nextPort = {};

    if (count - 1 > ports.length) {
        throw new Error("Full mesh of " + count + " needs " + (count - 1) + " ports per device");
    }

    circlePositions(count, isDefined(opts.x) ? opts.x : 400, isDefined(opts.y) ? opts.y : 300, opts.radius || 200).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
        nextPort[names[i]] = 0;
    });
    for (var i = 0; i < count; i++) {
        for (var j = i + 1; j < count; j++) {
            addLink(names[i], ports[nextPort[names[i]]++], names[j], ports[nextPort[names[j]]++], opts.linkType || "cross");
        }
    }
    return names;
}

function buildLan(options) {
    var opts = options || {};
    var switchName = opts.switchName || "S1";
    var hosts = opts.hosts || 3;
    var x = isDefined(opts.x) ? opts.x : 300;
    var y = isDefined(opts.y) ? opts.y : 250;
    var names = numberedNames(opts.hostPrefix || "PC", hosts, opts.start);

    addDevice(switchName, opts.switchModel || "2960-24TT", x, y);
    rowPositions(hosts, y + 150, x - ((hosts - 1) * 100) / 2, 100).forEach(function (position, i) {
        addDevice(names[i], opts.hostModel || "PC-PT", position[0], position[1]);
        addLink(switchName, "FastEthernet0/" + (i + 1), names[i], "FastEthernet0", "straight");
    });

    if (opts.network) {
        addressHosts(names, opts.network, { gateway: opts.gateway, dns: opts.dns, startAt: opts.startAt });
    }
    return { switchName: switchName, hosts: names };
}
