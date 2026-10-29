---
id: link-budgets
title: Link budgets and margin
definition: A link budget adds up every gain and loss between transmitter and receiver to predict the received Eb/N0, and the margin is how far that prediction sits above what the demodulator and decoder need.
section: space-link
subsection: rf-and-bands
level: advanced
order: 30
est_minutes: [30, 45]
prerequisites: [rf-basics, bits-symbols-and-rates, channel-coding]
learning_paths: [communications-deep-dive, fast-reference]
objectives:
  - Walk a link budget line by line from transmitter power to margin.
  - Explain EIRP, free-space loss, G/T, C/N0 and Eb/N0 and how they combine.
  - Explain why margin changes with elevation, data rate and coding.
  - Read a CCSDS design control table and its tolerance conventions.
chain_position:
  direction: both
  stage: Modulation & RF
glossary_terms: [eirp, link-margin, eb-n0]
related_topics: [rf-basics, channel-coding, contact-planning, bandwidth-efficient-modulation]
related_labs: [channel-coding-sandbox, data-budget-calculator]
standards: [ccsds-401-0-b-32]
sources:
  - {id: CCSDS-401, loc: "§4.1.2, §4.1.3"}
  - {id: CCSDS-130.1-G-3, loc: "§3.3.3, §7.4.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"We have 4 dB of margin at 5°" is how RF engineers decide data rates, pass masks and whether a fault is physics or configuration. A software or operations engineer who can follow the budget can tell when a low-elevation dropout is expected and when it is not.

## Plain-language explanation

Start with how much power leaves the transmitter, add the antenna's focusing gain, subtract everything the signal loses on the way — mostly the enormous spreading loss over distance, plus a little atmosphere and pointing — and compare what arrives with the receiver's own noise. Divide by the data rate to get energy per bit. The difference between that and what the decoder needs is the margin.

::::beginner{title="A household budget in decibels"}
A link budget is a household budget where income and spending are in decibels. Transmit power and antenna gains are income; distance, atmosphere, pointing and cable losses are spending. What is left after the receiver's needs is the margin — your savings for a rainy day. Negative savings means the link does not work.
::::

## Precise terminology

:::claim{label="standard" source="CCSDS-401" loc="§4.1.3 (103), (114), (115), (118)"}
In the CCSDS design control table, EIRP is transmitter power plus effective antenna gain (dBW); free-space loss is the loss from the signal spreading between stations; atmospheric attenuation depends on elevation, weather and location; and noise spectral density is the noise in a 1 Hz bandwidth (dBW/Hz).
:::

::::expert{title="Carrier and data margins defined"}
:::claim{label="standard" source="CCSDS-401" loc="§4.1.3 (121), (173)–(175)"}
Carrier performance margin is the excess over a 10 dB signal-to-noise ratio in the phase-locked loop (the carrier threshold); data performance margin is received Eb/N0 minus required Eb/N0, where the required value includes phase-jitter, demodulator, waveform-distortion and ranging-interference losses on top of the coded requirement.
:::
::::

## Where in the chain

The budget spans the physical layer of one direction: transmitter, antenna, path, receiving antenna and receiver. It feeds requirements to coding (required Eb/N0) and to operations (usable elevation, data rate).

## How it works, step by step

1. **EIRP** = transmitter power + antenna gain − line losses.
2. **Path losses**: free-space loss (grows with distance and frequency), atmosphere, polarization and pointing.
3. **Receiver**: G/T (antenna gain over system noise temperature).
4. **C/N0** = EIRP − losses + G/T − Boltzmann's constant (in dB).
5. **Eb/N0** = C/N0 − 10 log₁₀(information bit rate).
6. **Margin** = Eb/N0 − required Eb/N0 (from the code's performance plus implementation losses).

:::claim{label="standard" source="CCSDS-401" loc="§4.1.2"}
CCSDS recommends a uniform design control table for exchanging link performance between agencies, with favourable and adverse tolerances computed at 3-sigma for telecommand and 2-sigma for all other systems.
:::

::::expert{title="Required Eb/N0 for concatenated codes"}
:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§7.4.2"}
For an overall BER of 10⁻⁶ with 8920-bit blocks (interleaving depth 5), the (255,223) Reed–Solomon code concatenated with the (7,1/2) convolutional code needs a bit SNR of about 2.6 dB in CCSDS simulations.
:::
::::

## What operators and engineers see

Station displays show estimated Eb/N0 or C/N0 against elevation; the budget predicts the curve. Measured values tracking a few dB below prediction across every pass point at a systematic loss (pointing, polarization, configuration); dips only at low elevation are expected geometry.

:::claim{label="example" loc="fictional console"}
`EL 5.1° · C/N0 72.0 dB-Hz · Eb/N0 9.0 dB · req 4.6 dB · margin 4.4 dB` — fictional.
:::

## Misconceptions and failure symptoms

- **"Double the data rate, same margin."** Eb/N0 drops by 3 dB when the rate doubles.
- **"Margin is fixed."** Range changes free-space loss by over 12 dB across a LEO pass (see the worked example).
- **"Required Eb/N0 is the code's curve."** Implementation and synchronization losses add to it.
- **Symptom — margin consistently 3 dB low on every pass:** look for a polarization mismatch, pointing offset or a configuration error before blaming weather.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Table format, terms, tolerance sigmas | CCSDS 401.0-B-32 §4.1 | Standard-defined |
| Required margin policy | Agency and mission practice | Common practice |
| Power, antennas, rates, codes, elevation mask | Mission and station | Mission-specific |

:::claim{label="mission"}
Your mission's link budget — not this page — defines the margins you can rely on; numbers here are fictional and simplified.
:::

## Worked example

:::claim{label="example" loc="fictional LEO downlink"}
A fictional S-band LEO downlink at 2.25 GHz: 2 W transmitter (3.0 dBW), 3 dBi antenna, 1 dB line loss → EIRP 5.0 dBW. Ground G/T 5.0 dB/K; 0.8 dB atmosphere and polarization loss; information rate 2.0 Mbit/s; required Eb/N0 2.6 dB (concatenated code) + 2.0 dB fictional implementation loss = 4.6 dB.

| | 5° elevation | Overhead |
| :-- | :-- | :-- |
| Slant range (500 km orbit) | ≈ 2,077 km | 500 km |
| Free-space loss | 165.8 dB | 153.5 dB |
| C/N0 = 5.0 − FSL − 0.8 + 5.0 + 228.6 | 72.0 dB-Hz | 84.3 dB-Hz |
| Eb/N0 = C/N0 − 63.0 | 9.0 dB | 21.3 dB |
| Margin | 4.4 dB | 16.7 dB |

**Answer explanation:** free-space loss is 20 log₁₀(4πd/λ); distance alone moves it by 12.3 dB across the pass. The link closes with margin at 5°, which is why low-elevation errors usually mean something else is also wrong.
:::

## Related

- Topics: RF basics, channel coding, contact planning, bandwidth-efficient modulation.
- Labs: channel coding sandbox, data budget calculator.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
