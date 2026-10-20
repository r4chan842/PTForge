function hsrpGroupNumber(value) {
    var group = isDefined(value) ? value : 1;
    if (!isWholeNumber(group) || group < 0 || group > 255) {
        throw new Error("HSRP group must be a whole number from 0 to 255, got " + value);
    }
    return group;
}

function hsrpVirtualIp(opts) {
    var address = pickFirst(opts.virtualIp, opts.virtualIP, opts.vip, opts.ip);
    if (!isDefined(address)) {
        throw new Error("HSRP needs the shared address as virtualIp, for example { virtualIp: \"192.168.10.1\" }");
    }
    return String(address);
}

function hsrpPriority(value, fallback) {
    var priority = isDefined(value) ? value : fallback;
    return requireWholeNumber(priority, "HSRP priority", 0, 255);
}

function buildHsrp(interfaceName, options) {
    var opts = options || {};
    var group = hsrpGroupNumber(opts.group);
    var body = [];

    if (opts.version) {
        body.push("standby version " + requireWholeNumber(opts.version, "HSRP version", 1, 2));
    }
    body.push("standby " + group + " ip " + hsrpVirtualIp(opts));
    if (isDefined(opts.priority)) {
        body.push("standby " + group + " priority " + hsrpPriority(opts.priority, 100));
    }
    if (opts.preempt !== false) {
        body.push("standby " + group + " preempt");
        if (opts.delay) {
            body.push("standby " + group + " preempt delay minimum " + requireWholeNumber(opts.delay, "HSRP preempt delay", 0, 3600));
        }
    }
    if (isDefined(opts.track)) {
        var decrement = isDefined(opts.decrement) ? " " + requireWholeNumber(opts.decrement, "HSRP track decrement", 1, 255) : "";
        body.push("standby " + group + " track " + opts.track + decrement);
    }
    return interfaceBlock(interfaceName, body);
}

function configureHsrp(deviceName, interfaceName, options) {
    return configureIosDevice(deviceName, buildHsrp(interfaceName, options));
}
