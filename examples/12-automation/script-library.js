var folder = getDefaultSaveFolder() + "/ptforge-scripts";
if (!folderExists(folder)) {
    makeFolder(folder);
}

writeTextFile(folder + "/core.js", [
    "addDevice(\"CORE\", \"2911\", 300, 80);",
    "basicSetup(\"CORE\", { secret: \"class\" });"
].join("\n"));

runScriptFile(folder + "/core.js");
log("Loaded core.js, devices: " + getDevices().join(", "));
