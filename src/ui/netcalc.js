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
        var ip = calcIpToInt(text);
        var first = ip >>> 24;
        return { ip: ip, prefix: first < 128 ? 8 : first < 192 ? 16 : first < 224 ? 24 : 32 };
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
        var match = /^(?:([^:=\s]+)\s*[:=\s]\s*)?(\d+)$/.exec(part);
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

function calcNetworkOf(input) {
    var parsed = calcParse(input);
    var mask = calcPrefixToInt(parsed.prefix);
    return { start: (parsed.ip & mask) >>> 0, prefix: parsed.prefix };
}

function calcBlockSize(prefix) {
    return Math.pow(2, 32 - prefix);
}

function calcCidrText(start, prefix) {
    return calcIntToIp(start) + "/" + prefix;
}

function rangeBlocks(start, end) {
    var blocks = [];
    var cursor = start;
    while (cursor <= end) {
        var prefix = 32;
        while (prefix > 0) {
            var size = calcBlockSize(prefix - 1);
            if (cursor % size !== 0 || cursor + size - 1 > end) {
                break;
            }
            prefix--;
        }
        blocks.push({ start: cursor, prefix: prefix });
        cursor += calcBlockSize(prefix);
    }
    return blocks;
}

function describeBlock(block) {
    var mask = calcPrefixToInt(block.prefix);
    return {
        network: calcCidrText(block.start, block.prefix),
        mask: calcIntToIp(mask),
        wildcard: calcIntToIp(~mask >>> 0),
        acl: block.prefix === 32 ? "host " + calcIntToIp(block.start) : calcIntToIp(block.start) + " " + calcIntToIp(~mask >>> 0),
        size: calcBlockSize(block.prefix)
    };
}

function rangeToCidrs(fromIp, toIp) {
    var start = calcIpToInt(fromIp);
    var end = calcIpToInt(toIp);
    if (end < start) {
        throw new Error("The range ends before it starts");
    }
    return rangeBlocks(start, end).map(describeBlock);
}

function parseNetworkList(text) {
    var items = String(text).split(/[\s,;]+/).filter(Boolean);
    var result = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.indexOf("/") !== -1) {
            result.push(calcNetworkOf(item));
            continue;
        }
        var mask = items[i + 1];
        var prefix = -1;
        if (mask && /^\d+\.\d+\.\d+\.\d+$/.test(mask)) {
            try {
                prefix = calcMaskToPrefix(mask);
            } catch (error) {
                prefix = -1;
            }
        }
        if (prefix === -1) {
            throw new Error("Write networks with a prefix or a mask, for example 10.1.4.0/24 or 10.1.4.0 255.255.255.0 (" + item + ")");
        }
        result.push(calcNetworkOf(item + "/" + prefix));
        i++;
    }
    return result;
}

function summarizeRoutes(input) {
    var nets = Array.isArray(input) ? input.map(calcNetworkOf) : parseNetworkList(input);
    if (!nets.length) {
        throw new Error("Enter at least one network");
    }
    var low = Math.min.apply(null, nets.map(function (n) { return n.start; }));
    var high = Math.max.apply(null, nets.map(function (n) { return n.start + calcBlockSize(n.prefix) - 1; }));
    var prefix = 32;
    while (prefix > 0 && (((low & calcPrefixToInt(prefix)) >>> 0) + calcBlockSize(prefix) - 1 < high || ((low & calcPrefixToInt(prefix)) >>> 0) > low)) {
        prefix--;
    }
    var summaryStart = (low & calcPrefixToInt(prefix)) >>> 0;
    var covered = 0;
    var sorted = nets.slice().sort(function (a, b) {
        return a.start - b.start || a.prefix - b.prefix;
    });
    var merged = [];
    sorted.forEach(function (n) {
        var end = n.start + calcBlockSize(n.prefix) - 1;
        var last = merged[merged.length - 1];
        if (last && n.start <= last.end + 1) {
            last.end = Math.max(last.end, end);
        } else {
            merged.push({ start: n.start, end: end });
        }
    });
    var exact = [];
    merged.forEach(function (range) {
        covered += range.end - range.start + 1;
        rangeBlocks(range.start, range.end).forEach(function (block) {
            exact.push(describeBlock(block));
        });
    });
    var summary = describeBlock({ start: summaryStart, prefix: prefix });
    summary.extra = summary.size - covered;
    return { summary: summary, exact: exact, inputs: nets.length };
}

function splitNetwork(input, newPrefix, limit) {
    var net = calcNetworkOf(input);
    var prefix = calcParsePrefix(newPrefix);
    if (prefix < net.prefix) {
        throw new Error("The new prefix /" + prefix + " is shorter than /" + net.prefix);
    }
    var count = Math.pow(2, prefix - net.prefix);
    var shown = Math.min(count, limit || 256);
    var rows = [];
    for (var i = 0; i < shown; i++) {
        var info = subnetInfo(calcIntToIp(net.start + i * calcBlockSize(prefix)) + "/" + prefix);
        rows.push({ index: i + 1, network: info.network + "/" + prefix, range: info.firstHost + " - " + info.lastHost, broadcast: info.broadcast });
    }
    return { count: count, hostsEach: subnetInfo(calcIntToIp(net.start) + "/" + prefix).hosts, mask: calcIntToIp(calcPrefixToInt(prefix)), rows: rows };
}

function parseIpv6(text) {
    var value = String(text).trim().replace(/%.*$/, "");
    if (!value) {
        throw new Error("Enter an IPv6 address");
    }
    var v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(value);
    if (v4) {
        var n = calcIpToInt(v4[1]);
        value = value.substring(0, value.length - v4[1].length) + (n >>> 16).toString(16) + ":" + (n & 0xFFFF).toString(16);
    }
    var halves = value.split("::");
    if (halves.length > 2) {
        throw new Error("Only one :: is allowed");
    }
    var parse = function (part) {
        return part ? part.split(":").map(function (group) {
            if (!/^[0-9a-fA-F]{1,4}$/.test(group)) {
                throw new Error("Not an IPv6 address: " + text);
            }
            return parseInt(group, 16);
        }) : [];
    };
    var head = parse(halves[0]);
    var rest = halves.length === 2 ? parse(halves[1]) : [];
    var total = head.length + rest.length;
    if (halves.length === 1 && total !== 8) {
        throw new Error("An IPv6 address has eight groups: " + text);
    }
    if (halves.length === 2 && total > 7) {
        throw new Error("Too many groups for :: in " + text);
    }
    var zeros = [];
    for (var i = 0; i < 8 - total; i++) {
        zeros.push(0);
    }
    return head.concat(zeros, rest);
}

function expandIpv6(groups) {
    return groups.map(function (g) {
        return ("0000" + g.toString(16)).slice(-4);
    }).join(":");
}

function compressIpv6(groups) {
    var bestStart = -1;
    var bestLength = 0;
    for (var i = 0; i < 8; i++) {
        if (groups[i] !== 0) {
            continue;
        }
        var j = i;
        while (j < 8 && groups[j] === 0) {
            j++;
        }
        if (j - i > bestLength && j - i > 1) {
            bestStart = i;
            bestLength = j - i;
        }
        i = j;
    }
    var hex = groups.map(function (g) {
        return g.toString(16);
    });
    if (bestStart === -1) {
        return hex.join(":");
    }
    return hex.slice(0, bestStart).join(":") + "::" + hex.slice(bestStart + bestLength).join(":");
}

function ipv6Mask(prefix) {
    var groups = [];
    for (var i = 0; i < 8; i++) {
        var bits = Math.max(0, Math.min(16, prefix - i * 16));
        groups.push(bits === 0 ? 0 : (0xFFFF << (16 - bits)) & 0xFFFF);
    }
    return groups;
}

function ipv6Type(groups) {
    var first = groups[0];
    var allZero = groups.every(function (g) { return g === 0; });
    if (allZero) {
        return "Unspecified";
    }
    if (groups.slice(0, 7).every(function (g) { return g === 0; }) && groups[7] === 1) {
        return "Loopback";
    }
    if ((first & 0xFFC0) === 0xFE80) {
        return "Link-local unicast";
    }
    if ((first & 0xFE00) === 0xFC00) {
        return "Unique local unicast";
    }
    if ((first & 0xFF00) === 0xFF00) {
        return "Multicast";
    }
    if (first === 0x2001 && groups[1] === 0x0DB8) {
        return "Documentation (2001:db8::/32)";
    }
    if (groups.slice(0, 5).every(function (g) { return g === 0; }) && groups[5] === 0xFFFF) {
        return "IPv4-mapped";
    }
    if ((first & 0xE000) === 0x2000) {
        return "Global unicast";
    }
    return "Reserved";
}

function ipv6Info(input) {
    var text = String(input).trim();
    var match = /^(.+?)\/(\d{1,3})$/.exec(text);
    var prefix = match ? Number(match[2]) : 64;
    if (prefix > 128) {
        throw new Error("An IPv6 prefix is 0 to 128");
    }
    var groups = parseIpv6(match ? match[1] : text);
    var mask = ipv6Mask(prefix);
    var network = groups.map(function (g, i) { return g & mask[i]; });
    var last = network.map(function (g, i) { return (g | (~mask[i] & 0xFFFF)) & 0xFFFF; });
    var solicited = [0xFF02, 0, 0, 0, 0, 1, 0xFF00 | (groups[6] & 0xFF), groups[7]];
    return {
        compressed: compressIpv6(groups),
        expanded: expandIpv6(groups),
        prefix: prefix,
        network: compressIpv6(network) + "/" + prefix,
        first: compressIpv6(network),
        last: compressIpv6(last),
        type: ipv6Type(groups),
        subnets64: prefix <= 64 ? (prefix === 64 ? "1" : "2^" + (64 - prefix) + (64 - prefix <= 20 ? " (" + Math.pow(2, 64 - prefix) + ")" : "")) : "0",
        interfaceId: expandIpv6(groups).split(":").slice(4).join(":"),
        solicitedNode: compressIpv6(solicited)
    };
}

function eui64(prefixInput, mac) {
    var hex = String(mac).replace(/[^0-9a-fA-F]/g, "");
    if (hex.length !== 12) {
        throw new Error("A MAC address has 12 hex digits: " + mac);
    }
    var bytes = [];
    for (var i = 0; i < 12; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    var flipped = bytes[0] ^ 0x02;
    var id = [(flipped << 8) | bytes[1], (bytes[2] << 8) | 0xFF, 0xFE00 | bytes[3], (bytes[4] << 8) | bytes[5]];
    var text = String(prefixInput).trim() || "fe80::/64";
    var match = /^(.+?)(?:\/(\d{1,3}))?$/.exec(text);
    var network = parseIpv6(match[1]).slice(0, 4);
    var address = network.concat(id);
    return {
        interfaceId: id.map(function (g) { return ("0000" + g.toString(16)).slice(-4); }).join(":"),
        address: compressIpv6(address),
        expanded: expandIpv6(address),
        linkLocal: compressIpv6([0xFE80, 0, 0, 0].concat(id)),
        flippedBit: "Byte 1 " + ("0" + bytes[0].toString(16)).slice(-2) + " becomes " + ("0" + flipped.toString(16)).slice(-2)
    };
}

function convertNumber(input) {
    var text = String(input).trim().replace(/\s+/g, "");
    var value;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) {
        value = calcIpToInt(text);
    } else if (/^[01]{8}(\.[01]{8}){3}$/.test(text) || /^[01]{32}$/.test(text)) {
        value = parseInt(text.replace(/\./g, ""), 2);
    } else if (/^0x[0-9a-f]{1,8}$/i.test(text)) {
        value = parseInt(text, 16);
    } else if (/^[01]+b$/i.test(text)) {
        value = parseInt(text.slice(0, -1), 2);
    } else if (/^\d+$/.test(text) && Number(text) <= 4294967295) {
        value = Number(text);
    } else {
        throw new Error("Enter an IPv4 address, a number, 0x hex or a binary value");
    }
    var ip = calcIntToIp(value >>> 0);
    return {
        decimal: String(value >>> 0),
        ip: ip,
        hex: "0x" + ("00000000" + (value >>> 0).toString(16).toUpperCase()).slice(-8),
        hexOctets: ip.split(".").map(function (o) { return ("0" + Number(o).toString(16).toUpperCase()).slice(-2); }).join("."),
        binary: ip.split(".").map(function (o) { return ("00000000" + Number(o).toString(2)).slice(-8); }).join("."),
        bits: (value >>> 0).toString(2).replace(/^0+/, "").length || 1
    };
}
