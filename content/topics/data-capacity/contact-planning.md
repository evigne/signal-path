---
id: contact-planning
title: Contact planning and pass geometry
definition: Contact planning turns orbit geometry, station locations, elevation masks and link performance into a schedule of passes and an estimate of how much data each can move.
section: data-capacity
level: core
order: 10
est_minutes: [20, 30]
prerequisites: [link-budgets, decimal-and-binary-units]
learning_paths: [communications-deep-dive]
objectives:
  - Explain why a LEO spacecraft is only in contact for part of each orbit.
  - Relate elevation mask to pass length and link margin.
  - Estimate usable contact time and data volume per day.
chain_position:
  direction: both
  stage: Ground station & network
glossary_terms: [link-margin]
related_topics: [link-budgets, ground-stations-and-networks, telemetry-lifecycle, high-rate-coding-and-modulation]
related_labs: [data-budget-calculator]
tool: 7
sources:
  - {id: NASA-SOA-11, loc: "§11.2.1, §11.4"}
  - {id: CCSDS-401, loc: "§2.1.3A"}
  - {id: NASA-STARGAZE-K3, loc: "Kepler third law, circular orbits"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues: []
---

## Why it matters

Data return, command opportunities and anomaly response all depend on when the spacecraft can be reached. Planners trade more stations, lower masks and higher rates against cost and margin.

## Plain-language explanation

A low orbit circles the Earth in about an hour and a half, and a station only sees the spacecraft while it is above the local horizon — usually for a few minutes. Ignoring the lowest part of the sky (the elevation mask) gives a cleaner signal but shorter passes. Add up the useful minutes per day and multiply by the rate to see what the plan can carry.

::::beginner{title="Booking appointments with a moving patient"}
Contact planning is like scheduling appointments with a patient who walks past your window only a few times a day, each time for a few minutes. You must know when they pass, book the right room (station), prepare the equipment before they arrive, and decide in advance what to talk about, because the window closes whether or not you are finished.
::::

## Precise terminology

- **AOS / LOS:** acquisition and loss of signal — the start and end of a pass.
- **Elevation mask:** the minimum elevation at which the station tracks or counts a pass as usable.
- **Contact time:** usable time per pass, after acquisition and setup.

:::claim{label="practice" source="NASA-SOA-11" loc="§11.2.1"}
NASA's small-spacecraft state-of-the-art report notes that a LEO spacecraft is commonly in a direct-to-Earth station's line of sight for only part of its orbit.
:::

:::claim{label="practice" source="NASA-SOA-11" loc="§11.4"}
The same report notes that higher data rates can reduce the number of ground-station contact minutes a mission needs per day.
:::

## Where in the chain

Contact planning sits between flight dynamics (orbit predictions), the station network (availability, masks, licences) and operations (what must be uplinked or downlinked each pass).

## How it works, step by step

1. **Predict passes** from orbit and station coordinates.

:::claim{label="standard" source="NASA-STARGAZE-K3" loc="period formula and worked examples"}
For a circular Earth orbit the period grows with the orbit radius to the power 3/2 (T ≈ 5063.5 s × (r / Earth radius)^1.5); an orbit 5 % larger than Earth's radius takes about 91 minutes. Pass lengths then follow from geometry and the elevation mask; the values on this page are computed with a spherical Earth.
:::
2. **Apply masks and constraints** (terrain, licences, other users).
3. **Predict Doppler** for each pass so stations can acquire.

::::expert{title="Doppler ranges and why predictions matter"}
:::claim{label="standard" source="CCSDS-401" loc="§2.1.3A"}
For Category A Earth-to-space links CCSDS notes Doppler up to about ±80 kHz at 2 GHz and ±300 kHz at 7 GHz, usually predictable to better than ±1 kHz, which is why accurate pass predictions shorten acquisition.
:::
::::

4. **Estimate volume** per pass from usable time, rate and overheads (see the data budget calculator).
5. **Schedule** passes and reserve margin for retries and anomalies.

## What operators and engineers see

Pass schedules list station, AOS, LOS, maximum elevation and planned activities; after each pass, reports compare planned and achieved volume.

:::claim{label="example" loc="fictional schedule"}
`STN-B AOS 10:02:18 · max EL 41° · LOS 10:11:30 · 9.2 min · plan: HK dump + 2 cmd loads` — fictional.
:::

## Misconceptions and failure symptoms

- **"Every pass is the same length."** Length depends on how close to overhead the track passes.
- **"Lower mask = more data."** Only if the link still closes there.
- **"Scheduled minutes = data minutes."** Acquisition, setup and outages reduce usable time.
- **Symptom — backlog grows although passes look sufficient:** compare usable, not scheduled, time and check units (see decimal and binary units).

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Doppler and sweep recommendations | CCSDS 401.0-B-32 | Standard-defined |
| Masks, station set, scheduling policy | Mission and provider | Mission-specific |
| Planning tools and reserve margins | Operations | Common practice |

:::claim{label="mission"}
Your mission's orbit, network contracts and licences define the real pass plan; the numbers below are computed for a fictional orbit.
:::

## Worked example

:::claim{label="example" loc="fictional orbit"}
A fictional 500 km circular orbit (period ≈ 94.5 min) passing directly over a station. Computed with a spherical Earth: maximum pass ≈ 11.5 min above 0°, 9.2 min above a 5° mask, 7.4 min above 10°. With 60 s setup and 2.0 Mbit/s useful rate, a 5° overhead pass carries about (9.2 − 1.0) × 60 × 2.0 / 8 ≈ 123 MB.

**Answer explanation:** raising the mask from 5° to 10° costs about 1.8 minutes (about 20 %) of an overhead pass but avoids the lowest-margin minutes; most passes are not overhead and are shorter still.
:::

## Related

- Topics: link budgets, ground stations and networks, telemetry lifecycle, high-rate coding and modulation.
- Lab: data budget calculator.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
