---
id: ranging-and-doppler
title: Ranging and Doppler tracking
definition: Radiometric tracking measures how far away a spacecraft is (ranging, from round-trip light time) and how fast that distance changes (Doppler), using coherent transponders and ranging codes on the communications carrier.
section: space-link
subsection: rf-and-bands
level: advanced
order: 40
est_minutes: [20, 30]
prerequisites: [rf-basics, carrier-and-symbol-sync]
learning_paths: [communications-deep-dive]
objectives:
  - Explain how round-trip light time gives range.
  - Explain coherent turnaround and why it enables two-way Doppler.
  - Contrast regenerative and transparent PN ranging and the T4B and T2B codes.
chain_position:
  direction: both
  stage: Modulation & RF
glossary_terms: [pn-ranging, doppler-shift]
related_topics: [rf-basics, carrier-and-symbol-sync, link-budgets]
standards: [ccsds-401-0-b-32, ccsds-414-1-b-3]
sources:
  - {id: CCSDS-414.1-B-3, loc: "§1.1, §3.2"}
  - {id: CCSDS-401, loc: "§2.6.1, §2.5"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Orbit determination needs range and Doppler, and these measurements share the carrier with telemetry and commands. Ranging affects link budgets (power taken from data), station configuration and pass planning — and is a common "why is the data channel weaker during this pass?" answer.

## Plain-language explanation

Send a recognizable pattern up, have the spacecraft send it back, and time the round trip: half of it times the speed of light is the distance. If the spacecraft's transmitter is locked to the frequency it receives, the frequency shift on the return tells you how fast the distance is changing.

## Precise terminology

- **Coherent transponder:** derives its downlink frequency from the received uplink by a fixed ratio.
- **Regenerative ranging:** the spacecraft tracks and regenerates the ranging code before sending it back.
- **Transparent (turnaround) ranging:** the spacecraft returns the received ranging signal, noise included.

:::claim{label="standard" source="CCSDS-414.1-B-3" loc="§1.1"}
PN ranging measures the round-trip light time between a ground station and a spacecraft; regenerative ranging mainly suits low-SNR (for example deep-space) cases, while transparent ranging suits high-SNR cases or when high accuracy is not required.
:::

## Where in the chain

Ranging codes and the coherent carrier ride on the same RF link as telemetry and commands; the spacecraft transponder and the station's ranging equipment do the work, and the results go to flight dynamics rather than to telemetry processing.

## How it works, step by step

1. **Coherent turnaround.**

:::claim{label="standard" source="CCSDS-401" loc="§2.6.1"}
For coherent transponders between the 2025–2120 MHz uplink and 2200–2300 MHz downlink bands, CCSDS 401.0-B-32 recommends a 221/240 turnaround frequency ratio.
:::

2. **Choose the ranging code.**

:::claim{label="standard" source="CCSDS-414.1-B-3" loc="§3.2.2, §3.2.3"}
The T4B code (weighted-voting balanced Tausworthe, ν = 4) is selected when ranging accuracy is the priority and T2B (ν = 2) when acquisition time is the priority, for example with a very weak ranging signal; both combine six component sequences into a code of length 2 × 7 × 11 × 15 × 19 × 23 = 1,009,470 chips.
:::

3. **Measure** the code phase on return (range) and the carrier frequency shift (Doppler).
4. **Calibrate** station delays, then deliver measurements to orbit determination.

## What operators and engineers see

Station displays show ranging acquisition status, range residuals and Doppler counts; flight dynamics teams see tracking data files. During ranging, part of the transmitted power goes to the ranging signal, which appears in the link budget as data-channel loss.

:::claim{label="example" loc="fictional console"}
`RNG T4B · ACQ OK · RTLT 13.342 ms · range 2,000.0 km · 2-way Doppler −41.7 kHz` — fictional.
:::

## Misconceptions and failure symptoms

- **"Ranging is free."** It takes power from the carrier and data channels.
- **"Doppler needs ranging."** Two-way Doppler needs a coherent transponder, not a ranging code.
- **"Transparent ranging is always worse."** It is simpler and fine at high SNR.
- **Symptom — data channel margin drops whenever ranging is on:** expected power sharing; check the modulation indices in the budget.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| PN codes, processing, turnaround ratios | CCSDS 414.1-B-3, 401.0-B-32 | Standard-defined |
| Whether to range, which code, modulation indices | Mission and flight dynamics | Mission-specific |
| Calibration and scheduling of ranging passes | Station operations | Common practice |

:::claim{label="mission"}
Your mission's tracking requirements set when ranging runs, which code is used and how much power it takes from data.
:::

## Worked example

:::claim{label="example" loc="fictional measurement"}
A fictional round-trip light time of 13.342 ms is measured after removing station delays.

**Answer explanation:** range = c × RTLT / 2 = 299,792.458 km/s × 0.013342 s / 2 ≈ 2,000 km. A 1 µs timing error would be about 150 m of range, which is why station delay calibration matters.
:::

## Related

- Topics: RF basics, carrier and symbol sync, link budgets.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
