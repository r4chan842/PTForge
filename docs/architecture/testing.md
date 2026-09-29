# Testing

← [Architecture](overview.md)

```
npm test
```

## What is covered

| Suite | Checks |
|-------|--------|
| `tests/unit` | IPv4 math, colors, text helpers, every command builder |
| `tests/integration` | Every public function against the Packet Tracer mock |
| `examples.test.js` | Every example runs without a failed link or rejected config |
| `recipes.test.js` | Every recipe in `docs/recipes` runs |
| `bundle.test.js` | `release/ptforge.js` loads on its own and builds a lab |
| `hygiene.test.js` | Load order, no comments, ES5, no duplicate globals, docs match code, catalog up to date |

## The mock

`tests/helpers/mock-pt.js` recreates the parts of the IPC API PTForge uses: network, devices, ports, switch ports, links, CLI, processes, canvas, simulation, command log, file manager and web view. Signatures follow the Cisco documentation.

The mock accepts every IOS command, so tests prove which commands are sent, not that IOS accepts them. Always try new features in Packet Tracer before a release.

## Adding a test

```js
const { loadExtension, configBody } = require("../helpers/load");

test("my feature", () => {
    const { run, world } = loadExtension();
    run('addDevice("R1", "2911", 0, 0); myFeature("R1")');
    assert.deepEqual(configBody(world, "R1"), ["expected command"]);
});
```
