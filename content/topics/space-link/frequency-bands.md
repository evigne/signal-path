---
id: frequency-bands
title: Frequency bands and allocations
definition: Spacecraft may only transmit in bands the ITU Radio Regulations allocate to the relevant space service and direction, shared with other services and subject to footnotes and a national licence.
section: space-link
subsection: rf-and-bands
level: intro
order: 20
est_minutes: [20, 25]
prerequisites: [rf-basics]
learning_paths: [space-comms-101, operator-conversation-fluency, communications-deep-dive]
objectives:
  - Describe a band correctly as an allocation to a service, in a direction, on a primary or secondary basis.
  - Name the common S-, X- and Ka-band allocations used by near-Earth missions.
  - Explain why an allocation is not permission to transmit.
  - Recognise common errors in band tables (direction, deep space vs near-Earth, passive bands).
chain_position:
  direction: both
  stage: Modulation & RF
glossary_terms: [frequency-allocation]
related_topics: [rf-basics, ground-stations-and-networks]
related_symptoms: [no-carrier]
standards: [ccsds-401-0-b-32]
sources:
  - {id: ITU-RR-2024, loc: "Vol. 1, Art. 5"}
  - {id: CCSDS-401, loc: "§2.6.1, §3.1.2A"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

"S-band TT&C, X-band payload" is shorthand, and it hides a lot. Getting direction, service or band edges wrong in a design or a provider request wastes months of licensing work. Operators also hear about interference and coordination; this page gives the vocabulary.

## Plain-language explanation

The radio spectrum is shared by everyone. An international treaty — the ITU Radio Regulations — divides it into bands and says which kinds of service may use each band and in which direction (up or down). National regulators then license individual stations. A band being "for space research" doesn't mean you can use it; you need a licence, and you share it with others.

::::beginner{title="Lanes on a motorway"}
The radio spectrum is like a motorway divided into lanes by international agreement. Each lane (band) is reserved for certain kinds of traffic, and you need permission to drive in it. Lower lanes (UHF, S) are forgiving and easy to use but narrow; higher lanes (X, Ka) are wider — more data — but need precise steering (pointed antennas) and suffer more in bad weather.
::::

## Precise terminology

- **Allocation:** an entry in the Table of Frequency Allocations giving a band to a service.
- **Primary / secondary:** CAPITALS in the table mean primary; lower case means secondary (must not cause interference to, and cannot claim protection from, primary services).
- **Direction:** Earth-to-space (uplink) or space-to-Earth (downlink).
- **Deep space:** more than 2 × 10⁶ km from Earth; some bands are reserved for it.

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5"}
The Radio Regulations Table of Frequency Allocations marks primary services in capitals and secondary services in lower case, and every band below is shared with other primary services and subject to footnotes and national licensing.
:::

## Where in the chain

Bands constrain the RF stage: carrier frequencies on both links, and therefore antenna, transponder and ground-station choices.

## How it works, step by step

1. **Pick bands by service and direction.** Common near-Earth allocations (Edition 2024):

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5, 2 025–2 110 MHz and 2 200–2 290 MHz"}
2025–2110 MHz is allocated to space operation, Earth exploration-satellite and space research Earth-to-space (and space-to-space); 2200–2290 MHz to the same services space-to-Earth (and space-to-space); both are co-primary with fixed and mobile.
:::

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5, 7 145–7 235 MHz, No. 5.460"}
In X-band uplink, 7145–7190 MHz is for deep-space research Earth-to-space; near-Earth space research and EESS uplink use 7190–7235 MHz, where footnote 5.460 prohibits deep-space emissions.
:::

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5, 8 025–8 500 MHz, No. 5.465"}
8025–8400 MHz is allocated to Earth exploration-satellite space-to-Earth (no space research allocation); space research space-to-Earth uses 8400–8500 MHz, with 8400–8450 MHz limited to deep space by footnote 5.465.
:::

:::claim{label="standard" source="CCSDS-401" loc="§3.1.2A"}
CCSDS 401.0-B-32 gives recommendations on the use of the 8450–8500 MHz band for Category A space research missions.
:::

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5, 25.5–27 GHz"}
25.5–27 GHz is allocated to Earth exploration-satellite and space research space-to-Earth, co-primary with fixed, inter-satellite and mobile.
:::

2. **Check the footnotes and passive bands.**

:::claim{label="standard" source="ITU-RR-2024" loc="Vol. 1, Art. 5, No. 5.340"}
Footnote 5.340 prohibits all emissions in certain passive bands, including 1400–1427 MHz, 23.6–24 GHz, 31.3–31.5 GHz (and 31.5–31.8 GHz in Region 2) and 50.2–50.4 GHz.
:::

3. **Coordinate, file and license** through the national regulator; only then transmit.

## What operators and engineers see

Frequencies appear in station configuration (uplink and downlink carrier, often in MHz to several decimals), in pass plans and in provider service descriptions. Interference reports and "frequency not licensed at this site" constraints come from this layer.

:::claim{label="example" loc="fictional configuration"}
`UL 2041.250000 MHz · DL 2216.437500 MHz · ratio 221/240 coherent` — fictional assignment; check: 2041.25 × 240/221 ≈ 2216.742 MHz, so this downlink is not the coherent turnaround of this uplink.
:::

## Misconceptions and failure symptoms

- **"X-band is 8025–8400 MHz for satellites."** That band is EESS only; space research downlink is 8400–8500 MHz with deep-space limits.
- **"401–403 MHz is a TT&C uplink."** In 401–402 MHz space operation is space-to-Earth; it is not a generic uplink band.
- **"Amateur bands are free TT&C."** Amateur-satellite use carries amateur-service conditions and is not general commercial TT&C.
- **"An allocation means I can transmit."** You need coordination and a licence.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Allocations and footnotes | ITU Radio Regulations (Edition 2024) | Standard-defined |
| Turnaround ratios and band-use recommendations | CCSDS 401.0-B-32 | Standard-defined |
| Licence, exact frequencies, bandwidth | National regulator and mission | Mission-specific |

:::claim{label="mission"}
Your mission's frequency assignment and licences — not this page — define the frequencies you may use, at which stations, and with what bandwidth and power.
:::

## Worked example

:::claim{label="example" loc="fictional"}
A fictional LEO Earth-observation mission plans S-band TT&C up and down and an X-band payload downlink at 8.1 GHz. Is the X-band choice in the right allocation?

**Answer explanation:** 8025–8400 MHz is allocated to Earth exploration-satellite space-to-Earth, which fits an Earth-observation payload. A space science (space research) mission near Earth would look at 8450–8500 MHz instead. Either way, a licence and coordination are still required.
:::

## Related

- Topics: RF basics, ground stations and networks.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register. ITU RR 2024 is used from a personal-use copy; the site links to the ITU page and does not redistribute the PDF.
