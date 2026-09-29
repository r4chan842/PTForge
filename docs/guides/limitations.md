# Limitations and assumptions

What PTForge cannot do, and which parts are built from the documentation without a confirmed run in every Packet Tracer version.

← [Documentation](../README.md)

## Not possible through the API

| Feature | Reason |
|---------|--------|
| Clusters | The Packet Tracer API only clusters the current mouse selection |
| Filled rectangles and shapes | Only lines, circles and notes can be drawn. Rectangles are drawn as four lines |
| Building a `.pts` package | Packages are encrypted by Packet Tracer |
| Selecting or dragging with the mouse | Mouse only features are out of scope |

## Tested how

The test suite (`npm test`) runs the whole extension against a mock of the Packet Tracer IPC API. It checks the commands sent, the API calls made, argument handling, errors, every example and the release bundle. It cannot prove that Packet Tracer itself accepts every call.

API method names and arguments come from the official Cisco Packet Tracer IPC documentation.

## Assumptions to confirm in Packet Tracer

| Area | Assumption |
|------|------------|
| Show commands | CLI output is returned by `enterCommand`. Some versions return an empty string |
| 3650 trunks | `switchport trunk encapsulation dot1q` may be rejected. The rejection is reported and the rest applies |
| HTTPS | The server process is named `HttpsServer` |
| Wireless | `WirelessServer` / `WirelessCommon` method names come from the docs |
| Simulation filters | Protocol names such as `ICMP` must match the Packet Tracer filter list |
| DHCP relay | `setDhcpRelay` sends `ip helper-address` and needs a router or layer 3 switch |
| Inspection processes | `VlanManager`, `StpMain`, `Vtp`, `MacSwitch`, `OspfMain`, `EigrpMain` process names follow the naming used by server processes. Both forms with and without `Process` are tried |
| Enum values | `modeCode` fields are raw numbers because the documentation does not list enum values |
| Owner device lookup | `getOwnerDevice` may be missing in older versions. Functions that use it fall back gracefully |

Please report results for your Packet Tracer version in the issues.
