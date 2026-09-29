function addNote(x, y, text, layer) {
    return logicalWorkspace().addNote(Math.round(x), Math.round(y), layerOrCurrent(layer), String(text));
}

function setNoteText(noteId, text) {
    return logicalWorkspace().changeNoteText(noteId, String(text)) === true;
}

function getNoteText(noteId) {
    return String(logicalWorkspace().getCanvasNoteText(noteId));
}

function getNotes() {
    var workspace = logicalWorkspace();
    return toArray(workspace.getCanvasNoteIds()).map(function (id) {
        return {
            id: id,
            text: String(workspace.getCanvasNoteText(id)),
            x: workspace.getCanvasItemX(id),
            y: workspace.getCanvasItemY(id)
        };
    });
}

function findNote(text) {
    var match = getNotes().filter(function (note) {
        return note.text === String(text);
    })[0];
    return match ? match.id : null;
}

function removeNotes() {
    var ids = toArray(logicalWorkspace().getCanvasNoteIds());
    ids.forEach(function (id) {
        logicalWorkspace().removeCanvasItem(id);
    });
    return ids.length;
}

function addTextPopup(x, y, text, width, layer) {
    return logicalWorkspace().addTextPopup(Math.round(x), Math.round(y), layerOrCurrent(layer), width || 200, String(text));
}

function removeTextPopup(popupId) {
    return logicalWorkspace().removeTextPopup(popupId) === true;
}
