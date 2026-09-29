function finding(severity, rule, device, port, message) {
    return { severity: severity, rule: rule, device: device, port: port || "", message: message };
}

function auditSwitch(deviceName) {
    var device = findDevice(deviceName);
    var findings = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        var port = device.getPortAt(i);
        if (typeof port.getAccessVlan !== "function") {
            continue;
        }
        var name = String(port.getName());
        var up = callIfExists(port, "isPortUp", false) === true;
        var access = callIfExists(port, "isAccessPort", false) === true;
        var linked = !!callIfExists(port, "getLink", null);
        if (access && up && port.getAccessVlan() === 1) {
            findings.push(finding("warning", "vlan1-access", deviceName, name, "Active access port is still in VLAN 1"));
        }
        if (access && linked) {
            var security = callIfExists(port, "getPortSecurity", null);
            if (security && callIfExists(security, "isEnabled", false) !== true) {
                findings.push(finding("info", "no-port-security", deviceName, name, "Access port without port security"));
            }
        }
        if (!linked && callIfExists(port, "getPower", true) === true && name.indexOf("Vlan") !== 0) {
            findings.push(finding("info", "unused-enabled", deviceName, name, "Unused port is not shut down"));
        }
    }
    return findings;
}

function auditNetwork() {
    var findings = [];
    findDuplicateIps().forEach(function (item) {
        findings.push(finding("error", "duplicate-ip", item.owners[0].split(" ")[0], "", item.ip + " is used by " + item.owners.join(", ")));
    });
    findSubnetMismatches().forEach(function (item) {
        findings.push(finding("error", "subnet-mismatch", item.from.device, item.from.port, item.from.ip + " and " + item.to.device + " " + item.to.port + " " + item.to.ip + " are not in the same subnet"));
    });
    findDownLinks().forEach(function (item) {
        findings.push(finding("warning", "link-down", item.from.device, item.from.port, "Link to " + item.to.device + " " + item.to.port + " is down"));
    });
    findUnaddressedHosts().forEach(function (item) {
        findings.push(finding("warning", "no-address", item.device, item.port, "Cabled host port has no IP address and no DHCP"));
    });
    getDevices(["switch", "multilayerswitch", "switch3650"]).forEach(function (name) {
        findings = findings.concat(auditSwitch(name));
    });
    var report = {
        errors: countSeverity(findings, "error"),
        warnings: countSeverity(findings, "warning"),
        infos: countSeverity(findings, "info"),
        findings: findings
    };
    console.log(formatAudit(report));
    notifyEditor("audit", JSON.stringify(report));
    return report;
}

function countSeverity(findings, severity) {
    return findings.filter(function (f) {
        return f.severity === severity;
    }).length;
}

function formatAudit(report) {
    var lines = ["Audit: " + report.errors + " errors, " + report.warnings + " warnings, " + report.infos + " notes"];
    report.findings.forEach(function (f) {
        lines.push("  " + f.severity.toUpperCase() + "  " + f.device + (f.port ? " " + f.port : "") + "  " + f.message);
    });
    return lines.join("\n");
}
