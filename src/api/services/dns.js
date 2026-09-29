function dnsServer(deviceName) {
    return getProcessOf(deviceName, "DnsServer");
}

function setDnsService(deviceName, enabled) {
    dnsServer(deviceName).setEnable(enabled !== false);
    return true;
}

function addDnsRecord(deviceName, hostname, ipAddress) {
    var dns = dnsServer(deviceName);
    dns.setEnable(true);
    return dns.addARecordToNameServerDb(hostname, ipAddress) === true;
}

function addDnsRecords(deviceName, records) {
    return Object.keys(records).map(function (hostname) {
        return addDnsRecord(deviceName, hostname, records[hostname]);
    });
}

function addDnsCname(deviceName, alias, hostname) {
    return dnsServer(deviceName).addCNAMEToNameServerDb(alias, hostname) === true;
}

function addDnsNs(deviceName, domain, serverName) {
    return dnsServer(deviceName).addNSRecordToNameServerDb(domain, serverName) === true;
}

function removeDnsRecord(deviceName, hostname, ipAddress) {
    return dnsServer(deviceName).removeARecordFromNameServerDb(hostname, ipAddress) === true;
}

function getDnsRecordCount(deviceName) {
    return dnsServer(deviceName).getSizeOfNameServerDb();
}
