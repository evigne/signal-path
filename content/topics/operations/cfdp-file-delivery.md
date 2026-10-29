---
id: cfdp-file-delivery
title: CFDP file delivery
definition: The CCSDS File Delivery Protocol copies files between onboard and ground filestores over whatever underlying link is available, either unacknowledged or with acknowledgements and retransmission that guarantee complete delivery.
section: operations
level: core
order: 40
est_minutes: [20, 30]
prerequisites: [space-packet-protocol, telemetry-lifecycle]
learning_paths: [ground-c2-software-engineer, communications-deep-dive]
objectives:
  - Explain why missions move data as files and what CFDP adds.
  - Contrast unacknowledged and acknowledged transactions.
  - Name the PDUs in a transaction (Metadata, File Data, EOF, Finished, ACK, NAK).
  - Say how CFDP relates to Space Packets and APIDs.
chain_position:
  direction: both
  stage: Applications
  after: Space packets
glossary_terms: [space-packet, apid]
related_topics: [telemetry-lifecycle, space-packet-protocol, uplink-and-downlink]
standards: [ccsds-727-0-b-5]
related_labs: [data-budget-calculator]
sources:
  - {id: CCSDS-727.0-B-5, loc: "§2.1, §2.2.5, §2.3, §2.4"}
  - {id: CCSDS-720.1-G-4, loc: "§2.1"}
  - {id: CCSDS-133.0-B-2, loc: "§4.1.3.3.4 note 2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Payload data, logs and software uploads are increasingly handled as files. Ground software has to run CFDP entities, track transactions across several passes and decide when a file is complete — not just count packets.

## Plain-language explanation

Instead of streaming numbers, the spacecraft saves files and the ground asks for them (or the spacecraft decides to send them). CFDP sends a description of the file, then the pieces, then an "end of file". In the reliable mode, the receiver lists any missing pieces and the sender resends just those, possibly over several passes, until the file is whole.

## Precise terminology

:::claim{label="standard" source="CCSDS-727.0-B-5" loc="§2.1"}
CFDP transfers files to and from spacecraft storage and adds file-management services; it assumes one filestore onboard and one on the ground and copies data between them, independent of the storage technology.
:::

:::claim{label="standard" source="CCSDS-727.0-B-5" loc="§2.3"}
In unacknowledged mode delivery failures are not reported and cannot be repaired, so completeness is not guaranteed by CFDP; in acknowledged mode the receiver reports missing segments, which are retransmitted, guaranteeing complete delivery.
:::

- **Transaction:** one file copy, identified by source entity ID and transaction sequence number.
- **Entity:** a CFDP protocol endpoint, onboard or on the ground.

## Where in the chain

CFDP sits above the data link: its PDUs ride in an underlying "unitdata transfer" service, commonly Space Packets on a mission-chosen APID.

:::claim{label="standard" source="CCSDS-727.0-B-5" loc="§2.2.5"}
CFDP assumes a single, deliberately simple underlying unitdata transfer layer; it uses only that layer's addressing and PDU delimitation, and multiplexes its transactions internally.
:::

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.3.4 note 2"}
Space Packets can still carry PDUs of other protocols such as CFDP, but the coupling of APIDs to protocols is now mission specific rather than a reserved APID.
:::

## How it works, step by step

:::claim{label="standard" source="CCSDS-727.0-B-5" loc="§2.4"}
Every copy starts with metadata, then file segments, then an EOF PDU. In reliable transactions NAKs request retransmission of lost data, the EOF is acknowledged, and a Finished PDU — itself acknowledged — is sent once all file data has been assembled; unacknowledged transactions may optionally request a Finished PDU ("transaction closure").
:::

:::claim{label="practice" source="CCSDS-720.1-G-4" loc="§2.1"}
CCSDS motivates CFDP by large onboard mass memories, more autonomous operations in which the spacecraft decides when to download stored data, and relay chains that need store-and-forward delivery.
:::

## What operators and engineers see

Ground CFDP tools list transactions with their state (in progress, suspended, finished, cancelled), bytes received, outstanding NAK ranges and fault conditions; transactions can span several passes.

:::claim{label="example" loc="fictional console"}
`TX 0x0003/1187 IMG_0412.dat 18.4 MB · 97.2 % · NAK ranges 2 · state SUSPENDED (LOS)` — fictional.
:::

## Misconceptions and failure symptoms

- **"CFDP needs a reliable link."** Acknowledged mode provides reliability itself over an unreliable link.
- **"Unacknowledged means unusable."** It is fine over a link that is already reliable, or when losses are acceptable.
- **"One pass, one file."** Transactions can be suspended at LOS and resumed later.
- **Symptom — file stuck at 99 %:** outstanding NAKs not being serviced; check that the uplink (for NAKs) is available, not just the downlink.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| PDUs, modes, transaction procedures | CCSDS 727.0-B-5 | Standard-defined |
| Entity IDs, APID for CFDP, mode per file class, timers and limits | Mission | Mission-specific |
| Ground transaction tracking and file catalogues | Ground software | Common practice |

:::claim{label="mission"}
Your mission's CFDP configuration (entity IDs, APIDs, modes, timers, maximum file sizes) is defined in its ICDs and management information base.
:::

## Worked example

:::claim{label="example" loc="fictional transfer"}
A fictional 18.4 MB file is sent in acknowledged mode at 2.0 Mbit/s of useful rate; 3 % of segments are lost on the first pass.

**Answer explanation:** first pass ≈ 18.4 × 8 / 2.0 = 73.6 s of downlink; the receiver NAKs the missing ≈ 0.55 MB, which needs an uplink path for the NAK and ≈ 2.2 s more downlink. The file completes when the Finished PDU is sent and acknowledged — possibly on a later pass.
:::

## Related

- Topics: telemetry lifecycle, Space Packet Protocol, uplink and downlink.
- Lab: data budget calculator.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
