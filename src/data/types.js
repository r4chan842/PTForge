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
