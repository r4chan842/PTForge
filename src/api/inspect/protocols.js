function processByNames(deviceName, names) {
    var device = findDevice(deviceName);
    for (var i = 0; i < names.length; i++) {
        var process = null;
        try {
            process = device.getProcess(names[i]);
        } catch (error) {
            process = null;
        }
        if (process) {
            return process;
        }
    }
    throw new Error(names[0] + " is not available on " + deviceName);
}

function getVlans(deviceName) {
    var manager = processByNames(deviceName, ["VlanManager"]);
    var list = [];
    for (var i = 0; i < manager.getVlanCount(); i++) {
        var vlan = manager.getVlanAt(i);
        list.push({ id: vlan.getVlanNumber(), name: vlan.getName(), isDefault: callIfExists(vlan, "isDefault", false) });
    }
    return list;
}

function hasVlan(deviceName, vlanId) {
    return getVlans(deviceName).some(function (v) {
        return v.id === Number(vlanId);
    });
}

function getStpInfo(deviceName, vlanId) {
    var main = processByNames(deviceName, ["StpMain", "StpMainProcess"]);
    var stp = main.getStpProcess(vlanId === undefined ? 1 : Number(vlanId));
    if (!stp) {
        throw new Error("No spanning tree instance for VLAN " + vlanId + " on " + deviceName);
    }
    var rootPort = callIfExists(stp, "getRootPort", null);
    return {
        vlan: vlanId === undefined ? 1 : Number(vlanId),
        isRoot: stp.isRootBridge(),
        rootBridgeId: callIfExists(stp, "getRootBridgeId", ""),
        bridgeId: callIfExists(stp, "getSwitchId", ""),
        priority: callIfExists(stp, "getSwitchPriority", null),
        rootPort: rootPort ? rootPort.getName() : null,
        rootCost: callIfExists(stp, "getRootPathCost", null)
    };
}

function findRootBridge(deviceNames, vlanId) {
    var names = deviceNames ? toList(deviceNames) : getDevices(["switch", "multilayerswitch", "switch3650"]);
    for (var i = 0; i < names.length; i++) {
        try {
            if (getStpInfo(names[i], vlanId).isRoot) {
                return names[i];
            }
        } catch (error) {
            continue;
        }
    }
    return null;
}

function getVtpInfo(deviceName) {
    var vtp = processByNames(deviceName, ["Vtp", "VtpProcess"]);
    return {
        domain: callIfExists(vtp, "getDomainName", ""),
        modeCode: callIfExists(vtp, "getMode", null),
        version: callIfExists(vtp, "getVersion", null),
        revision: callIfExists(vtp, "getConfigRevision", null)
    };
}

function addStaticMac(deviceName, mac, vlanId, portName) {
    findPort(deviceName, portName);
    return processByNames(deviceName, ["MacSwitch", "MacSwitchProcess"]).addStaticMac(String(mac), Number(vlanId), String(portName)) !== false;
}

function removeStaticMac(deviceName, mac, vlanId, portName) {
    return processByNames(deviceName, ["MacSwitch", "MacSwitchProcess"]).removeStaticMac(String(mac), Number(vlanId), String(portName)) !== false;
}

function getOspfInfo(deviceName) {
    var main = processByNames(deviceName, ["OspfMain", "OspfMainProcess"]);
    var list = [];
    for (var i = 0; i < main.getOspfProcessCount(); i++) {
        var ospf = main.getOspfProcessAt(i);
        list.push({
            processId: ospf.getProcessId(),
            routerId: String(callIfExists(ospf, "getRouterId", "")),
            areas: callIfExists(ospf, "getAreaCount", null),
            networks: callIfExists(ospf, "getConfNetworkCount", null),
            distance: callIfExists(ospf, "getAdminDistance", null)
        });
    }
    return list;
}

function getEigrpInfo(deviceName) {
    var main = processByNames(deviceName, ["EigrpMain", "EigrpMainProcess"]);
    var list = [];
    for (var i = 0; i < main.getEigrpProcessCount(); i++) {
        var eigrp = main.getEigrpProcessAt(i);
        list.push({ as: callIfExists(eigrp, "getASNumber", callIfExists(eigrp, "getProcessId", null)) });
    }
    return list;
}
