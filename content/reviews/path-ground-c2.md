# Review: Ground/C2 software engineer path

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 23 topics, 35 glossary terms, 9 labs, 2 paths, 4 symptoms · 209 claims · register 50 sources

Path file: `paths/ground-c2-software-engineer.yaml`. It has 8 modules and 19 topics: 7 are new and 12 are reused from the Operator path. It uses 8 of the 9 labs, and is estimated at 10–14 h, matching the Home card.

## New topics

| Topic | Level | Claims (std / practice / example / mission) | Primary sources | Open issues |
| :-- | :-- | :-- | :-- | :-- |
| TC Space Data Link Protocol | core | 5 / 0 / 2 / 1 | 232.0-B-4 §4.1 | none |
| AOS and USLP | advanced | 7 / 0 / 2 / 1 | 732.0-B-5 §4.1; 732.1-B-3 §4.1; 130.0-G-4 §3.2.1 | none |
| Time codes (CUC, CDS) | core | 4 / 0 / 2 / 1 | 301.0-B-4 §3.1–3.3; 133.0-B-2 §4.1.4.2.2 | TAI−UTC offset source (IERS) |
| SLE transfer services | advanced | 7 / 0 / 2 / 1 | 911.1-B-5 §2.6.4, §3; 911.2-B-4 §1.1; 912.1-B-5 §2.7, §2.8.2.3 | none |
| Telemetry and command databases (XTCE) | core | 3 / 0 / 2 / 1 | 660.0-B-2 §1, §2, §6.1 | none |
| CFDP file delivery | core | 5 / 1 / 2 / 1 | 727.0-B-5 §2.1–2.4; 720.1-G-4 §2.1; 133.0-B-2 §4.1.3.3.4 | none |
| C2 and flight software landscape | intro | 0 / 5 / 2 / 1 | Yamcs, OpenC3, Open MCT, cFS first-party pages | Yamcs SLE/COP-1 (S2); cFS message format (S5) |

New glossary terms: CUC and CDS. New register sources: CCSDS-301.0-B-4, YAMCS-HOME, YAMCS-LINKS, OPENC3-HOME, OPENMCT-HOME and CFS-GSFC. The claim ledger gains §7, "C2 software stack" (S1–S5).

## Dossier corrections

These dossier 01 §3.1 claims were checked against first-party pages (ledger §7):
- **Yamcs.** "Java-based" and "used by ESA" are not stated on the pages read.
- **Yamcs SLE and COP-1 support.** Not stated on the data-links page.
- **Open MCT mission names (VIPER, lunar rovers).** Not stated.
- **cFS and CCSDS packets.** cFS's use of CCSDS packets is not stated on the GSFC page.

The site describes each tool only by its own words and marks these points as to be verified.

## Worked-number checks

- TC header `00 2A 04 13 25` → Type-AD, SCID 42, VC 1, length field 19 → 20-octet frame, N(S) 37.
- CUC `1E 7B 2D 6F 80 40 00` → 4+2 octets, 2,066,575,232.25 s → 2023-06-27 16:40:32.25 TAI.
- CDS `40 62 31 02 FA F0 80` → day 25,137 = 2026-10-28, 50,000,000 ms = 13:53:20 UTC.
- AOS first octet 0x40 → version 01 (USLP would be 0xC0–0xCF).
- CFDP: 18.4 MB at 2.0 Mbit/s ≈ 73.6 s; 3 % loss ≈ 0.55 MB ≈ 2.2 s of retransmission.
- XTCE example: 0x0AAB → 41.9 °C (matches Tool 5).

## Not yet covered

- Penpot has no Ground/C2 path screen. The Home path card describes this path but links to no detail screen.
- The Home path-progress counter ("4 of 11 topics") predates both paths.
- The Communications deep dive, Security-aware operations and Fast reference paths have no topics yet.
