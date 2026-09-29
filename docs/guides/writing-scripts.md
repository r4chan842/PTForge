# Writing scripts

← [Documentation](../README.md)

## Language

Packet Tracer runs scripts with the Qt JavaScript engine, which supports ES5. Use `var`, `function` and `forEach`. Arrow functions, `let`, `const`, template strings and classes may fail depending on the Packet Tracer version.

## Structure that scales

Keep data at the top and logic below. Changing a lab then only means changing the data.

```js
var sites = [
    { name: "HQ", lan: "10.1.0.0/24", x: 150 },
    { name: "BR1", lan: "10.2.0.0/24", x: 450 },
    { name: "BR2", lan: "10.3.0.0/24", x: 750 }
];
var wan = pointToPointLinks("172.16.0.0/24", sites.length - 1);

sites.forEach(function (site, i) {
    addDevice(site.name, "2911", site.x, 100);
    addModule(site.name, "0/0", "HWIC-2T");
    setInterfaceIp(site.name, "GigabitEthernet0/0", nthHost(site.lan, 1), 24);
});
```

## Order of operations

1. Create devices
2. Install modules (devices power cycle, so do this before configuration)
3. Create links
4. Configure IOS
5. Configure hosts and servers
6. Draw labels and zones last, when positions are final

## Checking results

| Need | Use |
|------|-----|
| Fail fast | `applyConfig` throws on the first rejected line |
| Collect problems | `configureIosDevice` returns them |
| Many devices | `applyToDevices` returns `{ device: [rejected] }` |
| See a value | `showResult(value)` |

```js
var problems = applyToDevices(["S1", "S2"], buildVlans({ 10: "A", 20: "B" }));
showResult(problems);
```

## Preview with builders

Every IOS helper has a `build...` function that returns the lines instead of sending them. Use it to review a config, or to combine several helpers into one push:

```js
var config = []
    .concat(buildOspf({ routerId: "1.1.1.1", networks: ["10.0.0.0/8"] }))
    .concat(buildSsh({ domain: "lab.local", username: "admin", password: "Adm1n!" }));
showResult(config.join("\n"));
```

## Speed

- `save` is `true` by default and runs `write memory` after every call. Pass `false` while building and call `saveAllConfigs()` once at the end
- Build one array of lines per device and push once instead of calling many small helpers

## Reusing scripts

Scripts are plain text. Keep your lab scripts in a folder, copy one, and use the `Paste` button in the editor.
