Plugins
=======

A plugin is a single .pf file that adds features to PTForge without changing PTForge itself. It can add

- dot-commands for the terminal, for example .hosts
- functions that scripts and the terminal can call
- audit rules whose findings show up in auditNetwork() and .audit
- Lab Check checks that runPluginChecks() grades

Where plugins live
------------------

PTForge scans Documents/PTForge/plugins for .pf files. Change it with Plugins: Change Plugin Folder in the command palette, the folder button in the Plugins view, or setPluginFolder(path).

Three ready plugins are in the ../../plugins folder of this repository:

    File             Permissions  Adds
    ---------------  -----------  ---------------------------------------------------------------------------------
    host-audit.pf    read only    .hosts, hostTable(), a rule for missing or wrong gateways and DNS, a graded check
    port-map.pf      read only    .ports R1, portMap(name), a rule for cabled ports that are down
    config-tools.pf  cli          .saveall, .motd "text"

Plugin Manager
--------------

Open it with the puzzle icon in the activity bar or Ctrl+Shift+X. Every plugin shows its name, version, description, permissions and what it adds. Enable asks for consent, Disable unloads it, the pencil opens the file in the editor.

In the terminal, .plugins lists the plugins and .help lists plugin commands under their own heading.

File format
-----------

A plugin starts with a JSON manifest between two --- lines. JavaScript follows.

    ---
    {
      "id": "vlan-report",
      "name": "VLAN Report",
      "version": "1.0.0",
      "description": "VLANs on every switch",
      "author": "you",
      "permissions": []
    }
    ---
    plugin.command("vlans", "VLANs on every switch", function (args, out) {
        return getDevices(["switch"]).map(function (name) {
            return name + ": " + getVlans(name).map(function (v) { return v.id; }).join(", ");
        }).join("\n");
    });

    Field                Required  Rule
    -------------------  --------  -----------------------------------------------------------------
    id                   yes       1 to 41 lowercase letters, digits or dashes, unique in the folder
    name                 no        Shown in the manager, the id by default
    version              no        Free text, 0.0.0 by default
    description, author  no        Shown in the manager and the consent dialog
    permissions          no        Any of topology, cli, files, raw

The plugin object
-----------------

* plugin.command(name, description, fn): Adds .name to the terminal. fn(args, out) gets the words after the command and an out(text) function that prints right away. The return value is printed as the result
* plugin.fn(name, fn): Adds a global function. Fails if the name already exists
* plugin.rule(name, fn): fn() returns strings or { severity, device, port, message } objects. They appear in auditNetwork() as rule id/name
* plugin.check(name, fn, hint, points): A Lab Check item run by runPluginChecks()
* plugin.onDisable(fn): Runs when the plugin is disabled or reloaded
* plugin.log(value): Writes to the Output panel with the plugin id in front
* plugin.id, plugin.name, plugin.version, plugin.permissions: From the manifest

All read functions of PTForge work without any permission: getDevices, getDeviceInfo, getPcIp, getLinks, getRunningConfig, ping, show... and the IPv4 utilities.

Permissions
-----------

* none: Reading the topology, addresses and configs, ping, traceroute, show commands
* topology: Adding, removing and moving devices and cables, canvas drawing, host addresses, server services
* cli: IOS configuration commands, runCommand, simulation control
* files: Reading, writing and deleting files, opening and saving projects
* raw: Direct ipc, network(), appWindow(), Function and eval. This skips every other check

The list of functions behind each permission is generated from the source into https://github.com/r4chan842/PTForge/blob/main/src/data/permissions.js by npm run permissions. A plugin that calls a function it has no permission for gets an error such as Plugin guard needs the "cli" permission to use setHostname. Plugins can never call enablePlugin, disablePlugin, reloadPlugins or setPluginFolder.

Consent
-------

Enabling a plugin for the first time opens a dialog with its permissions, the file path and the SHA-1 checksum Packet Tracer reports for the file. Allowing it stores the checksum and permissions in plugins.json in the plugin folder.

When Packet Tracer starts, PTForge loads only plugins whose file and permissions match what you allowed. If a plugin file changes, it stays off and the manager marks it Changed since you allowed it until you review it again.

Permissions protect against honest mistakes. They are not a sandbox: plugin code runs inside the Packet Tracer script engine like your own scripts. Only enable plugins whose code you have read or whose author you trust.

Errors
------

A plugin that fails to load is left completely unloaded, with no half-registered commands or functions. The error is shown on its card, for example a syntax error, a command name that is taken (.help, .ping and the other built-in commands are reserved), a function name that already exists, or a duplicate id.
