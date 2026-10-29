---
id: security-associations-and-anti-replay
title: Security associations and anti-replay
definition: A security association is the one-way set of keys, algorithms and counters that both ends agree to use for a channel; its sequence number and window let the receiver reject replayed or wildly out-of-order frames.
section: security-resilience
level: advanced
order: 30
est_minutes: [20, 30]
prerequisites: [space-data-link-security]
learning_paths: [security-aware-operations]
objectives:
  - Explain what a security association holds and why it is one-way.
  - Walk through the receiver's checks in order (MAC, then sequence number).
  - Predict accept or reject for a received sequence number given the stored value and window.
  - Describe the SA state model (unkeyed, keyed, operational).
chain_position:
  direction: both
  stage: Transfer frames
glossary_terms: [security-association, spi]
related_topics: [space-data-link-security, key-management-and-rotation, command-lifecycle]
related_symptoms: [sdls-rejects-after-key-change]
standards: [ccsds-355-0-b-2, ccsds-355-1-b-1]
sources:
  - {id: CCSDS-355.0-B-2, loc: "§2.3.1, §2.3.2.3, §4.2.4.4"}
  - {id: CCSDS-355.1-B-1, loc: "§2.3.3"}
  - {id: CCSDS-350.1-G-3, loc: "§3.4.8"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

A recorded, perfectly authentic command sent again later is still authentic — authentication alone does not stop it. Anti-replay counters do. Their windows also decide whether legitimate frames survive losses and retransmissions, so a badly chosen window shows up as mysterious command rejections.

## Plain-language explanation

Each protected frame carries a counter that only goes up. The receiver remembers the highest counter it has accepted. A frame with a counter that is not higher is a repeat and is dropped; a frame that jumps too far ahead is also dropped, because a real link should not skip that many.

## Precise terminology

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.1.1, §2.3.1.2"}
A security association is a simplex (one-way), stateful cryptographic session providing authentication, integrity, replay protection and/or confidentiality; the SPI in each frame identifies it, and all frames with the same SPI on a physical channel share it.
:::

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.1.5"}
Both ends must create an SA, associate keys with it and activate it before use; SAs may be preloaded before launch or created while others are active, and switching between active SAs is an application-layer function.
:::

## Where in the chain

The checks run in the receiving end's security function, after frame validation and before the frame's data is handed to the data link protocol's users.

## How it works, step by step

1. **Sender** increments its sequence number for every frame on the SA.
2. **Receiver** checks in order:

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§4.2.4.4"}
On receipt the security function verifies the MAC first and discards frames that fail; it then discards frames whose sequence number is lower than or equal to the stored value, or larger than it by more than the SA's window; only frames passing every check update the stored sequence number.
:::

3. **Choose the window** to cover expected gaps.

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.2.3.3, §2.3.2.3.2 note"}
The sequence number window is a fixed positive value in the SA, sized for predicted delays and gaps in RF transmission; how a sequence number rollover to zero is interpreted is mission-specific.
:::

4. **Manage SA state.**

:::claim{label="standard" source="CCSDS-355.1-B-1" loc="§2.3.3"}
The SDLS extended procedures model an SA as Null (no SA), Unkeyed, Keyed (dormant) and Operational (in use), moved by Create, Rekey, Start, Stop, Expire and Delete; simple missions can use statically defined SAs with preloaded keys.
:::

## What operators and engineers see

Reject counters split by reason (MAC failure, sequence too low, sequence beyond window), the stored sequence number per SA, and SA states on the spacecraft as reported by the security function.

:::claim{label="example" loc="fictional console"}
`SPI 0x0011 · stored SN 1003 · window 10 · rejects: MAC 0, SN≤stored 1, SN>window 0` — fictional.
:::

## Misconceptions and failure symptoms

- **"Authenticated frames cannot be replayed."** They can, unless sequence numbers are checked.

:::claim{label="standard" source="CCSDS-350.1-G-3" loc="§3.4.8"}
CCSDS lists replay — recording authentic transmissions and sending them again — as a common threat that could make a spacecraft execute commands a second time if they are not rejected.
:::

- **"A bigger window is safer."** It tolerates more gaps but accepts larger jumps.
- **"Rejected frames are lost forever."** COP-1 will retransmit Type-A frames with new SDLS sequence numbers.
- **Symptom — first command after a long outage rejected:** ground and spacecraft counters diverged beyond the window; follow the mission's resynchronization procedure.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| SA concept, check order, SA state model | CCSDS 355.0-B-2, 355.1-B-1 | Standard-defined |
| Window size, counter length, rollover handling, SA set | Mission | Mission-specific |
| Recovery procedures for counter divergence | Operations | Common practice |

:::claim{label="mission"}
Your mission's security configuration defines windows, counter lengths and recovery procedures; these are sensitive and are never shown with real values.
:::

## Worked example

:::claim{label="example" loc="fictional sequence"}
Fictional SA: stored sequence number 1000, window 10. Frames arrive (all with valid MACs) carrying 1003, 1002, 1003, 1020, 1011.

**Answer explanation:** 1003 > 1000 and within 10 → accept, store 1003. 1002 ≤ 1003 → reject. 1003 ≤ 1003 → reject (replay). 1020 − 1003 = 17 > 10 → reject. 1011 − 1003 = 8 → accept, store 1011. Note that the late 1002 is lost even though it was genuine; on TC, COP-1 retransmission recovers it with a new sequence number.
:::

## Related

- Topics: Space Data Link Security, key management and rotation, command lifecycle.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
