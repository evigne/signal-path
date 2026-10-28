# Review: linked topics, batch 2 (Operator conversation fluency path complete)

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 16 topics, 33 glossary terms, 4 standards, 2 symptoms, 1 lab, 1 path · 149 claims · register 44 sources

| Topic | Level | Claims (std / practice / example / mission) | Primary sources | Open issues |
| :-- | :-- | :-- | :-- | :-- |
| Space Packet Protocol | core | 9 / 0 / 2 / 1 | 133.0-B-2 §2.2, §4.1 | none (SANA APID registry cited) |
| End-to-end system | intro | 6 / 0 / 2 / 1 | 130.0-G-4 §1.3.2, §2.2, §3.2.1, §4.2; 911.1-B-5 §1.1, §2.1 | none |
| Uplink and downlink | intro | 6 / 0 / 2 / 1 | 130.0-G-4 §3.2.1; 232.0-B-4 §2.2.2, §4.1.1, §4.2.1; 231.0-B-4 §5.2 | none |
| Decimal and binary units | intro | 2 / 0 / 2 / 1 | NIST binary prefixes page; 130.0-G-4 §1.3.2 | none (closes batch-1 "units source") |
| RF basics | intro | 5 / 0 / 2 / 1 | 401.0-B-32 §2.1.1, §2.1.2, §2.3.1–2.3.5, §2.4.11, §2.4.17A, §2.6.1 | none (401 §4.1.2–4.1.3 cited) |
| Frequency bands | intro | 7 / 0 / 2 / 1 | ITU RR 2024 Vol. 1 Art. 5 (ledger B1–B8); 401.0-B-32 §3.1.2A | none |
| Telemetry lifecycle | core | 4 / 0 / 2 / 1 | 660.0-B-2 §6.1.2; 133.0-B-2 §4.1.3.4.3, §4.1.4.2; 130.0-G-4 §3.2.1 | none (720.1-G-4 §2.1, NASA-SOA-11 §11.2.1 cited) |
| Command lifecycle | core | 5 / 0 / 2 / 1 | 660.0-B-2 §6.1.3.2; 232.0-B-4 §4.1.2.3; 232.1-B-2 §5.1.2, §6.1.2 | none |
| Ground stations and networks | intro | 4 / 3 / 2 / 1 | 911.1-B-5, 911.2-B-4, 912.1-B-5; AWS-GS-UG, LEAF-SCHED, ATLAS-FREEDOM | IGM clarification |
| Layered fault isolation | core | 4 / 0 / 2 / 1 | 130.1-G-3 §9.3.7; 132.0-B-3 §4.1; 133.0-B-2 §4.1.3.4.3; 232.0-B-4 §4.2.1.8 | none |

Also written: standards entry `ccsds-133-0-b-2` (EC 1 Oct 2020, EC 2 Sep 2024); glossary space packet, APID, packet sequence count, idle packet, SLE, forward link, return link, CLTU, COP-1, CLCW, binary prefix, residual carrier, frequency allocation, alarm limit, command verifier. Register adds `CCSDS-660.0-B-2` (XTCE) and `NIST-BINARY`; local files recorded for 130.0-G-4, 911.1, 911.2, 912.1.

## Findings that affect earlier material

- **Phase ambiguity source (sync-markers open issue): closed.** Added a standard claim citing 401.0-B-32 §2.4.11 (four stable QPSK lock points; resolve with the sync marker before convolutional decoding, else differential formatting); Scenario A now points to it.
- **SCID assignment (TM topic open issue): closed.** Added a claim citing 232.0-B-4 §4.1.2.5.2 (SCIDs assigned by CCSDS); remaining issue narrowed to registering the SANA registry page for look-ups.
- **TC frame size:** up to 1019-octet data field (1017 with FECF), 5-octet header — matches the design's uplink copy; no Penpot change needed.

## Worked-example checks

- SPP header `08 7E C4 12 00 3F` → TM, secondary header present, APID 126, unsegmented, count 1042, data field 64 octets, packet 70 octets.
- 2.0 Mbit/s × 600 s = 150 MB = 143.05 MiB.
- 2041.25 MHz × 240/221 ≈ 2216.742 MHz (example deliberately shows a non-coherent pair).
- Calibration 0.05 × 1250 − 31.3 = 31.2 °C.
- CLCW examples: Report Value = next expected N(S); go-back-n resend from the report value.

## Not yet covered

Learner labs beyond the sync-marker visualiser (e.g. packet header decoder lab named in the path milestones); topics on other paths (communications deep dive, ground C2 software engineer); owner/reviewer assignments.

## Follow-up closures (2026-10-28)

- **SANA:** registered `SANA-SCID` (5,462 records, updated 2026-10-22) and `SANA-APID`; TM topic now links the SCID registry, SPP topic the APID registry. Note: SANA marks 2040–2046 as unassigned/returned rather than free, slightly narrower than 133.0-B-2's note that idle is the only reserved value — the page states both, attributed.
- **SSC retry succeeded:** `SSC-STATIONS` (11 own + 10 partner stations) and `SSC-GO` (S up/down, X and Ka down; 13 antennas at 5 locations; cloud drop-off delivery). Ledger G29 updated to "partly confirmed". Penpot provider table SSC column updated from these sources the same day (decision log row added).
- **Link budget:** RF basics cites 401.0-B-32 §4.1.2–4.1.3 (design control table; free-space loss, atmospheric attenuation, margin = received − required Eb/N0).
- **Storage and playback:** telemetry lifecycle cites 720.1-G-4 §2.1 and NASA-SOA-11 §11.2.1 (practice label).
- Remaining open across the path: owner/reviewer names; IGM; CCSDS reuse terms.
