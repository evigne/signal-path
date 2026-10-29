---
id: standards-map
title: Standards map
definition: A map from each stage of the space communications chain to the CCSDS (and related) documents that define it, with issue and date, so readers can find the authoritative source quickly.
section: reference
level: intro
order: 10
est_minutes: [5, 10]
prerequisites: []
learning_paths: [fast-reference]
objectives:
  - Find which standard governs a given stage or data unit.
  - Tell Blue Books (normative) from Green Books (informative).
  - Know where issue dates and corrigenda are tracked on this site.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: []
related_topics: [end-to-end-system, protocol-comparison]
standards: [ccsds-130-0-g-4]
sources:
  - {id: CCSDS-CAT, loc: "snapshot 2026-10-28"}
  - {id: CCSDS-130.0-G-4, loc: "§2.2"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - CCSDS 231.0-B-4 Cor. 1 (July 2026) and 131.2-B-2 Cor. 1 (October 2026) are listed in the catalogue but are not in the local library; read them before publishing affected pages.
---

## Why it matters

Arguments end faster when someone can say "232.0-B-4 §4.1.2.7". Knowing which book covers which stage, and whether it is normative, is the shortest path to that.

## Plain-language explanation

CCSDS publishes Recommended Standards (Blue Books) that you implement, Informational Reports (Green Books) that explain and give rationale, and other colours for practices and experiments. Each stage of the chain has one or two key Blue Books.

## Precise terminology

:::claim{label="standard" source="CCSDS-CAT" loc="snapshot 2026-10-28"}
The CCSDS active-publications catalogue (captured 2026-10-28) lists each document with its book colour, issue and date, including separate corrigendum entries such as 232.0-B-4 Cor. 1 (October 2023), 231.0-B-4 Cor. 1 (July 2026) and 131.2-B-2 Cor. 1 (October 2026).
:::

## Where in the chain

| Stage | Normative (Blue) | Informative (Green) |
| :-- | :-- | :-- |
| RF and modulation | 401.0-B-32, 414.1-B-3 (ranging) | 413.0-G-3 |
| Sync and coding, TM | 131.0-B-6, 131.2-B-2, 131.3-B-2 | 130.1-G-3 |
| Sync and coding, TC | 231.0-B-4 | — |
| Data link | 132.0-B-3 (TM), 232.0-B-4 (TC), 232.1-B-2 (COP-1), 732.0-B-5 (AOS), 732.1-B-3 (USLP) | 130.0-G-4 |
| Link security | 355.0-B-2, 355.1-B-1, 352.0-B-2 | 350.1-G-3 |
| Packets and time | 133.0-B-2, 301.0-B-4 | — |
| Files | 727.0-B-5 | 720.1-G-4 |
| Ground interfaces | 911.1-B-5 (RAF), 911.2-B-4 (RCF), 912.1-B-5 (FCLTU) | — |
| Databases | 660.0-B-2 (XTCE) | — |

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§2.2"}
CCSDS organizes its space communications protocols by OSI layer — physical, data link (with protocol and synchronization-and-coding sublayers), network, transport and application.
:::

## How it works, step by step

1. Find the stage in the table.
2. Open the standard's entry in the site's standards library for scope, what the mission must define, issue, corrigenda and local status.
3. Cite issue and section, and check the register date before relying on it.

## What operators and engineers see

Standards appear in ICDs and configuration documents by number; mismatched issues between ground and spacecraft documents are a classic integration finding.

:::claim{label="example" loc="fictional ICD line"}
`TC: CCSDS 232.0-B-4 (incl. Cor. 1), COP-1 per 232.1-B-2, coding 231.0-B-4 BCH` — fictional.
:::

## Misconceptions and failure symptoms

- **"Green Books are requirements."** They explain; Blue Books specify.
- **"The issue number doesn't matter."** Fields, options and corrigenda change between issues.
- **Symptom — two teams cite different behaviour for the same field:** compare issues and corrigenda first.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Content of each standard | CCSDS | Standard-defined |
| Which standards and issues a mission adopts | Mission | Mission-specific |

:::claim{label="mission"}
Your mission's applicable-documents list fixes the issues and corrigenda that apply; the site always shows the current catalogue issue.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional question: "Which document says the TC frame length field is total minus one?"

**Answer explanation:** TC data link → 232.0-B-4; the field is in §4.1.2.7. The protocol comparison page shows the same fact with its citation.
:::

## Related

- Topics: end-to-end system, protocol comparison.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
