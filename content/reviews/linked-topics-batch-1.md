# Review: linked topics, batch 1

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 1 warning (Space Packet Protocol topic not written yet) · 6 topics, 18 glossary terms, 3 standards, 2 symptoms, 1 lab, 1 path · 56 claims

| Topic | Level | Claims (std / practice / example / mission) | Primary sources | Open issues |
| :-- | :-- | :-- | :-- | :-- |
| Sync markers (CSM / ASM) | core | 10 / 3 / 3 / 1 | 131.0-B-6 §9–10, 130.1-G-3 §9.3 | owner/reviewer; phase-ambiguity source; CCSDS terms |
| Channel coding | core | 8 / 0 / 2 / 1 | 131.0-B-6 §2.2.4, §4–8; 130.1-G-3 §3.3.1 | reference coding-gain data |
| Pseudo-randomization | core | 5 / 0 / 1 / 1 | 131.0-B-6 §10; 401.0-B-32 §2.4.9 | none |
| TM Space Data Link Protocol | core | 6 / 0 / 2 / 1 | 132.0-B-3 §4.1 | SCID assignment source (SANA) |
| Bits, symbols and rates | intro | 3 / 0 / 1 / 1 | 413.0-G-3 §2.4; 130.1-G-3 §3.3.1; 131.0-B-6 §4.3.1 | units source (SI/IEC) |
| Carrier and symbol sync | core | 4 / 0 / 2 / 1 | 401.0-B-32 §1.5, §2.1.1, §2.1.3A, §2.4.9 | source for lock-indicator displays |

Also written: symptom *Frame lock with errors*; glossary code rate, convolutional code, Reed–Solomon, Turbo code, LDPC, Eb/N0, symbol rate, Doppler shift, transfer frame, VCID, First Header Pointer, FECF; standards entries 132.0-B-3 and 401.0-B-32.

## Findings that changed earlier material

- **Randomizer sequence:** 131.0-B-6 specifies the 131,071-bit x¹⁷+x¹⁴+1 sequence; the 255-bit x⁸ sequence quoted in the dossier is legacy-only (ledger P2).
- **Frame counter example:** the TM Virtual Channel Frame Count is 8 bits, so the design's fictional `0x2A1` was impossible; corrected to `0xA1` in Penpot (Log Block main and copies) and in content (ledger P14).
- **Rate vocabulary:** Rb / Rs / RChS from 413.0-G-3 §2.4 is now the site's terminology.

## Worked-example checks

- R-S (255,223), I = 5: 1115 frame octets + 160 parity + 4 marker = 1279 octets; factor 1.147.
- 2.0 Mbit/s → 2.294 Mbit/s after R-S and markers → 4.588 Msym/s after rate 1/2 → 2.294 Msym/s on QPSK.
- TM header `0A B5 2A 11 18 00` → SCID 171, VCID 2, OCF present, MCFC 42, VCFC 17, FHP 0.

## Not yet covered

Space Packet Protocol topic; the remaining operator-fluency path topics (end-to-end system, uplink and downlink, decimal and binary units, RF basics, frequency bands, telemetry and command lifecycle, ground stations, layered fault isolation).
