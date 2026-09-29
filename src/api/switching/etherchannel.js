var etherChannelModes = ["active", "passive", "desirable", "auto", "on"];

function buildEtherChannel(group, interfaces, mode, options) {
    var opts = options || {};
    var channelMode = mode || "active";
    if (etherChannelModes.indexOf(channelMode) === -1) {
        throw new Error("Invalid EtherChannel mode: " + channelMode);
    }

    var commands = [];
    toList(interfaces).forEach(function (name) {
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
        commands = commands.concat(interfaceBlock(name, body));
    });

    var portChannel = [];
    if (opts.trunk) {
        if (opts.encapsulation) {
            portChannel.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        portChannel.push("switchport mode trunk");
        if (opts.allowedVlans) {
            portChannel.push("switchport trunk allowed vlan " + joinVlans(opts.allowedVlans));
        }
        if (opts.nativeVlan) {
            portChannel.push("switchport trunk native vlan " + opts.nativeVlan);
        }
    } else if (opts.address) {
        var parsed = ipAndMask(opts.address, opts.mask);
        portChannel.push("no switchport");
        portChannel.push("ip address " + parsed.ip + " " + parsed.mask);
    }
    portChannel.push("no shutdown");
    return commands.concat(interfaceBlock("Port-channel" + group, portChannel));
}

function createEtherChannel(deviceName, group, interfaces, mode, options) {
    var opts = Object.assign({}, options || {});
    if (opts.trunk && !opts.encapsulation && findDevice(deviceName).getType() === deviceTypes.multilayerswitch) {
        opts.encapsulation = "dot1q";
    }
    return configureIosDevice(deviceName, buildEtherChannel(group, interfaces, mode, opts));
}

function setEtherChannelLoadBalance(deviceName, method) {
    return configureIosDevice(deviceName, ["port-channel load-balance " + method]);
}
