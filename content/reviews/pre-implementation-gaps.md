# Review: pre-implementation content gaps

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 35 topics, 16 quizzes (48 items), 6 providers, 26 standards, 8 symptoms, 9 labs, 5 paths · 303 claims · 55 sources

## Closed

- **Providers.** `content/providers/` holds KSAT, Leaf Space, AWS Ground Station, ATLAS, SSC and IGM.
  - Nine cells each, matching the Penpot comparison rows: name, locations, bands, service modes, scheduling, data delivery, latency, support, public docs.
  - Cell values are copied from the Penpot table, which was built from first-party pages read 2026-10-28.
  - Every IGM cell is `to_research`, and `last_checked` is pending (ledger G15).
- **Quizzes.**
  - New `schema/quiz.schema.json` with four item types: single-choice, multi-choice, numeric and decode. Every item needs an explanation and a content label; standard and practice items need sources.
  - The validator now checks that each quiz id matches a topic, that item ids are unique, that a single-choice item has exactly one correct answer, and that sources exist in the register.
  - 48 items cover the 16 Operator path topics. They include decode items for the TM and Space Packet headers, and numeric items for units, rates, coding gain, packet length and calibration.
- **Stale open issue.** Removed from `bits-symbols-and-rates`, since the units source NIST-BINARY is registered.

## Notes for implementation

- Correct answers are stored first. The UI must shuffle the choices.
- A module quiz is the union of its topics' quizzes. Paths 2–4 still need quizzes for their 19 non-Operator topics. The Fast reference path has none by design.
- Provider cells render state, value and source chips. `not_public` and `to_research` must look distinct and must not rely on colour alone, as in the Penpot design.
