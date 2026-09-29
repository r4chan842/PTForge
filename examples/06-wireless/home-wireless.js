addDevice("WR1", "Linksys-WRT300N", 300, 100);
addDevice("AP1", "AccessPoint-PT", 300, 250);
addDevice("L1", "Laptop-PT", 150, 400);

configureWireless("WR1", { ssid: "HOME", security: "wpa2-psk", key: "Cisco12345" });
configureWireless("AP1", { ssid: "GUEST", security: "open", hideSsid: false });

labelDevice("AP1", "SSID GUEST");
