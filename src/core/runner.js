var appName = "PTForge";

function editorView() {
    if (typeof extension === "undefined" || !extension || !extension.editor) {
        return null;
    }
    var editor = extension.editor;
    if (!editor.webview || editor.webviewId === "") {
        return null;
    }
    return editor.webview;
}

function notifyEditor(kind, text) {
    var view = editorView();
    if (!view || typeof view.evaluateJavaScriptAsync !== "function") {
        return false;
    }
    try {
        var payload = JSON.stringify({ kind: kind, text: String(text) }).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        view.evaluateJavaScriptAsync("window.receiveOutput && window.receiveOutput(" + payload + ");");
        return true;
    } catch (error) {
        return false;
    }
}

function messageBox(title, text) {
    ipc.appWindow().showMessageBox(appName + " ".repeat(100), title, String(text), 3, 0x00000400, 0x00000400, 0x00000400);
}

function runCode(encodedScript) {
    var scriptText;
    var compiled;
    var started = new Date().getTime();

    try {
        scriptText = decodeURIComponent(encodedScript);
    } catch (error) {
        scriptText = String(encodedScript);
    }

    try {
        compiled = new Function(scriptText);
    } catch (error) {
        showError("Syntax error", error);
        return false;
    }

    try {
        compiled();
        notifyEditor("done", "Finished in " + (new Date().getTime() - started) + " ms");
        return true;
    } catch (error) {
        var line = error && error.lineNumber ? " on line " + error.lineNumber : "";
        showError("Runtime error" + line, error);
        return false;
    }
}

function showError(title, error) {
    var message = error && error.message ? error.message : String(error);
    console.log(title + ": " + message);
    if (!notifyEditor("error", title + ": " + message)) {
        messageBox(title + ":", message);
    }
}

function formatValue(value) {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function showMessage(text) {
    messageBox("Message:", text);
}

function showResult(value) {
    var text = formatValue(value);
    console.log(text);
    if (shellOutput("result", text)) {
        return value;
    }
    if (!notifyEditor("result", text)) {
        showMessage(text);
    }
    return value;
}

function log(value) {
    var text = formatValue(value);
    console.log(text);
    if (!shellOutput("log", text)) {
        notifyEditor("log", text);
    }
    return value;
}
