<div align="center">

<img src="assets/banner.svg" alt="PTForge" width="100%">

<br>

**Build, configure, verify and document entire Cisco Packet Tracer networks with JavaScript.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=ff8a1f)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Functions](https://img.shields.io/badge/functions-350%2B-blue)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Runtime](https://img.shields.io/badge/runtime-ES5-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Quick start](#quick-start) ·
[Installation](docs/guides/installation.md) ·
[Documentation](docs/README.md) ·
[API](docs/api/README.md) ·
[Examples](examples/README.md) ·
[CCNA map](docs/ccna/README.md) ·
[فارسی](README.fa.md)

</div>

---

## Why PTForge

Building a lab in Packet Tracer means dragging devices, picking cables, opening every CLI and typing the same commands again and again. One typo in a VLAN list or a wildcard mask can cost an hour.

PTForge replaces the clicking with a script. You describe the network once, press **Run**, and Packet Tracer builds it: devices, modules, cables, IOS configuration, server services, wireless, labels and zones. Then PTForge reads the live state back so the same script can verify its own work.

- **Repeatable**: rebuild a lab from scratch in seconds, as often as you want
- **Shareable**: a lab is a text file you can send, review and keep in Git
- **Correct**: addresses, masks and wildcards are calculated, typos throw clear errors
- **Verifiable**: inspection functions read VLANs, trunks, STP, port security and routing processes directly from Packet Tracer
- **Documented**: every function has a reference entry, and the editor lets you search them all

<div align="center">
<img src="assets/editor.png" alt="PTForge editor" width="90%">
<br><sub>The PTForge editor: script tabs, function browser, snippets and an output panel</sub>
</div>

## Quick start

1. Add [`release/ptforge.js`](release/ptforge.js) and the files in [`src/ui`](src/ui) to a new Script Module in Packet Tracer
2. Open `Extensions` → `PTForge Editor`
3. Paste a script from [`examples/`](examples/README.md) and press `Ctrl+Enter`

## A taste

```js
buildLan({ switchName: "S1", hosts: 4, network: "192.168.10.0/24", x: 300, y: 250 });
addDevice("R1", "2911", 300, 80);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");

basicSetup("R1", { secret: "class", consolePassword: "cisco", banner: "Authorized access only" });
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
configureSsh("R1", { domain: "lab.local", username: "admin", password: "Adm1n!Pass" });

createVlans("S1", { 10: "USERS", 99: "MGMT" });
setAccessPort("S1", ["FastEthernet0/1", "FastEthernet0/2"], 10, { portfast: true, bpduguard: true });
configurePortSecurity("S1", ["FastEthernet0/1", "FastEthernet0/2"], { maximum: 2 });

drawZoneAround(["S1", "PC1", "PC2", "PC3", "PC4"], "VLAN 10 - Users", "green");
labelAllDevices();

log(getVlans("S1"));
log(getPortSecurityStatus("S1", "FastEthernet0/1"));
```

Twenty lines give you a router, a switch, four addressed PCs, a hardened router with SSH, VLANs, secured access ports, a labelled diagram and a verification report.

## Features

| Area | What you can do |
|------|-----------------|
| 🖥️ **Devices** | Add, remove, rename, move, power cycle, install modules, read ports, store custom data, place devices in the physical workspace |
| 🔌 **Links** | Every cable type, delete links, auto connect, list neighbors, check link state |
| 💻 **Hosts** | Static or DHCP IPv4, IPv6 with SLAAC, gateway, DNS, firewall, command prompt |
| ⚙️ **Cisco IOS** | Basic setup, passwords, banners, users, interfaces, subinterfaces, loopbacks, router on a stick, DHCP pools and relay, NTP, syslog, SNMP, CDP, LLDP, show commands |
| 🔀 **Switching** | VLANs, access and voice ports, trunks, DTP, EtherChannel (LACP, PAgP, static, layer 3), Rapid PVST+, PortFast, BPDU guard, VTP, port security, DHCP snooping, DAI |
| 🧭 **Routing** | Static and floating routes, OSPF, OSPFv3, EIGRP, EIGRP for IPv6, RIP, RIPng, BGP, redistribution |
| 🛡️ **Security** | Standard, extended, named and IPv6 ACLs, NAT, PAT, NAT pools, port forwarding, SSH, login blocking, AAA with RADIUS and TACACS+ |
| ♻️ **Redundancy** | HSRP on one router or as an active and standby pair |
| 🗄️ **Servers** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, web pages, FTP users, email accounts, TFTP, syslog, RADIUS |
| 📶 **Wireless** | SSID, WPA2, WPA, WEP, radio mode, hidden SSID, MAC filtering |
| 🔍 **Inspection** | Switch port state, port security counters, VLAN database, STP root and root ports, VTP, static MACs, OSPF and EIGRP processes |
| 📁 **Files** | Read and write text files, run scripts from disk, export configs and topology, command log |
| 🎨 **Canvas** | Notes, lines, circles, rectangles, arrows, dashed lines, zones, device and link labels, layers |
| 🗺️ **Topology** | Star, ring, line, mesh and LAN generators, grid and circle layouts, VLSM and /30 planners |
| 🧪 **Simulation** | Simulation mode, PDUs, protocol filters, stepping, ping, traceroute |
| 🪟 **Workspace** | Zoom, background, remote networks, open and save projects, workspace events |

Every IOS helper also has a `build...` twin that returns the commands instead of sending them, so you can preview, combine and reuse configuration.

## The editor

| Part | Description |
|------|-------------|
| **Script tabs** | Three scripts, each saved automatically inside Packet Tracer |
| **Functions** | Every public function with its arguments and a short description. Search by name, area or purpose and click to insert |
| **Snippets** | Ready blocks: small LAN, hardening, VLANs and trunk, router on a stick, OSPF, DHCP, server services, ACL, PAT, inspection, documentation |
| **Output** | Results of `showResult` and `log`, errors with line numbers, run time |
| **Keyboard** | `Ctrl+Enter` run, `Ctrl+Shift+Enter` run selection, `Ctrl+S` save, `Tab` and `Shift+Tab` indent |

See [editor shortcuts](docs/cheatsheets/keyboard.md).

## Installation

PTForge is a Packet Tracer Script Module. Packet Tracer encrypts `.pts` packages and only Packet Tracer can create them, so you build the module once from the files in this repository.

1. Download the [latest release](https://github.com/r4chan842/PTForge/releases/latest) or clone the repository
2. In Packet Tracer open `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Create a module named `PTForge`
4. Add one script file with the content of [`release/ptforge.js`](release/ptforge.js)
5. Add `index.html`, `style.css`, `interface.js` and `catalog.js` from [`src/ui`](src/ui) as interface files
6. Save the module, start it and open `Extensions` → `PTForge Editor`

The [installation guide](docs/guides/installation.md) covers every step, updates and the multi file option.

## Examples

32 complete labs in [`examples/`](examples/README.md), each starting from an empty workspace:

| Folder | Labs |
|--------|------|
| `01-basics` | First network, modules and serial links, secure baseline |
| `02-switching` | VLANs and trunks, EtherChannel, STP root, layer 3 switch |
| `03-routing` | Static, OSPF multi area, EIGRP, BGP, IPv6 with OSPFv3 |
| `04-security` | ACL, NAT and PAT, SSH and port security, HSRP |
| `05-services` | Server DHCP, DNS and web, FTP and email, router DHCP with relay |
| `06-wireless` | Home wireless network |
| `07-canvas` | Labels and zones |
| `08-topology` | Generated campus, star, ring and mesh, VLSM plan |
| `09-simulation` | Ping test |
| `10-ccna-labs` | Router on a stick, full enterprise lab |
| `11-inspection` | Switching verification, port security audit |
| `12-automation` | Config backup, command audit, script library |

Starting points for your own work are in [`templates/`](templates/README.md): blank lab, campus, branch WAN and small office.

## Documentation

| Section | Content |
|---------|---------|
| [Getting started](docs/guides/getting-started.md) | Your first network in ten minutes |
| [Writing scripts](docs/guides/writing-scripts.md) | Structure, order of operations, builders, speed |
| [API reference](docs/api/README.md) | Every function with arguments, return values and examples |
| [Recipes](docs/recipes/README.md) | Campus switching, routing labs, edge router, servers, diagrams |
| [CCNA topic map](docs/ccna/README.md) | CCNA 200-301 topics with the matching functions and examples |
| [Cheat sheets](docs/cheatsheets/ios-to-ptforge.md) | IOS to PTForge, subnetting, editor keys |
| [Architecture](docs/architecture/overview.md) | Layers, runtime, editor bridge, tests |
| [Reference tables](docs/README.md#reference-tables) | Device models, modules, cable types, port names |
| [Troubleshooting](docs/guides/troubleshooting.md) | Common errors and fixes |
| [Limitations](docs/guides/limitations.md) | What the Packet Tracer API does not allow |
| [FAQ](docs/guides/faq.md) | Short answers |

## Project layout

```
PTForge/
├── .github/            issue forms, pull request template, code owners
├── assets/             logo, banner, screenshots
├── docs/
│   ├── api/            reference for every function, one page per area
│   ├── architecture/   layers, runtime and testing
│   ├── ccna/           CCNA topic map and lab checklist
│   ├── cheatsheets/    IOS mapping, subnetting, editor keys
│   ├── guides/         installation, getting started, troubleshooting, FAQ
│   ├── recipes/        ready snippets by task
│   └── reference/      generated tables of models, modules, cables, ports
├── examples/           32 complete labs in 12 topics
├── release/            ptforge.js single file build
├── src/
│   ├── api/            public functions, one folder per area
│   ├── core/           context, layers, runner, editor window, entry point
│   ├── data/           model, module, cable and type tables
│   ├── lib/            IPv4 math, colors, text helpers
│   └── ui/             editor interface
├── templates/          starting points for new labs
├── tests/
│   ├── helpers/        loader and Packet Tracer mock
│   ├── integration/    full extension tests
│   └── unit/           pure function and builder tests
└── tools/              load order, bundler, catalog and reference generators, CI workflow
```

## Development

Requires Node.js 18 or newer. There are no dependencies to install.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Command | Purpose |
|---------|---------|
| `npm test` | Run the full test suite |
| `npm run bundle` | Rebuild `release/ptforge.js` |
| `npm run catalog` | Regenerate the editor function list from `docs/api` |
| `npm run reference` | Regenerate the reference tables from `src/data` |
| `npm run check` | Catalog, bundle, syntax check and tests |

The test suite runs the whole extension against a mock of the Packet Tracer IPC API. It covers every public function, every example, template and recipe, the release bundle, and project rules such as ES5 only code and complete documentation. Read [testing](docs/architecture/testing.md) for details.

## Contributing

Bug reports, ideas and pull requests are welcome. Start with [CONTRIBUTING](CONTRIBUTING.md), check the [roadmap](ROADMAP.md) and follow the [code of conduct](CODE_OF_CONDUCT.md). Security problems go through the [security policy](SECURITY.md). For questions see [SUPPORT](SUPPORT.md).

## License

PTForge is released under the [MIT License](LICENSE).

## Acknowledgements

Packet Tracer API usage follows the official [Cisco Packet Tracer IPC API documentation](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html).

Cisco and Packet Tracer are trademarks of Cisco Systems, Inc. This project is not affiliated with or endorsed by Cisco Systems, Inc.

<div align="center">
<sub>Made for network students, instructors and anyone tired of clicking the same lab twice.</sub>
</div>
