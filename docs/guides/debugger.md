Debugger
========

PTForge has a JavaScript debugger modeled on VS Code: breakpoints, stepping, variables, watch expressions, call stack and a debug console.

How it works
------------

Packet Tracer runs a script from start to end without stopping, so a script cannot be paused halfway. The debugger records instead:

1. `F5` instruments the script and runs it once inside Packet Tracer
2. Every statement records its line, the call stack, the variables in scope and the watch values
3. The editor then pauses on the first breakpoint, and every step moves through the recording

Stepping is instant and works in both directions. Device changes happen during the recorded run, so stepping back shows earlier values but does not undo changes in Packet Tracer.

Start and stop
--------------

* Start debugging, or continue: `F5`
* Run without debugging: `Ctrl+F5` or `Ctrl+Enter`
* Stop: `Shift+F5`
* Restart: `Ctrl+Shift+F5`
* Step over: `F10`
* Step into: `F11`
* Step out: `Shift+F11`
* Step back: `Shift+F10`
* Reverse continue: Command palette → `Reverse Continue`

While paused, the status bar turns blue, a floating toolbar appears over the editor and the current line is highlighted in yellow with an arrow in the gutter.

Breakpoints
-----------

* Toggle: Click the gutter left of a line number, or `F9`
* Conditional: Right click the gutter → `Add Conditional Breakpoint...`. Pause only when the expression is true
* Hit count: Right click → `Edit Breakpoint...` → hit count. Pause on the given hit, for example `3` or `>= 5`
* Logpoint: Right click → `Add Logpoint...`. Print a message with `{expressions}` instead of pausing
* Disable one: Uncheck it in the Breakpoints section
* Disable all: The toggle in the Breakpoints section title
* Remove all: The remove icon in the Breakpoints section title
* Uncaught exceptions: Checkbox in the Breakpoints section. Pauses on the line that threw

Breakpoints are saved with the workspace and move with their lines while you edit.

Run and Debug view
------------------

* Variables: Local, Closure and Script scopes. Objects and arrays expand. Collapse all from the section title
* Watch: Expressions you add with `+`. Each one is evaluated at every recorded step
* Call Stack: Every frame with file and line. Click a frame to see its variables
* Breakpoints: All breakpoints with their line and state

Before starting you can choose **Stop on entry**, which pauses on the first statement, and the **recorded steps** limit: 1,000, 3,000, 10,000 or 20,000. A larger limit records longer loops and uses more memory.

Debug Console
-------------

While paused, type an expression in the Debug Console and press `Enter`. It is evaluated against the recorded values of the paused frame:

```
› routers.join(" + ")
'R1 + R2'
› total * 2
8
```

Recorded values are plain data. Functions and Packet Tracer objects cannot be called from a recording. To get the live value of any expression at every step, add it to Watch and restart.

When no session is running, the Debug Console runs expressions in Packet Tracer like the terminal.

Hover
-----

Point at a variable in the editor while paused to see its value in a tooltip.

Limits
------

- Only the first steps up to the limit keep variables. The script still runs to the end, breakpoints later in the run still stop, and the Debug Console tells you when the limit was reached
- Only the active file is debugged. Code loaded with `.run` or `runScriptFile` is run but not recorded
- Timers do not exist in the Packet Tracer engine, so everything runs in order
