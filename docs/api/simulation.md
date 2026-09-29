# Simulation and testing

← [API index](README.md)

## Simulation mode

| Function | Description |
|----------|-------------|
| `setSimulationMode(on)` | Switch between realtime and simulation |
| `isSimulationMode()` | Current mode |
| `resetSimulation()` | Clear the event list |
| `playSimulation()` | Press Play |
| `stepForward(steps)` | Capture forward |
| `stepBack(steps)` | Step back |
| `setSimulationFilter(protocol, visible)` | Show or hide a protocol, for example `ICMP` |
| `showAllSimulationFilters()` | Show every protocol |
| `getSimulationTime()` | Simulation time |
| `getSimulationEventCount()` | Number of captured events |

## PDUs

| Function | Description |
|----------|-------------|
| `addSimplePdu(source, destination)` | Add a simple PDU between two devices |
| `firePdu(index)` | Fire a PDU from the list |
| `deletePdu(index)` | Remove a PDU |

## Connectivity

| Function | Description |
|----------|-------------|
| `ping(device, target, count)` | Ping from a router, switch or host |
| `traceroute(device, target)` | `traceroute` on IOS, `tracert` on hosts |
| `pingAll(device, targets)` | Ping a list of targets |

```js
setSimulationMode(true);
setSimulationFilter("ICMP");
addSimplePdu("PC1", "SRV");
stepForward(5);
```
