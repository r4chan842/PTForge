function drawLine(x1, y1, x2, y2, color, width, layer) {
    var rgb = toRgb(color);
    return logicalWorkspace().drawLine(
        Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2),
        layerOrCurrent(layer),
        width || 2,
        rgb[0], rgb[1], rgb[2]
    );
}

function drawCircle(cx, cy, radius, color, layer) {
    var rgb = toRgb(color);
    return logicalWorkspace().drawCircle(
        Math.round(cx), Math.round(cy),
        layerOrCurrent(layer),
        Math.round(radius),
        rgb[0], rgb[1], rgb[2]
    );
}

function drawRect(x, y, width, height, color, lineWidth, layer) {
    var right = x + width;
    var bottom = y + height;
    return [
        drawLine(x, y, right, y, color, lineWidth, layer),
        drawLine(right, y, right, bottom, color, lineWidth, layer),
        drawLine(right, bottom, x, bottom, color, lineWidth, layer),
        drawLine(x, bottom, x, y, color, lineWidth, layer)
    ];
}

function drawPolyline(points, color, width, closed, layer) {
    var ids = [];
    for (var i = 0; i < points.length - 1; i++) {
        ids.push(drawLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], color, width, layer));
    }
    if (closed && points.length > 2) {
        var last = points[points.length - 1];
        ids.push(drawLine(last[0], last[1], points[0][0], points[0][1], color, width, layer));
    }
    return ids;
}

function drawDashedLine(x1, y1, x2, y2, color, width, dash, layer) {
    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    var step = dash || 12;
    var count = Math.max(1, Math.floor(length / step));
    var ids = [];
    for (var i = 0; i < count; i += 2) {
        var from = i / count;
        var to = Math.min(1, (i + 1) / count);
        ids.push(drawLine(
            x1 + (x2 - x1) * from, y1 + (y2 - y1) * from,
            x1 + (x2 - x1) * to, y1 + (y2 - y1) * to,
            color, width, layer
        ));
    }
    return ids;
}

function drawZone(x, y, width, height, label, color, lineWidth) {
    var ids = drawRect(x, y, width, height, color, lineWidth || 3);
    if (label) {
        ids.push(addNote(x + 10, y + 10, label));
    }
    return ids;
}

function drawZoneAround(deviceNames, label, color, padding) {
    var pad = isDefined(padding) ? padding : 40;
    var positions = toList(deviceNames).map(getDevicePosition);
    if (!positions.length) {
        throw new Error("drawZoneAround needs at least one device");
    }
    var left = Math.min.apply(null, positions.map(function (p) { return p.x; })) - pad;
    var top = Math.min.apply(null, positions.map(function (p) { return p.y; })) - pad;
    var right = Math.max.apply(null, positions.map(function (p) { return p.x + 2 * (p.centerX - p.x); })) + pad;
    var bottom = Math.max.apply(null, positions.map(function (p) { return p.y + 2 * (p.centerY - p.y); })) + pad;
    return drawZone(left, top, right - left, bottom - top, label, color);
}

function drawArrow(x1, y1, x2, y2, color, width, layer) {
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var head = 14;
    return [
        drawLine(x1, y1, x2, y2, color, width, layer),
        drawLine(x2, y2, x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7), color, width, layer),
        drawLine(x2, y2, x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7), color, width, layer)
    ];
}
