Lab Check
=========

Write the expected result of a lab as a list of checks, run it, and get a graded report. The report opens in the Lab Check panel of the editor, and a plain text version goes to the console. Instructors can use it to grade a lab, and students can use it to check their own work.

How it works
------------

1. beginChecks(title) starts a new report
2. Every check... call adds one line, passed or failed, with a number of points (1 by default)
3. endChecks() scores the report, shows it and returns it

A check never stops the script. If the condition throws (a device is missing, for example), the check fails and the error message becomes the hint.

Functions
---------

| Function | Returns | Description |
|----------|---------|-------------|
| `beginChecks(title)` | bool | Start a new report |
| `check(name, condition, hint, points)` | bool | Passes when `condition` is truthy. `condition` can be a value or a function |
| `checkEqual(name, actual, expected, points)` | bool | Compares values with JSON, so arrays and objects work. `actual` can be a function |
| `checkDeviceExists(name, points)` | bool | The device is in the topology |
| `checkLinked(deviceA, deviceB, points)` | bool | A cable connects the two devices |
| `checkIpAddress(name, port, ip, mask, points)` | bool | The port has this address, `mask` is optional and accepts `24` or `255.255.255.0` |
| `checkPortUp(name, port, points)` | bool | The port is up |
| `checkHostname(name, hostname, points)` | bool | Configured IOS hostname |
| `checkVlan(name, vlanId, points)` | bool | The VLAN exists in the switch database |
| `checkConfigContains(name, text, points)` | bool | The running-config contains this text |
| `endChecks()` | object | `{ title, total, passed, failed, score, maxScore, percent, items }` |
| `runChecks(title, list)` | object | Everything above in one call. `list` is `[{ name, test, hint, points }]` |

Example
-------

    beginChecks("VLAN lab");
    checkDeviceExists("S1");
    checkLinked("S1", "PC1");
    checkVlan("S1", 10, 2);
    checkIpAddress("PC1", "FastEthernet0", "192.168.10.11", 24);
    checkConfigContains("S1", "switchport mode trunk");
    check("Two VLANs besides default", function () {
        return getVlans("S1").filter(function (v) { return v.id > 1 && v.id < 1002; }).length >= 2;
    }, "create VLAN 10 and 20");
    var report = endChecks();
    log(report.percent + "%");

The same lab with runChecks:

    runChecks("Quick check", [
        { name: "R1 is up", test: function () { return getPortInfo("R1", "GigabitEthernet0/0").up; } },
        { name: "OSPF router id", test: function () { return getOspfInfo("R1")[0].routerId === "1.1.1.1"; }, points: 2 }
    ]);
