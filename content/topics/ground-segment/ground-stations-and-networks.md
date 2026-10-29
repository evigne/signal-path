---
id: ground-stations-and-networks
title: Ground stations and networks
definition: Ground stations track the spacecraft, demodulate and decode its signal and radiate commands; networks of stations — agency, commercial or ground-station-as-a-service — deliver the data to the mission over standard or provider-specific interfaces such as SLE.
section: ground-segment
level: intro
order: 10
est_minutes: [20, 30]
prerequisites: [end-to-end-system, uplink-and-downlink]
learning_paths: [space-comms-101, operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive]
objectives:
  - Describe what a ground station does during a pass, from scheduling to loss of signal.
  - Explain the SLE RAF, RCF and FCLTU services and the online and offline delivery modes.
  - Compare provider models (agency network, commercial network, GSaaS) without relying on unverified figures.
  - List the questions to ask a provider before booking.
chain_position:
  direction: both
  stage: Ground station & network
  before: Mission control
  after: Modulation & RF
glossary_terms: [sle]
related_topics: [end-to-end-system, frequency-bands, telemetry-lifecycle, command-lifecycle]
standards: [ccsds-911-1-b-5, ccsds-912-1-b-5]
related_symptoms: [carrier-but-no-frame-lock, pass-done-data-missing]
sources:
  - {id: CCSDS-911.1-B-5, loc: "§1.1, §2.1, §2.6"}
  - {id: CCSDS-911.2-B-4, loc: "§1.1"}
  - {id: CCSDS-912.1-B-5, loc: "§1.1, §2.1"}
  - {id: CCSDS-130.0-G-4, loc: "§4.2"}
  - {id: AWS-GS-UG, loc: "capabilities, locations"}
  - {id: LEAF-SCHED, loc: "scheduling"}
  - {id: ATLAS-FREEDOM, loc: "scheduling, streaming"}
  - {id: SSC-GO, loc: "service page"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - Provider "IGM" is unresolved; awaiting the user's clarification.
---

## Why it matters

Most missions don't own all their antennas. Passes are booked from networks, data arrives over the internet through a provider's interface, and many problems that look like spacecraft faults are booking, configuration or backhaul issues. Operators talk to station controllers constantly.

## Plain-language explanation

A ground station is a steerable dish plus radio equipment and computers. Before a pass it is configured for your spacecraft (frequencies, rates, coding), points at where the spacecraft will rise, locks on, and for the few minutes the spacecraft is above the horizon it receives telemetry and sends commands. The decoded data is shipped to your control centre, either live or as files afterwards.

::::beginner{title="Renting airport gates"}
A spacecraft operator rarely owns all its antennas — it books time on them, like an airline renting gates at airports around the world. The provider runs the gate (antenna, receiver, local network); the mission brings the schedule and says what each flight carries. The big choice is how much the gate staff unpack for you: hand over raw radio, sorted frames, or finished files later.
::::

## Precise terminology

- **Pass / contact:** a period when the spacecraft is visible and the station is tracking it (AOS to LOS).
- **SLE (Space Link Extension):** CCSDS services that carry space-link data units between station and mission over ground networks.
- **GSaaS:** ground station as a service; bookable antenna time, usually by API.

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§1.1, §2.1"}
The SLE Return All Frames (RAF) service delivers all telemetry frames of a selected frame quality from one space-link physical channel, each annotated (for example with earth receive time); the user can start, stop and get status reports through the service's operations.
:::

:::claim{label="standard" source="CCSDS-911.2-B-4" loc="§1.1"}
The SLE Return Channel Frames (RCF) service delivers all telemetry frames from one master channel or one virtual channel.
:::

:::claim{label="standard" source="CCSDS-912.1-B-5" loc="§1.1, §2.1"}
The SLE Forward CLTU (FCLTU) service lets a mission send CLTUs to a spacecraft through a station; it is provided only in online delivery mode.
:::

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§2.6"}
SLE online delivery happens during the space-link session and offline delivery after it; RAF treats online timely (frames may be discarded in a controlled way if they cannot be delivered in time) and online complete as distinct modes.
:::

## Where in the chain

The station sits between the RF link and the mission's control centre: physical layer and coding/sync recovery at the station, then a ground transfer service (SLE or a provider interface) to the mission.

## How it works, step by step

1. **Schedule** the pass. Booking windows differ widely by provider:

:::claim{label="practice" source="LEAF-SCHED" loc="scheduling"}
Leaf Space describes a 96-hour automated rolling schedule, on-demand API booking from 4 days to 5 minutes before a pass, and reservations up to 10 days ahead (checked 2026-10-28).
:::

:::claim{label="practice" source="ATLAS-FREEDOM" loc="scheduling"}
ATLAS describes flexible scheduling from 14 days out to 1 minute before a pass (checked 2026-10-28).
:::

2. **Configure** the station from the mission's configuration: frequencies, polarization, modulation, symbol rate, coding, frame length and delivery endpoint.
3. **Track and acquire** at AOS: carrier, symbol and frame lock (see *Carrier and symbol sync*).
4. **Deliver** data: frames over SLE or a provider streaming interface, or files after the pass.

:::claim{label="practice" source="AWS-GS-UG" loc="data delivery"}
AWS Ground Station describes real-time delivery to EC2 (VITA-49) and to S3 (PCAP), demodulated/decoded or as raw digitized IF, with uplink via digital IF on S-band only (checked 2026-10-28).
:::


:::claim{label="practice" source="SSC-GO" loc="service page"}
SSC Space describes its Go service for LEO small satellites as S-band up and down with X- and Ka-band down, booked by reserving time slots, with data delivered through a secure regional cloud interface such as an S3 drop-off (checked 2026-10-28).
:::

5. **Command** over the forward link (FCLTU or a provider interface) when the pass includes uplink.
6. **Close out** at LOS: pass report, data accounting, anomalies.

::diagram{name="gsaas"}

## What operators and engineers see

Pass schedules, station status (antenna, receiver, transmitter, lock indicators), SLE association and delivery status, data volume per pass, and pass reports from the provider.

:::claim{label="example" loc="fictional pass log"}
`PASS 4471 · STN-B · AOS 10:02:18Z · RAF bind OK · start 10:02:20Z · frames 54,880 · FCLTU 12 CLTUs · LOS 10:13:41Z` — fictional.
:::

## Misconceptions and failure symptoms

- **"The station decodes my packets."** Many deliver frames or raw IF; packet processing is usually the mission's.
- **"All providers offer SLE."** Interfaces differ; some use cloud streaming or files. Ask.
- **"Network size tells you coverage."** Coverage depends on station latitudes, your orbit and the bands and licences at each site.
- **Symptom — lock at the station but no data at the control centre:** check the delivery path (SLE bind, endpoint, firewall), not RF.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| SLE service definitions and delivery modes | CCSDS 911.x, 912.x | Standard-defined |
| Booking windows, interfaces, pricing, sites | Each provider | Common practice (provider-specific) |
| Network mix, licences per site, pass plan | Mission | Mission-specific |

:::claim{label="mission"}
Your mission chooses its stations and providers, licenses its frequencies at each site and agrees the delivery interface; provider figures on this site are dated snapshots — check the provider comparison and its sources before relying on them.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional LEO mission needs S-band uplink, X-band downlink at 8.2 GHz, real-time telemetry and two passes a day. Which questions go to a provider?

**Answer explanation:** Which sites support S up and X down at 8.2 GHz, and is the mission licensable there? Is uplink supported at those sites? What delivery interface (SLE RAF/FCLTU, streaming, files) and latency? How far ahead and how late can passes be booked or changed? What is billed (scheduled minutes, reservations) and what happens on a failed pass?
:::

## Related

- Topics: end-to-end system, frequency bands, telemetry lifecycle, command lifecycle.
- Symptom: Carrier but no frame lock.
- Provider comparison page (sources dated 2026-10-28).

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
