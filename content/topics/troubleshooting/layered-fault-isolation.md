---
id: layered-fault-isolation
title: Layered fault isolation
definition: A troubleshooting method that walks the communications chain layer by layer — RF, sync and coding, frames, packets, ground delivery, processing — and stops at the first layer whose indicators look wrong.
section: troubleshooting
level: core
order: 10
est_minutes: [20, 30]
prerequisites: [end-to-end-system, carrier-and-symbol-sync, tm-space-data-link-protocol, space-packet-protocol]
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive, security-aware-operations, fast-reference]
objectives:
  - Order the checks for a telemetry or command problem by layer.
  - Name the indicator that proves each layer is healthy.
  - Use the standards' own counters and flags as evidence.
  - Write a concise hypothesis that names a layer and the evidence for it.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [frame-synchronization, fecf, packet-sequence-count, clcw]
related_topics: [end-to-end-system, carrier-and-symbol-sync, sync-markers, tm-space-data-link-protocol, space-packet-protocol, command-lifecycle]
related_labs: [anomaly-decision-tree]
related_symptoms: [carrier-but-no-frame-lock, frame-lock-with-errors, packets-missing-frames-ok, command-radiated-no-execution, no-carrier, packets-present-values-invalid, pass-done-data-missing]
tool: 9
sources:
  - {id: CCSDS-130.1-G-3, loc: "§9.3.7"}
  - {id: CCSDS-132.0-B-3, loc: "§4.1.2.5, §4.1.2.6, §4.1.6"}
  - {id: CCSDS-133.0-B-2, loc: "§4.1.3.4.3"}
  - {id: CCSDS-232.0-B-4, loc: "§4.2.1.8"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Under pressure, people jump to the most frightening explanation ("the spacecraft is dead"). Walking the layers in order is faster and safer: each layer has a counter or flag that proves it healthy, so you can eliminate whole teams' areas in seconds.

## Plain-language explanation

Start at the bottom: is there a signal at all? Then: can we read symbols? Can we find frames? Are frames passing their checks and arriving in order? Are packets complete? Is the data reaching our control centre and being processed correctly? The first "no" is where you dig.

::::beginner{title="Checking a dead lamp"}
If a lamp does not light, you do not start by rewiring the house. You check the bulb, then the switch, then the plug, then the fuse — in order — and stop at the first thing that is wrong. Layered fault isolation does the same along the signal chain: start at the bottom (is there a carrier?) and walk upward until you find the first layer that looks unhealthy.
::::

## Precise terminology

- **Layer indicator:** a counter, lock or flag that proves a layer is working.
- **First bad layer:** the lowest layer whose indicator is wrong; layers above it will also look wrong.

## Where in the chain

All of it — this is the method for using the rest of the site.

## How it works, step by step

| Step | Layer | Healthy when | Topic |
| :-- | :-- | :-- | :-- |
| 1 | RF | Carrier lock, expected signal level | RF basics, carrier and symbol sync |
| 2 | Symbols | Symbol lock at the configured rate | Carrier and symbol sync |
| 3 | Sync and coding | Frame lock, decoder success | Sync markers, channel coding |
| 4 | Frames | FECF passes, frame counts continuous per VC | TM Space Data Link Protocol |
| 5 | Packets | Per-APID sequence counts continuous, lengths valid | Space Packet Protocol |
| 6 | Delivery | SLE or provider stream bound and flowing | Ground stations and networks |
| 7 | Processing | Parameters fresh, calibrations plausible | Telemetry lifecycle |

The standards supply the evidence at steps 3–5:

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§9.3.7"}
CCSDS describes frame synchronizers with Search, Acquire, Lock and Flywheel states, so a frame-sync status tells you whether markers are being found consistently.
:::

:::claim{label="standard" source="CCSDS-132.0-B-3" loc="§4.1.2.5, §4.1.2.6, §4.1.6"}
TM frames carry modulo-256 master-channel and virtual-channel frame counts and, if used, a Frame Error Control Field; gaps and FECF failures localise loss to the data link.
:::

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.3.4.3"}
Each APID has its own modulo-16,384 packet sequence count, so a packet gap with no frame gap points above the data link.
:::

For commanding, the CLCW gives the uplink's own evidence:

::::expert{title="Uplink layers read from the CLCW"}
:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.2.1.8"}
The CLCW carries No RF Available and No Bit Lock flags (uplink physical layer at the spacecraft) as well as Lockout, Wait and Retransmit flags (COP-1 acceptance), separating RF problems from protocol problems.
:::
::::

## What operators and engineers see

A good troubleshooting log names the layer, the evidence and the next check.

:::claim{label="example" loc="fictional log"}
`10:05Z H1: L4 frames — VC0 VCFC continuous, FECF 0 fails → frames OK. H2: L5 packets — APID 0x07E seq gap 1040→1042 → onboard source or recorder. Next: check onboard APID 0x07E generation status.` — fictional.
:::

## Misconceptions and failure symptoms

- **"Start with the thing that changed last."** Useful as a hint, but verify the lower layers first; a coincidental change misleads.
- **"If one layer is bad, look only there."** Also confirm the layer below is truly good.
- **"Errors at high layers mean high-layer bugs."** Low-margin RF produces errors that surface everywhere.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Counters, flags and sync states used as evidence | CCSDS standards | Standard-defined |
| Order of checks, log format, escalation | Operations | Common practice |
| Which indicators exist and their thresholds | Mission and ground systems | Mission-specific |

:::claim{label="mission"}
Your mission's anomaly procedures define escalation paths and safe actions; this method helps you decide where to look, not what you are allowed to do.
:::

## Worked example

:::claim{label="example" loc="fictional case"}
Fictional case: operators report "no housekeeping since 10:03Z". Station shows carrier, symbol and frame lock; RAF is delivering; VC0 frame counts are continuous with no FECF failures; idle-packet counts are rising; APID 0x07E has no packets since 10:03Z while other APIDs are fresh.

**Answer explanation:** layers 1–4 and delivery are healthy; packets of other APIDs arrive, so extraction works. The first bad layer is the source of APID 0x07E onboard (application stopped or routing changed) — escalate to flight software and onboard data handling, not RF or the station.
:::

## Related

- Topics: end-to-end system, carrier and symbol sync, sync markers, TM Space Data Link Protocol, Space Packet Protocol, command lifecycle.
- Symptoms: carrier but no frame lock; frame lock with errors.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
