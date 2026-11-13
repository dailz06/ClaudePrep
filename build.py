"""Build a single self-contained practice page from the engine template + content files.

Usage:
    python build.py OUTPUT.html content1.js [content2.js ...] [--artifact]

--artifact  drop the <!doctype>/<html>/<head>/<body> wrapper (claude.ai Artifacts add
            their own). Without it you get a normal page you can open from disk.

The content files are concatenated in the order given and inlined into engine.html
at the /*{{CONTENT}}*/ marker. The first file must define `const COURSE = {...}`
(with a `title`), and later files usually push chapters: COURSE.chapters.push({...}).
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def to_artifact(html):
    """Artifact publishing wraps the page in its own doctype/html/head/body skeleton,
    so strip ours and keep everything from <title> onward."""
    html = re.sub(r"(?is)^.*?(<title>)", r"\1", html, count=1)
    html = re.sub(r"(?i)</?body>|</?html[^>]*>|</?head>", "", html)
    return html


def main(argv):
    artifact = "--artifact" in argv
    argv = [a for a in argv if a != "--artifact"]
    if len(argv) < 3:
        print(__doc__)
        return 1
    out = Path(argv[1])
    parts = [Path(p) for p in argv[2:]]
    content = "\n\n".join(f"/* ===== {p.name} ===== */\n" + p.read_text(encoding="utf-8") for p in parts)
    if "</script" in content.lower():
        print("error: content contains '</script', which would end the script block early", file=sys.stderr)
        return 1
    m = re.search(r"title\s*:\s*(['\"`])(.+?)\1", content)
    title = m.group(2) if m else "Practice"
    tpl = (HERE / "engine.html").read_text(encoding="utf-8")
    html = tpl.replace("{{TITLE}}", title).replace("/*{{CONTENT}}*/", content)
    if artifact:
        html = to_artifact(html)
    out.write_text(html, encoding="utf-8")
    print(f"built {out} ({len(html)/1024:.1f} KB) from {len(parts)} content file(s), title: {title}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
