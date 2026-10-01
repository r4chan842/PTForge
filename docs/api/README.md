API reference
=============

PTForge has more than 375 functions. They are all global, so you call them directly in the editor.

* Devices: https://github.com/r4chan842/PTForge/blob/main/docs/api/devices.md
  Add, remove, move, power, modules, ports, custom data
* Links: https://github.com/r4chan842/PTForge/blob/main/docs/api/links.md
  Cables, neighbors, link state
* End devices: https://github.com/r4chan842/PTForge/blob/main/docs/api/hosts.md
  IPv4, IPv6, DHCP, host commands
* Cisco IOS: https://github.com/r4chan842/PTForge/blob/main/docs/api/ios.md
  CLI, batch commands, basics, interfaces, router DHCP, management, show
* Switching: https://github.com/r4chan842/PTForge/blob/main/docs/api/switching.md
  VLAN, trunk, EtherChannel, STP, VTP, port security, snooping
* Routing: https://github.com/r4chan842/PTForge/blob/main/docs/api/routing.md
  Static, OSPF, OSPFv3, EIGRP, RIP, BGP, redistribution
* Security: https://github.com/r4chan842/PTForge/blob/main/docs/api/security.md
  ACL, NAT, SSH, AAA, HSRP
* Server services: https://github.com/r4chan842/PTForge/blob/main/docs/api/services.md
  DHCP, DNS, HTTP, FTP, Email, TFTP, Syslog
* Wireless: https://github.com/r4chan842/PTForge/blob/main/docs/api/wireless.md
  SSID, WPA2, WEP, MAC filter
* Canvas: https://github.com/r4chan842/PTForge/blob/main/docs/api/canvas.md
  Notes, shapes, zones, labels, layers
* Topology: https://github.com/r4chan842/PTForge/blob/main/docs/api/topology.md
  Generators, layout, subnet planning
* Workspace: https://github.com/r4chan842/PTForge/blob/main/docs/api/workspace.md
  View, project files, text files, command log, multiuser
* Inspection: https://github.com/r4chan842/PTForge/blob/main/docs/api/inspect.md
  Switch ports, port security, VLAN database, STP, VTP, OSPF, EIGRP
* Lab Check: https://github.com/r4chan842/PTForge/blob/main/docs/api/checks.md
  Graded checks with a score report
* Audit: https://github.com/r4chan842/PTForge/blob/main/docs/api/audit.md
  Network audit, IP inventory, duplicate IPs, down links, subnet mismatches
* Simulation: https://github.com/r4chan842/PTForge/blob/main/docs/api/simulation.md
  Simulation mode, PDUs, ping, reachability matrix
* Snapshots: https://github.com/r4chan842/PTForge/blob/main/docs/api/snapshots.md
  Save the network state and compare changes
* Events: https://github.com/r4chan842/PTForge/blob/main/docs/api/events.md
  React to workspace changes
* Plugins: https://github.com/r4chan842/PTForge/blob/main/docs/api/plugins.md
  Load .pf plugins, consent, commands, rules and checks
* Utilities: https://github.com/r4chan842/PTForge/blob/main/docs/api/utilities.md
  IPv4 math, output helpers

Conventions
-----------

- The first argument is almost always a device name
- Arguments that take interfaces, VLANs or servers accept one value or an array
- Addresses accept CIDR (10.0.0.1/24) or an address and a mask ("10.0.0.1", "255.255.255.0", or 24)
- IOS functions return an array of rejected commands, empty when everything worked
- Wrong device names, ports, models and options throw a descriptive error that stops the script
- Every IOS function has a build... twin that returns the commands without sending them
