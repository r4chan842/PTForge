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
    laptop: 17,
    tabletpc: 18,
    pda: 19,
    wirelessenddevice: 20,
    wiredenddevice: 21,
    tv: 22,
    homevoip: 23,
    analogphone: 24,
    multiuser: 25,
    asa: 26,
    ioe: 27,
    homegateway: 28,
    celltower: 29,
    centralofficeserver: 30,
    ciscoaccesspoint: 31,
    embeddedciscoaccesspoint: 32,
    sniffer: 33,
    mcu: 34,
    sbc: 35,
    thing: 36,
    mcucomponent: 37,
    embeddedserver: 38,
    wirelesslancontroller: 39,
    cluster: 40,
    switch3650: 16,
    wirelessrouternewgeneration: 11,
    wlc: 39
};

var iosDeviceTypes = [0, 1, 16];

var deviceTypeNames = {};
Object.keys(deviceTypes).forEach(function (name) {
    if (deviceTypeNames[deviceTypes[name]] === undefined) {
        deviceTypeNames[deviceTypes[name]] = name;
    }
});
