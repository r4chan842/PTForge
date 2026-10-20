var commandStatusNames = ["ok", "ambiguous", "invalid", "incomplete", "notImplemented"];

var commandStatusCodes = {
    ok: 0,
    ambiguous: 1,
    invalid: 2,
    incomplete: 3,
    notimplemented: 4
};

var commandStatusHints = {
    ambiguous: "Packet Tracer needs a longer form of the command",
    invalid: "Packet Tracer does not know this command",
    incomplete: "the command is missing a keyword or a value",
    notimplemented: "the command exists in IOS but Packet Tracer does not run it"
};

var cliModes = ["user", "enable", "global", ""];

var cliModeAliases = {
    "": "",
    user: "user",
    "user exec": "user",
    exec: "user",
    enable: "enable",
    "privileged exec": "enable",
    privileged: "enable",
    global: "global",
    configure: "global",
    config: "global",
    "global config": "global"
};
