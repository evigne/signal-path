# Milestone 6 — next-phase upgrade (2026-10-29)

Implements `next-phase-upgrade-instructions.md`. Penpot was not updated (per the user).

**State:** every check passes — validator 0/0 (39 topics, 73 sources), `astro check` 0 errors, 38 unit tests, 122 browser tests (WCAG 2.2 A/AA in Deep Space and Cleanroom, desktop and Pixel 7, Beginner and Expert modes), 108 pages, 0 broken internal links.

## What changed

- **Order and navigation:** `order` field (validated: intro → core → advanced per subsection); previous/next bar; topics with `tool:` embed the tool (9 topics); Signal Path emblem and favicon.
- **Theme:** dark "Deep Space" default, "Cleanroom" light on the toggle (`sp-theme`); Space Grotesk headings; panels with corner ticks; reticle backdrop; telemetry strip (live UTC, TAI − UTC, simulated pass); orbital-pass hero; animated, clickable chain explorer. Animations stop under reduced motion; the hero has Pause.
- **Depth switch:** Beginner / Intermediate / Expert (`sp-depth-mode`, `data-depth`). Claims become margin notes except in Expert; Beginner folds section references out of citation pills. New `::::beginner{title}` and `::::expert{title}` blocks (validated) open per mode.
- **Beginner content:** path `space-comms-101` (first in path order, home CTA); topics why-space-links-are-different, anatomy-of-a-pass, packets-vs-frames-postal-analogy, decibels-and-noise-101 with quizzes; plain-language rewrites of end-to-end-system, uplink-and-downlink, bits-symbols-and-rates, rf-basics; conceptual quizzes for end-to-end-system and rf-basics; glossary dB, free-space loss, AOS/LOS.
- **Tools 1–9:** all lab presets and break-its implemented (see commit fa39511). Models in `ccsds.ts`, `coding.ts`, `cop1.ts`, `orbit.ts`, `scenarios.ts`, `chain.ts`, all unit-tested.
- **Expert deep dives:** COP-1 internals, FARM-1-before-SDLS order, XTCE vs COSMOS, AOS/USLP data units, SLE (ISP1, delivery modes, production status). Diagrams via `::diagram{name}`: fhp, coding-pipeline, gsaas.
- **Research:** see ledger §8 (R1–R14).

## Correction to the review

The review asked to explain how SDLS runs before FARM-1. CCSDS 232.0-B-4 Cor. 1 §6.5.2.1 specifies the opposite: FARM-1, then ProcessSecurity. The site teaches the standard's order.

## Still open

- 231.0-B-4 Cor. 1: in the catalogue, not found online on 2026-10-29.
- ECSS-E-ST-70-41C (PUS): ecss.nl was down; no PUS content added.
- NIST SP 800-38D revision: announced, unpublished.
- "IGM": needs the user's clarification (shown as a note below the provider table).
- Owner and reviewer names; hosting.
- Coding curves in Tool 4 remain schematic; only the gain readout is cited.
