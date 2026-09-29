function gridPositions(count, options) {
    var opts = options || {};
    var columns = opts.columns || Math.ceil(Math.sqrt(count));
    var startX = isDefined(opts.x) ? opts.x : 100;
    var startY = isDefined(opts.y) ? opts.y : 100;
    var gapX = opts.gapX || 120;
    var gapY = opts.gapY || 120;
    var positions = [];
    for (var i = 0; i < count; i++) {
        positions.push([startX + (i % columns) * gapX, startY + Math.floor(i / columns) * gapY]);
    }
    return positions;
}

function circlePositions(count, cx, cy, radius) {
    var positions = [];
    for (var i = 0; i < count; i++) {
        var angle = (2 * Math.PI * i) / count - Math.PI / 2;
        positions.push([Math.round(cx + radius * Math.cos(angle)), Math.round(cy + radius * Math.sin(angle))]);
    }
    return positions;
}

function rowPositions(count, y, startX, gap) {
    var positions = [];
    for (var i = 0; i < count; i++) {
        positions.push([(isDefined(startX) ? startX : 100) + i * (gap || 120), y]);
    }
    return positions;
}

function arrangeGrid(deviceNames, options) {
    var names = toList(deviceNames);
    gridPositions(names.length, options).forEach(function (position, index) {
        moveDevice(names[index], position[0], position[1]);
    });
    return names.length;
}

function arrangeCircle(deviceNames, cx, cy, radius) {
    var names = toList(deviceNames);
    circlePositions(names.length, cx, cy, radius).forEach(function (position, index) {
        moveDevice(names[index], position[0], position[1], true);
    });
    return names.length;
}
