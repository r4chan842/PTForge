<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../assets/brand/logo-dark.svg">
  <img src="../assets/brand/logo.svg" alt="PTForge" width="300">
</picture>

<br><br>

**Komplette Cisco Packet Tracer Netzwerke mit JavaScript aufbauen, konfigurieren, debuggen und prüfen.**

[![Release](https://img.shields.io/github/v/release/r4chan842/PTForge?color=1A5DB7)](https://github.com/r4chan842/PTForge/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
![Functions](https://img.shields.io/badge/functions-388-1A5DB7)
![Packet Tracer](https://img.shields.io/badge/Packet%20Tracer-8.x%2B-1ba0d7)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

[Schnellstart](#schnellstart) ·
[Installation](../docs/guides/installation.md) ·
[Dokumentation](../docs/README.md) ·
[API](../docs/api/README.md) ·
[Beispiele](../examples/README.md) ·
[CCNA-Übersicht](../docs/ccna/README.md)

[English](../README.md) ·
[فارسی](README.fa.md) ·
**Deutsch** ·
[Español](README.es.md) ·
[Français](README.fr.md) ·
[Português](README.pt-BR.md) ·
[Русский](README.ru.md) ·
[Türkçe](README.tr.md) ·
[العربية](README.ar.md) ·
[中文](README.zh-CN.md) ·
[日本語](README.ja.md)

</div>

---

> Dies ist eine Übersetzung. Maßgeblich ist die [englische README](../README.md).

## Warum PTForge

Ein Lab in Packet Tracer aufzubauen heißt: Geräte ziehen, Kabel wählen, jede CLI öffnen und immer wieder dieselben Befehle tippen. Ein Tippfehler in einer VLAN-Liste oder einer Wildcard-Maske kann eine Stunde kosten.

PTForge ersetzt das Klicken durch ein Skript. Sie beschreiben das Netzwerk einmal, drücken **Run**, und Packet Tracer baut es auf: Geräte, Module, Kabel, IOS-Konfiguration, Serverdienste, WLAN, Beschriftungen und Zonen. Danach liest PTForge den Live-Zustand zurück, damit dasselbe Skript seine Arbeit selbst prüfen kann.

- **Wiederholbar**: ein Lab in Sekunden von Grund auf neu bauen, so oft Sie wollen
- **Teilbar**: ein Lab ist eine Textdatei, die man verschicken, prüfen und in Git ablegen kann
- **Korrekt**: Adressen, Masken und Wildcards werden berechnet, Tippfehler erzeugen klare Fehlermeldungen
- **Prüfbar**: Inspektionsfunktionen lesen VLANs, Trunks, STP, Port Security und Routing-Prozesse direkt aus Packet Tracer
- **Debugbar**: Breakpoints setzen, ein Skript schrittweise ausführen und jede Variable lesen, wie in VS Code
- **Interaktiv**: ein JavaScript-Terminal ändert die offene Topologie Zeile für Zeile

<div align="center">
<img src="../assets/screenshots/editor.png" alt="PTForge" width="95%">
<br><sub>Die PTForge-Workbench in Packet Tracer: Explorer, Tabs, IntelliSense, Dark-Modern-Hervorhebung und Ausgabe</sub>
</div>

## Neu in 1.2

|  |  |
|---|---|
| **JavaScript-Terminal** | `` Ctrl+` `` öffnet ein Terminal wie *New Terminal* in VS Code. Jede Zeile läuft direkt gegen die offene Topologie, mit Verlauf, Tab-Vervollständigung und Punktbefehlen wie `.calc`, `.ping` und `.cli R1` |
| **Debugger** | `F5` führt das Skript aus und zeichnet jeden Schritt auf. Anhalten an Breakpoints, bedingten Breakpoints und Ausnahmen, Schritt über, hinein, heraus und **zurück**, Variablen, Watch und Call Stack lesen und Ausdrücke in der Debug Console auswerten |
| **Netzwerkrechner** | IPv4-Subnetz, Subnetz-Aufteilung, VLSM-Planer, Routen-Zusammenfassung, Bereich zu CIDR, Wildcard-Masken, IPv6, EUI-64 und Zahlenumrechnung in einem Editor-Tab |
| **Erreichbarkeitsmatrix** | `pingAll()` pingt jede Adresse von jedem Router und Switch und zeigt eine farbige Matrix mit Verlust und Umlaufzeiten |
| **Snapshots und Diff** | `takeSnapshot()` speichert Geräte, Links, Adressen, Ports, Stromzustand und Running-Configs. Zwei Snapshots vergleichen und die Konfiguration zeilenweise gegenüberstellen |
| **Dark Modern** | Farben, Abstände, Tabs, Panels und Statusleiste folgen exakt dem VS Code Theme Dark Modern, beim Debuggen wird die Statusleiste blau |

## Schnellstart

1. Laden Sie das [neueste Release](https://github.com/r4chan842/PTForge/releases/latest) herunter und folgen Sie der [Installationsanleitung](../docs/guides/installation.md)
2. Öffnen Sie `Extensions` → `PTForge Editor`
3. Öffnen Sie ein Skript aus [`examples/`](../examples/README.md) mit `Ctrl+O` und drücken Sie `Ctrl+F5` zum Ausführen oder `F5` zum Debuggen
4. Drücken Sie `` Ctrl+` `` und probieren Sie `getDevices()` im Terminal
5. Prüfen Sie das Ergebnis mit `auditNetwork()`, `pingAll()` oder einem [Lab Check](../docs/api/checks.md)

## Ein kurzes Beispiel

```js
buildLan({ switchName: "S1", hosts: 4, network: "192.168.10.0/24", x: 300, y: 250 });
addDevice("R1", "2911", 300, 80);
addLink("R1", "GigabitEthernet0/0", "S1", "GigabitEthernet0/1", "straight");

basicSetup("R1", { secret: "class", consolePassword: "cisco", banner: "Authorized access only" });
setInterfaceIp("R1", "GigabitEthernet0/0", "192.168.10.1/24");
configureSsh("R1", { domain: "lab.local", username: "admin", password: "Adm1n!Pass" });

createVlans("S1", { 10: "USERS", 99: "MGMT" });
setAccessPort("S1", ["FastEthernet0/1", "FastEthernet0/2"], 10, { portfast: true, bpduguard: true });
configurePortSecurity("S1", ["FastEthernet0/1", "FastEthernet0/2"], { maximum: 2 });

drawZoneAround(["S1", "PC1", "PC2", "PC3", "PC4"], "VLAN 10 - Users", "green");
labelAllDevices();

takeSnapshot("baseline");
pingAll();
```

Zwanzig Zeilen ergeben einen Router, einen Switch, vier adressierte PCs, einen gehärteten Router mit SSH, VLANs, gesicherte Access-Ports, ein beschriftetes Diagramm, eine gespeicherte Ausgangslage und einen vollständigen Erreichbarkeitstest.

## Funktionen

| Bereich | Was Sie tun können |
|---|---|
| **Geräte** | Hinzufügen, entfernen, umbenennen, verschieben, neu starten, Module einbauen, Ports lesen, eigene Daten speichern, Geräte im physischen Arbeitsbereich platzieren |
| **Links** | Jeder Kabeltyp, Links löschen, automatisch verbinden, Nachbarn auflisten, Link-Status prüfen |
| **Hosts** | Statisches oder DHCP-IPv4, IPv6 mit SLAAC, Gateway, DNS, Firewall, Eingabeaufforderung |
| **Cisco IOS** | Grundeinrichtung, Passwörter, Banner, Benutzer, Interfaces, Subinterfaces, Loopbacks, Router on a Stick, DHCP-Pools und Relay, NTP, Syslog, SNMP, CDP, LLDP, Show-Befehle |
| **Switching** | VLANs, Access- und Voice-Ports, Trunks, DTP, EtherChannel (LACP, PAgP, statisch, Layer 3), Rapid PVST+, PortFast, BPDU Guard, VTP, Port Security, DHCP Snooping, DAI |
| **Routing** | Statische und Floating-Routen, OSPF, OSPFv3, EIGRP, EIGRP für IPv6, RIP, RIPng, BGP, Redistribution |
| **Sicherheit** | Standard-, erweiterte, benannte und IPv6-ACLs, NAT, PAT, NAT-Pools, Portweiterleitung, SSH, Login-Sperre, AAA mit RADIUS und TACACS+ |
| **Redundanz** | HSRP auf einem Router oder als Active- und Standby-Paar |
| **Server** | DHCP, DNS (A, CNAME, NS), HTTP, HTTPS, Webseiten, FTP-Benutzer, E-Mail-Konten, TFTP, Syslog, RADIUS |
| **WLAN** | SSID, WPA2, WPA, WEP, Funkmodus, versteckte SSID, MAC-Filter |
| **Inspektion** | Switch-Port-Status, Port-Security-Zähler, VLAN-Datenbank, STP-Root und Root-Ports, VTP, statische MACs, OSPF- und EIGRP-Prozesse |
| **Erreichbarkeit** | `pingAll`, `pingMatrix` und `reachability` mit Verlust, Umlaufzeiten und Matrixansicht |
| **Snapshots** | `takeSnapshot`, `getSnapshots`, `compareSnapshots`, `showSnapshotDiff`, Snapshot-Dateien speichern und laden sowie eine Konfigurations-Diff-Ansicht |
| **Dateien** | Textdateien lesen und schreiben, Skripte von der Festplatte ausführen, Konfigurationen und Topologie exportieren, Befehlsprotokoll |
| **Zeichenfläche** | Notizen, Linien, Kreise, Rechtecke, Pfeile, gestrichelte Linien, Zonen, Geräte- und Link-Beschriftungen, Ebenen |
| **Topologie** | Generatoren für Stern, Ring, Linie, Vermaschung und LAN, Raster- und Kreisanordnung, VLSM- und /30-Planer |
| **Simulation** | Simulationsmodus, PDUs, Protokollfilter, schrittweise Ausführung, Ping, Traceroute |
| **Lab Check** | Bewertete Prüfungen mit Punkten, Hinweisen und Bericht: Geräte, Kabel, Adressen, Ports, Hostnamen, VLANs, Konfigurationszeilen, eigene Tests |
| **Audit** | Doppelte IPs, Subnetz-Konflikte über Kabel, ausgefallene Links, Hosts ohne Adresse, Access-Ports in VLAN 1, fehlende Port Security, ungenutzte aktive Ports |
| **Stapel** | `runOnAll("show ip int brief")`, `runOnDevices` und `commandsToScript()`, das in der CLI getippte Befehle in ein wiederverwendbares Skript umwandelt |
| **Arbeitsbereich** | Zoom, Hintergrund, Remote-Netzwerke, Projekte öffnen und speichern, Arbeitsbereich-Ereignisse |

Jede IOS-Hilfsfunktion hat einen `build...`-Zwilling, der die Befehle zurückgibt statt sie zu senden, sodass Sie Konfiguration ansehen, kombinieren und wiederverwenden können.

## Der Editor

<div align="center"><img src="../assets/banners/editor.svg" alt="Editor" width="100%"></div>

Die Workbench sieht aus und verhält sich wie VS Code. Sie ist von Grund auf in reinem ES5 geschrieben und läuft deshalb in der Packet Tracer Web-View ohne Framework und ohne Netzwerkzugriff.

| Teil | Beschreibung |
|---|---|
| **Menüleiste und Befehlspalette** | Menüs File, Edit, Selection, View, Go, Run, Network, Terminal und Help. `Ctrl+Shift+P` listet alle Befehle, `Ctrl+P` springt zu einer Datei, `Ctrl+G` zu einer Zeile |
| **Explorer** | Offene Editoren, ein Arbeitsbereich mit in Packet Tracer gespeicherten Skripten und ein echter Ordner von der Festplatte. Neu, umbenennen, löschen |
| **Dateien** | Open, Save und Save As nutzen die Dateidialoge von Packet Tracer. Import aus der Zwischenablage, Export als Download |
| **Tabs** | Ein Tab pro Datei mit Änderungspunkt, Schließen per Mittelklick, Speichern-Abfrage für Dateien auf der Festplatte, eigener Undo-Verlauf je Tab |
| **Hervorhebung** | Dark-Modern-Farben: Kommentare `#6A9955`, Strings `#CE9178`, Zahlen `#B5CEA8`, Schlüsselwörter `#569CD6` und `#C586C0`, Funktionen `#DCDCAA`, Variablen `#9CDCFE`, PTForge-Funktionen fett `#4FC1FF`, farbige Klammerpaare |
| **IntelliSense** | Vorschläge aus allen 388 Funktionen mit Signatur und Beschreibung, Wörter aus der Datei, Schlüsselwörter. Parameterhinweise beim Tippen |
| **Problems** | Live-Syntaxprüfung mit genauer Zeile, unbekannte Funktionsnamen mit Schnellkorrektur *Did you mean*. Wellenlinien, Randmarkierungen und Problems-Panel |
| **Bearbeiten** | Automatisch schließende Paare, intelligentes Enter, `Ctrl+/` Kommentar, `Alt+Up/Down` Zeile verschieben, `Shift+Alt+Down` Zeile kopieren, `Ctrl+Shift+K` Zeile löschen, Klammerabgleich |
| **Suchen und Ersetzen** | `Ctrl+F` und `Ctrl+H` mit Groß-/Kleinschreibung, ganzem Wort und regulären Ausdrücken, Alles ersetzen in einem Undo-Schritt |
| **Panel** | Problems, Output, Debug Console, Terminal und Lab Check. Größe änderbar, `Ctrl+J` blendet es aus |
| **Devices-Ansicht** | Live-Geräte und Ports mit Link-LEDs und Adressen, Snapshots und Netzwerk-Werkzeuge mit einem Klick |
| **Statusleiste** | Anzahl Probleme, Ausführungs- und Debug-Status, Cursorposition, Zoom, Verbindung zu Packet Tracer |

<table>
<tr>
<td><img src="../assets/screenshots/lab-check.png" alt="Lab-Check-Bericht und Live-Ansicht Devices" width="100%"><br><sub>Lab-Check-Bericht und Live-Ansicht Devices</sub></td>
<td><img src="../assets/screenshots/command-palette.png" alt="Befehlspalette und Funktionsreferenz" width="100%"><br><sub>Befehlspalette und Funktionsreferenz</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/problems.png" alt="Problems mit Schnellkorrektur" width="100%"><br><sub>Problems mit Schnellkorrektur</sub></td>
<td><img src="../assets/screenshots/find-replace.png" alt="Suchen und Ersetzen" width="100%"><br><sub>Suchen und Ersetzen</sub></td>
</tr>
</table>

## Terminal

<div align="center"><img src="../assets/banners/terminal.svg" alt="Terminal" width="100%"></div>

`` Ctrl+` `` öffnet ein JavaScript-Terminal. Jede Zeile läuft sofort in Packet Tracer und behält ihre Variablen, so können Sie eine Topologie Schritt für Schritt erkunden und ändern, ohne zuerst ein Skript zu schreiben.

| Funktion | Beschreibung |
|---|---|
| **Direkte Auswertung** | Beliebige Ausdrücke und Anweisungen, Ergebnisse als lesbare Bäume, Fehler in Rot |
| **Vervollständigung** | `Tab` ergänzt PTForge-Funktionen, eigene Variablen, Schlüsselwörter und Punktbefehle |
| **Verlauf** | `Up` und `Down` blättern durch frühere Befehle, die zwischen Sitzungen gespeichert werden |
| **Mehrere Terminals** | `+` öffnet ein weiteres Terminal, die Liste wechselt zwischen ihnen, der Papierkorb schließt eines |
| **Punktbefehle** | `.help`, `.clear`, `.devices`, `.ping`, `.trace`, `.show R1 show ip route`, `.cli R1` für IOS-Befehle auf einem Gerät, `.exit` zum Verlassen, `.audit`, `.snap`, `.diff`, `.calc 10.1.2.3/20`, `.run file.js`, `.history` |

<div align="center"><img src="../assets/screenshots/terminal.png" alt="Terminal" width="95%"></div>

Lesen Sie die [Terminal-Anleitung](../docs/guides/terminal.md).

## Debugger

<div align="center"><img src="../assets/banners/debugger.svg" alt="Debugger" width="100%"></div>

`F5` startet eine Debug-Sitzung. PTForge instrumentiert das Skript, führt es einmal in Packet Tracer aus, zeichnet jeden Schritt auf und hält dann am ersten Breakpoint an. Da der gesamte Lauf aufgezeichnet ist, können Sie auch **rückwärts** gehen.

| Funktion | Beschreibung |
|---|---|
| **Breakpoints** | Klick auf den Rand oder `F9`. Bedingte Breakpoints, Trefferzahlen, Logpoints, alle deaktivieren oder entfernen |
| **Ausnahmen** | Anhalten bei nicht abgefangenen Ausnahmen mit hervorgehobener Zeile |
| **Schritte** | Fortsetzen `F5`, Schritt über `F10`, hinein `F11`, heraus `Shift+F11`, zurück, Neustart `Ctrl+Shift+F5`, Stopp `Shift+F5` |
| **Variablen** | Local-, Closure- und Script-Bereiche als aufklappbare Bäume |
| **Watch** | Beliebige Ausdrücke, ausgewertet bei jedem aufgezeichneten Schritt |
| **Call Stack** | Jeder Frame mit Datei und Zeile. Klick auf einen Frame zeigt seine Variablen |
| **Debug Console** | Ausdrücke im angehaltenen Frame auswerten |
| **Hover** | Mauszeiger auf eine Variable im Editor zeigt ihren Wert |

<div align="center"><img src="../assets/screenshots/debugger.png" alt="Debugger" width="95%"></div>

Lesen Sie die [Debugger-Anleitung](../docs/guides/debugger.md).

## Netzwerk-Werkzeuge

<div align="center"><img src="../assets/banners/network-tools.svg" alt="Network tools" width="100%"></div>

```js
pingAll();
takeSnapshot("before");
configureOspf("R1", { routerId: "1.1.1.1", networks: ["10.0.0.0/30"] });
compareSnapshots("before");
```

<table>
<tr>
<td><img src="../assets/screenshots/reachability.png" alt="Erreichbarkeitsmatrix aus pingAll()" width="100%"><br><sub>Erreichbarkeitsmatrix aus <code>pingAll()</code></sub></td>
<td><img src="../assets/screenshots/snapshot-diff.png" alt="Snapshot-Vergleich mit Konfigurations-Diff" width="100%"><br><sub>Snapshot-Vergleich mit Konfigurations-Diff</sub></td>
</tr>
<tr>
<td><img src="../assets/screenshots/calculator.png" alt="IPv4-Subnetzrechner" width="100%"><br><sub>IPv4-Subnetzrechner</sub></td>
<td><img src="../assets/screenshots/vlsm.png" alt="VLSM-Planer" width="100%"><br><sub>VLSM-Planer</sub></td>
</tr>
</table>

Lesen Sie [Netzwerk-Werkzeuge](../docs/guides/network-tools.md), [Erreichbarkeit](../docs/api/simulation.md#reachability) und [Snapshots](../docs/api/snapshots.md).

## Prüfen und auditieren

<div align="center"><img src="../assets/banners/lab-check.svg" alt="Lab Check" width="100%"></div>

```js
beginChecks("VLAN lab");
checkVlan("S1", 10, 2);
checkLinked("R1", "S1");
checkIpAddress("PC1", "FastEthernet0", "192.168.10.11", 24);
checkConfigContains("S1", "switchport mode trunk");
endChecks();

auditNetwork();
runOnAll("show ip interface brief");
```

Lesen Sie [Lab Check](../docs/api/checks.md), [Audit](../docs/api/audit.md) und [Stapelbefehle](../docs/api/ios.md#batch-commands).

## Installation

PTForge ist ein Script Module für Packet Tracer. Packet Tracer verschlüsselt `.pts`-Pakete und nur Packet Tracer kann sie erstellen, deshalb bauen Sie das Modul einmal aus den Dateien dieses Repositorys.

1. Laden Sie das [neueste Release](https://github.com/r4chan842/PTForge/releases/latest) herunter oder klonen Sie das Repository
2. Öffnen Sie in Packet Tracer `Extensions` → `Scripting` → `Configure PT Script Modules`
3. Erstellen Sie ein Modul mit dem Namen `PTForge`
4. Fügen Sie eine Skriptdatei mit dem Inhalt von [`release/ptforge.js`](../release/ptforge.js) hinzu
5. Fügen Sie die vierzehn Dateien aus [`src/ui`](../src/ui) als Oberflächendateien hinzu: `index.html`, `style.css`, `catalog.js`, `snippets.js`, `highlight.js`, `lint.js`, `netcalc.js`, `editor.js`, `acorn.js`, `instrument.js`, `terminal.js`, `debugview.js`, `views.js`, `interface.js`
6. Speichern und starten Sie das Modul und öffnen Sie `Extensions` → `PTForge Editor`

Die [Installationsanleitung](../docs/guides/installation.md) beschreibt jeden Schritt und Updates.

## Beispiele

34 vollständige Labs in [`examples/`](../examples/README.md), jedes beginnt mit einem leeren Arbeitsbereich:

| Ordner | Labs |
|---|---|
| `01-basics` | Erstes Netzwerk, Module und serielle Links, sichere Grundkonfiguration |
| `02-switching` | VLANs und Trunks, EtherChannel, STP-Root, Layer-3-Switch |
| `03-routing` | Statisch, OSPF mit mehreren Areas, EIGRP, BGP, IPv6 mit OSPFv3 |
| `04-security` | ACL, NAT und PAT, SSH und Port Security, HSRP |
| `05-services` | Server-DHCP, DNS und Web, FTP und E-Mail, Router-DHCP mit Relay |
| `06-wireless` | WLAN für zu Hause |
| `07-canvas` | Beschriftungen und Zonen |
| `08-topology` | Generierter Campus, Stern, Ring und Vermaschung, VLSM-Plan |
| `09-simulation` | Ping-Test |
| `10-ccna-labs` | Router on a Stick, komplettes Unternehmens-Lab |
| `11-inspection` | Switching prüfen, Port-Security-Audit |
| `12-automation` | Konfigurationssicherung, Befehlsaudit, Skriptbibliothek |
| `13-operations` | Erreichbarkeitstest, Änderungsverfolgung mit Snapshots |

Ausgangspunkte für eigene Arbeiten liegen in [`templates/`](../templates/README.md): leeres Lab, Campus, Filial-WAN und kleines Büro.

## Dokumentation

| Abschnitt | Inhalt |
|---|---|
| [Erste Schritte](../docs/guides/getting-started.md) | Ihr erstes Netzwerk in zehn Minuten |
| [Editor-Anleitung](../docs/guides/editor.md) | Arbeitsbereich, Dateien, IntelliSense, Probleme |
| [Terminal](../docs/guides/terminal.md) | Interaktives JavaScript und Geräte-CLI |
| [Debugger](../docs/guides/debugger.md) | Breakpoints, Schritte, Variablen und Watch |
| [Netzwerk-Werkzeuge](../docs/guides/network-tools.md) | Rechner, Erreichbarkeit und Snapshots |
| [Skripte schreiben](../docs/guides/writing-scripts.md) | Aufbau, Reihenfolge, Builder, Geschwindigkeit |
| [API-Referenz](../docs/api/README.md) | Jede Funktion mit Argumenten, Rückgabewerten und Beispielen |
| [Rezepte](../docs/recipes/README.md) | Campus-Switching, Routing-Labs, Edge-Router, Server, Diagramme |
| [CCNA-Themenübersicht](../docs/ccna/README.md) | Themen von CCNA 200-301 mit passenden Funktionen und Beispielen |
| [Spickzettel](../docs/cheatsheets/ios-to-ptforge.md) | IOS zu PTForge, Subnetting, Editor-Tasten |
| [Architektur](../docs/architecture/overview.md) | Schichten, Laufzeit, Editor-Brücke, Debugger, Tests |
| [Fehlerbehebung](../docs/guides/troubleshooting.md) | Häufige Fehler und Lösungen |
| [Einschränkungen](../docs/guides/limitations.md) | Was die Packet Tracer API nicht erlaubt |
| [FAQ](../docs/guides/faq.md) | Kurze Antworten |

## Projektstruktur

```
PTForge/
├── .github/
├── assets/
│   ├── brand/
│   ├── banners/
│   └── screenshots/
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── ccna/
│   ├── cheatsheets/
│   ├── guides/
│   ├── recipes/
│   └── reference/
├── examples/
├── i18n/
├── release/
├── src/
│   ├── api/
│   ├── core/
│   ├── data/
│   ├── lib/
│   └── ui/
├── templates/
├── tests/
└── tools/
```

## Entwicklung

Benötigt Node.js 18 oder neuer. Es gibt keine Laufzeitabhängigkeiten.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm run check
```

| Befehl | Zweck |
|---|---|
| `npm test` | Alle Tests ausführen |
| `npm run bundle` | `release/ptforge.js` neu bauen |
| `npm run catalog` | Die Funktionsliste des Editors aus `docs/api` erzeugen |
| `npm run reference` | Die Referenztabellen aus `src/data` erzeugen |
| `npm run check` | Funktionsliste, Bundle, Syntaxprüfung und Tests |
| `npm run ui-test` | 41 Browser-Prüfungen von Workbench, Terminal und Debugger mit Playwright |
| `npm run screenshots` | Die Screenshots in `assets/screenshots` neu erzeugen |

Die Testsuite führt die ganze Erweiterung gegen eine Nachbildung der Packet Tracer IPC API aus. Sie deckt jede öffentliche Funktion, jedes Beispiel, jede Vorlage und jedes Rezept, das Bundle, die Terminal- und Debugger-Engine sowie Projektregeln ab. Details unter [Tests](../docs/architecture/testing.md).

## Mitwirken

Fehlerberichte, Ideen und Pull Requests sind willkommen. Beginnen Sie mit [CONTRIBUTING](../CONTRIBUTING.md), sehen Sie sich die [Roadmap](../ROADMAP.md) an und beachten Sie den [Verhaltenskodex](../CODE_OF_CONDUCT.md). Sicherheitsprobleme bitte über die [Sicherheitsrichtlinie](../SECURITY.md). Fragen: [SUPPORT](../SUPPORT.md).

## Lizenz

PTForge steht unter der [MIT-Lizenz](../LICENSE). Der Debugger nutzt [Acorn](https://github.com/acornjs/acorn) (MIT), siehe [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

## Danksagung

Die Nutzung der Packet Tracer API folgt der offiziellen [Cisco Packet Tracer IPC API Dokumentation](https://tutorials.ptnetacad.net/help/default/IpcAPI/classes.html). Die Farben der Workbench folgen dem VS Code Theme Dark Modern.

Cisco und Packet Tracer sind Marken von Cisco Systems, Inc. Dieses Projekt steht in keiner Verbindung zu Cisco Systems, Inc. und wird nicht von Cisco unterstützt.

<div align="center">
<sub>Gemacht für Netzwerk-Studierende, Lehrende und alle, die dasselbe Lab nicht zweimal zusammenklicken wollen.</sub>
</div>
