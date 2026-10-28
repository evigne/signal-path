---
id: carrier-and-symbol-sync
title: Carrier and symbol synchronization
definition: Before any data can be read, the receiver has to lock onto the carrier signal and then recover the timing of each transmitted symbol.
section: space-link
subsection: synchronization-and-coding
level: core
est_minutes: [20, 30]
prerequisites: [bits-symbols-and-rates]
learning_paths: [operator-conversation-fluency, communications-deep-dive]
objectives:
  - Explain the order in which a receiver acquires lock and why each step depends on the previous one.
  - Describe why Doppler shift forces frequency sweeps on uplink acquisition.
  - Explain why receivers need enough symbol transitions and how CCSDS limits long runs.
  - Read carrier, symbol and frame lock indicators together to localise a problem.
chain_position:
  direction: both
  stage: Modulation & RF
  after: Coding & sync marker
glossary_terms: [doppler-shift, symbol-rate, pseudo-randomizer]
related_topics: [bits-symbols-and-rates, sync-markers, pseudo-randomization]
related_symptoms: [carrier-but-no-frame-lock, no-carrier]
standards: [ccsds-401-0-b-32]
sources:
  - {id: CCSDS-401, loc: "§1.5, §2.1.1, §2.1.3A, §2.4.9"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - Add a source covering ground demodulator lock indicators (provider or equipment documentation) before describing specific displays as fact.
---

## Why it matters

Most "we lost the spacecraft" moments start here. If the receiver cannot hold the carrier or the symbol timing, nothing downstream works, and the fault can look like a dead spacecraft when it is really a frequency or rate setting.

## Plain-language explanation

Tuning a radio comes first: the receiver must find the carrier at the right frequency even though motion shifts that frequency (Doppler). Then it must find the rhythm of the symbols — when one ends and the next begins — which it learns from the changes in the signal. Only then can it read bits, and only after that can it find frames.

## Precise terminology

- **Carrier lock:** the receiver's tracking loop follows the carrier's frequency and phase.
- **Symbol (or bit) synchronization:** the receiver samples each symbol at the right moment.
- **Category A / Category B:** CCSDS mission categories by distance.

:::claim{label="standard" source="CCSDS-401" loc="§1.5"}
CCSDS Category A missions are those less than 2 × 10⁶ km from Earth; Category B missions are at 2 × 10⁶ km or more.
:::

## Where in the chain

Carrier and symbol synchronization happen in the receivers at both ends: in the ground station's demodulator on the downlink, and in the spacecraft's receiver on the uplink. They sit below frame synchronization and decoding.

## How it works, step by step

1. **Acquire the carrier.** Predicted Doppler is applied and, on the uplink, the ground transmitter sweeps its frequency so the spacecraft receiver can catch it.

:::claim{label="standard" source="CCSDS-401" loc="§2.1.3A"}
For Category A Earth-to-space links, CCSDS 401.0-B-32 notes Doppler shifts up to about ±80 kHz at 2 GHz and ±300 kHz at 7 GHz, receiver lock-in ranges much smaller than that, and Doppler usually predictable to better than ±1 kHz; it recommends ground transmitter sweep capabilities from at least ±1 kHz up to ±150 kHz at 2 GHz and ±500 kHz at 7 GHz.
:::

:::claim{label="standard" source="CCSDS-401" loc="§2.1.1"}
CCSDS 401.0-B-32 records that most agencies' spacecraft receivers use phase-locked loops, and that conventional phase-locked-loop receivers need a residual carrier to operate efficiently.
:::

2. **Recover symbol timing.** The symbol clock is extracted from transitions in the received symbols.
3. **Read bits or soft symbols**, then hand them to frame synchronization and decoding.

:::claim{label="standard" source="CCSDS-401" loc="§2.4.9"}
Symbol clock recovery usually takes its timing from coded symbol transitions; CCSDS recommends limiting runs of identical coded symbols to 64, a minimum of 125 transitions per 1000 coded symbols for Category A and 275 for Category B, and notes that a pseudo-randomizer improves lock stability.
:::

## What operators and engineers see

Lock indicators normally come up in order: carrier, then symbol or bit, then frame. Reading them together localises a problem: no carrier points at RF, pointing, frequency or the spacecraft transmitter; carrier without symbol lock points at symbol-rate or modulation settings or low signal-to-noise; symbol lock without frame lock points at sync-marker, coding or randomizer settings.

:::claim{label="example" loc="fictional console"}
`09:12:04Z carrier LOCK · 09:12:05Z symbol LOCK · 09:12:05Z frame SEARCH` — fictional; this order is what the *Carrier but no frame lock* symptom looks like.
:::

## Misconceptions and failure symptoms

- **"Carrier lock means data is flowing."** It only means the carrier is tracked.
- **"Doppler is negligible."** At S- and X-band it is many kilohertz for low Earth orbit, larger than receiver lock-in ranges.
- **"Long runs of zeros are harmless."** They starve symbol timing; this is why the randomizer is mandatory.
- **Symptom — carrier lock drops at the start and end of a pass:** often low elevation and signal margin, or Doppler rate beyond the tracking loop; check pointing, predicts and loop settings.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Sweep ranges, transition density, mission categories | CCSDS 401.0-B-32 (recommendations) | Standard-defined |
| Lock indicator names and thresholds | Ground and spacecraft equipment | Common practice |
| Frequencies, sweep profile, symbol rate, loop bandwidths | Mission, station configuration and licence | Mission-specific |

:::claim{label="mission"}
Your carrier frequencies, sweep profile, symbol rate and receiver loop settings come from the mission's frequency assignment, link budget and ground-station configuration.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional S-band LEO pass: the predicted uplink Doppler at acquisition is +45 kHz. The station pre-offsets its uplink by the prediction and sweeps ±3 kHz around it to cover prediction error and the spacecraft receiver's rest-frequency uncertainty; the spacecraft carrier loop locks 4 s into the sweep. On the downlink, carrier lock arrives first, symbol lock 1 s later, frame lock within a few frames.

**Answer explanation:** the sweep only needs to cover the uncertainty left after applying the predicted Doppler, which is why accurate orbit predicts shorten acquisition.
:::

## Related

- Glossary: Doppler shift, symbol rate, pseudo-randomizer.
- Topics: bits/symbols/rates, sync markers, pseudo-randomization.
- Symptom: Carrier but no frame lock.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
