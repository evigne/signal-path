---
id: high-rate-coding-and-modulation
title: High-rate coding and modulation (SCCC, DVB-S2, VCM/ACM)
definition: For very high-rate payload downlinks CCSDS defines combined coding-and-modulation schemes — SCCC and a profile of DVB-S2 — that offer many modulation and code-rate combinations and can change them during a pass (VCM) or in response to feedback (ACM).
section: space-link
subsection: synchronization-and-coding
level: advanced
est_minutes: [20, 30]
prerequisites: [channel-coding, bandwidth-efficient-modulation, link-budgets]
learning_paths: [communications-deep-dive]
objectives:
  - Explain why high-rate links use higher-order modulation with strong codes.
  - Distinguish VCM from ACM.
  - Say how CCSDS frames are carried over SCCC and DVB-S2.
chain_position:
  direction: downlink
  stage: Coding & sync marker
  before: Modulation & RF
  after: Transfer frames
glossary_terms: [vcm-acm, code-rate, ldpc]
related_topics: [channel-coding, bandwidth-efficient-modulation, link-budgets, contact-planning]
standards: [ccsds-131-2-b-2, ccsds-131-3-b-2]
sources:
  - {id: CCSDS-131.2-B-2, loc: "§1.1, §1.2, §1.6"}
  - {id: CCSDS-131.3-B-2, loc: "§1.2, §1.3"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - The catalogue lists CCSDS 131.2-B-2 Cor. 1 (October 2026), which is not in the local library; read it before publishing.
---

## Why it matters

Earth-observation payloads produce hundreds of megabits per second. Fixed QPSK with one code wastes the link at high elevation and fails at low elevation; adaptive schemes match the waveform to the geometry and multiply the data returned per pass.

## Plain-language explanation

Packing more bits into each symbol (8PSK, 16APSK…) needs a stronger signal; strong modern codes make that workable. Because the signal is strongest when the spacecraft is overhead, the transmitter can switch to a denser format then and a sturdier one near the horizon — on a fixed schedule (VCM) or based on feedback from the ground (ACM).

## Precise terminology

:::claim{label="standard" source="CCSDS-131.2-B-2" loc="§1.2"}
CCSDS SCCC is a turbo-like, bit-interleaved coded-modulation scheme using QPSK, 8PSK, 16APSK, 32APSK and 64APSK with a wide range of code rates, built from two simple four-state encoders and a constant-length physical-layer frame with pilots.
:::

:::claim{label="standard" source="CCSDS-131.2-B-2" loc="§1.2"}
Variable Coding and Modulation (VCM) changes the format on a predetermined schedule (for example with elevation); Adaptive Coding and Modulation (ACM) adjusts it dynamically when a feedback channel, such as telecommand, is available.
:::

:::claim{label="standard" source="CCSDS-131.3-B-2" loc="§1.2, §1.3"}
CCSDS 131.3-B-2 defines how CCSDS transfer frames are carried over the DVB-S2 telecom standard (QPSK to 32APSK, LDPC-based codes at rates from 1/4 to 9/10, VCM and ACM), interfacing through the attached sync marker and sync-marked transfer frames, so commercial DVB-S2 equipment can be reused.
:::

## Where in the chain

These schemes replace the separate coding and modulation stages on high-rate downlinks: transfer frames go in, a physical-layer waveform comes out.

## How it works, step by step

1. **Target**: high-rate payload telemetry, especially EESS.

:::claim{label="standard" source="CCSDS-131.2-B-2" loc="§1.1"}
SCCC mainly targets high-data-rate telemetry such as EESS payload downlinks, and may be used on other links and services provided CCSDS RF modulation recommendations are respected.
:::

2. **Plan formats** against a dynamic link budget (VCM) or enable feedback (ACM).
3. **Frame the data**: CCSDS frames are mapped into the scheme's physical-layer frames.
4. **Receive**: the ground demodulator follows the format changes signalled in the physical-layer framing.

:::claim{label="standard" source="CCSDS-131.2-B-2" loc="§1.6"}
CCSDS notes that compliance with 131.2-B-2 may involve claimed patents, whose holders have offered licences on reasonable and non-discriminatory terms.
:::

## What operators and engineers see

Pass displays show the current modulation and code format (often called MODCOD), its changes over the pass, and throughput; ground receivers report lock per format.

:::claim{label="example" loc="fictional pass"}
`EL 12° QPSK r1/2 · EL 35° 8PSK r3/4 · EL 70° 16APSK r5/6 · EL 30° 8PSK r3/4` — fictional VCM schedule.
:::

## Misconceptions and failure symptoms

- **"Higher-order modulation is always better."** It needs more Eb/N0; at low elevation it fails.
- **"ACM and VCM are the same."** VCM follows a plan; ACM needs a feedback path.
- **"DVB-S2 replaces CCSDS frames."** The CCSDS profile carries CCSDS frames over DVB-S2.
- **Symptom — data loss exactly at format changes:** ground receiver not following the schedule or signalling; check configuration on both ends.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Formats, frame structures, interface to CCSDS frames | CCSDS 131.2-B-2, 131.3-B-2 | Standard-defined |
| Which formats, schedule or ACM policy | Mission, from link budget | Mission-specific |
| Receiver selection and IP licensing | Mission and ground provider | Mission-specific |

:::claim{label="mission"}
Your mission's link budget and payload ICD define the formats and the VCM schedule or ACM rules; providers must support the same profile.
:::

## Worked example

:::claim{label="example" loc="fictional comparison"}
A fictional 10-minute pass at 100 Msym/s: fixed QPSK rate 1/2 for the whole pass versus a VCM plan that spends 4 minutes at QPSK 1/2, 4 at 8PSK 3/4 and 2 at 16APSK 5/6.

**Answer explanation:** information bits per symbol are 2 × 1/2 = 1, 3 × 3/4 = 2.25 and 4 × 5/6 ≈ 3.33. Fixed: 100 Mb/s × 600 s = 60 Gbit. VCM: (4 × 1 + 4 × 2.25 + 2 × 3.33) × 60 s × 100 Mb/s ≈ 118 Gbit — about twice the data, if the link budget supports each format at its elevation (ignoring framing and pilot overhead).
:::

## Related

- Topics: channel coding, bandwidth-efficient modulation, link budgets, contact planning.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
