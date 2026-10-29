---
id: uplink-and-downlink
title: Uplink and downlink (forward and return links)
definition: The downlink (return link) carries telemetry and payload data from the spacecraft to the ground; the uplink (forward link) carries commands to the spacecraft. They use different frames, coding and delivery guarantees.
section: start-here
level: intro
order: 30
est_minutes: [15, 20]
prerequisites: [end-to-end-system]
learning_paths: [space-comms-101, operator-conversation-fluency, ground-c2-software-engineer, security-aware-operations]
objectives:
  - Use downlink/return and uplink/forward correctly.
  - Contrast the TM and TC data link protocols (frame length, coding unit, retransmission).
  - Explain why the uplink has a retransmission mechanism and the downlink usually does not.
  - Read the CLCW returned on the downlink as the uplink's acknowledgement.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [forward-link, return-link, cltu, cop-1, clcw]
related_topics: [end-to-end-system, command-lifecycle, telemetry-lifecycle, tm-space-data-link-protocol]
related_symptoms: [command-radiated-no-execution]
related_labs: [cop1-farm-simulator]
standards: [ccsds-132-0-b-3, ccsds-231-0-b-4, ccsds-232-0-b-4]
sources:
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
  - {id: CCSDS-232.0-B-4, loc: "§2.2.2, §4.1, §4.2.1"}
  - {id: CCSDS-231.0-B-4, loc: "§5.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

The two directions behave differently, and operators expect you to know which one you are talking about. A lost telemetry frame is simply gone; a lost command frame is retransmitted. Mixing them up leads to wrong conclusions about what the spacecraft has received.

## Plain-language explanation

::::beginner{title="Two very different conversations"}
Picture a live radio broadcast going one way and a registered letter going the other. The broadcast (downlink) pours out continuously; if you miss a sentence, it is gone. The letter (uplink) is short, precious and tracked: the sender wants proof it arrived, in the right order, before sending the next one.
::::

The downlink is the spacecraft talking: a steady, high-volume stream of fixed-size frames. The uplink is the ground talking: short, occasional bursts of commands that must arrive complete and in order. Because commands matter so much, the spacecraft reports back on the downlink which command frames it has accepted, and the ground resends any that went missing.

## Precise terminology

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
The TM Space Data Link Protocol is usually used to send telemetry from spacecraft to ground (the return link) and the TC Space Data Link Protocol to send commands from ground to spacecraft (the forward link); AOS can serve either or both, and USLP is envisaged to replace TM, TC, AOS and Proximity-1 for future missions.
:::

- **Downlink / return link:** space-to-Earth (or relay return).
- **Uplink / forward link:** Earth-to-space (or relay forward).
- **CLTU:** the unit the uplink coding layer transmits.

## Where in the chain

Both directions pass through the same stages — packets, frames, coding, RF, ground station, ground network — in opposite order. The two meet in the CLCW: an uplink status report carried in downlink frames.

## How it works, step by step

**Uplink (TC):**

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.1"}
A TC transfer frame has a 5-octet header, a data field of up to 1019 octets (1017 with the optional 2-octet Frame Error Control Field) and is variable in length.
:::

For transmission, one or more TC frames are wrapped in a **CLTU** (Communications Link Transmission Unit): a known start pattern, the error-protected command data, and an end marker.

::::expert{title="CLTU start and tail sequences"}
:::claim{label="standard" source="CCSDS-231.0-B-4" loc="§5.2"}
For transmission, one or more TC frames are BCH- or LDPC-encoded into a CLTU: a start sequence (16 bits, 1110101110010000, for BCH), the encoded codewords, and — for BCH — a 64-bit tail sequence (C5C5C5C5C5C5C579 hex) built to be uncorrectable so it stops decoding.
:::
::::

**Retransmission on the uplink:**

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§2.2.2.2, §2.2.2.3"}
Type-A (sequence-controlled) service uses a go-back-n ARQ procedure so that, with high probability, no frame data is lost, duplicated or delivered out of order on a virtual channel. Type-B (expedited) service sends each unit once with no retransmission and is normally used in exceptional cases such as spacecraft recovery, or when a higher layer retransmits.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
TC and USLP have the COP-1 retransmission mechanism; the TM and AOS protocols have none, so complete delivery on those links must be provided by a higher layer if needed.
:::

**The acknowledgement path:**

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.2.1"}
The spacecraft reports its receiving state in a 32-bit Communications Link Control Word, which includes the virtual channel, No RF Available and No Bit Lock flags, Lockout, Wait and Retransmit flags, a 2-bit FARM-B counter and an 8-bit Report Value (the next expected frame sequence number).
:::

## What operators and engineers see

On the uplink side: commands queued, frames sent, CLCW report value catching up, and any Lockout, Wait or Retransmit flags. On the downlink side: lock indicators, frame counts and packet freshness. The CLCW appears on downlink displays even though it describes the uplink.

:::claim{label="example" loc="fictional console"}
`TC VC1 · V(S)=37 · CLCW N(R)=37 · LO=0 W=0 RT=0 · NoRF=0 NoBitLock=0` — fictional: everything sent so far has been accepted.
:::

## Misconceptions and failure symptoms

- **"Sent means received."** For Type-A frames, only the CLCW report value confirms acceptance.
- **"Telemetry is retransmitted like commands."** TM and AOS have no link-level retransmission; missed passes need onboard storage and replay.
- **"Uplink and downlink rates are similar."** Uplinks are usually much slower.
- **Symptom — CLCW Lockout flag set:** the spacecraft's FARM rejected an out-of-window frame; commanding on that VC stops until an Unlock directive. See the command lifecycle page.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Frame formats, CLTU structure, COP-1 behaviour, CLCW fields | CCSDS 231.0, 232.0, 232.1 | Standard-defined |
| Uplink and downlink rates, Type-A vs Type-B use, VC allocation | Mission | Mission-specific |
| When to use Type-B (e.g. recovery procedures) | Operations procedures | Common practice |

:::claim{label="mission"}
Your mission's TC ICD sets maximum frame length, coding (BCH or LDPC), which virtual channels carry commands, and when expedited (Type-B) commanding is allowed.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional pass: the ground sends Type-AD frames with sequence numbers 37, 38 and 39. The next CLCW shows Report Value 38 and Retransmit flag 1.

**Answer explanation:** frame 37 was accepted; 38 was not (lost or rejected), so 38 and everything after it — 39 — is resent (go-back-n). The spacecraft discards 39 the first time because it arrived out of sequence.
:::

## Related

- Topics: end-to-end system, command lifecycle, telemetry lifecycle, TM Space Data Link Protocol.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
