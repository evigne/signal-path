---
id: c2-software-landscape
title: C2 and flight software landscape
definition: Mission control (C2) software receives telemetry, decodes it with a mission database, displays and archives it, and builds and sends commands; open-source frameworks such as Yamcs, OpenC3 COSMOS and Open MCT, and NASA's cFS on the flight side, are common reference points.
section: ground-segment
level: intro
order: 20
est_minutes: [15, 20]
prerequisites: [end-to-end-system]
learning_paths: [ground-c2-software-engineer]
objectives:
  - Name the functional blocks of a C2 system.
  - Place example open-source tools on those blocks without overstating what they do.
  - Explain why a tool's protocol support must be checked against your mission's interfaces.
chain_position:
  direction: both
  stage: Mission control
  after: Ground station & network
glossary_terms: [sle]
related_topics: [telemetry-and-command-databases, sle-transfer-services, telemetry-lifecycle, command-lifecycle]
sources:
  - {id: YAMCS-HOME, loc: "home page"}
  - {id: YAMCS-LINKS, loc: "data links"}
  - {id: OPENC3-HOME, loc: "home page"}
  - {id: OPENMCT-HOME, loc: "home page"}
  - {id: CFS-GSFC, loc: "capability page"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - Verify Yamcs SLE and COP-1 support in its full manual before stating it (ledger S2).
  - Find a first-party statement of cFS's message format before describing its use of CCSDS packets (ledger S5).
---

## Why it matters

Software engineers joining a mission usually inherit a C2 stack. Knowing the blocks lets you place any product — open source or proprietary — and ask the right integration questions.

## Plain-language explanation

A C2 system has the same jobs whatever it is called: connect to stations or test equipment, decode incoming data into named values, check limits, show and store them, let people and scripts send commands safely, and track whether those commands worked. Products differ in which of those jobs they cover and which protocols they speak.

## Precise terminology

- **Data link (C2 sense):** the software connector that receives or sends data — not the CCSDS data link layer, though it may implement it.
- **Decommutation:** turning packets into parameters using the database.
- **Procedure / script:** automated command sequences with checks.

## Where in the chain

C2 software sits at the mission-control end: after the station and ground network on the downlink, before them on the uplink. Flight software frameworks sit at the other end, onboard.

## How it works, step by step

The blocks, with dated first-party descriptions of example tools:

:::claim{label="practice" source="YAMCS-HOME" loc="home page"}
Yamcs describes itself as an open-source command, control and communication framework (AGPL) from Space Applications Services, with manual and automated commanding, command stacks and procedures, and support for CCSDS among other protocols (checked 2026-10-28).
:::

:::claim{label="practice" source="YAMCS-LINKS" loc="data links"}
Yamcs documents TCP and UDP telemetry and telecommand links, file-polling telemetry links and CCSDS frame processing as data link implementations (checked 2026-10-28).
:::

:::claim{label="practice" source="OPENC3-HOME" loc="home page"}
OpenC3 COSMOS is offered as an open-source Core edition and a paid Enterprise edition, with telemetry decommutation, commanding, Ruby or Python scripting, limits and alerts, and logging and replay (checked 2026-10-28).
:::

:::claim{label="practice" source="OPENMCT-HOME" loc="home page"}
Open MCT, from NASA Ames with JPL and AMMOS, is a web-based mission operations data visualization framework for streaming and historical data, imagery, timelines and procedures; commanding and protocol decoding are not described on its home page (checked 2026-10-28).
:::

:::claim{label="practice" source="CFS-GSFC" loc="capability page"}
NASA's core Flight System is a platform-independent, reusable flight software framework made of a platform support package, an OS abstraction layer and a core flight executive with a bus architecture and pluggable apps (page updated Oct 5, 2026).
:::

## What operators and engineers see

Operators see displays, alarms, command stacks and verification states; engineers see link configurations, database imports, scripts and logs. The same blocks appear regardless of the product.

:::claim{label="example" loc="fictional architecture"}
`station ⇄ SLE/provider link ⇄ C2 server (links · decom · limits · archive · commanding) ⇄ web displays` — fictional deployment sketch.
:::

## Misconceptions and failure symptoms

- **"This tool speaks CCSDS, so it fits my mission."** Check the exact protocols, options and versions your ICDs require.
- **"Visualization = C2."** A display framework may not command or decode at all.
- **"Open source means unsupported."** Several projects offer commercial support or editions; check terms.
- **Symptom — frames arrive but no parameters update:** the link may deliver frames while the packet or database layer is not configured.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Protocols the C2 system must speak | CCSDS standards plus mission ICDs | Standard-defined / Mission-specific |
| Choice of C2 product and architecture | Mission and operator | Mission-specific |
| Integration patterns, scripting conventions | Teams | Common practice |

:::claim{label="mission"}
Your mission's ground segment design picks the C2 stack; check each required interface (SLE, COP-1, frame and packet formats, database format) against the product's own current documentation.
:::

## Worked example

:::claim{label="example" loc="fictional selection"}
A fictional mission needs SLE RAF/FCLTU to agency stations, TM/TC frames with COP-1, an XTCE database and web displays. Which checks come first?

**Answer explanation:** confirm in each candidate's current documentation: SLE client support, COP-1 implementation, frame and packet processing, database import format, and display options. Where a page does not state a capability (as for SLE and COP-1 on the Yamcs data-links page), treat it as "to verify", not as missing or present.
:::

## Related

- Topics: telemetry and command databases, SLE transfer services, telemetry lifecycle, command lifecycle.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
