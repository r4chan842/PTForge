Canvas
======

Notes, shapes, zones and labels on the logical workspace.

Colors accept a name, "#rrggbb", "#rgb" or [r, g, b]. Names: black, white, gray, red, green, blue, yellow, orange, purple, cyan, pink, teal, navy, brown.

Every drawing goes on the current layer. Pass layer to override it.

Notes
-----

| Function | Returns | Description |
|----------|---------|-------------|
| `addNote(x, y, text, layer)` | id | Text note. `\n` makes a new line |
| `setNoteText(id, text)` | bool | Change a note |
| `getNoteText(id)` | string | Read a note |
| `getNotes()` | object[] | `{ id, text, x, y }` |
| `findNote(text)` | id | First note with this exact text, or `null` |
| `removeNotes()` | number | Delete every note |
| `addTextPopup(x, y, text, width, layer)` | id | Popup box |
| `removeTextPopup(id)` | bool | Remove a popup |

Shapes
------

| Function | Returns | Description |
|----------|---------|-------------|
| `drawLine(x1, y1, x2, y2, color, width, layer)` | id | Line, width 2 by default |
| `drawCircle(cx, cy, radius, color, layer)` | id | Circle |
| `drawRect(x, y, width, height, color, lineWidth, layer)` | ids | Rectangle outline from four lines |
| `drawPolyline(points, color, width, closed, layer)` | ids | Connected lines through `[[x, y], ...]` |
| `drawDashedLine(x1, y1, x2, y2, color, width, dash, layer)` | ids | Dashed line |
| `drawArrow(x1, y1, x2, y2, color, width, layer)` | ids | Line with an arrow head |
| `drawZone(x, y, width, height, label, color, lineWidth)` | ids | Rectangle with a label in the corner |
| `drawZoneAround(devices, label, color, padding)` | ids | Zone that fits around devices |

    drawZoneAround(["S1", "PC1", "PC2"], "VLAN 10 - Sales", "green");
    drawArrow(600, 100, 480, 100, "red", 3);
    drawDashedLine(50, 400, 750, 400, "gray");

The Packet Tracer API has no filled rectangle. drawRect and drawZone build outlines from lines.

Labels
------

| Function | Returns | Description |
|----------|---------|-------------|
| `labelDevice(name, text, offsetY)` | id | Note above a device, the device name by default |
| `labelDevices({ name: text }, offsetY)` | object | Several labels |
| `labelAllDevices(formatter, offsetY)` | object | Label every device. `formatter(name)` returns the text |
| `labelWithIp(name, port, offsetY)` | id | Device name plus the port address |
| `labelLink(dev1, dev2, text)` | id | Note in the middle between two devices |

    labelAllDevices();
    labelWithIp("PC1", "FastEthernet0", 60);
    labelLink("R1", "R2", "10.0.0.0/30");
    labelAllDevices(function (name) { return name + " (" + getDeviceModel(name) + ")"; });

Managing items
--------------

| Function | Returns | Description |
|----------|---------|-------------|
| `removeItem(id)` | bool | Delete one item or an array of ids |
| `moveItem(id, dx, dy)` | bool | Move one item or an array |
| `setItemPosition(id, x, y)` | bool | Absolute position |
| `getItemPosition(id)` | object | `{ x, y }` |
| `getCanvasItems()` | object | Ids of notes, lines, rects, ellipses, polygons |
| `getLineData(id)` | object | Coordinates and color |
| `getRectData(id)` | object | Coordinates, fill, border and text of a rectangle drawn by hand |
| `getEllipseData(id)` | string[] | Raw ellipse data |
| `getPolygonData(id)` | string[] | Raw polygon data |
| `clearLayer(layer)` | bool | Clear a layer, the current one by default |
| `clearCanvas()` | number | Delete every drawing and note |

Layers
------

| Function | Returns | Description |
|----------|---------|-------------|
| `newLayer()` | number | Start a new unused layer |
| `useLayer(layer)` | number | Switch to a layer |
| `currentLayer()` | number | Layer in use |

    var background = newLayer();
    drawZone(20, 20, 800, 500, "Campus", "navy");
    newLayer();
    labelAllDevices();
    clearLayer(background);
