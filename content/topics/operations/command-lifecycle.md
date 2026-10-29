---
id: command-lifecycle
title: Command lifecycle
definition: The path of a command from operator request to confirmed execution — database lookup, constraint and significance checks, encoding, framing with COP-1, CLTU transmission, acceptance onboard, and verification in telemetry.
section: operations
level: core
order: 20
est_minutes: [25, 35]
prerequisites: [uplink-and-downlink, space-packet-protocol]
learning_paths: [operator-conversation-fluency, ground-c2-software-engineer, security-aware-operations]
objectives:
  - List the stages of a command from operator to verified execution.
  - Explain transmission constraints, significance levels and verifiers in a command database.
  - Describe how COP-1 sequences, acknowledges and retransmits command frames.
  - Read FOP-1 and FARM-1 states and recover from Lockout.
chain_position:
  direction: uplink
  stage: Applications
  before: Space packets
glossary_terms: [cop-1, clcw, cltu, command-verifier]
related_topics: [uplink-and-downlink, telemetry-lifecycle, space-packet-protocol]
standards: [ccsds-232-1-b-2, ccsds-660-0-b-2]
related_symptoms: [command-radiated-no-execution]
related_labs: [cop1-farm-simulator]
tool: 6
sources:
  - {id: CCSDS-660.0-B-2, loc: "§6.1.3.2"}
  - {id: CCSDS-232.0-B-4, loc: "§2.2.2, §4.1.2.3"}
  - {id: CCSDS-232.1-B-2, loc: "§5.1.2, §6.1.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Commanding is where operations can do real damage. Every operator conversation about commands uses this lifecycle: "it's radiated but not accepted", "we're in lockout", "execution verifier timed out". Knowing which stage a command reached tells you what is safe to do next.

## Plain-language explanation

An operator picks a command and fills in its arguments. Ground software checks it is allowed right now and asks for confirmation if it is risky, then encodes it into a packet, puts the packet in a command frame, wraps the frame in a CLTU and sends it through the station. Onboard, the frame is checked and accepted in order; the spacecraft reports back what it accepted. Finally, telemetry shows whether the command did what was intended.

## Precise terminology

- **Command verifier:** a telemetry check that confirms a command reached a processing stage.
- **Transmission constraint:** a condition that blocks sending a command.
- **Significance:** a risk level that may require extra confirmation.
- **FOP-1 / FARM-1:** the sending and receiving halves of COP-1.

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1.3.2.8"}
XTCE defines eight command verifiers for stages of command processing: TransferredToRange, TransferredFromRange, Received, Accepted, Queued, Execution, Complete and Failed.
:::

## Where in the chain

Commands start in the mission control system, travel through the ground network and station on the forward link, and end in the spacecraft's command handling. Confirmation returns on the downlink (CLCW and telemetry).

## How it works, step by step

1. **Build and check on the ground.**

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1.3.2.4, §6.1.3.2.5"}
In XTCE, transmission constraints check whether a command may be sent in the current operating mode and can block it; significance levels (none, watch, warning, distress, critical, severe) let a control system require extra user confirmation.
:::

2. **Frame with COP-1.** Type-A frames are sequence-controlled; Type-B frames bypass acceptance checks.

:::claim{label="standard" source="CCSDS-232.0-B-4" loc="§4.1.2.3"}
The TC frame's Bypass Flag selects Type-A (0, subject to FARM acceptance checks) or Type-B (1, checks bypassed); the Control Command Flag marks a frame as data (Type-D, 0) or a COP control command (Type-C, 1), giving AD, BD and BC frames.
:::

3. **Transmit the CLTU** through the station (see *Ground stations and networks* for the SLE forward service).
4. **Accept onboard and report.**

:::claim{label="standard" source="CCSDS-232.1-B-2" loc="§6.1.2"}
FARM-1 has three states: Open (accepts in-sequence Type-A frames), Wait (cannot accept, for example buffers full) and Lockout (entered when a frame falls outside the acceptance window; no Type-A frames are accepted until an Unlock control command).
:::

:::claim{label="standard" source="CCSDS-232.1-B-2" loc="§5.1.2"}
FOP-1 has six states per virtual channel: Active (S1), Retransmit without Wait (S2), Retransmit with Wait (S3), Initializing without BC Frame (S4), Initializing with BC Frame (S5) and Initial (S6).
:::

5. **Verify in telemetry** — command counters, acknowledgement packets and the parameters the command was meant to change.

## What operators and engineers see

Command stacks show each command's stage (queued, released, radiated, accepted, executed, failed), FOP-1 state, V(S) versus the CLCW report value, and any Lockout, Wait or Retransmit flags.

:::claim{label="example" loc="fictional console"}
`HTR_ON(zone=3) · RADIATED 10:04:11Z · ACCEPTED (CLCW N(R)=38) · EXEC verifier PASS 10:04:13Z · FOP S1` — fictional.
:::

## Misconceptions and failure symptoms

- **"Radiated means executed."** Radiation, acceptance by FARM, execution and effect are separate stages.
- **"Type-B is a faster Type-A."** It has no retransmission and no sequence guarantee; it is meant for exceptional cases such as recovery.
- **"Lockout clears itself."** It needs an Unlock control command (a BC frame).
- **Symptom — every frame retransmitted, report value frozen:** check the CLCW for Lockout or Wait, and the No RF / No Bit Lock flags for an uplink RF problem.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| COP-1 states, flags, frame types | CCSDS 232.0-B-4, 232.1-B-2 | Standard-defined |
| Verifier, constraint and significance model (if XTCE) | CCSDS 660.0-B-2 | Standard-defined |
| Command database, constraints, verification timeouts | Mission | Mission-specific |
| Two-person checks, critical-command procedures | Operations | Common practice |

:::claim{label="mission"}
Your mission's command database and flight rules define which commands exist, their arguments, constraints, significance and verifiers, and when Type-B commanding is permitted.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional pass: after three Type-AD frames, the CLCW shows Lockout = 1, Report Value = 52, and FOP-1 shows V(S) = 55.

**Answer explanation:** the FARM entered Lockout, so frames 52–54 are not accepted. Following typical procedure, operators send an Unlock (BC frame), wait for a CLCW showing Lockout = 0, then re-initialize FOP-1 (setting V(S) to the report value if needed) and resend from 52. Commands queued behind them must not be assumed executed.
:::

## Related

- Topics: uplink and downlink, telemetry lifecycle, Space Packet Protocol.
- Glossary: COP-1, CLCW, CLTU, command verifier.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
