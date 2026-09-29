# Utilities

Helpers available in every script.

← [API index](README.md)

## IPv4

| Function | Example | Result |
|----------|---------|--------|
| `isValidIp(ip)` | `isValidIp("10.0.0.300")` | `false` |
| `ipToInt(ip)` | `ipToInt("0.0.1.0")` | `256` |
| `intToIp(number)` | `intToIp(167772161)` | `"10.0.0.1"` |
| `cidrToMask(prefix)` | `cidrToMask(26)` | `"255.255.255.192"` |
| `maskToCidr(mask)` | `maskToCidr("255.255.240.0")` | `20` |
| `maskToWildcard(mask)` | `maskToWildcard("255.255.255.0")` | `"0.0.0.255"` |
| `normalizeMask(mask)` | `normalizeMask(30)` | `"255.255.255.252"` |
| `parseNetwork(address, mask)` | `parseNetwork("10.1.2.3/16")` | `{ ip, mask, prefix, wildcard, network, broadcast, size }` |
| `networkAddress(address, mask)` | `networkAddress("10.1.2.3/16")` | `"10.1.0.0"` |
| `broadcastAddress(address, mask)` | `broadcastAddress("10.1.2.3/16")` | `"10.1.255.255"` |
| `hostRange(address, mask)` | `hostRange("10.0.0.0/29")` | `{ first, last, count }` |
| `nthHost(network, index)` | `nthHost("10.0.0.0/24", -1)` | `"10.0.0.254"` |
| `splitSubnet(network, prefix)` | `splitSubnet("10.0.0.0/24", 26)` | four /26 networks |
| `isInSubnet(ip, network)` | `isInSubnet("10.0.0.9", "10.0.0.0/28")` | `true` |
| `ipAndMask(address, mask)` | `ipAndMask("10.0.0.1/30")` | `{ ip, mask }` |
| `networkAndWildcard(address)` | `networkAndWildcard("10.0.0.1/30")` | `"10.0.0.0 0.0.0.3"` |
| `networkAndMask(address)` | `networkAndMask("10.0.0.1/30")` | `"10.0.0.0 255.255.255.252"` |
| `aclAddress(value)` | `aclAddress("10.0.0.0/8")` | `"10.0.0.0 0.255.255.255"` |

## Output

| Function | Description |
|----------|-------------|
| `showResult(value)` | Show a value or object in the editor output panel and return it. Falls back to a message box when the editor is closed |
| `log(value)` | Write a line to the output panel without interrupting the script |
| `showMessage(text)` | Show a message box |

## Lists and colors

| Function | Description |
|----------|-------------|
| `toList(value)` | Wrap a single value in an array |
| `toRgb(color)` | Convert a color name or hex string to `[r, g, b]` |
