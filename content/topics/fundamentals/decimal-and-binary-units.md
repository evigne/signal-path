---
id: decimal-and-binary-units
title: Decimal and binary units (kB vs KiB, Mbit/s vs MiB)
definition: SI prefixes such as kilo and mega are powers of ten; IEC binary prefixes such as kibi and mebi are powers of two. Mixing them, or mixing bits and octets, produces errors of 2.4 % to 10 % and of 8×.
section: fundamentals
level: intro
order: 20
est_minutes: [10, 15]
prerequisites: []
learning_paths: [space-comms-101, operator-conversation-fluency, ground-c2-software-engineer, fast-reference]
objectives:
  - Convert between bits, octets, decimal and binary multiples without error.
  - Spot when a figure mixes decimal and binary prefixes, or bits and bytes.
  - Compute a pass data volume and express it in both MB and MiB.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [binary-prefix]
related_topics: [bits-symbols-and-rates]
related_labs: [bit-byte-endianness-inspector, data-budget-calculator]
sources:
  - {id: NIST-BINARY, loc: "page"}
  - {id: CCSDS-130.0-G-4, loc: "§1.3.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Data budgets, recorder sizes and downlink volumes are argued about in every mission. A link engineer quoting Mbit/s, a flight-software engineer quoting MiB and an operator quoting "megs" can be 8× or 5 % apart without anyone being wrong — until the recorder overflows.

## Plain-language explanation

"Kilo" means a thousand. Computers like powers of two, so people started using "kilo" for 1024 as well, and the two meanings got mixed. The fix is to say "kibi" (Ki) when you mean 1024. Separately, a bit is one binary digit and a byte (in space standards, an octet) is eight bits; lowercase b and uppercase B tell them apart.

## Precise terminology

:::claim{label="standard" source="NIST-BINARY" loc="page"}
SI prefixes are decimal (kilo = 10³). The IEC approved separate prefixes for binary multiples in 1998 — kibi (Ki) 2¹⁰, mebi (Mi) 2²⁰, gibi (Gi) 2³⁰, tebi (Ti) 2⁴⁰, pebi (Pi) 2⁵⁰, exbi (Ei) 2⁶⁰ — and they are not part of the SI. One kibibit is 1024 bits.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§1.3.2"}
CCSDS uses the term octet for an 8-bit word.
:::

| Write | Means |
| :-- | :-- |
| kbit/s, Mbit/s | 10³, 10⁶ bits per second |
| kB, MB, GB | 10³, 10⁶, 10⁹ octets |
| KiB, MiB, GiB | 2¹⁰, 2²⁰, 2³⁰ octets |

## Where in the chain

Everywhere a size or rate is quoted: link budgets (bit/s), frame and packet lengths (octets), onboard recorders and ground archives (often binary multiples in software tools).

## How it works, step by step

1. Convert everything to bits or octets first.
2. Apply the prefix: decimal (10³ steps) or binary (2¹⁰ steps).
3. Only then compare.

The gap between decimal and binary grows with each step: 2.4 % at kilo/kibi, 4.9 % at mega/mebi, 7.4 % at giga/gibi, 10 % at tera/tebi.

## What operators and engineers see

Ground tools often display recorder fill and file sizes in binary units while link tools show decimal bit rates; the label is frequently just "MB".

:::claim{label="example" loc="fictional console"}
`REC fill 3.72 GB (3.46 GiB) · DL rate 2.0 Mbit/s` — fictional; the same quantity shown both ways.
:::

## Misconceptions and failure symptoms

- **"MB and MiB are the same."** They differ by 4.9 %.
- **"Mb and MB are the same."** They differ by 8×.
- **"Data rates use binary prefixes."** Rates are conventionally decimal; check your tool if unsure.
- **Symptom — downlink plan "fits" but the recorder never empties:** check whether the volume was in MiB and the rate in Mbit/s, and whether coding overhead was counted (see *Bits, symbols and rates*).

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Meaning of SI and IEC prefixes | SI / IEC (via NIST) | Standard-defined |
| Which units tools display | Tool and software vendors | Common practice |
| Units used in mission budgets and ICDs | Mission | Mission-specific |

:::claim{label="mission"}
State units explicitly in your mission's budgets and ICDs (for example "MiB" or "MB = 10⁶ octets") and keep the convention consistent across teams.
:::

## Worked example

:::claim{label="example" loc="fictional pass"}
A fictional 10-minute pass at 2.0 Mbit/s of useful (information) data. How much is downlinked, in MB and MiB?

**Answer explanation:** 2.0 × 10⁶ bit/s × 600 s = 1.2 × 10⁹ bits = 1.5 × 10⁸ octets = 150 MB. In binary units, 1.5 × 10⁸ / 2²⁰ = 143.05 MiB. If someone says "150 megs", ask which one.
:::

## Related

- Topics: bits, symbols and rates.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
