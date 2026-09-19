#!/usr/bin/env python3
"""
build.py: bundle the split source into single-file output.

The site runs perfectly from source (index.html + ja/ + assets/) on any static
host. This script exists for the two cases where one self-contained file is
easier:

    dist/index.html     complete standalone English page
    dist/ja/index.html  the same for Japanese
    dist/artifact.html  the English page in Claude Artifact format (no
                        <!doctype>, <html>, <head> or <body> wrapper; those
                        are added at publish time)

    python3 tools/build.py

Bundling is a plain concatenation: CSS in cascade order, then the ES modules in
dependency order with their import/export keywords stripped. That works because
every exported name across the modules is unique. If you add a module, add it
to JS_ORDER below in dependency order or it is silently left out.

Note the DOMContentLoaded wrapper in bundle_js(). The source page loads main.js
as <script type="module" defer>, which runs after parsing; inlining it into
<head> as a classic script would otherwise run it while <body> is still empty,
and every getElementById in main.js would come back null.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

# One compiled Tailwind stylesheet. Run `npm run css` first: this inlines
# whatever assets/css/app.css currently holds.
CSS_ORDER = ["app.css"]
JS_ORDER = [
    "motion.js",
    "theme.js",
    "blossom.js",
    "petal-field.js",
    "reveal.js",
    "nav.js",
    "forms.js",
    "main.js",
]

# source page -> output path, relative to ROOT and DIST respectively
PAGES = [
    ("index.html", "index.html"),
    ("ja/index.html", "ja/index.html"),
]

# Matches the stylesheet block and the module tag on either page, whose asset
# paths differ only by the ../ prefix used from ja/.
CSS_BLOCK = re.compile(
    r'<!-- One compiled stylesheet.*?<link rel="stylesheet" href="(?:\.\./)?assets/css/app\.css">',
    re.S,
)
JS_TAG = re.compile(
    r'<script type="module" src="(?:\.\./)?assets/js/main\.js"[^>]*></script>'
)


def bundle_css():
    parts = []
    for name in CSS_ORDER:
        text = (ROOT / "assets" / "css" / name).read_text(encoding="utf-8")
        parts.append(f"/* ===== {name} ===== */\n{text.strip()}")
    return "\n\n".join(parts)


def bundle_js():
    parts = []
    for name in JS_ORDER:
        text = (ROOT / "assets" / "js" / name).read_text(encoding="utf-8")
        text = re.sub(r"^import\s.*?;\s*$", "", text, flags=re.M)   # drop imports
        text = re.sub(r"^export\s+", "", text, flags=re.M)          # unwrap exports
        parts.append(f"/* ===== {name} ===== */\n{text.strip()}")
    body = "\n\n".join(parts)
    # Stand in for module-defer timing. See the note in the module docstring.
    return (
        'document.addEventListener("DOMContentLoaded", function(){\n'
        '"use strict";\n\n'
        f"{body}\n\n"
        "});"
    )


def build_page(src_name, out_name, css, js):
    html = (ROOT / src_name).read_text(encoding="utf-8")

    html, n = CSS_BLOCK.subn("<style>\n" + css + "\n</style>", html)
    if n != 1:
        sys.exit(f"build failed: stylesheet links not found in {src_name}")

    html, n = JS_TAG.subn("<script>\n" + js + "\n</script>", html)
    if n != 1:
        sys.exit(f"build failed: module script tag not found in {src_name}")

    # The language switch points at directories that only exist in the source
    # tree; in dist the pages sit beside each other as files.
    if out_name == "index.html":
        html = html.replace('href="ja/"', 'href="ja/index.html"')
    else:
        html = html.replace('href="../"', 'href="../index.html"')

    out = DIST / out_name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    return html


def build():
    css, js = bundle_css(), bundle_js()

    DIST.mkdir(exist_ok=True)
    english = None
    for src_name, out_name in PAGES:
        html = build_page(src_name, out_name, css, js)
        if out_name == "index.html":
            english = html

    # Artifact format: strip the document wrapper, keep everything inside it.
    artifact = re.sub(r"^.*?<head>\s*", "", english, flags=re.S)
    artifact = artifact.replace("</head>\n<body>", "").replace("</body>\n</html>", "")
    artifact = re.sub(r'<meta charset="utf-8">\s*|<meta name="viewport"[^>]*>\s*', "", artifact)
    (DIST / "artifact.html").write_text(artifact.strip() + "\n", encoding="utf-8")

    for name in ("index.html", "ja/index.html", "artifact.html"):
        print(f"  wrote dist/{name}  ({(DIST / name).stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
