Documenting a topology
======================

```js
newLayer();

drawZoneAround(["S1", "PC1", "PC2"], "VLAN 10 - Users 192.168.10.0/24", "green");
drawZoneAround(["SRV"], "Server farm", "blue", 50);

getDevices(["pc", "server", "laptop"]).forEach(function (name) {
    labelWithIp(name, "FastEthernet0");
});

getLinks().forEach(function (l) {
    if (l.type === "serial") {
        labelLink(l.from.device, l.to.device, "WAN");
    }
});

addNote(20, 20, "Lab 4 - Campus\nAuthor: me\nDate: " + new Date().toDateString());
```

Remove all drawings but keep devices:

```js
clearCanvas();
```
