---
id: sle-transfer-services
title: SLE transfer services (RAF, RCF, FCLTU) for software engineers
definition: Space Link Extension transfer services are the CCSDS interfaces between a ground station and a mission's control centre; each service instance is a stateful association with bind, start, transfer, stop and unbind operations.
section: ground-segment
level: advanced
order: 30
est_minutes: [30, 40]
prerequisites: [ground-stations-and-networks, tm-space-data-link-protocol, tc-space-data-link-protocol]
learning_paths: [ground-c2-software-engineer]
objectives:
  - Describe the SLE service-instance state machine (unbound, ready, active).
  - List the RAF and FCLTU operations and what each does.
  - Read the annotation delivered with each frame (earth receive time, antenna, continuity, quality).
  - Explain how FCLTU schedules radiation and protects command integrity.
chain_position:
  direction: both
  stage: Ground station & network
  before: Mission control
  after: Modulation & RF
glossary_terms: [sle, cltu]
related_topics: [ground-stations-and-networks, end-to-end-system, time-codes]
standards: [ccsds-911-1-b-5, ccsds-911-2-b-4, ccsds-912-1-b-5]
related_symptoms: [carrier-but-no-frame-lock, pass-done-data-missing]
related_labs: [end-to-end-walkthrough]
sources:
  - {id: CCSDS-911.1-B-5, loc: "§2.1, §2.6.4, §3"}
  - {id: CCSDS-911.2-B-4, loc: "§1.1"}
  - {id: CCSDS-912.1-B-5, loc: "§2.7, §2.8.2.3, §3"}
  - {id: CCSDS-913.1-B-2, loc: "§1.1, §2.5.3"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

If your control centre talks to agency or SLE-capable stations, your software is an SLE user. Most integration problems — "bind rejected", "no frames after start", "CLTUs not radiated" — are state-machine or parameter mismatches that are easy to diagnose once you know the model.

## Plain-language explanation

Think of an SLE service as a scheduled phone line between station and control centre for one pass. First you connect and authenticate (bind). Then you say "start sending" (or "start accepting commands"). Frames flow, each with a label saying when and where it was received. At the end you say stop, then hang up (unbind).

## Precise terminology

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§2.6.4"}
An RAF service instance is in one of three states: unbound (resources allocated, no association), ready (bound; operations allowed but no frame delivery) and active (frames delivered as they become available). RAF-START moves ready to active and RAF-STOP returns it to ready.
:::

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§3"}
RAF defines the operations BIND, UNBIND, START, STOP, TRANSFER-DATA, SYNC-NOTIFY, SCHEDULE-STATUS-REPORT, STATUS-REPORT, GET-PARAMETER and PEER-ABORT.
:::

:::claim{label="standard" source="CCSDS-911.2-B-4" loc="§1.1"}
RCF delivers the frames of one master channel or one virtual channel, rather than every frame on the physical channel as RAF does.
:::

## Where in the chain

SLE runs over the ground network between the station's return or forward processing and the mission's front-end software, after frame synchronization and decoding on the return side and before CLTU radiation on the forward side.

## How it works, step by step

**Return (RAF):**

1. Bind with credentials, then start with a requested frame quality and time window.

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§3.4"}
At RAF-START the user requests good frames only, erred frames only, or all frames.
:::

2. Receive frames with annotation.

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§3.6"}
Each RAF-TRANSFER-DATA carries the frame plus earth-receive-time, antenna-ID, data-link-continuity, delivered-frame-quality and a private annotation; it is unconfirmed and only valid in the active state.
:::

3. Watch notifications — SYNC-NOTIFY reports events such as loss of frame sync, in true chronological order relative to the frames.
4. Stop and unbind at the end of the pass.

**Forward (FCLTU):**

:::claim{label="standard" source="CCSDS-912.1-B-5" loc="§2.7"}
In the FCLTU scenario the user binds and starts, then sends CLTUs with CLTU-TRANSFER-DATA; the provider buffers each until its earliest radiation time (or radiates at once when production is operational), applies any delay time between CLTUs, and sends CLTU-ASYNC-NOTIFY when its buffer empties.
:::

:::claim{label="standard" source="CCSDS-912.1-B-5" loc="§2.8.2.3"}
Each CLTU carries a cltu-identification that must increase monotonically; a CLTU without the expected number is rejected, which also limits third-party injection of command data.
:::

## What operators and engineers see

Front-end logs show bind/start results, per-instance state, frame rates and notifications; FCLTU status shows buffered, radiated and expired CLTUs.

:::claim{label="example" loc="fictional log"}
`RAF-1 BIND ok · START (all frames) ok → active · 54,880 frames · SYNC-NOTIFY loss-of-frame-sync 10:13:39Z · STOP · UNBIND` — fictional.
:::

## Misconceptions and failure symptoms

- **"Bound means data flows."** Frames only flow in the active state, after START.
- **"SLE confirms every frame."** TRANSFER-DATA is unconfirmed; the underlying communications service is assumed reliable.
- **"Radiated when sent."** FCLTU buffers until the radiation time and production status allow.
- **Symptom — operation invoked in the wrong state:** the peer aborts the association with a protocol error; check your client's state machine.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Operations, states, parameters, annotations | CCSDS 911.1, 911.2, 912.1 | Standard-defined |
| Service instances per pass, credentials, frame-quality and delivery-mode choices | Mission and provider (service agreement) | Mission-specific |
| Client libraries and reconnection behaviour | Ground software | Common practice |

:::claim{label="mission"}
Your service agreement and pass configuration define instance identifiers, credentials, delivery modes and timing; never reuse examples here as configuration.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional client binds RAF at AOS − 2 min, receives "bind ok", but sees no frames for the whole pass while the station reports frame lock.

**Answer explanation:** the instance is in the ready state; frames are only delivered after RAF-START moves it to active. Check that the client sends START (and with a frame-quality filter that matches what the station produces).
:::


## Deep dive & operational edge cases

::::expert{title="Under the hood: ISP1, delivery modes, latency and production status"}
:::claim{label="standard" source="CCSDS-913.1-B-2" loc="§1.1, §2.5.3"}
SLE operations travel between user and provider using ISP1: SLE PDUs encoded with ASN.1 and carried over TCP/IP. Each side can run a heartbeat: the heartbeat-interval is the longest time it may stay silent (0 turns heartbeats off), and the dead-factor is how many intervals without any message mean the TCP connection is declared dead.
:::

:::claim{label="standard" source="CCSDS-911.1-B-5" loc="§2.2, §2.6.4.6.2"}
A RAF service instance runs in exactly one delivery mode, set by service management: online timely, online complete or offline. Online timely may deliberately discard frames that cannot be delivered within the latency limit; the provider fills a transfer buffer and sends it when it is full or when a release timer, started at the latency limit, expires.
:::

:::claim{label="standard" source="CCSDS-912.1-B-5" loc="§2.7, §3.6.2.7, annex B"}
For Forward CLTU, the provider tracks a production status — configured, operational, interrupted or halted — and notifies the user when it becomes operational. A user can bind, start and send CLTUs before that; they are buffered. A CLTU with a latest-radiation-time is held while production is interrupted and discarded if that time passes first.
:::

:::claim{label="example" loc="fictional mid-pass carrier drop"}
At 10:06 the uplink amplifier trips. The station's FCLTU production status goes to "interrupted"; CLTUs already queued with a latest-radiation-time of 10:07 are held, then discarded at 10:07. On the mission side, COP-1 sees no new CLCW acknowledgements, T1 expires and FOP-1 retransmits once the uplink is back — or raises an Alert if the transmission limit runs out first. Two protocols, two different recovery clocks.
:::
::::

## Related

- Topics: ground stations and networks, end-to-end system, time codes.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
