# Architecture overview

← [Documentation](../README.md)

PTForge is a Packet Tracer Script Module. Packet Tracer loads its scripts into one JavaScript engine, calls `main()`, and shows the editor window when the menu entry is clicked.

```
┌──────────────── Packet Tracer ────────────────┐
│                                               │
│  Editor window (src/ui)                       │
│   index.html · style.css · interface.js       │
│        │  $se("runCode", encoded script)      │
│        ▼                                      │
│  Script engine                                │
│   core/runner.js  → new Function(script)()    │
│        │                                      │
│        ▼                                      │
│   api/*   public functions                    │
│   lib/*   IPv4, colors, text                  │
│   data/*  models, modules, cables, types      │
│   core/context.js  finds devices and ports    │
│        │                                      │
│        ▼                                      │
│   ipc  Packet Tracer IPC API                  │
│        │                                      │
│        ▲ evaluateJavaScriptAsync(output)      │
│   Editor output panel                         │
└───────────────────────────────────────────────┘
```

## Layers

| Layer | Folder | Rule |
|-------|--------|------|
| Data | `src/data` | Plain tables, no logic |
| Library | `src/lib` | Pure functions, never touch `ipc` |
| Core | `src/core` | Access to Packet Tracer objects, script runner, window |
| API | `src/api` | Public functions users call |
| UI | `src/ui` | The editor, runs in a separate web view |

Lower layers never call higher ones. The load order in `tools/load-order.json` follows the same direction.

## How a script runs

1. The editor encodes the script with `encodeURIComponent` so new lines and quotes survive the bridge
2. `$se("runCode", ...)` calls `runCode` in the script engine
3. `runCode` compiles the text with `new Function`, so syntax errors are caught before anything runs
4. Public functions validate their arguments and throw descriptive errors
5. IOS helpers build command lines and pass them to `configureIosDevice`
6. `showResult`, `log` and errors are sent back to the editor with `evaluateJavaScriptAsync`

See [runtime](runtime.md) and [testing](testing.md).
