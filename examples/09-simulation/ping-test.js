buildLan({ switchName: "S1", hosts: 2, network: "192.168.1.0/24" });

setSimulationMode(true);
setSimulationFilter("ICMP");
addSimplePdu("PC1", "PC2");
stepForward(3);
