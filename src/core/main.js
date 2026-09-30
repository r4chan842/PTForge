function Extension() {
    this.menuUuid = "";
    this.editor = new EditorWindow();
}

Extension.prototype.init = function () {
    var menu = ipc.appWindow().getMenuBar().getExtensionsPopupMenu();
    this.menuUuid = menu.insertItem("", "PTForge Editor");
    menu.getMenuItemByUuid(this.menuUuid).registerEvent("onClicked", this, this.onMenuClicked);
};

Extension.prototype.cleanUp = function () {
    if (this.menuUuid === "") {
        return;
    }
    var menu = ipc.appWindow().getMenuBar().getExtensionsPopupMenu();
    _ScriptModule.unregisterIpcEventByID("MenuItem", this.menuUuid, "onClicked", this, this.onMenuClicked);
    menu.removeItemUuid(this.menuUuid);
    this.menuUuid = "";
};

Extension.prototype.onMenuClicked = function () {
    this.editor.show();
};

var extension = null;

function main() {
    extension = new Extension();
    extension.init();
    try {
        loadEnabledPlugins();
    } catch (error) {
        console.log("Plugins were not loaded: " + (error && error.message ? error.message : error));
    }
}

function cleanUp() {
    if (extension) {
        extension.cleanUp();
    }
}
