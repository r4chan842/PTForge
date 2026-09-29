# Cisco IOS

Everything that talks to the CLI of routers, switches and multilayer switches.

← [API index](README.md)

## How configuration works

Every configuration function ends up in `configureIosDevice`, which:

1. Skips the boot sequence
2. Moves the CLI to global configuration mode, even if the device has passwords
3. Sends each line and records the ones IOS rejects
4. Returns to privileged mode with `end`
5. Runs `write memory` unless `save` is `false`

It returns an array of rejected commands, `[]` when everything was accepted:

```js
var failed = configureIosDevice("R1", "router ospf 1\n network 10.0.0.0 0.255.255.255 area 0");
if (failed.length) {
    showResult(failed);
}
```

`applyConfig` does the same thing but throws on the first problem, which stops the script with a clear message.

## Core

| Function | Returns | Description |
|----------|---------|-------------|
| `configureIosDevice(name, commands, save)` | object[] | Send a string with new lines or an array of lines |
| `applyConfig(name, commands, save)` | bool | Same as above, throws when a line is rejected |
| `applyToDevices(names, commands, save)` | object | Send the same config to many devices, returns rejected lines per device |
| `runCommand(name, command, mode)` | object | One command in `user`, `enable`, `global` or current mode `""`. Returns `{ status, output }` |
| `saveConfig(name)` | bool | `write memory` |
| `saveAllConfigs()` | string[] | Save every router and switch |
| `getPrompt(name)` | string | Current CLI prompt |
| `getCliMode(name)` | string | Current CLI mode |

`status` is one of `ok`, `ambiguous`, `invalid`, `incomplete`, `notImplemented`.

## Batch commands

Run the same command on many devices at once and collect every answer. Handy for quick health checks across a whole lab.

| Function | Returns | Description |
|----------|---------|-------------|
| `runOnDevices(names, command, mode)` | object[] | `[{ device, status, output }]` for every device, errors are reported per device instead of stopping |
| `runOnAll(command, mode)` | object[] | Same, for every router and switch in the topology |
| `commandsToScript(name)` | string | Turn the Packet Tracer command log into a `configureIosDevice` script. Show, ping, exit and similar commands are dropped. Leave out `name` for all devices. The script also opens in a new editor tab |

```js
runOnAll("show ip interface brief").forEach(function (r) {
    log(r.device + "\n" + r.output);
});

setCommandLogging(true);
commandsToScript("R1");
```

## Show commands

| Function | Returns | Description |
|----------|---------|-------------|
| `showCommand(name, command)` | string | Run a show command, the `show` prefix is optional |
| `getRunningConfig(name)` | string | `show running-config` |
| `getRoutingTable(name)` | string | `show ip route` |
| `getInterfacesBrief(name)` | string | `show ip interface brief` |
| `getVlanBrief(name)` | string | `show vlan brief` |
| `getHostname(name)` | string | Configured hostname |

> The text returned by show commands comes from the Packet Tracer API. Some Packet Tracer versions return an empty string. See [limitations](../guides/limitations.md).

## Device basics

| Function | Description |
|----------|-------------|
| `basicSetup(name, options)` | Hostname, secret, passwords, banner and more in one call |
| `setHostname(name, hostname)` | `hostname` |
| `setBanner(name, text)` | `banner motd` |
| `setEnableSecret(name, secret)` | `enable secret` |
| `setConsolePassword(name, password)` | Console password with `login` |
| `setVtyPassword(name, password)` | VTY 0 15 password with `login` |
| `addLocalUser(name, username, password, privilege)` | `username ... secret` |
| `enablePasswordEncryption(name)` | `service password-encryption` |
| `setDomainName(name, domain)` | `ip domain-name` |
| `setNameServer(name, servers)` | `ip name-server` |
| `addHostEntry(name, hostname, ip)` | `ip host` |

`basicSetup` options:

| Option | Default | Result |
|--------|---------|--------|
| `hostname` | device name | `hostname` |
| `secret` | | `enable secret` |
| `consolePassword` | | console password, `login`, `logging synchronous` |
| `vtyPassword` | | VTY password and `login` |
| `banner` | | `banner motd` |
| `domain` | | `ip domain-name` |
| `noDomainLookup` | `true` | `no ip domain-lookup` |
| `encryptPasswords` | `true` | `service password-encryption` when a password is set |

## Interfaces

| Function | Description |
|----------|-------------|
| `setInterfaceIp(name, interface, address, mask, description)` | IPv4 address and `no shutdown` |
| `setInterfaceDhcp(name, interface)` | `ip address dhcp` |
| `setInterfaceIpv6(name, interface, address, options)` | IPv6 address. Options: `eui64`, `linkLocal`, `enable` |
| `shutdownInterface(name, interfaces)` | `shutdown` on one or many interfaces |
| `enableInterface(name, interfaces)` | `no shutdown` on one or many interfaces |
| `setInterfaceDescription(name, interface, text)` | `description` |
| `setClockRate(name, interface, rate)` | `clock rate`, default 64000 |
| `setBandwidth(name, interface, kbps)` | `bandwidth` |
| `setSpeedDuplex(name, interface, speed, duplex)` | `speed` and `duplex` |
| `addLoopback(name, number, address, mask)` | Loopback interface, default mask /32 |
| `addSubinterface(name, parent, vlan, address, mask, native)` | 802.1Q subinterface |
| `routerOnAStick(name, parent, { vlan: address })` | Every subinterface at once |

```js
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.1.1/24");
setInterfaceIp("R1", "Serial0/1/0", "10.0.0.1", "255.255.255.252", "Link to R2");
addLoopback("R1", 0, "1.1.1.1");

routerOnAStick("R1", "GigabitEthernet0/1", {
    10: "192.168.10.1/24",
    20: "192.168.20.1/24",
    99: "192.168.99.1/24"
});
```

## DHCP on IOS

| Function | Description |
|----------|-------------|
| `addRouterDhcpPool(name, pool)` | DHCP pool on the router itself |
| `excludeRouterDhcp(name, start, end)` | `ip dhcp excluded-address` |
| `removeRouterDhcpPool(name, pool)` | `no ip dhcp pool` |
| `setDhcpRelay(name, interface, servers)` | `ip helper-address` |

Pool fields: `name`, `network`, `mask`, `gateway`, `dns` (string or array), `domain`, `tftp`, `excluded` (array of `[start, end]`).

```js
addRouterDhcpPool("R1", {
    name: "LAN",
    network: "192.168.1.0/24",
    gateway: "192.168.1.1",
    dns: "8.8.8.8",
    excluded: [["192.168.1.1", "192.168.1.20"]]
});
```

## Management

| Function | Description |
|----------|-------------|
| `setNtpServer(name, servers)` | `ntp server` |
| `setSyslogServer(name, servers, trapLevel)` | `logging` host, trap level and timestamps |
| `setSnmpCommunity(name, community, access)` | `snmp-server community`, access `ro` or `rw` |
| `setCdp(name, enabled)` | `cdp run` |
| `setLldp(name, enabled)` | `lldp run` |
| `setDefaultGateway(name, gateway)` | `ip default-gateway` for layer 2 switches |
| `enableIpRouting(name)` | `ip routing` for multilayer switches |
| `enableIpv6Routing(name)` | `ipv6 unicast-routing` |

## Command builders

Builders return the command lines without sending them. Use them to preview or combine configuration.

| Function | Returns |
|----------|---------|
| `buildBasicSetup(options)` | lines for `basicSetup` |
| `buildInterfaceIp(interface, address, mask, description)` | interface block |
| `buildSubinterface(parent, vlan, address, mask, native)` | subinterface block |
| `buildRouterDhcpPool(pool)` | DHCP pool block |

```js
var lines = buildBasicSetup({ hostname: "R9", secret: "class" })
    .concat(buildInterfaceIp("GigabitEthernet0/0", "10.0.0.1/24"));
showResult(lines);
applyConfig("R1", lines);
```
