"use strict";

const typeByModel = {};

function createPort(name, owner) {
    const port = {
        name,
        ip: "0.0.0.0",
        mask: "0.0.0.0",
        gateway: "",
        dns: "",
        ipv6: [],
        link: null,
        power: true,
        calls: [],
        getName: () => name,
        getIpAddress: () => port.ip,
        getSubnetMask: () => port.mask,
        getMacAddress: () => "0001.0001.0001",
        isPortUp: () => !!port.link && port.power,
        getPower: () => port.power,
        isDhcpClientOn: () => !!port.dhcpClient,
        isProtocolUp: () => !!port.link,
        getRemotePortName: () => (port.link ? port.link.other(port).name : ""),
        getDescription: () => port.description || "",
        getBandwidth: () => 100000,
        isFullDuplex: () => true,
        getLink: () => port.link,
        getOwnerDevice: () => owner,
        setIpSubnetMask: (ip, mask) => { port.ip = ip; port.mask = mask; },
        setDefaultGateway: (gw) => { port.gateway = gw; },
        setDnsServerIp: (dns) => { port.dns = dns; },
        setIpv6Enabled: (v) => { port.ipv6Enabled = v; },
        setIpv6AddressAutoConfig: (v) => { port.slaac = v; },
        setIpv6LinkLocal: (v) => { port.linkLocal = v; },
        addIpv6Address: (ip, prefix, type, dup) => { port.ipv6.push({ ip, prefix, type, dup }); return true; },
        setv6DefaultGateway: (v) => { port.gateway6 = v; },
        setv6ServerIp: (v) => { port.dns6 = v; },
        removeAllIpv6Addresses: () => { port.ipv6 = []; },
        getUnicastIpv6Address: () => (port.ipv6[0] ? port.ipv6[0].ip : ""),
        setInboundFirewallService: (v) => { port.firewall = v; },
        setPower: (v) => { port.power = v; },
        setDescription: (v) => { port.description = v; },
        setBandwidthAutoNegotiate: (v) => { port.bwAuto = v; },
        setBandwidth: (v) => { port.bw = v; },
        setDuplexAutoNegotiate: (v) => { port.dxAuto = v; },
        setFullDuplex: (v) => { port.full = v; },
        setMacAddress: (v) => { port.mac = v; },
        setClockRate: (v) => { port.clock = v; }
    };
    return port;
}

function portNamesFor(type) {
    if (type === 0) {
        return ["GigabitEthernet0/0", "GigabitEthernet0/1", "GigabitEthernet0/2", "Vlan1"];
    }
    if (type === 1 || type === 16 || type === 17) {
        const list = [];
        for (let i = 1; i <= 24; i++) list.push("FastEthernet0/" + i);
        list.push("GigabitEthernet0/1", "GigabitEthernet0/2", "Vlan1");
        return list;
    }
    if (type === 7 || type === 11) {
        return ["Port 0", "Port 1", "Wireless0"];
    }
    return ["FastEthernet0", "Wireless0"];
}

function createProcessStore() {
    const pools = [];
    const dnsRecords = [];
    const ftpUsers = [];
    const emailUsers = {};
    const pages = {};
    const state = { pools, dnsRecords, ftpUsers, emailUsers, pages, enabled: {} };

    const dhcp = {
        setEnable: (v) => { state.enabled.dhcp = v; },
        addNewPool: (...args) => { pools.push(args); },
        removePool: (name) => { const i = pools.findIndex((p) => p[0] === name); if (i >= 0) pools.splice(i, 1); },
        addExcludedAddress: (a, b) => { state.excluded = [a, b]; },
        getPoolCount: () => pools.length,
        getPoolAt: (i) => ({
            getDhcpPoolName: () => pools[i][0],
            getDefaultRouter: () => pools[i][1],
            getDnsServerIp: () => pools[i][2],
            getStartIp: () => pools[i][3],
            getEndIp: () => pools[i][3],
            getSubnetMask: () => pools[i][4],
            getMaxUsers: () => pools[i][5]
        })
    };

    const wpa = { setKey: (k) => { state.wpaKey = k; } };
    const wep = { setKey: (k) => { state.wepKey = k; } };
    const macs = [];

    const processes = {
        DhcpServerMain: { getDhcpServerProcessByPortName: () => dhcp },
        DnsServer: {
            setEnable: (v) => { state.enabled.dns = v; },
            addARecordToNameServerDb: (h, ip) => { dnsRecords.push(["A", h, ip]); return true; },
            addCNAMEToNameServerDb: (a, h) => { dnsRecords.push(["CNAME", a, h]); return true; },
            addNSRecordToNameServerDb: (d, s) => { dnsRecords.push(["NS", d, s]); return true; },
            removeARecordFromNameServerDb: (h) => { const i = dnsRecords.findIndex((r) => r[1] === h); if (i >= 0) dnsRecords.splice(i, 1); return true; },
            getSizeOfNameServerDb: () => dnsRecords.length
        },
        HttpServer: {
            setEnable: (v) => { state.enabled.http = v; },
            setPageContents: (f, h) => { pages[f] = h; },
            getPage: (f) => pages[f] || ""
        },
        HttpsServer: { setEnable: (v) => { state.enabled.https = v; } },
        FtpServer: {
            getFtpUserAccountManager: () => ({
                isExistingUser: (u) => ftpUsers.some((x) => x[0] === u),
                removeFtpUser: (u) => { const i = ftpUsers.findIndex((x) => x[0] === u); if (i >= 0) ftpUsers.splice(i, 1); },
                addFtpUser: (u, p, perm) => { ftpUsers.push([u, p, perm]); },
                getUsersCount: () => ftpUsers.length,
                getUsernameAt: (i) => ftpUsers[i][0],
                getPermissionAt: (i) => ftpUsers[i][2]
            })
        },
        EmailServer: {
            addUser: (u, p) => { emailUsers[u] = p; return true; },
            deleteUser: (u) => { delete emailUsers[u]; return true; },
            changePassword: (u, p) => { emailUsers[u] = p; },
            updateAllAccounts: (s) => { s.split(";").filter(Boolean).forEach((e) => { const [u, p] = e.split(":"); emailUsers[u] = p; }); }
        },
        TftpServer: { setEnabled: (v) => { state.enabled.tftp = v; } },
        SyslogServer: { setEnable: (v) => { state.enabled.syslog = v; }, clearAllSysLogEntries: () => { state.syslogCleared = true; } },
        RadiusServer: { setPort: (p) => { state.radiusPort = p; } },
        WirelessServer: {
            setSsid: (s) => { state.ssid = s; },
            getSsid: () => state.ssid,
            setNetworkType: (t) => { state.netType = t; },
            setAuthenType: (t) => { state.auth = t; },
            setEncryptType: (t) => { state.encrypt = t; },
            getWpaProcess: () => wpa,
            getWepProcess: () => wep,
            setSsidBrdCastEnabled: (v) => { state.broadcast = v; },
            removeAllMacEntries: () => { macs.length = 0; },
            addToMacFilterAddrList: (m) => { macs.push(m); },
            setAllowAccess: (v) => { state.allow = v; },
            setMacFilterEnabled: (v) => { state.macFilter = v; }
        }
    };
    state.macs = macs;
    return { processes, state };
}

function createDevice(world, name, model, type, x, y) {
    const device = {
        name,
        model,
        type,
        x,
        y,
        power: true,
        commands: [],
        hostCommands: [],
        modules: {},
        vars: {},
        dhcp: false,
        booted: false,
        getName: () => device.name,
        setName: (n) => { delete world.devices[device.name]; device.name = n; world.devices[n] = device; },
        getModel: () => model,
        getType: () => type,
        getPower: () => device.power,
        setPower: (v) => { device.power = v; },
        getXCoordinate: () => device.x,
        getYCoordinate: () => device.y,
        getCenterXCoordinate: () => device.x + 20,
        getCenterYCoordinate: () => device.y + 20,
        moveToLocation: (nx, ny) => { device.x = nx; device.y = ny; return true; },
        moveToLocationCentered: (nx, ny) => { device.x = nx - 20; device.y = ny - 20; return true; },
        moveToLocInPhysicalWS: () => true,
        moveByInPhysicalWS: () => true,
        getSerialNumber: () => "SN-" + name,
        getPortCount: () => device.ports.length,
        getPortAt: (i) => device.ports[i],
        getPort: (n) => device.ports.find((p) => p.name === n) || null,
        addModule: (slot, t, m) => {
            if (device.power) return false;
            device.modules[slot] = m;
            if (/2T$/.test(m)) {
                ["0", "1"].forEach((n) => device.ports.push(createPort("Serial" + slot + "/" + n, device)));
            }
            return true;
        },
        removeModule: (slot) => {
            if (device.power) return false;
            delete device.modules[slot];
            device.ports = device.ports.filter((p) => !p.name.startsWith("Serial" + slot + "/"));
            return true;
        },
        getSupportedModule: () => ["HWIC-2T", "NIM-2T"],
        addCustomVar: (k, v) => { device.vars[k] = v; },
        hasCustomVar: (k) => k in device.vars,
        getCustomVarStr: (k) => device.vars[k],
        removeCustomVar: (k) => { const had = k in device.vars; delete device.vars[k]; return had; },
        getCustomVarsCount: () => Object.keys(device.vars).length,
        getCustomVarNameAt: (i) => Object.keys(device.vars)[i],
        getCustomVarValueStrAt: (i) => Object.values(device.vars)[i],
        setCustomLogicalImage: (p) => { device.logicalImage = p; },
        setCustomPhysicalImage: (p) => { device.physicalImage = p; },
        setTime: (...a) => { device.time = a; },
        getProcess: (n) => {
            if ([7, 9, 11].includes(type)) return device.store.processes[n] || null;
            return device.iosProcesses ? device.iosProcesses[n] || null : null;
        }
    };
    device.ports = portNamesFor(type).map((p) => createPort(p, device));
    device.store = createProcessStore();

    if ([1, 16, 17].includes(type)) {
        device.ports.forEach((port) => {
            if (port.name.startsWith("Vlan")) return;
            const sec = { enabled: false, max: 1, violations: 0 };
            Object.assign(port, {
                access: true, accessVlan: 1, nativeVlan: 1, voice: 0, cdp: true,
                isAccessPort: () => port.access,
                getAccessVlan: () => port.accessVlan,
                getNativeVlanId: () => port.nativeVlan,
                getVoipVlanId: () => port.voice,
                isNonegotiate: () => false,
                isCdpEnable: () => port.cdp,
                setCdpEnable: (v) => { port.cdp = v; },
                getAdminOpMode: () => 1,
                getChannel: () => 0,
                getPortSecurity: () => ({
                    isEnabled: () => sec.enabled, getMaxMacNumber: () => sec.max, getTotalMac: () => 0,
                    getSecureMacCount: () => 0, getViolationCount: () => sec.violations, isStickyOn: () => false
                }),
                security: sec
            });
        });
        const vlans = [[1, "default"], [1002, "fddi-default"]];
        const macs = [];
        device.iosProcesses = {
            VlanManager: {
                getVlanCount: () => vlans.length,
                getVlanAt: (i) => ({ getVlanNumber: () => vlans[i][0], getName: () => vlans[i][1], isDefault: () => vlans[i][0] === 1 })
            },
            StpMain: {
                getStpProcess: (v) => (v === 1 ? {
                    isRootBridge: () => device.name === "S1", getRootBridgeId: () => "32769.0001.0001.0001",
                    getSwitchId: () => "32769.0001.0001.0001", getSwitchPriority: () => 32769,
                    getRootPort: () => (device.name === "S1" ? null : { getName: () => "GigabitEthernet0/1" }), getRootPathCost: () => 4
                } : null)
            },
            Vtp: { getDomainName: () => "LAB", getMode: () => 0, getVersion: () => 2, getConfigRevision: () => 3 },
            MacSwitch: {
                addStaticMac: (m, v, p) => { macs.push([m, v, p]); return true; },
                removeStaticMac: (m) => { const i = macs.findIndex((x) => x[0] === m); if (i < 0) return false; macs.splice(i, 1); return true; }
            }
        };
        device.vlans = vlans;
        device.macs = macs;
    }
    if (type === 0) {
        device.iosProcesses = {
            OspfMain: {
                getOspfProcessCount: () => 1,
                getOspfProcessAt: () => ({ getProcessId: () => 1, getRouterId: () => "1.1.1.1", getAreaCount: () => 1, getConfNetworkCount: () => 2, getAdminDistance: () => 110 })
            },
            EigrpMain: { getEigrpProcessCount: () => 1, getEigrpProcessAt: () => ({ getASNumber: () => 100 }) }
        };
    }

    if ([0, 1, 16, 17].includes(type)) {
        device.skipBoot = () => { device.booted = true; };
        device.getHostName = () => device.hostname || (type === 0 ? "Router" : "Switch");
        device.enterCommand = (cmd, mode) => {
            device.commands.push({ cmd, mode });
            if (world.rejectCommands.some((re) => re.test(cmd))) return [2, ""];
            if (world.respond) {
                const out = world.respond(device.getName(), cmd, mode);
                if (out !== undefined) return [0, out];
            }
            return [0, ""];
        };
        device.lineCommands = [];
        const line = mockLine(world, device, "R#", (c) => device.lineCommands.push(c));
        device.getCommandLine = () => line;
    }
    if ([8, 9, 18].includes(type)) {
        device.setDhcpFlag = (v) => { device.dhcp = v; };
        device.getDhcpFlag = () => device.dhcp;
        const prompt = mockLine(world, device, "C:\\>", (c) => device.hostCommands.push(c));
        device.getCommandPrompt = () => prompt;
    }
    return device;
}

function mockLine(world, device, promptText, record) {
    const listeners = [];
    const emit = (name, args) => listeners.filter((l) => l.name === name).forEach((l) => l.fn.call(l.ctx, { className: "TerminalLine", eventName: name }, args));
    return {
        listeners,
        getPrompt: () => promptText,
        getMode: () => "enable",
        registerEvent: (name, ctx, fn) => { listeners.push({ name, ctx, fn }); },
        unregisterEvent: (name, ctx, fn) => {
            const i = listeners.findIndex((l) => l.name === name && l.fn === fn);
            if (i >= 0) listeners.splice(i, 1);
        },
        enterCommand: (c) => {
            record(c);
            if (!world.lineQueue) return;
            world.lineQueue.push(() => {
                const out = world.respond ? world.respond(device.getName(), c, "line") : undefined;
                if (out) emit("outputWritten", { newOutput: String(out), isDebug: false, cursorPositionFromEnd: 0 });
                emit("commandEnded", { inputCommand: c, status: 0 });
            });
        }
    };
}

function createWorld(allDeviceTypes) {
    const world = {
        devices: {},
        order: [],
        links: [],
        lineQueue: [],
        flushLines() {
            let guard = 0;
            while (this.lineQueue.length && guard++ < 100000) this.lineQueue.shift()();
        },
        canvas: {},
        nextId: 1,
        messages: [],
        rejectCommands: [],
        events: [],
        simulation: { mode: false, steps: 0 },
        pdus: [],
        remote: {},
        files: []
    };

    function uuid(kind, data) {
        const id = "{" + kind + "-" + world.nextId++ + "}";
        world.canvas[id] = Object.assign({ kind }, data);
        return id;
    }

    function idsOf(kind) {
        return Object.keys(world.canvas).filter((id) => world.canvas[id].kind === kind);
    }

    const logical = {
        addDevice: (type, model, x, y) => {
            let base = model + "-" + world.order.length;
            const device = createDevice(world, base, model, type, x, y);
            world.devices[base] = device;
            world.order.push(device);
            return base;
        },
        removeDevice: (name) => {
            const d = world.devices[name];
            if (!d) return false;
            delete world.devices[name];
            world.order = world.order.filter((x) => x !== d);
            world.links = world.links.filter((l) => l.a.owner !== d && l.b.owner !== d);
            return true;
        },
        createLink: (d1, p1, d2, p2, type) => {
            const a = world.devices[d1] && world.devices[d1].getPort(p1);
            const b = world.devices[d2] && world.devices[d2].getPort(p2);
            if (!a || !b || a.link || b.link || !Number.isInteger(type)) return false;
            const link = {
                a, b, type,
                other: (p) => (p === a ? b : a),
                getConnectionType: () => type,
                getPort1: () => a,
                getPort2: () => b
            };
            a.owner = world.devices[d1];
            b.owner = world.devices[d2];
            a.link = link;
            b.link = link;
            world.links.push(link);
            return true;
        },
        deleteLink: (d, p) => {
            const port = world.devices[d] && world.devices[d].getPort(p);
            if (!port || !port.link) return false;
            const link = port.link;
            link.a.link = null;
            link.b.link = null;
            world.links = world.links.filter((l) => l !== link);
            return true;
        },
        autoConnectDevices: (d1, d2) => { world.autoConnected = [d1, d2]; },
        getUnusedLayer: () => 7,
        addNote: (x, y, layer, text) => uuid("note", { x, y, layer, text }),
        changeNoteText: (id, text) => { if (!world.canvas[id]) return false; world.canvas[id].text = text; return true; },
        getCanvasNoteText: (id) => world.canvas[id].text,
        getCanvasNoteIds: () => idsOf("note"),
        getCanvasLineIds: () => idsOf("line"),
        getCanvasRectIds: () => idsOf("rect"),
        getCanvasEllipseIds: () => idsOf("circle"),
        getCanvasPolygonIds: () => idsOf("polygon"),
        getCanvasItemX: (id) => world.canvas[id].x,
        getCanvasItemY: (id) => world.canvas[id].y,
        setCanvasItemX: (id, x) => { world.canvas[id].x = x; },
        setCanvasItemY: (id, y) => { world.canvas[id].y = y; },
        moveCanvasItemBy: (id, dx, dy) => { world.canvas[id].x = (world.canvas[id].x || 0) + dx; world.canvas[id].y = (world.canvas[id].y || 0) + dy; },
        drawLine: (x1, y1, x2, y2, layer, w, r, g, b) => {
            [x1, y1, x2, y2, w, r, g, b].forEach((v) => { if (!Number.isInteger(v)) throw new Error("drawLine expects integers, got " + v); });
            return uuid("line", { x: x1, y: y1, x1, y1, x2, y2, layer, w, rgb: [r, g, b] });
        },
        drawCircle: (cx, cy, layer, radius, r, g, b) => {
            [cx, cy, radius, r, g, b].forEach((v) => { if (!Number.isInteger(v)) throw new Error("drawCircle expects integers, got " + v); });
            return uuid("circle", { x: cx, y: cy, layer, radius, rgb: [r, g, b] });
        },
        getLineItemData: (id) => { const l = world.canvas[id]; return [String(l.x1), String(l.y1), String(l.x2), String(l.y2), l.rgb.join(",")]; },
        getRectItemData: () => ["0", "0", "10", "10", "255,0,0", "", "zone"],
        getEllipseItemData: () => ["1", "2"],
        getPolygonItemData: () => ["3", "4"],
        removeCanvasItem: (id) => { const had = !!world.canvas[id]; delete world.canvas[id]; return had; },
        clearLayer: (layer) => { Object.keys(world.canvas).forEach((id) => { if (world.canvas[id].layer === layer) delete world.canvas[id]; }); return true; },
        addTextPopup: (x, y, layer, w, text) => uuid("popup", { x, y, layer, w, text }),
        removeTextPopup: (id) => { const had = !!world.canvas[id]; delete world.canvas[id]; return had; },
        centerOn: (x, y) => { world.center = [x, y]; },
        centerOnComponentByName: (n) => { world.center = n; },
        getCurrentZoom: () => 100,
        addRemoteNetwork: () => { const n = "Remote" + Object.keys(world.remote).length; world.remote[n] = [0, 0]; return n; },
        removeRemoteNetwork: (n) => { const had = n in world.remote; delete world.remote[n]; return had; },
        moveRemoteNetwork: (n, x, y) => { if (!(n in world.remote)) return false; world.remote[n] = [x, y]; return true; },
        registerEvent: (name, ctx, fn) => { world.events.push({ name, ctx, fn }); },
        unregisterEvent: (name, ctx, fn) => { world.events = world.events.filter((e) => !(e.name === name && e.fn === fn)); }
    };

    const workspace = {
        getLogicalWorkspace: () => logical,
        zoomIn: () => { world.zoom = "in"; },
        zoomOut: () => { world.zoom = "out"; },
        zoomReset: () => { world.zoom = "reset"; },
        setLogicalBackgroundPath: (p, t) => { world.background = [p, t]; },
        devicesAt: () => world.order.map((d) => d.name)
    };

    const net = {
        getDevice: (n) => world.devices[n] || null,
        getDeviceCount: () => world.order.length,
        getDeviceAt: (i) => world.order[i],
        getLinkCount: () => world.links.length,
        getLinkAt: (i) => world.links[i]
    };

    const app = {
        getActiveWorkspace: () => workspace,
        showMessageBox: (...args) => { world.messages.push(args); },
        getVersion: () => "8.2.2.0400",
        fileNew: (c) => { world.files.push(["new", c]); return true; },
        fileSave: () => { world.files.push(["save"]); return true; },
        fileSaveAsNoPrompt: (p, a) => { world.files.push(["saveAs", p, a]); },
        fileOpen: (p) => { world.files.push(["open", p]); return 0; },
        getDefaultFileSaveLocation: () => "C:/Users/lab/Documents",
        setClipboardText: (v) => { world.clipboard = v; },
        getClipboardText: () => world.clipboard,
        getSimulationPanel: () => ({
            play: () => { world.simulation.playing = true; },
            setFilter: (p, v) => { world.simulation.filter = [p, v]; },
            setAllFilters: () => { world.simulation.filter = "all"; }
        }),
        getUserCreatedPDU: () => ({
            addSimplePdu: (s, d) => { world.pdus.push([s, d]); return 0; },
            firePDU: (i) => { world.simulation.fired = i; },
            deletePDU: (i) => { world.pdus.splice(i, 1); }
        })
    };

    world.log = { enabled: false, entries: [] };
    world.fs = {};
    world.dialog = {};
    world.dialogs = [];
    world.clipboard = "";
    const ipc = {
        commandLog: () => ({
            setEnabled: (v) => { world.log.enabled = v; },
            isEnabled: () => world.log.enabled,
            getEntryCount: () => world.log.entries.length,
            getEntryAt: (i) => {
                const e = world.log.entries[i];
                return { getTimeToString: () => "10:00:00", getDeviceName: () => e[0], getPrompt: () => e[0] + "#", getCommand: () => e[1], getResolvedCommand: () => e[1] };
            },
            clear: () => { world.log.entries = []; }
        }),
        systemFileManager: () => ({
            fileExists: (p) => p in world.fs,
            directoryExists: (p) => world.fs[p] === "<dir>",
            makeDirectory: (p) => { world.fs[p] = "<dir>"; return true; },
            getFileContents: (p) => world.fs[p],
            writePlainTextToFile: (p, t) => { world.fs[p] = t; return true; },
            removeFile: (p) => { const had = p in world.fs; delete world.fs[p]; return had; },
            getOpenFileName: (caption, dir, filter) => { world.dialogs.push(["open", caption, dir, filter]); return world.dialog.open || ""; },
            getSaveFileName: (caption, dir, filter) => { world.dialogs.push(["save", caption, dir, filter]); return world.dialog.save || ""; },
            getSelectedDirectory: (caption, dir) => { world.dialogs.push(["folder", caption, dir]); return world.dialog.folder || ""; },
            getFilesInDirectory: (dir) => Object.keys(world.fs).filter((k) => k.startsWith(dir + "/") && !k.slice(dir.length + 1).includes("/")).map((k) => k.slice(dir.length + 1))
        }),
        appWindow: () => app,
        network: () => net,
        simulation: () => ({
            setSimulationMode: (v) => { world.simulation.mode = v; },
            isSimulationMode: () => world.simulation.mode,
            resetSimulation: () => { world.simulation.steps = 0; },
            forward: () => { world.simulation.steps++; },
            backward: () => { world.simulation.steps--; },
            getCurrentSimTime: () => 1234,
            getFrameInstanceCount: () => 5
        })
    };

    return { world, ipc };
}

module.exports = { createWorld };
