IOS to PTForge
==============

The IOS commands you know and the PTForge call that produces them.

* `hostname R1`: `setHostname("R1", "R1")`
* `enable secret class`: `setEnableSecret("R1", "class")`
* `line con 0` / `password cisco` / `login`: `setConsolePassword("R1", "cisco")`
* `banner motd #...#`: `setBanner("R1", "...")`
* `no ip domain-lookup`: `basicSetup("R1", {})`
* `interface g0/0` / `ip address ...` / `no shutdown`: `setInterfaceIp("R1", "GigabitEthernet0/0", "10.0.0.1/24")`
* `interface g0/0.10` / `encapsulation dot1Q 10`: `addSubinterface("R1", "GigabitEthernet0/0", 10, "192.168.10.1/24")`
* `vlan 10` / `name SALES`: `createVlans("S1", { 10: "SALES" })`
* `switchport mode access` / `switchport access vlan 10`: `setAccessPort("S1", "FastEthernet0/1", 10)`
* `switchport mode trunk`: `setTrunkPort("S1", "GigabitEthernet0/1", [10, 20], 99)`
* `channel-group 1 mode active`: `createEtherChannel("S1", 1, [...], "active")`
* `spanning-tree vlan 10 root primary`: `setStpRoot("S1", 10, "primary")`
* `spanning-tree portfast`: `enablePortfast("S1", "FastEthernet0/1")`
* `switchport port-security ...`: `configurePortSecurity("S1", "FastEthernet0/1", { maximum: 2 })`
* `ip route 0.0.0.0 0.0.0.0 1.1.1.1`: `addDefaultRoute("R1", "1.1.1.1")`
* `router ospf 1` / `network ... area 0`: `configureOspf("R1", { networks: ["10.0.0.0/8"] })`
* `router eigrp 100`: `configureEigrp("R1", { as: 100, networks: [...] })`
* `ip dhcp pool LAN`: `addRouterDhcpPool("R1", { name: "LAN", ... })`
* `ip helper-address`: `setDhcpRelay("R1", "GigabitEthernet0/1", "10.0.0.10")`
* `ip nat inside source list 1 interface g0/1 overload`: `configurePat("R1", { inside, outside, networks })`
* `access-list 10 permit ...`: `createStandardAcl("R1", 10, [...])`
* `ip access-group 100 in`: `applyAcl("R1", "GigabitEthernet0/0", 100, "in")`
* `crypto key generate rsa`: `configureSsh("R1", { domain, username, password })`
* `standby 1 ip ...`: `configureHsrp("R1", "GigabitEthernet0/0", { virtualIp })`
* `copy running-config startup-config`: `saveConfig("R1")`
* `show running-config`: `getRunningConfig("R1")`
* `show vlan brief`: `getVlans("S1")`
* `show spanning-tree`: `getStpInfo("S1", 1)`
* `show port-security`: `getPortSecurityStatus("S1", "FastEthernet0/1")`
