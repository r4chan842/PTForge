var loadBalanceMethods = ["src-mac", "dst-mac", "src-dst-mac", "src-ip", "dst-ip", "src-dst-ip", "src-port", "dst-port", "src-dst-port"];

function setEtherChannelLoadBalance(deviceName, method) {
    var name = oneLine(method).toLowerCase();
    if (loadBalanceMethods.indexOf(name) === -1) {
        throw new Error("Invalid load-balance method: " + method + ". Valid methods are " + joinNames(loadBalanceMethods));
    }
    return configureIosDevice(deviceName, ["port-channel load-balance " + name]);
}

function getEtherChannelLoadBalance(deviceName) {
    var result = runCommand(deviceName, "show etherchannel load-balance", "enable");
    var match = /(src-mac|dst-mac|src-dst-mac|src-ip|dst-ip|src-dst-ip|src-port|dst-port|src-dst-port)/i.exec(result.output);
    return match ? match[1].toLowerCase() : "";
}
