Servers
=======

    addDevice("SRV", "Server-PT", 500, 300);
    setPcStatic("SRV", "192.168.50.10/24", "192.168.50.1", "192.168.50.10");

    addDhcpPool("SRV", { name: "USERS", start: "192.168.10.100", mask: 24, gateway: "192.168.10.1", dns: "192.168.50.10" });

    addDnsRecords("SRV", {
        "www.corp.local": "192.168.50.10",
        "mail.corp.local": "192.168.50.10",
        "ftp.corp.local": "192.168.50.10"
    });
    addDnsCname("SRV", "intranet.corp.local", "www.corp.local");

    setHttpService("SRV", true);
    setHttpsService("SRV", true);
    setWebPage("SRV", "index.html", "<h1>Corp intranet</h1><p>Built with PTForge</p>");

    addFtpUser("SRV", "student", "Stud3nt", "RL");
    addEmailUsers("SRV", { alice: "Al1ce", bob: "B0bPass" });

    setSyslogService("SRV", true);
    setTftpService("SRV", true);
