var namedColors = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    gray: [128, 128, 128],
    red: [220, 53, 69],
    green: [40, 167, 69],
    blue: [13, 110, 253],
    yellow: [255, 193, 7],
    orange: [253, 126, 20],
    purple: [111, 66, 193],
    cyan: [13, 202, 240],
    pink: [214, 51, 132],
    teal: [32, 201, 151],
    navy: [0, 31, 84],
    brown: [121, 85, 72]
};

function clampChannel(value) {
    var number = Math.round(Number(value));
    if (isNaN(number)) {
        return 0;
    }
    return Math.max(0, Math.min(255, number));
}

function toRgb(color) {
    if (Array.isArray(color) && color.length >= 3) {
        return [clampChannel(color[0]), clampChannel(color[1]), clampChannel(color[2])];
    }
    if (typeof color === "string") {
        var key = color.trim().toLowerCase();
        if (namedColors[key]) {
            return namedColors[key].slice();
        }
        var hex = key.replace(/^#/, "");
        if (/^[0-9a-f]{3}$/.test(hex)) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        if (/^[0-9a-f]{6}$/.test(hex)) {
            return [
                parseInt(hex.substr(0, 2), 16),
                parseInt(hex.substr(2, 2), 16),
                parseInt(hex.substr(4, 2), 16)
            ];
        }
    }
    return namedColors.black.slice();
}
