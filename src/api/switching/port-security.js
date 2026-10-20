var portSecurityViolations = ["shutdown", "restrict", "protect"];

function portSecurityMax(value) {
    var max = isDefined(value) ? value : 1;
    if (!isWholeNumber(max) || max < 1 || max > 1024) {
        throw new Error("Port security maximum must be a whole number from 1 to 1024, got " + value);
    }
    return max;
}

function checkMacList(macs) {
    var list = toList(macs);
    list.forEach(function (mac) {
        if (!/^([0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}|[0-9a-f]{2}([-:]?[0-9a-f]{2}){5})$/i.test(String(mac))) {
            throw new Error("Port security needs MAC addresses as aaaa.bbbb.cccc or aa:bb:cc:dd:ee:ff, got " + mac);
        }
    });
    return list;
}

function buildPortSecurity(interfaces, options) {
    var opts = options || {};
    var violation = isDefined(opts.violation) ? String(opts.violation).toLowerCase() : "shutdown";
    if (portSecurityViolations.indexOf(violation) === -1) {
        throw new Error("Invalid violation mode: " + opts.violation + ". Valid modes are " + joinNames(portSecurityViolations));
    }
    var maximum = portSecurityMax(opts.maximum);
    var macs = checkMacList(opts.macs);
    var members = toList(interfaces);
    if (!members.length) {
        throw new Error("buildPortSecurity needs at least one interface");
    }

    var commands = [];
    members.forEach(function (name) {
        var body = [
            "switchport mode access",
            "no switchport port-security",
            "switchport port-security",
            "switchport port-security maximum " + maximum,
            "switchport port-security violation " + violation
        ];
        if (opts.sticky !== false) {
            body.push("switchport port-security mac-address sticky");
        }
        macs.forEach(function (mac) {
            body.push("switchport port-security mac-address " + mac);
        });
        if (opts.agingTime) {
            body.push("switchport port-security aging time " + requireWholeNumber(opts.agingTime, "Port security aging time", 1, 1440));
        }
        if (opts.agingType) {
            if (["absolute", "inactivity"].indexOf(opts.agingType) === -1) {
                throw new Error("Port security aging type must be absolute or inactivity, got " + opts.agingType);
            }
            body.push("switchport port-security aging type " + opts.agingType);
        }
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function configurePortSecurity(deviceName, interfaces, options) {
    return configureIosDevice(deviceName, buildPortSecurity(interfaces, options));
}
