addDevice("SRV", "Server-PT", 300, 150);

addFtpUser("SRV", "student", "cisco", "RWL");
addEmailUsers("SRV", { alice: "pass1", bob: "pass2" });
setTftpService("SRV", true);
setSyslogService("SRV", true);

labelDevice("SRV", "FTP / Email / TFTP / Syslog");
