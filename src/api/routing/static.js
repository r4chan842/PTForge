function buildStaticRoute(destination, maskOrNextHop, nextHop, distance) {
    var network;
    var hop;
    var ad;
    if (String(destination).indexOf("/") !== -1) {
        network = networkAndMask(destination);
        hop = maskOrNextHop;
        ad = nextHop;
    } else {
        network = networkAndMask(destination, maskOrNextHop);
        hop = nextHop;
        ad = distance;
    }
    return "ip route " + network + " " + requireValue(hop, "next hop") + (isDefined(ad) ? " " + ad : "");
}

function addStaticRoute(deviceName, destination, maskOrNextHop, nextHop, distance) {
    return configureIosDevice(deviceName, [buildStaticRoute(destination, maskOrNextHop, nextHop, distance)]);
}

function addStaticRoutes(deviceName, routes) {
    return configureIosDevice(deviceName, routes.map(function (route) {
        return buildStaticRoute(route[0], route[1], route[2], route[3]);
    }));
}

function removeStaticRoute(deviceName, destination, maskOrNextHop, nextHop) {
    return configureIosDevice(deviceName, ["no " + buildStaticRoute(destination, maskOrNextHop, nextHop)]);
}

function addDefaultRoute(deviceName, nextHop, distance) {
    return configureIosDevice(deviceName, ["ip route 0.0.0.0 0.0.0.0 " + requireValue(nextHop, "next hop") + (isDefined(distance) ? " " + distance : "")]);
}

function addFloatingRoute(deviceName, destination, nextHop, distance) {
    return addStaticRoute(deviceName, destination, nextHop, distance || 200);
}

function addIpv6StaticRoute(deviceName, prefix, nextHop, distance) {
    return configureIosDevice(deviceName, ["ipv6 route " + prefix + " " + nextHop + (isDefined(distance) ? " " + distance : "")]);
}

function addIpv6DefaultRoute(deviceName, nextHop) {
    return configureIosDevice(deviceName, ["ipv6 route ::/0 " + nextHop]);
}
