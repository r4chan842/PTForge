# Routing

Static routes, OSPF, EIGRP, RIP, BGP, IPv6 routing and redistribution.

← [API index](README.md)

Networks can be written as `10.0.0.0/24`. Wildcard masks are calculated for you.

## Static

| Function | Description |
|----------|-------------|
| `addStaticRoute(name, destination, maskOrNextHop, nextHop, distance)` | Static route |
| `addStaticRoutes(name, routes)` | Array of route argument lists |
| `removeStaticRoute(name, destination, maskOrNextHop, nextHop)` | `no ip route` |
| `addDefaultRoute(name, nextHop, distance)` | `ip route 0.0.0.0 0.0.0.0` |
| `addFloatingRoute(name, destination, nextHop, distance)` | Backup route, distance 200 by default. Destination in CIDR form |
| `addIpv6StaticRoute(name, prefix, nextHop, distance)` | `ipv6 route` |
| `addIpv6DefaultRoute(name, nextHop)` | `ipv6 route ::/0` |

Both styles work:

```js
addStaticRoute("R1", "10.2.0.0/16", "10.0.0.2");
addStaticRoute("R1", "10.2.0.0", "255.255.0.0", "10.0.0.2");
addStaticRoute("R1", "10.3.0.0/16", "Serial0/1/0", 5);
addDefaultRoute("R1", "203.0.113.1");
```

## OSPF

| Function | Description |
|----------|-------------|
| `configureOspf(name, options)` | OSPFv2 process |
| `setOspfInterface(name, interface, options)` | Interface level OSPF settings |
| `configureOspfv3(name, options)` | OSPFv3 for IPv6 |
| `removeOspf(name, processId)` | `no router ospf` |

`configureOspf` options:

| Option | Example | Result |
|--------|---------|--------|
| `processId` | `1` | Default 1 |
| `routerId` | `"1.1.1.1"` | `router-id` |
| `area` | `0` | Default area for plain networks |
| `networks` | `["10.0.0.0/30", { network: "10.1.0.0/24", area: 1 }]` | `network ... area ...` |
| `passive` | `["GigabitEthernet0/1"]` | `passive-interface` |
| `defaultOriginate` | `true` | `default-information originate` |
| `referenceBandwidth` | `1000` | `auto-cost reference-bandwidth` |

`setOspfInterface` options: `cost`, `priority`, `hello`, `dead`, `processId` with `area`, `md5Key` with `keyId`, `networkType`.

`configureOspfv3` options: `processId`, `routerId` (required), `interfaces` as an array or `{ interface: area }`, `area`, `passive`, `defaultOriginate`.

```js
configureOspf("R1", {
    routerId: "1.1.1.1",
    networks: ["10.0.12.0/30", "192.168.1.0/24"],
    passive: "GigabitEthernet0/1"
});
setOspfInterface("R1", "GigabitEthernet0/0", { cost: 10, priority: 255 });
```

## EIGRP

| Function | Description |
|----------|-------------|
| `configureEigrp(name, options)` | EIGRP for IPv4 |
| `configureEigrpv6(name, options)` | EIGRP for IPv6 |
| `setEigrpSummary(name, interface, as, network, mask)` | Manual summary |
| `removeEigrp(name, as)` | `no router eigrp` |

`configureEigrp` options: `as` (required), `routerId`, `networks`, `passive`, `autoSummary` (off by default), `redistribute`.

`configureEigrpv6` options: `as`, `routerId` (required), `interfaces`, `passive`.

## RIP

| Function | Description |
|----------|-------------|
| `configureRip(name, options)` | RIP version 2 |
| `configureRipng(name, processName, interfaces)` | RIPng for IPv6 |
| `removeRip(name)` | `no router rip` |

RIP options: `version`, `networks`, `passive`, `autoSummary`, `defaultOriginate`. Networks are converted to their classful form and duplicates are dropped.

## BGP

| Function | Description |
|----------|-------------|
| `configureBgp(name, options)` | eBGP or iBGP |
| `removeBgp(name, as)` | `no router bgp` |

Options: `as`, `routerId`, `neighbors` as `[{ ip, remoteAs, description }]`, `networks` in CIDR form.

## Redistribution

| Function | Description |
|----------|-------------|
| `redistribute(name, into, source, options)` | `redistribute` under a routing process |

```js
redistribute("R1", { protocol: "ospf", id: 1 }, "static");
redistribute("R2", { protocol: "eigrp", id: 100 }, "ospf 1", { metric: "10000 100 255 1 1500" });
```

`subnets` is added automatically when redistributing into OSPF.

## Command builders

| Function | Returns |
|----------|---------|
| `buildStaticRoute(destination, maskOrNextHop, nextHop, distance)` | one route line |
| `buildOspf(options)` | OSPF block |
| `buildOspfInterface(interface, options)` | interface block |
| `buildOspfv3(options)` | OSPFv3 lines |
| `buildEigrp(options)` | EIGRP block |
| `buildEigrpv6(options)` | EIGRP IPv6 lines |
| `buildRip(options)` | RIP block |
| `buildBgp(options)` | BGP block |
