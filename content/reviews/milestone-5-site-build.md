# Milestone 5 — first site build (2026-10-29)

**State:** working static site in `site/`. Every check passes: 103 pages, 0 type errors, 22 unit tests, 84 browser tests (WCAG 2.2 A/AA via axe in light and dark, desktop and mobile), and 0 broken internal links. Everything is committed on `main`.

## What exists

- **Pages:**
  - Home, Start Here, 8 section pages and 35 topic articles.
  - 5 learning paths, 9 labs and the glossary (45 terms).
  - Standards library (26), symptom guides (8), provider comparison (6 providers) and the source register (55).
  - Search, about and 404.
- **Topic articles:**
  - Labelled claim callouts with register citations; the build fails on unknown sources.
  - On-page contents, objectives and a "where in the chain" strip.
  - Glossary tooltips, a quiz on every topic (97 items) and a "mark as done" button.
  - Related links and a review-status box that lists open questions.
- **All nine tools are interactive.** Logic lives in tested modules: `ccsds.ts`, `framesync.ts`, `cop1.ts`, `budget.ts` and `chain.ts`.
- **Design:** tokens from the Penpot spec, light and dark themes (system preference plus a toggle) and self-hosted IBM Plex fonts. No analytics, cookies or third-party requests.
- **Progress:** stored only in the reader's browser.

## Decisions made while you were away

- **Astro 7, not 5.** It is the current release. Markdown runs through `@astrojs/markdown-remark`'s `unified()`, because Astro 7 defaults to a different processor.
- **React islands.** Tools use native controls with ARIA. React Aria Components is installed but not yet used; native inputs were enough to pass axe.
- **Content stays in `content/`.** Astro reads `../content` and `../research/source_register.json` directly, so there is no copy.
- **Penpot tokens recovered from the original spec.** The Penpot MCP was disconnected, so the token values come from the original design spec plus the decision-log changes. They are in `site/src/styles/tokens.css`.
- **Previews use the static build.** `astro dev` would not start reliably in the sandbox, so local preview is a static server over `site/dist` (`.claude/launch.json` → `signal-path-static`).
- **Git initialised.**
  - `.env`, `.venv`, `standards/` and `research/sources/` are ignored; the latter holds the personal-use ITU copy.
  - Commits are on `main`, with no remote.

## Known gaps

- **Lab presets.** Some lab steps name presets that are only partly mirrored by tool buttons, so step text and controls can differ in wording.
- **Tool 4.** The coding-gain readout shows a cited number only for the concatenated code; the other codes say "Not shown".
- **Glossary tooltips.** They link only the first use of each term that a topic lists in `glossary_terms`.
- **Source items carried over:**
  - The 231.0-B-4 and 131.2-B-2 corrigenda.
  - A source for TAI−UTC.
  - An orbital-mechanics reference.
  - Yamcs SLE/COP-1 and the cFS message format.
  - The NIST SP 800-38D revision.
  - CCSDS reuse terms.
  - IGM.
  - Owner and reviewer names.
- **Hosting is not chosen.** Any static host works; `npm run build` produces `site/dist`.
- **External links** (29 distinct) are listed by the link checker but not fetched. Add lychee in CI when hosting is set up.
