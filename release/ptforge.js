var allDeviceTypes = {
    1841: 0,
    1941: 0,
    "2620XM": 0,
    "2621XM": 0,
    2811: 0,
    2901: 0,
    2911: 0,
    "819HG-4G-IOX": 0,
    "819HGW": 0,
    829: 0,
    CGR1240: 0,
    ISR4321: 0,
    ISR4331: 0,
    "Router-PT": 0,
    "Router-PT-Empty": 0,
    "2950-24": 1,
    "2950T-24": 1,
    "2960-24TT": 1,
    "Switch-PT": 1,
    "Switch-PT-Empty": 1,
    "Cloud-PT": 2,
    "Cloud-PT-Empty": 2,
    "Bridge-PT": 3,
    "Hub-PT": 4,
    "Repeater-PT": 5,
    "CoAxialSplitter-PT": 6,
    "AccessPoint-PT": 7,
    "AccessPoint-PT-A": 7,
    "AccessPoint-PT-AC": 7,
    "AccessPoint-PT-N": 7,
    "PC-PT": 8,
    "Server-PT": 9,
    "Printer-PT": 10,
    "Linksys-WRT300N": 11,
    7960: 12,
    "DSL-Modem-PT": 13,
    "Cable-Modem-PT": 14,
    "3560-24PS": 16,
    "3650-24PS": 16,
    "IE-2000": 16,
    "Laptop-PT": 18,
    "TabletPC-PT": 19,
    "SMARTPHONE-PT": 20,
    "WirelessEndDevice-PT": 21,
    "WiredEndDevice-PT": 22,
    "TV-PT": 23,
    "Home-VoIP-PT": 24,
    "Analog-Phone-PT": 25,
    5505: 27,
    "5506-X": 27,
    DLC100: 29,
    "HomeRouter-PT-AC": 30,
    "Cell-Tower": 31,
    "Central-Office-Server": 32,
    802: 34,
    803: 34,
    Sniffer: 35,
    "MCU-PT": 36,
    "SBC-PT": 37,
    "Air Conditioner": 39,
    "Air Cooler": 39,
    Alarm: 39,
    Appliance: 39,
    "Atm Pressure Monitor": 39,
    Battery: 39,
    Beacon: 39,
    Blower: 39,
    "Bluetooth Speaker": 39,
    "Carbon Dioxide Detector": 39,
    "Carbon Monoxide Detector": 39,
    Fan: 39,
    "Ceiling Sprinkler": 39,
    "Dimmable LED": 39,
    Door: 39,
    "Fire Monitor": 39,
    "Fire Sprinkler": 39,
    "Flex Sensor": 39,
    "Floor Sprinkler": 39,
    Furnace: 39,
    "Garage Door": 39,
    "Generic Environment Sensor": 39,
    "Generic Sensor": 39,
    "Heating Element": 39,
    "Home Speaker": 39,
    Humidifier: 39,
    "Humidity Monitor": 39,
    "Humidity Sensor": 39,
    "Humiture Monitor": 39,
    "Humiture Sensor": 39,
    LCD: 39,
    LED: 39,
    "Lawn Sprinkler": 39,
    Light: 39,
    "Membrane Potentiometer": 39,
    "Metal Sensor": 39,
    "Motion Detector": 39,
    "Motion Sensor": 39,
    Motor: 39,
    "Old Car": 39,
    "Photo Sensor": 39,
    "Piezo Speaker": 39,
    "Portable Music Player": 39,
    Potentiometer: 39,
    "Power Meter": 39,
    "Push Button": 39,
    "Push Button Toggle Switch": 39,
    "RFID Card": 39,
    "RFID Reader": 39,
    "RGB LED": 39,
    "Rocker Switch": 39,
    Servo: 39,
    "Signal Generator": 39,
    Siren: 39,
    "Smart LED": 39,
    "Smoke Detector": 39,
    "Smoke Sensor": 39,
    "Solar Panel": 39,
    "Sound Frequency Detector": 39,
    "Sound Sensor": 39,
    Speaker: 39,
    "Street Lamp": 39,
    "Temperature Monitor": 39,
    "Temperature Sensor": 39,
    Thermostat: 39,
    Thing: 39,
    "Toggle Push Button": 39,
    "Trip Sensor": 39,
    "Trip Wire": 39,
    "Water Detector": 39,
    "Water Drain": 39,
    "Water Level Monitor": 39,
    "Water Sensor": 39,
    Webcam: 39,
    "Wind Detector": 39,
    "Wind Sensor": 39,
    "Wind Turbine": 39,
    Window: 39,
    "Embedded-Server-PT": 40,
    "WLC-2504": 41,
    "WLC-3504": 41,
    "WLC-PT": 41,
    "3702i": 44,
    "LAP-PT": 44,
    "Power Distribution Device": 45,
    "Copper Patch Panel": 46,
    "Fiber Patch Panel": 46,
    "Copper Wall Mount": 47,
    "Fiber Wall Mount": 47,
    "Meraki-MX65W": 48,
    "Meraki-Server": 49,
    NetworkController: 50,
};

var allLinkTypes = {
    "ethernet-straight": 8100,
    "ethernet-cross": 8101,
    straight: 8100,
    cross: 8101,
    roll: 8102,
    fiber: 8103,
    phone: 8104,
    cable: 8105,
    serial: 8106,
    auto: 8107,
    console: 8108,
    wireless: 8109,
    coaxial: 8110,
    octal: 8111,
    cellular: 8112,
    usb: 8113,
    custom_io: 8114,
};

var allModuleTypes = {
    "NM-1E": 1,
    "NM-1E2W": 1,
    "NM-1FE-FX": 1,
    "NM-1FE-TX": 1,
    "NM-1FE2W": 1,
    "NM-2E2W": 1,
    "NM-2FE2W": 1,
    "NM-2W": 1,
    "NM-4A/S": 1,
    "NM-4E": 1,
    "NM-8A/S": 1,
    "NM-8AM": 1,
    "NM-Cover": 1,
    "NM-ESW-161": 1,
    "1240-Cellular": 2,
    "1240-Cover": 2,
    "HWIC-1GE-SFP": 2,
    "HWIC-2T": 2,
    "HWIC-4ESW": 2,
    "HWIC-8A": 2,
    "HWIC-AP-AG-B": 2,
    "NIM-2T": 2,
    "NIM-Cover": 2,
    "NIM-ES2-4": 2,
    "WIC-1AM": 2,
    "WIC-1ENET": 2,
    "WIC-1T": 2,
    "WIC-2AM": 2,
    "WIC-2T": 2,
    "WIC-Cover": 2,
    "PT-ROUTER-NM-1AM": 3,
    "PT-ROUTER-NM-1CE": 3,
    "PT-ROUTER-NM-1CFE": 3,
    "PT-ROUTER-NM-1CGE": 3,
    "PT-ROUTER-NM-1FFE": 3,
    "PT-ROUTER-NM-1FGE": 3,
    "PT-ROUTER-NM-1S": 3,
    "PT-ROUTER-NM-1SS": 3,
    "PT-ROUTER-NM-COVER": 3,
    "AC-POWER-SUPPLY": 4,
    "POWER-COVER-PLATE": 4,
    "PT-SWITCH-NM-1CE": 4,
    "PT-SWITCH-NM-1CFE": 4,
    "PT-SWITCH-NM-1CGE": 4,
    "PT-SWITCH-NM-1FFE": 4,
    "PT-SWITCH-NM-1FGE": 4,
    "PT-SWITCH-NM-COVER": 4,
    "PT-CLOUD-NM-1AM": 5,
    "PT-CLOUD-NM-1CE": 5,
    "PT-CLOUD-NM-1CFE": 5,
    "PT-CLOUD-NM-1CGE": 5,
    "PT-CLOUD-NM-1CX": 10,
    "PT-CLOUD-NM-1FFE": 5,
    "PT-CLOUD-NM-1FGE": 5,
    "PT-CLOUD-NM-1S": 5,
    "PT-REPEATER-NM-1CE": 6,
    "PT-REPEATER-NM-1CFE": 6,
    "PT-REPEATER-NM-1CGE": 6,
    "PT-REPEATER-NM-1FFE": 6,
    "PT-REPEATER-NM-1FGE": 6,
    "PT-REPEATER-NM-COVER": 6,
    "Linksys-WMP300N": 7,
    "PT-HOST-NM-1AM": 7,
    "PT-HOST-NM-1CE": 7,
    "PT-HOST-NM-1CFE": 7,
    "PT-HOST-NM-1CGE": 7,
    "PT-HOST-NM-1FFE": 7,
    "PT-HOST-NM-1FGE": 7,
    "PT-HOST-NM-1W": 7,
    "PT-HOST-NM-1W-A": 7,
    "PT-HOST-NM-1W-AC": 7,
    "PT-HOST-NM-3G/4G": 7,
    "PT-HOST-NM-COVER": 7,
    "PT-MODEM-NM-1CE": 8,
    "PT-MODEM-NM-1CFE": 8,
    "PT-MODEM-NM-1CGE": 8,
    "Linksys-WPC300N": 15,
    "PT-LAPTOP-NM-1AM": 9,
    "PT-LAPTOP-NM-1CE": 9,
    "PT-LAPTOP-NM-1CFE": 9,
    "PT-LAPTOP-NM-1CGE": 9,
    "PT-LAPTOP-NM-1FFE": 9,
    "PT-LAPTOP-NM-1FGE": 9,
    "PT-LAPTOP-NM-1W": 9,
    "PT-LAPTOP-NM-1W-A": 9,
    "PT-LAPTOP-NM-1W-AC": 9,
    "PT-LAPTOP-NM-3G/4G": 9,
    "IP_PHONE_POWER_ADAPTER": 11,
    "PT-TABLETPC-NM-1AM": 12,
    "PT-TABLETPC-NM-1CE": 12,
    "PT-TABLETPC-NM-1CFE": 12,
    "PT-TABLETPC-NM-1CGE": 12,
    "PT-TABLETPC-NM-1FFE": 12,
    "PT-TABLETPC-NM-1FGE": 12,
    "PT-TABLETPC-NM-1W": 12,
    "PT-TABLETPC-NM-1W-A": 12,
    "PT-TABLETPC-NM-1W-AC": 12,
    "PT-TABLETPC-NM-3G": 12,
    "PT-PDA-NM-1AM": 13,
    "PT-PDA-NM-1CE": 13,
    "PT-PDA-NM-1CFE": 13,
    "PT-PDA-NM-1CGE": 13,
    "PT-PDA-NM-1FFE": 13,
    "PT-PDA-NM-1FGE": 13,
    "PT-PDA-NM-1W": 13,
    "PT-PDA-NM-1W-A": 13,
    "PT-PDA-NM-1W-AC": 13,
    "PT-PDA-NM-3G/4G": 13,
    "PT-WIRELESSENDDEVICE-NM-1AM": 14,
    "PT-WIRELESSENDDEVICE-NM-1CE": 14,
    "PT-WIRELESSENDDEVICE-NM-1CFE": 14,
    "PT-WIRELESSENDDEVICE-NM-1CGE": 14,
    "PT-WIRELESSENDDEVICE-NM-1FFE": 14,
    "PT-WIRELESSENDDEVICE-NM-1FGE": 14,
    "PT-WIRELESSENDDEVICE-NM-1W": 14,
    "PT-WIRELESSENDDEVICE-NM-1W-A": 14,
    "PT-WIRELESSENDDEVICE-NM-1W-AC": 14,
    "PT-WIREDENDDEVICE-NM-1AM": 15,
    "PT-WIREDENDDEVICE-NM-1CE": 15,
    "PT-WIREDENDDEVICE-NM-1CFE": 15,
    "PT-WIREDENDDEVICE-NM-1CGE": 15,
    "PT-WIREDENDDEVICE-NM-1FFE": 15,
    "PT-WIREDENDDEVICE-NM-1FGE": 15,
    "PT-WIREDENDDEVICE-NM-1W": 15,
    "PT-WIREDENDDEVICE-NM-1W-A": 15,
    "PT-HEADPHONE": 16,
    "PT-MICROPHONE": 16,
    "ASA-Cover": 19,
    "PT-CELL-NM-1CX": 21,
    "PT-CELL-NM-3G/4G": 21,
    "PT-IOT-NM-1CE": 23,
    "PT-IOT-NM-1CFE": 23,
    "PT-IOT-NM-1CGE": 23,
    "PT-IOT-NM-1W": 23,
    "PT-IOT-NM-1W-AC": 23,
    "PT-IOT-NM-3G/4G": 23,
    "PT-IOT-CUSTOM-IO": 26,
    "PT-IOT-POWER-ADAPTER": 27,
    "PT-UNV-PWR-ADAPTER": 28,
    "ROUTER-ADAPTER": 29,
    "GLC-FE-100FX-RGD": 30,
    "GLC-GE-100FX": 30,
    "GLC-LH-SMD": 30,
    "GLC-T": 30,
    "GLC-TE": 30,
    "ACCESS_POINT_POWER_ADAPTER": 31,
    "C3650-BUILTIN": 32,
    "C3650-SFP-BUILTIN": 32,
    "ISR4321-BUILTIN": 32,
    "ISR4331-BUILTIN": 32,
    "PT-CONTROLLER-BUILTIN": 32,
    "MERAKI-POWER-ADAPTER": 34,
};

var deviceTypes = {
    router: 0,
    switch: 1,
    cloud: 2,
    bridge: 3,
    hub: 4,
    repeater: 5,
    coaxialsplitter: 6,
    accesspoint: 7,
    pc: 8,
    server: 9,
    printer: 10,
    wirelessrouter: 11,
    ipphone: 12,
    dslmodem: 13,
    cablemodem: 14,
    remotenetwork: 15,
    multilayerswitch: 16,
    switch3650: 17,
    laptop: 18,
    tabletpc: 19,
    pda: 20,
    wirelessenddevice: 21,
    wiredenddevice: 22,
    tv: 23,
    homevoip: 24,
    analogphone: 25,
    multiuser: 26,
    asa: 27,
    ioe: 28,
    homegateway: 29,
    wirelessrouternewgeneration: 30,
    celltower: 31,
    centralofficeserver: 32,
    ciscoaccesspoint: 33,
    embeddedciscoaccesspoint: 34,
    sniffer: 35,
    mcu: 36,
    sbc: 37,
    thing: 38,
    mcucomponent: 39,
    embeddedserver: 40,
    wlc: 41,
    lightweightaccesspoint: 44
};

var iosDeviceTypes = [0, 1, 16, 17];

var ipv6AddressTypes = {
    unicast: 0,
    anycast: 1,
    eui64: 2
};

var wirelessAuthTypes = {
    none: 0,
    wep: 1,
    "wpa-psk": 2,
    "wpa-eap": 3,
    "wpa2-psk": 4,
    "wpa2-eap": 5,
    open: 6
};

var wirelessEncryptTypes = {
    none: 0,
    wep64: 1,
    wep128: 2,
    tkip: 3,
    aes: 4
};

var wirelessNetworkModes = {
    disabled: 0,
    b: 1,
    g: 2,
    bg: 3,
    n: 4,
    a: 5,
    mixed: 7
};

var commandStatusNames = ["ok", "ambiguous", "invalid", "incomplete", "notImplemented"];

function toList(value) {
    if (value === undefined || value === null || value === "") {
        return [];
    }
    return Array.isArray(value) ? value.slice() : [value];
}

function toLines(value) {
    if (Array.isArray(value)) {
        return value.map(String);
    }
    return String(value === undefined || value === null ? "" : value).split(/\r?\n/);
}

function joinVlans(vlans) {
    return toList(vlans).join(",");
}

function requireValue(value, label) {
    if (value === undefined || value === null || value === "") {
        throw new Error("Missing required value: " + label);
    }
    return value;
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

function interfaceBlock(name, body) {
    return ["interface " + name].concat(body.map(function (line) {
        return " " + line;
    })).concat(["exit"]);
}


function toArray(list) {
    if (!list) {
        return [];
    }
    if (Array.isArray(list)) {
        return list.slice();
    }
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(list[i]);
    }
    return result;
}

var namedColors = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    gray: [128, 128, 128],
    red: [220, 53, 69],
    green: [40, 167, 69],
    blue: [13, 110, 253],
    yellow: [255, 193, 7],
    orange: [253, 126, 20],
    purple: [111, 66, 193],
    cyan: [13, 202, 240],
    pink: [214, 51, 132],
    teal: [32, 201, 151],
    navy: [0, 31, 84],
    brown: [121, 85, 72]
};

function clampChannel(value) {
    var number = Math.round(Number(value));
    if (isNaN(number)) {
        return 0;
    }
    return Math.max(0, Math.min(255, number));
}

function toRgb(color) {
    if (Array.isArray(color) && color.length >= 3) {
        return [clampChannel(color[0]), clampChannel(color[1]), clampChannel(color[2])];
    }
    if (typeof color === "string") {
        var key = color.trim().toLowerCase();
        if (namedColors[key]) {
            return namedColors[key].slice();
        }
        var hex = key.replace(/^#/, "");
        if (/^[0-9a-f]{3}$/.test(hex)) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        if (/^[0-9a-f]{6}$/.test(hex)) {
            return [
                parseInt(hex.substr(0, 2), 16),
                parseInt(hex.substr(2, 2), 16),
                parseInt(hex.substr(4, 2), 16)
            ];
        }
    }
    return namedColors.black.slice();
}

function isValidIp(value) {
    var text = String(value);
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) {
        return false;
    }
    return text.split(".").every(function (part) {
        return Number(part) <= 255;
    });
}

function ipToInt(ip) {
    if (!isValidIp(ip)) {
        throw new Error("Invalid IPv4 address: " + ip);
    }
    return String(ip).split(".").reduce(function (total, part) {
        return total * 256 + Number(part);
    }, 0);
}

function intToIp(value) {
    var number = ((value % 4294967296) + 4294967296) % 4294967296;
    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}

function cidrToMask(prefix) {
    var bits = Number(prefix);
    if (!(bits >= 0 && bits <= 32) || Math.floor(bits) !== bits) {
        throw new Error("Invalid prefix length: " + prefix);
    }
    return intToIp(bits === 0 ? 0 : 4294967296 - Math.pow(2, 32 - bits));
}

function maskToCidr(mask) {
    var value = ipToInt(mask);
    var bits = 0;
    while (bits < 32 && Math.floor(value / Math.pow(2, 31 - bits)) % 2 === 1) {
        bits++;
    }
    if (cidrToMask(bits) !== intToIp(value)) {
        throw new Error("Invalid subnet mask: " + mask);
    }
    return bits;
}

function maskToWildcard(mask) {
    return intToIp(4294967295 - ipToInt(mask));
}

function normalizeMask(mask) {
    if (typeof mask === "number" || /^\d{1,2}$/.test(String(mask))) {
        return cidrToMask(Number(mask));
    }
    maskToCidr(mask);
    return String(mask);
}

function parseNetwork(address, mask) {
    var text = String(address);
    var ip;
    var subnetMask;

    if (text.indexOf("/") !== -1) {
        var parts = text.split("/");
        ip = parts[0];
        subnetMask = cidrToMask(Number(parts[1]));
    } else {
        ip = text;
        subnetMask = normalizeMask(isDefined(mask) ? mask : 32);
    }

    var ipValue = ipToInt(ip);
    var maskValue = ipToInt(subnetMask);
    var size = 4294967296 - maskValue;
    var networkValue = ipValue - (ipValue % size);

    return {
        ip: ip,
        mask: subnetMask,
        prefix: maskToCidr(subnetMask),
        wildcard: maskToWildcard(subnetMask),
        network: intToIp(networkValue),
        broadcast: intToIp(networkValue + size - 1),
        size: size
    };
}

function networkAddress(address, mask) {
    return parseNetwork(address, mask).network;
}

function broadcastAddress(address, mask) {
    return parseNetwork(address, mask).broadcast;
}

function hostRange(address, mask) {
    var info = parseNetwork(address, mask);
    if (info.prefix >= 31) {
        return { first: info.network, last: info.broadcast, count: info.size };
    }
    return {
        first: intToIp(ipToInt(info.network) + 1),
        last: intToIp(ipToInt(info.broadcast) - 1),
        count: info.size - 2
    };
}

function nthHost(address, index, mask) {
    var info = parseNetwork(address, mask);
    var count = info.prefix >= 31 ? info.size : info.size - 2;
    var position = Number(index);
    if (position < 0) {
        position = count + position + 1;
    }
    if (!(position >= 1 && position <= count)) {
        throw new Error("Host " + index + " is outside " + info.network + "/" + info.prefix);
    }
    var offset = info.prefix >= 31 ? position - 1 : position;
    return intToIp(ipToInt(info.network) + offset);
}

function splitSubnet(address, newPrefix, mask) {
    var info = parseNetwork(address, mask);
    var target = Number(newPrefix);
    if (target < info.prefix || target > 32) {
        throw new Error("Cannot split /" + info.prefix + " into /" + newPrefix);
    }
    var step = Math.pow(2, 32 - target);
    var result = [];
    for (var value = ipToInt(info.network); value < ipToInt(info.network) + info.size; value += step) {
        result.push(intToIp(value) + "/" + target);
    }
    return result;
}

function isInSubnet(ip, address, mask) {
    var info = parseNetwork(address, mask);
    var value = ipToInt(ip);
    return value >= ipToInt(info.network) && value <= ipToInt(info.broadcast);
}

function ipAndMask(address, mask) {
    var info = parseNetwork(address, mask);
    return { ip: info.ip, mask: info.mask };
}

function networkAndWildcard(address, mask) {
    var info = parseNetwork(address, mask);
    return info.network + " " + info.wildcard;
}

function networkAndMask(address, mask) {
    var info = parseNetwork(address, mask);
    return info.network + " " + info.mask;
}

function aclAddress(value) {
    var text = String(value).trim();
    if (text === "any" || text.indexOf("host ") === 0) {
        return text;
    }
    if (text.indexOf("/") !== -1) {
        var info = parseNetwork(text);
        return info.prefix === 32 ? "host " + info.network : info.network + " " + info.wildcard;
    }
    if (isValidIp(text)) {
        return "host " + text;
    }
    return text;
}

function appWindow() {
    return ipc.appWindow();
}

function activeWorkspace() {
    return ipc.appWindow().getActiveWorkspace();
}

function logicalWorkspace() {
    return activeWorkspace().getLogicalWorkspace();
}

function network() {
    return ipc.network();
}

function findDevice(name) {
    var device = network().getDevice(String(name));
    if (!device) {
        throw new Error("Device not found: " + name);
    }
    return device;
}

function deviceExists(name) {
    return !!network().getDevice(String(name));
}

function findPort(deviceName, portName) {
    var port = findDevice(deviceName).getPort(String(portName));
    if (!port) {
        throw new Error("Port not found: " + deviceName + " " + portName);
    }
    return port;
}

function isIosDevice(device) {
    return iosDeviceTypes.indexOf(device.getType()) !== -1;
}

function skipBootIfIos(device) {
    if (isIosDevice(device) && typeof device.skipBoot === "function") {
        device.skipBoot();
    }
}

function resolveDeviceType(value) {
    if (typeof value === "number") {
        return value;
    }
    var type = deviceTypes[String(value).toLowerCase()];
    if (type === undefined) {
        throw new Error("Unknown device type filter: " + value);
    }
    return type;
}

function callIfExists(target, method, fallback) {
    if (target && typeof target[method] === "function") {
        try {
            return target[method]();
        } catch (error) {
            return fallback;
        }
    }
    return fallback;
}

function getProcessOf(deviceName, processName) {
    var process = findDevice(deviceName).getProcess(processName);
    if (!process) {
        throw new Error(processName + " is not available on " + deviceName);
    }
    return process;
}

var drawingLayer = null;

function currentLayer() {
    if (drawingLayer === null) {
        drawingLayer = logicalWorkspace().getUnusedLayer();
    }
    return drawingLayer;
}

function useLayer(layer) {
    drawingLayer = layer;
    return drawingLayer;
}

function newLayer() {
    drawingLayer = logicalWorkspace().getUnusedLayer();
    return drawingLayer;
}

function layerOrCurrent(layer) {
    return layer === undefined || layer === null ? currentLayer() : layer;
}

function addDevice(deviceName, deviceModel, x, y) {
    var deviceType = allDeviceTypes[deviceModel];
    if (deviceType === undefined) {
        throw new Error("Unknown device model: " + deviceModel);
    }
    if (deviceExists(deviceName)) {
        throw new Error("Device name already in use: " + deviceName);
    }

    var createdName = logicalWorkspace().addDevice(deviceType, deviceModel, x, y);
    if (!createdName) {
        return false;
    }

    var device = network().getDevice(createdName);
    device.setName(deviceName);
    skipBootIfIos(device);
    return true;
}

function addDevices(list) {
    return list.map(function (entry) {
        return addDevice(entry[0], entry[1], entry[2], entry[3]);
    });
}

function removeDevice(deviceName) {
    if (Array.isArray(deviceName)) {
        return deviceName.map(removeDevice).every(Boolean);
    }
    return logicalWorkspace().removeDevice(String(deviceName)) === true;
}

function renameDevice(oldName, newName) {
    if (deviceExists(newName)) {
        throw new Error("Device name already in use: " + newName);
    }
    findDevice(oldName).setName(newName);
    return true;
}

function moveDevice(deviceName, x, y, centered) {
    var device = findDevice(deviceName);
    return centered === true ? device.moveToLocationCentered(x, y) : device.moveToLocation(x, y);
}

function moveDeviceBy(deviceName, dx, dy) {
    var device = findDevice(deviceName);
    return device.moveToLocation(Math.round(device.getXCoordinate() + dx), Math.round(device.getYCoordinate() + dy));
}

function getDevicePosition(deviceName) {
    var device = findDevice(deviceName);
    return {
        x: device.getXCoordinate(),
        y: device.getYCoordinate(),
        centerX: device.getCenterXCoordinate(),
        centerY: device.getCenterYCoordinate()
    };
}

function getDevices(filter, startsWith) {
    var prefix = startsWith || "";
    var types = null;

    if (isDefined(filter) && filter !== "") {
        types = toList(filter).map(resolveDeviceType);
    }

    var names = [];
    for (var i = 0; i < network().getDeviceCount(); i++) {
        var device = network().getDeviceAt(i);
        var name = String(device.getName());
        if ((!types || types.indexOf(device.getType()) !== -1) && name.indexOf(prefix) === 0) {
            names.push(name);
        }
    }
    return names;
}

function getDeviceCount() {
    return network().getDeviceCount();
}

function getDeviceModel(deviceName) {
    return String(findDevice(deviceName).getModel());
}

function getDeviceType(deviceName) {
    return findDevice(deviceName).getType();
}

function setPower(deviceName, on) {
    var device = findDevice(deviceName);
    var state = on !== false;
    device.setPower(state);
    if (state) {
        skipBootIfIos(device);
    }
    return true;
}

function getPower(deviceName) {
    return findDevice(deviceName).getPower();
}

function restartDevice(deviceName) {
    setPower(deviceName, false);
    return setPower(deviceName, true);
}

function getDeviceInfo(deviceName) {
    var device = findDevice(deviceName);
    var ports = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        ports.push(describePort(device.getPortAt(i)));
    }
    return {
        name: String(device.getName()),
        model: String(device.getModel()),
        type: device.getType(),
        power: device.getPower(),
        serial: String(callIfExists(device, "getSerialNumber", "")),
        x: device.getXCoordinate(),
        y: device.getYCoordinate(),
        ports: ports
    };
}

function movePhysical(deviceName, x, y) {
    return findDevice(deviceName).moveToLocInPhysicalWS(x, y);
}

function movePhysicalBy(deviceName, dx, dy) {
    return findDevice(deviceName).moveByInPhysicalWS(dx, dy);
}

function setDeviceTime(deviceName, year, month, day, hour, minute, second) {
    findDevice(deviceName).setTime(year, month, day, hour || 0, minute || 0, second || 0);
    return true;
}

function withPowerOff(device, action) {
    var wasOn = device.getPower();
    if (wasOn) {
        device.setPower(false);
    }
    var result;
    try {
        result = action();
    } finally {
        if (wasOn) {
            device.setPower(true);
            skipBootIfIos(device);
        }
    }
    return result;
}

function addModule(deviceName, slot, model) {
    var device = findDevice(deviceName);
    var moduleType = allModuleTypes[model];
    if (moduleType === undefined) {
        throw new Error("Unknown module: " + model);
    }
    return withPowerOff(device, function () {
        return device.addModule(String(slot), moduleType, model) === true;
    });
}

function addModules(deviceName, modules) {
    return Object.keys(modules).map(function (slot) {
        return addModule(deviceName, slot, modules[slot]);
    });
}

function removeModule(deviceName, slot) {
    var device = findDevice(deviceName);
    return withPowerOff(device, function () {
        return device.removeModule(String(slot)) === true;
    });
}

function getSupportedModules(deviceName) {
    var list = findDevice(deviceName).getSupportedModule();
    var result = [];
    for (var i = 0; i < list.length; i++) {
        result.push(String(list[i]));
    }
    return result;
}

function describePort(port) {
    return {
        name: String(port.getName()),
        ip: String(callIfExists(port, "getIpAddress", "")),
        mask: String(callIfExists(port, "getSubnetMask", "")),
        mac: String(callIfExists(port, "getMacAddress", "")),
        up: callIfExists(port, "isPortUp", false) === true,
        protocolUp: callIfExists(port, "isProtocolUp", false) === true,
        connectedTo: String(callIfExists(port, "getRemotePortName", "")),
        description: String(callIfExists(port, "getDescription", "")),
        bandwidth: callIfExists(port, "getBandwidth", 0),
        fullDuplex: callIfExists(port, "isFullDuplex", false) === true
    };
}

function getPorts(deviceName) {
    var device = findDevice(deviceName);
    var ports = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        ports.push(String(device.getPortAt(i).getName()));
    }
    return ports;
}

function getPortInfo(deviceName, portName) {
    return describePort(findPort(deviceName, portName));
}

function getFreePorts(deviceName, startsWith) {
    var device = findDevice(deviceName);
    var prefix = startsWith || "";
    var free = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        var port = device.getPortAt(i);
        var name = String(port.getName());
        var linked = callIfExists(port, "getLink", null);
        if (!linked && name.indexOf(prefix) === 0 && name.indexOf("Vlan") !== 0 && name.indexOf("Loopback") !== 0) {
            free.push(name);
        }
    }
    return free;
}

function setPortPower(deviceName, portName, on) {
    findPort(deviceName, portName).setPower(on !== false);
    return true;
}

function setPortDescription(deviceName, portName, text) {
    findPort(deviceName, portName).setDescription(String(text));
    return true;
}

function setPortSpeed(deviceName, portName, bandwidth, fullDuplex) {
    var port = findPort(deviceName, portName);
    if (bandwidth === "auto") {
        port.setBandwidthAutoNegotiate(true);
    } else if (isDefined(bandwidth)) {
        port.setBandwidthAutoNegotiate(false);
        port.setBandwidth(Number(bandwidth));
    }
    if (fullDuplex === "auto") {
        port.setDuplexAutoNegotiate(true);
    } else if (isDefined(fullDuplex)) {
        port.setDuplexAutoNegotiate(false);
        port.setFullDuplex(fullDuplex === true);
    }
    return true;
}

function setPortMac(deviceName, portName, mac) {
    findPort(deviceName, portName).setMacAddress(mac);
    return true;
}

function setPortClockRate(deviceName, portName, rate) {
    findPort(deviceName, portName).setClockRate(Number(rate));
    return true;
}

function setCustomVar(deviceName, key, value) {
    findDevice(deviceName).addCustomVar(String(key), String(value));
    return true;
}

function getCustomVar(deviceName, key) {
    var device = findDevice(deviceName);
    return device.hasCustomVar(String(key)) ? String(device.getCustomVarStr(String(key))) : null;
}

function removeCustomVar(deviceName, key) {
    return findDevice(deviceName).removeCustomVar(String(key)) === true;
}

function getCustomVars(deviceName) {
    var device = findDevice(deviceName);
    var result = {};
    for (var i = 0; i < device.getCustomVarsCount(); i++) {
        result[String(device.getCustomVarNameAt(i))] = String(device.getCustomVarValueStrAt(i));
    }
    return result;
}

function setDeviceImage(deviceName, logicalPath, physicalPath) {
    var device = findDevice(deviceName);
    if (logicalPath) {
        device.setCustomLogicalImage(logicalPath);
    }
    if (physicalPath) {
        device.setCustomPhysicalImage(physicalPath);
    }
    return true;
}

function resolveLinkType(linkType) {
    var key = isDefined(linkType) ? String(linkType).toLowerCase() : "auto";
    var type = allLinkTypes[key];
    if (type === undefined) {
        throw new Error("Unknown link type: " + linkType);
    }
    return type;
}

function addLink(device1Name, device1Port, device2Name, device2Port, linkType) {
    findDevice(device1Name);
    findDevice(device2Name);
    return logicalWorkspace().createLink(device1Name, device1Port, device2Name, device2Port, resolveLinkType(linkType)) === true;
}

function addLinks(list) {
    return list.map(function (entry) {
        return addLink(entry[0], entry[1], entry[2], entry[3], entry[4]);
    });
}

function deleteLink(deviceName, portName) {
    return logicalWorkspace().deleteLink(deviceName, portName) === true;
}

function autoConnect(device1Name, device2Name) {
    findDevice(device1Name);
    findDevice(device2Name);
    logicalWorkspace().autoConnectDevices(device1Name, device2Name);
    return true;
}

function linkTypeName(code) {
    for (var name in allLinkTypes) {
        if (allLinkTypes[name] === code && name.indexOf("ethernet-") !== 0) {
            return name;
        }
    }
    return String(code);
}

function portOwnerName(port) {
    var owner = callIfExists(port, "getOwnerDevice", null);
    return owner ? String(owner.getName()) : "";
}

function getLinks() {
    var links = [];
    for (var i = 0; i < network().getLinkCount(); i++) {
        var link = network().getLinkAt(i);
        var entry = { type: linkTypeName(link.getConnectionType()) };
        if (typeof link.getPort1 === "function") {
            var a = link.getPort1();
            var b = link.getPort2();
            entry.from = { device: portOwnerName(a), port: String(a.getName()) };
            entry.to = { device: portOwnerName(b), port: String(b.getName()) };
        }
        links.push(entry);
    }
    return links;
}

function getLinkCount() {
    return network().getLinkCount();
}

function getNeighbors(deviceName) {
    return getLinks().filter(function (link) {
        return link.from && (link.from.device === deviceName || link.to.device === deviceName);
    }).map(function (link) {
        var local = link.from.device === deviceName ? link.from : link.to;
        var remote = link.from.device === deviceName ? link.to : link.from;
        return { port: local.port, device: remote.device, remotePort: remote.port, type: link.type };
    });
}

function isLinkUp(deviceName, portName) {
    var port = findDevice(deviceName).getPort(portName);
    return !!port && port.isPortUp() === true && port.isProtocolUp() === true;
}

function hostPort(deviceName, portName) {
    return findPort(deviceName, portName || "FastEthernet0");
}

function configurePcIp(deviceName, dhcpEnabled, ipAddress, subnetMask, defaultGateway, dnsServer, portName) {
    var device = findDevice(deviceName);
    var port = hostPort(deviceName, portName);

    if (dhcpEnabled === true || dhcpEnabled === false) {
        device.setDhcpFlag(dhcpEnabled);
    }
    if (ipAddress) {
        var parsed = ipAndMask(ipAddress, subnetMask || (String(ipAddress).indexOf("/") === -1 ? 24 : undefined));
        port.setIpSubnetMask(parsed.ip, parsed.mask);
    }
    if (defaultGateway) {
        port.setDefaultGateway(defaultGateway);
    }
    if (dnsServer) {
        port.setDnsServerIp(dnsServer);
    }
    return true;
}

function setPcDhcp(deviceName, portName) {
    return configurePcIp(deviceName, true, undefined, undefined, undefined, undefined, portName);
}

function setPcStatic(deviceName, address, gateway, dns, portName) {
    return configurePcIp(deviceName, false, address, undefined, gateway, dns, portName);
}

function getPcIp(deviceName, portName) {
    var device = findDevice(deviceName);
    var port = hostPort(deviceName, portName);
    return {
        dhcp: callIfExists(device, "getDhcpFlag", false) === true,
        ip: String(port.getIpAddress()),
        mask: String(port.getSubnetMask()),
        ipv6: String(callIfExists(port, "getUnicastIpv6Address", ""))
    };
}

function setHostFirewall(deviceName, enabled, portName) {
    hostPort(deviceName, portName).setInboundFirewallService(enabled !== false);
    return true;
}

function runHostCommand(deviceName, command) {
    var device = findDevice(deviceName);
    if (typeof device.getCommandPrompt !== "function") {
        throw new Error("Device has no command prompt: " + deviceName);
    }
    device.getCommandPrompt().enterCommand(String(command));
    return true;
}

function configurePcIpv6(deviceName, options) {
    var opts = options || {};
    var port = hostPort(deviceName, opts.port);

    port.setIpv6Enabled(true);

    if (opts.autoConfig === true || opts.autoConfig === false) {
        port.setIpv6AddressAutoConfig(opts.autoConfig);
    }
    if (opts.linkLocal) {
        port.setIpv6LinkLocal(opts.linkLocal);
    }
    if (opts.address) {
        var address = String(opts.address);
        var prefix = opts.prefix || 64;
        if (address.indexOf("/") !== -1) {
            prefix = Number(address.split("/")[1]);
            address = address.split("/")[0];
        }
        var type = ipv6AddressTypes[opts.type || "unicast"];
        if (type === undefined) {
            throw new Error("Unknown IPv6 address type: " + opts.type);
        }
        port.addIpv6Address(address, prefix, type, false);
    }
    if (opts.gateway) {
        port.setv6DefaultGateway(opts.gateway);
    }
    if (opts.dns) {
        port.setv6ServerIp(opts.dns);
    }
    return true;
}

function clearPcIpv6(deviceName, portName) {
    hostPort(deviceName, portName).removeAllIpv6Addresses();
    return true;
}

function disablePcIpv6(deviceName, portName) {
    hostPort(deviceName, portName).setIpv6Enabled(false);
    return true;
}

function parseCommandResult(result) {
    if (Array.isArray(result)) {
        return { status: commandStatusNames[result[0]] || String(result[0]), output: String(isDefined(result[1]) ? result[1] : "") };
    }
    if (result && isDefined(result.first)) {
        return { status: commandStatusNames[result.first] || String(result.first), output: String(isDefined(result.second) ? result.second : "") };
    }
    return { status: "ok", output: isDefined(result) ? String(result) : "" };
}

function iosDevice(deviceName) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand !== "function") {
        throw new Error("Not a Cisco IOS device: " + deviceName);
    }
    skipBootIfIos(device);
    return device;
}

function configureIosDevice(deviceName, commands, save) {
    var device = iosDevice(deviceName);
    var failed = [];

    device.enterCommand("!", "global");
    toLines(commands).forEach(function (line) {
        var command = line.replace(/\s+$/, "");
        if (!command.trim() || command.trim() === "!") {
            return;
        }
        var result = parseCommandResult(device.enterCommand(command, ""));
        if (result.status !== "ok") {
            failed.push({ command: command.trim(), status: result.status });
        }
    });
    device.enterCommand("end", "");

    if (save !== false) {
        device.enterCommand("write memory", "enable");
    }
    return failed;
}

function applyConfig(deviceName, commands, save) {
    var failed = configureIosDevice(deviceName, commands, save);
    if (failed.length) {
        throw new Error(deviceName + " rejected: " + failed.map(function (item) {
            return item.command + " (" + item.status + ")";
        }).join(", "));
    }
    return true;
}

function applyToDevices(deviceNames, commands, save) {
    var report = {};
    toList(deviceNames).forEach(function (name) {
        report[name] = configureIosDevice(name, commands, save);
    });
    return report;
}

function runCommand(deviceName, command, mode) {
    var device = iosDevice(deviceName);
    return parseCommandResult(device.enterCommand(String(command), isDefined(mode) ? mode : "enable"));
}

function saveConfig(deviceName) {
    iosDevice(deviceName).enterCommand("write memory", "enable");
    return true;
}

function saveAllConfigs() {
    var saved = [];
    getDevices(iosDeviceTypes).forEach(function (name) {
        saveConfig(name);
        saved.push(name);
    });
    return saved;
}

function getPrompt(deviceName) {
    var line = callIfExists(iosDevice(deviceName), "getCommandLine", null);
    return line ? String(line.getPrompt()) : "";
}

function getCliMode(deviceName) {
    var line = callIfExists(iosDevice(deviceName), "getCommandLine", null);
    return line ? String(line.getMode()) : "";
}

function buildBasicSetup(options) {
    var opts = options || {};
    var commands = [];

    if (opts.hostname) {
        commands.push("hostname " + opts.hostname);
    }
    if (opts.noDomainLookup !== false) {
        commands.push("no ip domain-lookup");
    }
    if (opts.domain) {
        commands.push("ip domain-name " + opts.domain);
    }
    if (opts.secret) {
        commands.push("enable secret " + opts.secret);
    }
    if (opts.banner) {
        commands.push("banner motd #" + String(opts.banner).replace(/#/g, "") + "#");
    }
    if (opts.consolePassword) {
        commands = commands.concat([
            "line console 0",
            " password " + opts.consolePassword,
            " login",
            " logging synchronous",
            "exit"
        ]);
    }
    if (opts.vtyPassword) {
        commands = commands.concat([
            "line vty 0 15",
            " password " + opts.vtyPassword,
            " login",
            "exit"
        ]);
    }
    if (opts.encryptPasswords !== false && (opts.secret || opts.consolePassword || opts.vtyPassword)) {
        commands.push("service password-encryption");
    }
    return commands;
}

function basicSetup(deviceName, options) {
    var opts = Object.assign({ hostname: deviceName }, options || {});
    return configureIosDevice(deviceName, buildBasicSetup(opts));
}

function setHostname(deviceName, hostname) {
    return configureIosDevice(deviceName, ["hostname " + requireValue(hostname, "hostname")]);
}

function setBanner(deviceName, text) {
    return configureIosDevice(deviceName, buildBasicSetup({ banner: text, noDomainLookup: false }));
}

function setEnableSecret(deviceName, secret) {
    return configureIosDevice(deviceName, ["enable secret " + requireValue(secret, "secret")]);
}

function setConsolePassword(deviceName, password) {
    return configureIosDevice(deviceName, buildBasicSetup({ consolePassword: password, noDomainLookup: false, encryptPasswords: false }));
}

function setVtyPassword(deviceName, password) {
    return configureIosDevice(deviceName, buildBasicSetup({ vtyPassword: password, noDomainLookup: false, encryptPasswords: false }));
}

function addLocalUser(deviceName, username, password, privilege) {
    var line = "username " + requireValue(username, "username");
    if (isDefined(privilege)) {
        line += " privilege " + privilege;
    }
    line += " secret " + requireValue(password, "password");
    return configureIosDevice(deviceName, [line]);
}

function enablePasswordEncryption(deviceName) {
    return configureIosDevice(deviceName, ["service password-encryption"]);
}

function setDomainName(deviceName, domain) {
    return configureIosDevice(deviceName, ["ip domain-name " + requireValue(domain, "domain")]);
}

function setNameServer(deviceName, servers) {
    return configureIosDevice(deviceName, ["ip name-server " + toList(servers).join(" ")]);
}

function addHostEntry(deviceName, hostname, ip) {
    return configureIosDevice(deviceName, ["ip host " + hostname + " " + ip]);
}

function buildInterfaceIp(interfaceName, address, mask, description) {
    var parsed = ipAndMask(address, mask);
    var body = [];
    if (description) {
        body.push("description " + description);
    }
    body.push("ip address " + parsed.ip + " " + parsed.mask);
    body.push("no shutdown");
    return interfaceBlock(interfaceName, body);
}

function setInterfaceIp(deviceName, interfaceName, address, mask, description) {
    return configureIosDevice(deviceName, buildInterfaceIp(interfaceName, address, mask, description));
}

function setInterfaceDhcp(deviceName, interfaceName) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip address dhcp", "no shutdown"]));
}

function setInterfaceIpv6(deviceName, interfaceName, address, options) {
    var opts = options || {};
    var body = [];
    if (address) {
        body.push("ipv6 address " + address + (opts.eui64 ? " eui-64" : ""));
    }
    if (opts.linkLocal) {
        body.push("ipv6 address " + opts.linkLocal + " link-local");
    }
    if (opts.enable !== false) {
        body.push("ipv6 enable");
    }
    body.push("no shutdown");
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, body));
}

function shutdownInterface(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}

function enableInterface(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["no shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}

function setInterfaceDescription(deviceName, interfaceName, text) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["description " + text]));
}

function setClockRate(deviceName, interfaceName, rate) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["clock rate " + (rate || 64000)]));
}

function setBandwidth(deviceName, interfaceName, kbps) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["bandwidth " + kbps]));
}

function setSpeedDuplex(deviceName, interfaceName, speed, duplex) {
    var body = [];
    if (speed) {
        body.push("speed " + speed);
    }
    if (duplex) {
        body.push("duplex " + duplex);
    }
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, body));
}

function addLoopback(deviceName, number, address, mask) {
    return configureIosDevice(deviceName, buildInterfaceIp("Loopback" + number, address, isDefined(mask) ? mask : (String(address).indexOf("/") === -1 ? 32 : undefined)));
}

function buildSubinterface(parent, vlanId, address, mask, native) {
    var parsed = ipAndMask(address, mask);
    return interfaceBlock(parent, ["no shutdown"]).concat(interfaceBlock(parent + "." + vlanId, [
        "encapsulation dot1Q " + vlanId + (native ? " native" : ""),
        "ip address " + parsed.ip + " " + parsed.mask
    ]));
}

function addSubinterface(deviceName, parent, vlanId, address, mask, native) {
    return configureIosDevice(deviceName, buildSubinterface(parent, vlanId, address, mask, native));
}

function routerOnAStick(deviceName, parent, vlans) {
    var commands = [];
    Object.keys(vlans).forEach(function (vlanId) {
        commands = commands.concat(buildSubinterface(parent, vlanId, vlans[vlanId]));
    });
    return configureIosDevice(deviceName, commands);
}

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

function buildRouterDhcpPool(pool) {
    var info = parseNetwork(requireValue(pool.network, "network"), pool.mask);
    var commands = [];

    toList(pool.excluded).forEach(function (range) {
        var pair = toList(range);
        commands.push("ip dhcp excluded-address " + pair[0] + (pair[1] ? " " + pair[1] : ""));
    });

    commands.push("ip dhcp pool " + requireValue(pool.name, "name"));
    commands.push(" network " + info.network + " " + info.mask);
    if (pool.gateway) {
        commands.push(" default-router " + pool.gateway);
    }
    if (pool.dns) {
        commands.push(" dns-server " + toList(pool.dns).join(" "));
    }
    if (pool.domain) {
        commands.push(" domain-name " + pool.domain);
    }
    if (pool.tftp) {
        commands.push(" option 150 ip " + pool.tftp);
    }
    commands.push("exit");
    return commands;
}

function addRouterDhcpPool(deviceName, pool) {
    return configureIosDevice(deviceName, buildRouterDhcpPool(pool));
}

function excludeRouterDhcp(deviceName, startIp, endIp) {
    return configureIosDevice(deviceName, ["ip dhcp excluded-address " + startIp + (endIp ? " " + endIp : "")]);
}

function removeRouterDhcpPool(deviceName, name) {
    return configureIosDevice(deviceName, ["no ip dhcp pool " + name]);
}

function setDhcpRelay(deviceName, interfaceName, serverIp) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, toList(serverIp).map(function (ip) {
        return "ip helper-address " + ip;
    })));
}

function setNtpServer(deviceName, servers) {
    return configureIosDevice(deviceName, toList(servers).map(function (ip) {
        return "ntp server " + ip;
    }));
}

function setSyslogServer(deviceName, servers, trapLevel) {
    var commands = toList(servers).map(function (ip) {
        return "logging " + ip;
    });
    if (trapLevel) {
        commands.push("logging trap " + trapLevel);
    }
    commands.push("service timestamps log datetime msec");
    return configureIosDevice(deviceName, commands);
}

function setSnmpCommunity(deviceName, community, access) {
    return configureIosDevice(deviceName, ["snmp-server community " + community + " " + (access === "rw" ? "RW" : "RO")]);
}

function setCdp(deviceName, enabled) {
    return configureIosDevice(deviceName, [enabled === false ? "no cdp run" : "cdp run"]);
}

function setLldp(deviceName, enabled) {
    return configureIosDevice(deviceName, [enabled === false ? "no lldp run" : "lldp run"]);
}

function setDefaultGateway(deviceName, gateway) {
    return configureIosDevice(deviceName, ["ip default-gateway " + gateway]);
}

function enableIpRouting(deviceName) {
    return configureIosDevice(deviceName, ["ip routing"]);
}

function enableIpv6Routing(deviceName) {
    return configureIosDevice(deviceName, ["ipv6 unicast-routing"]);
}

function buildVlans(vlans) {
    var commands = [];
    if (Array.isArray(vlans)) {
        vlans.forEach(function (id) {
            commands.push("vlan " + id);
            commands.push("exit");
        });
        return commands;
    }
    Object.keys(vlans).forEach(function (id) {
        commands.push("vlan " + id);
        if (vlans[id]) {
            commands.push(" name " + vlans[id]);
        }
        commands.push("exit");
    });
    return commands;
}

function createVlans(deviceName, vlans) {
    return configureIosDevice(deviceName, buildVlans(vlans));
}

function deleteVlan(deviceName, vlans) {
    return configureIosDevice(deviceName, toList(vlans).map(function (id) {
        return "no vlan " + id;
    }));
}

function buildAccessPorts(interfaces, vlanId, options) {
    var opts = options || {};
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["switchport mode access", "switchport access vlan " + vlanId];
        if (opts.voiceVlan) {
            body.push("switchport voice vlan " + opts.voiceVlan);
        }
        if (opts.portfast) {
            body.push("spanning-tree portfast");
        }
        if (opts.bpduguard) {
            body.push("spanning-tree bpduguard enable");
        }
        if (opts.description) {
            body.push("description " + opts.description);
        }
        body.push("no shutdown");
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function setAccessPort(deviceName, interfaces, vlanId, options) {
    return configureIosDevice(deviceName, buildAccessPorts(interfaces, vlanId, options));
}

function assignPorts(deviceName, map, options) {
    var commands = [];
    Object.keys(map).forEach(function (vlanId) {
        commands = commands.concat(buildAccessPorts(map[vlanId], vlanId, options));
    });
    return configureIosDevice(deviceName, commands);
}

function buildSvi(vlanId, address, mask, description) {
    var parsed = ipAndMask(address, mask);
    var body = [];
    if (description) {
        body.push("description " + description);
    }
    body.push("ip address " + parsed.ip + " " + parsed.mask);
    body.push("no shutdown");
    return interfaceBlock("Vlan" + vlanId, body);
}

function addSvi(deviceName, vlanId, address, mask, description) {
    return configureIosDevice(deviceName, buildSvi(vlanId, address, mask, description));
}

function setManagementIp(deviceName, vlanId, address, mask, gateway) {
    var commands = buildSvi(vlanId, address, mask);
    if (gateway) {
        commands.push("ip default-gateway " + gateway);
    }
    return configureIosDevice(deviceName, commands);
}

function setVoiceVlan(deviceName, interfaces, voiceVlan) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["switchport voice vlan " + voiceVlan]));
    });
    return configureIosDevice(deviceName, commands);
}

function parkUnusedPorts(deviceName, interfaces, vlanId) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, [
            "switchport mode access",
            "switchport access vlan " + vlanId,
            "shutdown"
        ]));
    });
    return configureIosDevice(deviceName, commands);
}

function buildTrunkPorts(interfaces, allowedVlans, nativeVlan, options) {
    var opts = options || {};
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = [];
        if (opts.encapsulation) {
            body.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        body.push("switchport mode trunk");
        if (isDefined(allowedVlans) && allowedVlans !== "") {
            body.push("switchport trunk allowed vlan " + joinVlans(allowedVlans));
        }
        if (nativeVlan) {
            body.push("switchport trunk native vlan " + nativeVlan);
        }
        if (opts.nonegotiate) {
            body.push("switchport nonegotiate");
        }
        body.push("no shutdown");
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function setTrunkPort(deviceName, interfaces, allowedVlans, nativeVlan, options) {
    var opts = Object.assign({}, options || {});
    if (!opts.encapsulation && findDevice(deviceName).getType() === deviceTypes.multilayerswitch) {
        opts.encapsulation = "dot1q";
    }
    return configureIosDevice(deviceName, buildTrunkPorts(interfaces, allowedVlans, nativeVlan, opts));
}

function setDtpMode(deviceName, interfaces, mode) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["switchport mode " + mode]));
    });
    return configureIosDevice(deviceName, commands);
}

var etherChannelModes = ["active", "passive", "desirable", "auto", "on"];

function buildEtherChannel(group, interfaces, mode, options) {
    var opts = options || {};
    var channelMode = mode || "active";
    if (etherChannelModes.indexOf(channelMode) === -1) {
        throw new Error("Invalid EtherChannel mode: " + channelMode);
    }

    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = [];
        if (opts.trunk) {
            if (opts.encapsulation) {
                body.push("switchport trunk encapsulation " + opts.encapsulation);
            }
            body.push("switchport mode trunk");
        } else if (opts.accessVlan) {
            body.push("switchport mode access");
            body.push("switchport access vlan " + opts.accessVlan);
        } else if (opts.address) {
            body.push("no switchport");
        }
        body.push("channel-group " + group + " mode " + channelMode);
        body.push("no shutdown");
        commands = commands.concat(interfaceBlock(name, body));
    });

    var portChannel = [];
    if (opts.trunk) {
        if (opts.encapsulation) {
            portChannel.push("switchport trunk encapsulation " + opts.encapsulation);
        }
        portChannel.push("switchport mode trunk");
        if (opts.allowedVlans) {
            portChannel.push("switchport trunk allowed vlan " + joinVlans(opts.allowedVlans));
        }
        if (opts.nativeVlan) {
            portChannel.push("switchport trunk native vlan " + opts.nativeVlan);
        }
    } else if (opts.address) {
        var parsed = ipAndMask(opts.address, opts.mask);
        portChannel.push("no switchport");
        portChannel.push("ip address " + parsed.ip + " " + parsed.mask);
    }
    portChannel.push("no shutdown");
    return commands.concat(interfaceBlock("Port-channel" + group, portChannel));
}

function createEtherChannel(deviceName, group, interfaces, mode, options) {
    var opts = Object.assign({}, options || {});
    if (opts.trunk && !opts.encapsulation && findDevice(deviceName).getType() === deviceTypes.multilayerswitch) {
        opts.encapsulation = "dot1q";
    }
    return configureIosDevice(deviceName, buildEtherChannel(group, interfaces, mode, opts));
}

function setEtherChannelLoadBalance(deviceName, method) {
    return configureIosDevice(deviceName, ["port-channel load-balance " + method]);
}

function setStpMode(deviceName, mode) {
    var value = mode || "rapid-pvst";
    if (["pvst", "rapid-pvst"].indexOf(value) === -1) {
        throw new Error("Invalid STP mode: " + value);
    }
    return configureIosDevice(deviceName, ["spanning-tree mode " + value]);
}

function setStpRoot(deviceName, vlans, role) {
    return configureIosDevice(deviceName, ["spanning-tree vlan " + joinVlans(vlans) + " root " + (role === "secondary" ? "secondary" : "primary")]);
}

function setStpPriority(deviceName, vlans, priority) {
    var value = Number(priority);
    if (value % 4096 !== 0 || value < 0 || value > 61440) {
        throw new Error("STP priority must be a multiple of 4096 between 0 and 61440");
    }
    return configureIosDevice(deviceName, ["spanning-tree vlan " + joinVlans(vlans) + " priority " + value]);
}

function enablePortfast(deviceName, interfaces, bpduguard) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["spanning-tree portfast"];
        if (bpduguard !== false) {
            body.push("spanning-tree bpduguard enable");
        }
        commands = commands.concat(interfaceBlock(name, body));
    });
    return configureIosDevice(deviceName, commands);
}

function enablePortfastDefault(deviceName, bpduguard) {
    var commands = ["spanning-tree portfast default"];
    if (bpduguard !== false) {
        commands.push("spanning-tree portfast bpduguard default");
    }
    return configureIosDevice(deviceName, commands);
}

function setStpPortCost(deviceName, interfaceName, cost, vlan) {
    var line = isDefined(vlan) ? "spanning-tree vlan " + vlan + " cost " + cost : "spanning-tree cost " + cost;
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, [line]));
}

function buildVtp(options) {
    var opts = options || {};
    var commands = [];
    if (opts.domain) {
        commands.push("vtp domain " + opts.domain);
    }
    if (opts.mode) {
        if (["server", "client", "transparent"].indexOf(opts.mode) === -1) {
            throw new Error("Invalid VTP mode: " + opts.mode);
        }
        commands.push("vtp mode " + opts.mode);
    }
    if (opts.password) {
        commands.push("vtp password " + opts.password);
    }
    if (opts.version) {
        commands.push("vtp version " + opts.version);
    }
    if (opts.pruning) {
        commands.push("vtp pruning");
    }
    return commands;
}

function configureVtp(deviceName, options) {
    return configureIosDevice(deviceName, buildVtp(options));
}

function buildPortSecurity(interfaces, options) {
    var opts = options || {};
    var violation = opts.violation || "shutdown";
    if (["shutdown", "restrict", "protect"].indexOf(violation) === -1) {
        throw new Error("Invalid violation mode: " + violation);
    }

    var commands = [];
    toList(interfaces).forEach(function (name) {
        var body = ["switchport mode access", "switchport port-security"];
        body.push("switchport port-security maximum " + (opts.maximum || 1));
        body.push("switchport port-security violation " + violation);
        if (opts.sticky !== false) {
            body.push("switchport port-security mac-address sticky");
        }
        toList(opts.macs).forEach(function (mac) {
            body.push("switchport port-security mac-address " + mac);
        });
        if (opts.agingTime) {
            body.push("switchport port-security aging time " + opts.agingTime);
        }
        commands = commands.concat(interfaceBlock(name, body));
    });
    return commands;
}

function configurePortSecurity(deviceName, interfaces, options) {
    return configureIosDevice(deviceName, buildPortSecurity(interfaces, options));
}

function recoverErrDisabled(deviceName, interfaces) {
    var commands = [];
    toList(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["shutdown", "no shutdown"]));
    });
    return configureIosDevice(deviceName, commands);
}

function buildDhcpSnooping(vlans, trusted, options) {
    var opts = options || {};
    var commands = ["ip dhcp snooping", "ip dhcp snooping vlan " + joinVlans(vlans)];
    if (opts.option82 === false) {
        commands.push("no ip dhcp snooping information option");
    }
    toList(trusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip dhcp snooping trust"]));
    });
    toList(opts.untrusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip dhcp snooping limit rate " + (opts.rateLimit || 15)]));
    });
    return commands;
}

function enableDhcpSnooping(deviceName, vlans, trusted, options) {
    return configureIosDevice(deviceName, buildDhcpSnooping(vlans, trusted, options));
}

function enableArpInspection(deviceName, vlans, trusted) {
    var commands = ["ip arp inspection vlan " + joinVlans(vlans)];
    toList(trusted).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip arp inspection trust"]));
    });
    return configureIosDevice(deviceName, commands);
}

function buildStaticRoute(destination, maskOrNextHop, nextHop, distance) {
    var network;
    var hop;
    var ad;
    if (String(destination).indexOf("/") !== -1) {
        network = networkAndMask(destination);
        hop = maskOrNextHop;
        ad = nextHop;
    } else {
        network = networkAndMask(destination, maskOrNextHop);
        hop = nextHop;
        ad = distance;
    }
    return "ip route " + network + " " + requireValue(hop, "next hop") + (isDefined(ad) ? " " + ad : "");
}

function addStaticRoute(deviceName, destination, maskOrNextHop, nextHop, distance) {
    return configureIosDevice(deviceName, [buildStaticRoute(destination, maskOrNextHop, nextHop, distance)]);
}

function addStaticRoutes(deviceName, routes) {
    return configureIosDevice(deviceName, routes.map(function (route) {
        return buildStaticRoute(route[0], route[1], route[2], route[3]);
    }));
}

function removeStaticRoute(deviceName, destination, maskOrNextHop, nextHop) {
    return configureIosDevice(deviceName, ["no " + buildStaticRoute(destination, maskOrNextHop, nextHop)]);
}

function addDefaultRoute(deviceName, nextHop, distance) {
    return configureIosDevice(deviceName, ["ip route 0.0.0.0 0.0.0.0 " + requireValue(nextHop, "next hop") + (isDefined(distance) ? " " + distance : "")]);
}

function addFloatingRoute(deviceName, destination, nextHop, distance) {
    return addStaticRoute(deviceName, destination, nextHop, distance || 200);
}

function addIpv6StaticRoute(deviceName, prefix, nextHop, distance) {
    return configureIosDevice(deviceName, ["ipv6 route " + prefix + " " + nextHop + (isDefined(distance) ? " " + distance : "")]);
}

function addIpv6DefaultRoute(deviceName, nextHop) {
    return configureIosDevice(deviceName, ["ipv6 route ::/0 " + nextHop]);
}

function normalizeOspfNetwork(entry, defaultArea) {
    if (typeof entry === "string") {
        return { network: entry, area: defaultArea };
    }
    return { network: entry.network, mask: entry.mask, area: isDefined(entry.area) ? entry.area : defaultArea };
}

function buildOspf(options) {
    var opts = options || {};
    var area = isDefined(opts.area) ? opts.area : 0;
    var commands = ["router ospf " + (opts.processId || 1)];

    if (opts.routerId) {
        commands.push(" router-id " + opts.routerId);
    }
    toList(opts.networks).forEach(function (entry) {
        var item = normalizeOspfNetwork(entry, area);
        commands.push(" network " + networkAndWildcard(item.network, item.mask) + " area " + item.area);
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    if (opts.referenceBandwidth) {
        commands.push(" auto-cost reference-bandwidth " + opts.referenceBandwidth);
    }
    commands.push("exit");
    return commands;
}

function configureOspf(deviceName, options) {
    return configureIosDevice(deviceName, buildOspf(options));
}

function buildOspfInterface(interfaceName, options) {
    var opts = options || {};
    var body = [];
    if (isDefined(opts.cost)) {
        body.push("ip ospf cost " + opts.cost);
    }
    if (isDefined(opts.priority)) {
        body.push("ip ospf priority " + opts.priority);
    }
    if (isDefined(opts.hello)) {
        body.push("ip ospf hello-interval " + opts.hello);
    }
    if (isDefined(opts.dead)) {
        body.push("ip ospf dead-interval " + opts.dead);
    }
    if (opts.processId && isDefined(opts.area)) {
        body.push("ip ospf " + opts.processId + " area " + opts.area);
    }
    if (opts.md5Key) {
        body.push("ip ospf authentication message-digest");
        body.push("ip ospf message-digest-key " + (opts.keyId || 1) + " md5 " + opts.md5Key);
    }
    if (opts.networkType) {
        body.push("ip ospf network " + opts.networkType);
    }
    return interfaceBlock(interfaceName, body);
}

function setOspfInterface(deviceName, interfaceName, options) {
    return configureIosDevice(deviceName, buildOspfInterface(interfaceName, options));
}

function buildOspfv3(options) {
    var opts = options || {};
    var processId = opts.processId || 1;
    var commands = ["ipv6 unicast-routing", "ipv6 router ospf " + processId];
    commands.push(" router-id " + requireValue(opts.routerId, "routerId"));
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    commands.push("exit");

    var interfaces = opts.interfaces || {};
    if (Array.isArray(interfaces)) {
        var mapped = {};
        interfaces.forEach(function (name) {
            mapped[name] = isDefined(opts.area) ? opts.area : 0;
        });
        interfaces = mapped;
    }
    Object.keys(interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ipv6 ospf " + processId + " area " + interfaces[name]]));
    });
    return commands;
}

function configureOspfv3(deviceName, options) {
    return configureIosDevice(deviceName, buildOspfv3(options));
}

function removeOspf(deviceName, processId) {
    return configureIosDevice(deviceName, ["no router ospf " + (processId || 1)]);
}

function buildEigrp(options) {
    var opts = options || {};
    var commands = ["router eigrp " + requireValue(opts.as, "as")];
    if (opts.routerId) {
        commands.push(" eigrp router-id " + opts.routerId);
    }
    toList(opts.networks).forEach(function (entry) {
        var text = String(entry);
        commands.push(" network " + (text.indexOf("/") !== -1 ? networkAndWildcard(text) : text));
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.autoSummary !== true) {
        commands.push(" no auto-summary");
    }
    toList(opts.redistribute).forEach(function (source) {
        commands.push(" redistribute " + source);
    });
    commands.push("exit");
    return commands;
}

function configureEigrp(deviceName, options) {
    return configureIosDevice(deviceName, buildEigrp(options));
}

function buildEigrpv6(options) {
    var opts = options || {};
    var as = requireValue(opts.as, "as");
    var commands = ["ipv6 unicast-routing", "ipv6 router eigrp " + as];
    commands.push(" eigrp router-id " + requireValue(opts.routerId, "routerId"));
    commands.push(" no shutdown");
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    commands.push("exit");
    toList(opts.interfaces).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ipv6 eigrp " + as]));
    });
    return commands;
}

function configureEigrpv6(deviceName, options) {
    return configureIosDevice(deviceName, buildEigrpv6(options));
}

function setEigrpSummary(deviceName, interfaceName, as, network, mask) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip summary-address eigrp " + as + " " + networkAndMask(network, mask)]));
}

function removeEigrp(deviceName, as) {
    return configureIosDevice(deviceName, ["no router eigrp " + as]);
}

function classfulNetwork(entry) {
    var text = String(entry);
    var ip = text.split("/")[0];
    var first = Number(ip.split(".")[0]);
    var prefix = first < 128 ? 8 : first < 192 ? 16 : 24;
    return networkAddress(ip, prefix);
}

function buildRip(options) {
    var opts = options || {};
    var commands = ["router rip", " version " + (opts.version || 2)];
    var seen = {};
    toList(opts.networks).forEach(function (entry) {
        var network = classfulNetwork(entry);
        if (!seen[network]) {
            seen[network] = true;
            commands.push(" network " + network);
        }
    });
    toList(opts.passive).forEach(function (name) {
        commands.push(" passive-interface " + name);
    });
    if (opts.autoSummary !== true) {
        commands.push(" no auto-summary");
    }
    if (opts.defaultOriginate) {
        commands.push(" default-information originate");
    }
    commands.push("exit");
    return commands;
}

function configureRip(deviceName, options) {
    return configureIosDevice(deviceName, buildRip(options));
}

function configureRipng(deviceName, name, interfaces) {
    var commands = ["ipv6 unicast-routing", "ipv6 router rip " + name, "exit"];
    toList(interfaces).forEach(function (item) {
        commands = commands.concat(interfaceBlock(item, ["ipv6 rip " + name + " enable"]));
    });
    return configureIosDevice(deviceName, commands);
}

function removeRip(deviceName) {
    return configureIosDevice(deviceName, ["no router rip"]);
}

function buildBgp(options) {
    var opts = options || {};
    var commands = ["router bgp " + requireValue(opts.as, "as")];
    if (opts.routerId) {
        commands.push(" bgp router-id " + opts.routerId);
    }
    toList(opts.neighbors).forEach(function (neighbor) {
        commands.push(" neighbor " + requireValue(neighbor.ip, "neighbor ip") + " remote-as " + requireValue(neighbor.remoteAs, "remoteAs"));
        if (neighbor.description) {
            commands.push(" neighbor " + neighbor.ip + " description " + neighbor.description);
        }
    });
    toList(opts.networks).forEach(function (entry) {
        commands.push(" network " + networkAndMask(entry).replace(" ", " mask "));
    });
    commands.push("exit");
    return commands;
}

function configureBgp(deviceName, options) {
    return configureIosDevice(deviceName, buildBgp(options));
}

function removeBgp(deviceName, as) {
    return configureIosDevice(deviceName, ["no router bgp " + as]);
}

function redistribute(deviceName, into, source, options) {
    var opts = options || {};
    var header;
    if (into.protocol === "ospf") {
        header = "router ospf " + (into.id || 1);
    } else if (into.protocol === "eigrp") {
        header = "router eigrp " + requireValue(into.id, "EIGRP AS");
    } else if (into.protocol === "rip") {
        header = "router rip";
    } else if (into.protocol === "bgp") {
        header = "router bgp " + requireValue(into.id, "BGP AS");
    } else {
        throw new Error("Unknown routing protocol: " + into.protocol);
    }

    var line = " redistribute " + source;
    if (into.protocol === "ospf" && opts.subnets !== false) {
        line += " subnets";
    }
    if (opts.metric) {
        line += " metric " + opts.metric;
    }
    return configureIosDevice(deviceName, [header, line, "exit"]);
}

function aclPort(value) {
    if (!isDefined(value) || value === "") {
        return "";
    }
    var text = String(value);
    if (/^(eq|neq|gt|lt|range) /.test(text)) {
        return " " + text;
    }
    return " eq " + text;
}

function buildAclEntry(entry, extended) {
    if (typeof entry === "string") {
        return entry.trim();
    }
    var action = entry.action || "permit";
    if (action === "remark") {
        return "remark " + entry.text;
    }
    if (!extended) {
        return action + " " + aclAddress(entry.source || "any");
    }
    var line = action + " " + (entry.protocol || "ip") + " " + aclAddress(entry.source || "any") + aclPort(entry.sourcePort);
    line += " " + aclAddress(entry.destination || "any") + aclPort(entry.port);
    if (entry.established) {
        line += " established";
    }
    if (entry.icmpType) {
        line += " " + entry.icmpType;
    }
    if (entry.log) {
        line += " log";
    }
    return line;
}

function isNumberedAcl(id) {
    return /^\d+$/.test(String(id));
}

function buildAcl(id, entries, extended) {
    var list = toList(entries).map(function (entry) {
        return buildAclEntry(entry, extended);
    });
    if (isNumberedAcl(id)) {
        return list.map(function (line) {
            return "access-list " + id + " " + line;
        });
    }
    return ["ip access-list " + (extended ? "extended " : "standard ") + id].concat(list.map(function (line) {
        return " " + line;
    })).concat(["exit"]);
}

function createStandardAcl(deviceName, id, entries) {
    if (isNumberedAcl(id) && !((id >= 1 && id <= 99) || (id >= 1300 && id <= 1999))) {
        throw new Error("Standard ACL numbers are 1-99 or 1300-1999");
    }
    return configureIosDevice(deviceName, buildAcl(id, entries, false));
}

function createExtendedAcl(deviceName, id, entries) {
    if (isNumberedAcl(id) && !((id >= 100 && id <= 199) || (id >= 2000 && id <= 2699))) {
        throw new Error("Extended ACL numbers are 100-199 or 2000-2699");
    }
    return configureIosDevice(deviceName, buildAcl(id, entries, true));
}

function applyAcl(deviceName, interfaceName, id, direction) {
    var dir = direction || "in";
    if (dir !== "in" && dir !== "out") {
        throw new Error("ACL direction must be in or out");
    }
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["ip access-group " + id + " " + dir]));
}

function removeAclFromInterface(deviceName, interfaceName, id, direction) {
    return configureIosDevice(deviceName, interfaceBlock(interfaceName, ["no ip access-group " + id + " " + (direction || "in")]));
}

function applyAclToVty(deviceName, id, lines) {
    return configureIosDevice(deviceName, ["line vty " + (lines || "0 15"), " access-class " + id + " in", "exit"]);
}

function deleteAcl(deviceName, id, extended) {
    if (isNumberedAcl(id)) {
        return configureIosDevice(deviceName, ["no access-list " + id]);
    }
    return configureIosDevice(deviceName, ["no ip access-list " + (extended ? "extended " : "standard ") + id]);
}

function createIpv6Acl(deviceName, name, entries, interfaceName, direction) {
    var commands = ["ipv6 access-list " + name].concat(toList(entries).map(function (line) {
        return " " + line;
    })).concat(["exit"]);
    if (interfaceName) {
        commands = commands.concat(interfaceBlock(interfaceName, ["ipv6 traffic-filter " + name + " " + (direction || "in")]));
    }
    return configureIosDevice(deviceName, commands);
}

function buildNatInterfaces(inside, outside) {
    var commands = [];
    toList(inside).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip nat inside"]));
    });
    toList(outside).forEach(function (name) {
        commands = commands.concat(interfaceBlock(name, ["ip nat outside"]));
    });
    return commands;
}

function setNatInterfaces(deviceName, inside, outside) {
    return configureIosDevice(deviceName, buildNatInterfaces(inside, outside));
}

function addStaticNat(deviceName, insideLocal, insideGlobal, options) {
    var opts = options || {};
    var commands = [];
    if (opts.inside || opts.outside) {
        commands = buildNatInterfaces(opts.inside, opts.outside);
    }
    if (opts.protocol) {
        commands.push("ip nat inside source static " + opts.protocol + " " + insideLocal + " " + opts.localPort + " " + insideGlobal + " " + opts.globalPort);
    } else {
        commands.push("ip nat inside source static " + insideLocal + " " + insideGlobal);
    }
    return configureIosDevice(deviceName, commands);
}

function buildNatAcl(aclId, networks) {
    return toList(networks).map(function (network) {
        return "access-list " + aclId + " permit " + aclAddress(network);
    });
}

function configurePat(deviceName, options) {
    var opts = options || {};
    var aclId = opts.acl || 1;
    var commands = buildNatInterfaces(opts.inside, requireValue(opts.outside, "outside"));
    commands = commands.concat(buildNatAcl(aclId, opts.networks));
    commands.push("ip nat inside source list " + aclId + " interface " + opts.outside + " overload");
    return configureIosDevice(deviceName, commands);
}

function configureNatPool(deviceName, options) {
    var opts = options || {};
    var aclId = opts.acl || 1;
    var poolName = opts.name || "NATPOOL";
    var commands = buildNatInterfaces(opts.inside, opts.outside);
    commands.push("ip nat pool " + poolName + " " + requireValue(opts.start, "start") + " " + requireValue(opts.end, "end") + " netmask " + normalizeMask(requireValue(opts.mask, "mask")));
    commands = commands.concat(buildNatAcl(aclId, opts.networks));
    commands.push("ip nat inside source list " + aclId + " pool " + poolName + (opts.overload ? " overload" : ""));
    return configureIosDevice(deviceName, commands);
}

function clearNatTranslations(deviceName) {
    return runCommand(deviceName, "clear ip nat translation *", "enable");
}

function buildSsh(options) {
    var opts = options || {};
    var commands = [];
    if (opts.hostname) {
        commands.push("hostname " + opts.hostname);
    }
    commands.push("ip domain-name " + requireValue(opts.domain, "domain"));
    if (opts.username) {
        commands.push("username " + opts.username + " privilege " + (opts.privilege || 15) + " secret " + requireValue(opts.password, "password"));
    }
    commands.push("crypto key generate rsa general-keys modulus " + (opts.modulus || 1024));
    commands.push("ip ssh version " + (opts.version || 2));
    if (opts.timeout) {
        commands.push("ip ssh time-out " + opts.timeout);
    }
    if (opts.retries) {
        commands.push("ip ssh authentication-retries " + opts.retries);
    }
    commands.push("line vty " + (opts.lines || "0 15"));
    commands.push(" login local");
    commands.push(" transport input " + (opts.allowTelnet ? "ssh telnet" : "ssh"));
    if (opts.execTimeout) {
        commands.push(" exec-timeout " + opts.execTimeout);
    }
    commands.push("exit");
    return commands;
}

function configureSsh(deviceName, options) {
    var opts = Object.assign({}, options || {});
    if (!opts.hostname) {
        var current = String(callIfExists(findDevice(deviceName), "getHostName", ""));
        if (!current || current === "Router" || current === "Switch") {
            opts.hostname = deviceName;
        }
    }
    return configureIosDevice(deviceName, buildSsh(opts));
}

function setLoginBlock(deviceName, seconds, attempts, within) {
    return configureIosDevice(deviceName, ["login block-for " + seconds + " attempts " + attempts + " within " + within]);
}

function setMinPasswordLength(deviceName, length) {
    return configureIosDevice(deviceName, ["security passwords min-length " + length]);
}

function buildAaa(options) {
    var opts = options || {};
    var commands = ["aaa new-model"];
    var methods = [];

    if (opts.radius) {
        commands.push("radius-server host " + requireValue(opts.radius.host, "radius host") + " key " + requireValue(opts.radius.key, "radius key"));
        methods.push("group radius");
    }
    if (opts.tacacs) {
        commands.push("tacacs-server host " + requireValue(opts.tacacs.host, "tacacs host"));
        commands.push("tacacs-server key " + requireValue(opts.tacacs.key, "tacacs key"));
        methods.push("group tacacs+");
    }
    if (opts.localFallback !== false || methods.length === 0) {
        methods.push("local");
    }
    toList(opts.users).forEach(function (user) {
        commands.push("username " + user.name + " secret " + user.password);
    });
    commands.push("aaa authentication login default " + methods.join(" "));
    return commands;
}

function configureAaa(deviceName, options) {
    return configureIosDevice(deviceName, buildAaa(options));
}

function buildHsrp(interfaceName, options) {
    var opts = options || {};
    var group = isDefined(opts.group) ? opts.group : 1;
    var body = [];
    if (opts.version) {
        body.push("standby version " + opts.version);
    }
    body.push("standby " + group + " ip " + requireValue(opts.virtualIp, "virtualIp"));
    if (isDefined(opts.priority)) {
        body.push("standby " + group + " priority " + opts.priority);
    }
    if (opts.preempt !== false) {
        body.push("standby " + group + " preempt");
    }
    if (opts.track) {
        body.push("standby " + group + " track " + opts.track + (opts.decrement ? " " + opts.decrement : ""));
    }
    return interfaceBlock(interfaceName, body);
}

function configureHsrp(deviceName, interfaceName, options) {
    return configureIosDevice(deviceName, buildHsrp(interfaceName, options));
}

function configureHsrpPair(activeDevice, standbyDevice, interfaceName, virtualIp, group) {
    return {
        active: configureHsrp(activeDevice, interfaceName, { group: group, virtualIp: virtualIp, priority: 150 }),
        standby: configureHsrp(standbyDevice, interfaceName, { group: group, virtualIp: virtualIp, priority: 100 })
    };
}

function dhcpServer(deviceName, portName) {
    var main = getProcessOf(deviceName, "DhcpServerMain");
    var dhcp = main.getDhcpServerProcessByPortName(portName || "FastEthernet0");
    if (!dhcp) {
        throw new Error("DHCP server not available on " + deviceName + " " + (portName || "FastEthernet0"));
    }
    return dhcp;
}

function setDhcpService(deviceName, enabled, portName) {
    dhcpServer(deviceName, portName).setEnable(enabled !== false);
    return true;
}

function addDhcpPool(deviceName, pool, portName) {
    var dhcp = dhcpServer(deviceName, portName);
    var mask = normalizeMask(requireValue(pool.mask, "mask"));
    dhcp.setEnable(true);
    dhcp.addNewPool(
        requireValue(pool.name, "name"),
        pool.gateway || "0.0.0.0",
        pool.dns || "0.0.0.0",
        requireValue(pool.start, "start"),
        mask,
        pool.maxUsers || 256,
        pool.tftp || "0.0.0.0",
        pool.wlc || "0.0.0.0"
    );
    return true;
}

function removeDhcpPool(deviceName, poolName, portName) {
    dhcpServer(deviceName, portName).removePool(poolName);
    return true;
}

function excludeDhcpRange(deviceName, startIp, endIp, portName) {
    dhcpServer(deviceName, portName).addExcludedAddress(startIp, endIp || startIp);
    return true;
}

function getDhcpPools(deviceName, portName) {
    var dhcp = dhcpServer(deviceName, portName);
    var pools = [];
    for (var i = 0; i < dhcp.getPoolCount(); i++) {
        var pool = dhcp.getPoolAt(i);
        pools.push({
            name: String(pool.getDhcpPoolName()),
            gateway: String(pool.getDefaultRouter()),
            dns: String(pool.getDnsServerIp()),
            start: String(pool.getStartIp()),
            end: String(pool.getEndIp()),
            mask: String(pool.getSubnetMask()),
            maxUsers: pool.getMaxUsers()
        });
    }
    return pools;
}

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

function setHttpService(deviceName, enabled) {
    getProcessOf(deviceName, "HttpServer").setEnable(enabled !== false);
    return true;
}

function setHttpsService(deviceName, enabled) {
    getProcessOf(deviceName, "HttpsServer").setEnable(enabled !== false);
    return true;
}

function setWebPage(deviceName, fileName, html) {
    getProcessOf(deviceName, "HttpServer").setPageContents(fileName, String(html));
    return true;
}

function getWebPage(deviceName, fileName) {
    return String(getProcessOf(deviceName, "HttpServer").getPage(fileName));
}

function ftpAccounts(deviceName) {
    return getProcessOf(deviceName, "FtpServer").getFtpUserAccountManager();
}

function addFtpUser(deviceName, username, password, permissions) {
    var perms = String(permissions || "RWNLD").toUpperCase();
    if (!/^[RWNLD]+$/.test(perms)) {
        throw new Error("FTP permissions use the letters R W N L D");
    }
    var accounts = ftpAccounts(deviceName);
    if (accounts.isExistingUser(username)) {
        accounts.removeFtpUser(username);
    }
    accounts.addFtpUser(username, password, perms);
    return true;
}

function removeFtpUser(deviceName, username) {
    ftpAccounts(deviceName).removeFtpUser(username);
    return true;
}

function getFtpUsers(deviceName) {
    var accounts = ftpAccounts(deviceName);
    var users = [];
    for (var i = 0; i < accounts.getUsersCount(); i++) {
        users.push({ username: String(accounts.getUsernameAt(i)), permissions: String(accounts.getPermissionAt(i)) });
    }
    return users;
}

function emailServer(deviceName) {
    return getProcessOf(deviceName, "EmailServer");
}

function addEmailUser(deviceName, username, password) {
    return emailServer(deviceName).addUser(username, password) === true;
}

function addEmailUsers(deviceName, users) {
    var entries = Object.keys(users).map(function (name) {
        return name + ":" + users[name] + ";";
    }).join("");
    emailServer(deviceName).updateAllAccounts(entries);
    return true;
}

function removeEmailUser(deviceName, username) {
    return emailServer(deviceName).deleteUser(username) === true;
}

function setEmailPassword(deviceName, username, password) {
    emailServer(deviceName).changePassword(username, password);
    return true;
}

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

function wirelessProcess(deviceName) {
    var device = findDevice(deviceName);
    var process = device.getProcess("WirelessServer") || device.getProcess("WirelessCommon");
    if (!process) {
        throw new Error("No wireless radio on " + deviceName);
    }
    return process;
}

function configureWireless(deviceName, options) {
    var opts = options || {};
    var process = wirelessProcess(deviceName);
    var security = opts.security || (opts.key ? "wpa2-psk" : "open");
    var authType = wirelessAuthTypes[security];
    if (authType === undefined) {
        throw new Error("Unknown wireless security: " + security);
    }

    if (opts.ssid) {
        process.setSsid(String(opts.ssid));
    }
    if (opts.mode) {
        var mode = wirelessNetworkModes[opts.mode];
        if (mode === undefined) {
            throw new Error("Unknown wireless mode: " + opts.mode);
        }
        process.setNetworkType(mode);
    }

    process.setAuthenType(authType);

    if (security === "wep") {
        process.setEncryptType(wirelessEncryptTypes[opts.encryption || "wep64"]);
        process.getWepProcess().setKey(requireValue(opts.key, "key"));
    } else if (security === "wpa-psk" || security === "wpa2-psk") {
        var key = String(requireValue(opts.key, "key"));
        if (key.length < 8 || key.length > 63) {
            throw new Error("WPA key must be 8 to 63 characters");
        }
        process.setEncryptType(wirelessEncryptTypes[opts.encryption || (security === "wpa2-psk" ? "aes" : "tkip")]);
        process.getWpaProcess().setKey(key);
    } else if (security === "open" || security === "none") {
        process.setEncryptType(wirelessEncryptTypes.none);
    }

    if (opts.hideSsid === true || opts.hideSsid === false) {
        if (typeof process.setSsidBrdCastEnabled === "function") {
            process.setSsidBrdCastEnabled(!opts.hideSsid);
        }
    }
    return true;
}

function getWirelessSsid(deviceName) {
    return String(wirelessProcess(deviceName).getSsid());
}

function setMacFilter(deviceName, macs, allow) {
    var process = wirelessProcess(deviceName);
    process.removeAllMacEntries();
    toList(macs).forEach(function (mac) {
        process.addToMacFilterAddrList(mac);
    });
    process.setAllowAccess(allow !== false);
    process.setMacFilterEnabled(toList(macs).length > 0);
    return true;
}

function addNote(x, y, text, layer) {
    return logicalWorkspace().addNote(Math.round(x), Math.round(y), layerOrCurrent(layer), String(text));
}

function setNoteText(noteId, text) {
    return logicalWorkspace().changeNoteText(noteId, String(text)) === true;
}

function getNoteText(noteId) {
    return String(logicalWorkspace().getCanvasNoteText(noteId));
}

function getNotes() {
    var workspace = logicalWorkspace();
    return toArray(workspace.getCanvasNoteIds()).map(function (id) {
        return {
            id: id,
            text: String(workspace.getCanvasNoteText(id)),
            x: workspace.getCanvasItemX(id),
            y: workspace.getCanvasItemY(id)
        };
    });
}

function findNote(text) {
    var match = getNotes().filter(function (note) {
        return note.text === String(text);
    })[0];
    return match ? match.id : null;
}

function removeNotes() {
    var ids = toArray(logicalWorkspace().getCanvasNoteIds());
    ids.forEach(function (id) {
        logicalWorkspace().removeCanvasItem(id);
    });
    return ids.length;
}

function addTextPopup(x, y, text, width, layer) {
    return logicalWorkspace().addTextPopup(Math.round(x), Math.round(y), layerOrCurrent(layer), width || 200, String(text));
}

function removeTextPopup(popupId) {
    return logicalWorkspace().removeTextPopup(popupId) === true;
}

function drawLine(x1, y1, x2, y2, color, width, layer) {
    var rgb = toRgb(color);
    return logicalWorkspace().drawLine(
        Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2),
        layerOrCurrent(layer),
        width || 2,
        rgb[0], rgb[1], rgb[2]
    );
}

function drawCircle(cx, cy, radius, color, layer) {
    var rgb = toRgb(color);
    return logicalWorkspace().drawCircle(
        Math.round(cx), Math.round(cy),
        layerOrCurrent(layer),
        Math.round(radius),
        rgb[0], rgb[1], rgb[2]
    );
}

function drawRect(x, y, width, height, color, lineWidth, layer) {
    var right = x + width;
    var bottom = y + height;
    return [
        drawLine(x, y, right, y, color, lineWidth, layer),
        drawLine(right, y, right, bottom, color, lineWidth, layer),
        drawLine(right, bottom, x, bottom, color, lineWidth, layer),
        drawLine(x, bottom, x, y, color, lineWidth, layer)
    ];
}

function drawPolyline(points, color, width, closed, layer) {
    var ids = [];
    for (var i = 0; i < points.length - 1; i++) {
        ids.push(drawLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], color, width, layer));
    }
    if (closed && points.length > 2) {
        var last = points[points.length - 1];
        ids.push(drawLine(last[0], last[1], points[0][0], points[0][1], color, width, layer));
    }
    return ids;
}

function drawDashedLine(x1, y1, x2, y2, color, width, dash, layer) {
    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    var step = dash || 12;
    var count = Math.max(1, Math.floor(length / step));
    var ids = [];
    for (var i = 0; i < count; i += 2) {
        var from = i / count;
        var to = Math.min(1, (i + 1) / count);
        ids.push(drawLine(
            x1 + (x2 - x1) * from, y1 + (y2 - y1) * from,
            x1 + (x2 - x1) * to, y1 + (y2 - y1) * to,
            color, width, layer
        ));
    }
    return ids;
}

function drawZone(x, y, width, height, label, color, lineWidth) {
    var ids = drawRect(x, y, width, height, color, lineWidth || 3);
    if (label) {
        ids.push(addNote(x + 10, y + 10, label));
    }
    return ids;
}

function drawZoneAround(deviceNames, label, color, padding) {
    var pad = isDefined(padding) ? padding : 40;
    var positions = toList(deviceNames).map(getDevicePosition);
    if (!positions.length) {
        throw new Error("drawZoneAround needs at least one device");
    }
    var left = Math.min.apply(null, positions.map(function (p) { return p.x; })) - pad;
    var top = Math.min.apply(null, positions.map(function (p) { return p.y; })) - pad;
    var right = Math.max.apply(null, positions.map(function (p) { return p.x + 2 * (p.centerX - p.x); })) + pad;
    var bottom = Math.max.apply(null, positions.map(function (p) { return p.y + 2 * (p.centerY - p.y); })) + pad;
    return drawZone(left, top, right - left, bottom - top, label, color);
}

function drawArrow(x1, y1, x2, y2, color, width, layer) {
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var head = 14;
    return [
        drawLine(x1, y1, x2, y2, color, width, layer),
        drawLine(x2, y2, x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7), color, width, layer),
        drawLine(x2, y2, x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7), color, width, layer)
    ];
}

function removeItem(itemId) {
    if (Array.isArray(itemId)) {
        return itemId.map(removeItem).every(Boolean);
    }
    return logicalWorkspace().removeCanvasItem(itemId) === true;
}

function moveItem(itemId, dx, dy) {
    toList(itemId).forEach(function (id) {
        logicalWorkspace().moveCanvasItemBy(id, Math.round(dx), Math.round(dy));
    });
    return true;
}

function setItemPosition(itemId, x, y) {
    var workspace = logicalWorkspace();
    workspace.setCanvasItemX(itemId, Math.round(x));
    workspace.setCanvasItemY(itemId, Math.round(y));
    return true;
}

function getItemPosition(itemId) {
    var workspace = logicalWorkspace();
    return { x: workspace.getCanvasItemX(itemId), y: workspace.getCanvasItemY(itemId) };
}

function getCanvasItems() {
    var workspace = logicalWorkspace();
    return {
        notes: toArray(workspace.getCanvasNoteIds()),
        lines: toArray(workspace.getCanvasLineIds()),
        rects: toArray(workspace.getCanvasRectIds()),
        ellipses: toArray(workspace.getCanvasEllipseIds()),
        polygons: toArray(workspace.getCanvasPolygonIds())
    };
}

function getLineData(lineId) {
    var data = toArray(logicalWorkspace().getLineItemData(lineId));
    return { x1: +data[0], y1: +data[1], x2: +data[2], y2: +data[3], color: String(data[4] || "") };
}

function getRectData(rectId) {
    var data = toArray(logicalWorkspace().getRectItemData(rectId));
    return {
        x1: +data[0], y1: +data[1], x2: +data[2], y2: +data[3],
        fill: String(data[4] || ""), border: String(data[5] || ""), text: String(data[6] || "")
    };
}

function getEllipseData(ellipseId) {
    return toArray(logicalWorkspace().getEllipseItemData(ellipseId)).map(String);
}

function getPolygonData(polygonId) {
    return toArray(logicalWorkspace().getPolygonItemData(polygonId)).map(String);
}

function clearLayer(layer) {
    return logicalWorkspace().clearLayer(layerOrCurrent(layer)) === true;
}

function clearCanvas() {
    var items = getCanvasItems();
    var all = [].concat(items.notes, items.lines, items.rects, items.ellipses, items.polygons);
    all.forEach(function (id) {
        logicalWorkspace().removeCanvasItem(id);
    });
    return all.length;
}

function labelDevice(deviceName, text, offsetY) {
    var position = getDevicePosition(deviceName);
    var dy = isDefined(offsetY) ? offsetY : -30;
    return addNote(position.x, position.y + dy, isDefined(text) ? text : deviceName);
}

function labelDevices(map, offsetY) {
    var ids = {};
    Object.keys(map).forEach(function (name) {
        ids[name] = labelDevice(name, map[name], offsetY);
    });
    return ids;
}

function labelAllDevices(formatter, offsetY) {
    var ids = {};
    getDevices().forEach(function (name) {
        var text = typeof formatter === "function" ? formatter(name) : name;
        ids[name] = labelDevice(name, text, offsetY);
    });
    return ids;
}

function labelWithIp(deviceName, portName, offsetY) {
    var info = getPortInfo(deviceName, portName);
    var text = deviceName + (info.ip && info.ip !== "0.0.0.0" ? "\n" + info.ip + "/" + maskToCidr(info.mask) : "");
    return labelDevice(deviceName, text, offsetY);
}

function labelLink(device1Name, device2Name, text) {
    var a = getDevicePosition(device1Name);
    var b = getDevicePosition(device2Name);
    return addNote((a.centerX + b.centerX) / 2, (a.centerY + b.centerY) / 2, text);
}

function gridPositions(count, options) {
    var opts = options || {};
    var columns = opts.columns || Math.ceil(Math.sqrt(count));
    var startX = isDefined(opts.x) ? opts.x : 100;
    var startY = isDefined(opts.y) ? opts.y : 100;
    var gapX = opts.gapX || 120;
    var gapY = opts.gapY || 120;
    var positions = [];
    for (var i = 0; i < count; i++) {
        positions.push([startX + (i % columns) * gapX, startY + Math.floor(i / columns) * gapY]);
    }
    return positions;
}

function circlePositions(count, cx, cy, radius) {
    var positions = [];
    for (var i = 0; i < count; i++) {
        var angle = (2 * Math.PI * i) / count - Math.PI / 2;
        positions.push([Math.round(cx + radius * Math.cos(angle)), Math.round(cy + radius * Math.sin(angle))]);
    }
    return positions;
}

function rowPositions(count, y, startX, gap) {
    var positions = [];
    for (var i = 0; i < count; i++) {
        positions.push([(isDefined(startX) ? startX : 100) + i * (gap || 120), y]);
    }
    return positions;
}

function arrangeGrid(deviceNames, options) {
    var names = toList(deviceNames);
    gridPositions(names.length, options).forEach(function (position, index) {
        moveDevice(names[index], position[0], position[1]);
    });
    return names.length;
}

function arrangeCircle(deviceNames, cx, cy, radius) {
    var names = toList(deviceNames);
    circlePositions(names.length, cx, cy, radius).forEach(function (position, index) {
        moveDevice(names[index], position[0], position[1], true);
    });
    return names.length;
}

function numberedNames(prefix, count, start) {
    var names = [];
    for (var i = 0; i < count; i++) {
        names.push(prefix + ((start || 1) + i));
    }
    return names;
}

function buildStar(options) {
    var opts = options || {};
    var center = opts.center || "S1";
    var count = opts.count || 4;
    var cx = isDefined(opts.x) ? opts.x : 400;
    var cy = isDefined(opts.y) ? opts.y : 300;
    var leaves = numberedNames(opts.prefix || "PC", count, opts.start);
    var centerPort = opts.centerPort || function (i) { return "FastEthernet0/" + (i + 1); };
    var leafPort = opts.leafPort || function () { return "FastEthernet0"; };

    addDevice(center, opts.centerModel || "2960-24TT", cx, cy);
    circlePositions(count, cx, cy, opts.radius || 200).forEach(function (position, i) {
        addDevice(leaves[i], opts.leafModel || "PC-PT", position[0], position[1]);
        addLink(center, centerPort(i), leaves[i], leafPort(i), opts.linkType || "straight");
    });
    return { center: center, leaves: leaves };
}

function buildRing(options) {
    var opts = options || {};
    var count = opts.count || 4;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var portA = opts.portA || "GigabitEthernet0/0";
    var portB = opts.portB || "GigabitEthernet0/1";

    circlePositions(count, isDefined(opts.x) ? opts.x : 400, isDefined(opts.y) ? opts.y : 300, opts.radius || 200).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
    });
    for (var i = 0; i < count; i++) {
        addLink(names[i], portA, names[(i + 1) % count], portB, opts.linkType || "cross");
    }
    return names;
}

function buildLine(options) {
    var opts = options || {};
    var count = opts.count || 3;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var portA = opts.portA || "GigabitEthernet0/0";
    var portB = opts.portB || "GigabitEthernet0/1";

    rowPositions(count, isDefined(opts.y) ? opts.y : 200, opts.x, opts.gap || 160).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
    });
    for (var i = 0; i < count - 1; i++) {
        addLink(names[i], portA, names[i + 1], portB, opts.linkType || "cross");
    }
    return names;
}

function buildFullMesh(options) {
    var opts = options || {};
    var count = opts.count || 4;
    var names = numberedNames(opts.prefix || "R", count, opts.start);
    var ports = opts.ports || ["GigabitEthernet0/0", "GigabitEthernet0/1", "GigabitEthernet0/2"];
    var nextPort = {};

    if (count - 1 > ports.length) {
        throw new Error("Full mesh of " + count + " needs " + (count - 1) + " ports per device");
    }

    circlePositions(count, isDefined(opts.x) ? opts.x : 400, isDefined(opts.y) ? opts.y : 300, opts.radius || 200).forEach(function (position, i) {
        addDevice(names[i], opts.model || "2911", position[0], position[1]);
        nextPort[names[i]] = 0;
    });
    for (var i = 0; i < count; i++) {
        for (var j = i + 1; j < count; j++) {
            addLink(names[i], ports[nextPort[names[i]]++], names[j], ports[nextPort[names[j]]++], opts.linkType || "cross");
        }
    }
    return names;
}

function buildLan(options) {
    var opts = options || {};
    var switchName = opts.switchName || "S1";
    var hosts = opts.hosts || 3;
    var x = isDefined(opts.x) ? opts.x : 300;
    var y = isDefined(opts.y) ? opts.y : 250;
    var names = numberedNames(opts.hostPrefix || "PC", hosts, opts.start);

    addDevice(switchName, opts.switchModel || "2960-24TT", x, y);
    rowPositions(hosts, y + 150, x - ((hosts - 1) * 100) / 2, 100).forEach(function (position, i) {
        addDevice(names[i], opts.hostModel || "PC-PT", position[0], position[1]);
        addLink(switchName, "FastEthernet0/" + (i + 1), names[i], "FastEthernet0", "straight");
    });

    if (opts.network) {
        addressHosts(names, opts.network, { gateway: opts.gateway, dns: opts.dns, startAt: opts.startAt });
    }
    return { switchName: switchName, hosts: names };
}

function addressHosts(deviceNames, network, options) {
    var opts = options || {};
    var info = parseNetwork(network);
    var gateway = opts.gateway || nthHost(network, 1);
    var index = opts.startAt || 10;
    var assigned = {};

    toList(deviceNames).forEach(function (name) {
        var ip = nthHost(network, index++);
        if (ip === gateway) {
            ip = nthHost(network, index++);
        }
        configurePcIp(name, false, ip, info.mask, gateway, opts.dns, opts.port);
        assigned[name] = ip;
    });
    return assigned;
}

function planSubnets(baseNetwork, sizes) {
    var ordered = Object.keys(sizes).map(function (name) {
        return { name: name, hosts: sizes[name] };
    }).sort(function (a, b) {
        return b.hosts - a.hosts;
    });

    var base = parseNetwork(baseNetwork);
    var cursor = ipToInt(base.network);
    var end = ipToInt(base.broadcast);
    var plan = {};

    ordered.forEach(function (item) {
        var prefix = 32;
        while (prefix > 0 && Math.pow(2, 32 - prefix) - 2 < item.hosts) {
            prefix--;
        }
        var size = Math.pow(2, 32 - prefix);
        if (cursor % size !== 0) {
            cursor += size - (cursor % size);
        }
        if (cursor + size - 1 > end) {
            throw new Error("Not enough space in " + baseNetwork + " for " + item.name);
        }
        var network = intToIp(cursor) + "/" + prefix;
        plan[item.name] = {
            network: network,
            mask: cidrToMask(prefix),
            gateway: nthHost(network, 1),
            firstHost: hostRange(network).first,
            lastHost: hostRange(network).last,
            broadcast: broadcastAddress(network),
            usable: hostRange(network).count
        };
        cursor += size;
    });
    return plan;
}

function pointToPointLinks(baseNetwork, count) {
    return splitSubnet(baseNetwork, 30).slice(0, count).map(function (network) {
        return { network: network, a: nthHost(network, 1), b: nthHost(network, 2), mask: "255.255.255.252" };
    });
}

function zoomIn() {
    activeWorkspace().zoomIn();
    return true;
}

function zoomOut() {
    activeWorkspace().zoomOut();
    return true;
}

function zoomReset() {
    activeWorkspace().zoomReset();
    return true;
}

function getZoom() {
    return logicalWorkspace().getCurrentZoom();
}

function centerOn(target, y) {
    if (typeof target === "string") {
        findDevice(target);
        logicalWorkspace().centerOnComponentByName(target);
    } else {
        logicalWorkspace().centerOn(target, y);
    }
    return true;
}

function setBackground(imagePath, tiled) {
    activeWorkspace().setLogicalBackgroundPath(String(imagePath), tiled === true);
    return true;
}

function devicesInArea(x1, y1, x2, y2) {
    return toArray(activeWorkspace().devicesAt(x1, y1, x2, y2, false)).map(String);
}

function getPacketTracerVersion() {
    return String(appWindow().getVersion());
}

function clearTopology() {
    var names = getDevices();
    names.forEach(function (name) {
        logicalWorkspace().removeDevice(name);
    });
    clearCanvas();
    return names.length;
}

function addRemoteNetwork(x, y) {
    var name = String(logicalWorkspace().addRemoteNetwork());
    if (name && isDefined(x) && isDefined(y)) {
        logicalWorkspace().moveRemoteNetwork(name, x, y);
    }
    return name;
}

function removeRemoteNetwork(name) {
    return logicalWorkspace().removeRemoteNetwork(name) === true;
}

function moveRemoteNetwork(name, x, y) {
    return logicalWorkspace().moveRemoteNetwork(name, x, y) === true;
}

function newProject(confirm) {
    return appWindow().fileNew(confirm === true) === true;
}

function saveProject() {
    return appWindow().fileSave() === true;
}

function saveProjectAs(path) {
    appWindow().fileSaveAsNoPrompt(String(requireValue(path, "path")), false);
    return true;
}

function openProject(path) {
    return appWindow().fileOpen(String(requireValue(path, "path")));
}

function getDefaultSaveFolder() {
    return String(appWindow().getDefaultFileSaveLocation());
}

function switchPortOf(deviceName, portName) {
    var port = findPort(deviceName, portName);
    if (typeof port.getAccessVlan !== "function") {
        throw new Error("Not a switch port: " + deviceName + " " + portName);
    }
    return port;
}

function getSwitchportInfo(deviceName, portName) {
    var port = switchPortOf(deviceName, portName);
    return {
        port: portName,
        access: callIfExists(port, "isAccessPort", null),
        modeCode: callIfExists(port, "getAdminOpMode", null),
        accessVlan: callIfExists(port, "getAccessVlan", null),
        nativeVlan: callIfExists(port, "getNativeVlanId", null),
        voiceVlan: callIfExists(port, "getVoipVlanId", null),
        nonegotiate: callIfExists(port, "isNonegotiate", null),
        cdp: callIfExists(port, "isCdpEnable", null),
        channel: callIfExists(port, "getChannel", null),
        up: callIfExists(port, "isPortUp", false),
        protocolUp: callIfExists(port, "isProtocolUp", false)
    };
}

function getSwitchportTable(deviceName) {
    var device = findDevice(deviceName);
    var rows = [];
    for (var i = 0; i < device.getPortCount(); i++) {
        var port = device.getPortAt(i);
        if (typeof port.getAccessVlan === "function") {
            rows.push(getSwitchportInfo(deviceName, port.getName()));
        }
    }
    return rows;
}

function getPortSecurityStatus(deviceName, portName) {
    var security = switchPortOf(deviceName, portName).getPortSecurity();
    if (!security) {
        return null;
    }
    return {
        enabled: callIfExists(security, "isEnabled", false),
        maximum: callIfExists(security, "getMaxMacNumber", null),
        learned: callIfExists(security, "getTotalMac", null),
        secureMacs: callIfExists(security, "getSecureMacCount", null),
        violations: callIfExists(security, "getViolationCount", null),
        sticky: callIfExists(security, "isStickyOn", null)
    };
}

function findSecurityViolations(deviceName) {
    return getSwitchportTable(deviceName).map(function (row) {
        var status = getPortSecurityStatus(deviceName, row.port);
        return status && status.violations ? { port: row.port, violations: status.violations } : null;
    }).filter(function (row) {
        return row !== null;
    });
}

function setPortCdp(deviceName, portName, enabled) {
    switchPortOf(deviceName, portName).setCdpEnable(enabled !== false);
    return true;
}

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

function fileManager() {
    var manager = ipc.systemFileManager();
    if (!manager) {
        throw new Error("File access is not available in this Packet Tracer version");
    }
    return manager;
}

function readTextFile(path) {
    if (!fileManager().fileExists(String(path))) {
        throw new Error("File not found: " + path);
    }
    return String(fileManager().getFileContents(String(path)));
}

function writeTextFile(path, text) {
    return fileManager().writePlainTextToFile(String(path), String(text)) !== false;
}

function fileExists(path) {
    return !!fileManager().fileExists(String(path));
}

function folderExists(path) {
    return !!fileManager().directoryExists(String(path));
}

function makeFolder(path) {
    return fileManager().makeDirectory(String(path)) !== false;
}

function deleteFile(path) {
    return fileManager().removeFile(String(path)) !== false;
}

function runScriptFile(path) {
    var code = readTextFile(path);
    return new Function(code)();
}

function exportTopology(path) {
    var data = {
        devices: getDevices().map(function (name) {
            var p = getDevicePosition(name);
            return { name: name, model: getDeviceModel(name), x: p.x, y: p.y };
        }),
        links: getLinks()
    };
    writeTextFile(path, JSON.stringify(data, null, 2));
    return data;
}

function exportConfigs(folder, deviceNames) {
    var names = deviceNames ? toList(deviceNames) : getDevices(["router", "switch", "multilayerswitch", "switch3650"]);
    if (!folderExists(folder)) {
        makeFolder(folder);
    }
    return names.map(function (name) {
        var path = folder + "/" + name + ".txt";
        writeTextFile(path, getRunningConfig(name));
        return path;
    });
}

function commandLog() {
    return ipc.commandLog();
}

function setCommandLogging(enabled) {
    commandLog().setEnabled(enabled !== false);
    return true;
}

function isCommandLogging() {
    return !!commandLog().isEnabled();
}

function getCommandLog(deviceName) {
    var log = commandLog();
    var entries = [];
    for (var i = 0; i < log.getEntryCount(); i++) {
        var entry = log.getEntryAt(i);
        var device = String(entry.getDeviceName());
        if (!deviceName || device === deviceName) {
            entries.push({
                time: String(entry.getTimeToString()),
                device: device,
                prompt: String(entry.getPrompt()),
                command: String(entry.getCommand()),
                resolved: String(callIfExists(entry, "getResolvedCommand", entry.getCommand()))
            });
        }
    }
    return entries;
}

function clearCommandLog() {
    commandLog().clear();
    return true;
}

function setSimulationMode(on) {
    ipc.simulation().setSimulationMode(on !== false);
    return true;
}

function isSimulationMode() {
    return ipc.simulation().isSimulationMode() === true;
}

function resetSimulation() {
    ipc.simulation().resetSimulation();
    return true;
}

function stepForward(steps) {
    for (var i = 0; i < (steps || 1); i++) {
        ipc.simulation().forward();
    }
    return true;
}

function stepBack(steps) {
    for (var i = 0; i < (steps || 1); i++) {
        ipc.simulation().backward();
    }
    return true;
}

function playSimulation() {
    appWindow().getSimulationPanel().play();
    return true;
}

function setSimulationFilter(protocol, visible) {
    appWindow().getSimulationPanel().setFilter(String(protocol).toUpperCase(), visible !== false);
    return true;
}

function showAllSimulationFilters() {
    appWindow().getSimulationPanel().setAllFilters();
    return true;
}

function getSimulationTime() {
    return ipc.simulation().getCurrentSimTime();
}

function getSimulationEventCount() {
    return ipc.simulation().getFrameInstanceCount();
}

function addSimplePdu(sourceDevice, destinationDevice) {
    findDevice(sourceDevice);
    findDevice(destinationDevice);
    return appWindow().getUserCreatedPDU().addSimplePdu(sourceDevice, destinationDevice);
}

function firePdu(index) {
    appWindow().getUserCreatedPDU().firePDU(index || 0);
    return true;
}

function deletePdu(index) {
    appWindow().getUserCreatedPDU().deletePDU(index || 0);
    return true;
}

function ping(deviceName, target, count) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand === "function") {
        var command = "ping " + target + (count ? " repeat " + count : "");
        return runCommand(deviceName, command, "enable");
    }
    runHostCommand(deviceName, "ping " + (count ? "-n " + count + " " : "") + target);
    return { status: "sent", output: "" };
}

function traceroute(deviceName, target) {
    var device = findDevice(deviceName);
    if (typeof device.enterCommand === "function") {
        return runCommand(deviceName, "traceroute " + target, "enable");
    }
    runHostCommand(deviceName, "tracert " + target);
    return { status: "sent", output: "" };
}

function pingAll(sourceDevice, targets) {
    var report = {};
    toList(targets).forEach(function (target) {
        report[target] = ping(sourceDevice, target);
    });
    return report;
}

var eventHandlers = [];

var workspaceEvents = [
    "deviceAdded", "deviceRemoved", "linkCreated", "linkDeleted",
    "canvasNoteAdded", "canvasNoteRemoved", "canvasNoteTextChanged"
];

function onWorkspaceEvent(eventName, handler) {
    if (workspaceEvents.indexOf(eventName) === -1) {
        throw new Error("Unsupported event: " + eventName + ". Use one of " + workspaceEvents.join(", "));
    }
    var entry = {
        target: logicalWorkspace(),
        name: eventName,
        context: {},
        callback: function (source, args) {
            try {
                handler(args);
            } catch (error) {
                console.log(error);
            }
        }
    };
    entry.target.registerEvent(eventName, entry.context, entry.callback);
    eventHandlers.push(entry);
    return eventHandlers.length - 1;
}

function offWorkspaceEvent(id) {
    var entry = eventHandlers[id];
    if (!entry) {
        return false;
    }
    entry.target.unregisterEvent(entry.name, entry.context, entry.callback);
    eventHandlers[id] = null;
    return true;
}

function offAllEvents() {
    var count = 0;
    eventHandlers.forEach(function (entry, id) {
        if (entry && offWorkspaceEvent(id)) {
            count++;
        }
    });
    eventHandlers = [];
    return count;
}

var appName = "PTForge";

function editorView() {
    if (typeof extension === "undefined" || !extension || !extension.editor) {
        return null;
    }
    var editor = extension.editor;
    if (!editor.webview || editor.webviewId === "") {
        return null;
    }
    return editor.webview;
}

function notifyEditor(kind, text) {
    var view = editorView();
    if (!view || typeof view.evaluateJavaScriptAsync !== "function") {
        return false;
    }
    try {
        var payload = JSON.stringify({ kind: kind, text: String(text) }).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        view.evaluateJavaScriptAsync("window.receiveOutput && window.receiveOutput(" + payload + ");");
        return true;
    } catch (error) {
        return false;
    }
}

function messageBox(title, text) {
    ipc.appWindow().showMessageBox(appName + " ".repeat(100), title, String(text), 3, 0x00000400, 0x00000400, 0x00000400);
}

function runCode(encodedScript) {
    var scriptText;
    var compiled;
    var started = new Date().getTime();

    try {
        scriptText = decodeURIComponent(encodedScript);
    } catch (error) {
        scriptText = String(encodedScript);
    }

    try {
        compiled = new Function(scriptText);
    } catch (error) {
        showError("Syntax error", error);
        return false;
    }

    try {
        compiled();
        notifyEditor("done", "Finished in " + (new Date().getTime() - started) + " ms");
        return true;
    } catch (error) {
        var line = error && error.lineNumber ? " on line " + error.lineNumber : "";
        showError("Runtime error" + line, error);
        return false;
    }
}

function showError(title, error) {
    var message = error && error.message ? error.message : String(error);
    console.log(title + ": " + message);
    if (!notifyEditor("error", title + ": " + message)) {
        messageBox(title + ":", message);
    }
}

function formatValue(value) {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function showMessage(text) {
    messageBox("Message:", text);
}

function showResult(value) {
    var text = formatValue(value);
    console.log(text);
    if (!notifyEditor("result", text)) {
        showMessage(text);
    }
    return value;
}

function log(value) {
    var text = formatValue(value);
    console.log(text);
    notifyEditor("log", text);
    return value;
}

function EditorWindow() {
    this.webview = null;
    this.webviewId = "";
}

EditorWindow.prototype.show = function () {
    if (webViewManager.getWebView(this.webviewId) == null) {
        this.webview = webViewManager.createWebView("PTForge", "this-sm:index.html", 1100, 720);
        this.webviewId = this.webview.getWebViewId();
        this.webview.registerEvent("closed", this, this.onClosed);
        this.webview.setMinimumWidth(760);
        this.webview.setMinimumHeight(460);
    }
    this.webview.hide();
    this.webview.show();
};

EditorWindow.prototype.onClosed = function () {
    this.webview.unregisterEvent("closed", this, this.onClosed);
    this.webviewId = "";
};

function Extension() {
    this.menuUuid = "";
    this.editor = new EditorWindow();
}

Extension.prototype.init = function () {
    var menu = ipc.appWindow().getMenuBar().getExtensionsPopupMenu();
    this.menuUuid = menu.insertItem("", "PTForge Editor");
    menu.getMenuItemByUuid(this.menuUuid).registerEvent("onClicked", this, this.onMenuClicked);
};

Extension.prototype.cleanUp = function () {
    if (this.menuUuid === "") {
        return;
    }
    var menu = ipc.appWindow().getMenuBar().getExtensionsPopupMenu();
    _ScriptModule.unregisterIpcEventByID("MenuItem", this.menuUuid, "onClicked", this, this.onMenuClicked);
    menu.removeItemUuid(this.menuUuid);
    this.menuUuid = "";
};

Extension.prototype.onMenuClicked = function () {
    this.editor.show();
};

var extension = null;

function main() {
    extension = new Extension();
    extension.init();
}

function cleanUp() {
    if (extension) {
        extension.cleanUp();
    }
}
