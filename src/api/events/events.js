var eventHandlers = [];

var workspaceEvents = [
    "deviceAdded", "deviceRemoved", "linkCreated", "linkDeleted",
    "canvasNoteAdded", "canvasNoteRemoved", "canvasNoteTextChanged"
];

function onWorkspaceEvent(eventName, handler) {
    if (workspaceEvents.indexOf(eventName) === -1) {
        throw new Error("Unsupported event: " + eventName + ". Use one of " + workspaceEvents.join(", "));
    }
    var entry = {
        target: logicalWorkspace(),
        name: eventName,
        context: {},
        callback: function (source, args) {
            try {
                handler(args);
            } catch (error) {
                console.log(error);
            }
        }
    };
    entry.target.registerEvent(eventName, entry.context, entry.callback);
    eventHandlers.push(entry);
    return eventHandlers.length - 1;
}

function offWorkspaceEvent(id) {
    var entry = eventHandlers[id];
    if (!entry) {
        return false;
    }
    entry.target.unregisterEvent(entry.name, entry.context, entry.callback);
    eventHandlers[id] = null;
    return true;
}

function offAllEvents() {
    var count = 0;
    eventHandlers.forEach(function (entry, id) {
        if (entry && offWorkspaceEvent(id)) {
            count++;
        }
    });
    eventHandlers = [];
    return count;
}
