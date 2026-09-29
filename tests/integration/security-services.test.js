"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension, commandsOf } = require("../helpers/load");

const j = (run, code) => JSON.parse(JSON.stringify(run(code)));

test("acls and nat", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 0, 0)');
    run('createStandardAcl("R1", 10, [{ source: "192.168.1.0/24" }])');
    run('createExtendedAcl("R1", 110, [{ protocol: "tcp", source: "any", destination: "10.0.0.10", port: 443 }])');
    run('createExtendedAcl("R1", "BLOCK", ["deny ip any any"])');
    assert.throws(() => run('createStandardAcl("R1", 150, ["permit any"])'), /1-99/);
    assert.throws(() => run('createExtendedAcl("R1", 5, ["permit ip any any"])'), /100-199/);
    run('applyAcl("R1", "GigabitEthernet0/0", 110, "in"); removeAclFromInterface("R1", "GigabitEthernet0/0", 110); applyAclToVty("R1", 10); deleteAcl("R1", 10); deleteAcl("R1", "BLOCK", true)');
    assert.throws(() => run('applyAcl("R1", "GigabitEthernet0/0", 110, "both")'), /in or out/);
    run('createIpv6Acl("R1", "V6", ["deny ipv6 any host 2001:db8::1", "permit ipv6 any any"], "GigabitEthernet0/0", "out")');
    run('setNatInterfaces("R1", "GigabitEthernet0/0", "GigabitEthernet0/1")');
    run('addStaticNat("R1", "192.168.1.10", "203.0.113.10", { inside: "GigabitEthernet0/0", outside: "GigabitEthernet0/1" })');
    run('addStaticNat("R1", "192.168.1.20", "203.0.113.11", { protocol: "tcp", localPort: 80, globalPort: 8080 })');
    run('configurePat("R1", { inside: ["GigabitEthernet0/0"], outside: "GigabitEthernet0/1", networks: ["192.168.1.0/24"] })');
    run('configureNatPool("R1", { name: "POOL", start: "203.0.113.20", end: "203.0.113.30", mask: 27, acl: 2, networks: "192.168.2.0/24", overload: true })');
    assert.throws(() => run('configurePat("R1", { networks: [] })'), /outside/);
    run('clearNatTranslations("R1")');

    const text = commandsOf(world, "R1").join("\n");
    assert.match(text, /access-list 10 permit 192\.168\.1\.0 0\.0\.0\.255/);
    assert.match(text, /access-list 110 permit tcp any host 10\.0\.0\.10 eq 443/);
    assert.match(text, /ip access-list extended BLOCK\n deny ip any any/);
    assert.match(text, / ip access-group 110 in/);
    assert.match(text, / no ip access-group 110 in/);
    assert.match(text, /line vty 0 15\n access-class 10 in/);
    assert.match(text, /no ip access-list extended BLOCK/);
    assert.match(text, / ipv6 traffic-filter V6 out/);
    assert.match(text, /ip nat inside source static 192\.168\.1\.10 203\.0\.113\.10/);
    assert.match(text, /ip nat inside source static tcp 192\.168\.1\.20 80 203\.0\.113\.11 8080/);
    assert.match(text, /ip nat inside source list 1 interface GigabitEthernet0\/1 overload/);
    assert.match(text, /ip nat pool POOL 203\.0\.113\.20 203\.0\.113\.30 netmask 255\.255\.255\.224/);
    assert.match(text, /ip nat inside source list 2 pool POOL overload/);
    assert.ok(text.includes("clear ip nat translation *"));
});

test("ssh aaa hsrp", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 0, 0); addDevice("R2", "2911", 0, 0)');
    run('configureSsh("R1", { domain: "lab.local", username: "admin", password: "Cisco123" })');
    run('setLoginBlock("R1", 60, 3, 30); setMinPasswordLength("R1", 8)');
    run('configureAaa("R1", { radius: { host: "10.0.0.5", key: "k" } })');
    run('configureHsrpPair("R1", "R2", "GigabitEthernet0/0", "192.168.1.254", 1)');
    const r1 = commandsOf(world, "R1").join("\n");
    assert.match(r1, /hostname R1\nip domain-name lab\.local/);
    assert.match(r1, /crypto key generate rsa general-keys modulus 1024/);
    assert.match(r1, /login block-for 60 attempts 3 within 30/);
    assert.match(r1, /security passwords min-length 8/);
    assert.match(r1, /aaa authentication login default group radius local/);
    assert.match(r1, / standby 1 priority 150/);
    assert.match(commandsOf(world, "R2").join("\n"), / standby 1 priority 100/);
});

test("server services", () => {
    const { run, world } = loadExtension();
    run('addDevice("SRV", "Server-PT", 0, 0)');
    const state = world.devices.SRV.store.state;

    run('addDhcpPool("SRV", { name: "LAN", start: "192.168.1.100", mask: 24, gateway: "192.168.1.1", dns: "192.168.1.2", maxUsers: 50 })');
    assert.deepEqual(state.pools[0], ["LAN", "192.168.1.1", "192.168.1.2", "192.168.1.100", "255.255.255.0", 50, "0.0.0.0", "0.0.0.0"]);
    assert.equal(state.enabled.dhcp, true);
    assert.throws(() => run('addDhcpPool("SRV", { name: "X", mask: 24 })'), /start/);
    assert.equal(j(run, 'getDhcpPools("SRV")')[0].name, "LAN");
    run('excludeDhcpRange("SRV", "192.168.1.100"); removeDhcpPool("SRV", "LAN"); setDhcpService("SRV", false)');
    assert.deepEqual(state.excluded, ["192.168.1.100", "192.168.1.100"]);
    assert.equal(state.pools.length, 0);
    assert.equal(state.enabled.dhcp, false);

    run('addDnsRecords("SRV", { "www.lab": "10.0.0.2", "mail.lab": "10.0.0.3" }); addDnsCname("SRV", "web.lab", "www.lab"); addDnsNs("SRV", "lab", "ns.lab")');
    assert.equal(run('getDnsRecordCount("SRV")'), 4);
    run('removeDnsRecord("SRV", "mail.lab", "10.0.0.3"); setDnsService("SRV", false)');
    assert.equal(run('getDnsRecordCount("SRV")'), 3);
    assert.equal(state.enabled.dns, false);

    run('setHttpService("SRV", true); setHttpsService("SRV", false); setWebPage("SRV", "index.html", "<h1>x</h1>")');
    assert.equal(run('getWebPage("SRV", "index.html")'), "<h1>x</h1>");
    assert.equal(state.enabled.https, false);

    run('addFtpUser("SRV", "bob", "pw", "rl"); addFtpUser("SRV", "bob", "pw2")');
    assert.deepEqual(j(run, 'getFtpUsers("SRV")'), [{ username: "bob", permissions: "RWNLD" }]);
    assert.throws(() => run('addFtpUser("SRV", "eve", "x", "RX")'), /R W N L D/);
    run('removeFtpUser("SRV", "bob")');
    assert.equal(state.ftpUsers.length, 0);

    run('addEmailUser("SRV", "a", "1"); addEmailUsers("SRV", { b: "2", c: "3" }); setEmailPassword("SRV", "a", "9"); removeEmailUser("SRV", "c")');
    assert.deepEqual(state.emailUsers, { a: "9", b: "2" });

    run('setTftpService("SRV", false); setSyslogService("SRV"); clearSyslog("SRV"); setRadiusPort("SRV", 1812)');
    assert.equal(state.enabled.tftp, false);
    assert.equal(state.enabled.syslog, true);
    assert.equal(state.radiusPort, 1812);

    run('addDevice("PC1", "Printer-PT", 0, 0)');
    assert.throws(() => run('setHttpService("PC1", true)'), /not available/);
});

test("wireless", () => {
    const { run, world } = loadExtension();
    run('addDevice("AP1", "AccessPoint-PT", 0, 0)');
    const state = world.devices.AP1.store.state;
    run('configureWireless("AP1", { ssid: "LAB", key: "Cisco12345", mode: "n", hideSsid: true })');
    assert.equal(state.ssid, "LAB");
    assert.equal(state.auth, 4);
    assert.equal(state.encrypt, 4);
    assert.equal(state.wpaKey, "Cisco12345");
    assert.equal(state.netType, 4);
    assert.equal(state.broadcast, false);
    assert.equal(run('getWirelessSsid("AP1")'), "LAB");

    run('configureWireless("AP1", { ssid: "OLD", security: "wep", key: "0123456789" })');
    assert.equal(state.auth, 1);
    assert.equal(state.encrypt, 1);
    run('configureWireless("AP1", { ssid: "OPEN" })');
    assert.equal(state.auth, 6);
    assert.equal(state.encrypt, 0);

    assert.throws(() => run('configureWireless("AP1", { key: "short" })'), /8 to 63/);
    assert.throws(() => run('configureWireless("AP1", { security: "magic" })'), /Unknown wireless security/);
    assert.throws(() => run('configureWireless("AP1", { mode: "z" })'), /Unknown wireless mode/);

    run('setMacFilter("AP1", ["0001.0001.0001"], true)');
    assert.deepEqual(state.macs, ["0001.0001.0001"]);
    assert.equal(state.macFilter, true);
    run('setMacFilter("AP1", [])');
    assert.equal(state.macFilter, false);
});
