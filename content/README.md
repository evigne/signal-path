# Signal Path content model

Structured, framework-agnostic content for the Signal Path site. Every factual statement carries a content label and, when it states a fact, a source ID from the source register (`research/source_register.json`).

## Layout

| Folder | Type | Schema | Format |
| :-- | :-- | :-- | :-- |
| `topics/<section>/<id>.md` | Topic page (brief §6, 14-part template) | `schema/topic.schema.json` | Markdown with YAML frontmatter |
| `glossary/<id>.yaml` | Glossary term (brief §4L) | `schema/glossary-term.schema.json` | YAML |
| `standards/<id>.yaml` | Standards catalogue entry | `schema/standard.schema.json` | YAML |
| `labs/<id>.yaml` | Lab linked to an interactive tool (1–9) | `schema/lab.schema.json` | YAML |
| `symptoms/<id>.yaml` | Troubleshooting symptom (brief §4K) | `schema/symptom.schema.json` | YAML |
| `paths/<id>.yaml` | Learning path (brief §5) | `schema/learning-path.schema.json` | YAML |
| `providers/<id>.yaml` | Ground-station provider cells | `schema/provider.schema.json` | YAML |
| `quizzes/<topic-id>.yaml` | Retrieval and practice items for one topic (a module quiz is the union of its topics' quizzes); choices are shuffled by the UI | `schema/quiz.schema.json` | YAML |
| `../research/source_register.json` | Source register (brief §7) | `schema/source-register.schema.json` | JSON |

File names must equal the `id`. IDs are lower-case kebab-case; source IDs use the register's form (e.g. `CCSDS-131.0-B-6`).

## Topic pages

Frontmatter holds parts 1, 3, 5, 12, 13 and 14 of the template (title, definition, level, time, prerequisites, objectives, chain position, related items, sources, owner/reviewer/review dates). The body must contain these `##` sections, in order:

Why it matters · Plain-language explanation · Precise terminology · Where in the chain · How it works, step by step · What operators and engineers see · Misconceptions and failure symptoms · Standard, practice and mission choices · Worked example · Related · Sources

### Labelled claims

Wrap every factual statement in a claim block. The site renders the label (icon + text + tint) and a citation.

```
:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.1"}
Each CSM immediately follows the end of the preceding codeword or codeblock.
:::
```

| Label | Means | Source |
| :-- | :-- | :-- |
| `standard` | Required or defined by a cited standard | Required, with `loc` |
| `practice` | Widely used, not required by a standard | Required, with `loc` |
| `example` | Illustrative, fictional values | Optional; say "fictional" |
| `mission` | Decided by a mission's configuration or ICD | Optional |

Several sources: `source="A,B"`. Write claims in your own words; never paste standard text, tables or figures (CCSDS reuse terms are not yet confirmed).

### Publishing rules

- `status: published` requires an empty `open_issues` list and named `owner` and `reviewer`.
- Provider facts appear only in `providers/` cells with `state: cited` and dated sources; otherwise `not_public` or `to_research`.
- Examples, logs, keys, APIDs and values are fictional and say so.

## Validate

```bash
.venv/bin/python content/tools/validate.py
```

Errors: schema violations, unknown source IDs, unsourced standard/practice claims, missing sections, open issues on published topics. Warnings: links to content not written yet.
