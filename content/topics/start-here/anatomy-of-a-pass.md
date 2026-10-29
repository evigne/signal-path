---
id: anatomy-of-a-pass
title: Anatomy of a pass, minute by minute
definition: A pass is the few minutes a ground station can see a spacecraft; this page follows one fictional 10-minute low-orbit pass from the schedule to acquisition of signal, lock, commanding, playback and loss of signal.
section: start-here
level: intro
order: 40
est_minutes: [12, 18]
prerequisites: [why-space-links-are-different]
learning_paths: [space-comms-101]
objectives:
  - Put the main events of a low-orbit pass in order, from scheduling to the post-pass report.
  - Explain what AOS and LOS mean, and why "AOS" can also mean Advanced Orbiting Systems.
  - Explain why the ground station must correct for Doppler shift during the pass.
  - Name the three "locks" (carrier, symbol, frame) a station reports and the order they come in.
  - Say why playback of recorded data competes with real-time data for pass minutes.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [aos-los, doppler-shift, frame-synchronization, clcw, link-margin]
related_topics: [why-space-links-are-different, uplink-and-downlink, carrier-and-symbol-sync, contact-planning, ground-stations-and-networks]
related_labs: [end-to-end-walkthrough, data-budget-calculator]
related_symptoms: [carrier-but-no-frame-lock, pass-done-data-missing]
standards: [ccsds-401-0-b-32]
sources:
  - {id: NASA-SOA-11, loc: "§11.2.1, §11.4"}
  - {id: CCSDS-401, loc: "§2.1.1, §2.1.3A"}
  - {id: NASA-BSF-10, loc: "Phase Lock; One-way, Two-way, Three-way; Telemetry Lock"}
  - {id: CCSDS-232.0-B-4, loc: "§4.2.1"}
  - {id: CCSDS-720.1-G-4, loc: "§2.1"}
  - {id: CCSDS-911.1-B-5, loc: "§1.1, §2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Most operations conversations happen during or just after a pass: "we got AOS on time", "frame lock dropped at low elevation", "playback finished before LOS". Knowing the sequence of a pass gives you a timeline to hang every other topic on.

## Plain-language explanation

Before the pass, the mission books time on a ground station and tells it which spacecraft to expect, where it will appear and how its radio is configured. When the spacecraft rises above the station's horizon mask, the antenna finds its signal — **acquisition of signal (AOS)**. The receiver locks onto the radio wave, then onto the rhythm of the symbols, then onto the start of each frame. Telemetry flows; operators check the spacecraft's health and send commands. The spacecraft also replays data it recorded while out of contact. As it sinks toward the horizon the signal weakens, and finally the station loses it — **loss of signal (LOS)**. Afterwards, the station reports how the pass went and delivers any remaining data.

::::beginner{title="Two meanings of AOS"}
In pass schedules, **AOS means Acquisition of Signal** — the moment a station first receives the spacecraft. In protocol documents, **AOS means Advanced Orbiting Systems** — a CCSDS frame format for high-rate links. Same letters, unrelated ideas. If someone says "AOS at 10:02", they mean the pass; if they say "AOS frames", they mean the protocol.
::::

## Precise terminology

- **AOS / LOS:** acquisition of signal and loss of signal; the start and end of the usable contact.
- **Elevation mask:** the lowest elevation above the horizon at which the station will track or use the signal.
- **Carrier lock → symbol lock → frame lock:** the station's receiver first tracks the radio carrier, then the symbol timing, then finds frame boundaries.
- **Real-time vs playback:** data generated now versus data recorded onboard earlier.

:::claim{label="practice" source="NASA-SOA-11" loc="§11.2.1, §11.4"}
NASA's small-spacecraft report notes that a LEO spacecraft is in a direct-to-Earth station's view for only part of its orbit, and that to acquire it operators commonly point a directional antenna 5–10° above the horizon.
:::

## Where in the chain

A pass is when the whole chain is connected at once: spacecraft, RF link, ground station, provider network and mission control. Outside a pass, the spacecraft stores data and executes commands it already has.

## How it works, step by step

The times below are for one fictional overhead pass of a spacecraft at 550 km with a 5° mask (about 9.8 minutes from AOS to LOS).

:::claim{label="example" loc="fictional pass timeline"}
| Time | Event |
| :-- | :-- |
| T−30 min | Pass confirmed; station loads the spacecraft's pointing predictions and radio configuration. |
| T−5 min | Antenna slews to where the spacecraft will rise; delivery link to mission control set up. |
| T+0:00 | **AOS** at 5° elevation; carrier lock, then symbol lock, then frame lock. |
| T+0:45 | Real-time housekeeping telemetry on screen; operators check health. |
| T+1:30 | Uplink carrier on; spacecraft locks; first commands sent and acknowledged. |
| T+2:00 → T+8:30 | Recorder playback of data stored since the last pass. |
| T+4:54 | Maximum elevation; strongest signal, fastest frequency change. |
| T+9:00 | Commanding stops; last acknowledgements read. |
| T+9:48 | **LOS** below 5°. |
| T+20 min | Station sends its pass report; any remaining recorded data is delivered. |
:::

**Acquisition and lock.** The station's receiver must find a carrier that is shifted in frequency by the spacecraft's motion, then lock its loops.

:::claim{label="standard" source="CCSDS-401" loc="§2.1.3A"}
For near-Earth (Category A) Earth-to-space links, CCSDS 401.0-B-32 notes Doppler shifts of up to about ±80 kHz at 2 GHz, receiver lock-in ranges much smaller than that, and Doppler that is usually predictable to better than ±1 kHz — which is why ground transmitters sweep or pre-compensate the uplink frequency.
:::

:::claim{label="standard" source="CCSDS-401" loc="§2.1.1"}
CCSDS 401.0-B-32 records that most agencies' spacecraft receivers use phase-locked loops.
:::

:::claim{label="practice" source="NASA-BSF-10" loc="One-way, Two-way, Three-way"}
NASA's Basics of Space Flight explains that a downlink stays "one-way" until the spacecraft's receiver has locked onto the uplink, and that this change can only show up in telemetry a full round-trip light time later.
:::

**Commanding and acknowledgement.**

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.2.1"}
The spacecraft reports its command-receiving state on the downlink in a 32-bit Communications Link Control Word, including No RF Available and No Bit Lock flags and the sequence number of the next command frame it expects.
:::

**Playback and delivery.**

:::claim{label="practice" source="CCSDS-720.1-G-4" loc="§2.1"}
CCSDS describes onboard solid-state mass memory as holding data for later download; because the storage is random-access, lost data can be sent again — the basis for file-based protocols such as CFDP.
:::

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§1.1, §2.1"}
The SLE Return All Frames service delivers to a mission user all telemetry frames from one physical channel, each annotated with information such as the earth receive time.
:::

## What operators and engineers see

:::claim{label="example" loc="fictional console log"}
```
10:02:11Z  AOS  EL 05.0°  CARRIER LOCK
10:02:13Z  SYMBOL LOCK  2.000 Msym/s
10:02:14Z  FRAME LOCK  ASM 1ACFFC1D  VC0 count 18402
10:03:41Z  UPLINK ON  CLCW NoRF=0 NoBitLock=0
10:03:55Z  TC VC1 V(S)=37  CLCW N(R)=37
10:07:05Z  MAX EL 48.1°  Doppler −0.3 kHz
10:11:59Z  LOS  EL 05.0°
```
Fictional: the three locks arrive in seconds, commanding starts once the spacecraft reports RF and bit lock, and the frequency shift passes through zero at maximum elevation.
:::

## Misconceptions and failure symptoms

- **"AOS means data."** AOS means signal; frame lock and good data can come seconds later — or never, if the configuration is wrong.
- **"The whole pass is usable."** Low-elevation minutes are weaker and noisier; many missions command only above a higher elevation.
- **"Playback is free."** Playback shares the same downlink rate and minutes as real-time data.
- **Symptom — carrier but no frame lock:** see the symptom guide.
- **Symptom — pass done, data missing:** see the symptom guide.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Doppler ranges, lock behaviour, CLCW fields | CCSDS 401.0, 232.0 | Standard-defined |
| Pass sequence (health check, then commanding, then playback) | Operations teams | Common practice |
| Elevation mask, commanding window, playback priority | Mission | Mission-specific |

:::claim{label="mission"}
Your mission's pass plan sets when commanding is allowed, which data plays back first and what counts as a successful pass. The timeline here is fictional.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional pass lasts 9.8 minutes. Frame lock comes 3 seconds after AOS, operators use 1.5 minutes for health checks and commanding, and the last 30 seconds are too weak to use. How many minutes are left for playback?

**Answer explanation:** 9.8 − 0.05 − 1.5 − 0.5 ≈ 7.75 minutes. At a fictional 2 Mbit/s that is about 116 MB of playback (7.75 × 60 × 2 × 10⁶ ÷ 8 bytes), before framing and coding overheads. The data budget calculator works this out per day.
:::

## Related

- Topics: why space links are different, uplink and downlink, carrier and symbol synchronization, contact planning, ground stations and networks.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
