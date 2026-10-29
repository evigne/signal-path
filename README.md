# Signal Path

A learning site for spacecraft communications and operations — from bits and sync markers to ground stations, commanding and troubleshooting — with every factual claim labelled and cited.

| Folder | What it holds |
| :-- | :-- |
| `content/` | Structured content: topics (Markdown + labelled claims), glossary, standards, labs, symptoms, learning paths, providers, quizzes; JSON Schemas and `tools/validate.py` |
| `research/` | Research dossiers, the verified source register (`source_register.json`), the claim-verification ledger and catalogue snapshots |
| `site/` | The Astro website that renders `content/` — see `site/README.md` |
| `spacecraft-comms-site-project-instructions.md` | The project brief |

Not in git: `standards/` (local CCSDS PDF library) and `research/sources/` (personal-use ITU Radio Regulations copy). Neither may be published.

Quick start:

```bash
cd site && npm install && npm run check
```
