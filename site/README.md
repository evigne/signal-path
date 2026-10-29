# Signal Path — website

Static site for the Signal Path spacecraft-communications learning project. It reads the
structured content in `../content/` and the source register in `../research/source_register.json`
at build time; nothing is copied into this folder.

## Stack

- **Astro 7** (static output, content collections) with the Unified Markdown processor
- **React 19 islands** for quizzes, progress and the nine lab tools
- **Tailwind CSS 4** mapped onto the design tokens in `src/styles/tokens.css` (Penpot foundations, light and dark)
- **Pagefind** search index generated after the build
- **KaTeX** at build time for formulas
- **Vitest** (worked examples and tool models) and **Playwright + axe** (WCAG 2.2 A/AA, overflow, behaviour)
- IBM Plex fonts self-hosted via Fontsource; no analytics, cookies or third-party requests

## Commands

Run from `site/`:

| Command | What it does |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run validate` | Run `content/tools/validate.py` against the schemas and source register (needs `../.venv`) |
| `npm run typecheck` | `astro check` (strict TypeScript across pages and islands) |
| `npm test` | Unit tests: every worked example and tool model |
| `npm run build` | Build to `dist/` and generate the Pagefind index |
| `npm run test:e2e` | Accessibility and behaviour tests against `dist/` (run `npm run build` first; first time: `npx playwright install chromium`) |
| `npm run clean` | Remove build output and Astro's content cache (needed after changing a Markdown plugin) |
| `npm run check` | clean + validate + typecheck + unit tests + build + internal link check |
| `python3 -m http.server 4321 --directory dist` | Serve the built site locally |
| `npm run deploy` | Build and deploy to Cloudflare Workers (static assets) — needs `npx wrangler login` once |

`astro dev` may not start in sandboxed shells; building and serving `dist/` always works.

## How content becomes pages

| Content | Route |
| :-- | :-- |
| `content/topics/<section>/<id>.md` | `/topics/<id>/` and `/section/<section>/` |
| `content/paths/*.yaml` | `/paths/` and `/paths/<id>/` |
| `content/labs/*.yaml` | `/labs/` and `/labs/<id>/` (tool islands in `src/components/islands/`) |
| `content/glossary/*.yaml` | `/glossary/#<id>` |
| `content/standards/*.yaml` | `/standards/` and `/standards/<id>/` |
| `content/symptoms/*.yaml` | `/symptoms/` and `/symptoms/<id>/` |
| `content/providers/*.yaml` | `/providers/` |
| `content/quizzes/<topic>.yaml` | Quiz at the end of that topic |
| `research/source_register.json` | `/sources/#<id>` |

`:::claim{label source loc}` blocks are rendered by `src/lib/remark-claims.mjs`: a label chip
(icon + text), the claim, and citations linked to the register. The build **fails** on an unknown
source ID or a standard/practice claim without a source. `src/lib/rehype-glossary.mjs` links the first use of each of a topic's `glossary_terms` to the glossary with a definition tooltip.

## Tool models

The lab logic lives in pure, tested modules so the UI and the content cannot drift apart:

| Module | Tool | Tests |
| :-- | :-- | :-- |
| `src/lib/ccsds.ts` | 1 bit/byte inspector, 2 packet decoder | header decodes from the topic worked examples |
| `src/lib/framesync.ts` | 3 frame synchronizer | lock, wrong marker, inverted stream, slip |
| `src/lib/cop1.ts` | 6 COP-1 simulator | clean, drop/go-back-n, lockout/unlock, duplicate, wait, BD |
| `src/lib/budget.ts` | 7 data budget | defaults and scenarios from the Penpot calculator |
| `src/lib/chain.ts` | 8 walkthrough, 9 decision tree | — (data) |

## Hosting

Live at https://signal-path.spacepi.workers.dev (Cloudflare Workers static assets, free plan). `wrangler.jsonc` names the Worker `signal-path` and serves `./dist`, with Astro's 404 page for unknown paths. For automatic deploys on push, the Worker's Workers Builds settings must be: root directory `site`, build command `npm run build`, deploy command `npx wrangler deploy`.

## Publishing rules

- Never publish `research/sources/` (personal-use ITU copy) or `standards/` (CCSDS PDFs); both are git-ignored and are not read by the build.
- All example data is fictional; keep it labelled.
- Owner/reviewer fields are still `pending` on every topic; pages show a "Draft · not yet reviewed" badge until a topic's `status` is `published`.
