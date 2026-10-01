Network tools
=============

Network calculator
------------------

Network → Open Network Calculator opens a calculator tab. Results update while you type, and any value can be copied with a click.

    Tool                 Input                                                                            Output
    -------------------  -------------------------------------------------------------------------------  ----------------------------------------------------------------------------------------------
    IPv4 Subnet          10.1.2.3/20, 10.1.2.3 255.255.240.0 or just an address for its classful network  Network, broadcast, first and last host, mask, wildcard, host count, class, scope, binary view
    Subnet Splitter      A network, and a new prefix, a number of subnets or hosts per subnet             Every subnet with its range
    VLSM Planner         An address block and one line per subnet, Sales 120 or Sales:120                 Subnets placed largest first, with unused space
    Route Summarization  Networks, one per line or separated by commas                                    The smallest summary route, and any extra space it covers
    Range to CIDR        First and last address, optional ACL name                                        The CIDR blocks and matching ACL lines
    Wildcard Mask        /22, 255.255.252.0 or 0.0.3.255                                                  Prefix, mask and wildcard
    IPv6 Address         Any notation, with or without prefix                                             Full and compressed forms, prefix, type, scope, embedded IPv4
    EUI-64               A prefix and a MAC address                                                       The interface ID and the full address
    Number Converter     Dotted, decimal, hex or binary                                                   All forms

The same math is available in the terminal with .calc, and in scripts with the functions in https://github.com/r4chan842/PTForge/blob/main/docs/api/utilities.md.

Reachability matrix
-------------------

Network → Reachability Matrix (Ping All), or pingAll() in a script, pings every address from every router and switch. Hosts are used as sources when no router or switch has an address.

Each ping runs in Packet Tracer's own time, so the matrix fills in a few seconds after you start it. The results appear in the Reachability tab, in the terminal that started the test, and in the Output panel. stopPings() cancels a running test.

- Green: all replies. Yellow: some loss. Red: no reply. Grey: not tested
- Each cell shows the success rate and the average round-trip time
- A problems table lists every failed or partial ping with the device output
- Run Again repeats the test, Copy as CSV copies the whole matrix

    pingAll();
    pingMatrix(["PC1", "PC2"], ["10.0.0.1", "SRV"], 2, function (report) {
        log(report.ok + " of " + report.total + " answered");
    });

See https://github.com/r4chan842/PTForge/blob/main/docs/api/simulation.md#reachability for every option.

Snapshots
---------

A snapshot records devices, links, addresses, port state, power and running configurations.

* Take: Network → Take Snapshot..., the Snapshots section of the Devices view, .snap or takeSnapshot("name")
* Compare: Network → Compare Snapshots..., a snapshot in the Devices view, .diff or showSnapshotDiff("name")
* Save to disk: saveSnapshot("name", "file.json")
* Load: loadSnapshot("file.json", "name")

The compare tab shows counters for devices, links, addresses, ports, power and configs, then a table of every change and a line diff of each running config with added lines in green and removed lines in red.

    takeSnapshot("before");
    configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
    showSnapshotDiff("before");

See https://github.com/r4chan842/PTForge/blob/main/docs/api/snapshots.md.
