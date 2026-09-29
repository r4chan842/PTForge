addDevice("R1", "2911", 200, 100);
addDevice("R2", "2911", 450, 100);
addDevice("S1", "2960-24TT", 325, 250);
basicSetup("R1", { secret: "class" });
basicSetup("R2", { secret: "class" });

var folder = getDefaultSaveFolder() + "/ptforge-backup";
var files = exportConfigs(folder);
exportTopology(folder + "/topology.json");
log("Saved " + files.length + " configs to " + folder);
