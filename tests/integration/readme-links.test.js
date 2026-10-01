const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..", "..");
const base = /https:\/\/github\.com\/r4chan842\/PTForge\/(?:blob|tree)\/main\/([\w./-]*[\w/])/g;
const files = execSync("git ls-files", { cwd: root }).toString().split("\n").filter((f) => f && !f.includes(".") && !f.startsWith("tools/") || f.endsWith(".md"));

test("README exists as plain text", () => {
    assert.ok(fs.existsSync(path.join(root, "README")));
});

for (const file of files) {
    test("repository links resolve in " + file, () => {
        const text = fs.readFileSync(path.join(root, file), "utf8");
        const missing = [...text.matchAll(base)].map((m) => m[1]).filter((t) => !fs.existsSync(path.join(root, t)));
        assert.deepStrictEqual(missing, []);
    });
}
