---
id: tm-space-data-link-protocol
title: TM Space Data Link Protocol
definition: The TM Space Data Link Protocol defines the fixed-length transfer frame that carries telemetry packets across the space link, with header fields that identify the spacecraft, the virtual channel and frame counts.
section: space-link
subsection: data-link-and-packets
level: core
order: 220
est_minutes: [25, 35]
prerequisites: [sync-markers, channel-coding]
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive, fast-reference]
objectives:
  - List the fields of a TM transfer frame in order and say which are optional.
  - Decode SCID, VCID and frame counts from a primary header.
  - Explain how the First Header Pointer lets the ground find packets that span frames.
  - Use frame counters to spot lost frames on a virtual channel.
  - Separate what the standard fixes from what a mission configures.
chain_position:
  direction: downlink
  stage: Transfer frames
  before: Space packets
  after: Coding & sync marker
glossary_terms: [transfer-frame, vcid, first-header-pointer, fecf]
related_topics: [space-packet-protocol, channel-coding, sync-markers]
related_labs: []
related_symptoms: [frame-lock-with-errors]
standards: [ccsds-132-0-b-3]
sources:
  - {id: CCSDS-132.0-B-3, loc: "§4.1"}
  - {id: CCSDS-232.0-B-4, loc: "§4.1.2.5.2"}
  - {id: SANA-SCID, loc: "registry"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Packets are what applications care about, but the link carries frames. When telemetry goes missing, frame-level evidence — which virtual channel, which frame counts, whether the error check passed — tells you whether the loss happened on the space link or later in packet processing. Operators talk about "VC 0 counter jumps" and "idle frames" constantly; this page explains what those mean.

## Plain-language explanation

A transfer frame is a fixed-size box that leaves the spacecraft at a steady pace. Packets of different sizes are packed into the boxes back to back; a big packet can continue into the next box. Each box has a label saying which spacecraft sent it, which "lane" (virtual channel) it belongs to, and running numbers so the ground can tell if a box went missing. When there is nothing to send, the spacecraft still sends boxes, filled with idle data, to keep the link steady.

## Precise terminology

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.1.1, §4.1.1.2"}
A TM transfer frame contains, in order: primary header (6 octets, mandatory), secondary header (up to 64 octets, optional), data field (mandatory), Operational Control Field (4 octets, optional) and Frame Error Control Field (2 octets, optional). Frame length is constant throughout a mission phase on a physical channel.
:::

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.2–§4.1.2.7"}
The primary header holds: version number (bits 0–1, set to 00), Spacecraft Identifier (bits 2–11), Virtual Channel Identifier (bits 12–14), OCF flag (bit 15), Master Channel Frame Count (bits 16–23), Virtual Channel Frame Count (bits 24–31) and the Data Field Status (bits 32–47: secondary header flag, synchronization flag, packet order flag, segment length identifier, First Header Pointer).
:::

## Where in the chain

On the downlink, packets from onboard applications are multiplexed into transfer frames by virtual channel; the frames then go to channel coding and sync-marker attachment. On the ground, frames come out of the decoder, are checked, sorted by virtual channel, and packets are extracted.

## How it works, step by step

1. Onboard, packets for a virtual channel are placed back to back into the data field; a packet that does not fit continues in the next frame of the same virtual channel.

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.7.6"}
The First Header Pointer gives the position of the first packet that starts in the data field, counting the first data-field octet as 0. If no packet starts in the frame it is 11111111111; if the frame carries only idle data it is 11111111110 (an "Only Idle Data" frame).
:::

2. The header counts are set:

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.5, §4.1.2.6"}
The Master Channel Frame Count and Virtual Channel Frame Count are 8-bit sequential counts, modulo 256, of the frames on the master channel and on each virtual channel.
:::

3. Optional trailers are added:

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.5, §4.1.6"}
If present, the 4-octet Operational Control Field follows the data field (a Type-1 report carries a Communications Link Control Word for COP-1), and the 2-octet Frame Error Control Field follows it, computed with the generator G(X) = X¹⁶ + X¹² + X⁵ + 1 with the register preset to all ones. Whether the FECF is used is set by management for the physical channel.
:::

4. On the ground, frames that fail the error check are discarded, counters are compared with the previous frame on the same channel, and the First Header Pointer is used to find the first packet.

::diagram{name="fhp"}

## What operators and engineers see

Frame-level displays typically show frames received per virtual channel, frame-count gaps, FECF (CRC) failures, the proportion of idle frames, and the latest CLCW if the OCF carries one. A gap in the Virtual Channel Frame Count means frames on that channel were lost or never sent; a gap in the Master Channel count with no VC gap points at another channel.

:::claim{label="example" loc="fictional console"}
`VC0 frames 8,412 · VCFC gap 0xA1→0xA4 (2 lost) · FECF fail 3 · OID 12 %` — fictional values; the count is 8 bits, so it runs 0x00–0xFF and then wraps.
:::

## Misconceptions and failure symptoms

- **"Frames and packets are the same thing."** Frames are fixed-length link units; packets are variable-length application units carried inside them, possibly split across frames.
- **"A counter wrap is a gap."** The counts are modulo 256; 255 → 0 is normal.
- **"Idle frames mean something is wrong."** Only Idle Data frames keep the link running when there is nothing to send.
- **Symptom — packets missing but frames fine:** check the First Header Pointer handling and packet extraction, not the RF link. See the Space Packet Protocol page.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Field order, sizes, counts, FHP values, FECF polynomial | CCSDS 132.0-B-3 | Standard-defined |
| Frame length, virtual-channel allocation, use of secondary header, OCF and FECF | Mission (constant within a mission phase) | Mission-specific |
| Ground displays for counters and gaps | Ground software | Common practice |

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.2.3"}
The Spacecraft Identifier identifies the spacecraft and is static throughout all mission phases.
:::

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.2.5.2"}
The TC Space Data Link Protocol states that the Spacecraft Identifier is assigned by CCSDS, so missions do not pick SCIDs freely.
:::

:::claim{label="standard" source="SANA-SCID" loc="registry"}
Assigned SCIDs are published in the SANA Spacecraft Identifier registry; new assignments are requested through an agency's authorized SCID assignor (registry checked 2026-10-28).
:::

:::claim{label="mission"}
Your mission's ICD defines the frame length, which virtual channels carry which data, and whether the OCF and FECF are present. Do not assume the values on this page.
:::

## Worked example

:::claim{label="example" loc="fictional header"}
Decode the fictional primary header `0A B5 2A 11 18 00`.

| Field | Bits | Value |
| :-- | :-- | :-- |
| Version | 0–1 | 00 |
| Spacecraft Identifier | 2–11 | 0x0AB = 171 |
| Virtual Channel Identifier | 12–14 | 2 |
| OCF flag | 15 | 1 (OCF present) |
| Master Channel Frame Count | 16–23 | 0x2A = 42 |
| Virtual Channel Frame Count | 24–31 | 0x11 = 17 |
| Secondary header flag, sync flag, packet order | 32–34 | 0, 0, 0 |
| Segment length identifier | 35–36 | 11 |
| First Header Pointer | 37–47 | 0 (a packet starts at the first data-field octet) |

**Answer explanation:** the first two octets 0A B5 are 0000 1010 1011 0101: bits 0–1 = 00, bits 2–11 = 00 1010 1011 (171), bits 12–14 = 010 (2), bit 15 = 1. Octets 18 00 are 0001 1000 0000 0000: flags 000, segment length identifier 11, FHP 000 0000 0000.
:::

## Related

- Glossary: transfer frame, VCID, First Header Pointer, FECF.
- Topics: Space Packet Protocol, channel coding, sync markers.
- Symptom: Frame lock with errors.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
