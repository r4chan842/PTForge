addDevice("R1", "2911", 150, 150);
addDevice("R2", "2911", 450, 150);

addModule("R1", "0/1", "HWIC-2T");
addModule("R2", "0/1", "HWIC-2T");

addLink("R1", "Serial0/1/0", "R2", "Serial0/1/0", "serial");

setInterfaceIp("R1", "Serial0/1/0", "10.0.0.1/30");
setClockRate("R1", "Serial0/1/0", 64000);
setInterfaceIp("R2", "Serial0/1/0", "10.0.0.2/30");

labelLink("R1", "R2", "10.0.0.0/30");
