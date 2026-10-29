---
id: why-space-links-are-different
title: Why space links are different
definition: A spacecraft cannot simply join Wi-Fi and use the internet's protocols, because its link is extremely long, weak, intermittent, delayed and lopsided, and nobody can walk up to it and reboot it.
section: start-here
level: intro
order: 10
est_minutes: [10, 15]
prerequisites: []
learning_paths: [space-comms-101]
objectives:
  - Give five reasons a space link behaves differently from a home Wi-Fi link.
  - Explain in words why received signal power falls so quickly with distance.
  - Estimate one-way light time for a low-orbit pass and for a Moon or Mars link.
  - Explain why a low-orbit spacecraft can only talk to one ground station for a few minutes at a time.
  - Say why spacecraft protocols put so much effort into error correction and command safety.
chain_position:
  direction: both
  stage: Whole chain
glossary_terms: [free-space-loss, aos-los, decibel, eirp, link-margin, forward-link, return-link]
related_topics: [end-to-end-system, anatomy-of-a-pass, decibels-and-noise-101, link-budgets, contact-planning]
related_labs: [end-to-end-walkthrough]
standards: [ccsds-130-0-g-4]
sources:
  - {id: ITU-R-P525, loc: "Annex §2.3, eq. (5)–(6)"}
  - {id: NIST-CODATA-C}
  - {id: NASA-BSF-10, loc: "Signal Power; Uplink and Downlink; One-way, Two-way, Three-way"}
  - {id: NASA-STARGAZE-K3}
  - {id: NASA-SOA-11, loc: "§11.2.1, §11.4"}
  - {id: CCSDS-130.0-G-4, loc: "§3.2.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Newcomers often ask why spacecraft do not simply "use TCP/IP" or "connect to Wi-Fi". The answer explains almost every design choice on this site: fixed-size frames, heavy error-correcting codes, sync markers, careful command procedures, and the scramble to get data down during short passes. Once you see what makes the link hard, the rest of the system makes sense.

## Plain-language explanation

Imagine shouting to a friend across a stadium, then across a city, then across a continent — with a torch-sized radio instead of your voice. Five things make the space version hard:

1. **Distance makes the signal faint.** The signal spreads out like ripples in a pond, so each time you double the distance the received power drops to a quarter.
2. **The spacecraft is only in view for minutes.** A satellite in low orbit races around Earth in about an hour and a half, so it rises over one ground antenna, crosses the sky and sets again in roughly ten minutes.
3. **Light takes time.** Radio travels at the speed of light. That is fast for low orbit, but it adds seconds for the Moon and many minutes for Mars, so you cannot have a quick back-and-forth conversation.
4. **The two directions are lopsided.** The spacecraft sends a lot of data down (telemetry and payload), while the ground sends a little up (commands) — but every command must arrive exactly right.
5. **Nobody can reach it.** There is no technician on board. A bad command or a confused radio cannot be fixed with a cable or a reboot button.

Internet protocols assume short delays, near-constant connectivity and the option to try again quickly. Space protocols assume the opposite.

::::beginner{title="An analogy: a lighthouse and a ship"}
Think of the ground station as a lighthouse keeper and the spacecraft as a ship that passes the headland once every hour and a half. The keeper has a few minutes while the ship is in sight to flash every message they can, and to read the ship's reply. Messages are short, repeated if unclear, and written so that a single misread flash cannot cause a disaster.
::::

## Precise terminology

- **Free-space loss:** how much weaker a radio signal becomes purely because it spreads out over distance.
- **One-way light time:** how long a signal takes to travel from transmitter to receiver.
- **Pass (contact):** the period during which a ground station can see and talk to the spacecraft.
- **Downlink / return link:** spacecraft to ground. **Uplink / forward link:** ground to spacecraft.

:::claim{label="standard" source="ITU-R-P525" loc="Annex §2.3, eq. (5)–(6)"}
ITU-R P.525 gives the free-space loss between two isotropic antennas as 20 log10(4πd/λ) dB, which can be written 32.4 + 20 log10 f + 20 log10 d with f in MHz and d in km — so the loss grows by about 6 dB each time the distance doubles.
:::

:::claim{label="standard" source="NIST-CODATA-C" loc="CODATA 2022 value"}
The speed of light in vacuum is exactly 299 792 458 m/s, so a radio signal needs about 3.34 microseconds per kilometre.
:::

## Where in the chain

These limits act on the whole chain, but they bite hardest in the middle: the RF space link between the spacecraft's transceiver and the ground station's antenna. Everything before it (packets, frames, coding) is designed to survive that link; everything after it (ground networks, mission control) is designed around the short, delayed passes it allows.

## How it works, step by step

**1. Signal power falls with the square of distance.** At S-band (2200 MHz), going from a low-orbit spacecraft overhead to a Moon distance increases the free-space loss by tens of decibels.

:::claim{label="example" loc="computed from ITU-R P.525 eq. (6)"}
Free-space loss at 2200 MHz: about 154 dB at 550 km (low orbit overhead), 167 dB at 2 300 km (low orbit near the horizon), 190 dB at 35 786 km (geostationary altitude) and 211 dB at 384 400 km (Moon distance). A home Wi-Fi link at 2400 MHz over 30 m loses about 70 dB.
:::

**2. Big antennas and coding recover the faint signal.** Spacecraft transmitters are only a few watts to tens of watts, so missions concentrate power into a beam and use error-correcting codes.

:::claim{label="practice" source="NASA-BSF-10" loc="Signal Power"}
NASA's Basics of Space Flight notes that deep-space spacecraft reach Earth over enormous distances with transmitters of about 20 W by using microwave frequencies and directional reflector antennas; Voyager's high-gain antenna has a gain of 47 dBi at X-band, and the largest Deep Space Network antennas 74 dBi.
:::

**3. Low orbits give short passes.**

:::claim{label="standard" source="NASA-STARGAZE-K3" loc="period formula and worked examples"}
For a circular Earth orbit the period grows with the 3/2 power of the orbit radius; an orbit about 5 % larger than Earth's radius (a few hundred kilometres up) takes roughly 90 minutes.
:::

:::claim{label="practice" source="NASA-SOA-11" loc="§11.2.1, §11.4"}
NASA's small-spacecraft state-of-the-art report notes that a low-Earth-orbit spacecraft is in a direct-to-Earth station's line of sight for only part of each orbit, and that operators commonly start searching with the antenna pointed 5–10° above the horizon.
:::

:::claim{label="example" loc="computed: circular 550 km orbit, overhead pass, Earth rotation ignored"}
A fictional spacecraft at 550 km circles Earth in about 95.5 minutes. Directly overhead, it stays above a 5° elevation mask for about 9.8 minutes and is at most about 2 200 km away.
:::

**4. Light time adds delay.**

:::claim{label="example" loc="computed with c = 299 792 458 m/s"}
One-way light time: about 2–7 ms across a low-orbit pass, 0.12 s from geostationary altitude, 1.28 s from the Moon, and about 12.5 minutes at a fictional Earth–Mars distance of 225 million km.
:::

**5. Uplink and downlink are different jobs.**

:::claim{label="practice" source="NASA-BSF-10" loc="Uplink and Downlink"}
Commands are sent by modulating the uplink, the signal from Earth to the spacecraft, and telemetry by modulating the downlink, the signal from the spacecraft to Earth.
:::

:::claim{label="standard" source="CCSDS-130.0-G-4" loc="§3.2.1"}
The CCSDS telecommand link protocols (TC and USLP) include a retransmission mechanism, COP-1; the TM and AOS downlink protocols have none, so if complete delivery is needed it must come from a higher layer.
:::

## What operators and engineers see

- A **pass schedule** with AOS (acquisition of signal) and LOS (loss of signal) times for each station.
- **Signal-strength and lock indicators** that rise as the spacecraft climbs above the horizon and fall as it sets.
- **Command acknowledgements** that arrive a light-time later — milliseconds in low orbit, minutes in deep space.
- **Onboard recorders** that store data between passes and play it back when a station is in view.

## Misconceptions and failure symptoms

- **"Space is empty, so there is nothing to lose."** The loss is geometric spreading, not absorption; it happens even in perfect vacuum.
- **"Spacecraft are always online."** A single low-orbit spacecraft is out of contact with any one station most of the time.
- **"We can just retry like a web page."** In deep space a retry costs a full round-trip light time, and in low orbit the pass may end first.
- **"More power fixes everything."** Spacecraft power, heat and mass are limited; coding and antennas are usually cheaper ways to gain margin.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Free-space loss formula, speed of light | Physics; ITU-R P.525 and CODATA | Standard-defined |
| Which link protocols retransmit | CCSDS | Standard-defined |
| Elevation mask, number of stations, recorder size | Mission | Mission-specific |
| Starting acquisition 5–10° above the horizon | Operations teams | Common practice |

:::claim{label="mission"}
Your mission's orbit, ground-station network and elevation mask set its real pass lengths and gaps. The numbers on this page are computed for a fictional overhead pass.
:::

## Worked example

:::claim{label="example" loc="computed, fictional"}
A fictional CubeSat at 550 km is 2 200 km away when it rises above a 5° mask and 550 km away when it passes overhead. How much stronger is the overhead signal?

**Answer explanation:** the distance ratio is 2 200 / 550 = 4, and free-space loss changes by 20 log10(4) ≈ 12 dB. The overhead signal is about 12 dB — roughly 16 times — stronger, which is why errors often cluster at the start and end of a pass.
:::

## Related

- Topics: the end-to-end system, anatomy of a pass, decibels and noise, link budgets, contact planning.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
