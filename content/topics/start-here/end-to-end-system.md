---
id: end-to-end-system
title: The end-to-end space communications system
definition: The chain that carries data between a spacecraft application and a ground user — packets, transfer frames, coding, RF, the ground station, ground networks and the operations centre — and the layer each piece belongs to.
section: start-here
level: intro
est_minutes: [15, 20]
prerequisites: []
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive]
objectives:
  - Name the stages a telemetry packet passes through from spacecraft to operator, in order.
  - Place each stage in a protocol layer (physical, data link, network and above).
  - Say which CCSDS standard family covers each stage.
  - Explain why a fault is localised by finding the first stage that looks wrong.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [space-packet, transfer-frame, cadu, sle]
related_topics: [uplink-and-downlink, space-packet-protocol, tm-space-data-link-protocol, ground-stations-and-networks, layered-fault-isolation]
related_labs: [end-to-end-walkthrough]
standards: [ccsds-131-0-b-6, ccsds-132-0-b-3, ccsds-133-0-b-2, ccsds-401-0-b-32, ccsds-130-0-g-4]
sources:
  - {id: CCSDS-130.0-G-4, loc: "§2.2, §3.2.1, §4.2"}
  - {id: CCSDS-911.1-B-5, loc: "§1.1, §2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Every conversation in operations points at a place in this chain: "the station has carrier", "VC0 is gapping", "APID 126 is stale", "the SLE link dropped". If you can place each phrase on the chain you can follow the conversation and ask the right next question.

## Plain-language explanation

An instrument on the spacecraft produces a measurement. Software wraps it in a packet, packets are packed into fixed-size frames, the frames are protected with error-correcting code and marked so the ground can find them, and the result is put on a radio carrier. A ground antenna receives the signal, a demodulator and decoder turn it back into frames, the frames travel over ordinary networks to the mission's control centre, and software there unpacks packets and turns raw numbers into engineering values on a screen. Commands make the same trip in reverse.

## Precise terminology

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§2.2.1"}
CCSDS describes its space communications protocols using five layers of the OSI model — physical, data link, network, transport and application — noting that session and presentation layer protocols are rarely used over space links.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§2.2.3"}
CCSDS splits the data link layer into two sublayers: a data link protocol sublayer, which moves higher-layer data in transfer frames over a point-to-point space link, and a synchronization and channel coding sublayer, which handles synchronization and error-correcting coding of those frames.
:::

- **Space link:** the link between a spacecraft and its ground system, or between two spacecraft.
- **Physical channel:** one stream of bits over a space link in one direction.

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§1.3.2"}
A space link consists of one or more physical channels in one or both directions; a physical channel is a stream of bits transferred over a space link in a single direction.
:::

## Where in the chain

| Stage (downlink order) | Layer | Standard family |
| :-- | :-- | :-- |
| Application data → Space Packets | Network / application | CCSDS 133.0 (SPP) |
| Packets → transfer frames, by virtual channel | Data link (protocol sublayer) | CCSDS 132.0 (TM), 732.0 (AOS), 732.1 (USLP) |
| Randomizing, coding, sync marker | Data link (sync & coding sublayer) | CCSDS 131.0 |
| Modulation onto an RF carrier | Physical | CCSDS 401.0 |
| Ground station: demodulate, decode, frame sync | Physical + data link | Station equipment |
| Frames to the mission over ground networks | Ground transfer service | CCSDS 911.x / 912.x (SLE) |
| Packet extraction, decommutation, display | Application | Mission ground software (e.g. XTCE databases) |

## How it works, step by step

1. **Onboard applications produce packets**, each named by an APID.
2. **Packets are multiplexed into transfer frames.**

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
TM, AOS and USLP use fixed-length transfer frames to help synchronization on a noisy link; TC, Proximity-1 and USLP use variable-length frames for telecommand. Virtual channels let one physical channel be shared by several data streams with different service needs.
:::

3. **Frames are randomized, coded and given a sync marker**, then modulated onto the carrier.
4. **The ground station recovers frames** and forwards them to the mission.

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§1.1, §2.1"}
The SLE Return All Frames service delivers to a mission user all telemetry frames (TM, AOS or USLP) from one space-link physical channel, each wrapped with annotation such as the earth receive time.
:::

5. **The control centre extracts packets and processes them.**

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§4.2"}
When Space Packets are used for end-to-end forwarding, intermediate systems forward data by examining the APID under management agreements — there is no endpoint address — and on the ground the packets are usually carried over a Space Link Extension service.
:::

## What operators and engineers see

Each stage has its own indicators: RF and lock status at the station, frame counts and error checks on the data link, SLE association status between station and control centre, and packet counts and parameter values in the control system. Operators typically scan them in chain order.

:::claim{label="example" loc="fictional pass summary"}
`AOS 10:02Z · carrier/symbol/frame LOCK · RAF ACTIVE · VC0 0 gaps · APID 126 fresh · LOS 10:13Z` — fictional summary line showing one indicator per stage.
:::

## Misconceptions and failure symptoms

- **"The ground station understands my telemetry."** Usually it stops at frames; packets and parameters are decoded at the mission's control centre.
- **"If the display is stale the spacecraft is silent."** Staleness can come from any stage; walk the chain.
- **"CCSDS defines everything."** It defines interfaces; parameter meaning, APID maps and frame lengths are mission choices.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Layer boundaries, frame and packet formats, coding options | CCSDS | Standard-defined |
| Which protocols a mission uses, frame length, APID map, station network | Mission | Mission-specific |
| Order of checking indicators | Operations teams | Common practice |

:::claim{label="mission"}
Your mission's ICDs say which data link protocol, coding and ground service it uses. The chain on this page is the common CCSDS shape, not a description of any particular mission.
:::

## Worked example

:::claim{label="example" loc="fictional trace"}
A fictional temperature reading from a star tracker: the sensor value 0x0F3A goes into a packet on APID 0x07E; the packet is placed in VC0 frames; frames are R-S coded, randomized and prefixed with the 1ACFFC1D marker; the station locks, decodes and sends frames over RAF; the control centre extracts APID 0x07E, applies the calibration from its database and displays 21.4 °C.

**Answer explanation:** if the display stays stale while frame counts on VC0 keep rising, the fault sits after frame recovery — packet extraction or the database — not on the RF link.
:::

## Related

- Topics: uplink and downlink, Space Packet Protocol, TM Space Data Link Protocol, ground stations and networks, layered fault isolation.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
