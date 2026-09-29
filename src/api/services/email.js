function emailServer(deviceName) {
    return getProcessOf(deviceName, "EmailServer");
}

function addEmailUser(deviceName, username, password) {
    return emailServer(deviceName).addUser(username, password) === true;
}

function addEmailUsers(deviceName, users) {
    var entries = Object.keys(users).map(function (name) {
        return name + ":" + users[name] + ";";
    }).join("");
    emailServer(deviceName).updateAllAccounts(entries);
    return true;
}

function removeEmailUser(deviceName, username) {
    return emailServer(deviceName).deleteUser(username) === true;
}

function setEmailPassword(deviceName, username, password) {
    emailServer(deviceName).changePassword(username, password);
    return true;
}
