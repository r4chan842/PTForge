"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadExtension } = require("../helpers/load");

const { run } = loadExtension();
const j = (code) => JSON.parse(JSON.stringify(run(code)));

test("validates addresses", () => {
    assert.equal(run('isValidIp("192.168.1.1")'), true);
    assert.equal(run('isValidIp("256.1.1.1")'), false);
    assert.equal(run('isValidIp("10.0.0")'), false);
    assert.equal(run('isValidIp("a.b.c.d")'), false);
});

test("converts between integers and addresses", () => {
    assert.equal(run('intToIp(ipToInt("172.16.254.3"))'), "172.16.254.3");
    assert.equal(run('ipToInt("0.0.0.1")'), 1);
    assert.equal(run('intToIp(4294967295)'), "255.255.255.255");
    assert.throws(() => run('ipToInt("300.1.1.1")'));
});

test("converts prefix and mask", () => {
    assert.equal(run("cidrToMask(24)"), "255.255.255.0");
    assert.equal(run("cidrToMask(0)"), "0.0.0.0");
    assert.equal(run("cidrToMask(32)"), "255.255.255.255");
    assert.equal(run("cidrToMask(27)"), "255.255.255.224");
    assert.equal(run('maskToCidr("255.255.252.0")'), 22);
    assert.equal(run('maskToCidr("0.0.0.0")'), 0);
    assert.throws(() => run('maskToCidr("255.0.255.0")'));
    assert.throws(() => run("cidrToMask(33)"));
});

test("computes wildcards", () => {
    assert.equal(run('maskToWildcard("255.255.255.0")'), "0.0.0.255");
    assert.equal(run('maskToWildcard("255.255.255.252")'), "0.0.0.3");
});

test("normalizes masks", () => {
    assert.equal(run("normalizeMask(30)"), "255.255.255.252");
    assert.equal(run('normalizeMask("16")'), "255.255.0.0");
    assert.equal(run('normalizeMask("255.255.255.128")'), "255.255.255.128");
    assert.throws(() => run('normalizeMask("255.255.0.255")'));
});

test("parses networks", () => {
    const info = j('parseNetwork("192.168.10.77/26")');
    assert.equal(info.network, "192.168.10.64");
    assert.equal(info.broadcast, "192.168.10.127");
    assert.equal(info.mask, "255.255.255.192");
    assert.equal(info.wildcard, "0.0.0.63");
    assert.equal(info.prefix, 26);
    assert.equal(info.size, 64);
    assert.equal(run('parseNetwork("10.1.2.3", "255.0.0.0").network'), "10.0.0.0");
});

test("computes host ranges", () => {
    assert.deepEqual(j('hostRange("10.0.0.0/30")'), { first: "10.0.0.1", last: "10.0.0.2", count: 2 });
    assert.deepEqual(j('hostRange("10.0.0.0/31")'), { first: "10.0.0.0", last: "10.0.0.1", count: 2 });
    assert.equal(run('nthHost("192.168.1.0/24", 1)'), "192.168.1.1");
    assert.equal(run('nthHost("192.168.1.0/24", -1)'), "192.168.1.254");
    assert.throws(() => run('nthHost("192.168.1.0/30", 3)'));
});

test("splits subnets", () => {
    assert.deepEqual(j('splitSubnet("192.168.0.0/24", 26)'), [
        "192.168.0.0/26", "192.168.0.64/26", "192.168.0.128/26", "192.168.0.192/26"
    ]);
    assert.throws(() => run('splitSubnet("10.0.0.0/24", 16)'));
});

test("checks membership", () => {
    assert.equal(run('isInSubnet("10.0.5.9", "10.0.0.0/16")'), true);
    assert.equal(run('isInSubnet("10.1.0.1", "10.0.0.0/16")'), false);
});

test("formats ACL addresses", () => {
    assert.equal(run('aclAddress("any")'), "any");
    assert.equal(run('aclAddress("10.0.0.5")'), "host 10.0.0.5");
    assert.equal(run('aclAddress("10.0.0.0/8")'), "10.0.0.0 0.255.255.255");
    assert.equal(run('aclAddress("10.0.0.9/32")'), "host 10.0.0.9");
    assert.equal(run('aclAddress("host 1.1.1.1")'), "host 1.1.1.1");
});

test("formats network pairs", () => {
    assert.equal(run('networkAndWildcard("172.16.5.1/20")'), "172.16.0.0 0.0.15.255");
    assert.equal(run('networkAndMask("172.16.5.1/20")'), "172.16.0.0 255.255.240.0");
});
