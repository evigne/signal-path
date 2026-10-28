---
id: telemetry-lifecycle
title: Telemetry lifecycle
definition: The path of a measurement from sensor to operator display — sampling, packetization, storage or real-time downlink, frame recovery, packet extraction, decommutation, calibration, limit checking and archiving.
section: operations
level: core
est_minutes: [20, 30]
prerequisites: [end-to-end-system, space-packet-protocol]
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer]
objectives:
  - List the stages a telemetry value passes through, onboard and on the ground.
  - Explain decommutation, calibration and limit checking and where their definitions live.
  - Distinguish real-time from stored (playback) telemetry and why the difference matters.
  - Use freshness, sequence counts and frame counts to localise missing telemetry.
chain_position:
  direction: downlink
  stage: Applications
  after: Space packets
glossary_terms: [apid, packet-sequence-count, alarm-limit]
related_topics: [space-packet-protocol, tm-space-data-link-protocol, command-lifecycle, layered-fault-isolation]
related_symptoms: [packets-missing-frames-ok, packets-present-values-invalid]
related_labs: [telemetry-calibration-sandbox]
standards: [ccsds-133-0-b-2, ccsds-660-0-b-2]
sources:
  - {id: CCSDS-660.0-B-2, loc: "§6.1, §6.1.2"}
  - {id: CCSDS-133.0-B-2, loc: "§4.1.3.4.3, §4.1.4.2"}
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
  - {id: CCSDS-720.1-G-4, loc: "§2.1"}
  - {id: NASA-SOA-11, loc: "§11.2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"Battery temp is stale", "that's playback, not real-time", "the limit tripped on raw, not engineering" — operators reason about where in the lifecycle a value is. Knowing the stages tells you which team owns a problem.

## Plain-language explanation

A sensor reading is sampled onboard, packed into a packet with a time stamp and sent down — immediately if there is a pass (real-time) or later from the onboard recorder (playback). On the ground, packets are pulled out of frames, the raw bits for each measurement are picked out (decommutation), converted to engineering units with a calibration, compared against limits, shown on screens and archived.

## Precise terminology

- **Parameter (measurand):** one named telemetry value.
- **Decommutation:** extracting parameters from a packet by position and encoding.
- **Calibration:** converting a raw value into engineering units.
- **Limit (alarm) check:** comparing a value against configured ranges.
- **Real-time / playback:** telemetry sent as generated versus replayed from storage.

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1.2.1"}
In an XTCE database, a parameter type describes a value's data type, engineering units and alarm limits, and for telemetered parameters how it is encoded for transmission: size in bits, byte order, encoding, calibrations and error checks.
:::

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1.2.3"}
XTCE sequence containers describe packets, frames or other structures as ordered lists of parameters and other containers; they are how a database tells ground software where each parameter sits.
:::

## Where in the chain

Telemetry starts in onboard applications and ends in the mission control system and archive. Everything between is transport (packets, frames, RF, station, ground network); this page covers the two ends.

## How it works, step by step

1. **Sample and packetize onboard.** Packets carry an APID, a per-APID sequence count and often a time code in the secondary header.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.4.3 note 3, §4.1.4.2.2"}
The Space Packet secondary header may carry a CCSDS time code; the Space Packet Protocol notes that the sequence count combined with a time code provides unambiguous ordering over long periods, provided the time code increments at least once between sequence-count wraps.
:::

2. **Downlink in real time or store for playback.** The data link does not retransmit lost telemetry.

:::claim{label="practice" source="NASA-SOA-11" loc="§11.2.1"}
NASA's small-spacecraft state-of-the-art report notes that a LEO spacecraft is commonly in a direct-to-Earth station's line of sight for only part of its orbit — the reason data generated between contacts is stored onboard.
:::

:::claim{label="practice" source="CCSDS-720.1-G-4" loc="§2.1"}
CCSDS describes onboard solid-state mass memory as holding data for later download, with the spacecraft increasingly deciding when to download stored data; because the storage is random-access, lost data can be sent again — the basis for file-based protocols such as CFDP.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
The TM and AOS data link protocols have no retransmission function; if complete delivery is required it must be provided by a higher layer.
:::

3. **Recover frames and extract packets** on the ground (see the TM and SPP pages).
4. **Decommutate, calibrate, limit-check** using the mission database.
5. **Display and archive**, keeping raw values and receipt times so that the processing can be redone.

## What operators and engineers see

Displays show engineering values with colour states for limits, a freshness indicator (age since last update), and a flag for real-time versus playback. Packet-level views show per-APID counts and gaps.

:::claim{label="example" loc="fictional display"}
`BAT_TEMP 31.2 °C [YELLOW hi 30.0] · age 4 s · RT · src APID 0x07E seq 1042` — fictional values.
:::

## Misconceptions and failure symptoms

- **"Stale means the sensor failed."** It may be any stage; check frames and packet counts first.
- **"Playback is duplicate data."** It fills gaps from times without contact; keep it distinct from real-time in displays and archives.
- **"Limits are set in the spacecraft."** Ground limits live in the ground database; onboard monitoring is separate and mission-specific.
- **Symptom — value plausible but wrong scale:** suspect the calibration or the parameter's encoding definition in the database.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Packet format, sequence counts, time code formats | CCSDS 133.0, 301.0 | Standard-defined |
| Database exchange format (if XTCE is used) | CCSDS 660.0-B-2 | Standard-defined |
| Parameters, APIDs, calibrations, limits, sampling rates | Mission | Mission-specific |
| Storage and playback strategy, display conventions | Operations | Common practice |

:::claim{label="mission"}
Your mission database defines every parameter's location, encoding, calibration and limits. Treat it as configuration-controlled: a wrong entry looks exactly like a spacecraft problem.
:::

## Worked example

:::claim{label="example" loc="fictional parameter"}
A fictional 12-bit raw value 0x4E2 (1250) with the linear calibration T = 0.05 × raw − 31.3 °C and a yellow high limit of 30.0 °C. What is shown?

**Answer explanation:** 0.05 × 1250 − 31.3 = 31.2 °C, above 30.0, so the display shows 31.2 °C in yellow. If the database had the encoding as signed, 0x4E2 would still be positive (bit 11 is 0), so the same answer — a useful check when diagnosing calibration complaints.
:::

## Related

- Topics: Space Packet Protocol, TM Space Data Link Protocol, command lifecycle, layered fault isolation.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
