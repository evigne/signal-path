# Review: Communications deep dive path

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 28 topics, 39 glossary terms, 9 labs, 3 paths, 4 symptoms · 245 claims · register 53 sources

Path file: `paths/communications-deep-dive.yaml`. It has 8 modules and 20 topics: 5 new and 15 reused. It uses 6 labs, has the Operator path as a prerequisite, and is estimated at 12–18 h, matching the Home card.

## New topics

| Topic | Level | Claims (std / practice / example / mission) | Primary sources | Open issues |
| :-- | :-- | :-- | :-- | :-- |
| Link budgets and margin | advanced | 4 / 0 / 2 / 1 | 401.0-B-32 §4.1.2–4.1.3; 130.1-G-3 §7.4.2 | none |
| Bandwidth-efficient modulation | advanced | 6 / 0 / 2 / 1 | 413.0-G-3 §2.1–2.3, Annex B; 401 §2.4.17A/21A | none |
| Ranging and Doppler tracking | advanced | 3 / 0 / 2 / 1 | 414.1-B-3 §1.1, §3.2; 401 §2.6.1 | none |
| High-rate coding and modulation (SCCC, DVB-S2, VCM/ACM) | advanced | 5 / 0 / 2 / 1 | 131.2-B-2 §1.1–1.2, §1.6; 131.3-B-2 §1.2–1.3 | 131.2-B-2 Cor. 1 (Oct 2026) not in local library |
| Contact planning and pass geometry | core | 1 / 2 / 2 / 1 | NASA-SOA-11 §11.2.1, §11.4; 401 §2.1.3A | orbital-mechanics reference for pass formulas |

New glossary terms: EIRP, link margin, PN ranging, VCM/ACM. New register sources: CCSDS-414.1-B-3, CCSDS-131.2-B-2 and CCSDS-131.3-B-2.

## Worked-number checks

**Link budget** (fictional S-band downlink at 2.25 GHz, EIRP 5.0 dBW, G/T 5 dB/K, 0.8 dB losses, 2.0 Mbit/s):

| | 5° elevation | Overhead |
| :-- | :-- | :-- |
| Free-space loss | 165.8 dB | 153.5 dB |
| C/N0 | 72.0 dB-Hz | 84.3 dB-Hz |
| Eb/N0 | 9.0 dB | 21.3 dB |
| Margin (required 4.6 dB) | 4.4 dB | 16.7 dB |

- The free-space loss uses 20 log₁₀(4πd/λ). Boltzmann's constant is −228.6 dBW/K/Hz.
- Unfiltered BPSK at 4.588 Msym/s occupies about 94 MHz, more than the 90 MHz band. GMSK occupies about 3.95 MHz.
- A round-trip light time of 13.342 ms gives about 2,000 km. An error of 1 µs is about 150 m.
- The VCM plan returns about 118 Gbit against 60 Gbit for fixed QPSK 1/2.
- For a 500 km orbit the period is 94.5 min. An overhead pass lasts 11.5, 9.2 or 7.4 min with a 0°, 5° or 10° mask, from a spherical-Earth computation labelled as an example. The 5° pass carries about 123 MB.

## Notes

- The link budget defines required Eb/N0 to include implementation losses, per 401 §4.1.3 item (174). The 2.0 dB figure in the example is fictional.
- The 413 occupied-bandwidth figures are simulations after a saturated SSPA, normalised to the coded symbol rate.
- 131.2-B-2 carries a patent notice (§1.6). It is noted in the topic without legal interpretation.

## Not yet covered

- The Security-aware operations path (SDLS, key management) and the Fast reference path have no topics yet.
- Penpot has no screens for paths 2 and 3. The Home path counter is stale.
