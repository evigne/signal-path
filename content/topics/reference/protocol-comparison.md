---
id: protocol-comparison
title: Protocol comparison at a glance
definition: A side-by-side reference of the CCSDS data units most often met in operations — Space Packets and the TM, TC, AOS and USLP transfer frames — with their sizes, identifiers, counters and reliability features.
section: reference
level: core
order: 20
est_minutes: [5, 10]
prerequisites: []
learning_paths: [fast-reference]
objectives:
  - Look up the size, identifiers and counters of each common data unit.
  - Pick the right decoder from the version number.
  - See which protocols retransmit and which do not.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [transfer-frame, space-packet, vcid, apid]
related_topics: [space-packet-protocol, tm-space-data-link-protocol, tc-space-data-link-protocol, aos-and-uslp, space-data-link-security]
standards: [ccsds-133-0-b-2, ccsds-132-0-b-3, ccsds-232-0-b-4, ccsds-732-0-b-5, ccsds-732-1-b-3]
sources:
  - {id: CCSDS-133.0-B-2, loc: "§4.1"}
  - {id: CCSDS-132.0-B-3, loc: "§4.1"}
  - {id: CCSDS-232.0-B-4, loc: "§4.1"}
  - {id: CCSDS-732.0-B-5, loc: "§4.1"}
  - {id: CCSDS-732.1-B-3, loc: "§4.1"}
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

In the middle of a pass nobody wants to open five standards. This page puts the numbers operators and engineers check most often in one place, each traceable to its standard.

## Plain-language explanation

Packets are the application's envelopes; frames are the link's fixed or variable boxes that carry them. Each kind has its own header layout, its own counters and its own idea of reliability. Read the version number first, then use the right row.

::::beginner{title="Different vehicles for different loads"}
TM, TC, AOS and USLP are like a lorry, a courier van, a freight train and a modular vehicle. The lorry (TM) carries a steady flow of fixed-size crates down; the courier (TC) carries small, precious parcels up and gets a signature; the freight train (AOS) carries very high volumes; the modular vehicle (USLP) can be configured to do any of these jobs.
::::

## Precise terminology

| | Space Packet | TM frame | TC frame | AOS frame | USLP frame |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Version number | 000 (3 bits) | 00 | 00 | 01 | 1100 (4 bits) |
| Length | 7–65,542 octets | Fixed per mission phase | Variable, ≤ 1024 octets | Fixed per mission phase | Variable or fixed |
| Primary header | 6 octets | 6 octets | 5 octets | 6 or 8 octets | 4–14 octets |
| Main identifier | APID (11 bits) | SCID 10 bits, VCID 3 bits | SCID 10 bits, VCID 6 bits | SCID 8+2 bits, VCID 6 bits | SCID 16 bits, VCID 6 bits |
| Sequence counter | 14 bits per APID | MC and VC counts, 8 bits each | N(S) 8 bits per VC | VC count 24 bits | (see standard) |
| Length field rule | data field − 1 | — | frame − 1 | — | frame − 1 |

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.2, §4.1.3"}
Space Packets are 7–65,542 octets with a 6-octet primary header, version 000, an 11-bit APID, a 14-bit per-APID sequence count and a length field equal to data-field octets minus one.
:::

::::expert{title="Header bit layouts of all four frame types"}
:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.1, §4.1.2"}
TM frames have a 6-octet primary header with version 00, a 10-bit SCID, a 3-bit VCID and 8-bit master and virtual channel frame counts, and are constant in length within a mission phase.
:::
::::

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.1, §4.1.2"}
TC frames have a 5-octet header with version 00, a 10-bit SCID, a 6-bit VCID, a 10-bit frame length (total − 1, so at most 1024 octets) and an 8-bit frame sequence number.
:::

:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.1, §4.1.2"}
AOS frames have a 6- or 8-octet primary header with version 01, an SCID split over bits 2–9 and 42–43, a 6-bit VCID and a 24-bit virtual channel frame count, and are constant in length within a mission phase.
:::

:::claim{label="standard" source="CCSDS-732.1-B-3" loc="§4.1.1, §4.1.2"}
USLP frames have a 4- to 14-octet primary header with version 1100, a 16-bit SCID, a 6-bit VCID and a 16-bit frame length (total − 1).
:::

## Where in the chain

Packets sit above all the frame types; a mission's physical channel carries one frame type per direction (for example TM down and TC up, or USLP both ways).

## How it works, step by step

1. Read the first bits: 000 at the start of a packet; 00, 01 or 1100 at the start of a frame.
2. Use the matching header layout and identifier widths.
3. Track the right counter per identifier (APID, VC) and its modulus.

## What operators and engineers see

Front-end and processing displays label rows by these identifiers; reliability shows up differently per protocol:

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
TC and USLP support the COP-1 retransmission mechanism and Proximity-1 and USLP have COP-P; TM and AOS have no retransmission, so complete delivery there must come from a higher layer.
:::

:::claim{label="example" loc="fictional quick check"}
`first octet 0x0A → TM (00) · 0x40 → AOS (01) · 0xC3 → USLP (1100) · packet 0x08 → version 000` — fictional values.
:::

## Misconceptions and failure symptoms

- **"All frames have the same header."** Identifier widths differ per protocol.
- **"All counters are 8 bits."** AOS uses 24 bits; packets use 14.
- **Symptom — every header looks corrupt:** wrong protocol assumed; check the version bits.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Formats in the table | CCSDS standards cited | Standard-defined |
| Which protocol per link, frame lengths, optional fields | Mission | Mission-specific |

:::claim{label="mission"}
Your mission ICD says which protocol each link uses and which optional fields are present; this table only shows the standard frames.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional capture starts `0A B5 …` on the downlink and `00 2A …` on the uplink. Which decoders?

**Answer explanation:** 0x0A = 0000 1010 → version 00 on a downlink: TM. 0x00 on the uplink → version 00: TC. Use the TM and TC topic pages to decode the rest.
:::

## Related

- Topics: Space Packet Protocol, TM, TC, AOS/USLP, SDLS.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
