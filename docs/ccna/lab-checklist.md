# Lab checklist

A script order that avoids most problems in CCNA labs.

← [CCNA topic map](README.md)

1. **Plan**: `planSubnets` and `pointToPointLinks` give every network before any device exists
2. **Devices**: `addDevices` with final positions
3. **Modules**: `addModules` before links, because modules power cycle the device
4. **Cables**: `addLinks`, then check with `getLinkCount`
5. **Baseline**: `basicSetup` on every router and switch with `applyToDevices`
6. **Layer 2**: VLANs, trunks, EtherChannel, STP
7. **Layer 3**: interfaces, subinterfaces, SVIs, routing
8. **Services**: DHCP, DNS, NAT, NTP
9. **Security**: SSH, ACLs, port security, snooping
10. **Hosts**: static or DHCP addresses
11. **Verify**: `getVlans`, `getSwitchportTable`, `getStpInfo`, `getOspfInfo`, `ping`
12. **Document**: zones and labels
13. **Save**: `saveAllConfigs`, `exportConfigs`, `saveProjectAs`
