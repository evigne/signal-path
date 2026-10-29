---
id: bits-symbols-and-rates
title: Bits, symbols and rates
definition: A bit is a unit of information, a symbol is what the link actually transmits, and the rates of each differ by the code rate and the modulation.
section: fundamentals
subsection: digital-communications
level: intro
order: 10
est_minutes: [15, 20]
prerequisites: []
learning_paths: [space-comms-101, operator-conversation-fluency, ground-c2-software-engineer, communications-deep-dive, fast-reference]
objectives:
  - Distinguish information bit rate, coded symbol rate and channel symbol rate.
  - Compute one rate from another given the code rate and the modulation order.
  - Explain what Eb/N0 measures and why it is quoted per information bit.
  - Avoid confusing a link's symbol rate with delivered application throughput.
chain_position:
  direction: both
  stage: Modulation & RF
  before: Coding & sync marker
glossary_terms: [code-rate, eb-n0, symbol-rate]
related_topics: [channel-coding, carrier-and-symbol-sync, sync-markers]
related_labs: [data-budget-calculator]
standards: [ccsds-131-0-b-6]
tool: 1
sources:
  - {id: CCSDS-413.0-G-3, loc: "§2.4"}
  - {id: CCSDS-130.1-G-3, loc: "§3.3.1"}
  - {id: CCSDS-131.0-B-6, loc: "§4.3.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"The link runs at 4.6 megasymbols" and "we get 2 megabits of telemetry" can both be true of the same pass. Mixing up bits and symbols leads to wrong data-budget estimates, wrong configuration values and confused conversations with RF engineers.

## Plain-language explanation

Information bits are what you want to deliver. Coding adds extra symbols to protect them, so more symbols leave the encoder than bits went in. Then the modulator groups symbols: simple modulations send one symbol per "tick" of the carrier, richer ones pack several into each tick. Each step changes the rate you would measure.

::::beginner{title="One bit per tick, or two"}
Think of the carrier as a clock hand that the transmitter may nudge to a new position at every tick.

- **BPSK** allows **2 positions** (0° and 180°). Each tick can say one of two things, so it carries **1 bit**: 0° = `0`, 180° = `1`.
- **QPSK** allows **4 positions** (45°, 135°, 225°, 315°). Each tick can say one of four things, so it carries **2 bits**: `00`, `01`, `11`, `10`.

```
BPSK  bits: 1   0   1   1        → 4 ticks
QPSK  bits: 10  11  ← same 4 bits → 2 ticks
```

So for the same data, QPSK needs half as many ticks per second — half the **symbol rate** — and therefore roughly half the radio bandwidth. Richer schemes such as 8PSK or 16APSK pack even more positions onto each tick; those positions sit closer together, so the receiver needs a cleaner signal to tell them apart. Coding then adds protective symbols on top, which is why bits, coded symbols and channel symbols all have different rates.
::::

## Precise terminology

:::claim{label="standard" source="CCSDS-413.0-G-3" loc="§2.4"}
CCSDS uses Rb for the information bit rate, Rs for the coded symbol rate at the modulator input, and RChS for the channel symbol rate after the modulator. Without coding or Bi-φ formatting, Rs equals Rb; for (O)QPSK, 8PSK, 16APSK, 32APSK and 64APSK, RChS = Rs / log₂M, where M is 4, 8, 16, 32 or 64.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§4.3.1"}
Code rate is expressed as information bits per coded symbol; the basic CCSDS convolutional code has a rate of 1/2 bit per symbol.
:::

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§3.3.1"}
Eb/N0 is the received signal energy per information bit divided by the one-sided noise spectral density; it is the usual measure of how much signal a code needs to reach a given error rate.
:::

## Where in the chain

Information bits exist from onboard software down to the transfer frame. Coded symbols appear after channel coding. Channel symbols exist only at the modulator, on the RF link, and at the ground demodulator.

## How it works, step by step

1. Start with the information bit rate Rb (transfer frame bits per second).
2. Add block-code and sync-marker overhead (if used).
3. Divide by the convolutional or other code rate to get the coded symbol rate Rs.
4. Divide Rs by log₂M for the modulation to get the channel symbol rate RChS.

## What operators and engineers see

Station and modem configurations are usually written in symbol rates; telemetry and data-budget discussions are usually in information bit rates. Link-quality displays may show Es/N0 (per symbol) or Eb/N0 (per information bit) — check which one before comparing numbers.

## Misconceptions and failure symptoms

- **"Symbol rate = bit rate."** Only without coding (and for binary modulation).
- **"Information bit rate = application throughput."** Frame headers, idle data and packet headers all eat into it.
- **"Mbps" without context.** Say whether you mean information bits, coded symbols or channel symbols, and whether megabytes are decimal (10⁶) or binary (2²⁰).
- **Symptom — modem won't lock:** a symbol-rate value entered as a bit rate (or the reverse) is a common configuration slip.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Rate definitions and notation | CCSDS 413.0-G-3 (informational) | Standard-defined (terminology) |
| Code rates available | CCSDS 131.0-B-6 | Standard-defined |
| Actual Rb, code and modulation | Mission link design | Mission-specific |

:::claim{label="mission"}
The information bit rate, coding and modulation on your link come from the mission's link budget and configuration.
:::

## Worked example

:::claim{label="example" loc="fictional link"}
A fictional downlink carries Rb = 2.0 Mbit/s of transfer frames, coded with Reed–Solomon (255,223) at interleaving depth 5 plus 4-octet sync markers (overhead factor 1279/1115 ≈ 1.147), then rate-1/2 convolutional coding, then QPSK.

- After R-S and markers: 2.0 × 1.147 = 2.294 Mbit/s
- After rate-1/2 coding: Rs = 2.294 / 0.5 = 4.588 Msymbol/s
- After QPSK (log₂4 = 2): RChS = 4.588 / 2 = 2.294 Msymbol/s

**Answer explanation:** each coding step adds symbols; the modulation step packs two coded symbols into each channel symbol. Application data delivered is lower than 2.0 Mbit/s once frame and packet headers and idle data are subtracted.
:::

Try the **Bit, byte & endianness inspector** (Tool 1) for the bits-and-bytes side of this topic.

## Related

- Glossary: code rate, Eb/N0, symbol rate.
- Topics: channel coding, carrier and symbol sync, sync markers.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
