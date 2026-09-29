"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const { run } = loadExtension();
const j = (code) => JSON.parse(JSON.stringify(run(code)));

test("standard numbered acl", () => {
    assert.deepEqual(j('buildAcl(10, [{ action: "permit", source: "192.168.1.0/24" }, { action: "deny", source: "any" }], false)'), [
        "access-list 10 permit 192.168.1.0 0.0.0.255",
        "access-list 10 deny any"
    ]);
});

test("extended named acl", () => {
    assert.deepEqual(j('buildAcl("WEB", [{ action: "remark", text: "web only" }, { protocol: "tcp", source: "10.0.0.0/24", destination: "10.1.1.10", port: 80 }, { protocol: "tcp", source: "any", destination: "any", port: "range 20 21" }, { action: "deny", protocol: "icmp", source: "any", destination: "any", icmpType: "echo" }, "permit ip any any"], true)'), [
        "ip access-list extended WEB",
        " remark web only",
        " permit tcp 10.0.0.0 0.0.0.255 host 10.1.1.10 eq 80",
        " permit tcp any any range 20 21",
        " deny icmp any any echo",
        " permit ip any any",
        "exit"
    ]);
});

test("established and log flags", () => {
    assert.equal(run('buildAclEntry({ protocol: "tcp", source: "any", destination: "10.0.0.0/8", established: true, log: true }, true)'), "permit tcp any 10.0.0.0 0.255.255.255 established log");
});

test("nat interfaces", () => {
    assert.deepEqual(j('buildNatInterfaces(["Gi0/0", "Gi0/1"], "Serial0/1/0")'), [
        "interface Gi0/0", " ip nat inside", "exit",
        "interface Gi0/1", " ip nat inside", "exit",
        "interface Serial0/1/0", " ip nat outside", "exit"
    ]);
    assert.deepEqual(j('buildNatAcl(1, ["192.168.0.0/16"])'), ["access-list 1 permit 192.168.0.0 0.0.255.255"]);
});

test("ssh", () => {
    assert.deepEqual(j('buildSsh({ hostname: "R1", domain: "lab.local", username: "admin", password: "cisco123" })'), [
        "hostname R1",
        "ip domain-name lab.local",
        "username admin privilege 15 secret cisco123",
        "crypto key generate rsa general-keys modulus 1024",
        "ip ssh version 2",
        "line vty 0 15",
        " login local",
        " transport input ssh",
        "exit"
    ]);
    assert.throws(() => run('buildSsh({ username: "a", password: "b" })'), /domain/);
});

test("aaa", () => {
    assert.deepEqual(j('buildAaa({ radius: { host: "10.0.0.5", key: "secret" }, users: [{ name: "admin", password: "p" }] })'), [
        "aaa new-model",
        "radius-server host 10.0.0.5 key secret",
        "username admin secret p",
        "aaa authentication login default group radius local"
    ]);
    assert.deepEqual(j('buildAaa({ tacacs: { host: "10.0.0.6", key: "k" }, localFallback: false })'), [
        "aaa new-model",
        "tacacs-server host 10.0.0.6",
        "tacacs-server key k",
        "aaa authentication login default group tacacs+"
    ]);
    assert.deepEqual(j("buildAaa({})"), ["aaa new-model", "aaa authentication login default local"]);
});
