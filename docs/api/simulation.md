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
| `pingAll(device, targets)` | Ping a list of targets. With no arguments it runs `reachability()` for the whole network |

## Reachability

A ping matrix from every router and switch to every address in the topology, with a colored grid in the editor.

| Function | Description |
|----------|-------------|
| `reachability(options)` | Ping every address from every router and switch that has one. Options: `sources`, `targets`, `count`. Returns `{ rows, total, ok, partial, failed, unknown, sources, targets }` and opens the Reachability view |
| `pingMatrix(sources, targets, count)` | Ping each target from each source. Targets can be addresses or device names. Returns the same report without opening the view |
| `pingTest(source, target, count)` | One ping with a parsed result: `{ source, target, ip, state, percent, sent, received, rtt, output }` |
| `parsePingOutput(text)` | Read IOS or host ping output: `{ sent, received, percent, rtt }` |

`state` is `ok` (every reply came back), `partial` (some replies, usually the first ping while ARP resolves), `failed`, `unknown` (output could not be read) or `sent` (the source is a host).

Pings from routers and switches return their output right away, so they are measured. A PC or server runs the ping in its own Command Prompt and the result appears there, so hosts are used as targets, not sources.

```js
var report = pingAll();
log(report.ok + " of " + report.total + " pings succeeded");
report.rows.filter(function (r) { return r.state !== "ok"; }).forEach(function (r) {
    log(r.source + " -> " + r.target + " " + r.state);
});
```

```js
setSimulationMode(true);
setSimulationFilter("ICMP");
addSimplePdu("PC1", "SRV");
stepForward(5);
```
