---
id: telemetry-and-command-databases
title: Telemetry and command databases (XTCE)
definition: A mission database describes every telemetry parameter and command — where it sits in a packet, how it is encoded, how it is calibrated and checked — and XTCE is the CCSDS XML format for exchanging those definitions between systems.
section: operations
level: core
order: 30
est_minutes: [25, 35]
prerequisites: [space-packet-protocol, telemetry-lifecycle, command-lifecycle]
learning_paths: [ground-c2-software-engineer]
objectives:
  - Explain what a mission database contains and what it deliberately does not.
  - Map XTCE concepts (SpaceSystem, parameter types, containers, meta-commands) to packets and displays.
  - Explain why database errors look like spacecraft faults.
chain_position:
  direction: both
  stage: Applications
glossary_terms: [alarm-limit, command-verifier, apid]
related_topics: [telemetry-lifecycle, command-lifecycle, space-packet-protocol]
related_symptoms: [packets-present-values-invalid]
standards: [ccsds-660-0-b-2]
related_labs: [telemetry-calibration-sandbox, bit-byte-endianness-inspector]
sources:
  - {id: CCSDS-660.0-B-2, loc: "§1, §2, §6.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Most of a C2 system's behaviour is driven by its database: which bits are which parameter, what "red" means, what a command looks like and how its success is checked. Software engineers build the importers, validators and editors for it, and a wrong entry is indistinguishable from an anomaly.

## Plain-language explanation

The database is the dictionary between raw bits and meaning. For telemetry it says "in packets on this APID, bits 48–59 are battery temperature, unsigned, converted with this formula, yellow above 40 °C". For commands it says "HEATER_ON takes a zone number 1–4, is blocked in safe mode, needs confirmation, and is complete when this status bit changes". XTCE is an agreed XML way to write that dictionary so it can move between tools.

## Precise terminology

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§1"}
XTCE is an information model for exchanging telemetry and telecommand definitions between organizations and systems; it covers packet and frame structure, unpacking, command identification and arguments, encodings and validity, but is a metadata specification — not a format for transferring live or historical TM/TC data — and excludes displays, protocols and flight software.
:::

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§2"}
The XML schema in Annex A is normative: a compliant XTCE database is an XML file that validates against it.
:::

- **SpaceSystem:** the hierarchical root object — a spacecraft, or any controlled asset.
- **Parameter type / parameter:** the definition and the named instance of a measurand.
- **Sequence container:** the layout of a packet or frame.
- **Meta-command:** the definition of a command, its arguments and checks.

## Where in the chain

The database is used at both ends of the ground chain: by packet decommutation and display on the downlink, and by command building, constraint checking and verification on the uplink.

## How it works, step by step

1. **Structure.**

:::claim{label="standard" source="CCSDS-660.0-B-2" loc="§6.1"}
The top-level XTCE object is a SpaceSystem, which may contain sub-SpaceSystems, telemetry metadata and command metadata, so ground equipment as well as spacecraft can be described hierarchically.
:::

2. **Telemetry:** parameter types carry encoding, units, calibration and alarm limits; sequence containers place parameters in packets (see the telemetry lifecycle page).
3. **Commands:** meta-commands carry arguments, transmission constraints, significance and verifiers (see the command lifecycle page).
4. **Exchange and validate:** export, schema-validate, import, then regression-test displays and decoders against recorded data.

## What operators and engineers see

Operators see the database's effects: names, units, limits, command forms and verification stages. Engineers see versioned database releases, import reports and validation errors.

:::claim{label="example" loc="fictional release note"}
`MDB v4.12 · +3 parameters (APID 0x07E) · BAT_TEMP limits 40/50 °C · HTR_ON verifier timeout 10 s` — fictional.
:::

## Misconceptions and failure symptoms

- **"XTCE carries telemetry."** It describes telemetry; data travels in packets and frames.
- **"The database is static."** It changes with flight software and operations; version and test it.
- **"A wrong value is a sensor problem."** Encoding, byte order and calibration live in the database.
- **Symptom — values jump right after a database release:** compare the old and new definitions of that parameter before raising an anomaly.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Exchange schema and concepts (if XTCE is used) | CCSDS 660.0-B-2 | Standard-defined |
| Parameters, commands, limits, verifiers | Mission | Mission-specific |
| Database tooling, release process, internal formats | Ground software teams | Common practice |

:::claim{label="mission"}
Your mission database is configuration-controlled mission data; its format may be XTCE or a tool-specific format, and its contents come from the spacecraft ICDs.
:::

## Worked example

:::claim{label="example" loc="fictional definition"}
A fictional parameter: BAT_TEMP, in container HK_PKT (APID 0x07E) at bit offset 48, 12-bit unsigned, calibration y = 0.03x − 40.0 °C, soft high 40.0, hard high 50.0. Raw value 0x0AAB arrives.

**Answer explanation:** 0x0AAB = 2731 → 0.03 × 2731 − 40.0 = 41.9 °C, above the soft limit: yellow. Every step — offset, width, signedness, formula, limit — came from the database, which is why database review is part of anomaly response.
:::

## Related

- Topics: telemetry lifecycle, command lifecycle, Space Packet Protocol.
- Labs: telemetry calibration sandbox, bit/byte/endianness inspector.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
