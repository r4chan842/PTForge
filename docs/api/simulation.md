Simulation and testing
======================

Simulation mode
---------------

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

PDUs
----

| Function | Description |
|----------|-------------|
| `addSimplePdu(source, destination)` | Add a simple PDU between two devices |
| `firePdu(index)` | Fire a PDU from the list |
| `deletePdu(index)` | Remove a PDU |

Connectivity
------------

| Function | Description |
|----------|-------------|
| `ping(device, target, count, onDone)` | Ping from a router, switch or host in the background. `onDone(row)` gets `{ source, target, state, sent, received, percent, output }`. In the terminal the output is printed when it finishes |
| `traceroute(device, target, onDone)` | `traceroute` on IOS, `tracert` on hosts. Runs in the background; `onDone(row)` gets `{ source, target, state, output, hops }`. In the terminal the output is printed when it finishes |
| `pingAll(device, targets)` | `reachability()` for the whole network, or only from `device` to `targets` |

Reachability
------------

A ping matrix from every router and switch to every address in the topology, with a colored grid in the editor.

| Function | Description |
|----------|-------------|
| `reachability(options)` | Ping every address from every router and switch that has one. When none has an address, hosts are used as sources. Options: `sources`, `targets`, `count`, `onDone(report)`. Opens the Reachability view when every ping has finished |
| `pingMatrix(sources, targets, count, onDone)` | Ping each target from each source. Targets can be addresses or device names. `onDone(report)` runs when every ping has finished |
| `stopPings()` | Cancel a running reachability test. Returns the number of devices that were still pinging |
| `pingTest(source, target, count)` | One immediate ping with a parsed result: `{ source, target, ip, state, percent, sent, received, rtt, output }` |
| `parsePingOutput(text)` | Read IOS or host ping output: `{ sent, received, percent, rtt }` |

A ping takes simulated time. Packet Tracer only moves time forward after the script returns, so a ping read inside the same call always looks like 0 percent. reachability and pingMatrix send each ping through the device's command line and listen for the outputWritten and commandEnded events of TerminalLine. The returned report starts with every row pending ({ rows, total, pending, done: false, ok, partial, failed, unknown, sources, targets }) and the same object is filled in as replies arrive. The final report is sent to the Reachability view, to the terminal that started it, and to onDone.

state is pending, ok (every reply came back), partial (some replies, usually the first ping while ARP resolves), failed, unknown (output could not be read) or error (bad target). Each device runs its pings one after another, and all devices run in parallel.

    pingAll();

    reachability({
        sources: ["R1", "R2"],
        count: 2,
        onDone: function (report) {
            report.rows.filter(function (r) { return r.state !== "ok"; }).forEach(function (r) {
                log(r.source + " -> " + r.target + " " + r.state);
            });
        }
    });

    setSimulationMode(true);
    setSimulationFilter("ICMP");
    addSimplePdu("PC1", "SRV");
    stepForward(5);
