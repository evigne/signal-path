---
id: packets-vs-frames-postal-analogy
title: Packets and frames — envelopes and shipping containers
definition: Applications send variable-length Space Packets (envelopes); the link carries fixed-length transfer frames (shipping containers) that hold packets end to end, each container announced by a sync marker and protected by error-correcting code.
section: fundamentals
level: intro
order: 30
est_minutes: [10, 15]
prerequisites: [end-to-end-system, bits-symbols-and-rates]
learning_paths: [space-comms-101]
objectives:
  - Explain why applications use variable-length packets but the downlink uses fixed-length frames.
  - Describe how packets are packed into frames, including a packet that spills over into the next frame.
  - Say what the APID, the virtual channel and the sync marker each identify.
  - Explain what fills a frame when no packets are waiting.
chain_position:
  direction: downlink
  stage: Packetize & frame
  before: Onboard applications
  after: Coding & sync marker
glossary_terms: [space-packet, transfer-frame, apid, vcid, first-header-pointer, idle-packet, asm, cadu]
related_topics: [space-packet-protocol, tm-space-data-link-protocol, sync-markers, channel-coding]
related_labs: [space-packet-header-decoder, sync-marker-visualiser]
standards: [ccsds-133-0-b-2, ccsds-132-0-b-3, ccsds-131-0-b-6]
sources:
  - {id: CCSDS-133.0-B-2, loc: "§4.1.2.1, §4.1.2.2, §4.1.3.3"}
  - {id: CCSDS-132.0-B-3, loc: "§4.1.1, §4.1.2.7.6"}
  - {id: CCSDS-131.0-B-6, loc: "§9.1.1, §9.2.2"}
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"Packet" and "frame" are the two words you will hear most in telemetry discussions, and people new to the field often treat them as the same thing. They are different layers with different jobs. Knowing which is which tells you whether a problem is in the spacecraft's software (packets) or on the link (frames).

## Plain-language explanation

Think of the postal system.

- **Packets are envelopes.** Each onboard application — a thermal sensor, a camera, the attitude system — writes messages of whatever size it needs and puts them in envelopes. The address on the envelope (the **APID**) says which application sent it.
- **Frames are shipping containers.** The radio link wants boxes of exactly the same size, arriving one after another like containers on a conveyor belt. Envelopes are packed into containers end to end, with no gaps. A big envelope may not fit in the space left, so it continues in the next container.
- **Each container has a label on the front.** The container header says which spacecraft it came from and which **virtual channel** (a separate lane on the same conveyor) it belongs to, and it counts containers so gaps can be noticed.
- **A chime announces each container.** Before every container, the transmitter sends a fixed bit pattern — the **sync marker** — so the receiver can find where one container ends and the next begins in an endless stream of bits.
- **Protective packaging.** Error-correcting code is added so that a few damaged bits can be repaired on the ground.

If there are no envelopes to send, the container still has to go — so it is filled with a special "idle" filler.

::::beginner{title="Why not just send the envelopes?"}
A receiver listening to a noisy radio cannot easily tell where a variable-sized envelope starts. Fixed-size containers that arrive on a steady beat, each preceded by the same chime, are much easier to find and check. Once a container is found, the envelopes inside can be unpacked using the lengths written on them.
::::

## Precise terminology

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.2.1, §4.1.2.2"}
A Space Packet is a 6-octet primary header followed by a data field of 1 to 65 536 octets, so a packet is 7 to 65 542 octets long.
:::

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.1"}
A TM transfer frame has a 6-octet primary header, optional secondary header, a data field and optional trailer fields, and its length is constant throughout a mission phase on a physical channel.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
TM, AOS and USLP use fixed-length transfer frames to help synchronization on a noisy link, and virtual channels let several data streams with different service needs share one physical channel.
:::

## Where in the chain

Packets are made by onboard applications. Frames are made by the spacecraft's data link layer, just before coding and the sync marker are added. On the ground the order reverses: find the sync marker, decode, check the frame, then unpack the packets.

## How it works, step by step

1. An application builds a packet: header (with APID, sequence count and length) plus data.
2. The framing software appends packets to the data field of the current frame on the right virtual channel.
3. When the frame is full, it is closed; any packet that did not fit continues in the next frame on that channel.
4. The frame header records where the first new packet starts, so the receiver can recover even if it missed the previous frame.

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.7.6"}
The First Header Pointer in each TM frame gives the position of the first packet that starts in the data field; if no packet starts in the frame it is all ones, and if the frame carries only idle data it is 11111111110.
:::

5. If nothing is waiting, an idle packet or an idle frame fills the slot.
6. The frame is coded and the sync marker is attached.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.2"}
CCSDS 131.0-B-6 calls the marker the Code Synchronization Marker; when slicing is not used, it sits between transfer frames and also serves as the Attached Sync Marker.
:::

## What operators and engineers see

- **Frame-level counters** per virtual channel ("VC0 frames received, gaps").
- **Packet-level counters** per APID ("APID 0x07E fresh, sequence gap of 3").
- If frame counts rise smoothly but one APID stops, the link is fine and the problem is onboard or in packet extraction.

## Misconceptions and failure symptoms

- **"One packet = one frame."** Frames carry several packets, or part of one.
- **"Frames carry addresses like IP."** The APID names the source application; there is no destination address.
- **"Idle data means something is broken."** Idle filler is normal when there is nothing else to send.
- **Symptom — packets missing, frames fine:** see the symptom guide.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Packet and frame header formats, First Header Pointer rules | CCSDS 133.0, 132.0 | Standard-defined |
| Frame length, which APIDs go on which virtual channel | Mission | Mission-specific |
| Reading frame counters before packet counters | Operations teams | Common practice |

:::claim{label="mission"}
Your mission's ICD sets the frame length, the APID list and the virtual channel map. The numbers in the example below are fictional.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional mission uses frames with a 1 000-octet data field. Three packets are waiting: 400, 500 and 300 octets. How are they packed?

**Answer explanation:** frame 1 holds the 400-octet packet, the 500-octet packet and the first 100 octets of the 300-octet packet (400 + 500 + 100 = 1 000). Frame 2 starts with the remaining 200 octets, so its First Header Pointer is 200 — the first packet that *starts* in frame 2 begins at octet 200 (or the pointer is all ones if nothing new starts there).
:::

## Related

- Topics: Space Packet Protocol, TM Space Data Link Protocol, sync markers, channel coding.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
