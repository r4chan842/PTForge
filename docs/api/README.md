API reference
=============

PTForge has more than 375 functions. They are all global, so you call them directly in the editor.

| Area | File | What it covers |
|------|------|----------------|
| Devices | [devices.md](devices.md) | Add, remove, move, power, modules, ports, custom data |
| Links | [links.md](links.md) | Cables, neighbors, link state |
| End devices | [hosts.md](hosts.md) | IPv4, IPv6, DHCP, host commands |
| Cisco IOS | [ios.md](ios.md) | CLI, batch commands, basics, interfaces, router DHCP, management, show |
| Switching | [switching.md](switching.md) | VLAN, trunk, EtherChannel, STP, VTP, port security, snooping |
| Routing | [routing.md](routing.md) | Static, OSPF, OSPFv3, EIGRP, RIP, BGP, redistribution |
| Security | [security.md](security.md) | ACL, NAT, SSH, AAA, HSRP |
| Server services | [services.md](services.md) | DHCP, DNS, HTTP, FTP, Email, TFTP, Syslog |
| Wireless | [wireless.md](wireless.md) | SSID, WPA2, WEP, MAC filter |
| Canvas | [canvas.md](canvas.md) | Notes, shapes, zones, labels, layers |
| Topology | [topology.md](topology.md) | Generators, layout, subnet planning |
| Workspace | [workspace.md](workspace.md) | View, project files, text files, command log, multiuser |
| Inspection | [inspect.md](inspect.md) | Switch ports, port security, VLAN database, STP, VTP, OSPF, EIGRP |
| Lab Check | [checks.md](checks.md) | Graded checks with a score report |
| Audit | [audit.md](audit.md) | Network audit, IP inventory, duplicate IPs, down links, subnet mismatches |
| Simulation | [simulation.md](simulation.md) | Simulation mode, PDUs, ping, reachability matrix |
| Snapshots | [snapshots.md](snapshots.md) | Save the network state and compare changes |
| Events | [events.md](events.md) | React to workspace changes |
| Plugins | [plugins.md](plugins.md) | Load `.pf` plugins, consent, commands, rules and checks |
| Utilities | [utilities.md](utilities.md) | IPv4 math, output helpers |

Conventions
-----------

- The first argument is almost always a device name
- Arguments that take interfaces, VLANs or servers accept one value or an array
- Addresses accept CIDR (`10.0.0.1/24`) or an address and a mask (`"10.0.0.1", "255.255.255.0"`, or `24`)
- IOS functions return an array of rejected commands, empty when everything worked
- Wrong device names, ports, models and options throw a descriptive error that stops the script
- Every IOS function has a `build...` twin that returns the commands without sending them
