---
id: channel-coding
title: Channel coding (TM)
definition: Channel coding adds carefully structured redundancy to telemetry before transmission so the ground can detect and correct bit errors caused by noise.
section: space-link
subsection: synchronization-and-coding
level: core
order: 140
est_minutes: [25, 35]
prerequisites: [bits-symbols-and-rates, sync-markers]
learning_paths: [operator-conversation-fluency, communications-deep-dive, ground-c2-software-engineer]
objectives:
  - Name the four families of TM codes in CCSDS 131.0-B-6 and what each is good at.
  - Explain code rate and why it raises the symbol rate for a given information rate.
  - Read decoder counters (corrected, uncorrectable) and say what they mean for the data.
  - Tell which coding parameters the standard fixes and which a mission chooses.
chain_position:
  direction: downlink
  stage: Coding & sync marker
  before: Transfer frames
  after: Modulation & RF
glossary_terms: [code-rate, convolutional-code, reed-solomon, turbo-code, ldpc, eb-n0, cadu]
related_topics: [sync-markers, pseudo-randomization, bits-symbols-and-rates, tm-space-data-link-protocol]
related_labs: [channel-coding-sandbox]
related_symptoms: [frame-lock-with-errors]
standards: [ccsds-131-0-b-6, ccsds-130-1-g-3]
tool: 4
sources:
  - {id: CCSDS-131.0-B-6, loc: "§2.2.4, §4–8"}
  - {id: CCSDS-130.1-G-3, loc: "§3.3.1, §3.3.3, §7.4"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
---

## Why it matters

Every space link is noisy. Without coding, a link needs more transmit power, a bigger antenna or a lower data rate to deliver the same quality. Coding trades extra transmitted symbols for the ability to fix errors at the receiver. Operators see its effect directly in decoder counters, and a coding mismatch between spacecraft and ground is a classic cause of "we have lock but no good data".

## Plain-language explanation

Think of spelling a name over a bad phone line using a phonetic alphabet: "S as in Sierra". You say more than the bare letters, but the listener can recover the name even when a word is garbled. Channel codes do the same with bits. Some codes are good at scattered single-bit errors, some at bursts, and the strongest modern codes get close to the theoretical limit at the cost of more processing.

## Precise terminology

- **Code rate (r):** information bits per coded symbol. A rate-1/2 code sends two coded symbols per information bit.
- **Codeword / codeblock:** the encoded unit. With Reed–Solomon interleaving, one codeblock holds I interleaved codewords.
- **Coding gain:** how much less signal energy per bit (Eb/N0) the coded link needs than an uncoded one for the same error rate.

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§3.3.1"}
Code performance is measured as an error rate against Eb/N0, the received energy per information bit relative to the noise spectral density; error rates are reported per bit (BER), per codeword (WER) and per frame (FER).
:::

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§3.3.3"}
In CCSDS's simulated comparison (biphase modulation, Gaussian channel, independent errors, ideal interleaving, no synchronization losses), the rate-1/2 convolutional code gives about 5.5 dB of coding gain over uncoded transmission at a decoded BER of 10⁻⁵; concatenating it with the outer Reed–Solomon code adds about 2.0 dB, and the rate-1/2 Turbo code with 8920-bit blocks improves on the concatenated code by about 1.5 dB, coming within about 1 dB of the Shannon limit for rate 1/2.
:::

:::claim{label="standard" source="CCSDS-130.1-G-3" loc="§7.4.1"}
For a BER of 10⁻⁶, the CCSDS Turbo codes need threshold Eb/N0 of about −0.1, 0.15, 0.4 and 1.1 dB at rates 1/6, 1/4, 1/3 and 1/2 respectively (simulated, 10 decoder iterations).
:::

These are idealized simulation results: real links add implementation and synchronization losses, so use them to compare codes, not as a link budget.

## Where in the chain

On the downlink, coding happens on the spacecraft after the transfer frame is built and before the sync marker is attached (for block codes) and before modulation. On the ground, decoding follows frame (codeblock) synchronization and comes before frame validation and packet extraction.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§2.2.4"}
Without slicing, each codeword contains exactly one transfer frame; slicing is an optional procedure that splits transfer frames across codeword information blocks.
:::

::diagram{name="coding-pipeline"}

## How it works, step by step

CCSDS 131.0-B-6 offers four families. A mission picks one option for each physical channel.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§4.3.1, §4.4"}
Convolutional code: rate 1/2, constraint length 7, connection vectors 171 and 133 (octal) with the G2 output inverted; it may be punctured to rates 2/3, 3/4, 5/6 or 7/8. It suits random (scattered) errors and is decoded with maximum-likelihood (Viterbi) decoding.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§5.1, §5.3.4, §5.3.5.1"}
Reed–Solomon codes correct bursts of errors: the E=16 option, a (255,223) code, corrects up to 16 symbol errors per codeword; the E=8 option, a (255,239) code, corrects up to 8 with less overhead. Codewords can be interleaved to depth I = 1, 2, 3, 4, 5 or 8, and R-S can be used as the outer code with the convolutional code as the inner code (concatenated coding).
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§7.3.5, §7.3.6, Table 7-1"}
Turbo codes have nominal rates 1/2, 1/3, 1/4 or 1/6 and information block lengths of 1784, 3568, 7136 or 8920 bits, chosen to match Reed–Solomon interleaving depths 1, 2, 4 and 5.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§8.1, §8.2.1.1, §8.4.1"}
LDPC codes include an (8160,7136) code of rate about 7/8, used with the 32-bit sync marker, and nine codes of rates 1/2, 2/3 and 4/5 with information block lengths of 1024, 4096 and 16384 bits.
:::

On the ground, the receiver finds the codeblock boundaries using the sync marker, decodes, and passes corrected frames on. Soft decisions (keeping "how sure" each received symbol is) help decoders:

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§4.2.4"}
Soft bit decisions with at least three-bit quantization should be used whenever decoder constraints permit.
:::

## What operators and engineers see

Decoder status usually reports, per pass or per interval: frames or codeblocks decoded, symbols or bytes corrected, and codeblocks that could not be corrected ("uncorrectable"). Rising corrected counts with zero uncorrectables mean the code is doing its job; any uncorrectables mean lost or suspect frames.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§4.2.3"}
When the convolutional code is used without an outer Reed–Solomon code, the transfer frame's Frame Error Control Field must be used to validate frames, because if the decoder's correction capability is exceeded, undetected bursts of errors may appear in its output.
:::

:::claim{label="example" loc="fictional console"}
`RS corrected 1,284 symbols · uncorrectable 0` (good pass) versus `RS uncorrectable 37 · FECF failures 37` (degraded pass). Fictional values.
:::

## Misconceptions and failure symptoms

- **"Coded bit rate = data rate."** Coding adds symbols. The information rate is lower than the coded symbol rate by the code rate (and framing adds more overhead).
- **"Frame lock means decoding works."** Lock only finds boundaries; decoding can still fail.
- **"More coding is always better."** Stronger, lower-rate codes need more bandwidth or a lower information rate; the choice is a link-budget trade-off.
- **Symptom — lock but every codeblock uncorrectable:** often a configuration mismatch (code option, interleaving depth, virtual fill or derandomizer) rather than weak signal. See *Frame lock with errors*.

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Code families, rates, block lengths, generator definitions | CCSDS 131.0-B-6 | Standard-defined |
| Soft-decision decoding with ≥3-bit quantization | CCSDS 131.0-B-6 §4.2.4 ("should") | Standard-defined (recommendation) |
| Which code, rate, interleaving depth and frame length | Mission link design and ICD | Mission-specific |
| Decoder implementation and reported counters | Equipment and provider | Common practice |

:::claim{label="mission"}
The coding option, code rate, Reed–Solomon E and interleaving depth, and use of slicing on your link are set by the mission's link configuration and ICD.
:::

## Worked example

:::claim{label="example" loc="fictional link"}
A fictional link sends Reed–Solomon (255,223) codeblocks with interleaving depth I = 5. Each codeblock carries 223 × 5 = 1115 octets of transfer frame and adds 32 × 5 = 160 parity octets, giving 1275 octets; with the 4-octet sync marker, 1279 octets go out for every 1115 octets of frame. The overhead factor is 1279 / 1115 ≈ 1.147. If the decoder reports 16 symbol errors in one codeword, it can still correct them (E=16); a 17th error in that codeword makes the codeblock uncorrectable.

**Answer explanation:** R-S parity is 2E symbols per codeword (32 for E=16), and each of the I interleaved codewords carries its own parity, so a burst spread across the interleave is shared between codewords.
:::

Try it in the **Channel coding sandbox** (Tool 4).

## Related

- Glossary: code rate, convolutional code, Reed–Solomon, Turbo code, LDPC, Eb/N0, CADU.
- Topics: sync markers, pseudo-randomization, bits/symbols/rates, TM Space Data Link Protocol.
- Symptom: Frame lock with errors.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`; status and dates come from the source register.
