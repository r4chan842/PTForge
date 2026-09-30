buildLan({ switchName: "S1", hosts: 2, hostPrefix: "SALES", network: "192.168.10.0/24", gateway: "192.168.10.1", x: 200, y: 260 });
buildLan({ switchName: "S2", hosts: 2, hostPrefix: "IT", network: "192.168.20.0/24", gateway: "192.168.20.1", x: 520, y: 260 });

addDevice("R1", "2911", 360, 80);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");
addLink("R1", "GigabitEthernet0/1", "S2", "GigabitEthernet0/1", "straight");

setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
setInterfaceIp("R1", "GigabitEthernet0/1", "192.168.20.1/24");

var report = pingAll();
log(report.ok + " of " + report.total + " pings answered");
report.rows.filter(function (row) {
    return row.state !== "ok";
}).forEach(function (row) {
    log(row.source + " -> " + row.target + ": " + row.state);
});
