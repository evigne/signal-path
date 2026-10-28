# Review: Security-aware operations path

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 33 topics, 45 glossary terms, 9 labs, 4 paths, 4 symptoms · 289 claims · register 55 sources

Path file: `paths/security-aware-operations.yaml`. It has 4 modules and 9 topics: 5 new and 4 reused. It uses 2 labs, has the Operator path as a prerequisite, and is estimated at 5–8 h, matching the Home card.

## New topics (section `security-resilience`)

| Topic | Level | Claims (std / practice / example / mission) | Primary sources | Open issues |
| :-- | :-- | :-- | :-- | :-- |
| Space Data Link Security (SDLS) | core | 6 / 0 / 2 / 1 | 355.0-B-2 §2.1–2.3, §4.1 | none |
| Security associations and anti-replay | advanced | 6 / 0 / 2 / 1 | 355.0-B-2 §2.3.1, §2.3.2.3, §4.2.4.4; 355.1-B-1 §2.3.3; 350.1-G-3 §3.4.8 | none |
| Key management and rotation concepts | advanced | 5 / 0 / 2 / 1 | 355.1-B-1 §2.3.2–2.3.3; NIST SP 800-57 Pt 1 §5.2, §5.3 | none |
| Cryptographic algorithms for space links | advanced | 7 / 0 / 2 / 1 | 352.0-B-2 §3–4; NIST SP 800-38D §5.2.1.1, §8, §8.3; 355.0-B-2 §2.3.2.3.4 | 800-38D revision announced (ledger N2) |
| Command authority and threats | core | 5 / 0 / 2 / 1 | 350.1-G-3 §3.3.2, §3.4; 660.0-B-2 §6.1.3.2.4–5; 355.0-B-2 §2.3.2.1 | none |

New glossary terms: SDLS, SPI, security association, MAC, OTAR, cryptoperiod. New register sources: CCSDS-352.0-B-2 and CCSDS-350.1-G-3. The NIST SP 800-57 and 800-38D register entries now say they were checked against the PDF text on 2026-10-28; earlier they were verified from the NIST catalogue pages only. Ledger P10, the "safe key rollover", is applied as a mission-labelled claim.

## Safety and content boundaries

- All SPIs, counters, key IDs and procedures in this path are fictional. No key material, IVs, test vectors or real security association configurations appear anywhere.
- The content is defensive and conceptual. It explains what controls do and how to operate them safely, not how to defeat them.
- The SDLS receive-check order comes from 355.0-B-2 §4.2.4.4: MAC first, then sequence number ≤ stored, then sequence number beyond the window, then update.

## Worked-number checks

- SDLS overhead: a 64-octet TC frame with 5 header octets, 2 FECF octets, a 14-octet security header and a 16-octet MAC leaves 27 octets of data.
- Anti-replay, with stored sequence number 1000 and window 10:

| Received | Result | Stored after |
| :-- | :-- | :-- |
| 1003 | accept | 1003 |
| 1002 | reject (not above stored) | 1003 |
| 1003 | reject (replay) | 1003 |
| 1020 | reject (17 > 10, beyond window) | 1003 |
| 1011 | accept | 1011 |

- A 96-bit counter IV at 10 frames per second would take about 2.5 × 10²⁰ years to wrap. The practical limits are the cryptoperiod and never letting the counter reset.

## Not yet covered

- The Fast reference path (glossary, protocol comparison, symptom guides, standards) has no topics yet. It is mostly an index over existing content.
- Penpot has no screens for paths 2–4, and the Home path counter is stale.
- Other CCSDS security documents could be added later as needed: 350.0-G-3, 350.5-G-2 and 355.1 §3 procedures in depth. Of these, only 350.0-G-3 is in the local library.
