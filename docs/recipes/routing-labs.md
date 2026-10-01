Routing labs
============

Three routers in a chain with OSPF
----------------------------------

```js
buildLine({ count: 3, prefix: "R", model: "2911", portA: "GigabitEthernet0/1", portB: "GigabitEthernet0/0", linkType: "cross" });

var links = pointToPointLinks("10.0.0.0/24", 2);
setInterfaceIp("R1", "GigabitEthernet0/1", links[0].a, links[0].mask);
setInterfaceIp("R2", "GigabitEthernet0/0", links[0].b, links[0].mask);
setInterfaceIp("R2", "GigabitEthernet0/1", links[1].a, links[1].mask);
setInterfaceIp("R3", "GigabitEthernet0/0", links[1].b, links[1].mask);

["R1", "R2", "R3"].forEach(function (r, i) {
    addLoopback(r, 0, (i + 1) + "." + (i + 1) + "." + (i + 1) + "." + (i + 1));
    configureOspf(r, { routerId: (i + 1) + ".0.0." + (i + 1), networks: ["10.0.0.0/24", "0.0.0.0/0"] });
});
```

> Check the port names of `buildLine` for your model with `getPorts`.

EIGRP with passive LAN
----------------------

```js
configureEigrp("R1", { as: 100, networks: ["10.0.0.0/30", "192.168.1.0/24"], passive: "GigabitEthernet0/1" });
```

Static route with a floating backup
-----------------------------------

```js
addStaticRoute("R1", "10.20.0.0/16", "10.0.0.2");
addFloatingRoute("R1", "10.20.0.0/16", "10.9.0.2", 200);
```

Default route shared through OSPF
---------------------------------

```js
addDefaultRoute("EDGE", "203.0.113.1");
configureOspf("EDGE", { networks: ["10.0.0.0/8"], defaultOriginate: true });
```
