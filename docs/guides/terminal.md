Terminal
========

The terminal runs JavaScript inside Packet Tracer one line at a time. It works like the *New Terminal* of VS Code, except that the shell is the PTForge engine and every PTForge function is available.

Open a terminal
---------------

* Show or hide the terminal: `` Ctrl+` `` or `View` → `Terminal`
* New JavaScript terminal: `` Ctrl+Shift+` `` or `+` in the panel title
* New device CLI terminal: `Terminal` → `New Device CLI Terminal...`, then pick a device
* Switch terminal: The list in the panel title
* Close the active terminal: The bin icon, or `.exit`
* Clear: `Ctrl+L` or `.clear`

Running code
------------

Type an expression or a statement and press `Enter`.

```
ptforge:js> var r1 = getDeviceInfo("R1")
ptforge:js> r1.ports.length
4
ptforge:js> setInterfaceIp("R1", "GigabitEthernet0/1", "10.0.12.1/30")
```

- Variables, functions and `var`, `let` or `const` declarations stay available for later lines
- Results are shown as readable trees: strings in quotes, numbers in green, objects and arrays expanded
- Errors are printed in red with their type, for example `Uncaught ReferenceError: x is not defined`
- `log()` and `showResult()` print into the terminal
- `Shift+Enter` adds a new line, so you can type a block before running it

Keys
----

* `Enter`: Run the line
* `Shift+Enter`: New line inside the input
* `Up`, `Down`: Earlier and later commands. History is saved with the workspace
* `Tab`: Complete a PTForge function, a variable you defined, a keyword or a dot command. With many matches, press it twice to list them
* `Ctrl+L`: Clear the screen
* `Ctrl+C`: Copy the selection, or clear the input when nothing is selected
* `Ctrl+D`: Close the terminal when the input is empty

Dot commands
------------

* `.help`: List the commands
* `.clear`: Clear the terminal
* `.devices`: Devices with model and addresses
* `.ping`: Ping matrix of the whole network. `.ping PC1 10.0.0.1` sends one ping
* `.trace R1 10.0.0.2`: Traceroute from a router, switch or host
* `.show R1 ip route`: Run a show command on a device
* `.cli R1`: Talk to the device CLI in this terminal. The prompt changes to the device prompt. `exit` or `.exit` leaves
* `.audit`: Run `auditNetwork()` and print the findings
* `.snap [name]`: Take a snapshot
* `.diff name [other]`: Compare a snapshot with the network now or with another snapshot
* `.calc 10.1.2.3/20`: IPv4 or IPv6 calculator
* `.run lab.js`: Run a workspace file in this terminal. Its variables stay available
* `.history`: Commands typed in this session
* `.plugins`: Installed plugins and their state. Plugin dot-commands such as `.hosts` work like built-in ones, see [Plugins](plugins.md)
* `.exit`: Leave CLI mode, or close the terminal

Editor integration
------------------

* `Terminal` → `Run Selected Text`: Send the selected lines to the active terminal
* `Terminal` → `Run Active File`: Run the whole file in the terminal and keep its variables for exploring

Preview mode
------------

Outside Packet Tracer the page runs in preview mode. `.help`, `.calc` and `.clear` work there, while JavaScript and device commands need Packet Tracer.

Notes
-----

- The terminal changes the real topology. There is no undo, so take a snapshot with `.snap` before larger changes
- A line that runs for a long time blocks Packet Tracer until it ends, as any script does
