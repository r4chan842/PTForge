function removeItem(itemId) {
    if (Array.isArray(itemId)) {
        return itemId.map(removeItem).every(Boolean);
    }
    return logicalWorkspace().removeCanvasItem(itemId) === true;
}

function moveItem(itemId, dx, dy) {
    toList(itemId).forEach(function (id) {
        logicalWorkspace().moveCanvasItemBy(id, Math.round(dx), Math.round(dy));
    });
    return true;
}

function setItemPosition(itemId, x, y) {
    var workspace = logicalWorkspace();
    workspace.setCanvasItemX(itemId, Math.round(x));
    workspace.setCanvasItemY(itemId, Math.round(y));
    return true;
}

function getItemPosition(itemId) {
    var workspace = logicalWorkspace();
    return { x: workspace.getCanvasItemX(itemId), y: workspace.getCanvasItemY(itemId) };
}

function getCanvasItems() {
    var workspace = logicalWorkspace();
    return {
        notes: toArray(workspace.getCanvasNoteIds()),
        lines: toArray(workspace.getCanvasLineIds()),
        rects: toArray(workspace.getCanvasRectIds()),
        ellipses: toArray(workspace.getCanvasEllipseIds()),
        polygons: toArray(workspace.getCanvasPolygonIds())
    };
}

function getLineData(lineId) {
    var data = toArray(logicalWorkspace().getLineItemData(lineId));
    return { x1: +data[0], y1: +data[1], x2: +data[2], y2: +data[3], color: String(data[4] || "") };
}

function getRectData(rectId) {
    var data = toArray(logicalWorkspace().getRectItemData(rectId));
    return {
        x1: +data[0], y1: +data[1], x2: +data[2], y2: +data[3],
        fill: String(data[4] || ""), border: String(data[5] || ""), text: String(data[6] || "")
    };
}

function getEllipseData(ellipseId) {
    return toArray(logicalWorkspace().getEllipseItemData(ellipseId)).map(String);
}

function getPolygonData(polygonId) {
    return toArray(logicalWorkspace().getPolygonItemData(polygonId)).map(String);
}

function clearLayer(layer) {
    return logicalWorkspace().clearLayer(layerOrCurrent(layer)) === true;
}

function clearCanvas() {
    var items = getCanvasItems();
    var all = [].concat(items.notes, items.lines, items.rects, items.ellipses, items.polygons);
    all.forEach(function (id) {
        logicalWorkspace().removeCanvasItem(id);
    });
    return all.length;
}
