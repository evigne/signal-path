---
id: aos-and-uslp
title: AOS and USLP data link protocols
definition: AOS and USLP are CCSDS data link protocols used alongside or instead of TM and TC; AOS adds larger counters, an insert zone and real-time/replay flags for high-rate links, and USLP unifies uplink, downlink and proximity use in one variable-or-fixed-length frame.
section: space-link
subsection: data-link-and-packets
level: advanced
order: 240
est_minutes: [20, 30]
prerequisites: [tm-space-data-link-protocol, tc-space-data-link-protocol]
learning_paths: [ground-c2-software-engineer, communications-deep-dive]
objectives:
  - Say how AOS and USLP frames differ from TM and TC frames.
  - Recognise the frame version number of each protocol in a header.
  - Explain the AOS replay flag and why ground software must honour it.
  - Explain why a new mission might choose USLP.
chain_position:
  direction: both
  stage: Transfer frames
  before: Coding & sync marker
  after: Space packets
glossary_terms: [transfer-frame, vcid]
related_topics: [tm-space-data-link-protocol, tc-space-data-link-protocol, end-to-end-system]
standards: [ccsds-732-0-b-5, ccsds-732-1-b-3]
sources:
  - {id: CCSDS-732.0-B-5, loc: "§4.1"}
  - {id: CCSDS-732.1-B-3, loc: "§2.1, §4.1"}
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Many missions use AOS for high-rate downlinks, and new ones are adopting USLP. Ground software that assumes TM frames will mis-parse both; the frame version number in the first bits tells you which decoder to use.

## Plain-language explanation

AOS is a telemetry-style frame built for bigger, faster links: bigger counters so they don't wrap so often, an optional slot for small isochronous data, and a flag that says whether a frame is live or replayed from storage. USLP is a single newer design that can carry commands or telemetry, with fixed- or variable-size frames, bigger spacecraft IDs, and room to grow.

## Precise terminology

:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.1"}
An AOS transfer frame is a 6- or 8-octet primary header, an optional insert zone, a data field, an optional 4-octet Operational Control Field and an optional 2-octet FECF; its length is constant throughout a mission phase for a virtual or master channel.
:::

:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.2.3, §4.1.2.4"}
AOS uses a 6-bit Virtual Channel Identifier (all ones reserved for only-idle-data frames) and a 24-bit Virtual Channel Frame Count (modulo 16,777,216).
:::

:::claim{label="standard" source="CCSDS-732.1-B-3" loc="§4.1.1, §4.1.2.2.2, §4.1.2.2.3"}
A USLP transfer frame has a primary header of 4 to 14 octets (truncated or non-truncated), optional insert zone, data field, optional OCF and optional FECF; its version number is 1100 binary and its Spacecraft Identifier is 16 bits.
:::

## Where in the chain

Like TM and TC, both protocols sit in the data link protocol sublayer: packets go in, frames come out, and the frames then go to synchronization and channel coding.

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
AOS may be used on a return link alone or on both directions for two-way high-rate traffic; USLP can be used for space-to-ground, ground-to-space and space-to-space links and is envisaged to replace TM, TC, AOS and Proximity-1 for future missions.
:::

## How it works, step by step

1. **Identify the protocol** from the frame version number: 00 for TM and TC, 01 for AOS, 1100 for USLP.

:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.2.2.2"}
The AOS Transfer Frame Version Number (bits 0–1) is 01, identifying the AOS Version 2 transfer frame.
:::
2. **Parse the header** with that protocol's layout (field widths differ; do not reuse the TM parser).
3. **Honour the AOS replay flag.**

:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.2.5.2"}
The AOS Replay Flag (bit 40) marks a frame as real-time (0) or replay (1); its exact interpretation, for example counts running backwards on reverse playback, is negotiated between projects and cross-support organizations.
:::

4. **For USLP, read the frame length** — USLP frames may be variable length on the physical channel.

:::claim{label="standard" source="CCSDS-732.1-B-3" loc="§4.1.2.7"}
The 16-bit USLP Frame Length field holds one fewer than the total octets in the frame.
:::

## What operators and engineers see

Front-end and processing displays show frames per VC, frame-count gaps, and for AOS the real-time/replay split; protocol-mismatch errors (wrong version number) usually appear as every frame failing header checks.

:::claim{label="example" loc="fictional console"}
`AOS VC5 RT 1,204 / REPLAY 18,330 · VCFC 0x00A1F3 · version 01` — fictional.
:::

## Misconceptions and failure symptoms

- **"AOS is TM with a different name."** Field widths, counters and options differ.
- **"Replay frames are duplicates."** They are stored data; keep them apart from real-time in archives and counters.
- **"USLP is only for deep space."** It is defined for all link types.
- **Symptom — every frame fails header validation after a configuration change:** check the version number the decoder expects.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Frame formats, counter sizes, version numbers | CCSDS 732.0-B-5, 732.1-B-3 | Standard-defined |
| Choice of protocol, frame length, insert zone, OCF/FECF use, replay convention | Mission (with cross-support agreements) | Mission-specific |

:::claim{label="mission"}
Your mission's data link ICD says which protocol each physical channel uses and which optional fields are present; parse by version number, then by the ICD.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional ground processor receives frames whose first octet is 0x40. Which protocol?

**Answer explanation:** 0x40 is 0100 0000; the first two bits are 01, the AOS version number. If the first four bits had been 1100 (first octet 0xC0–0xCF) it would be USLP; 00 would mean TM (or TC on the uplink).
:::


## Deep dive & operational edge cases

::::expert{title="What sits inside the data field: M_PDU, B_PDU and USLP construction rules"}
:::claim{label="standard" source="CCSDS-732.0-B-5" loc="§4.1.4.1.4, §4.1.4.2.1, §4.1.4.3.1"}
An AOS virtual channel carries exactly one kind of data unit, chosen by management: Multiplexing PDUs (M_PDUs) for packets, Bitstream PDUs (B_PDUs) for a raw bit stream, or VCA service data units — they are never mixed on one VC. An M_PDU has a 2-octet header holding a 16-bit First Header Pointer, then a fixed-length packet zone; a B_PDU has a 2-octet header with a 14-bit Bitstream Data Pointer that marks where valid bits end.
:::

:::claim{label="standard" source="CCSDS-732.1-B-3" loc="§4.1.4.2.2, §4.1.4.2.3"}
USLP replaces those fixed shapes with a Transfer Frame Data Field header whose first three bits are a TFDZ Construction Rule and next five bits a USLP Protocol Identifier (UPID). Rule 000 means fixed-length frames with packets spanning frame boundaries (a First Header Pointer is needed); 001 and 010 carry the start and continuation of a MAPA or VCA unit; 011 is an octet stream; 100, 101 and 110 are starting, continuing and last segments of a variable-length unit; 111 means no segmentation (one unit, whole packets, or control commands).
:::

:::claim{label="example" loc="fictional"}
A fictional USLP link carries housekeeping as rule 000 frames on one virtual channel and a large file chunked as rules 100 → 101 → 110 on another. A ground decoder that assumes AOS-style M_PDUs everywhere will mis-read the second channel — the construction rule, not the VC number, says how to parse the data zone.
:::
::::

## Related

- Topics: TM and TC Space Data Link Protocols, end-to-end system.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
