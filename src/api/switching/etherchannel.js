var etherChannelModes = ["active", "passive", "desirable", "auto", "on"];

var etherChannelModeHelp = {
    active: "LACP, the other side must be active or passive",
    passive: "LACP, the other side must be active",
    desirable: "PAgP, the other side must be desirable or auto",
    auto: "PAgP, the other side must be desirable",
    on: "no negotiation, both sides must be on"
};

function channelGroupNumber(group) {
    var value = typeof group === "string" ? Number(group) : group;
    if (!isWholeNumber(value) || value < 1 || value > 48) {
        throw new Error("EtherChannel group must be a whole number from 1 to 48, got " + group);
    }
    return value;
}

function resolveChannelMode(mode) {
    var name = isDefined(mode) && mode !== "" ? String(mode).toLowerCase() : "active";
    if (etherChannelModes.indexOf(name) === -1) {
        throw new Error("Invalid EtherChannel mode: " + mode + ". Valid modes are " + joinNames(etherChannelModes) + ". " + joinNames(etherChannelModes.map(function (item) {
            return item + " (" + etherChannelModeHelp[item] + ")";
        })));
    }
    return name;
}

function channelPortBody(opts, group, channelMode) {
    var body = [];
    if (opts.trunk) {
        if (opts.encapsulation) {
            body.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        body.push("switchport mode trunk");
    } else if (opts.accessVlan) {
        body.push("switchport mode access");
        body.push("switchport access vlan " + opts.accessVlan);
    } else if (opts.address) {
        body.push("no switchport");
    }
    body.push("channel-group " + group + " mode " + channelMode);
    body.push("no shutdown");
    return body;
}

function channelPortChannelBody(opts, group) {
    var body = [];
    if (opts.trunk) {
        if (opts.encapsulation) {
            body.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        body.push("switchport mode trunk");
        if (opts.allowedVlans) {
            body.push("switchport trunk allowed vlan " + joinVlans(opts.allowedVlans));
        }
        if (opts.nativeVlan) {
            body.push("switchport trunk native vlan " + opts.nativeVlan);
        }
    } else if (opts.address) {
        var parsed = ipAndMask(opts.address, opts.mask);
        body.push("no switchport");
        body.push("ip address " + parsed.ip + " " + parsed.mask);
    } else if (opts.accessVlan) {
        body.push("switchport mode access");
        body.push("switchport access vlan " + opts.accessVlan);
    }
    body.push("no shutdown");
    return body;
}

function buildEtherChannel(group, interfaces, mode, options) {
    var opts = mergeInto({}, options || {});
    var number = channelGroupNumber(group);
    var channelMode = resolveChannelMode(mode);
    var members = toList(interfaces);
    if (!members.length) {
        throw new Error("buildEtherChannel needs at least one interface, for example [\"FastEthernet0/23\", \"FastEthernet0/24\"]");
    }

    var body = channelPortBody(opts, number, channelMode);
    var commands = [];
    members.forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands.concat(interfaceBlock("Port-channel" + number, channelPortChannelBody(opts, number)));
}

function createEtherChannel(deviceName, group, interfaces, mode, options) {
    var device = findDevice(deviceName);
    var opts = mergeInto({}, options || {});
    if (opts.trunk && !opts.encapsulation && device.getType() === deviceTypes.multilayerswitch) {
        opts.encapsulation = "dot1q";
    }
    return configureIosDevice(deviceName, buildEtherChannel(group, interfaces, mode, opts));
}
