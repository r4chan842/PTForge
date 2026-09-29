# Wireless

Works on `AccessPoint-PT` variants and `Linksys-WRT300N`.

← [API index](README.md)

| Function | Description |
|----------|-------------|
| `configureWireless(name, options)` | SSID, security, key, radio mode |
| `getWirelessSsid(name)` | Current SSID |
| `setMacFilter(name, macs, allow)` | MAC filtering. An empty list turns filtering off |

| Option | Values |
|--------|--------|
| `ssid` | Network name |
| `security` | `open`, `wep`, `wpa-psk`, `wpa2-psk`. Default `wpa2-psk` when a key is given, otherwise `open` |
| `key` | WEP key, or WPA passphrase of 8 to 63 characters |
| `encryption` | `aes`, `tkip`, `wep64`, `wep128`. Chosen automatically when omitted |
| `mode` | `b`, `g`, `bg`, `n`, `a`, `mixed`, `disabled` |
| `hideSsid` | `true` stops SSID broadcast |

```js
configureWireless("AP1", { ssid: "CORP", security: "wpa2-psk", key: "Str0ngPassw0rd" });
configureWireless("AP2", { ssid: "GUEST" });
setMacFilter("AP1", ["0001.4282.AB11", "0060.2F3A.1B02"], true);
```
