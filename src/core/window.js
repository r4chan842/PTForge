function EditorWindow() {
    this.webview = null;
    this.webviewId = "";
}

EditorWindow.prototype.show = function () {
    if (webViewManager.getWebView(this.webviewId) == null) {
        this.webview = webViewManager.createWebView("PTForge", "this-sm:index.html", 1100, 720);
        this.webviewId = this.webview.getWebViewId();
        this.webview.registerEvent("closed", this, this.onClosed);
        this.webview.setMinimumWidth(760);
        this.webview.setMinimumHeight(460);
    }
    this.webview.hide();
    this.webview.show();
};

EditorWindow.prototype.onClosed = function () {
    this.webview.unregisterEvent("closed", this, this.onClosed);
    this.webviewId = "";
};
