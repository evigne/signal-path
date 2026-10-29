---
id: rf-basics
title: RF basics for space links
definition: The radio-frequency layer puts coded symbols onto a carrier by modulation, radiates it with a chosen polarization, and must deliver enough signal energy per bit above the noise for the receiver to lock and decode.
section: space-link
subsection: rf-and-bands
level: intro
order: 10
est_minutes: [20, 30]
prerequisites: [bits-symbols-and-rates]
learning_paths: [space-comms-101, operator-conversation-fluency, communications-deep-dive]
objectives:
  - Explain carrier, modulation, residual versus suppressed carrier, and polarization in plain words.
  - Name the CCSDS-recommended modulations for low and high rate links.
  - Describe what a link margin is and why it shrinks at low elevation.
  - Explain what a coherent transponder turnaround ratio is used for.
chain_position:
  direction: both
  stage: Modulation & RF
  after: Coding & sync marker
glossary_terms: [residual-carrier, eb-n0, doppler-shift, symbol-rate]
related_topics: [frequency-bands, carrier-and-symbol-sync, bits-symbols-and-rates]
related_symptoms: [no-carrier]
standards: [ccsds-401-0-b-32]
sources:
  - {id: CCSDS-401, loc: "§2.1.1, §2.1.2, §2.3.1, §2.3.2, §2.3.5, §2.4.11, §2.4.17A, §2.6.1, §4.1.2, §4.1.3"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"We have 3 dB of margin", "it's a residual-carrier link", "switch to LCP" — operators and RF engineers use this vocabulary to explain why a pass worked or didn't. You don't need to design a link, but you need to know what these words mean.

## Plain-language explanation

**Radio is a wave.** A transmitter makes an electric signal swing back and forth millions or billions of times a second; the antenna turns it into a radio wave. The number of swings per second is the **frequency** (2 GHz = 2 billion per second). The distance the wave travels during one swing is the **wavelength**: at 2 GHz it is about 15 cm, at 8 GHz about 3.7 cm.

**A pure, steady wave is called the carrier.** On its own it carries no information — it is like a constant hum.

**Modulation writes data onto the carrier** by changing one of its properties in a pattern the receiver knows:

- **Amplitude** — make the wave louder or quieter.
- **Frequency** — make it slightly higher or lower in pitch.
- **Phase** — shift where each swing starts; for example "no shift" means 0 and "half-swing shift" means 1. Spacecraft mostly use phase.

Some schemes leave part of the pure hum visible (a **residual carrier**), which makes it easy for the receiver to find; others put all the power into the data (**suppressed carrier**), which is more efficient but harder to lock onto.

**Antennas focus the wave.** A dish works like the reflector of a torch: it squeezes the power into a narrow beam. That focusing is the antenna's **gain**. Bigger dishes and higher frequencies give narrower, stronger beams — but they must be pointed more accurately.

**The signal weakens with distance;** what matters at the receiver is how much energy each bit has compared with the background noise.

## Precise terminology

- **Residual carrier:** modulation that leaves a carrier component for the receiver to track.
- **Suppressed carrier:** modulation with no separate carrier component (e.g. BPSK, QPSK).
- **Polarization:** the rotation sense of the radiated wave (RCP or LCP for circular).
- **Eb/N0:** energy per bit over noise spectral density; the figure that sets error rate.

:::claim{label="standard" source="CCSDS-401" loc="§2.1.1, §2.3.1, §2.3.2"}
CCSDS 401.0-B-32 recommends phase modulation with residual carriers on Earth-to-space links, residual carriers for low-rate telemetry, and suppressed-carrier modulations where a residual carrier would exceed power-flux-density limits.
:::

:::claim{label="standard" source="CCSDS-401" loc="§2.1.2, §2.3.5"}
Circular polarization is recommended on Earth-to-space links, and RCP or LCP on space-to-Earth links.
:::

## Where in the chain

The RF stage sits below coding and sync: coded symbols go into the modulator onboard (downlink) or at the station (uplink); the receiver at the other end tracks the carrier, recovers symbols and hands them up.

## How it works, step by step

1. **Choose the modulation for the rate.**

:::claim{label="standard" source="CCSDS-401" loc="§2.4.17A, §2.4.21A"}
For Category A (near-Earth) high-rate telemetry, CCSDS 401.0-B-32 recommends GMSK or OQPSK modulation.
:::

2. **Resolve phase ambiguity.** Suppressed-carrier receivers can lock at the wrong phase.

::::expert{title="Phase ambiguity in suppressed-carrier receivers"}
A suppressed-carrier receiver rebuilds the carrier from the data itself, so it cannot tell a phase of 0° from 180° (BPSK) or from 90°, 180° or 270° (QPSK). It may lock "upside down" and output every bit inverted, or with the I and Q streams swapped. The fix is to look for a known pattern — the sync marker — in each possible rotation.

:::claim{label="standard" source="CCSDS-401" loc="§2.4.11"}
In QPSK systems, CCSDS 401.0-B-32 recommends using the sync marker to resolve phase ambiguity.
:::
::::

3. **Close the link.** Transmit power, antenna gains, distance, atmosphere and receiver noise combine into the Eb/N0 that arrives; the margin is how much above the decoder's requirement it sits.

:::claim{label="standard" source="CCSDS-401" loc="§4.1.2, §4.1.3"}
CCSDS 401.0-B-32 provides a standard link design control table for exchanging link budgets and defines its terms: free-space loss (signal spreading with distance), atmospheric attenuation (depending on elevation, weather and location), and data performance margin — received Eb/N0 minus required Eb/N0, where the required value adds implementation losses to the coded requirement.
:::

4. **Track Doppler and ranging** with a coherent transponder if the mission needs navigation data.

::::expert{title="Coherent turnaround ratios"}
A coherent transponder derives its downlink frequency from the uplink it receives, multiplied by a fixed ratio, so the ground can measure the two-way Doppler shift very precisely. The ratio is chosen so that uplink and downlink fall in their allocated bands.

:::claim{label="standard" source="CCSDS-401" loc="§2.6.1"}
For coherent transponders between the 2025–2120 MHz uplink and 2200–2300 MHz downlink bands, CCSDS 401.0-B-32 recommends a turnaround frequency ratio of 221/240.
:::
::::

## What operators and engineers see

Station displays usually show received signal level or estimated Eb/N0 or C/N0, the antenna's elevation, polarization setting, and modulation and rate configuration. Margin typically falls at low elevation because the path is longer and passes through more atmosphere.

:::claim{label="example" loc="fictional console"}
`EL 7.2° · Eb/N0 6.1 dB (req 2.5) · margin 3.6 dB · pol RCP · mod OQPSK 4.588 Msym/s` — fictional values.
:::

## Misconceptions and failure symptoms

- **"More power always fixes it."** Wrong polarization, wrong frequency or wrong symbol rate will not be fixed by power.
- **"Residual carrier is old-fashioned."** It is still recommended for low-rate links and helps acquisition.
- **"Margin is fixed for a pass."** It varies with range, elevation, weather and pointing.
- **Symptom — no carrier at all:** check frequency, polarization, pointing and whether the spacecraft transmitter is on before suspecting anything higher up.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Recommended modulations, polarization, turnaround ratios | CCSDS 401.0-B-32 | Standard-defined |
| Margin policy (how much is "enough") | Mission and agency practice | Common practice |
| Frequencies, modulation, rates, antenna sizes | Mission, licence, station | Mission-specific |

:::claim{label="mission"}
Your mission's link budget and frequency assignment set the carrier frequencies, modulation, symbol rate, polarization and required margin; station configurations must match them.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional pass shows Eb/N0 of 6.1 dB at 20° elevation and 3.0 dB at 5°, with the decoder needing 2.5 dB. Frame errors appear below about 6°.

**Answer explanation:** margin falls from 3.6 dB to 0.5 dB as the path lengthens at low elevation; errors near the horizon are expected and point at margin, not a configuration fault.
:::

## Related

- Topics: frequency bands, carrier and symbol sync, bits/symbols/rates.
- Glossary: residual carrier, Eb/N0, Doppler shift, symbol rate.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
