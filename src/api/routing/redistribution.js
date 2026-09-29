function redistribute(deviceName, into, source, options) {
    var opts = options || {};
    var header;
    if (into.protocol === "ospf") {
        header = "router ospf " + (into.id || 1);
    } else if (into.protocol === "eigrp") {
        header = "router eigrp " + requireValue(into.id, "EIGRP AS");
    } else if (into.protocol === "rip") {
        header = "router rip";
    } else if (into.protocol === "bgp") {
        header = "router bgp " + requireValue(into.id, "BGP AS");
    } else {
        throw new Error("Unknown routing protocol: " + into.protocol);
    }

    var line = " redistribute " + source;
    if (into.protocol === "ospf" && opts.subnets !== false) {
        line += " subnets";
    }
    if (opts.metric) {
        line += " metric " + opts.metric;
    }
    return configureIosDevice(deviceName, [header, line, "exit"]);
}
