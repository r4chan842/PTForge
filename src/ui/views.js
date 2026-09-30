var viewTabs = {};

var calcTools = [
    { id: "ipv4", title: "IPv4 Subnet", info: "Network, broadcast, host range, mask and binary view of any address" },
    { id: "split", title: "Subnet Splitter", info: "Cut a network into equal subnets by prefix, subnet count or host count" },
    { id: "vlsm", title: "VLSM Planner", info: "Fit named subnets of different sizes into one block, largest first" },
    { id: "summary", title: "Route Summarization", info: "Smallest summary route and the exact set of prefixes for a list of networks" },
    { id: "range", title: "Range to CIDR", info: "Turn an address range into CIDR blocks and ACL entries" },
    { id: "wildcard", title: "Wildcard Mask", info: "Convert between prefix, subnet mask and wildcard mask" },
    { id: "ipv6", title: "IPv6 Address", info: "Compress, expand, prefix range, address type and solicited node" },
    { id: "eui64", title: "EUI-64", info: "Interface ID and link local address from a MAC address" },
    { id: "convert", title: "Number Converter", info: "Dotted decimal, decimal, hexadecimal and binary" }
];

var calcInputs = {
    ipv4: { address: "192.168.10.77/26" },
    split: { network: "10.10.0.0/22", mode: "prefix", value: "24" },
    vlsm: { base: "172.16.0.0/22", list: "Sales 120\nEngineering 60\nServers 25\nVoice 12\nLink-R1-R2 2\nLink-R2-R3 2" },
    summary: { list: "10.1.0.0/24\n10.1.1.0/24\n10.1.2.0/24\n10.1.3.0/24" },
    range: { from: "192.168.1.10", to: "192.168.1.100", acl: "10" },
    wildcard: { value: "255.255.252.0" },
    ipv6: { address: "2001:db8:acad:1::10/64" },
    eui64: { prefix: "2001:db8:acad:1::/64", mac: "0060.47CA.1B0E" },
    convert: { value: "192.168.1.1" }
};

function viewEscape(text) {
    return escapeHtml(String(text === undefined || text === null ? "" : text));
}

function isViewId(id) {
    return Boolean(id && viewTabs[id]);
}

function openViewTab(kind, key, title, data) {
    var id = "v-" + kind + (key ? "-" + key : "");
    if (!viewTabs[id]) {
        var root = document.createElement("div");
        root.className = "vt vt-" + kind + " hidden";
        byId("editors").appendChild(root);
        viewTabs[id] = { id: id, kind: kind, title: title, data: data, root: root, tool: "ipv4" };
    } else {
        viewTabs[id].title = title;
        if (data !== undefined) {
            viewTabs[id].data = data;
        }
    }
    renderViewTab(id);
    openTab(id);
    return id;
}

function showViewTab(id, visible) {
    var tab = viewTabs[id];
    if (tab) {
        tab.root.classList.toggle("hidden", !visible);
    }
}

function closeViewTab(id) {
    var tab = viewTabs[id];
    if (tab && tab.root.parentNode) {
        tab.root.parentNode.removeChild(tab.root);
    }
    delete viewTabs[id];
}

function viewTabIcon(kind) {
    return icon(kind === "calc" ? "calculator" : kind === "reach" ? "pulse" : "diff", "file-view");
}

function renderViewTab(id) {
    var tab = viewTabs[id];
    if (!tab) {
        return;
    }
    if (tab.kind === "calc") {
        renderCalculator(tab);
    } else if (tab.kind === "reach") {
        renderReachability(tab);
    } else if (tab.kind === "diff") {
        renderDiff(tab);
    }
}

function openCalculator(tool) {
    var id = openViewTab("calc", "", "Network Calculator");
    if (tool && tool !== viewTabs[id].tool) {
        viewTabs[id].tool = tool;
        renderCalculator(viewTabs[id]);
    }
    return id;
}

function kvGrid(pairs) {
    return "<div class=\"kv\">" + pairs.map(function (pair) {
        return "<div class=\"kv-key\">" + viewEscape(pair[0]) + "</div><div class=\"kv-val copyable\" title=\"Click to copy\">" + viewEscape(pair[1]) + "</div>";
    }).join("") + "</div>";
}

function dataTable(head, rows, css) {
    return "<table class=\"vt-table" + (css ? " " + css : "") + "\"><thead><tr>" + head.map(function (h) {
        return "<th>" + viewEscape(h) + "</th>";
    }).join("") + "</tr></thead><tbody>" + rows.map(function (row) {
        return "<tr>" + row.map(function (cell) {
            return "<td class=\"copyable\">" + viewEscape(cell) + "</td>";
        }).join("") + "</tr>";
    }).join("") + "</tbody></table>";
}

function codeBlock(lines, title) {
    return "<div class=\"vt-code\"><div class=\"vt-code-head\"><span>" + viewEscape(title) + "</span><span class=\"vt-code-acts\"><a data-calc-copy>Copy</a><a data-calc-insert>Insert into Editor</a></span></div><pre>" + viewEscape(lines.join("\n")) + "</pre></div>";
}

function field(label, key, value, wide, hint) {
    return "<label class=\"vt-field" + (wide ? " wide" : "") + "\"><span class=\"vt-label\">" + viewEscape(label) + "</span>" + (hint ? "<span class=\"vt-hint\">" + viewEscape(hint) + "</span>" : "") + "<input class=\"vt-input\" data-calc-key=\"" + key + "\" value=\"" + viewEscape(value) + "\" spellcheck=\"false\"></label>";
}

function areaField(label, key, value, hint) {
    return "<label class=\"vt-field wide\"><span class=\"vt-label\">" + viewEscape(label) + "</span>" + (hint ? "<span class=\"vt-hint\">" + viewEscape(hint) + "</span>" : "") + "<textarea class=\"vt-input vt-area\" data-calc-key=\"" + key + "\" spellcheck=\"false\">" + viewEscape(value) + "</textarea></label>";
}

function selectField(label, key, value, options) {
    return "<label class=\"vt-field\"><span class=\"vt-label\">" + viewEscape(label) + "</span><select class=\"vt-input vt-select\" data-calc-key=\"" + key + "\">" + options.map(function (o) {
        return "<option value=\"" + viewEscape(o[0]) + "\"" + (String(o[0]) === String(value) ? " selected" : "") + ">" + viewEscape(o[1]) + "</option>";
    }).join("") + "</select></label>";
}

function binaryBits(address, prefix) {
    var value = calcIpToInt(address);
    var html = "";
    for (var i = 0; i < 32; i++) {
        if (i && i % 8 === 0) {
            html += "<span class=\"bit-dot\">.</span>";
        }
        html += "<span class=\"bit " + (i < prefix ? "net" : "host") + "\">" + ((value >>> (31 - i)) & 1) + "</span>";
    }
    return html;
}

function calcForm(tool) {
    var v = calcInputs[tool];
    switch (tool) {
        case "ipv4":
            return field("Address", "address", v.address, true, "IP with prefix or mask: 10.1.2.3/20, 10.1.2.3 255.255.240.0, or just an address for its classful network");
        case "split":
            return field("Network", "network", v.network, false) + selectField("Split by", "mode", v.mode, [["prefix", "New prefix length"], ["subnets", "Number of subnets"], ["hosts", "Hosts per subnet"]]) + field("Value", "value", v.value, false);
        case "vlsm":
            return field("Address block", "base", v.base, false) + areaField("Subnets", "list", v.list, "One per line: name and hosts, for example Sales 120");
        case "summary":
            return areaField("Networks", "list", v.list, "One per line or separated by commas: 10.1.4.0/24 or 10.1.4.0 255.255.255.0");
        case "range":
            return field("First address", "from", v.from, false) + field("Last address", "to", v.to, false) + field("ACL number or name", "acl", v.acl, false);
        case "wildcard":
            return field("Prefix, mask or wildcard", "value", v.value, true, "/22, 255.255.252.0 or 0.0.3.255");
        case "ipv6":
            return field("IPv6 address", "address", v.address, true, "Any notation, with or without prefix: fe80::1, 2001:db8:acad:1::10/64");
        case "eui64":
            return field("Prefix", "prefix", v.prefix, false) + field("MAC address", "mac", v.mac, false, "0060.47CA.1B0E, 00-60-47-CA-1B-0E or 00:60:47:ca:1b:0e");
        case "convert":
            return field("Value", "value", v.value, true, "192.168.1.1, 3232235777, 0xC0A80101 or 0b1100...");
    }
    return "";
}

function calcResult(tool) {
    var v = calcInputs[tool];
    var html = "";
    switch (tool) {
        case "ipv4":
            var s = subnetInfo(v.address);
            html = kvGrid([
                ["Address", s.address], ["Network", s.network + "/" + s.prefix], ["Subnet mask", s.mask], ["Wildcard mask", s.wildcard],
                ["First host", s.firstHost], ["Last host", s.lastHost], ["Broadcast", s.broadcast], ["Usable hosts", s.hosts],
                ["Addresses", s.total], ["Class", s.ipClass], ["Scope", s.scope]
            ]);
            html += "<div class=\"vt-sub\">Binary</div><div class=\"bits\"><div class=\"bits-row\"><span class=\"bits-name\">Address</span>" + binaryBits(s.address, s.prefix) + "</div><div class=\"bits-row\"><span class=\"bits-name\">Mask</span>" + binaryBits(s.mask, s.prefix) + "</div><div class=\"bits-legend\"><span class=\"bit net\">1</span> network bits (" + s.prefix + ")<span class=\"bit host\">0</span> host bits (" + (32 - s.prefix) + ")</div></div>";
            html += codeBlock(["interface GigabitEthernet0/0", " ip address " + s.firstHost + " " + s.mask, "", "router ospf 1", " network " + s.network + " " + s.wildcard + " area 0"], "Cisco IOS");
            return html;
        case "split":
            var base = calcNetworkOf(v.network);
            var number = Number(v.value);
            if (!(number > 0) || Math.floor(number) !== number) {
                throw new Error("Value must be a whole number");
            }
            var prefix = v.mode === "prefix" ? number : v.mode === "subnets" ? base.prefix + Math.ceil(Math.log(number) / Math.LN2) : prefixForHosts(number);
            if (prefix < base.prefix || prefix > 32) {
                throw new Error("The new prefix /" + prefix + " does not fit inside /" + base.prefix);
            }
            var split = splitNetwork(v.network, prefix, 512);
            html = kvGrid([["New prefix", "/" + prefix], ["Subnet mask", split.mask], ["Subnets", split.count], ["Hosts each", split.hostsEach]]);
            html += dataTable(["#", "Network", "Host range", "Broadcast"], split.rows.map(function (r) { return [r.index, r.network, r.range, r.broadcast]; }));
            if (split.count > split.rows.length) {
                html += "<div class=\"vt-note\">Showing the first " + split.rows.length + " of " + split.count + " subnets</div>";
            }
            return html;
        case "vlsm":
            var plan = vlsmPlan(v.base, parseVlsmRequests(v.list));
            var used = plan.reduce(function (sum, r) { return sum + r.hosts + 2; }, 0);
            var total = calcBlockSize(calcNetworkOf(v.base).prefix);
            html = kvGrid([["Subnets", plan.length], ["Addresses used", used + " of " + total + " (" + Math.round(used * 100 / total) + "%)"], ["Free", total - used]]);
            html += dataTable(["Name", "Needed", "Network", "Mask", "Host range", "Broadcast", "Usable", "Spare"], plan.map(function (r) {
                return [r.name, r.needed, r.network, r.mask, r.range, r.broadcast, r.hosts, r.wasted];
            }));
            html += codeBlock(["VLSM plan for " + v.base].concat(plan.map(function (r) {
                return (r.name + "                ").substring(0, 16) + (r.network + "                  ").substring(0, 19) + r.range;
            })).map(function (line) { return "// " + line; }), "Plan as comment");
            return html;
        case "summary":
            var nets = parseNetworkList(v.list);
            var sum = summarizeRoutes(nets);
            html = kvGrid([["Summary route", sum.summary.network], ["Mask", sum.summary.mask], ["Wildcard", sum.summary.wildcard], ["Covers", sum.summary.size + " addresses"], ["Extra addresses", sum.summary.extra]]);
            if (sum.summary.extra) {
                html += "<div class=\"vt-note warn\">The summary also covers " + sum.summary.extra + " addresses that are not in the list. The exact set below covers only the listed networks.</div>";
            }
            html += "<div class=\"vt-sub\">Exact prefixes</div>" + dataTable(["Network", "Mask", "Wildcard", "Addresses"], sum.exact.map(function (r) { return [r.network, r.mask, r.wildcard, r.size]; }));
            var sn = sum.summary.network.split("/")[0];
            html += codeBlock(["ip route " + sn + " " + sum.summary.mask + " <next-hop>", "", "router ospf 1", " area 1 range " + sn + " " + sum.summary.mask, "", "interface GigabitEthernet0/0", " ip summary-address eigrp 1 " + sn + " " + sum.summary.mask], "Cisco IOS");
            return html;
        case "range":
            var blocks = rangeToCidrs(v.from, v.to);
            var acl = String(v.acl || "10").trim();
            var numbered = /^\d+$/.test(acl);
            html = kvGrid([["Blocks", blocks.length], ["Addresses", blocks.reduce(function (n, b) { return n + b.size; }, 0)]]);
            html += dataTable(["Network", "Mask", "Wildcard", "ACL entry", "Addresses"], blocks.map(function (b) { return [b.network, b.mask, b.wildcard, b.acl, b.size]; }));
            html += codeBlock(numbered ? blocks.map(function (b) { return "access-list " + acl + " permit " + b.acl; }) : ["ip access-list standard " + acl].concat(blocks.map(function (b) { return " permit " + b.acl; })), "Access list");
            return html;
        case "wildcard":
            var w = wildcardFor(v.value);
            var block = calcBlockSize(w.prefix);
            html = kvGrid([["Prefix", "/" + w.prefix], ["Subnet mask", w.mask], ["Wildcard mask", w.wildcard], ["Addresses", block], ["Usable hosts", w.prefix >= 31 ? (w.prefix === 31 ? 2 : 1) : block - 2]]);
            html += codeBlock(["access-list 10 permit 10.0.0.0 " + w.wildcard, "router ospf 1", " network 10.0.0.0 " + w.wildcard + " area 0"], "Usage");
            return html;
        case "ipv6":
            var six = ipv6Info(v.address);
            return kvGrid([["Compressed", six.compressed], ["Expanded", six.expanded], ["Prefix", "/" + six.prefix], ["Network", six.network], ["First address", six.first], ["Last address", six.last], ["Type", six.type], ["/64 subnets", six.subnets64], ["Interface ID", six.interfaceId], ["Solicited node", six.solicitedNode]]);
        case "eui64":
            var e = eui64(v.prefix, v.mac);
            return kvGrid([["Interface ID", e.interfaceId], ["Global address", e.address], ["Expanded", e.expanded], ["Link local", e.linkLocal], ["U/L bit", e.flippedBit]]) +
                codeBlock(["interface GigabitEthernet0/0", " ipv6 address " + calcInputs.eui64.prefix.replace(/\s+/g, "") + " eui-64"], "Cisco IOS");
        case "convert":
            var c = convertNumber(v.value);
            return kvGrid([["Dotted decimal", c.ip], ["Decimal", c.decimal], ["Hexadecimal", c.hex], ["Hex octets", c.hexOctets], ["Binary", c.binary], ["Significant bits", c.bits]]);
    }
    return html;
}

function renderCalculator(tab) {
    var tool = tab.tool;
    var info = calcTools.filter(function (t) { return t.id === tool; })[0];
    tab.root.innerHTML = "<div class=\"calc-layout\"><nav class=\"calc-nav\">" + calcTools.map(function (t) {
        return "<div class=\"calc-nav-item" + (t.id === tool ? " active" : "") + "\" data-calc-tool=\"" + t.id + "\">" + viewEscape(t.title) + "</div>";
    }).join("") + "</nav><div class=\"calc-page\"><div class=\"calc-inner\"><h1 class=\"vt-title\">" + viewEscape(info.title) + "</h1><div class=\"vt-desc\">" + viewEscape(info.info) + "</div><div class=\"vt-form\">" + calcForm(tool) + "</div><div class=\"calc-result\"></div></div></div></div>";
    refreshCalcResult(tab);
}

function refreshCalcResult(tab) {
    var box = tab.root.querySelector(".calc-result");
    if (!box) {
        return;
    }
    try {
        box.innerHTML = calcResult(tab.tool);
    } catch (error) {
        box.innerHTML = "<div class=\"vt-error\">" + icon("error") + "<span>" + viewEscape(error.message) + "</span></div>";
    }
}

function onViewInput(event) {
    var target = event.target;
    var key = target.getAttribute && target.getAttribute("data-calc-key");
    var tabRoot = target.closest && target.closest(".vt-calc");
    if (!key || !tabRoot) {
        return false;
    }
    var tab = viewTabs["v-calc"];
    calcInputs[tab.tool][key] = target.value;
    refreshCalcResult(tab);
    return true;
}

function onViewClick(event) {
    var target = event.target;
    var root = target.closest(".vt");
    if (!root) {
        return false;
    }
    var toolItem = target.closest("[data-calc-tool]");
    if (toolItem) {
        var tab = viewTabs["v-calc"];
        tab.tool = toolItem.getAttribute("data-calc-tool");
        renderCalculator(tab);
        var first = tab.root.querySelector(".vt-input");
        if (first) {
            first.focus();
        }
        return true;
    }
    if (target.closest("[data-calc-copy]") || target.closest("[data-calc-insert]")) {
        var text = target.closest(".vt-code").querySelector("pre").textContent;
        if (target.closest("[data-calc-copy]")) {
            copyText(text);
        } else {
            insertIntoEditor(text + "\n");
        }
        return true;
    }
    var copy = target.closest(".copyable");
    if (copy && !String(window.getSelection ? window.getSelection() : "")) {
        copyText(copy.textContent);
        return true;
    }
    var action = target.closest("[data-view-action]");
    if (action) {
        runViewAction(action.getAttribute("data-view-action"), action);
        return true;
    }
    return false;
}

function runViewAction(action, el) {
    if (action === "reach-run") {
        runReachability();
    } else if (action === "reach-csv") {
        var tab = viewTabs["v-reach"];
        var rows = [["source", "target", "ip", "state", "percent", "avg_ms"]].concat(tab.data.rows.map(function (r) {
            return [r.source, r.target, r.ip, r.state, r.percent === null ? "" : r.percent, r.rtt ? r.rtt.avg : ""];
        }));
        copyText(rows.map(function (r) { return r.join(","); }).join("\n"));
    } else if (action === "diff-hunks") {
        var diff = viewTabs[el.getAttribute("data-tab")];
        diff.full = !diff.full;
        renderDiff(diff);
    } else if (action === "diff-refresh") {
        var d = viewTabs[el.getAttribute("data-tab")];
        compareSnapshotsUi(d.data.from, d.data.to === "current" ? "" : d.data.to);
    }
}

function deviceOfIp(ip) {
    var found = "";
    ((app.devices && app.devices.devices) || []).forEach(function (d) {
        (d.ports || []).forEach(function (p) {
            if (!found && String(p.ip).split("/")[0] === ip) {
                found = d.name;
            }
        });
    });
    return found;
}

function runReachability() {
    if (!callEngine("editorReachability")) {
        notify("warning", "Reachability tests run inside Packet Tracer");
        return;
    }
    var tab = viewTabs["v-reach"];
    if (tab) {
        tab.running = true;
        renderReachability(tab);
    }
    setRunning(true, "Pinging");
}

function receiveReachability(report) {
    report.time = timeNow();
    var id = openViewTab("reach", "", "Reachability", report);
    viewTabs[id].running = false;
    renderReachability(viewTabs[id]);
    setRunning(false);
    if (typeof terminalReachability === "function") {
        terminalReachability(report);
    }
}

function reachCellClass(row) {
    return row ? "rc rc-" + row.state : "rc rc-self";
}

function renderReachability(tab) {
    var r = tab.data || { rows: [], sources: [], targets: [], ok: 0, partial: 0, failed: 0, unknown: 0, total: 0 };
    var targets = r.targets && r.targets.length ? r.targets : [];
    var byKey = {};
    r.rows.forEach(function (row) {
        byKey[row.source + "|" + row.ip] = row;
        byKey[row.source + "|" + row.target] = row;
        if (targets.indexOf(row.target) === -1) {
            targets.push(row.target);
        }
    });
    var sources = r.sources && r.sources.length ? r.sources : r.rows.map(function (row) { return row.source; }).filter(function (s, i, list) { return list.indexOf(s) === i; });
    var head = "<div class=\"vt-header\"><div><h1 class=\"vt-title\">Reachability</h1><div class=\"vt-desc\">" + (tab.running ? "Pinging every address from every router and switch..." : r.total + " pings from " + sources.length + " devices to " + targets.length + " addresses" + (r.time ? ", " + viewEscape(r.time) : "")) + "</div></div><div class=\"vt-actions\"><button class=\"btn primary\" data-view-action=\"reach-run\"" + (tab.running ? " disabled" : "") + ">" + icon("refresh") + "Run Again</button><button class=\"btn\" data-view-action=\"reach-csv\">Copy as CSV</button></div></div>";
    var chips = "<div class=\"chips\"><span class=\"chip ok\"><i></i>" + r.ok + " reachable</span><span class=\"chip partial\"><i></i>" + r.partial + " partial</span><span class=\"chip failed\"><i></i>" + r.failed + " failed</span><span class=\"chip unknown\"><i></i>" + r.unknown + " unknown</span></div>";
    var grid = "<div class=\"matrix-wrap\"><table class=\"matrix\"><thead><tr><th class=\"corner\">source \\ target</th>" + targets.map(function (t) {
        var owner = deviceOfIp(t);
        return "<th><span class=\"mx-ip\">" + viewEscape(t) + "</span>" + (owner ? "<span class=\"mx-owner\">" + viewEscape(owner) + "</span>" : "") + "</th>";
    }).join("") + "</tr></thead><tbody>" + sources.map(function (s) {
        return "<tr><th class=\"mx-src\">" + viewEscape(s) + "</th>" + targets.map(function (t) {
            var row = byKey[s + "|" + t];
            var label = !row ? "" : row.state === "ok" || row.state === "partial" ? row.percent + "%" : row.state === "failed" ? "0%" : row.state === "sent" ? "sent" : "?";
            var tip = row ? row.source + " -> " + row.target + ": " + row.state + (row.rtt ? ", avg " + row.rtt.avg + " ms" : "") + (row.output ? "\n\n" + row.output : "") : "own address";
            return "<td class=\"" + reachCellClass(row) + "\" title=\"" + viewEscape(tip) + "\">" + viewEscape(label) + (row && row.rtt ? "<small>" + row.rtt.avg + " ms</small>" : "") + "</td>";
        }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>";
    var problems = r.rows.filter(function (row) { return row.state === "failed" || row.state === "partial" || row.state === "error"; });
    var list = problems.length ? "<div class=\"vt-sub\">Problems</div>" + dataTable(["Source", "Target", "Address", "State", "Detail"], problems.map(function (row) {
        return [row.source, row.target, row.ip, row.state, (row.output || "").split("\n").filter(function (l) { return /Success rate|timed out|Unreachable|Invalid|%/.test(l); }).slice(0, 1).join(" ") || row.state];
    })) : r.rows.length ? "<div class=\"vt-note ok\">" + icon("checks") + "Every tested address answered.</div>" : "";
    tab.root.innerHTML = "<div class=\"vt-page\">" + head + chips + (r.rows.length ? grid : "<div class=\"vt-note\">No results yet.</div>") + list + "</div>";
}

function compareSnapshotsUi(from, to) {
    if (!callEngine("editorSnapshot", "diff", from, to || "")) {
        notify("warning", "Snapshots need Packet Tracer");
    }
}

function receiveSnapshotDiff(result) {
    var key = (result.from + "-" + result.to).replace(/[^\w-]/g, "_");
    var id = openViewTab("diff", key, result.from + " \u2194 " + result.to, result);
    renderDiff(viewTabs[id]);
}

function diffHunks(lines, context) {
    var keep = lines.map(function () { return false; });
    lines.forEach(function (line, i) {
        if (line.op !== " ") {
            for (var k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) {
                keep[k] = true;
            }
        }
    });
    return keep;
}

function renderConfigDiff(change, full) {
    var oldNo = 0;
    var newNo = 0;
    var keep = full ? change.diff.map(function () { return true; }) : diffHunks(change.diff, 3);
    var rows = [];
    var skipped = 0;
    change.diff.forEach(function (line, i) {
        if (line.op !== "+") {
            oldNo++;
        }
        if (line.op !== "-") {
            newNo++;
        }
        if (!keep[i]) {
            skipped++;
            return;
        }
        if (skipped) {
            rows.push("<tr class=\"dl-skip\"><td></td><td></td><td></td><td>" + skipped + " unchanged lines</td></tr>");
            skipped = 0;
        }
        var css = line.op === "+" ? "dl-add" : line.op === "-" ? "dl-del" : "";
        rows.push("<tr class=\"" + css + "\"><td class=\"dl-no\">" + (line.op === "+" ? "" : oldNo) + "</td><td class=\"dl-no\">" + (line.op === "-" ? "" : newNo) + "</td><td class=\"dl-op\">" + (line.op === " " ? "" : line.op) + "</td><td class=\"dl-text\">" + viewEscape(line.text) + "</td></tr>");
    });
    if (skipped) {
        rows.push("<tr class=\"dl-skip\"><td></td><td></td><td></td><td>" + skipped + " unchanged lines</td></tr>");
    }
    return "<div class=\"diff-file\"><div class=\"diff-file-head\">" + icon("devices") + "<b>" + viewEscape(change.device) + "</b><span class=\"diff-count add\">+" + change.added.length + "</span><span class=\"diff-count del\">-" + change.removed.length + "</span><span class=\"diff-kind\">running-config</span></div><table class=\"diff-lines\">" + rows.join("") + "</table></div>";
}

function renderDiff(tab) {
    var d = tab.data;
    var section = function (title, count, body) {
        return count ? "<div class=\"vt-sub\">" + viewEscape(title) + " <span class=\"badge\">" + count + "</span></div>" + body : "";
    };
    var list = function (items, css, sign) {
        return "<div class=\"diff-list\">" + items.map(function (item) {
            return "<div class=\"" + css + "\"><span class=\"dl-op\">" + sign + "</span>" + viewEscape(item) + "</div>";
        }).join("") + "</div>";
    };
    var html = "<div class=\"vt-page\"><div class=\"vt-header\"><div><h1 class=\"vt-title\">" + viewEscape(d.from) + " \u2194 " + viewEscape(d.to) + "</h1><div class=\"vt-desc\">" + (d.changes ? d.changes + " changes" : "No changes") + "</div></div><div class=\"vt-actions\">" + (d.to === "current" ? "<button class=\"btn\" data-view-action=\"diff-refresh\" data-tab=\"" + tab.id + "\">" + icon("refresh") + "Compare Again</button>" : "") + "<button class=\"btn\" data-view-action=\"diff-hunks\" data-tab=\"" + tab.id + "\">" + (tab.full ? "Show Changes Only" : "Show Full Configs") + "</button></div></div>";
    html += "<div class=\"chips\">" + [["Devices", d.devicesAdded.length + d.devicesRemoved.length], ["Links", d.linksAdded.length + d.linksRemoved.length], ["Addresses", d.addressChanges.length], ["Ports", d.portChanges.length], ["Power", d.powerChanges.length], ["Configs", d.configChanges.length]].map(function (c) {
        return "<span class=\"chip" + (c[1] ? " changed" : "") + "\"><i></i>" + c[1] + " " + c[0] + "</span>";
    }).join("") + "</div>";
    if (!d.changes) {
        html += "<div class=\"vt-note ok\">" + icon("checks") + "The network is the same in both states.</div>";
    }
    html += section("Devices", d.devicesAdded.length + d.devicesRemoved.length, list(d.devicesAdded, "dl-add", "+") + list(d.devicesRemoved, "dl-del", "-"));
    html += section("Links", d.linksAdded.length + d.linksRemoved.length, list(d.linksAdded, "dl-add", "+") + list(d.linksRemoved, "dl-del", "-"));
    html += section("Addresses", d.addressChanges.length, dataTable(["Device", "Port", "Before", "After"], d.addressChanges.map(function (c) { return [c.device, c.port, c.before || "none", c.after || "none"]; })));
    html += section("Port state", d.portChanges.length, dataTable(["Device", "Port", "Before", "After"], d.portChanges.map(function (c) { return [c.device, c.port, c.before, c.after]; })));
    html += section("Power", d.powerChanges.length, dataTable(["Device", "Before", "After"], d.powerChanges.map(function (c) { return [c.device, c.before ? "on" : "off", c.after ? "on" : "off"]; })));
    html += section("Configuration", d.configChanges.length, d.configChanges.map(function (c) { return renderConfigDiff(c, tab.full); }).join(""));
    tab.root.innerHTML = html + "</div>";
}

function renderSnapshots() {
    var box = byId("snapshot-list");
    if (!box) {
        return;
    }
    var list = app.snapshots || [];
    if (!list.length) {
        box.innerHTML = "<div class=\"tree-hint\">No snapshots. Take one before a change, then compare to see exactly what the change did.</div>";
        return;
    }
    box.innerHTML = list.map(function (s) {
        var when = String(s.time || "").replace("T", " ").replace(/\.\d+Z$/, "").substring(11, 19);
        return "<div class=\"tree-row snap-row\" data-snap=\"" + viewEscape(s.name) + "\">" + icon("snapshot") + "<span class=\"row-name\">" + viewEscape(s.name) + "</span><span class=\"snap-meta\">" + viewEscape(when) + " \u00b7 " + s.devices + " dev \u00b7 " + s.links + " links</span><span class=\"row-acts\"><span data-snap-compare title=\"Compare with Current\">" + icon("diff") + "</span><span data-snap-delete title=\"Delete Snapshot\">" + icon("trash") + "</span></span></div>";
    }).join("");
}

function takeSnapshotUi() {
    showDialog({ title: "Snapshot name", message: "Save the current devices, links, addresses and configs under this name.", input: "snapshot-" + ((app.snapshots || []).length + 1), buttons: ["Take Snapshot", "Cancel"] }, function (choice, value) {
        if (choice === 0 && value && value.trim()) {
            if (!callEngine("editorSnapshot", "take", value.trim())) {
                notify("warning", "Snapshots need Packet Tracer");
            }
        }
    });
}

function compareTwoSnapshotsUi() {
    var names = (app.snapshots || []).map(function (s) { return s.name; });
    if (!names.length) {
        notify("info", "Take a snapshot first");
        return;
    }
    showDialog({ title: "Compare snapshots", message: "Write two snapshot names separated by a space, or one name to compare with the current network. Snapshots: " + names.join(", "), input: names.slice(-2).join(" "), buttons: ["Compare", "Cancel"] }, function (choice, value) {
        if (choice !== 0 || !value) {
            return;
        }
        var parts = value.trim().split(/\s+/);
        compareSnapshotsUi(parts[0], parts[1] || "");
    });
}

function onSnapshotClick(event) {
    var row = event.target.closest("[data-snap]");
    if (!row) {
        return false;
    }
    var name = row.getAttribute("data-snap");
    if (event.target.closest("[data-snap-delete]")) {
        callEngine("editorSnapshot", "delete", name);
    } else {
        compareSnapshotsUi(name, "");
    }
    return true;
}
