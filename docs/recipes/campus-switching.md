Campus switching
================

Same VLANs on every switch
--------------------------

```js
var vlans = { 10: "USERS", 20: "VOICE", 99: "MGMT", 999: "PARKING" };
applyToDevices(getDevices(["switch", "multilayerswitch"]), buildVlans(vlans));
```

Uplinks as trunks with a native VLAN
------------------------------------

```js
getDevices(["switch", "multilayerswitch"]).forEach(function (sw) {
    setTrunkPort(sw, ["GigabitEthernet0/1", "GigabitEthernet0/2"], [10, 20, 99], 99, { nonegotiate: true });
});
```

LACP between two distribution switches
--------------------------------------

```js
["D1", "D2"].forEach(function (sw, i) {
    createEtherChannel(sw, 1, ["FastEthernet0/23", "FastEthernet0/24"], i === 0 ? "active" : "passive", {
        trunk: true,
        allowedVlans: [10, 20, 99],
        nativeVlan: 99
    });
});
```

Root bridge per VLAN
--------------------

```js
setStpMode("D1");
setStpMode("D2");
setStpRoot("D1", 10, "primary");
setStpRoot("D1", 20, "secondary");
setStpRoot("D2", 20, "primary");
setStpRoot("D2", 10, "secondary");
```

Secure access ports
-------------------

```js
var access = [];
for (var i = 1; i <= 20; i++) {
    access.push("FastEthernet0/" + i);
}
setAccessPort("A1", access, 10, { voiceVlan: 20, portfast: true, bpduguard: true });
configurePortSecurity("A1", access, { maximum: 2, violation: "restrict" });
enableDhcpSnooping("A1", [10], "GigabitEthernet0/1");
parkUnusedPorts("A1", ["FastEthernet0/21", "FastEthernet0/22"], 999);
```
