# Server services

Configure `Server-PT` services directly through the Packet Tracer API, without clicking through the Services tab.

← [API index](README.md)

## DHCP

| Function | Description |
|----------|-------------|
| `addDhcpPool(name, pool, port)` | Add a pool and turn the service on |
| `removeDhcpPool(name, poolName, port)` | Delete a pool |
| `excludeDhcpRange(name, start, end, port)` | Exclude addresses |
| `setDhcpService(name, enabled, port)` | Turn the service on or off |
| `getDhcpPools(name, port)` | Every pool with its settings |

Pool fields: `name`, `start`, `mask` (`24` or `255.255.255.0`), `gateway`, `dns`, `maxUsers` (256), `tftp`, `wlc`. `port` defaults to `FastEthernet0`.

```js
addDhcpPool("SRV", {
    name: "VLAN10",
    start: "192.168.10.100",
    mask: 24,
    gateway: "192.168.10.1",
    dns: "192.168.50.10",
    maxUsers: 100
});
```

## DNS

| Function | Description |
|----------|-------------|
| `addDnsRecord(name, hostname, ip)` | A record, turns DNS on |
| `addDnsRecords(name, { hostname: ip })` | Many A records |
| `addDnsCname(name, alias, hostname)` | CNAME record |
| `addDnsNs(name, domain, server)` | NS record |
| `removeDnsRecord(name, hostname, ip)` | Delete an A record |
| `setDnsService(name, enabled)` | Turn DNS on or off |
| `getDnsRecordCount(name)` | Number of records |

## HTTP and HTTPS

| Function | Description |
|----------|-------------|
| `setHttpService(name, enabled)` | HTTP on or off |
| `setHttpsService(name, enabled)` | HTTPS on or off |
| `setWebPage(name, file, html)` | Create or replace a page |
| `getWebPage(name, file)` | Read a page |

## FTP

| Function | Description |
|----------|-------------|
| `addFtpUser(name, username, password, permissions)` | Add or replace a user |
| `removeFtpUser(name, username)` | Delete a user |
| `getFtpUsers(name)` | `{ username, permissions }` list |

Permissions are letters: `R` read, `W` write, `N` rename, `L` list, `D` delete. Default `RWNLD`.

## Email

| Function | Description |
|----------|-------------|
| `addEmailUser(name, username, password)` | Add a mailbox |
| `addEmailUsers(name, { username: password })` | Add or update many mailboxes |
| `removeEmailUser(name, username)` | Delete a mailbox |
| `setEmailPassword(name, username, password)` | Change a password |

## Other services

| Function | Description |
|----------|-------------|
| `setTftpService(name, enabled)` | TFTP on or off |
| `setSyslogService(name, enabled)` | Syslog on or off |
| `clearSyslog(name)` | Clear received logs |
| `setRadiusPort(name, port)` | RADIUS server port |
