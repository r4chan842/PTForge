function setHttpService(deviceName, enabled) {
    getProcessOf(deviceName, "HttpServer").setEnable(enabled !== false);
    return true;
}

function setHttpsService(deviceName, enabled) {
    getProcessOf(deviceName, "HttpsServer").setEnable(enabled !== false);
    return true;
}

function setWebPage(deviceName, fileName, html) {
    getProcessOf(deviceName, "HttpServer").setPageContents(fileName, String(html));
    return true;
}

function getWebPage(deviceName, fileName) {
    return String(getProcessOf(deviceName, "HttpServer").getPage(fileName));
}
