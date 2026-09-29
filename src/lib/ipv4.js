function isValidIp(value) {
    var text = String(value);
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) {
        return false;
    }
    return text.split(".").every(function (part) {
        return Number(part) <= 255;
    });
}

function ipToInt(ip) {
    if (!isValidIp(ip)) {
        throw new Error("Invalid IPv4 address: " + ip);
    }
    return String(ip).split(".").reduce(function (total, part) {
        return total * 256 + Number(part);
    }, 0);
}

function intToIp(value) {
    var number = ((value % 4294967296) + 4294967296) % 4294967296;
    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}

function cidrToMask(prefix) {
    var bits = Number(prefix);
    if (!(bits >= 0 && bits <= 32) || Math.floor(bits) !== bits) {
        throw new Error("Invalid prefix length: " + prefix);
    }
    return intToIp(bits === 0 ? 0 : 4294967296 - Math.pow(2, 32 - bits));
}

function maskToCidr(mask) {
    var value = ipToInt(mask);
    var bits = 0;
    while (bits < 32 && Math.floor(value / Math.pow(2, 31 - bits)) % 2 === 1) {
        bits++;
    }
    if (cidrToMask(bits) !== intToIp(value)) {
        throw new Error("Invalid subnet mask: " + mask);
    }
    return bits;
}

function maskToWildcard(mask) {
    return intToIp(4294967295 - ipToInt(mask));
}

function normalizeMask(mask) {
    if (typeof mask === "number" || /^\d{1,2}$/.test(String(mask))) {
        return cidrToMask(Number(mask));
    }
    maskToCidr(mask);
    return String(mask);
}

function parseNetwork(address, mask) {
    var text = String(address);
    var ip;
    var subnetMask;

    if (text.indexOf("/") !== -1) {
        var parts = text.split("/");
        ip = parts[0];
        subnetMask = cidrToMask(Number(parts[1]));
    } else {
        ip = text;
        subnetMask = normalizeMask(isDefined(mask) ? mask : 32);
    }

    var ipValue = ipToInt(ip);
    var maskValue = ipToInt(subnetMask);
    var size = 4294967296 - maskValue;
    var networkValue = ipValue - (ipValue % size);

    return {
        ip: ip,
        mask: subnetMask,
        prefix: maskToCidr(subnetMask),
        wildcard: maskToWildcard(subnetMask),
        network: intToIp(networkValue),
        broadcast: intToIp(networkValue + size - 1),
        size: size
    };
}

function networkAddress(address, mask) {
    return parseNetwork(address, mask).network;
}

function broadcastAddress(address, mask) {
    return parseNetwork(address, mask).broadcast;
}

function hostRange(address, mask) {
    var info = parseNetwork(address, mask);
    if (info.prefix >= 31) {
        return { first: info.network, last: info.broadcast, count: info.size };
    }
    return {
        first: intToIp(ipToInt(info.network) + 1),
        last: intToIp(ipToInt(info.broadcast) - 1),
        count: info.size - 2
    };
}

function nthHost(address, index, mask) {
    var info = parseNetwork(address, mask);
    var count = info.prefix >= 31 ? info.size : info.size - 2;
    var position = Number(index);
    if (position < 0) {
        position = count + position + 1;
    }
    if (!(position >= 1 && position <= count)) {
        throw new Error("Host " + index + " is outside " + info.network + "/" + info.prefix);
    }
    var offset = info.prefix >= 31 ? position - 1 : position;
    return intToIp(ipToInt(info.network) + offset);
}

function splitSubnet(address, newPrefix, mask) {
    var info = parseNetwork(address, mask);
    var target = Number(newPrefix);
    if (target < info.prefix || target > 32) {
        throw new Error("Cannot split /" + info.prefix + " into /" + newPrefix);
    }
    var step = Math.pow(2, 32 - target);
    var result = [];
    for (var value = ipToInt(info.network); value < ipToInt(info.network) + info.size; value += step) {
        result.push(intToIp(value) + "/" + target);
    }
    return result;
}

function isInSubnet(ip, address, mask) {
    var info = parseNetwork(address, mask);
    var value = ipToInt(ip);
    return value >= ipToInt(info.network) && value <= ipToInt(info.broadcast);
}

function ipAndMask(address, mask) {
    var info = parseNetwork(address, mask);
    return { ip: info.ip, mask: info.mask };
}

function networkAndWildcard(address, mask) {
    var info = parseNetwork(address, mask);
    return info.network + " " + info.wildcard;
}

function networkAndMask(address, mask) {
    var info = parseNetwork(address, mask);
    return info.network + " " + info.mask;
}

function aclAddress(value) {
    var text = String(value).trim();
    if (text === "any" || text.indexOf("host ") === 0) {
        return text;
    }
    if (text.indexOf("/") !== -1) {
        var info = parseNetwork(text);
        return info.prefix === 32 ? "host " + info.network : info.network + " " + info.wildcard;
    }
    if (isValidIp(text)) {
        return "host " + text;
    }
    return text;
}
