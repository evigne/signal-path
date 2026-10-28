# Review: Fast reference path (all five paths now written)

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 35 topics, 45 glossary terms, 26 standards, 8 symptoms, 9 labs, 5 paths · 303 claims · register 55 sources

Path file: `paths/fast-reference.yaml`. It has 4 modules: Look it up, Decode it, Numbers and units, and Symptoms. It covers 10 topics and 4 labs, has no prerequisites, and is used as needed (1–3 h nominal).

## Added in this batch

- **Reference topics:**
  - *Protocol comparison*: Space Packet, TM, TC, AOS and USLP side by side, with version bits, header sizes, identifiers, counters and length rules. Five standard claims, one per protocol, plus the 130.0-G-4 reliability claim.
  - *Standards map*: each stage of the chain mapped to its Blue and Green Books, with a catalogue claim on corrigenda.
- **Standards library:** grew from 4 to 26 entries, one for every standard the content cites. Each records issue, date, scope, what the mission must define, local file and register ID. Corrigenda:
  - 232.0-B-4 Cor. 1 (Oct 2023) and 232.1-B-2 Cor. 1 (Apr 2019) are in the local library.
  - **231.0-B-4 Cor. 1 (Jul 2026) and 131.2-B-2 Cor. 1 (Oct 2026) are not.**
- **New symptom guides:**
  - *No carrier*
  - *Packets present, values invalid*
  - *Pass done, data late or incomplete*
  - *Authenticated commands rejected after a key or SA change*

  All four have fictional sample logs and cite standard sections where a cause is standard-defined. Together with the earlier guides, all four Tool 9 scenarios and every symptom guide named in the Penpot decision tree now have content.
- **Cross-links:** topics now list their `standards` and `related_symptoms`.

## Coverage by path

| Path | Topics | New topics | Labs |
| :-- | :-- | :-- | :-- |
| Operator conversation fluency | 16 | — | 9 |
| Ground/C2 software engineer | 19 | 7 | 8 |
| Communications deep dive | 20 | 5 | 6 |
| Security-aware operations | 9 | 5 | 2 |
| Fast reference | 10 | 2 | 4 |

The table counts distinct topics per path; topics are shared across paths. There are 35 topics in total.

## Open items across the site

- **Library and sources:**
  - Read 231.0-B-4 Cor. 1 and 131.2-B-2 Cor. 1. They are not in the local library.
  - Recheck NIST SP 800-38D, which is under revision.
  - Confirm CCSDS reuse terms.
- **Missing references:**
  - TAI−UTC offset (IERS).
  - An orbital-mechanics reference for pass formulas.
- **C2 tools:** verify Yamcs SLE/COP-1 support and the cFS message format.
- **Providers:** IGM provider clarification from the user.
- **Assignments:** owner and reviewer names are still pending on every item.
- **Penpot:**
  - Learning-path screens for paths 2–5.
  - Fix the stale Home path counter ("4 of 11 topics").
