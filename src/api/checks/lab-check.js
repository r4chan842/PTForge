var labCheckState = null;

function beginChecks(title) {
    labCheckState = { title: String(title || "Lab check"), items: [], started: new Date().getTime() };
    return true;
}

function currentChecks() {
    if (!labCheckState) {
        beginChecks("Lab check");
    }
    return labCheckState;
}

function evaluateValue(value) {
    if (typeof value !== "function") {
        return { value: value, error: "" };
    }
    try {
        return { value: value(), error: "" };
    } catch (error) {
        return { value: undefined, error: error && error.message ? error.message : String(error) };
    }
}

function recordCheck(name, passed, hint, points) {
    currentChecks().items.push({
        name: String(name),
        passed: passed,
        points: isDefined(points) ? Number(points) : 1,
        hint: passed ? "" : String(hint || "")
    });
    return passed;
}

function check(name, condition, hint, points) {
    var outcome = evaluateValue(condition);
    return recordCheck(name, !outcome.error && !!outcome.value, outcome.error || hint, points);
}

function checkEqual(name, actual, expected, points) {
    var outcome = evaluateValue(actual);
    if (outcome.error) {
        return recordCheck(name, false, outcome.error, points);
    }
    var same = JSON.stringify(outcome.value) === JSON.stringify(expected);
    return recordCheck(name, same, "expected " + JSON.stringify(expected) + ", got " + JSON.stringify(outcome.value), points);
}

function checkDeviceExists(deviceName, points) {
    return recordCheck("Device " + deviceName + " exists", deviceExists(deviceName), "add " + deviceName + " to the topology", points);
}

function checkLinked(deviceA, deviceB, points) {
    var linked = getLinks().some(function (link) {
        return link.from && ((link.from.device === deviceA && link.to.device === deviceB) || (link.from.device === deviceB && link.to.device === deviceA));
    });
    return recordCheck(deviceA + " is cabled to " + deviceB, linked, "connect " + deviceA + " and " + deviceB, points);
}

function checkIpAddress(deviceName, portName, ip, mask, points) {
    var outcome = evaluateValue(function () {
        return getPortInfo(deviceName, portName);
    });
    var name = deviceName + " " + portName + " has " + ip + (mask ? " " + mask : "");
    if (outcome.error) {
        return recordCheck(name, false, outcome.error, points);
    }
    var info = outcome.value;
    var passed = info.ip === String(ip) && (!mask || info.mask === normalizeMask(mask));
    return recordCheck(name, passed, "found " + info.ip + " " + info.mask, points);
}

function checkPortUp(deviceName, portName, points) {
    var outcome = evaluateValue(function () {
        return getPortInfo(deviceName, portName).up;
    });
    return recordCheck(deviceName + " " + portName + " is up", outcome.value === true, outcome.error || "the port is down or not cabled", points);
}

function checkHostname(deviceName, hostname, points) {
    var outcome = evaluateValue(function () {
        return getHostname(deviceName);
    });
    return recordCheck(deviceName + " hostname is " + hostname, outcome.value === String(hostname), outcome.error || "found " + outcome.value, points);
}

function checkVlan(deviceName, vlanId, points) {
    var outcome = evaluateValue(function () {
        return hasVlan(deviceName, vlanId);
    });
    return recordCheck("VLAN " + vlanId + " exists on " + deviceName, outcome.value === true, outcome.error || "create vlan " + vlanId, points);
}

function checkConfigContains(deviceName, text, points) {
    var outcome = evaluateValue(function () {
        return getRunningConfig(deviceName);
    });
    var found = !outcome.error && String(outcome.value).indexOf(String(text)) !== -1;
    return recordCheck(deviceName + " config contains \"" + text + "\"", found, outcome.error || "line not found in running-config", points);
}

function summarizeChecks(state) {
    var passed = 0;
    var score = 0;
    var maxScore = 0;
    state.items.forEach(function (item) {
        maxScore += item.points;
        if (item.passed) {
            passed++;
            score += item.points;
        }
    });
    return {
        title: state.title,
        total: state.items.length,
        passed: passed,
        failed: state.items.length - passed,
        score: score,
        maxScore: maxScore,
        percent: maxScore ? Math.round(score * 100 / maxScore) : 0,
        items: state.items.slice()
    };
}

function formatCheckReport(report) {
    var lines = [report.title + ": " + report.passed + "/" + report.total + " passed, score " + report.score + "/" + report.maxScore + " (" + report.percent + "%)"];
    report.items.forEach(function (item) {
        lines.push((item.passed ? "  PASS  " : "  FAIL  ") + item.name + (item.hint ? "  - " + item.hint : ""));
    });
    return lines.join("\n");
}

function endChecks() {
    var report = summarizeChecks(currentChecks());
    labCheckState = null;
    console.log(formatCheckReport(report));
    if (!notifyEditor("report", JSON.stringify(report))) {
        showMessage(formatCheckReport(report));
    }
    return report;
}

function runChecks(title, list) {
    beginChecks(title);
    toArray(list).forEach(function (entry) {
        check(entry.name, entry.test, entry.hint, entry.points);
    });
    return endChecks();
}
