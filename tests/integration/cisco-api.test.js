"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { loadExtension } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

function lab() {
    const env = loadExtension();
    env.run('addDevice("R1", "2911", 0, 0); addDevice("R2", "2911", 300, 0); addDevice("S1", "2960-24TT", 0, 200); addDevice("ML1", "3560-24PS", 300, 200)');
    return env;
}

test("device type numbers match the published DeviceType enum", () => {
    const { run } = lab();
    const published = {
        router: 0, switch: 1, cloud: 2, bridge: 3, hub: 4, repeater: 5, coaxialsplitter: 6,
        accesspoint: 7, pc: 8, server: 9, printer: 10, wirelessrouter: 11, ipphone: 12,
        dslmodem: 13, cablemodem: 14, remotenetwork: 15, multilayerswitch: 16, laptop: 17,
        tabletpc: 18, pda: 19, wirelessenddevice: 20, wiredenddevice: 21, tv: 22, homevoip: 23,
        analogphone: 24, multiuser: 25, asa: 26, ioe: 27, homegateway: 28, celltower: 29,
        centralofficeserver: 30, ciscoaccesspoint: 31, embeddedciscoaccesspoint: 32,
        sniffer: 33, mcu: 34, sbc: 35, thing: 36, mcucomponent: 37, embeddedserver: 38,
        wirelesslancontroller: 39, cluster: 40
    };
    Object.keys(published).forEach((name) => {
        assert.equal(run("deviceTypes." + name), published[name], name);
    });
    assert.equal(run('getDeviceType("R1")'), 0);
    assert.equal(run('getDeviceType("S1")'), 1);
    assert.equal(run('getDeviceType("ML1")'), 16);
});

test("models resolve to the documented device type", () => {
    const { run, world } = lab();
    run('addDevice("L1", "Laptop-PT", 0, 400); addDevice("PC2", "PC-PT", 100, 400); addDevice("ASA1", "5505", 200, 400); addDevice("T1", "Thing", 300, 400)');
    assert.equal(world.devices.L1.getType(), 17);
    assert.equal(world.devices.PC2.getType(), 8);
    assert.equal(world.devices.ASA1.getType(), 26);
    assert.equal(world.devices.T1.getType(), 36);
    assert.deepEqual(j(run, 'getDeviceModels("laptop")'), ["Laptop-PT"]);
});

test("short model names and numbers are mapped to real models", () => {
    const { run } = lab();
    assert.equal(run('resolveDeviceModel("4321")'), "ISR4321");
    assert.equal(run('resolveDeviceModel(4331)'), "ISR4331");
    assert.equal(run('resolveDeviceModel("2960")'), "2960-24TT");
    assert.equal(run('resolveDeviceModel("isr4321")'), "ISR4321");
    assert.equal(run('getDeviceModelType("4321")'), 0);
    assert.throws(() => run('addDevice("X1", "ISR9211", 0, 0)'), /Unknown device model: ISR9211/);
    assert.throws(() => run('addDevice("X2", "2960-24T", 0, 0)'), /Did you mean/);
    assert.throws(() => run('addDevice("X3", "", 0, 0)'), /needs a model/);
    assert.throws(() => run('addDevice("R1", "2911", 0, 0)'), /already in use/);
});

test("module models are strings and failures explain themselves", () => {
    const { run } = lab();
    assert.throws(() => run('addModule("R1", "0/0", 0)'), /Module models are strings/);
    assert.throws(() => run('addModule("R1", "0/0", "XYZ-9")'), /Unknown module: XYZ-9/);
    run('addModule("R1", "0/1", "HWIC-2T")');
    assert.deepEqual(j(run, 'getPorts("R1")').filter((p) => p.indexOf("Serial") === 0), ["Serial0/1/0", "Serial0/1/1"]);
});

test("cable constants match the published CONNECT_TYPES enum", () => {
    const { run } = lab();
    const published = {
        straight: 8100, cross: 8101, roll: 8102, fiber: 8103, phone: 8104, cable: 8105,
        serial: 8106, auto: 8107, console: 8108, wireless: 8109, coaxial: 8110,
        octal: 8111, cellular: 8112, usb: 8113, custom_io: 8114
    };
    Object.keys(published).forEach((name) => {
        assert.equal(run("resolveLinkType(\"" + name + "\")"), published[name], name);
    });
    assert.equal(run('resolveLinkType("CROSSOVER")'), 8101);
    assert.equal(run('resolveLinkType("Crossover")'), run('resolveLinkType("cross")'));
    assert.equal(run('resolveLinkType()'), 8107);
    assert.throws(() => run('resolveLinkType("laser")'), /Valid types are straight, cross, crossover/);
    assert.equal(run("linkTypeName(8101)"), "cross");
    assert.equal(run("linkTypeName(8107)"), "auto");
});

test("links validate ports and cables before Packet Tracer sees them", () => {
    const { run } = lab();
    assert.throws(() => run('addLink("R1", "GigabitEthernet9/9", "S1", "GigabitEthernet0/1")'), /R1 has no port named GigabitEthernet9\/9. Free ports:/);
    assert.throws(() => run('addLink("R1", "GigabitEthernet0/0", "NOPE", "GigabitEthernet0/1")'), /Device not found: NOPE/);
    assert.throws(() => run('addLink("R1", "GigabitEthernet0/0", "R1", "GigabitEthernet0/0")'), /cannot be cabled to itself/);
    assert.equal(run('addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight")'), true);
    assert.throws(() => run('addLink("1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/2")'), /Device not found/);
    assert.throws(() => run('addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/2", "straight")'), /already cabled/);
    assert.throws(() => run('deleteLink("R1", "GigabitEthernet0/1")'), /has no cable/);
    assert.equal(run('deleteLink("R1", "GigabitEthernet0/0")'), true);
});

test("command statuses are the five documented values", () => {
    const { run } = lab();
    assert.deepEqual(j(run, "commandStatusNames"), ["ok", "ambiguous", "invalid", "incomplete", "notImplemented"]);
    assert.equal(run("commandStatusCodes.ok"), 0);
    assert.equal(run("commandStatusCodes.ambiguous"), 1);
    assert.equal(run("commandStatusCodes.invalid"), 2);
    assert.equal(run("commandStatusCodes.incomplete"), 3);
    assert.equal(run("commandStatusCodes.notimplemented"), 4);
    assert.deepEqual(j(run, 'parseCommandResult([2, "oops"])'), { status: "invalid", output: "oops" });
    assert.deepEqual(j(run, 'parseCommandResult({ first: 4, second: "nope" })'), { status: "notImplemented", output: "nope" });
    assert.deepEqual(j(run, "parseCommandResult(0)"), { status: "ok", output: "" });
    assert.deepEqual(j(run, 'parseCommandResult("done")'), { status: "ok", output: "done" });
});

test("cli modes are checked against the three documented modes", () => {
    const { run } = lab();
    assert.equal(run('normalizeCliMode("user")'), "user");
    assert.equal(run('normalizeCliMode("Enable")'), "enable");
    assert.equal(run('normalizeCliMode("config")'), "global");
    assert.equal(run('normalizeCliMode("")'), "");
    assert.equal(run("normalizeCliMode()"), "");
    assert.throws(() => run('normalizeCliMode("config-if")'), /Invalid CLI mode: config-if. Valid modes are user, enable, global/);
    assert.throws(() => run('runCommand("R1", "show version", "root")'), /Invalid CLI mode/);
});

test("commands are trimmed and empty lines skipped", () => {
    const { run, world } = lab();
    const failed = j(run, 'configureIosDevice("R1", ["", "  ", "  !  ", " hostname CORE  "], false)');
    assert.deepEqual(failed, []);
    assert.deepEqual(world.devices.R1.commands.filter((c) => c.cmd.indexOf("CORE") >= 0).map((c) => c.cmd), ["hostname CORE"]);
});

test("runCommands reports every line with its status", () => {
    const { run, world } = lab();
    world.rejectCommands.push(/^bogus/);
    const report = j(run, 'runCommands("R1", ["show version", "bogus one", "hostname X"], "enable")');
    assert.equal(report.device, "R1");
    assert.equal(report.ok, false);
    assert.deepEqual(report.failed.map((f) => [f.command, f.status]), [["bogus one", "invalid"]]);
    assert.deepEqual(report.commands.map((c) => c.command), ["show version", "bogus one", "hostname X"]);
});

test("etherchannel mode errors list every mode", () => {
    const { run } = lab();
    assert.throws(() => run('createEtherChannel("S1", 1, ["FastEthernet0/23"], "lacp")'), /Invalid EtherChannel mode: lacp. Valid modes are active, passive, desirable, auto, on/);
    assert.throws(() => run('createEtherChannel("S1", 99, ["FastEthernet0/23"], "active")'), /group must be a whole number from 1 to 48/);
    assert.throws(() => run('buildEtherChannel(1, [], "active")'), /at least one interface/);
    assert.throws(() => run('setEtherChannelLoadBalance("S1", "round-robin")'), /Valid methods are src-mac/);
});

test("etherchannel builds the same shape for access and trunk bundles", () => {
    const { run, world } = lab();
    run('createEtherChannel("S1", 1, ["FastEthernet0/23", "FastEthernet0/24"], "active", { accessVlan: 10 })');
    const body = world.devices.S1.commands.map((c) => c.cmd);
    assert.ok(body.indexOf("channel-group 1 mode active") >= 0);
    assert.ok(body.indexOf("switchport access vlan 10") >= 0);
    run('createEtherChannel("ML1", 2, ["FastEthernet0/23", "FastEthernet0/24"], "on", { trunk: true })');
    const mls = world.devices.ML1.commands.map((c) => c.cmd);
    assert.ok(mls.indexOf("switchport trunk encapsulation dot1q") >= 0);
    assert.ok(mls.indexOf("interface Port-channel2") >= 0);
});

test("port security resets the port before it applies the new limits", () => {
    const { run, world } = lab();
    run('configurePortSecurity("S1", "FastEthernet0/1", { maximum: 2, violation: "restrict" })');
    const body = world.devices.S1.commands.map((c) => c.cmd).filter((c) => c.indexOf("port-security") >= 0);
    assert.deepEqual(body, [
        "no switchport port-security",
        "switchport port-security",
        "switchport port-security maximum 2",
        "switchport port-security violation restrict",
        "switchport port-security mac-address sticky"
    ]);
    assert.throws(() => run('configurePortSecurity("S1", "FastEthernet0/1", { maximum: 0 })'), /maximum must be a whole number from 1 to 1024/);
    assert.throws(() => run('configurePortSecurity("S1", "FastEthernet0/1", { violation: "explode" })'), /Valid modes are shutdown, restrict, protect/);
    assert.throws(() => run('configurePortSecurity("S1", "FastEthernet0/1", { macs: ["zz"] })'), /MAC addresses/);
});

test("hsrp takes the shared address as a string or an object", () => {
    const { run, world } = lab();
    run('configureHsrpPair("R1", "R2", "GigabitEthernet0/0", "192.168.1.254", 5)');
    const active = world.devices.R1.commands.map((c) => c.cmd);
    assert.ok(active.indexOf("standby 5 ip 192.168.1.254") >= 0);
    assert.ok(active.indexOf("standby 5 priority 150") >= 0);
    assert.ok(active.indexOf("standby 5 preempt") >= 0);
    const standby = world.devices.R2.commands.map((c) => c.cmd);
    assert.ok(standby.indexOf("standby 5 priority 100") >= 0);
    run('configureHsrp("R1", "GigabitEthernet0/1", { vip: "10.0.0.254", group: 2 })');
    assert.ok(world.devices.R1.commands.map((c) => c.cmd).indexOf("standby 2 ip 10.0.0.254") >= 0);
    assert.throws(() => run('configureHsrp("R1", "GigabitEthernet0/1", { group: 2 })'), /virtualIp/);
    assert.throws(() => run('configureHsrp("R1", "GigabitEthernet0/1", { virtualIp: "10.0.0.1", group: 300 })'), /group must be a whole number from 0 to 255/);
});

test("ipv6 access lists are built and checked", () => {
    const { run, world } = lab();
    assert.deepEqual(j(run, 'buildIpv6Acl("V6", ["permit ipv6 any any", "deny tcp any host 2001:db8::10 eq 443"])'), [
        "ipv6 access-list V6",
        " permit ipv6 any any",
        " deny tcp any host 2001:db8::10 eq 443",
        "exit"
    ]);
    run('createIpv6Acl("R1", "V6", ["permit ipv6 any any"], "GigabitEthernet0/0", "in")');
    assert.ok(world.devices.R1.commands.map((c) => c.cmd).indexOf("ipv6 traffic-filter V6 in") >= 0);
    assert.throws(() => run('buildIpv6Acl("9bad", ["permit ipv6 any any"])'), /start with a letter/);
    assert.throws(() => run('buildIpv6Acl("V6", ["allow ipv6 any any"])'), /start with permit, deny or remark/);
    assert.throws(() => run('buildIpv6Acl("V6", [])'), /at least one entry/);
    assert.throws(() => run('createIpv6Acl("R1", "V6", ["permit ipv6 any any"], "GigabitEthernet0/0", "sideways")'), /direction must be in or out/);
});

test("aaa without a server writes the local method only", () => {
    const { run, world } = lab();
    run('configureAaa("R1", { users: [{ name: "admin", password: "pw" }] })');
    const body = world.devices.R1.commands.map((c) => c.cmd);
    assert.ok(body.indexOf("aaa new-model") >= 0);
    assert.ok(body.indexOf("username admin secret pw") >= 0);
    assert.ok(body.indexOf("aaa authentication login default local") >= 0);
    assert.ok(body.every((c) => c.indexOf("radius-server") === -1));
    run('configureAaa("R1", { radius: { host: "10.0.0.9", key: "shared", port: 1812 } })');
    const withRadius = world.devices.R1.commands.map((c) => c.cmd);
    assert.ok(withRadius.indexOf("radius-server host 10.0.0.9 auth-port 1812 key shared") >= 0);
    assert.ok(withRadius.indexOf("aaa authentication login default group radius local") >= 0);
    assert.throws(() => run('configureAaa("R1", { radius: { host: "10.0.0.9" } })'), /radius key/);
    assert.throws(() => run('configureAaa("R1", { localFallback: false })'), /needs a server or a local user/);
});

test("object options do not leak between calls", () => {
    const { run } = lab();
    const shared = j(run, 'basicSetup("R1", { secret: "class" })');
    assert.deepEqual(shared, []);
    assert.deepEqual(j(run, 'createEtherChannel("S1", 3, ["FastEthernet0/1"], "active", {})'), []);
    const ssh = j(run, 'configureSsh("R2", { domain: "lab.local", username: "admin", password: "pw" })');
    assert.equal(ssh.ok, true);
    assert.deepEqual(ssh.failed, []);
});

test("no es6 object helpers are used in the packet tracer sources", () => {
    const root = path.join(__dirname, "..", "..");
    const order = JSON.parse(fs.readFileSync(path.join(root, "tools", "load-order.json"), "utf8")).scripts;
    order.forEach((file) => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        ["Object.assign", ".includes(", "Array.from", "Number.isInteger"].forEach((bad) => {
            assert.equal(text.indexOf(bad), -1, bad + " in " + file);
        });
    });
});

test("a device still at its first boot dialog answers the dialog instead of failing quietly", () => {
    const { run, world } = lab();
    const setup = "Would you like to enter the initial configuration dialog? [yes/no]: ";
    world.devices.R1.getCommandLine().setPrompt(setup);
    const ready = j(run, 'ensureIosReady("R1")');
    assert.equal(ready.booting, false);
    assert.equal(world.devices.R1.commands[world.devices.R1.commands.length - 1].cmd, "no");
    run('setHostname("R1", "Core")');
    assert.ok(world.devices.R1.commands.map((c) => c.cmd).indexOf("hostname Core") >= 0);
});

test("a device that stays in setup mode reports it instead of a quiet ok", () => {
    const { run, world } = lab();
    const line = world.devices.R1.getCommandLine();
    line.setPrompt("Would you like to enter the initial configuration dialog? [yes/no]: ");
    world.devices.R1.enterCommand = (cmd) => {
        world.devices.R1.commands.push({ cmd, mode: "" });
        return [0, ""];
    };
    assert.throws(() => run('runCommand("R1", "show version")'), /first boot dialog/);
    line.setPrompt("R1#");
});

test("runCommand picks the mode for a show line, a config line and a sub mode", () => {
    const { run, world } = lab();
    run('runCommand("R1", "show version")');
    run('runCommand("R1", "hostname Core")');
    assert.deepEqual(world.devices.R1.commands.slice(-2).map((c) => [c.cmd, c.mode]), [["show version", "enable"], ["hostname Core", "global"]]);
    run('runCommands("R1", ["interface GigabitEthernet0/0", "ip address 10.0.0.1 255.255.255.0", "no shutdown", "show ip interface brief"])');
    const tail = world.devices.R1.commands.slice(-4).map((c) => [c.cmd, c.mode]);
    assert.deepEqual(tail, [["interface GigabitEthernet0/0", "global"], ["ip address 10.0.0.1 255.255.255.0", ""], ["no shutdown", ""], ["show ip interface brief", "enable"]]);
});

test("ping refuses to run while packet tracer is in simulation mode", () => {
    const { run, world } = lab();
    world.simulation.mode = true;
    assert.throws(() => run('pingTest("R1", "10.0.0.1")'), /Simulation mode/);
    assert.throws(() => run('ping("R1", "10.0.0.1")'), /Simulation mode/);
    assert.throws(() => run('traceroute("R1", "10.0.0.1")'), /Simulation mode/);
    assert.throws(() => run('reachability()'), /Simulation mode/);
    world.simulation.mode = false;
});

test("a ping that answers nothing is closed by the watchdog", () => {
    const { run, world } = lab();
    world.lineQueue = [];
    run('hung = ping("R2", "10.9.9.9")');
    assert.equal(run("hung.state"), "pending");
    assert.equal(run("activePingRunners.length"), 1);
    assert.equal(run("pingWatchdog(0)"), 1);
    assert.equal(run("hung.state"), "failed");
    assert.match(run("hung.output"), /No reply/);
    assert.equal(run("activePingRunners.length"), 0);
    world.lineQueue = null;
});

test("linkTypeName names a known constant and rejects an unknown one", () => {
    const { run } = lab();
    assert.equal(run("linkTypeName(8101)"), "cross");
    assert.equal(run("linkTypeName(8109)"), "wireless");
    assert.throws(() => run("linkTypeName(9999)"), /Unknown link type code: 9999/);
});

test("addLabel is labelDevice under its short name", () => {
    const { run } = lab();
    const note = j(run, 'addLabel("R1", "Core")');
    assert.ok(note);
    assert.equal(run('typeof addLabel'), "function");
});

test("configureSsh reports what it sent instead of an empty list", () => {
    const { run } = lab();
    const report = j(run, 'configureSsh("R1", { domain: "lab.local", username: "admin", password: "pw" })');
    assert.equal(report.ok, true);
    assert.equal(report.device, "R1");
    assert.ok(report.lines > 4);
    assert.deepEqual(report.failed, []);
    assert.match(report.message, /SSH/);
});
