---
id: bandwidth-efficient-modulation
title: Bandwidth-efficient modulation (GMSK, filtered OQPSK)
definition: Bandwidth-efficient modulations shape the transmitted signal so it occupies far less spectrum than unfiltered BPSK at the same symbol rate, which CCSDS recommends for high-rate telemetry in congested bands.
section: space-link
subsection: rf-and-bands
level: advanced
order: 50
est_minutes: [20, 30]
prerequisites: [rf-basics, bits-symbols-and-rates, frequency-bands]
learning_paths: [communications-deep-dive]
objectives:
  - Explain why spectrum occupancy limits high-rate telemetry.
  - Compare occupied bandwidth of unfiltered BPSK, filtered OQPSK and GMSK.
  - Name the CCSDS-recommended modulations for Category A high-rate links.
  - Explain the 99 % occupied-bandwidth definition.
chain_position:
  direction: downlink
  stage: Modulation & RF
  after: Coding & sync marker
glossary_terms: [symbol-rate]
related_topics: [rf-basics, frequency-bands, link-budgets, high-rate-coding-and-modulation]
standards: [ccsds-401-0-b-32, ccsds-413-0-g-3]
sources:
  - {id: CCSDS-413.0-G-3, loc: "§2.1–2.3, Annex B"}
  - {id: CCSDS-401, loc: "§2.4.17A, §2.4.21A"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

A mission can have the link margin for a higher rate and still not be allowed to use it, because its signal would spill outside the bandwidth it may occupy. Modulation choice is therefore a regulatory and cross-support decision, not just a performance one.

## Plain-language explanation

Switching a carrier's phase abruptly, as plain BPSK does, splashes energy across a wide range of frequencies. Smoothing the switching — with filters or with gently changing frequency (GMSK) — keeps almost all the energy in a narrow band. The price is a little more complexity and sometimes a small performance loss.

## Precise terminology

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="Annex B2"}
Occupied bandwidth follows the ITU Radio Regulations definition: the band outside which the mean power above and below each equals 0.5 % of the total, i.e. 99 % power containment.
:::

## Where in the chain

Modulation is the last step on the transmit side: coded, randomized, sync-marked symbols drive the modulator; the receiver's demodulator reverses it.

## How it works, step by step

1. **Spectrum is scarce.**

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="§2.1"}
CCSDS notes that the 2200–2290 MHz Category A band is heavily used and that more missions now exceed 1 Ms/s; its recommendation 401 (2.4.17A) therefore sets a limited set of common bandwidth-efficient modulations for high symbol rates, also applicable to 8450–8500 MHz.
:::

2. **Regulators set masks.**

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="§2.2"}
The Space Frequency Coordination Group (SFCG) sets spectral emission masks for space-science downlinks (Recommendation 21-2R4 for Category A bands, 23-1R1 for Category B maximum bandwidth), which drive the choice of modulation.
:::

3. **Choose a compact modulation.**

:::claim{label="standard" source="CCSDS-401" loc="§2.4.17A, §2.4.21A"}
For Category A high-rate telemetry CCSDS 401.0-B-32 recommends GMSK or OQPSK.
:::

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="Annex B, table B-1"}
Simulated after a saturated amplifier, unfiltered BPSK occupies about 20.56 Rs (99 % bandwidth), baseband-filtered OQPSK about 0.86–0.93 Rs for most recommended filters, and precoded GMSK (BTs = 0.25) about 0.86 Rs, where Rs is the coded symbol rate at the modulator input.
:::

4. **Weigh the trade-offs.**

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="§2.3.1"}
CCSDS selects modulations by balancing bandwidth efficiency, BER performance, implementation complexity and cost, robustness to interference and cross-support compatibility.
:::

## What operators and engineers see

Spectrum-analyzer views at the station show the signal's shape: a compact hump for GMSK or filtered OQPSK, wide sidelobes for unfiltered BPSK. Configuration screens name the modulation and filter (e.g. "GMSK BT 0.25").

:::claim{label="example" loc="fictional configuration"}
`DL mod GMSK BTs 0.25 precoded · Rs 4.588 Msym/s · OBW ≈ 3.95 MHz` — fictional; 0.86 × 4.588 ≈ 3.95 MHz.
:::

## Misconceptions and failure symptoms

- **"Bandwidth equals symbol rate."** It depends on modulation and filtering — from about 0.86 Rs to over 20 Rs.
- **"More margin means a higher rate is allowed."** The spectral mask and allocation may forbid it.
- **"GMSK is just FSK."** Precoded GMSK is a specific filtered continuous-phase scheme with its own receiver requirements.
- **Symptom — interference complaints from neighbouring users:** check the modulation and filter configuration against the mask.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Recommended modulations and parameters | CCSDS 401.0-B-32 (with 413.0-G-3 rationale) | Standard-defined |
| Spectral masks | SFCG recommendations | Standard-defined (coordination body) |
| Modulation, filter, symbol rate actually used | Mission, frequency assignment | Mission-specific |

:::claim{label="mission"}
Your frequency assignment and the applicable SFCG mask, not this page, determine the bandwidth you may occupy.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional mission at 4.588 Msym/s compares unfiltered BPSK with precoded GMSK in a 2200–2290 MHz assignment.

**Answer explanation:** unfiltered BPSK would occupy about 20.56 × 4.588 ≈ 94 MHz — more than the whole 90 MHz band. GMSK occupies about 0.86 × 4.588 ≈ 3.95 MHz. This is why CCSDS recommends compact modulations for high symbol rates.
:::

## Related

- Topics: RF basics, frequency bands, link budgets, high-rate coding and modulation.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
