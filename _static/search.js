(function () {
    var params = new URLSearchParams(location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("q");
    var list = document.getElementById("results");
    var summary = document.getElementById("summary");
    input.value = query;
    if (!query) {
        summary.textContent = "Enter one or more words.";
        return;
    }
    var words = query.toLowerCase().split(/\s+/);
    var hits = [];
    searchIndex.forEach(function (page) {
        var title = page.title.toLowerCase();
        var text = page.text.toLowerCase();
        var score = 0;
        for (var i = 0; i < words.length; i++) {
            var inTitle = title.indexOf(words[i]) >= 0;
            var inText = text.indexOf(words[i]) >= 0;
            var inName = page.names.indexOf(words[i]) >= 0;
            if (!inTitle && !inText && !inName) {
                return;
            }
            score += (inName ? 20 : 0) + (inTitle ? 10 : 0) + (inText ? 1 : 0);
        }
        hits.push({ page: page, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    summary.textContent = hits.length ? "Found " + hits.length + " page" + (hits.length === 1 ? "" : "s") + " matching the search query." :
        "Your search did not match any documents.";
    hits.forEach(function (hit) {
        var text = hit.page.text;
        var at = text.toLowerCase().indexOf(words[0]);
        var start = Math.max(0, at - 80);
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = hit.page.url;
        a.textContent = hit.page.title;
        var p = document.createElement("p");
        p.className = "context";
        p.textContent = (start > 0 ? "\u2026" : "") + text.substr(start, 220) + "\u2026";
        li.appendChild(a);
        li.appendChild(p);
        list.appendChild(li);
    });
})();
