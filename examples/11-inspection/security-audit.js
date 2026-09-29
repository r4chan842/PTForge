addDevice("S1", "2960-24TT", 300, 150);
var ports = ["FastEthernet0/1", "FastEthernet0/2", "FastEthernet0/3", "FastEthernet0/4"];
setAccessPort("S1", ports, 1);
configurePortSecurity("S1", ports.slice(0, 2), { maximum: 1, violation: "shutdown" });

var audit = ports.map(function (port) {
    var status = getPortSecurityStatus("S1", port);
    return port + ": " + (status && status.enabled ? "secured, max " + status.maximum : "NOT secured");
});

var violations = findSecurityViolations("S1");
audit.push("Ports with violations: " + (violations.length ? violations.map(function (v) { return v.port; }).join(", ") : "none"));
log(audit.join("\n"));
