---
id: sync-markers
title: Sync markers (CSM / ASM)
definition: A sync marker is a known bit pattern placed in front of every coded block or transfer frame, so a receiver can find where each one starts in a continuous stream of bits.
section: space-link
subsection: synchronization-and-coding
level: core
order: 120
est_minutes: [15, 25]
prerequisites: [bits-symbols-and-rates, carrier-and-symbol-sync]
learning_paths: [operator-conversation-fluency, communications-deep-dive, ground-c2-software-engineer]
objectives:
  - Explain why a receiver needs codeblock or frame synchronization after it already has bit synchronization.
  - Say which marker pattern goes with which coding option, and why one marker does not fit every link.
  - Describe how a typical frame synchronizer searches for, confirms, holds and loses lock.
  - Recognise frame-sync symptoms on a console and name the first things to check.
  - Separate what CCSDS 131.0-B-6 requires from common practice and from mission configuration.
chain_position:
  direction: downlink
  stage: Coding & sync marker
  before: Transfer frames (and channel coding)
  after: Modulation & RF
glossary_terms: [csm, asm, cadu, frame-synchronization, flywheel, pseudo-randomizer]
related_topics: [carrier-and-symbol-sync, channel-coding, pseudo-randomization, tm-space-data-link-protocol]
related_labs: [sync-marker-visualiser]
related_symptoms: [carrier-but-no-frame-lock, frame-lock-with-errors]
standards: [ccsds-131-0-b-6]
tool: 3
sources:
  - {id: CCSDS-131.0-B-6, loc: "§9 (CSM), §10 (Pseudo-Randomizer), §5.3.5 (interleaving)"}
  - {id: CCSDS-130.1-G-3, loc: "§9.3 (frame synchronization)"}
  - {id: CCSDS-401, loc: "§2.4.11 (phase-ambiguity resolution)"}
owner: pending
reviewer: pending
last_reviewed: pending
next_review: pending
status: draft
open_issues: []
---

## Why it matters

After the receiver locks onto the carrier and recovers symbols and bits, it has a long, unbroken stream of ones and zeros. Nothing in that stream says where a coded block or a transfer frame begins. Until the receiver finds those boundaries, it cannot decode, check frame counters, separate virtual channels or extract packets. Operators usually call the moment the receiver finds them "frame lock".

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.1.1"}
Codeword synchronization is needed to decode Reed–Solomon, Turbo and LDPC codewords and to keep the pseudo-randomizer aligned, and frame synchronization is needed before transfer frames can be processed.
:::

## Plain-language explanation

Imagine a recording of someone reading a list of words with no pauses. If you know that every word starts with the same chime, you can split the recording by listening for the chime. A sync marker is that chime. The transmitter puts the same known pattern in front of every block, and the receiver keeps sliding along the bit stream until the pattern lines up, then checks that it keeps lining up at the expected spacing.

Noise flips some bits, so the receiver usually accepts a "close enough" match rather than demanding a perfect one. How close is close enough is a configuration choice, and it trades missed markers against false matches.

## Precise terminology

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.2"}
CCSDS 131.0-B-6 calls the marker the Code Synchronization Marker (CSM). When slicing is not used, CSMs sit between transfer frames, also serve as Attached Sync Markers (ASMs), and the two terms may be used interchangeably.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.1.2, Table 9-1"}
The Channel Access Data Unit (CADU) is the CSM plus the randomized transfer frame, Reed–Solomon codeblock, Turbo codeword or LDPC codeword, depending on the coding scheme. It is formed after block coding and randomization and before any convolutional encoding.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.1"}
Each CSM immediately follows the end of the preceding codeword or codeblock, with no bits in between.
:::

- **Codeblock or codeword synchronization** is the correct name when the marker marks a coded block; **frame synchronization** is the everyday term for both cases.

:::claim{label="practice" source="CCSDS-130.1-G-3" loc="§9.3.3"}
The informational report notes that "frame synchronization" is often used loosely for codeblock synchronization too, because the same 32-bit marker is used in both cases.
:::

## Where in the chain

On the downlink, the marker is attached on the spacecraft after the transfer frame is built, coded (if block coding is used) and randomized, and before modulation. On the ground, the frame synchronizer looks for it after demodulation and bit or symbol recovery, and before decoding, derandomization and frame processing. See the **Where in the chain** strip at the top of the page.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.3, §9.2.4"}
With Reed–Solomon or concatenated coding, CSMs are placed between the R-S codeblocks; with Turbo or LDPC coding of transfer frames, they are placed between the codewords.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.2.5, §9.2.6"}
With convolutional coding alone, the CSM is itself convolutionally encoded. With an inner convolutional code and an outer R-S code, the CSM is encoded by the inner code but not by the outer code.
:::

## How it works, step by step

1. **Choose the marker for the coding option.**

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.3"}
Uncoded, convolutional, Reed–Solomon, concatenated and rate-7/8 LDPC data use the 32-bit CSM 1ACFFC1D. Rate-1/2 Turbo and rate 1/2, 2/3 and 4/5 LDPC data use the 64-bit CSM 034776C7272895B0. Turbo rates 1/3, 1/4 and 1/6 use longer markers of 32/r bits.
:::

2. **Attach it in front of every coded unit**, so it recurs at a fixed spacing: marker length plus codeblock or codeword length.
3. **Search.** The receiver compares a sliding window of received bits or symbols with the expected pattern and counts mismatches.
4. **Acquire.** After a tentative match, it checks that further markers appear exactly where expected.
5. **Lock.** After enough confirmations, it declares lock and hands aligned blocks to the decoder.
6. **Flywheel.** If a marker is missed, it keeps the expected timing for a few more blocks before giving up and returning to search.

:::claim{label="practice" source="CCSDS-130.1-G-3" loc="§9.3.7"}
A common frame-synchronizer design is a state diagram with search, acquisition, lock and flywheel states: successful checks move it towards lock, failed checks move it towards search, and a few consecutive markers may be missed in the flywheel states before loss of lock is declared.
:::

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§9.1.1"}
For Turbo and LDPC coding, the CSM can only be acquired in the coded symbol domain, before decoding. For the basic convolutional code it can be acquired either before decoding or in the decoded bit domain.
:::

## What operators and engineers see

Typical ground-station and front-end status displays show, in order: carrier lock, symbol or bit lock, then a frame-sync state such as searching, acquiring or locked, with counters for markers found, markers missed and lock losses. Exact labels and counters depend on the equipment.

:::claim{label="example" loc="fictional console"}
`frame sync: SEARCH  ASM matches 0/120` → `frame sync: LOCK  flywheel 0/2` → `RS uncorrectable 0`. These lines are fictional and only show the order in which states usually appear.
:::

## Misconceptions and failure symptoms

- **"The sync marker is part of the packet."** It is not. It belongs to the coding and synchronization sublayer, outside the transfer frame and far below the Space Packet.
- **"One marker fits every link."** Different coding options use different markers (see step 1).
- **"Frame lock means the data is good."** Lock only means boundaries were found. Decoding can still fail, frame counters can still jump, and packets can still be missing.
- **"Randomization is encryption."** It is not. The randomizer improves bit transitions; it provides no confidentiality or integrity.

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§10.1, §10.2.1"}
The pseudo-randomizer is mandatory for all CCSDS-recommended modulation and coding combinations. It XORs the codeblock, codeword or transfer frame with a standard pseudo-random sequence to ensure enough randomness and bit transitions for the receiver.
:::

:::claim{label="practice" source="CCSDS-130.1-G-3" loc="§9.3.7"}
A longer inspection window lowers the chance of false synchronization but adds latency and slows recovery after a symbol slip; synchronizers that use soft-symbol thresholds can false-lock at high signal amplitudes if the threshold ignores amplitude; and after a symbol slip several frames can be lost while the synchronizer drops lock and reacquires.
:::

**If you see carrier and symbol lock but no frame lock**, check first: the expected marker for the configured coding option, the expected marker spacing (frame or codeblock length), and whether sync is attempted in the right domain (before or after convolutional decoding). Then follow the *Carrier but no frame lock* symptom guide.

:::claim{label="standard" source="CCSDS-401" loc="§2.4.11"}
Coherent QPSK and OQPSK receivers can lock at any of four stable carrier phases, so phase ambiguity is inherent; each phase state turns the sync marker into a distinct, identifiable pattern. CCSDS 401.0-B-32 therefore recommends resolving the ambiguity with the sync marker where ground stations can, synchronizing before convolutional decoding on coded links, and using differential data formatting when the marker is not used.
:::

:::claim{label="example" loc="Troubleshooting Scenario A (fictional)"}
In the fictional Scenario A, the raw dump repeats E5 30 03 E2, the bitwise inverse of 1ACFFC1D, which points to an inverted bit stream — one of the phase states a QPSK receiver can lock in (see the claim above). This is a teaching scenario, not a statement about any real system.
:::

## Standard, practice and mission choices

| Choice | Who decides | Label |
| :-- | :-- | :-- |
| Marker pattern and length for each coding option | CCSDS 131.0-B-6 §9.3 | Standard-defined |
| Where markers go and what is encoded | CCSDS 131.0-B-6 §9.2 | Standard-defined |
| Randomizer use | CCSDS 131.0-B-6 §10 (mandatory) | Standard-defined |
| Synchronizer design: allowed mismatches, confirmations, flywheel length, inspection window | Equipment and configuration; guidance in 130.1-G-3 §9.3.7 | Common practice |
| Which coding option, frame length and interleaving depth a mission uses | Mission, link configuration and ICD | Mission-specific |

:::claim{label="standard" source="CCSDS-131.0-B-6" loc="§5.3.5.1"}
For Reed–Solomon coding, the allowed interleaving depths are I = 1, 2, 3, 4, 5 and 8.
:::

:::claim{label="mission"}
Your mission's ICD and link configuration define the coding option (and therefore the marker), frame length, interleaving depth and synchronizer thresholds actually in use. Do not assume the values on this page.
:::

## Worked example

:::claim{label="example" loc="fictional link"}
A fictional link uses Reed–Solomon coding with interleaving depth I = 5, so it uses the 32-bit marker 1ACFFC1D. A full codeblock is 255 × 5 = 1275 octets, so a marker should recur every 4 + 1275 = 1279 octets (10,232 bits). The synchronizer here is set to accept a marker with up to 2 mismatched bits.

| Received 32-bit window | Mismatched bits vs 1ACFFC1D | Accepted at threshold 2? |
| :-- | :-- | :-- |
| 1ACEFC1D | 1 | Yes |
| 1ACF7C0D | 2 | Yes |
| 1A8F7C1C | 3 | No: counted as a missed marker; the flywheel holds timing |
| E53003E2 | 32 | No: every bit is inverted |

**Answer explanation:** count the 1-bits in the XOR of the received window and the expected marker. A threshold of 2 tolerates light noise; window 3 fails, so a flywheel state keeps lock if the next marker is found where expected. Window 4 is the exact inverse of the marker, the pattern that Scenario A uses.
:::

Try it in the **Frame synchronizer & ASM visualizer** (Tool 3): raise the noise, change the threshold and add a bit slip.

## Related

- Glossary: CSM, ASM, CADU, frame synchronization, flywheel, pseudo-randomizer.
- Topics: carrier and symbol sync, channel coding, pseudo-randomization, TM Space Data Link Protocol.
- Lab: Sync-marker visualiser. Symptoms: Carrier but no frame lock; Frame lock with errors.
- Learning paths: Operator conversation fluency (module 4); Communications deep dive.

## Sources

Rendered from the `sources` field and each claim's `source` and `loc`. Status, issue and last-checked date come from the source register (`research/source_register.json`).
