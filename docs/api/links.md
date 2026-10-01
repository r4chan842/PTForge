Links
=====

| Function | Returns | Description |
|----------|---------|-------------|
| `addLink(dev1, port1, dev2, port2, type)` | bool | Create a cable. `type` defaults to `auto` |
| `addLinks(list)` | bool[] | Create many cables from `[[dev1, port1, dev2, port2, type], ...]` |
| `deleteLink(device, port)` | bool | Remove the cable on a port |
| `autoConnect(dev1, dev2)` | bool | Packet Tracer picks the cable and the ports |
| `getLinks()` | object[] | `{ type, from: { device, port }, to: { device, port } }` |
| `getLinkCount()` | number | Number of cables |
| `getNeighbors(device)` | object[] | `{ port, device, remotePort, type }` for every cable on a device |
| `isLinkUp(device, port)` | bool | Physical and line protocol are both up |

`addLink` returns `false` when a port does not exist or is already used, and throws when a device name or cable type is wrong.

```js
addLinks([
    ["R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight"],
    ["R1", "Serial0/1/0", "R2", "Serial0/1/0", "serial"],
    ["S1", "FastEthernet0/1", "PC1", "FastEthernet0"]
]);

getNeighbors("R1").forEach(function (n) {
    addNote(10, 10, n.port + " -> " + n.device + " " + n.remotePort);
});
```

Cable types
-----------

* `straight`: Different device types: PC to switch, switch to router
* `cross`: Same device types: switch to switch, router to router, PC to router
* `roll`: Rollover
* `console`: Console cable to a PC RS232 port
* `serial`: DCE/DTE serial
* `fiber`: Fiber ports
* `phone`: Phone lines
* `cable`: Coaxial cable modem
* `coaxial`: Coaxial
* `octal`: Octal cable
* `cellular`: Cellular
* `usb`: USB
* `wireless`: Wireless
* `custom_io`: IoT custom I/O
* `auto`: Let Packet Tracer choose
