# Review: labs for all nine interactive tools

**Reviewed:** 2026-10-28 · **Validator:** 0 errors, 0 warnings · 9 labs, 4 symptoms, 16 topics, 33 glossary terms, 44 register sources

| Tool | Lab | Level | Grounded in | Fictional input | Break-it cases |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | Bit, byte and endianness inspector | intro | 133.0-B-2 §1.6.3 (bit 0 = MSB, first sent); 660.0-B-2 §6.1.2.1 (encodings, byte order, IEEE-754) | `41 C8 00 00 FF FE 0A B5` | byte order, signedness, field offset |
| 2 | Space Packet header decoder | core | 133.0-B-2 §4.1.3–4.1.4; SANA APID registry | 4 headers incl. idle `07 FF C0 00 00 03` | length used as packet length, cross-APID counts, sec-header flag |
| 3 | Sync-marker visualiser (existing) | core | 131.0-B-6 §9; 130.1-G-3 §9.3.7 | ASM stream, seed 42 | slip, wrong marker, inverted stream |
| 4 | Channel coding sandbox | core | 131.0-B-6 §5.1 (E=16 corrects 16 symbols), §4–8; 130.1-G-3 §3.3.1 | 64×64 image, R-S (255,223) | 17 symbol errors, burst vs interleaving, E=8 decoder |
| 5 | Telemetry calibration sandbox | core | 660.0-B-2 §6.1.2.1 | 12-bit raw, T = 0.05·raw − 31.3 °C | coefficient swap, missing offset, signed decode |
| 6 | COP-1 FOP-1 / FARM-1 simulator | advanced | 232.1-B-2 §5.1.2, §6.1.2, §6.1.8; 232.0-B-4 §2.2.2, §4.1.2.3, §4.2.1 | VC1, W = 10, V(S) = 37 | dropped frame, N(S) outside window, buffer full |
| 7 | Data budget calculator | core | NIST binary prefixes; 413.0-G-3 §2.4; NASA-SOA-11 §11.2.1 | 2.0 Mbit/s, 6 × 8 min, 0.9 GB/day, 8 GiB store | coded-rate budgeting, GB/GiB mix, setup time |
| 8 | End-to-end walkthrough | intro | 130.0-G-4 §2.2, §3.2.1, §4.2; 911.1-B-5; 912.1-B-5 | star-tracker temperature down, heater command up | SLE association failure, frame-lock failure |
| 9 | Anomaly decision tree | advanced | 130.1-G-3 §9.3.7; 132.0-B-3 §4.1; 133.0-B-2 §4.1.3.4.3; 232.0-B-4 §4.2.1.8 | 4 scripted scenarios | — (scenarios are the faults) |

New symptoms for Tool 9: *Packets missing but frames fine*, *Command radiated, no execution*. Labs are linked from their topics (`related_labs`) and from the Operator conversation fluency path modules; the path milestone "Packet header decoder lab" now exists.

## Worked-number checks

- Tool 1: 41C80000 BE = 25.0, LE ≈ 7.18 × 10⁻⁴¹; FFFE BE = −2, LE = −257; 0AB5 BE = 2741, LE = 46346.
- Tool 2: 087E C412 003F → APID 126, count 1042, 70 octets; 182A C007 0009 → TC, APID 42, count 7, data field 10 octets; treating 63 as the packet length lands 7 octets short.
- Tool 5: raw 1000/1250/1500 → 18.7/31.2/43.7 °C; swapped coefficients at 1250 → ≈ −39,125 °C; raw 2500 signed → −111.1 °C instead of 93.7 °C.
- Tool 6 (after reconciliation): N(S) = 30 with V(R) = 10 and PW = 5 exceeds V(R) + PW − 1 = 14 → Lockout.
- Tool 7 (after reconciliation): 540 s × 2.0 Mbit/s = 135.0 MB → 106.2 MB/pass after 8 %, 5 %, 10 % deductions; 424.8 MB/day vs 360 generated; coded-rate error ≈ 15 % (1279/1115).

## Open items

- Tool 4 curves remain schematic shapes. **Coding gain now sourced:** 130.1-G-3 §3.3.3 (≈ 5.5 dB convolutional + ≈ 2.0 dB RS at BER 10⁻⁵; Turbo r=1/2, k=8920 ≈ 1.5 dB better) and §7.4.1 (Turbo thresholds at BER 10⁻⁶). Channel-coding topic open issue closed; Penpot readout shows "≈ 7.5 dB · conv. 5.5 + RS 2.0 · 130.1-G-3 §3.3.3".
- Tool 7 uses a fictional network; provider presets must come from the provider register with dates, not invented figures.

## Reconciliation with Penpot tool screens (2026-10-28)

Specs aligned to the approved screens (fictional values now identical): Tool 1 bytes `41 48 00 00 08 7E C4 12` (FLOAT32 12.5, INT16 −15342, APID slice 0x7E); Tool 2 five-step structure and version-bit injection; Tool 4 presets (concatenated / R-S / LDPC-Turbo at 4.0 dB); Tool 5 y = 0.03x − 40 with soft 40 / hard 50 °C (raw 2731 → 41.9 °C); Tool 6 frames from N(S) = 10; Tool 7 screen model (106.2 MB/pass, 424.8 MB/day, +64.8 MB/day; scenarios 82.6 / 53.1 / −41.4 / −35.2 checked); Tool 8 adds the Both preset.

Penpot edits (verified in the editor after reconnect): Tool 2 preset names; Tool 4 coding-gain readout "≈ 7 dB" → "Not shown · needs cited reference curves" (unsourced number removed); Tool 9 scenario D → "Frame lock OK, but uncorrectable codewords"; layer-8 guide → "Packets missing but frames fine". Tool 7 "What changed?" cards checked: each label sits with its own result (the earlier mismatch came from text extraction order). Decision-log row added.
