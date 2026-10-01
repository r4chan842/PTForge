Events
======

Run code when something changes on the workspace.

| Function | Returns | Description |
|----------|---------|-------------|
| `onWorkspaceEvent(event, handler)` | id | Register a handler |
| `offWorkspaceEvent(id)` | bool | Remove a handler |
| `offAllEvents()` | number | Remove every handler |

Supported events: deviceAdded, deviceRemoved, linkCreated, linkDeleted, canvasNoteAdded, canvasNoteRemoved, canvasNoteTextChanged.

The handler receives the event arguments object from Packet Tracer. Errors inside a handler are logged and never crash Packet Tracer.

    offAllEvents();
    onWorkspaceEvent("deviceAdded", function () {
        labelAllDevices();
    });

Handlers stay active until Packet Tracer closes or you remove them. Start event scripts with offAllEvents() so running the same script twice does not register the handler twice.
