import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
icon = (root / "assets/brand/icon-dark.svg").read_text()
paths = re.findall(r'<path fill-rule="evenodd" fill="([^"]+)" d="([^"]+)"/>', icon)
font = "Segoe UI, Helvetica, Arial, sans-serif"
mono = "Cascadia Code, Consolas, Menlo, monospace"

def mark(x, y, size):
    scale = size / 651.1
    body = "".join('<path fill-rule="evenodd" fill="%s" d="%s"/>' % (c, d) for c, d in paths)
    return '<g transform="translate(%s %s) scale(%.5f) translate(-303.6 -208.3)" opacity=".95">%s</g>' % (x, y, scale, body)

def code_lines(lines, x, y):
    out = []
    for i, parts in enumerate(lines):
        spans = "".join('<tspan fill="%s">%s</tspan>' % (c, t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")) for c, t in parts)
        out.append('<text x="%d" y="%d" font-family="%s" font-size="15" xml:space="preserve">%s</text>' % (x, y + i * 24, mono, spans))
    return "".join(out)

def banner(name, title, sub, lines):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 220" width="1200" height="220" role="img" aria-label="{title}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F1F1F"/><stop offset="1" stop-color="#141414"/></linearGradient>
<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#2B2B2B" stroke-width="1"/></pattern></defs>
<rect width="1200" height="220" rx="16" fill="url(#bg)"/>
<rect width="1200" height="220" rx="16" fill="url(#grid)" opacity=".55"/>
<rect x="0.5" y="0.5" width="1199" height="219" rx="16" fill="none" stroke="#2B2B2B"/>
<rect x="56" y="60" width="5" height="100" rx="2.5" fill="#0078D4"/>
<text x="82" y="104" font-family="{font}" font-size="42" font-weight="700" fill="#FFFFFF">{title}</text>
<text x="84" y="138" font-family="{font}" font-size="19" fill="#9D9D9D">{sub[0]}</text>
<text x="84" y="164" font-family="{font}" font-size="19" fill="#9D9D9D">{sub[1]}</text>
<rect x="660" y="34" width="400" height="152" rx="8" fill="#181818" stroke="#2B2B2B"/>
<circle cx="680" cy="52" r="4.5" fill="#F85149"/><circle cx="696" cy="52" r="4.5" fill="#E5E510" opacity=".8"/><circle cx="712" cy="52" r="4.5" fill="#2EA043"/>
{code_lines(lines, 680, 86)}
{mark(1082, 70, 84)}
</svg>
'''
    (root / "assets/banners" / (name + ".svg")).write_text(svg)

K, F, S, V, N, C, D, G, R, W = "#569CD6", "#DCDCAA", "#CE9178", "#9CDCFE", "#B5CEA8", "#6A9955", "#CCCCCC", "#23D18B", "#F14C4C", "#29B8DB"
banner("editor", "A real code editor", ("Tabs, IntelliSense, problems, find and replace,", "standard highlighting and files on disk."), [
    [(C, "// VLAN lab with router on a stick")],
    [(F, "createVlans"), (D, "("), (S, '"S1"'), (D, ", { "), (N, "10"), (D, ": "), (S, '"SALES"'), (D, " });")],
    [(F, "setTrunkPort"), (D, "("), (S, '"S1"'), (D, ", "), (S, '"Gi0/1"'), (D, ", ["), (N, "10"), (D, "]);")],
    [(F, "endChecks"), (D, "();")]])
banner("terminal", "JavaScript terminal", ("Run code against the open topology line by line,", "with history, Tab completion and dot commands."), [
    [(W, "ptforge"), (D, ":"), (K, "js"), (D, "> "), (F, "getDevices"), (D, "().length")],
    [(N, "5")],
    [(W, "ptforge"), (D, ":"), (K, "js"), (D, "> "), (D, ".calc 10.0.12.1/30")],
    [(D, "  network   "), (G, "10.0.12.0/30")]])
banner("debugger", "JavaScript debugger", ("Breakpoints, step over, into, out and back,", "variables, watch, call stack and a debug console."), [
    [(R, "\u25cf "), (K, "var "), (V, "info"), (D, " = "), (F, "getDeviceInfo"), (D, "("), (V, "name"), (D, ");")],
    [(V, "  name"), (D, ": "), (S, "'R1'")],
    [(V, "  total + 1"), (D, ": "), (N, "1")],
    [(D, "  portCount  "), (C, "ports.js 6")]])
banner("lab-check", "Lab Check and audit", ("Grade a lab with points and hints, and find", "duplicate IPs, subnet mismatches and down links."), [
    [(G, "\u2714 "), (D, "VLAN 10 exists on S1"), (C, "   2 pts")],
    [(G, "\u2714 "), (D, "R1 is cabled to S1"), (C, "     1 pt")],
    [(R, "\u2716 "), (D, "PC2 has an address"), (C, "     found 0.0.0.0")],
    [(D, "Score "), (N, "5 / 6"), (D, "  83%")]])
banner("plugins", "Plugins", ("Add dot-commands, functions, audit rules and checks", "from .pf files, with consent and permissions."), [
    [(D, "---")],
    [(D, "{ "), (V, '"id"'), (D, ": "), (S, '"port-map"'), (D, ", "), (V, '"permissions"'), (D, ": [] }")],
    [(D, "---")],
    [(F, "plugin"), (D, "."), (F, "command"), (D, "("), (S, '"ports"'), (D, ", "), (K, "function"), (D, " (args) { ... });")]])
banner("network-tools", "Network tools", ("Reachability matrix, snapshots and config diff,", "plus an IPv4 and IPv6 subnet calculator."), [
    [(D, "R1 \u2192 10.0.0.20   "), (R, "0%")],
    [(D, "R2 \u2192 10.0.0.10   "), (F, "80%")],
    [(D, "R2 \u2192 10.0.12.1   "), (G, "100%")],
    [(G, "+ "), (D, "interface GigabitEthernet0/0")]])
