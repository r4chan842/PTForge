Workspace and project
=====================

View
----

| Function | Description |
|----------|-------------|
| `zoomIn()` | Zoom in |
| `zoomOut()` | Zoom out |
| `zoomReset()` | Reset zoom |
| `getZoom()` | Current zoom level |
| `centerOn(device)` | Scroll to a device. `centerOn(x, y)` scrolls to a point |
| `setBackground(path, tiled)` | Background image for the logical workspace |
| `devicesInArea(x1, y1, x2, y2)` | Device names inside a rectangle |
| `getPacketTracerVersion()` | Packet Tracer version string |
| `clearTopology()` | Delete every device and drawing |

Multiuser
---------

| Function | Description |
|----------|-------------|
| `addRemoteNetwork(x, y)` | Add a remote network cloud, returns its name |
| `moveRemoteNetwork(name, x, y)` | Move it |
| `removeRemoteNetwork(name)` | Delete it |

Files
-----

| Function | Description |
|----------|-------------|
| `newProject(confirm)` | New file. `true` asks to save the current one |
| `saveProject()` | Save the current file |
| `saveProjectAs(path)` | Save to a path without an overwrite prompt |
| `openProject(path)` | Open a .pkt file |
| `getDefaultSaveFolder()` | Default save folder |

```js
clearTopology();
buildLan({ hosts: 4, network: "10.0.0.0/24" });
saveProjectAs(getDefaultSaveFolder() + "/generated-lan.pkt");
```

Text files
----------

Read and write files on the computer running Packet Tracer.

| Function | Description |
|----------|-------------|
| `readTextFile(path)` | Contents of a text file |
| `writeTextFile(path, text)` | Create or replace a text file |
| `fileExists(path)` | Whether a file exists |
| `folderExists(path)` | Whether a folder exists |
| `makeFolder(path)` | Create a folder |
| `deleteFile(path)` | Delete a file |
| `runScriptFile(path)` | Run a PTForge script from disk |
| `exportTopology(path)` | Save devices, positions and links as JSON |
| `exportConfigs(folder, names)` | Save the running config of every router and switch, one file each |

```js
var folder = getDefaultSaveFolder() + "/lab-backup";
exportConfigs(folder);
exportTopology(folder + "/topology.json");
runScriptFile("C:/labs/campus.js");
```

Command log
-----------

Packet Tracer can record every command typed in any CLI.

| Function | Description |
|----------|-------------|
| `setCommandLogging(enabled)` | Start or stop recording |
| `isCommandLogging()` | Whether recording is on |
| `getCommandLog(name)` | `{ time, device, prompt, command, resolved }` entries, all devices by default |
| `clearCommandLog()` | Delete the recorded entries |
