function ftpAccounts(deviceName) {
    return getProcessOf(deviceName, "FtpServer").getFtpUserAccountManager();
}

function addFtpUser(deviceName, username, password, permissions) {
    var perms = String(permissions || "RWNLD").toUpperCase();
    if (!/^[RWNLD]+$/.test(perms)) {
        throw new Error("FTP permissions use the letters R W N L D");
    }
    var accounts = ftpAccounts(deviceName);
    if (accounts.isExistingUser(username)) {
        accounts.removeFtpUser(username);
    }
    accounts.addFtpUser(username, password, perms);
    return true;
}

function removeFtpUser(deviceName, username) {
    ftpAccounts(deviceName).removeFtpUser(username);
    return true;
}

function getFtpUsers(deviceName) {
    var accounts = ftpAccounts(deviceName);
    var users = [];
    for (var i = 0; i < accounts.getUsersCount(); i++) {
        users.push({ username: String(accounts.getUsernameAt(i)), permissions: String(accounts.getPermissionAt(i)) });
    }
    return users;
}
