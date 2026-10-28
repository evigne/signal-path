---
id: space-packet-protocol
title: Space Packet Protocol
definition: The Space Packet Protocol defines the variable-length packet that onboard and ground applications exchange, with a 6-octet primary header that names the application (APID), counts its packets and gives the packet length.
section: space-link
subsection: data-link-and-packets
level: core
est_minutes: [25, 35]
prerequisites: [tm-space-data-link-protocol]
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive, fast-reference]
objectives:
  - List the fields of the Space Packet primary header with their bit positions.
  - Decode APID, packet type, sequence flags, sequence count and length from a header.
  - Compute the total packet length from the Packet Data Length field.
  - Use per-APID sequence counts to spot missing packets.
  - Explain what the protocol does not guarantee (delivery, order, completeness).
chain_position:
  direction: both
  stage: Space packets
  before: Applications
  after: Transfer frames
glossary_terms: [space-packet, apid, packet-sequence-count, idle-packet]
related_topics: [tm-space-data-link-protocol, telemetry-lifecycle, command-lifecycle]
related_labs: [space-packet-header-decoder]
related_symptoms: [packets-missing-frames-ok]
standards: [ccsds-133-0-b-2]
sources:
  - {id: CCSDS-133.0-B-2, loc: "§2.2, §4.1"}
  - {id: SANA-APID, loc: "registry"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Applications, databases and operators think in packets: "APID 126 stopped", "housekeeping packet count jumped". The packet header is the first thing ground software reads after frames are unpacked, and most "the data is wrong" questions are settled by decoding six octets correctly.

## Plain-language explanation

A space packet is an envelope that one application addresses to another. The front of the envelope says which application it belongs to (the APID), whether it is telemetry or a command, a running number for that application, and how long the contents are. Envelopes of any size ride inside the fixed-size transfer frames; the ground uses the length to know where one envelope ends and the next begins.

## Precise terminology

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.2.1, §4.1.2.2"}
A Space Packet is a Packet Primary Header (6 octets, mandatory) followed by a Packet Data Field (1 to 65,536 octets, mandatory), so a packet is 7 to 65,542 octets long.
:::

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.2–§4.1.3.5"}
The primary header holds: Packet Version Number (bits 0–2, set to 000), Packet Type (bit 3: 0 = telemetry, 1 = telecommand), Secondary Header Flag (bit 4), APID (bits 5–15), Sequence Flags (bits 16–17), Packet Sequence Count or Packet Name (bits 18–31) and Packet Data Length (bits 32–47).
:::

- **APID (Application Process Identifier):** the 11-bit name of the managed data path.
- **Packet Sequence Count:** a 14-bit per-APID counter.
- **Idle Packet:** a filler packet with the reserved all-ones APID.

## Where in the chain

On the downlink, onboard applications produce packets, which are placed into transfer frames by virtual channel. On the ground, packets are extracted from frames (using the First Header Pointer and each packet's length) and routed by APID to processing and archives. Commands travel the other way inside telecommand frames.

## How it works, step by step

1. The source application builds the packet with its APID and the next sequence count.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.4.3.3, §4.1.3.4.3.4"}
The Packet Sequence Count counts the packets of one APID; counts are independent per APID and run continuously modulo 16,384, and should not be reset before reaching 16,383 unless unavoidable.
:::

2. Segmentation is signalled, if used, with the Sequence Flags.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.4.2"}
Sequence Flags are 00 for a continuation segment, 01 for the first segment, 10 for the last segment and 11 for unsegmented user data; their use is not mandatory, and they must be 11 whenever the Octet String service is used.
:::

3. The length is written.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.5"}
The Packet Data Length is one fewer than the number of octets in the Packet Data Field: C = (octets in Packet Data Field) − 1.
:::

4. An optional secondary header can carry time and other ancillary data.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.4.2.1"}
If present, the Packet Secondary Header follows the primary header without a gap and holds a time code field, an ancillary data field, or both; its contents are mission-managed and the chosen option stays fixed for a managed data path. It is mandatory if there is no user data field and is not allowed in Idle Packets.
:::

5. When there is nothing to send, the data link layer may insert Idle Packets.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.2 notes, §4.1.3.3.4.4"}
Idle Packets use the APID 11111111111 (all ones), carry a project-specified idle pattern, and are generated when needed by the TM, AOS and USLP data link protocols to keep the data transport synchronized. The all-ones value is the only reserved APID.
:::

## What operators and engineers see

Packet displays usually list packets received per APID, sequence-count gaps per APID, length errors, and packets that failed to decode against the mission database. A gap in one APID's count with no frame-count gap points at the source application or onboard storage, not the link.

:::claim{label="example" loc="fictional console"}
`APID 0x07E HK: 1,204 pkts · seq gap 1040→1042 (1 missing) · len err 0 · idle filtered 3,118` — fictional values.
:::

## Misconceptions and failure symptoms

- **"Packets are delivered reliably and in order."** The protocol does not guarantee that.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§2.2"}
The SPP services are preconfigured, unidirectional, asynchronous and unconfirmed; they do not guarantee completeness or preserve sequence, and have no retransmission. Two-way exchange uses two separate managed data paths.
:::

- **"The length field is the packet length."** It is the data field length minus one; add 1 for the data field and 6 more for the whole packet.
- **"The sequence count is global."** Each APID has its own counter; compare counts only within one APID.
- **"A count wrap is a gap."** 16,383 → 0 is normal.
- **Symptom — packets fail to decode right after a gap:** the extractor may have lost alignment; check the First Header Pointer handling on the frame layer and the length arithmetic.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Header fields, sizes, count modulus, length rule, idle APID | CCSDS 133.0-B-2 | Standard-defined |
| APID allocation, secondary header format, maximum packet length, idle pattern | Mission | Mission-specific |
| Packet displays, gap reporting, routing by APID | Ground software | Common practice |

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.3.4 note 1"}
Apart from the idle value, there are no restrictions on choosing APIDs, and they do not have to be numbered consecutively.
:::

:::claim{label="standard" source="SANA-APID" loc="registry"}
The SANA APID registry lists 0–2039 as unmanaged (left to missions), 2040–2046 as unassigned or returned, and 2047 (all ones) as the Idle Packet APID (registry last updated 2020-06-02, checked 2026-10-28).
:::

:::claim{label="mission"}
Your mission's packet ICD and database define the APID map, whether a secondary header is present and how its time code is formatted, and the maximum packet sizes. Do not assume the values on this page.
:::

## Worked example

:::claim{label="example" loc="fictional header"}
Decode the fictional primary header `08 7E C4 12 00 3F`.

| Field | Bits | Value |
| :-- | :-- | :-- |
| Packet Version Number | 0–2 | 000 |
| Packet Type | 3 | 0 (telemetry) |
| Secondary Header Flag | 4 | 1 (present) |
| APID | 5–15 | 0x07E = 126 |
| Sequence Flags | 16–17 | 11 (unsegmented) |
| Packet Sequence Count | 18–31 | 0x0412 = 1042 |
| Packet Data Length | 32–47 | 0x003F = 63 |

**Answer explanation:** 08 7E is 0000 1000 0111 1110: bits 0–2 = 000, bit 3 = 0, bit 4 = 1, bits 5–15 = 000 0111 1110 (126). C4 12 is 1100 0100 0001 0010: flags 11, count 00 0100 0001 0010 (1042). The length field 63 means the data field is 64 octets, so the whole packet is 70 octets and the next packet starts 70 octets after this one began.
:::

## Related

- Glossary: space packet, APID, packet sequence count, idle packet.
- Topics: TM Space Data Link Protocol, telemetry lifecycle, command lifecycle.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
