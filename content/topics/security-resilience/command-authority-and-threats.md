---
id: command-authority-and-threats
title: Command authority and threats to space missions
definition: Command authority is the set of controls that decide who may send which command when — authentication on the link, access control on the ground, and database constraints and confirmations — designed against threats such as masquerade, replay and unauthorized access.
section: security-resilience
level: core
order: 20
est_minutes: [20, 30]
prerequisites: [command-lifecycle, space-data-link-security]
learning_paths: [security-aware-operations]
objectives:
  - Name the common threats CCSDS lists for space missions.
  - Map each command-path control to the threat it addresses.
  - Explain how database constraints and significance levels support safe commanding.
chain_position:
  direction: uplink
  stage: Applications
glossary_terms: [command-verifier, sdls]
related_topics: [command-lifecycle, space-data-link-security, security-associations-and-anti-replay, key-management-and-rotation]
standards: [ccsds-350-1-g-3]
related_labs: [cop1-farm-simulator]
sources:
  - {id: CCSDS-350.1-G-3, loc: "§3.3.2, §3.4"}
  - {id: CCSDS-660.0-B-2, loc: "§6.1.3.2.4, §6.1.3.2.5"}
  - {id: CCSDS-355.0-B-2, loc: "§2.3.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Commanding is the one place where a mistake or an attacker can directly harm the spacecraft. Engineers who build or operate command systems need to see which control stops which failure, so that none is assumed to cover for another.

## Plain-language explanation

Several locks protect the command path. On the ground: only the right people, with the right role, can prepare and release commands, and risky commands need confirmation or are blocked in the wrong mode. On the link: the spacecraft only accepts frames that carry a valid authentication code and a fresh counter. Afterwards: telemetry confirms what actually happened.

::::beginner{title="Keys to the building"}
Commanding a spacecraft is like having the master keys to an unattended building. Command authority is the list of who holds which keys and which doors they open; threats are the ways a stranger could copy a key, sneak in behind someone, or replay an old instruction. Good practice limits who has keys, logs every use, and makes old instructions useless.
::::

## Precise terminology

:::claim{label="standard" source="CCSDS-350.1-G-3" loc="§3.4"}
CCSDS lists common threats to space missions including data modification, ground system loss, interception, jamming, denial of service, masquerade, replay, software threats, unauthorized access, tainted hardware and supply-chain threats.
:::

:::claim{label="standard" source="CCSDS-350.1-G-3" loc="§3.4.7"}
CCSDS describes masquerade as an entity disguising its identity; an outsider masquerading as a spacecraft operator could send unauthorized commands, causing damage, data loss or loss of the mission.
:::

:::claim{label="standard" source="CCSDS-350.1-G-3" loc="§3.4.10"}
CCSDS describes unauthorized access as a breach of access control that could let an unauthorized entity take over a ground system or upload commands; weak access controls, intercepted credentials and social engineering are named routes.
:::

## Where in the chain

Controls sit at every stage of the uplink: ground access control and command database checks in the control centre, secure ground networks to the station, SDLS on the space link, and onboard command validation.

## How it works, step by step

| Control | Where | Threat addressed |
| :-- | :-- | :-- |
| Strong authentication and roles | Ground systems | Unauthorized access, masquerade |
| Transmission constraints | Command database | Wrong command in the wrong mode |
| Significance and confirmation | Command system | Hazardous command by mistake |
| SDLS authentication (MAC) | Space link | Masquerade, data modification |
| SDLS sequence numbers | Space link | Replay |
| Verifiers and telemetry checks | Ground + spacecraft | Undetected failure |

::::expert{title="How databases enforce command constraints"}
:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1.3.2.4, §6.1.3.2.5"}
In XTCE, transmission constraints can block a command in the current operating mode, and significance levels (none, watch, warning, distress, critical, severe) let a command system require extra user confirmation.
:::
::::

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.2.1"}
SDLS authentication ensures the integrity of transmitted data and the authenticity of its source, and its sequence numbering detects unauthorized replay of previously transmitted data.
:::

## What operators and engineers see

Login and role checks, confirmation dialogs for significant commands, blocked-command messages with the constraint that fired, SDLS reject counters, and verification results.

:::claim{label="example" loc="fictional console"}
`HTR_OFF zone=3 · significance CRITICAL · confirmation by 2nd operator required · constraint MODE≠SAFE ✓ · released` — fictional.
:::

## Misconceptions and failure symptoms

- **"Link encryption makes ground security optional."** An attacker inside the ground system sends authentic commands.
- **"Constraints are security."** They prevent mistakes; they are not access control.
- **"Authentication stops replay."** Only with sequence-number checks.
- **Symptom — unexplained commands in the history:** treat as a security incident per the mission's procedures, preserve logs, and do not "clean up" first.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Threat catalogue, SDLS and database mechanisms | CCSDS 350.1-G-3, 355.0-B-2, 660.0-B-2 | Standard-defined |
| Roles, two-person rules, critical-command lists | Mission and operator | Mission-specific |
| Threat assessment method | Mission security (350.1-G-3 §4 gives guidance) | Common practice |

:::claim{label="mission"}
Your mission's security plan and flight rules define who may command, which commands need confirmation, and how incidents are handled.
:::

## Worked example

:::claim{label="example" loc="fictional scenario"}
Fictional scenario: an attacker records a valid, authenticated "reorient" command during a pass and transmits it again the next day.

**Answer explanation:** the MAC is still valid, so authentication alone would accept it. The SDLS sequence check rejects it because its sequence number is not higher than the stored value. If anti-replay were disabled, COP-1 might also reject it as out of sequence, but that is a data link mechanism, not a security control — and Type-B frames bypass it.
:::

## Related

- Topics: command lifecycle, Space Data Link Security, security associations and anti-replay, key management and rotation.
- Lab: COP-1 simulator.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
