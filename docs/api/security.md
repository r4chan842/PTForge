Security and redundancy
=======================

Access lists, NAT, SSH, AAA and HSRP.

Access control lists
--------------------

| Function | Description |
|----------|-------------|
| `createStandardAcl(name, id, entries)` | Numbered 1-99, 1300-1999, or named |
| `createExtendedAcl(name, id, entries)` | Numbered 100-199, 2000-2699, or named |
| `applyAcl(name, interface, id, direction)` | `ip access-group`, direction `in` or `out` |
| `removeAclFromInterface(name, interface, id, direction)` | `no ip access-group` |
| `applyAclToVty(name, id, lines)` | `access-class` on VTY lines |
| `deleteAcl(name, id, extended)` | Remove a whole list |
| `createIpv6Acl(name, aclName, entries, interface, direction)` | IPv6 list, optionally applied with `ipv6 traffic-filter` |

Entries can be plain strings or objects:

    Field        Example           Notes
    -----------  ----------------  -------------------------------------------------
    action       "permit"          permit, deny or remark
    text         "web only"        For remark
    protocol     "tcp"             Extended only, default ip
    source       "192.168.1.0/24"  CIDR, a single IP, any or host x
    sourcePort   1024              Number or "range 1024 65535"
    destination  "10.0.0.10"       Same forms as source
    port         80                Number gives eq 80. Also "gt 1023", "range 20 21"
    icmpType     "echo"            ICMP message type
    established  true              TCP established
    log          true              Log matches

    createStandardAcl("R1", 10, [
        { source: "192.168.1.0/24" },
        { action: "deny", source: "any" }
    ]);
    applyAclToVty("R1", 10);

    createExtendedAcl("R1", "INBOUND", [
        { protocol: "tcp", source: "any", destination: "10.0.0.10", port: 443 },
        { protocol: "icmp", source: "any", destination: "any", icmpType: "echo-reply" },
        "deny ip any any log"
    ]);
    applyAcl("R1", "GigabitEthernet0/1", "INBOUND", "in");

NAT
---

| Function | Description |
|----------|-------------|
| `setNatInterfaces(name, inside, outside)` | `ip nat inside` and `ip nat outside` |
| `addStaticNat(name, insideLocal, insideGlobal, options)` | One to one NAT or port forwarding |
| `configurePat(name, options)` | Overload on the outside interface |
| `configureNatPool(name, options)` | Dynamic NAT with a pool |
| `clearNatTranslations(name)` | `clear ip nat translation *` |

configurePat options: inside, outside (required), networks, acl (default 1).

configureNatPool options: name, start, end, mask, networks, acl, inside, outside, overload.

addStaticNat options: inside, outside, and protocol, localPort, globalPort for port forwarding.

    configurePat("EDGE", {
        inside: ["GigabitEthernet0/0", "GigabitEthernet0/2"],
        outside: "GigabitEthernet0/1",
        networks: ["192.168.0.0/16"]
    });
    addStaticNat("EDGE", "192.168.50.10", "203.0.113.10", { protocol: "tcp", localPort: 80, globalPort: 80 });

SSH and login hardening
-----------------------

| Function | Description |
|----------|-------------|
| `configureSsh(name, options)` | Domain, user, RSA keys, SSH v2, VTY with `login local` |
| `setLoginBlock(name, seconds, attempts, within)` | `login block-for` |
| `setMinPasswordLength(name, length)` | `security passwords min-length` |

SSH options: domain (required), username, password, privilege (15), modulus (1024), version (2), timeout, retries, lines ("0 15"), allowTelnet, execTimeout, hostname. When the device still has the default hostname, the device name is used because RSA keys need a hostname.

AAA
---

| Function | Description |
|----------|-------------|
| `configureAaa(name, options)` | `aaa new-model` with RADIUS, TACACS+ and local fallback |

Options: radius: { host, key }, tacacs: { host, key }, users: [{ name, password }], localFallback (true).

HSRP
----

| Function | Description |
|----------|-------------|
| `configureHsrp(name, interface, options)` | HSRP on one router |
| `configureHsrpPair(active, standby, interface, virtualIp, group)` | Two routers, priority 150 and 100 with preempt |

Options: group (1), virtualIp (required), priority, preempt (true), version, track, decrement.

Command builders
----------------

| Function | Returns |
|----------|---------|
| `buildAcl(id, entries, extended)` | ACL lines |
| `buildSsh(options)` | SSH lines |
| `buildAaa(options)` | AAA lines |
| `buildHsrp(interface, options)` | HSRP block |
