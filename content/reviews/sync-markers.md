# Review: Sync markers (CSM / ASM) — first content slice

**Reviewed:** 2026-10-28 · **Module:** `content/topics/space-link/sync-markers.md` · **Validator:** 0 errors, 12 warnings (links to topics not written yet)

## Brief checklist (§6 template, §10 validation)

| Check | Result | Notes |
| :-- | :-- | :-- |
| 1. Title, one-sentence definition, level, time, prerequisites | Pass | Core, 15–25 min, two prerequisite topics (not yet written). |
| 2. Why it matters in operations | Pass | Ties frame lock to everything downstream (counters, VCs, packets). |
| 3. Learning objectives | Pass | 5 objectives. |
| 4. Plain language, then precise terms | Pass | Analogy first; CSM/ASM/CADU defined from 131.0-B-6. |
| 5. Location in the chain | Pass | Frontmatter `chain_position` + section; matches the Penpot "Where in the chain" strip. |
| 6. Diagram, byte/field example or timeline | Pass | Worked Hamming-distance table; Tool 3 embed; Penpot bit-stream diagram. |
| 7. Step-by-step operation | Pass | Attach → search → acquire → lock → flywheel. |
| 8. What operators/engineers see | Pass | Lock order and counters; fictional console lines labelled. |
| 9. Misconceptions and failure symptoms | Pass | 4 misconceptions; carrier-but-no-frame-lock checks; links to symptom page. |
| 10. Standard vs practice vs mission | Pass | Table plus 17 labelled claims (10 standard, 3 practice, 3 example, 1 mission). |
| 11. Worked example with answer | Pass | Fictional RS I=5 link; arithmetic checked (1279 octets, distances 1/2/3/32). |
| 12. Related glossary, pages, paths, troubleshooting | Pass | 6 glossary terms written; lab, symptom, standard, path entries written. |
| 13. Claim-level sources, issue/status, links, last checked | Pass | Every standard/practice claim cites a register ID and section; status and dates come from the register. |
| 14. Owner, reviewer, review date | **Open** | All `pending` — needs a named owner and reviewer before publishing. |
| Precise use of "packet", "frame", "symbol", "encryption" | Pass | Marker kept below the frame; randomizer ≠ encryption stated. |
| Generic education vs mission configuration | Pass | Mission claim and table row; "do not assume these values". |
| No copied standard text | Pass | Paraphrased; hex patterns and section numbers are facts, not quoted prose. |

## Corrections this slice made to earlier material

- The standard's term is **CSM**; ASM and CSM are interchangeable only without slicing (131.0-B-6 §9.2.2). Penpot topic titles now read "Sync markers (CSM / ASM)".
- Synchronizer states follow the Green Book: Search, Acquire, Lock, Flywheel. Penpot Tool 3 changed "CHECK" → "ACQUIRE".
- The pseudo-randomizer is **mandatory** (131.0-B-6 §10.1), not a mission option (ledger P11).

## Open before publishing

1. Name an owner and reviewer; set `last_reviewed` / `next_review`.
2. Find an authoritative source for the inverted-bitstream (phase ambiguity) symptom, or keep it only as an illustrative scenario.
3. Confirm CCSDS reuse terms before showing any figure from 131.0-B-6.
4. Write the linked topics: carrier and symbol sync, channel coding, pseudo-randomization, TM Space Data Link Protocol, bits/symbols/rates; and the symptom "frame lock with errors".
