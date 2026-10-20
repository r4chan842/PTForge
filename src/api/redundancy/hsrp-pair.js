function hsrpPairOptions(value, group) {
    var opts = {};
    if (typeof value === "string") {
        opts.virtualIp = value;
    } else if (isDefined(value)) {
        opts = mergeInto({}, value);
    }
    if (isDefined(group)) {
        opts.group = group;
    }
    return opts;
}

function configureHsrpPair(activeDevice, standbyDevice, interfaceName, virtualIp, group) {
    var opts = hsrpPairOptions(virtualIp, group);
    hsrpVirtualIp(opts);
    var address = hsrpVirtualIp(opts);
    var groupNumber = hsrpGroupNumber(opts.group);
    var activePriority = isDefined(opts.activePriority) ? opts.activePriority : 150;
    var standbyPriority = isDefined(opts.standbyPriority) ? opts.standbyPriority : 100;

    var report = { active: true, standby: true, group: groupNumber, virtualIp: address };
    report.active = configureHsrp(activeDevice, interfaceName, {
        group: groupNumber,
        virtualIp: address,
        version: opts.version,
        priority: activePriority,
        preempt: true,
        track: opts.track,
        decrement: opts.decrement
    });
    report.standby = configureHsrp(standbyDevice, interfaceName, {
        group: groupNumber,
        virtualIp: address,
        version: opts.version,
        priority: standbyPriority,
        preempt: true
    });
    return report;
}

function getHsrpState(deviceName, interfaceName) {
    var result = runCommand(deviceName, "show standby " + interfaceName + " brief", "enable");
    var state = /(Active|Standby|Listen|Init|Speak)/i.exec(result.output);
    var group = /Group\s+(\d+)/i.exec(result.output);
    return {
        interface: String(interfaceName),
        state: state ? state[1] : "",
        group: group ? group[1] : "",
        output: result.output
    };
}
