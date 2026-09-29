function showCommand(deviceName, command) {
    var text = String(command);
    if (text.indexOf("show ") !== 0 && text.indexOf("sh ") !== 0) {
        text = "show " + text;
    }
    return runCommand(deviceName, text, "enable").output;
}

function getRunningConfig(deviceName) {
    return showCommand(deviceName, "show running-config");
}

function getRoutingTable(deviceName) {
    return showCommand(deviceName, "show ip route");
}

function getInterfacesBrief(deviceName) {
    return showCommand(deviceName, "show ip interface brief");
}

function getVlanBrief(deviceName) {
    return showCommand(deviceName, "show vlan brief");
}

function getHostname(deviceName) {
    var device = iosDevice(deviceName);
    return String(callIfExists(device, "getHostName", device.getName()));
}
