# Architecture overview

← [Documentation](../README.md)

PTForge is a Packet Tracer Script Module. Packet Tracer loads its scripts into one JavaScript engine, calls `main()`, and shows the editor window when the menu entry is clicked.

```
┌──────────────── Packet Tracer ────────────────┐
│                                               │
│  Editor window (src/ui)                       │
│   editor · terminal · debugger · views · UI   │
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

## Editor files

| File | Role |
|------|------|
| `highlight.js` | Tokenizer shared by the highlighter and the linter |
| `lint.js` | Syntax check with `Function`, bracket scan, unknown names |
| `netcalc.js` | IPv4 and IPv6 math for the calculator and the terminal |
| `acorn.js` | Acorn parser, used to instrument scripts for the debugger |
| `instrument.js` | Adds step hooks to every statement, maps steps to lines and scopes, walks a recorded trace |
| `terminal.js` | Terminal tabs, history, completion, dot commands, device CLI mode |
| `debugview.js` | Breakpoints, debug sessions, Variables, Watch, Call Stack, Debug Console, hover |
| `views.js` | Editor tabs for the calculator, the reachability matrix and snapshot diffs |
| `editor.js` | Textarea over a highlighted layer, undo, suggest, find |
| `interface.js` | Workbench, workspace store, file dialogs through `$se`, reports |
| `catalog.js`, `snippets.js` | Data for IntelliSense and snippets |

## Debugger

The debugger records instead of pausing the engine. Packet Tracer runs scripts synchronously, so a script cannot be stopped halfway and resumed later.

1. `instrument.js` parses the script with Acorn and places a hook before every statement. Each hook knows its line and which variables are in scope
2. The editor sends the instrumented script, the breakpoints and the watch expressions with `$se("debugRun", ...)`
3. `core/debugger.js` runs it once. At every hook it stores the step, the call depth, a preview of each variable and the value of each watch, up to the recorded step limit
4. The trace comes back to the editor, which pauses on the first breakpoint. Stepping over, into, out and back only moves through the recorded trace

Device changes happen for real during step 3. Stepping back shows earlier values but does not undo changes in Packet Tracer.

## Terminal

Each terminal line goes to `core/shell.js` with `$se("shellEval", id, code)`. Declarations are moved to the global scope so later lines can use them, the value is turned into a readable preview, and the result comes back with `evaluateJavaScriptAsync`.

