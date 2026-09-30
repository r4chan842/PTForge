# PTForge documentation

## Guides

| Guide | For |
|-------|-----|
| [Installation](guides/installation.md) | Adding the module to Packet Tracer |
| [Getting started](guides/getting-started.md) | Your first script in ten minutes |
| [Editor guide](guides/editor.md) | Workspace, files, IntelliSense, problems |
| [Terminal](guides/terminal.md) | Interactive JavaScript and device CLI |
| [Debugger](guides/debugger.md) | Breakpoints, stepping, variables, watch and Debug Console |
| [Network tools](guides/network-tools.md) | Calculator, reachability matrix and snapshots |
| [Plugins](guides/plugins.md) | Write, install and enable `.pf` plugins |
| [Writing scripts](guides/writing-scripts.md) | Structure, order, builders, speed |
| [Troubleshooting](guides/troubleshooting.md) | Common errors and fixes |
| [Limitations](guides/limitations.md) | What is not possible and what to verify |
| [FAQ](guides/faq.md) | Short answers |

## Architecture

| Page | Content |
|------|---------|
| [Overview](architecture/overview.md) | Layers and how a script runs |
| [Runtime](architecture/runtime.md) | Script engine, IOS pipeline, processes, editor bridge |
| [Testing](architecture/testing.md) | Test suites and the Packet Tracer mock |

## CCNA

| Page | Content |
|------|---------|
| [Topic map](ccna/README.md) | CCNA 200-301 topics with functions and examples |
| [Lab checklist](ccna/lab-checklist.md) | A script order that avoids common problems |

## Cheat sheets

| Sheet | Content |
|-------|---------|
| [IOS to PTForge](cheatsheets/ios-to-ptforge.md) | IOS commands and the matching calls |
| [Subnetting](cheatsheets/subnetting.md) | Prefixes, masks, wildcards, host counts |
| [Editor shortcuts](cheatsheets/keyboard.md) | Keys and editor parts |

## API

[API reference](api/README.md): every function, grouped by area.

## Recipes

[Recipes](recipes/README.md): ready snippets for campus, routing, edge, servers and documentation.

## Reference tables

| Table | Content |
|-------|---------|
| [Device models](reference/device-models.md) | Every model for `addDevice` |
| [Device types](reference/device-types.md) | Filters for `getDevices` |
| [Modules](reference/modules.md) | Every module for `addModule` |
| [Link types](reference/link-types.md) | Cable names for `addLink` |
| [Port names](reference/port-names.md) | Port naming per device |

Reference tables are generated from `src/data` with `node tools/generate-reference.js`.
