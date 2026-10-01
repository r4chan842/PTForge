const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const files = ["README"].concat(
    fs.readdirSync(path.join(root, "i18n")).filter((f) => /^README\.[a-zA-Z-]+$/.test(f)).map((f) => "i18n/" + f)
);

function targets(text) {
    const out = [];
    const re = /\(((?:i18n\/)?README[^)\s]*)\)|(?:^|\s)((?:docs|i18n|examples|templates|plugins)\/[\w./-]+\w|LICENSE|README)(?![\w/])/gm;
    let m;
    while ((m = re.exec(text))) out.push(m[1] || m[2]);
    return out.filter((t) => !/^(https?:|mailto:|#)/.test(t)).map((t) => t.split("#")[0]);
}

test("translations exist for every language in the bar", () => {
    assert.ok(files.length >= 11);
});

for (const file of files) {
    test("relative links resolve in " + file, () => {
        const dir = root;
        const missing = targets(fs.readFileSync(path.join(root, file), "utf8"))
            .filter((t) => !fs.existsSync(path.join(dir, decodeURIComponent(t))));
        assert.deepStrictEqual(missing, []);
    });
}
