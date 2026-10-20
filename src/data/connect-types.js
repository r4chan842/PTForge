var allLinkTypes = {
    straight: 8100,
    "ethernet-straight": 8100,
    cross: 8101,
    crossover: 8101,
    "ethernet-cross": 8101,
    "ethernet-crossover": 8101,
    roll: 8102,
    "ethernet-roll": 8102,
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
    "custom-io": 8114
};

var connectTypeNames = {
    8100: "ETHERNET_STRAIGHT",
    8101: "ETHERNET_CROSS",
    8102: "ETHERNET_ROLL",
    8103: "FIBER",
    8104: "PHONE",
    8105: "CABLE",
    8106: "SERIAL",
    8107: "AUTO",
    8108: "CONSOLE",
    8109: "WIRELESS",
    8110: "COAXIAL",
    8111: "OCTAL",
    8112: "CELLULAR",
    8113: "USB",
    8114: "CUSTOM_IO"
};

var linkTypeAliases = ["straight", "cross", "crossover", "roll", "fiber", "phone", "cable", "serial", "auto", "console", "wireless", "coaxial", "octal", "cellular", "usb", "custom_io"];
