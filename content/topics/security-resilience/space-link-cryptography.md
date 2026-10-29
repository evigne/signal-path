---
id: space-link-cryptography
title: Cryptographic algorithms for space links
definition: CCSDS recommends AES with 256-bit keys, counter-based modes, GCM for authenticated encryption, and CMAC or HMAC for authentication only; GCM's security depends on never reusing an initialization vector with the same key.
section: security-resilience
level: advanced
order: 40
est_minutes: [20, 30]
prerequisites: [space-data-link-security]
learning_paths: [security-aware-operations]
objectives:
  - Name the CCSDS-recommended algorithms and key sizes.
  - Explain why authenticated encryption (GCM) is preferred.
  - Explain the GCM IV uniqueness requirement and why counters are used as IVs.
chain_position:
  direction: both
  stage: Transfer frames
glossary_terms: [mac, sdls]
related_topics: [space-data-link-security, security-associations-and-anti-replay, key-management-and-rotation]
standards: [ccsds-352-0-b-2]
sources:
  - {id: CCSDS-352.0-B-2, loc: "§3, §4"}
  - {id: NIST-800-38D, loc: "§5.2.1.1, §8, §8.3"}
  - {id: CCSDS-355.0-B-2, loc: "§2.3.2.3.4"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues:
  - NIST announced on 2024-03-06 that it will revise SP 800-38D; as of 2026-10-29 no draft or final revision is published (CSRC page). Recheck before publishing.
---

## Why it matters

Implementers and reviewers need to know which algorithms are expected and which mistakes break them. The most damaging GCM error — reusing an IV — is an engineering bug, not a cryptographic one, and space links with resets and counter rollovers are prone to it.

## Plain-language explanation

AES is the block cipher. Counter mode turns it into a stream of key-dependent noise that is XORed with the data. GCM adds an authentication tag computed alongside, so one operation gives secrecy and tamper detection. Each use needs a fresh "number used once" (IV); using the same one twice with the same key can let an attacker forge messages.

## Precise terminology

:::claim{label="standard" source="CCSDS-352.0-B-2" loc="§3.1–3.3"}
CCSDS encryption uses AES; implementations for missions whose planning began after issue 2 shall use 256-bit keys (existing ones may use 128-bit), and shall use counter mode, with other modes allowed only after careful consideration.
:::

:::claim{label="standard" source="CCSDS-352.0-B-2" loc="§3.4"}
When encryption with integrity and origin authentication is needed, CCSDS implementations shall use Galois/Counter Mode (GCM) with a 128-bit MAC.
:::

:::claim{label="standard" source="CCSDS-352.0-B-2" loc="§4.2, §4.3"}
For authentication without encryption, CCSDS uses HMAC (normally with SHA-256) or CMAC with AES (256-bit keys for new missions); GMAC may replace CMAC when an authenticated-encryption implementation is used for authentication only.
:::

## Where in the chain

These algorithms run inside the SDLS security function on each frame, keyed by the SA's current key.

## How it works, step by step

1. **Pick the service** in the SA: authentication (CMAC/HMAC/GMAC), encryption (AES counter mode), or authenticated encryption (AES-GCM).
2. **Build a unique IV** per frame.

:::claim{label="standard" source="NIST-800-38D" loc="§8"}
NIST requires that the probability of GCM ever being invoked with the same IV and key on two distinct inputs be no greater than 2⁻³²; repeating even one IV under a key may enable forgery, so this requirement is almost as important as keeping the key secret.
:::

:::claim{label="standard" source="NIST-800-38D" loc="§5.2.1.1"}
NIST recommends that GCM implementations restrict IVs to 96 bits for interoperability, efficiency and simplicity.
:::

:::claim{label="standard" source="CCSDS-355.0-B-2" loc="§2.3.2.3.4"}
With counter-based authenticated encryption, the SDLS IV field can also serve as the anti-replay sequence number, in which case the separate sequence number field is zero length.
:::

3. **Limit use per key.**

:::claim{label="standard" source="NIST-800-38D" loc="§8.3"}
Unless only 96-bit IVs from the deterministic construction are used, the total number of GCM authenticated-encryption invocations with a given key shall not exceed 2³².
:::

## What operators and engineers see

Configuration shows algorithm, key length and MAC length per SA; status shows MAC failures. Reviews look for IV generation after resets and for rollover handling.

:::claim{label="example" loc="fictional SA summary"}
`SA 0x0011 · AES-256-GCM · IV 96-bit counter · MAC 128-bit · SN = IV` — fictional.
:::

## Misconceptions and failure symptoms

- **"Encryption alone is enough."** Without authentication, ciphertext can be altered undetectably in counter modes.
- **"A random IV is always fine."** Random IVs bring an invocation limit; counters must never repeat across resets.
- **"Truncating the MAC is free."** CCSDS GCM uses 128-bit MACs; shorter tags weaken forgery resistance.
- **Symptom — authentication failures only after a spacecraft reset:** suspect IV or counter state not restored, not the key.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Algorithms, key sizes, modes, MAC length | CCSDS 352.0-B-2 | Standard-defined |
| IV uniqueness and invocation limits | NIST SP 800-38D | Standard-defined |
| IV construction, reset handling, key lifetime | Mission implementation | Mission-specific |

:::claim{label="mission"}
Your mission's security design documents define algorithms, IV construction and limits. Never place real keys, IVs or test vectors from a mission into documentation or labs.
:::

## Worked example

:::claim{label="example" loc="fictional sizing"}
A fictional SA uses a 96-bit counter IV starting at 1 and sends 10 frames per second continuously. How long until the counter would repeat, and is a key change needed sooner?

**Answer explanation:** 2⁹⁶ frames at 10 per second is about 2.5 × 10²⁰ years, so wrap-around is not the limit. The limit comes from the key's cryptoperiod and from making sure the counter never resets to a used value — for example after a power cycle.
:::

## Related

- Topics: Space Data Link Security, security associations and anti-replay, key management and rotation.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
