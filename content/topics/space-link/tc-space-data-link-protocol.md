---
id: tc-space-data-link-protocol
title: TC Space Data Link Protocol
definition: The TC Space Data Link Protocol defines the variable-length transfer frame that carries telecommands to a spacecraft, with header fields for the spacecraft, virtual channel, frame length and the sequence number that COP-1 uses for reliable delivery.
section: space-link
subsection: data-link-and-packets
level: core
est_minutes: [25, 35]
prerequisites: [uplink-and-downlink, tm-space-data-link-protocol]
learning_paths: [ground-c2-software-engineer, communications-deep-dive, security-aware-operations, fast-reference]
objectives:
  - List the fields of the TC frame primary header with bit positions.
  - Decode a TC header and compute the frame length.
  - Explain Type-A/Type-B and Type-D/Type-C frames from the two header flags.
  - Explain when the segment header and MAP channels are needed.
chain_position:
  direction: uplink
  stage: Transfer frames
  before: Coding & sync marker
  after: Space packets
glossary_terms: [cltu, cop-1, clcw, vcid]
related_topics: [uplink-and-downlink, command-lifecycle, tm-space-data-link-protocol]
related_labs: [cop1-farm-simulator]
standards: [ccsds-232-0-b-4]
sources:
  - {id: CCSDS-232.0-B-4, loc: "§4.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Ground software builds TC frames, or configures the component that does. Getting the frame length, the bypass flag or the sequence number wrong produces commands the spacecraft silently discards, or a FARM lockout in the middle of a pass.

## Plain-language explanation

A TC frame is a short envelope for commands. Unlike telemetry frames, each one can be a different size. Its header says which spacecraft and lane (virtual channel) it is for, how long it is, whether it must go through the spacecraft's in-order acceptance check, and its sequence number in that lane.

## Precise terminology

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.1"}
A TC transfer frame is a 5-octet primary header, a data field of up to 1019 octets (1017 if the optional 2-octet Frame Error Control Field is present), and the optional FECF.
:::

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.2"}
The primary header holds: version number (bits 0–1), Bypass Flag (bit 2), Control Command Flag (bit 3), two reserved spare bits (4–5, set to 00), Spacecraft Identifier (bits 6–15), Virtual Channel Identifier (bits 16–21), Frame Length (bits 22–31) and Frame Sequence Number N(S) (bits 32–39).
:::

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.2.7"}
The Frame Length field holds one fewer than the total octets in the frame, counted from the first header bit to the end of the FECF (or data field if no FECF); its 10 bits limit a TC frame to 1024 octets.
:::

## Where in the chain

On the uplink, command packets (or other data units) go into TC frames per virtual channel and MAP; each frame is then encoded into a CLTU for radiation. The receiving FARM checks frames on the spacecraft and reports through the CLCW on the downlink.

## How it works, step by step

1. **Choose the service type** with the two flags: Bypass 0/1 = Type-A (FARM checks) / Type-B (bypass), Control Command 0/1 = data (Type-D) / control command (Type-C). See the command lifecycle page.
2. **Segment if needed.**

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.3.2"}
The optional 1-octet Segment Header (2-bit sequence flags and 6-bit MAP Identifier) is required on a virtual channel that has more than one MAP or carries data units larger than one frame; if used on a virtual channel it must be used in all its data frames, and it is never present in frames carrying control commands.
:::

3. **Number the frame** with N(S) from FOP-1 for Type-AD frames.

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.2.8"}
The 8-bit Frame Sequence Number lets the FARM check the order of incoming Type-A frames; it is maintained separately for each virtual channel.
:::

4. **Encode into a CLTU** and hand it to the station (FCLTU or provider interface).

## What operators and engineers see

Command systems show per-VC V(S), the frame queue, and CLCW status; frame-builder logs show the header values. A frame rejected by the spacecraft usually appears as a CLCW Retransmit or Lockout flag rather than an explicit error.

:::claim{label="example" loc="fictional log"}
`TC VC1 MAP0 · N(S)=37 · len 20 · BD=0 CC=0 · CLTU #12 queued` — fictional.
:::

## Misconceptions and failure symptoms

- **"TC frames are fixed-length like TM."** They are variable length, up to 1024 octets.
- **"The length field is the data length."** It is total frame octets minus one, header and FECF included.
- **"MAP is always optional."** It becomes required once a VC has several MAPs or segments data.
- **Symptom — every Type-AD frame retransmitted, report value frozen:** check N(S) generation and the CLCW Lockout flag before suspecting RF.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Header layout, length rule, flags, segment header format | CCSDS 232.0-B-4 | Standard-defined |
| Maximum frame length per VC, use of FECF and segment header, VC/MAP allocation | Mission | Mission-specific |
| Command queueing and frame-builder design | Ground software | Common practice |

:::claim{label="mission"}
Your mission's TC ICD defines maximum frame lengths, which virtual channels and MAPs exist, and whether the FECF and segment header are used.
:::

## Worked example

:::claim{label="example" loc="fictional header"}
Decode the fictional TC header `00 2A 04 13 25`.

| Field | Bits | Value |
| :-- | :-- | :-- |
| Version | 0–1 | 00 |
| Bypass / Control Command | 2 / 3 | 0 / 0 → Type-AD |
| Spare | 4–5 | 00 |
| Spacecraft Identifier | 6–15 | 0x02A = 42 |
| Virtual Channel Identifier | 16–21 | 1 |
| Frame Length | 22–31 | 19 → 20-octet frame |
| Frame Sequence Number | 32–39 | 0x25 = 37 |

**Answer explanation:** 00 2A is 0000 0000 0010 1010: bits 0–5 are zero, bits 6–15 = 00 0010 1010 (42). 04 13 is 0000 0100 0001 0011: bits 16–21 = 000001 (VC 1), bits 22–31 = 00 0001 0011 (19), so the frame is 20 octets: 5 header + 15 data, or 5 + 13 + 2 with an FECF.
:::

## Related

- Topics: uplink and downlink, command lifecycle, TM Space Data Link Protocol.
- Lab: COP-1 FOP-1 and FARM-1 simulator.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
