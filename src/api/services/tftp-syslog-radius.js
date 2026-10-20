function setTftpService(deviceName, enabled) {
    getProcessOf(deviceName, "TftpServer").setEnabled(enabled !== false);
    return true;
}

function setSyslogService(deviceName, enabled) {
    getProcessOf(deviceName, "SyslogServer").setEnable(enabled !== false);
    return true;
}

function clearSyslog(deviceName) {
    getProcessOf(deviceName, "SyslogServer").clearAllSysLogEntries();
    return true;
}

function setRadiusPort(deviceName, port) {
    getProcessOf(deviceName, "RadiusServer").setPort(Number(port));
    return true;
}
