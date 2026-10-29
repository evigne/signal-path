---
id: space-data-link-security
title: Space Data Link Security (SDLS)
definition: SDLS is the CCSDS protocol that adds authentication, encryption or authenticated encryption to the data of TM, TC, AOS and USLP transfer frames, using a security header and trailer inside each frame.
section: security-resilience
level: core
order: 10
est_minutes: [25, 35]
prerequisites: [tm-space-data-link-protocol, tc-space-data-link-protocol]
learning_paths: [security-aware-operations]
objectives:
  - Place SDLS in the protocol stack and say which frames it protects.
  - Describe the security header and trailer fields.
  - Explain which frame fields the MAC covers and which it never covers.
  - Explain why encryption without authentication is discouraged.
chain_position:
  direction: both
  stage: Transfer frames
  before: Coding & sync marker
  after: Space packets
glossary_terms: [sdls, spi, security-association, mac]
related_topics: [security-associations-and-anti-replay, key-management-and-rotation, space-link-cryptography, command-authority-and-threats]
standards: [ccsds-355-0-b-2]
sources:
  - {id: CCSDS-355.0-B-2, loc: "§2.1–2.3, §4.1"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

A spacecraft that accepts any well-formed command frame can be commanded by anyone with a transmitter. SDLS is how CCSDS links prove that a frame came from the right party and was not altered, and optionally keep its contents secret. Operators see its effects as frames rejected for authentication or sequence errors.

## Plain-language explanation

SDLS adds a small label at the front of the frame's data (which key set to use, plus counters) and a tamper seal at the end (a message authentication code). The receiver recomputes the seal; if it doesn't match, the frame is thrown away. Encryption, when used, scrambles the data so only key holders can read it.

## Precise terminology

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.1"}
SDLS applies authentication and/or confidentiality to the contents of transfer frames at the data link layer only, as an extra service of the TM, TC, AOS and USLP protocols; it does not apply to Proximity-1.
:::

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§4.1.1.1, §4.1.1.2, §4.1.2"}
The security header holds a mandatory 16-bit Security Parameter Index (SPI) followed by an optional initialization vector, sequence number and pad length, and is at most 64 octets; the security trailer, if present, holds the MAC. SPI values 0 and 65535 are reserved.
:::

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.1.3"}
Each security association applies one of three functions — authentication, encryption, or authenticated encryption — and its algorithms and modes cannot change for the life of the association.
:::

## Where in the chain

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.2.1"}
The security header and trailer sit inside the transfer frame around the frame data, so they reduce the space left for user data; whether they are used, and their sizes, are managed per global virtual channel or MAP and stay constant for the mission.
:::

## How it works, step by step

1. **Select the SA** for the virtual channel (by SPI).
2. **Encrypt** the frame data if the SA requires it.
3. **Authenticate**: compute the MAC.

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.2.2"}
The MAC always covers the virtual channel ID, the TC segment header, the security header (except the IV) and the frame data; it never covers the insert zone, OCF, error control field, the MAC itself, or the sync marker or CLTU start sequence. Other header bits can be masked out per SA.
:::

4. **Receive**: verify the MAC, then the sequence number, then decrypt (see the anti-replay page).

## What operators and engineers see

Security status appears as counters and reports: frames rejected for bad MAC, bad sequence number or unknown SPI, and the active SA per channel. With the extended procedures, a Frame Security Report can appear in the downlink OCF.

:::claim{label="example" loc="fictional console"}
`VC1 SPI 0x0011 · auth OK 1,204 · MAC fail 0 · SN reject 2 · SA OPERATIONAL` — fictional.
:::

## Misconceptions and failure symptoms

- **"Randomization is encryption."** The pseudo-randomizer is a public, fixed pattern for bit transitions; it provides no secrecy.

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.3 note"}
CCSDS warns that encryption without authentication can give a false sense of security, and that the choice of services should follow a mission-specific threat and risk analysis.
:::

- **"SDLS protects the whole link."** It protects frame contents at layer 2; jamming and ground-system attacks need other measures.
- **"The MAC covers the OCF."** It never does — CLCW contents are not protected by the frame MAC.
- **Symptom — every TC frame rejected after a key change:** SPI or SA mismatch between ground and spacecraft; check SA state on both ends before retrying.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Header/trailer formats, MAC coverage, SA concept | CCSDS 355.0-B-2 | Standard-defined |
| Which channels are protected, which service, field sizes | Mission (after threat and risk analysis) | Mission-specific |
| Monitoring displays and alerting | Ground software and operations | Common practice |

:::claim{label="mission"}
Your mission's security policy and ICDs define which virtual channels use SDLS, with which service and parameters. Never publish real SPIs, keys or SA configurations.
:::

## Worked example

:::claim{label="example" loc="fictional frame budget"}
A fictional TC frame of 64 octets total uses a 5-octet header, a 2-octet FECF and an SA with SPI (2 octets), a 12-octet IV, no separate sequence number (the IV counter serves) and a 16-octet MAC. How much command data fits?

**Answer explanation:** 64 − 5 − 2 − (2 + 12) − 16 = 27 octets of frame data. Security overhead is 30 octets — almost half — which is why frame lengths and SA field sizes are chosen together.
:::

## Related

- Topics: security associations and anti-replay, key management and rotation, space-link cryptography, command authority and threats.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
