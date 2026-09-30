# Editor guide

← [Documentation](../README.md)

The PTForge editor is a small VS Code written for the Packet Tracer web view. It has no dependencies and works offline.

![Editor](../../assets/screenshots/editor.png)

## Layout

| Area | Where | Use |
|------|-------|-----|
| Menu bar | top | Every command, grouped like VS Code |
| Command center | top middle | Click to go to a file |
| Activity bar | far left | Explorer, Function reference, Run and Debug, Snippets, Devices, Network tools, Lab Check |
| Side bar | left | The selected view. Drag its edge to resize |
| Editor | middle | Tabs, breadcrumbs, the code, find widget |
| Panel | bottom | Problems, Output, Debug Console, Terminal, Lab Check. Drag its edge to resize |
| Status bar | bottom | Connection, problems, run and debug state, cursor, zoom. Blue while debugging |

## Workspace and files

There are two kinds of files.

**Workspace files** live inside Packet Tracer's data store for the extension. They survive restarts and need no path. `Ctrl+S` stores the current text. Create them with `Ctrl+N`, rename with `F2` or a double click, delete from the explorer.

**Disk files** come from `File > Open File` or `Open Folder`. Packet Tracer shows its own file dialog. `Ctrl+S` writes the file back, `Save As` picks a new path. Closing a disk file with unsaved changes asks whether to save.

Unsaved text is kept even when the window closes, so nothing is lost. A dot on the tab means the file differs from what was last saved.

`File > Export` downloads the current file, and `Import from Clipboard` opens the clipboard as a new file.

When the page is opened in a normal browser (preview mode), Open uses the browser file picker and Save downloads the file. Scripts only run inside Packet Tracer.

## Writing code

- Suggestions appear as you type. They include every PTForge function with its arguments and description, JavaScript keywords and words already in the file. `Ctrl+Space` opens them on demand
- Inside the brackets of a PTForge call, a hint shows the signature with the current argument in bold
- Brackets and quotes close automatically. Typing the closing character steps over it, `Backspace` removes an empty pair
- `Enter` keeps the indentation and opens a block after `{`, `[` or `(`
- The bracket next to the cursor and its partner are highlighted

## Problems

The Problems panel updates while you type.

| Kind | Example |
|------|---------|
| Syntax error | `Unexpected token ')'` on the line where it happens |
| Unclosed item | `'{' is never closed`, `Unterminated string`, `Comment is never closed` |
| Mismatched bracket | `')' does not match '[' on line 3` |
| Unknown function | `Unknown function 'addDevise'. Did you mean 'addDevice'?` |

Unknown functions are warnings: functions and variables declared in the script, parameters and JavaScript built ins are recognized. Click **Change to ...** to apply the suggestion, click a row to jump to the line, or press `F8`.

## Running

`Ctrl+F5`, `Ctrl+Enter` or the triangle in the editor title runs the whole file, `Ctrl+Shift+Enter` runs the selection. `F5` starts the [debugger](debugger.md). The Packet Tracer item in the status bar turns orange while Packet Tracer works and shows the run time when it finishes. `log` and `showResult` write to Output. Lab Check and audit reports open in the Lab Check panel.

## Devices view

Lists every device in the open Packet Tracer file with its model, and the ports that have a cable or an address, with a green or red LED. Click a device or port to insert its quoted name at the cursor. The buttons run an audit, a topology summary, a show command on every device, or turn the command log into a script.

## Network tools

The Network tools view has a quick subnet calculator, VLSM planner and wildcard converter next to your code. The full calculator with nine tools, the reachability matrix and snapshot compare open as editor tabs. See [network tools](network-tools.md).

## Terminal and debugger

`` Ctrl+` `` opens the [terminal](terminal.md). `F5` starts the [debugger](debugger.md).

## Settings kept between sessions

Open files, the active tab, side bar and panel sizes and visibility, the selected view, the opened folder, the zoom level, breakpoints, watch expressions, debugger options and terminal history.
