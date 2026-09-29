# Changelog

All notable changes to PTForge are listed here. The format follows [Keep a Changelog](https://keepachangelog.com) and the project uses [Semantic Versioning](https://semver.org).

## [1.1.0] - 2026-09-29

### Editor

- New workbench in the style of VS Code: menu bar, command center, activity bar, side bar, tabs, breadcrumbs, panel and status bar
- Workspace of scripts stored inside Packet Tracer, plus files and folders on disk through the native Packet Tracer file dialogs
- Save, Save As, Save All, export as download, import from clipboard, rename and delete
- Tabs with a dirty dot, middle click close, save prompt, undo history per file
- Syntax highlighting with VS Code Dark+ colors, bracket pair colors, regex literals and a distinct color for PTForge functions
- IntelliSense for all functions with documentation, and parameter hints
- Problems panel with exact syntax error lines, unclosed and mismatched brackets, unknown function warnings and a quick fix
- Command palette, go to file, go to line, next problem
- Find and replace with case, whole word and regex options
- Toggle comment, move and copy lines, delete line, smart Home, auto closing pairs, bracket matching
- Devices view with live ports, link state and addresses
- Network tools: subnet calculator, VLSM planner, mask and wildcard converter
- Lab Check panel with score rings, and audit reports
- Scripts from the three old slots move into the workspace automatically

### Functions

- Lab Check: `beginChecks`, `check`, `checkEqual`, `checkDeviceExists`, `checkLinked`, `checkIpAddress`, `checkPortUp`, `checkHostname`, `checkVlan`, `checkConfigContains`, `endChecks`, `runChecks`
- Audit: `auditNetwork`, `auditSwitch`, `getIpInventory`, `getSubnets`, `findDuplicateIps`, `findDownLinks`, `findSubnetMismatches`, `findUnaddressedHosts`, `getTopologySummary`
- Batch: `runOnDevices`, `runOnAll`, `commandsToScript`

### Project

- Highlighter, linter and calculator are separate files with unit tests
- Browser tests of the editor (`tools/ui-smoke.js`) and a screenshot generator
- New banners, real screenshots and a social preview image
- `CITATION.cff`

## [1.0.0] - 2026-09-29

First public release.

### Editor

- New dark editor with three script tabs saved automatically
- Function browser with search, generated from the API reference, click to insert
- Snippets panel with ready blocks for common lab tasks
- Output panel for results, `log` lines, errors and run times
- Line numbers, cursor position, auto indent, block indent and outdent
- `Ctrl+Enter` runs the script, `Ctrl+Shift+Enter` runs the selection, `Ctrl+S` saves
- Adjustable font size
- No external files: no framework, works offline

### Functions

- Devices: add, remove, rename, move, power, modules, ports, custom data, physical workspace, clock
- Links: every cable type, delete, auto connect, neighbors, link state
- Hosts: static and DHCP IPv4, IPv6, firewall, command prompt
- IOS: basic setup, passwords, banner, users, interfaces, subinterfaces, loopbacks, router on a stick, router DHCP and relay, NTP, syslog, SNMP, CDP, LLDP, show commands
- Switching: VLANs, access and voice ports, trunks, DTP, EtherChannel, STP, PortFast, VTP, port security, DHCP snooping, dynamic ARP inspection
- Routing: static, floating, IPv6 static, OSPF, OSPFv3, EIGRP, EIGRP for IPv6, RIP, RIPng, BGP, redistribution
- Security: standard, extended, named and IPv6 ACLs, NAT, PAT, NAT pools, port forwarding, SSH, login hardening, AAA
- Redundancy: HSRP
- Server services: DHCP, DNS, HTTP, HTTPS, web pages, FTP, email, TFTP, syslog, RADIUS
- Wireless: SSID, WEP, WPA, WPA2, radio mode, hidden SSID, MAC filter
- Inspection: switch port state, port security counters, VLAN database, STP root and ports, VTP, static MAC entries, OSPF and EIGRP processes
- Files: read and write text files, run script files, export topology and configs
- Command log: record and read every CLI command
- Canvas: notes, lines, circles, rectangles, polylines, dashed lines, arrows, zones, labels, layers
- Topology: star, ring, line, mesh and LAN generators, layouts, VLSM planner, /30 planner
- Simulation: mode, PDUs, filters, stepping, ping, traceroute
- Workspace: zoom, background, remote networks, project files, events
- A `build...` command builder for every IOS helper

### Project

- `release/ptforge.js` single file build
- 32 examples and 4 templates
- Test suite with a Packet Tracer mock: unit, integration, examples, recipes, bundle and hygiene checks
- Documentation: guides, API reference, recipes, architecture, CCNA topic map, cheat sheets, reference tables

[1.0.0]: https://github.com/r4chan842/PTForge/releases/tag/v1.0.0
