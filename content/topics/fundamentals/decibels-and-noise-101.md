---
id: decibels-and-noise-101
title: Decibels and noise, gently
definition: Decibels turn huge multiplications into small additions — +3 dB is about double, +10 dB is ten times — and radio links are judged by how far the signal stands above the ever-present thermal noise, especially the energy each bit gets (Eb/N0).
section: fundamentals
level: intro
order: 40
est_minutes: [15, 20]
prerequisites: [why-space-links-are-different]
learning_paths: [space-comms-101]
objectives:
  - Convert between power ratios and decibels for the common cases (×2, ×10, ×0.5, ×1000).
  - Explain the difference between dB, dBW and dBm.
  - Explain where thermal noise comes from and why it sets a floor for every receiver.
  - Explain why doubling the bit rate halves the energy per bit (−3 dB in Eb/N0).
  - Add up a tiny link budget in decibels.
chain_position:
  direction: both
  stage: Modulation & RF
glossary_terms: [decibel, free-space-loss, eb-n0, eirp, link-margin, symbol-rate]
related_topics: [why-space-links-are-different, rf-basics, link-budgets, bits-symbols-and-rates, channel-coding]
related_labs: [channel-coding-sandbox, data-budget-calculator]
standards: [ccsds-401-0-b-32]
sources:
  - {id: ITU-R-V574, loc: "Annex 1 §1.1, §1.2, §5, §6.1"}
  - {id: NIST-CODATA-K}
  - {id: ITU-R-P525, loc: "Annex §2.3"}
  - {id: CCSDS-130.1-G-3, loc: "§3.3.1"}
  - {id: CCSDS-401, loc: "§4.1.3"}
  - {id: NASA-BSF-10, loc: "Signal Power"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Radio engineers speak in decibels: "we have 3 dB of margin", "the antenna gives 47 dBi", "Eb/N0 dropped by 2 dB at low elevation". Without decibels the numbers in a space link span more than twenty powers of ten. With them, a whole link budget becomes a column of additions and subtractions.

## Plain-language explanation

A decibel is a way to write a ratio as a small number you can add. The rules of thumb cover most conversations:

| Ratio | Decibels |
| :-- | :-- |
| × 2 | + 3 dB |
| × 10 | + 10 dB |
| × 100 | + 20 dB |
| × 1000 | + 30 dB |
| × ½ | − 3 dB |
| × 1/10 | − 10 dB |

Multiplying ratios means adding decibels: ×20 is ×2 then ×10, so 3 + 10 = 13 dB.

When decibels are measured against a fixed reference, the unit says so: **dBW** means "compared with 1 watt", **dBm** means "compared with 1 milliwatt". So 1 W = 0 dBW = 30 dBm, and 2 W ≈ 3 dBW.

**Noise is always there.** Every warm object — the antenna, the receiver's electronics, the ground, the sky — jiggles electrons and produces random electrical noise. A receiver can never hear a signal far below that noise floor. Engineers therefore care less about how strong the signal is and more about how far it stands **above** the noise.

**Faster data means less energy per bit.** If the received power is fixed and you send twice as many bits each second, each bit gets half the energy. Half is −3 dB. That is why a link that works at 1 Mbit/s may fail at 2 Mbit/s with everything else unchanged.

::::beginner{title="An analogy: talking in a noisy room"}
Your voice is the signal and the chatter of the room is the noise. Speaking slowly gives each word more time — more energy — so it is easier to understand. Speaking twice as fast with the same voice makes each word harder to catch. Error-correcting codes are like repeating key words in a clever way so the listener can fill in the ones they missed.
::::

## Precise terminology

:::claim{label="standard" source="ITU-R-V574" loc="Annex 1 §1.1, §1.2"}
ITU-R V.574 defines the decibel as one tenth of a bel: a power ratio P1/P2 in decibels is 10 log10(P1/P2), and for field quantities such as voltage, where power goes with the square, the factor is 20 instead of 10.
:::

:::claim{label="standard" source="ITU-R-V574" loc="Annex 1 §6.1"}
An absolute power level must say its reference: "dBW" means decibels relative to one watt and "dBm" decibels relative to one milliwatt.
:::

:::claim{label="standard" source="NIST-CODATA-K" loc="CODATA 2022 value"}
The Boltzmann constant k is exactly 1.380 649 × 10⁻²³ J/K; thermal noise power density is k times the noise temperature, which at 290 K is about −204 dBW/Hz (−174 dBm/Hz).
:::

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§3.3.1"}
Eb/N0 is the received signal energy per information bit divided by the one-sided noise spectral density; it is the usual measure of how much signal a code needs to reach a given error rate.
:::

## Where in the chain

Decibels and noise belong to the physical layer — the RF link between the spacecraft's transmitter and the ground station's receiver (and the reverse on the uplink). Their effects show up later as errors that channel coding must correct.

## How it works, step by step

A link budget follows the signal from transmitter to receiver, adding gains and subtracting losses in decibels:

1. **Transmitter power** in dBW.
2. **Plus antenna gain** (dBi, compared with an ideal antenna radiating equally in all directions). Power plus gain is the EIRP.
3. **Minus free-space loss**, which grows with distance and frequency.

:::claim{label="standard" source="ITU-R-P525" loc="Annex §2.3"}
Free-space loss between isotropic antennas is 32.4 + 20 log10 f + 20 log10 d dB, with f in MHz and d in km.
:::

4. **Minus other losses**: pointing, polarization, atmosphere, cables.
5. **Plus the receiving antenna gain**, then compare with the receiver's noise.
6. **Divide by the bit rate** (subtract 10 log10 of the rate) to get Eb/N0.
7. **Compare with what the code needs**; the difference is the margin.

:::claim{label="standard" source="CCSDS-401" loc="§4.1.3"}
CCSDS 401.0-B-32 defines data performance margin as the received Eb/N0 minus the required Eb/N0, where the requirement includes demodulator and other implementation losses on top of what the code alone needs.
:::

:::claim{label="practice" source="NASA-BSF-10" loc="Signal Power"}
NASA's Basics of Space Flight gives an example of decibels at work: a 47 dBi antenna is a power ratio of more than 50 000, so a 20 W transmitter behind it radiates about a megawatt along the beam — the effective isotropic radiated power.
:::

## What operators and engineers see

- Station displays of **C/N0** (carrier power to noise density, dB-Hz) and **Eb/N0** (dB) that rise and fall with elevation.
- **Margin** quoted in dB: positive means the link should work, near zero means errors are likely.
- Transmitter power in **dBW** or **dBm**, and antenna gains in **dBi**.

## Misconceptions and failure symptoms

- **"3 dB is a small number."** 3 dB is a factor of two; 10 dB is a factor of ten.
- **"dB and dBm are interchangeable."** dB is a ratio; dBm is an absolute power.
- **"A stronger signal always means fewer errors."** Errors depend on signal relative to noise, and on the bit rate.
- **"Margin is wasted power."** Margin absorbs rain, low elevation and pointing errors; without it, the link fails on a bad day.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Definitions of dB, dBW, dBm; free-space loss; k | ITU-R V.574, P.525; CODATA | Standard-defined |
| How margin is defined | CCSDS 401.0 | Standard-defined |
| Required margin (for example 3 dB) | Mission and agency rules | Mission-specific |

:::claim{label="mission"}
Your mission's link budget sets the transmitter power, antennas, data rates and required margin. The numbers below are fictional.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional link has Eb/N0 = 9 dB at 1 Mbit/s, and the code needs 4.6 dB. The team wants to send 4 Mbit/s instead. Does the link still close?

**Answer explanation:** 4 times the rate is 2 × 2, so −3 dB − 3 dB = −6 dB. Eb/N0 drops to 3 dB, which is 1.6 dB **below** the 4.6 dB requirement — the link fails. At 2 Mbit/s it would be 6 dB, leaving 1.4 dB of margin.
:::

## Related

- Topics: why space links are different, RF basics, link budgets, bits, symbols and rates, channel coding.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
