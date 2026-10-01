Runtime details
===============

Script engine
-------------

- ES5 only. The test suite rejects arrow functions, `let`, `const`, classes and template strings in `src` and `examples`
- Every function is global, so user scripts call them directly
- `ipc` is the Packet Tracer IPC root object: `ipc.network()`, `ipc.appWindow()`, `ipc.simulation()`, `ipc.commandLog()`, `ipc.systemFileManager()`

IOS configuration
-----------------

`configureIosDevice(name, commands, save)`:

1. `skipBoot()` so the device accepts commands at once
2. Sends `!` in global mode to leave any sub mode and pass password prompts
3. Sends every line with `enterCommand(line, "")`. Status other than ok is recorded
4. `end`, then `write memory` when `save` is not `false`
5. Returns `[{ command, status }]` for every rejected line

Server processes
----------------

Server features use `device.getProcess(name)`:

* DHCP: `DhcpServerMain`
* DNS: `DnsServer`
* HTTP / HTTPS: `HttpServer` / `HttpsServer`
* FTP: `FtpServer`
* Email: `EmailServer`
* TFTP: `TftpServer`
* Syslog: `SyslogServer`
* RADIUS: `RadiusServer`
* Wireless: `WirelessServer`, `WirelessCommon`

Inspection functions try the class name with and without the `Process` suffix, for example `StpMain` then `StpMainProcess`.

Editor bridge
-------------

* Editor → engine: `$se(functionName, ...args)`
* Engine → editor: `webview.evaluateJavaScriptAsync(code)` calling `window.receiveOutput`
* Editor storage: `$putData` and `$getData`, three script slots and the font size

When the editor is closed, output falls back to Packet Tracer message boxes.
