Snapshots
=========

Take a picture of the whole network, change something, then see exactly what changed: devices, cables, addresses, port states and running-config lines.

Functions
---------

| Function | Returns | Description |
|----------|---------|-------------|
| `takeSnapshot(name)` | string | Save the current state under a name, `snapshot-1`, `snapshot-2` and so on by default |
| `getSnapshots()` | object[] | `{ name, time, devices, links }` for every snapshot |
| `deleteSnapshot(name)` | bool | Forget a snapshot |
| `compareSnapshots(from, to)` | object | Differences between two snapshots. Leave out `to` to compare with the network as it is now |
| `showSnapshotDiff(from, to)` | object | Same, and open the result in a diff tab in the editor |
| `saveSnapshot(name, path)` | string | Write a snapshot to a JSON file |
| `loadSnapshot(path, name)` | string | Read a snapshot file back |
| `captureState()` | object | The raw state a snapshot stores: `{ devices, links }` |
| `diffLines(before, after)` | object[] | Line diff of two arrays: `{ op, text }` with `op` as `" "`, `"+"` or `"-"` |

What is compared
----------------

* `devicesAdded`, `devicesRemoved`: Device names
* `linksAdded`, `linksRemoved`: `"R1 GigabitEthernet0/0 <-> S1 GigabitEthernet0/1"`
* `powerChanges`: `{ device, before, after }`
* `addressChanges`: `{ device, port, before, after }` with addresses as `10.0.0.1/24`
* `portChanges`: `{ device, port, before, after }` with `up` or `down`
* `configChanges`: `{ device, added, removed, diff }` for routers and switches
* `changes`: Total number of changes

Header lines such as `Building configuration...`, `Current configuration : 1234 bytes` and `!` separators are ignored, so only real configuration lines count.

Snapshots live in memory while Packet Tracer is open. Use `saveSnapshot` to keep one.

Example
-------

```js
takeSnapshot("before");
setInterfaceIp("R1", "GigabitEthernet0/1", "10.9.9.1/24");
configureOspf("R1", { processId: 1, networks: [{ network: "10.9.9.0/24", area: 0 }] });
showSnapshotDiff("before");
```

In the editor the **Snapshots** section of the Devices view has buttons for the same actions.
