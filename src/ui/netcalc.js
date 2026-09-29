function calcIpToInt(ip) {
    var parts = String(ip).trim().split(".");
    if (parts.length !== 4) {
        throw new Error("Not an IPv4 address: " + ip);
    }
    return parts.reduce(function (total, part) {
        if (!/^\d{1,3}$/.test(part) || Number(part) > 255) {
            throw new Error("Not an IPv4 address: " + ip);
        }
        return total * 256 + Number(part);
    }, 0);
}

function calcIntToIp(value) {
    return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");
}

function calcPrefixToInt(prefix) {
    return prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
}

function calcMaskToPrefix(mask) {
    var value = calcIpToInt(mask);
    var prefix = 0;
    while (prefix < 32 && (value & (0x80000000 >>> prefix)) !== 0) {
        prefix++;
    }
    if (calcPrefixToInt(prefix) !== value) {
        throw new Error("Not a contiguous subnet mask: " + mask);
    }
    return prefix;
}

function calcParsePrefix(text) {
    var value = String(text).trim().replace(/^\//, "");
    if (/^\d{1,2}$/.test(value) && Number(value) <= 32) {
        return Number(value);
    }
    return calcMaskToPrefix(value);
}

function calcParse(input) {
    var text = String(input).trim();
    var match = /^(\S+?)\s*(?:\/\s*|\s+)(\S+)$/.exec(text);
    if (!match) {
        return { ip: calcIpToInt(text), prefix: 24 };
    }
    return { ip: calcIpToInt(match[1]), prefix: calcParsePrefix(match[2]) };
}

function ipClass(ip) {
    var first = ip >>> 24;
    if (first < 128) {
        return "A";
    }
    if (first < 192) {
        return "B";
    }
    if (first < 224) {
        return "C";
    }
    return first < 240 ? "D (multicast)" : "E (reserved)";
}

function isPrivate(ip) {
    var a = ip >>> 24;
    var b = (ip >>> 16) & 255;
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function subnetInfo(input) {
    var parsed = calcParse(input);
    var mask = calcPrefixToInt(parsed.prefix);
    var network = (parsed.ip & mask) >>> 0;
    var broadcast = (network | (~mask >>> 0)) >>> 0;
    var size = Math.pow(2, 32 - parsed.prefix);
    var usable = parsed.prefix >= 31 ? size : size - 2;
    var first = parsed.prefix >= 31 ? network : network + 1;
    var last = parsed.prefix >= 31 ? broadcast : broadcast - 1;
    return {
        address: calcIntToIp(parsed.ip),
        prefix: parsed.prefix,
        mask: calcIntToIp(mask),
        wildcard: calcIntToIp(~mask >>> 0),
        network: calcIntToIp(network),
        broadcast: calcIntToIp(broadcast),
        firstHost: calcIntToIp(first),
        lastHost: calcIntToIp(last),
        hosts: usable,
        total: size,
        ipClass: ipClass(parsed.ip),
        scope: isPrivate(parsed.ip) ? "private" : "public",
        binaryMask: calcIntToIp(mask).split(".").map(function (octet) {
            return ("00000000" + Number(octet).toString(2)).slice(-8);
        }).join(".")
    };
}

function prefixForHosts(hosts) {
    var needed = Number(hosts) + 2;
    var bits = 0;
    while (Math.pow(2, bits) < needed) {
        bits++;
    }
    return Math.max(0, 32 - Math.max(bits, 2));
}

function vlsmPlan(baseInput, requests) {
    var base = calcParse(baseInput);
    var baseMask = calcPrefixToInt(base.prefix);
    var cursor = (base.ip & baseMask) >>> 0;
    var end = cursor + Math.pow(2, 32 - base.prefix);
    var list = requests.map(function (req, index) {
        return typeof req === "number" ? { name: "Net" + (index + 1), hosts: req } : { name: req.name || "Net" + (index + 1), hosts: Number(req.hosts) };
    }).sort(function (a, b) {
        return b.hosts - a.hosts;
    });
    return list.map(function (req) {
        if (!(req.hosts > 0)) {
            throw new Error("Host count must be a positive number for " + req.name);
        }
        var prefix = prefixForHosts(req.hosts);
        var size = Math.pow(2, 32 - prefix);
        if (cursor + size > end) {
            throw new Error("Not enough space in " + calcIntToIp((base.ip & baseMask) >>> 0) + "/" + base.prefix + " for " + req.name);
        }
        var info = subnetInfo(calcIntToIp(cursor) + "/" + prefix);
        cursor += size;
        return {
            name: req.name,
            needed: req.hosts,
            network: info.network + "/" + prefix,
            mask: info.mask,
            range: info.firstHost + " - " + info.lastHost,
            broadcast: info.broadcast,
            hosts: info.hosts,
            wasted: info.hosts - req.hosts
        };
    });
}

function parseVlsmRequests(text) {
    return String(text).split(/[,;\n]+/).map(function (part) {
        return part.trim();
    }).filter(Boolean).map(function (part, index) {
        var match = /^(?:([^:=\s]+)\s*[:=]\s*)?(\d+)$/.exec(part);
        if (!match) {
            throw new Error("Use a list like  Sales:50, IT:20, 12  (" + part + ")");
        }
        return { name: match[1] || "Net" + (index + 1), hosts: Number(match[2]) };
    });
}

function wildcardFor(input) {
    var text = String(input).trim();
    if (/^\/?\d{1,2}$/.test(text)) {
        var prefix = calcParsePrefix(text);
        return { prefix: prefix, mask: calcIntToIp(calcPrefixToInt(prefix)), wildcard: calcIntToIp(~calcPrefixToInt(prefix) >>> 0) };
    }
    var value = calcIpToInt(text);
    var inverted = calcIntToIp(~value >>> 0);
    try {
        var asMask = calcMaskToPrefix(text);
        return { prefix: asMask, mask: text, wildcard: inverted };
    } catch (error) {
        var asWildcard = calcMaskToPrefix(inverted);
        return { prefix: asWildcard, mask: inverted, wildcard: text };
    }
}
