function buildHsrp(interfaceName, options) {
    var opts = options || {};
    var group = isDefined(opts.group) ? opts.group : 1;
    var body = [];
    if (opts.version) {
        body.push("standby version " + opts.version);
    }
    body.push("standby " + group + " ip " + requireValue(opts.virtualIp, "virtualIp"));
    if (isDefined(opts.priority)) {
        body.push("standby " + group + " priority " + opts.priority);
    }
    if (opts.preempt !== false) {
        body.push("standby " + group + " preempt");
    }
    if (opts.track) {
        body.push("standby " + group + " track " + opts.track + (opts.decrement ? " " + opts.decrement : ""));
    }
    return interfaceBlock(interfaceName, body);
}

function configureHsrp(deviceName, interfaceName, options) {
    return configureIosDevice(deviceName, buildHsrp(interfaceName, options));
}

function configureHsrpPair(activeDevice, standbyDevice, interfaceName, virtualIp, group) {
    return {
        active: configureHsrp(activeDevice, interfaceName, { group: group, virtualIp: virtualIp, priority: 150 }),
        standby: configureHsrp(standbyDevice, interfaceName, { group: group, virtualIp: virtualIp, priority: 100 })
    };
}
