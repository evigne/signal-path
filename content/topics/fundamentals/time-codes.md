---
id: time-codes
title: CCSDS time codes (CUC and CDS)
definition: CCSDS time codes are binary formats for time stamps in packets and ground data; CUC counts seconds and binary fractions from an epoch, and CDS counts days and milliseconds of day.
section: fundamentals
level: core
order: 50
est_minutes: [20, 30]
prerequisites: [decimal-and-binary-units, space-packet-protocol]
learning_paths: [ground-c2-software-engineer, fast-reference]
objectives:
  - Decode a CUC and a CDS time stamp, including the P-field.
  - Explain the 1958 TAI epoch and why CUC has no leap seconds while CDS does.
  - Say where time codes appear (packet secondary header, ground annotation).
chain_position:
  direction: both
  stage: Space packets
glossary_terms: [cuc, cds-time-code]
related_topics: [space-packet-protocol, telemetry-lifecycle, sle-transfer-services]
related_symptoms: [packets-present-values-invalid]
standards: [ccsds-301-0-b-4]
sources:
  - {id: CCSDS-301.0-B-4, loc: "§3.1–3.3"}
  - {id: CCSDS-133.0-B-2, loc: "§4.1.4.2.2"}
  - {id: IERS-BULC, loc: "Bulletin C 72"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues: []
---

## Why it matters

Every telemetry value is plotted against a time stamp. Using the wrong epoch, ignoring the fraction octets or mixing TAI and UTC shifts data by seconds or decades — errors that look like spacecraft clock faults.

## Plain-language explanation

A spacecraft clock is usually just a counter. CUC writes that counter as "seconds since an agreed start date" plus a binary fraction of a second. CDS instead writes "days since the start date" and "milliseconds since midnight". An optional first octet (the P-field) says which format and sizes are used; if it is left out, the format must be agreed in advance.

## Precise terminology

:::claim{label="standard" source="CCSDS-301.0-B-4" loc="§3.1.1"}
A time code has an optional preamble field (P-field) and a time field (T-field). When the P-field is present its first octet gives an extension flag (bit 0), a time code identification (bits 1–3) and details (bits 4–7); when it is omitted the code is not self-identifying and must be identified by other means.
:::

:::claim{label="standard" source="CCSDS-301.0-B-4" loc="§3.2"}
CUC counts basic time units (seconds recommended) from an epoch, in 1–4 octets plus 0–3 octets of binary fraction (extendable with a second P-field octet); the recommended epoch is 1958 January 1 TAI, the code is not UTC-based and leap seconds do not apply.
:::

:::claim{label="standard" source="CCSDS-301.0-B-4" loc="§3.3"}
CDS has a 16- or 24-bit day count from 1958 January 1 (or an agency epoch), a 32-bit millisecond-of-day field and an optional 16-bit (microsecond) or 32-bit (picosecond) submillisecond field; it is UTC-based, so leap-second corrections apply. Its P-field identification is 100.
:::

## Where in the chain

Onboard, time codes go in the packet secondary header. On the ground, stations and SLE annotate frames with earth receive time, and archives index by both.

:::claim{label="standard" source="CCSDS-133.0-B-2" loc="§4.1.4.2.2"}
If a Space Packet secondary header carries time, its Time Code Field uses one of the CCSDS segmented or unsegmented binary time codes.
:::

## How it works, step by step

1. **Identify the format** from the P-field, or from the mission ICD if implicit.
2. **Read the coarse part** (seconds or days and milliseconds).
3. **Add the fraction** (CUC fine octets ÷ 256ⁿ, or CDS submilliseconds).
4. **Convert to calendar time** from the epoch, in the right time scale (TAI for CUC level 1, UTC for CDS).

:::claim{label="standard" source="IERS-BULC" loc="Bulletin C 72"}
IERS Bulletin C 72 (6 July 2026) states that no leap second will be added at the end of December 2026 and that UTC − TAI has been −37 s since 2017 January 1, 0 h UTC, until further notice — so today TAI = UTC + 37 s. Recheck each bulletin before converting future dates.
:::

## What operators and engineers see

Displays usually show onboard time and ground receipt time side by side; a constant offset between them is light time plus processing, while jumps point at clock resets or wrong decoding.

:::claim{label="example" loc="fictional display"}
`OBT 2023-06-27T16:40:32.250 TAI · ERT shown in UTC beside it` — fictional; the two differ by light time, processing delay and the TAI−UTC offset.
:::

## Misconceptions and failure symptoms

- **"All CCSDS time is UTC."** CUC level 1 is TAI and ignores leap seconds; CDS is UTC.
- **"The epoch is 1970."** CCSDS recommends 1958 January 1; agency epochs (level 2) must be stated.
- **"Fraction octets are milliseconds."** CUC fractions are binary: one fine octet is 1/256 s.
- **Symptom — times off by exactly 12 years:** decoded with the Unix epoch instead of 1958.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Code formats, P-field bits, recommended epoch | CCSDS 301.0-B-4 | Standard-defined |
| Which code, octet counts, epoch level, explicit or implicit P-field | Mission | Mission-specific |
| Time correlation between onboard clock and UTC | Mission operations | Common practice |

:::claim{label="mission"}
Your mission's ICD fixes the time code, its octet counts and epoch, and how onboard time is correlated with ground time.
:::

## Worked example

:::claim{label="example" loc="fictional time stamps"}
Decode two fictional stamps.

1. CUC with P-field: `1E 7B 2D 6F 80 40 00`. P-field 0x1E = 0 001 11 10: level 1 (1958 TAI), 3 + 1 = 4 coarse octets, 2 fine octets. Coarse 0x7B2D6F80 = 2,066,575,232 s; fine 0x4000 / 65,536 = 0.25 s → 2023-06-27 16:40:32.25 TAI.
2. CDS with P-field: `40 62 31 02 FA F0 80`. P-field 0x40 = 0 100 0 0 00: CDS, 1958 epoch, 16-bit day, no submilliseconds. Day 0x6231 = 25,137 → 2026-10-28; ms 0x02FAF080 = 50,000,000 → 13:53:20.000 UTC.

**Answer explanation:** the P-field tells you how many octets to read; without it you would need the ICD. CUC counts continuously in TAI; CDS gives a UTC day and time.
:::

## Related

- Topics: Space Packet Protocol, telemetry lifecycle, SLE transfer services.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
