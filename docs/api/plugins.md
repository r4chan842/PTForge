Plugins
=======

Load `.pf` plugin files, enable and disable them, and run the commands, rules and checks they add. The format and a walkthrough are in the [plugin guide](../guides/plugins.md).

Functions
---------

| Function | Returns | Description |
|----------|---------|-------------|
| `getPluginFolder()` | string | Folder scanned for `.pf` files, `<Documents>/PTForge/plugins` by default |
| `setPluginFolder(path)` | string | Use another folder. Active plugins are unloaded and the choice is remembered |
| `listPlugins()` | object[] | `{ id, name, version, description, author, permissions, file, checksum, enabled, consent, error, commands, functions, rules, checks }`. `consent` is `none`, `granted` or `changed` |
| `enablePlugin(id, grant)` | boolean | Load a plugin. The first time, and after the file or its permissions change, `grant` must be `true` |
| `disablePlugin(id)` | boolean | Unload a plugin and forget its consent |
| `reloadPlugins()` | string[] | Unload everything and load the enabled plugins again. Returns the loaded ids |
| `loadEnabledPlugins()` | string[] | Same as reloadPlugins, called when Packet Tracer starts the extension |
| `getPluginCommands()` | object[] | `{ name, plugin, info }` for every dot-command added by plugins |
| `runPluginCommand(name, args)` | any | Run a plugin dot-command. `args` is the text after the command, quotes group words |
| `runPluginChecks(title)` | object | Run every plugin check as a Lab Check report |
| `createPlugin(id, name)` | string | Write a starter `.pf` file into the plugin folder and return its path |

Example
-------

```js
showResult(listPlugins().map(function (p) { return p.id + " " + (p.enabled ? "on" : "off"); }));
enablePlugin("host-audit", true);
runPluginCommand("hosts", "");
auditNetwork();
runPluginChecks();
```
