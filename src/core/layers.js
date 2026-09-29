var drawingLayer = null;

function currentLayer() {
    if (drawingLayer === null) {
        drawingLayer = logicalWorkspace().getUnusedLayer();
    }
    return drawingLayer;
}

function useLayer(layer) {
    drawingLayer = layer;
    return drawingLayer;
}

function newLayer() {
    drawingLayer = logicalWorkspace().getUnusedLayer();
    return drawingLayer;
}

function layerOrCurrent(layer) {
    return layer === undefined || layer === null ? currentLayer() : layer;
}
