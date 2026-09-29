var scriptSlots = 3;
var currentSlot = 1;
var fontSize = 13;
var inPacketTracer = typeof $se === "function";

var snippets = [
    {
        name: "Small LAN",
        info: "Router, switch and four PCs with addresses",
        code: "addDevice(\"R1\", \"2911\", 300, 80);\nbuildLan({ switchName: \"S1\", hosts: 4, network: \"192.168.1.0/24\", x: 300, y: 230 });\naddLink(\"R1\", \"GigabitEthernet0/0\", \"S1\", \"GigabitEthernet0/1\", \"straight\");\nsetInterfaceIp(\"R1\", \"GigabitEthernet0/0\", \"192.168.1.1/24\");\nlabelAllDevices();\n"
    },
    {
        name: "Device hardening",
        info: "Hostname, passwords, banner and SSH",
        code: "basicSetup(\"R1\", { secret: \"class\", consolePassword: \"cisco\", banner: \"Authorized access only\" });\nconfigureSsh(\"R1\", { domain: \"lab.local\", username: \"admin\", password: \"Adm1n!Pass\" });\n"
    },
    {
        name: "VLANs and trunk",
        info: "VLANs, access ports and an uplink trunk",
        code: "createVlans(\"S1\", { 10: \"SALES\", 20: \"IT\", 99: \"MGMT\" });\nassignPorts(\"S1\", { 10: [\"FastEthernet0/1\", \"FastEthernet0/2\"], 20: [\"FastEthernet0/3\"] }, { portfast: true });\nsetTrunkPort(\"S1\", \"GigabitEthernet0/1\", [10, 20, 99], 99);\n"
    },
    {
        name: "Router on a stick",
        info: "Subinterfaces for inter VLAN routing",
        code: "routerOnAStick(\"R1\", \"GigabitEthernet0/0\", {\n    10: \"192.168.10.1/24\",\n    20: \"192.168.20.1/24\"\n});\n"
    },
    {
        name: "OSPF",
        info: "Single area OSPF with a passive LAN",
        code: "configureOspf(\"R1\", {\n    routerId: \"1.1.1.1\",\n    networks: [\"10.0.0.0/30\", \"192.168.1.0/24\"],\n    passive: \"GigabitEthernet0/1\"\n});\n"
    },
    {
        name: "Router DHCP",
        info: "Pool with excluded addresses",
        code: "addRouterDhcpPool(\"R1\", {\n    name: \"LAN\",\n    network: \"192.168.1.0/24\",\n    gateway: \"192.168.1.1\",\n    dns: \"8.8.8.8\",\n    excluded: [[\"192.168.1.1\", \"192.168.1.20\"]]\n});\n"
    },
    {
        name: "Server services",
        info: "DHCP, DNS and web on Server-PT",
        code: "addDhcpPool(\"SRV\", { name: \"LAN\", start: \"192.168.1.100\", mask: 24, gateway: \"192.168.1.1\", dns: \"192.168.1.10\" });\naddDnsRecord(\"SRV\", \"www.lab.local\", \"192.168.1.10\");\nsetHttpService(\"SRV\", true);\n"
    },
    {
        name: "Extended ACL",
        info: "Allow web to a server, deny the rest",
        code: "createExtendedAcl(\"R1\", \"WEB\", [\n    { protocol: \"tcp\", source: \"any\", destination: \"10.0.0.10\", port: 80 },\n    { action: \"deny\", source: \"any\", destination: \"any\" }\n]);\napplyAcl(\"R1\", \"GigabitEthernet0/1\", \"WEB\", \"in\");\n"
    },
    {
        name: "PAT",
        info: "Internet access for a LAN",
        code: "configurePat(\"R1\", {\n    inside: \"GigabitEthernet0/0\",\n    outside: \"GigabitEthernet0/1\",\n    networks: \"192.168.1.0/24\"\n});\n"
    },
    {
        name: "Inspect switch",
        info: "VLANs, trunk state and port security",
        code: "log(getVlans(\"S1\"));\nlog(getSwitchportTable(\"S1\"));\nlog(findSecurityViolations(\"S1\"));\n"
    },
    {
        name: "Document topology",
        info: "Zone, labels and IP notes",
        code: "drawZoneAround(getDevices([\"pc\", \"switch\"]), \"Users\", \"green\");\ngetDevices(\"pc\").forEach(function (pc) {\n    labelWithIp(pc, \"FastEthernet0\");\n});\n"
    }
];

function editor() {
    return document.getElementById("editor");
}

function slotKey(slot) {
    return slot === 1 ? "code" : "code" + slot;
}

function storeData(key, value) {
    if (typeof $putData === "function") {
        $putData(key, value);
    } else {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            return;
        }
    }
}

function readData(key, callback) {
    if (typeof $getData === "function") {
        $getData(key).then(function (value) {
            callback(value || "");
        });
        return;
    }
    var value = "";
    try {
        value = window.localStorage.getItem(key) || "";
    } catch (error) {
        value = "";
    }
    callback(value);
}

function setStatus(text) {
    document.getElementById("status").textContent = text;
}

function timeNow() {
    var d = new Date();
    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }
    return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
}

function addOutput(kind, text) {
    var body = document.getElementById("output");
    var row = document.createElement("div");
    row.className = "entry " + kind;
    var time = document.createElement("time");
    time.textContent = timeNow();
    var pre = document.createElement("pre");
    pre.textContent = text;
    row.appendChild(time);
    row.appendChild(pre);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
}

function receiveOutput(message) {
    addOutput(message.kind, message.text);
    if (message.kind === "error") {
        setStatus("Failed");
    }
    if (message.kind === "done") {
        setStatus("Done");
    }
}

function clearOutput() {
    document.getElementById("output").innerHTML = "";
}

function selectedText() {
    var area = editor();
    return area.value.substring(area.selectionStart, area.selectionEnd);
}

function runText(code, label) {
    saveCode();
    if (!code.trim()) {
        setStatus("Nothing to run");
        return;
    }
    addOutput("info", "Running " + label + " (" + code.split("\n").length + " lines)");
    setStatus("Running...");
    if (inPacketTracer) {
        $se("runCode", encodeURIComponent(code));
    } else {
        addOutput("error", "Open this editor from Packet Tracer to run scripts");
    }
}

function executeCode() {
    runText(editor().value, "script " + currentSlot);
}

function executeSelection() {
    var code = selectedText();
    if (code) {
        runText(code, "selection");
    } else {
        executeCode();
    }
}

function copyToClipboard() {
    var area = editor();
    area.select();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(area.value);
    } else {
        document.execCommand("copy");
    }
    setStatus("Copied");
}

function pasteFromClipboard() {
    if (!navigator.clipboard) {
        setStatus("Clipboard is not available, use Ctrl+V");
        return;
    }
    navigator.clipboard.readText().then(function (text) {
        editor().value = text;
        refreshEditor();
        saveCode();
        setStatus("Pasted");
    });
}

function clearEditor() {
    editor().value = "";
    refreshEditor();
    saveCode();
    setStatus("Cleared");
}

function saveCode() {
    storeData(slotKey(currentSlot), editor().value);
}

function loadSlot(slot) {
    saveCode();
    currentSlot = slot;
    readData(slotKey(slot), function (code) {
        editor().value = code;
        refreshEditor();
        renderTabs();
        editor().focus();
    });
}

function renderTabs() {
    var box = document.getElementById("tabs");
    box.innerHTML = "";
    for (var i = 1; i <= scriptSlots; i++) {
        var tab = document.createElement("button");
        tab.className = "tab" + (i === currentSlot ? " active" : "");
        tab.textContent = "Script " + i;
        tab.onclick = (function (slot) {
            return function () {
                loadSlot(slot);
            };
        })(i);
        box.appendChild(tab);
    }
}

function refreshGutter() {
    var lines = editor().value.split("\n").length;
    var numbers = [];
    for (var i = 1; i <= lines; i++) {
        numbers.push(i);
    }
    var gutter = document.getElementById("gutter");
    gutter.textContent = numbers.join("\n");
    gutter.scrollTop = editor().scrollTop;
    document.getElementById("length").textContent = lines + (lines === 1 ? " line" : " lines");
}

function refreshPosition() {
    var area = editor();
    var before = area.value.substring(0, area.selectionStart).split("\n");
    document.getElementById("position").textContent = "Ln " + before.length + ", Col " + (before[before.length - 1].length + 1);
}

function refreshEditor() {
    refreshGutter();
    refreshPosition();
}

function insertText(text) {
    var area = editor();
    var start = area.selectionStart;
    area.value = area.value.substring(0, start) + text + area.value.substring(area.selectionEnd);
    area.selectionStart = area.selectionEnd = start + text.length;
    area.focus();
    refreshEditor();
    saveCode();
}

function lineStart(value, index) {
    return value.lastIndexOf("\n", index - 1) + 1;
}

function indentSelection(outdent) {
    var area = editor();
    var value = area.value;
    var start = lineStart(value, area.selectionStart);
    var end = area.selectionEnd;
    var block = value.substring(start, end);
    var changed = outdent ? block.replace(/^ {1,4}/gm, "") : block.replace(/^/gm, "    ");
    area.value = value.substring(0, start) + changed + value.substring(end);
    area.selectionStart = start;
    area.selectionEnd = start + changed.length;
}

function handleKeys(event) {
    var area = editor();
    if (event.key === "Enter" && event.ctrlKey) {
        event.preventDefault();
        if (event.shiftKey) {
            executeSelection();
        } else {
            executeCode();
        }
        return;
    }
    if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        saveCode();
        setStatus("Saved");
        return;
    }
    if (event.key === "Tab") {
        event.preventDefault();
        if (area.selectionStart !== area.selectionEnd || event.shiftKey) {
            indentSelection(event.shiftKey);
            saveCode();
        } else {
            insertText("    ");
        }
        return;
    }
    if (event.key === "Enter") {
        event.preventDefault();
        var value = area.value;
        var current = value.substring(lineStart(value, area.selectionStart), area.selectionStart);
        var indent = current.match(/^\s*/)[0];
        if (/[{[(]\s*$/.test(current)) {
            indent += "    ";
        }
        insertText("\n" + indent);
    }
}

function showPanel(name) {
    var tabs = document.querySelectorAll(".side-tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].className = "side-tab" + (tabs[i].getAttribute("data-panel") === name ? " active" : "");
    }
    document.getElementById("panel-functions").className = "panel" + (name === "functions" ? "" : " hidden");
    document.getElementById("panel-snippets").className = "panel" + (name === "snippets" ? "" : " hidden");
}

function makeItem(title, args, info, onClick) {
    var item = document.createElement("div");
    item.className = "item";
    var name = document.createElement("div");
    name.className = "item-name";
    name.textContent = title;
    if (args !== null) {
        var span = document.createElement("span");
        span.className = "args";
        span.textContent = "(" + args + ")";
        name.appendChild(span);
    }
    var text = document.createElement("div");
    text.className = "item-info";
    text.textContent = info;
    item.appendChild(name);
    item.appendChild(text);
    item.onclick = onClick;
    return item;
}

function renderFunctions(filter) {
    var list = document.getElementById("function-list");
    var query = (filter || "").toLowerCase();
    var area = "";
    list.innerHTML = "";
    var catalog = typeof functionCatalog === "undefined" ? [] : functionCatalog;
    catalog.forEach(function (fn) {
        var haystack = (fn.name + " " + fn.info + " " + fn.area).toLowerCase();
        if (query && haystack.indexOf(query) === -1) {
            return;
        }
        if (fn.area !== area) {
            area = fn.area;
            var group = document.createElement("div");
            group.className = "group";
            group.textContent = area;
            list.appendChild(group);
        }
        list.appendChild(makeItem(fn.name, fn.args, fn.info, function () {
            insertText(fn.name + "(" + fn.args + ");");
        }));
    });
}

function renderSnippets() {
    var list = document.getElementById("snippet-list");
    snippets.forEach(function (snippet) {
        list.appendChild(makeItem(snippet.name, null, snippet.info, function () {
            insertText(snippet.code);
            setStatus("Inserted " + snippet.name);
        }));
    });
}

function changeFontSize(step) {
    fontSize = Math.max(10, Math.min(22, fontSize + step));
    document.documentElement.style.setProperty("--font-size", fontSize + "px");
    storeData("fontSize", String(fontSize));
}

function initEditor() {
    var area = editor();
    renderTabs();
    renderFunctions("");
    renderSnippets();
    readData("fontSize", function (value) {
        if (value) {
            fontSize = Number(value) || 13;
            changeFontSize(0);
        }
    });
    readData(slotKey(1), function (code) {
        area.value = code;
        refreshEditor();
    });
    area.addEventListener("keydown", handleKeys);
    area.addEventListener("input", function () {
        refreshEditor();
        saveCode();
    });
    area.addEventListener("scroll", function () {
        document.getElementById("gutter").scrollTop = area.scrollTop;
    });
    area.addEventListener("click", refreshPosition);
    area.addEventListener("keyup", refreshPosition);
    document.getElementById("search").addEventListener("input", function (event) {
        renderFunctions(event.target.value);
    });
    addOutput("info", "PTForge ready. " + (typeof functionCatalog === "undefined" ? 0 : functionCatalog.length) + " functions available.");
}
