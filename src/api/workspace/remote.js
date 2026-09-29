function addRemoteNetwork(x, y) {
    var name = String(logicalWorkspace().addRemoteNetwork());
    if (name && isDefined(x) && isDefined(y)) {
        logicalWorkspace().moveRemoteNetwork(name, x, y);
    }
    return name;
}

function removeRemoteNetwork(name) {
    return logicalWorkspace().removeRemoteNetwork(name) === true;
}

function moveRemoteNetwork(name, x, y) {
    return logicalWorkspace().moveRemoteNetwork(name, x, y) === true;
}
