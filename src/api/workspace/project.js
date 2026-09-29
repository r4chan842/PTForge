function newProject(confirm) {
    return appWindow().fileNew(confirm === true) === true;
}

function saveProject() {
    return appWindow().fileSave() === true;
}

function saveProjectAs(path) {
    appWindow().fileSaveAsNoPrompt(String(requireValue(path, "path")), false);
    return true;
}

function openProject(path) {
    return appWindow().fileOpen(String(requireValue(path, "path")));
}

function getDefaultSaveFolder() {
    return String(appWindow().getDefaultFileSaveLocation());
}
