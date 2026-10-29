"""Validate Signal Path content against the schemas and the source register.

Usage: .venv/bin/python content/tools/validate.py

Errors (exit code 1): schema violations, unknown source IDs, claims without a
required source, missing template sections, open issues on published topics.
Warnings: cross-references to content that does not exist yet.
"""
import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content"
REGISTER = ROOT / "research" / "source_register.json"

FOLDERS = {
    "glossary": "glossary-term",
    "standards": "standard",
    "labs": "lab",
    "symptoms": "symptom",
    "paths": "learning-path",
    "providers": "provider",
    "quizzes": "quiz",
}
TOPIC_SECTIONS = [
    "Why it matters",
    "Plain-language explanation",
    "Precise terminology",
    "Where in the chain",
    "How it works, step by step",
    "What operators and engineers see",
    "Misconceptions and failure symptoms",
    "Standard, practice and mission choices",
    "Worked example",
    "Related",
    "Sources",
]
CLAIM_RE = re.compile(r"^:::claim\{([^}]*)\}\s*$")
ATTR_RE = re.compile(r'(\w+)="([^"]*)"')
SOURCED_LABELS = {"standard", "practice"}

errors, warnings = [], []


def load_yaml(text):
    # YAML turns unquoted dates into date objects; the schemas expect ISO strings.
    return json.loads(json.dumps(yaml.safe_load(text), default=str))


def schema(name):
    data = json.loads((CONTENT / "schema" / f"{name}.schema.json").read_text())
    return Draft202012Validator(data, format_checker=FormatChecker())


def check_schema(validator, data, where):
    for e in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        path = "/".join(str(p) for p in e.path) or "(root)"
        errors.append(f"{where}: {path}: {e.message}")


def check_sources(items, where):
    for s in items or []:
        if s.get("id") not in register_ids:
            errors.append(f"{where}: source '{s.get('id')}' is not in the source register")


def split_frontmatter(text, where):
    if not text.startswith("---\n"):
        errors.append(f"{where}: missing YAML frontmatter")
        return {}, text, 0
    _, fm, body = text.split("---\n", 2)
    return load_yaml(fm), body, fm.count("\n") + 2


def check_topic_body(body, where, offset=0):
    headings = re.findall(r"^## (.+)$", body, re.M)
    for s in TOPIC_SECTIONS:
        if s not in headings:
            errors.append(f"{where}: missing section '## {s}'")
    lines = body.splitlines()
    open_claim = None
    for n, line in enumerate(lines, 1 + offset):
        m = CLAIM_RE.match(line)
        if m:
            if open_claim:
                errors.append(f"{where}:{n}: claim opened before the claim at line {open_claim} closed")
            open_claim = n
            attrs = dict(ATTR_RE.findall(m.group(1)))
            label = attrs.get("label")
            if label not in {"standard", "practice", "example", "mission"}:
                errors.append(f"{where}:{n}: claim label '{label}' is not standard/practice/example/mission")
            src = attrs.get("source")
            if label in SOURCED_LABELS and not src:
                errors.append(f"{where}:{n}: '{label}' claim needs a source")
            for sid in filter(None, (x.strip() for x in (src or "").split(","))):
                if sid not in register_ids:
                    errors.append(f"{where}:{n}: claim source '{sid}' is not in the source register")
            if label in SOURCED_LABELS and not attrs.get("loc"):
                warnings.append(f"{where}:{n}: '{label}' claim has no loc (section/figure)")
        elif line.strip() == ":::":
            if not open_claim:
                errors.append(f"{where}:{n}: closing ::: without an open claim")
            open_claim = None
    if open_claim:
        errors.append(f"{where}:{open_claim}: claim is never closed")
    return sum(1 for l in lines if CLAIM_RE.match(l))


register = json.loads(REGISTER.read_text())
check_schema(schema("source-register"), register, "research/source_register.json")
register_ids = {s["id"] for s in register["sources"]}

known = {k: {p.stem for p in (CONTENT / k).glob("*.yaml")} for k in FOLDERS}
known["topics"] = {p.stem for p in (CONTENT / "topics").rglob("*.md")}

counts = {}
for folder, sname in FOLDERS.items():
    v = schema(sname)
    for p in sorted((CONTENT / folder).glob("*.yaml")):
        where = str(p.relative_to(ROOT))
        data = load_yaml(p.read_text())
        check_schema(v, data, where)
        if data.get("id") != p.stem:
            errors.append(f"{where}: id '{data.get('id')}' does not match file name")
        check_sources(data.get("sources"), where)
        if folder == "standards" and data.get("register_id") not in register_ids:
            errors.append(f"{where}: register_id '{data.get('register_id')}' is not in the source register")
        if folder == "providers":
            for attr, cell in (data.get("cells") or {}).items():
                check_sources(cell.get("sources"), f"{where}: {attr}")
        if folder == "quizzes":
            if data.get("topic") != data.get("id"):
                errors.append(f"{where}: quiz id must equal its topic id")
            ids = set()
            for it in data.get("items", []):
                iw = f"{where}: item '{it.get('id')}'"
                if it.get("id") in ids:
                    errors.append(f"{iw}: duplicate item id")
                ids.add(it.get("id"))
                check_sources(it.get("sources"), iw)
                right = sum(1 for c in it.get("choices", []) if c.get("correct"))
                if it.get("type") == "single-choice" and right != 1:
                    errors.append(f"{iw}: single-choice needs exactly one correct choice (has {right})")
                if it.get("type") == "multi-choice" and right < 1:
                    errors.append(f"{iw}: multi-choice needs at least one correct choice")
        for t in data.get("topics", []) + data.get("related_topics", []) + ([data["topic"]] if folder == "quizzes" and data.get("topic") else []):
            if t not in known["topics"]:
                warnings.append(f"{where}: topic '{t}' not written yet")
        counts[folder] = counts.get(folder, 0) + 1

tv = schema("topic")
claim_total = 0
order_rows = []
for p in sorted((CONTENT / "topics").rglob("*.md")):
    where = str(p.relative_to(ROOT))
    fm, body, offset = split_frontmatter(p.read_text(), where)
    check_schema(tv, fm, where)
    if fm.get("id") != p.stem:
        errors.append(f"{where}: id '{fm.get('id')}' does not match file name")
    check_sources(fm.get("sources"), where)
    if fm.get("status") == "published" and fm.get("open_issues"):
        errors.append(f"{where}: published topic still has open_issues")
    for key, folder in [("glossary_terms", "glossary"), ("related_labs", "labs"), ("related_symptoms", "symptoms"), ("standards", "standards")]:
        for ref in fm.get(key, []):
            if ref not in known[folder]:
                warnings.append(f"{where}: {key} '{ref}' not written yet")
    for ref in fm.get("prerequisites", []) + fm.get("related_topics", []):
        if ref not in known["topics"]:
            warnings.append(f"{where}: topic '{ref}' not written yet")
    claim_total += check_topic_body(body, where, offset)
    counts["topics"] = counts.get("topics", 0) + 1
    order_rows.append((f'{fm.get("section")}/{fm.get("subsection", "")}'.rstrip("/"), fm.get("order", 0), fm.get("level"), fm.get("id")))

# Teaching order: within a section (or subsection), no topic may come before one of a lower level.
RANK = {"intro": 0, "core": 1, "advanced": 2}
for sec in {r[0] for r in order_rows}:
    rows = sorted(r for r in order_rows if r[0] == sec)
    seen = [r[1] for r in rows]
    if len(seen) != len(set(seen)):
        errors.append(f"topics/{sec}: duplicate order values")
    for a, b in zip(rows, rows[1:]):
        if RANK.get(a[2], 0) > RANK.get(b[2], 0):
            warnings.append(f"topics/{sec}: '{a[3]}' ({a[2]}) is ordered before '{b[3]}' ({b[2]})")

print("Checked:", ", ".join(f"{v} {k}" for k, v in sorted(counts.items())), f"· {claim_total} claims · {len(register_ids)} register sources")
for w in warnings:
    print("WARN ", w)
for e in errors:
    print("ERROR", e)
print(f"{len(errors)} error(s), {len(warnings)} warning(s)")
sys.exit(1 if errors else 0)
