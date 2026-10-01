Installation
============

PTForge runs inside Packet Tracer as a Script Module. Packet Tracer packages (.pts) are encrypted and can only be created inside Packet Tracer, so the repository ships the source and you build the module once in Packet Tracer.

Requirements
------------

- Cisco Packet Tracer 8.x or newer with the Extensions menu
- Nothing else. There is no installer and no network access is needed at runtime

Step 1: get the files
---------------------

    git clone https://github.com/r4chan842/PTForge.git

or download the ZIP from GitHub and extract it.

Step 2: create the Script Module
--------------------------------

1. Open Packet Tracer
2. Extensions → Scripting → Configure PT Script Modules
3. Create a new module named PTForge and open it in the Script Module editor

Button names in this dialog differ slightly between Packet Tracer versions. Look for the option that creates a new module, then open it in the Script Module editor.

Step 3: add the scripts
-----------------------

Option A: one file (recommended)

Add a single script file and paste https://github.com/r4chan842/PTForge/blob/main/release/ptforge.js. It contains every source file already in the right order. Rebuild it after editing the sources with:

    node tools/bundle.js

Option B: separate files

Useful when you want to change parts of the code inside Packet Tracer.

Packet Tracer loads script files top to bottom, so the order matters. Add a script file for each entry below and paste the matching file from https://github.com/r4chan842/PTForge/tree/main/src. The same list is in https://github.com/r4chan842/PTForge/blob/main/tools/load-order.json and the test suite fails if the two ever differ.

1. https://github.com/r4chan842/PTForge/blob/main/src/data/devices.js, links.js, modules.js, types.js
2. https://github.com/r4chan842/PTForge/blob/main/src/lib/text.js, colors.js, ipv4.js
3. https://github.com/r4chan842/PTForge/blob/main/src/core/context.js, layers.js
4. Every file in https://github.com/r4chan842/PTForge/tree/main/src/api, in the order listed in load-order.json
5. https://github.com/r4chan842/PTForge/blob/main/src/core/runner.js, window.js
6. https://github.com/r4chan842/PTForge/blob/main/src/core/main.js last

main.js must be the last script because it opens the menu entry after every function exists.

Step 4: add the interface
-------------------------

Add the fourteen files in https://github.com/r4chan842/PTForge/tree/main/src/ui as the module's interface files, keeping the names:

* index.html: Page layout
* style.css: VS Code Dark Modern theme
* catalog.js: Function list, generated from docs/api
* snippets.js: Snippet library
* highlight.js: Syntax highlighter
* lint.js: Problems: syntax and unknown functions
* netcalc.js: IPv4 and IPv6 network calculator
* editor.js: The code editor component, breakpoints and execution line
* acorn.js: JavaScript parser used by the debugger (MIT)
* instrument.js: Prepares a script for step recording
* terminal.js: The JavaScript terminal
* debugview.js: Run and Debug view, Debug Console, breakpoints
* views.js: Calculator, reachability and snapshot diff tabs
* interface.js: Workbench, files, commands, Packet Tracer bridge

They load nothing from the network. The list order matches the script tags in index.html.

Updating from 1.1

Replace the script file and every interface file, and add the five new ones: acorn.js, instrument.js, terminal.js, debugview.js and views.js. Your workspace, open tabs and settings are kept.

Updating from 1.0

Replace the script file and every interface file, and add the five new ones. Scripts stored in the three old slots are moved into the new workspace as script-1.js, script-2.js and script-3.js the first time the editor opens.

Step 5: save and start
----------------------

1. Save the module as PTForge.pts
2. Back in Configure PT Script Modules, select it and press Start
3. A new menu entry Extensions → PTForge Editor appears

If your version offers an option to load the module at startup, enable it so the menu entry is always there.

Updating
--------

Pull the new version, open the module in Edit, replace the changed files and save. https://github.com/r4chan842/PTForge/blob/main/CHANGELOG.md lists which files changed in each release.

Uninstalling
------------

Configure PT Script Modules → select PTForge → Remove.
