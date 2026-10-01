Topology and addressing
=======================

Generate whole topologies, lay devices out and plan subnets.

Generators
----------

| Function | Returns | Description |
|----------|---------|-------------|
| `buildStar(options)` | object | A center device with leaves around it |
| `buildRing(options)` | string[] | Devices in a closed ring |
| `buildLine(options)` | string[] | Devices in a chain |
| `buildFullMesh(options)` | string[] | Every device connected to every other device |
| `buildLan(options)` | object | Switch with hosts in a row, optional automatic addressing |

Common options: `count`, `prefix`, `start`, `model`, `x`, `y`, `radius`, `linkType`.

* `buildStar`: `center`, `centerModel`, `leafModel`, `centerPort(i)`, `leafPort(i)`
* `buildRing` / `buildLine`: `portA`, `portB`, `gap`
* `buildFullMesh`: `ports` array, each device needs `count - 1` ports
* `buildLan`: `switchName`, `switchModel`, `hosts`, `hostPrefix`, `hostModel`, `network`, `gateway`, `dns`, `startAt`

```js
buildLan({ switchName: "S1", hosts: 5, network: "192.168.1.0/24" });
buildRing({ count: 5, prefix: "R", model: "2911" });
buildFullMesh({ count: 4, prefix: "CORE" });
```

Layout
------

| Function | Returns | Description |
|----------|---------|-------------|
| `gridPositions(count, options)` | array | `[[x, y], ...]` in a grid. Options: `columns`, `x`, `y`, `gapX`, `gapY` |
| `circlePositions(count, cx, cy, radius)` | array | Points on a circle |
| `rowPositions(count, y, startX, gap)` | array | Points in a row |
| `arrangeGrid(names, options)` | number | Move devices into a grid |
| `arrangeCircle(names, cx, cy, radius)` | number | Move devices onto a circle |

Addressing
----------

| Function | Returns | Description |
|----------|---------|-------------|
| `addressHosts(names, network, options)` | object | Give hosts consecutive static addresses |
| `planSubnets(base, { name: hosts })` | object | VLSM plan, largest subnet first |
| `pointToPointLinks(base, count)` | object[] | /30 networks with both host addresses |

`addressHosts` options: `gateway` (first host by default), `dns`, `startAt` (10), `port`.

```js
var plan = planSubnets("172.16.0.0/22", { USERS: 300, VOICE: 100, SERVERS: 30, MGMT: 10 });
showResult(plan);

var wan = pointToPointLinks("10.255.255.0/24", 3);
setInterfaceIp("R1", "Serial0/1/0", wan[0].a, wan[0].mask);
setInterfaceIp("R2", "Serial0/1/0", wan[0].b, wan[0].mask);
```

Each plan entry has `network`, `mask`, `gateway`, `firstHost`, `lastHost`, `broadcast` and `usable`.
