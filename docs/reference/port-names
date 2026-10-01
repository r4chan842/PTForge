Port names
==========

Port names must be written in full, exactly as Packet Tracer shows them. Gi0/0 does not work in API calls, but it does inside IOS command strings.


* 1941, 2901, 2911: GigabitEthernet0/0 to 0/2, serial after HWIC-2T: Serial0/0/0, Serial0/1/0
* ISR4321, ISR4331: GigabitEthernet0/0/0, GigabitEthernet0/0/1
* 1841, 2811: FastEthernet0/0, FastEthernet0/1
* 2960-24TT: FastEthernet0/1 to 0/24, GigabitEthernet0/1, GigabitEthernet0/2
* 3560-24PS: FastEthernet0/1 to 0/24, GigabitEthernet0/1, GigabitEthernet0/2
* 3650-24PS: GigabitEthernet1/0/1 to 1/0/24, uplinks need a module
* PC-PT, Server-PT, Laptop-PT: FastEthernet0, console RS 232
* Laptop-PT with wireless module: Wireless0
* AccessPoint-PT: Port 0, Port 1 for the radio
* Linksys-WRT300N: Internet, Ethernet 1 to Ethernet 4
* Cloud-PT: Serial0 to Serial3, Ethernet6

Do not guess. Ask the device:

    showResult(getPorts("R1"));
    showResult(getFreePorts("S1", "FastEthernet"));
