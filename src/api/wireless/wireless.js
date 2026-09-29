function wirelessProcess(deviceName) {
    var device = findDevice(deviceName);
    var process = device.getProcess("WirelessServer") || device.getProcess("WirelessCommon");
    if (!process) {
        throw new Error("No wireless radio on " + deviceName);
    }
    return process;
}

function configureWireless(deviceName, options) {
    var opts = options || {};
    var process = wirelessProcess(deviceName);
    var security = opts.security || (opts.key ? "wpa2-psk" : "open");
    var authType = wirelessAuthTypes[security];
    if (authType === undefined) {
        throw new Error("Unknown wireless security: " + security);
    }

    if (opts.ssid) {
        process.setSsid(String(opts.ssid));
    }
    if (opts.mode) {
        var mode = wirelessNetworkModes[opts.mode];
        if (mode === undefined) {
            throw new Error("Unknown wireless mode: " + opts.mode);
        }
        process.setNetworkType(mode);
    }

    process.setAuthenType(authType);

    if (security === "wep") {
        process.setEncryptType(wirelessEncryptTypes[opts.encryption || "wep64"]);
        process.getWepProcess().setKey(requireValue(opts.key, "key"));
    } else if (security === "wpa-psk" || security === "wpa2-psk") {
        var key = String(requireValue(opts.key, "key"));
        if (key.length < 8 || key.length > 63) {
            throw new Error("WPA key must be 8 to 63 characters");
        }
        process.setEncryptType(wirelessEncryptTypes[opts.encryption || (security === "wpa2-psk" ? "aes" : "tkip")]);
        process.getWpaProcess().setKey(key);
    } else if (security === "open" || security === "none") {
        process.setEncryptType(wirelessEncryptTypes.none);
    }

    if (opts.hideSsid === true || opts.hideSsid === false) {
        if (typeof process.setSsidBrdCastEnabled === "function") {
            process.setSsidBrdCastEnabled(!opts.hideSsid);
        }
    }
    return true;
}

function getWirelessSsid(deviceName) {
    return String(wirelessProcess(deviceName).getSsid());
}

function setMacFilter(deviceName, macs, allow) {
    var process = wirelessProcess(deviceName);
    process.removeAllMacEntries();
    toList(macs).forEach(function (mac) {
        process.addToMacFilterAddrList(mac);
    });
    process.setAllowAccess(allow !== false);
    process.setMacFilterEnabled(toList(macs).length > 0);
    return true;
}
