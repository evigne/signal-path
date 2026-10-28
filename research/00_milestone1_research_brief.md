# Milestone 1: Research Brief & Content Strategy
**Project:** Spacecraft Communications & Operations Educational Website  
**Target Learner:** Senior Software Engineer working with Spacecraft Operators, C2/Mission Control, and Ground Systems Teams  
**Date:** October 2026  
**Status:** Milestone 1 Research Deliverable  

---

## 1. Executive Summary

This project delivers a comprehensive, highly interactive educational platform that demystifies the end-to-end spacecraft communications chain—from onboard instrument generation through space-link framing, channel coding, RF propagation, ground-station reception, provider backhaul, to Mission Operations Center (MOC/C2) ingestion, telemetry calibration, and commanding.

The core guiding principle is **operational realism grounded in authoritative primary standards**:
- Differentiate **Standard-defined** (normative CCSDS/ITU rules), **Common practice** (industry norms like DVB-S2 downlinks or S-band TT&C), **Illustrative example** (fictional hex frames and link parameters), and **Mission-specific** (project ICD choices like APID mappings, sync markers, and key management).
- Ground every technical claim in active, official standards (specifically CCSDS Blue/Magenta/Green Books, ITU Radio Regulations, and NASA/ESA guidelines).
- Provide **deep interactivity** so software engineers learn by directly manipulating bitstreams, decoding headers, simulating pass geometry, calibrating telemetry curves, and tracing fault isolation trees.

---

## 2. Authority Boundaries & Classification Framework

Every piece of content, diagram, and lab on the site must carry one of four visual and semantic tags:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. [STANDARD-DEFINED]                                                       │
│    Strictly specified in an official standard (e.g. CCSDS 133.0-B-2 primary  │
│    header length = 6 octets; APID = 11 bits; sync marker 0x1ACFFC1D).       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. [COMMON PRACTICE]                                                        │
│    Widespread industry norm not formally dictated by CCSDS (e.g. S-band     │
│    for LEO TT&C, X-band for science downlink, REST APIs for GSaaS booking). │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. [MISSION-SPECIFIC]                                                       │
│    Configured per spacecraft/mission ICD (e.g. Virtual Channel ID mapping,   │
│    APID assignments, telemetry calibration coefficients, FARM-1 sliding win) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. [ILLUSTRATIVE EXAMPLE]                                                   │
│    Synthetic, fictional data constructed for exercises and labs (e.g. dummy │
│    hex payloads, mock ground logs, fictional AES keys, toy battery curves).  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Technical Vocabulary Precision Guide

Software engineers frequently encounter ambiguous or overlapping terminology in space operations. The site enforces strict definitions:

| Term | Precise Engineering Definition | What an Operator Observes | What Software Engineers Confuse It With |
| :--- | :--- | :--- | :--- |
| **Bit vs. Symbol** | A bit is a unit of digital information (0 or 1). A symbol is a physical modulation state representing one or more coded bits (e.g., QPSK transmits 2 bits per symbol). | Demodulator lock, Symbol Signal-to-Noise Ratio ($E_s/N_0$), clock recovery. | Treating symbol rate as bit rate (ignoring modulation order and channel coding rate). |
| **Packet vs. Transfer Frame** | A **Space Packet** (CCSDS 133.0-B) is an end-to-end, variable-length application data unit carrying telemetry/telecommands. A **Transfer Frame** (CCSDS 132.0-B, 232.0-B, 732.0-B, 732.1-B) is a link-layer protocol data unit carrying multiplexed packets across the physical space channel. | Packets show up in the MOC telemetry database with APIDs and time tags. Transfer Frames are seen at the ground receiver/modem with Virtual Channel IDs and Master Channel Frame Counts. | Treating "packet" as synonymous with "frame" or expecting packets to have physical sync markers. |
| **Sync Marker (ASM) vs. Frame Sync** | The Attached Sync Marker (ASM) is a known fixed bit pattern prepended to a codeblock/frame (e.g., `0x1ACFFC1D` for TM). Frame sync is the state-machine process (Search, Check, Lock, Flywheel) that searches for the ASM to establish bit and frame boundaries. | Modem / Frame Synchronizer status indicator: "SEARCHING", "VERIFYING", "IN LOCK", or "BIT SLIP DETECTED". | Assuming sync markers are part of the higher-layer packet or thinking a single marker match guarantees valid data. |
| **Randomization vs. Encryption** | **Pseudo-Randomization** (scrambling) XORs the bitstream with a deterministic polynomial (e.g., $x^8+x^7+x^5+x^3+1$) to ensure sufficient bit transitions (1s and 0s) for demodulator clock recovery. **Encryption** provides confidentiality using cryptographic keys. | Bit transition density metrics; carrier tracking lock vs. decryption error counters. | Confusing scrambling with data secrecy; assuming unencrypted telemetry has no randomizer. |
| **Link Margin vs. Data Rate** | Link margin ($dB$) is the difference between received signal quality ($E_b/N_0$ or $C/N_0$) and the threshold required for quasi-error-free demodulation. Increasing data rate lowers energy per bit ($E_b$), reducing margin. | SNR meters on ground station dashboard, constellation weather alerts (rain fade on Ka-band). | Assuming a station can just "turn up the speed" without losing link lock or having to increase transmit power. |
| **Sent vs. Transmitted vs. Accepted vs. Executed vs. Verified** | **Sent:** Dispatched from MOC queue to ground provider network.<br>**Transmitted:** Radiated from ground station feed horn.<br>**Accepted:** Passed onboard hardware decoder and COP-1 FARM check.<br>**Executed:** Flight software command handler invoked.<br>**Verified:** Telemetry parameter changes confirming expected physical state. | Command log states in C2 (QUEUED → SENT → TX_CONFIRMED → COP1_ACK → EXEC_OK → VERIFIED). | Assuming that receiving an HTTP 200 from a ground station API means the spacecraft executed the command. |

---

## 4. Synthesis of Standards Inventory (242 Documents)

The local repository contains 242 authoritative CCSDS publications spanning all working areas. Key foundational standards for this educational curriculum include:

1. **Space Link Protocols (SLP):**
   - **CCSDS 133.0-B-2 (Blue Book, June 2020):** *Space Packet Protocol* (SPP). Primary header (48 bits: Version, Type, SecHdrFlag, APID, SeqFlags, SeqCount, Length).
   - **CCSDS 132.0-B-3 (Blue Book, Oct 2021):** *TM Space Data Link Protocol*. Master Channel, Virtual Channel, Transfer Frame Primary Header, Frame Error Control.
   - **CCSDS 232.0-B-4 (Blue Book, Oct 2021):** *TC Space Data Link Protocol*. TC frames, Segment Headers, FARM state machine, COP-1 integration.
   - **CCSDS 232.1-B-2 (Blue Book + Corrigenda):** *Communications Operation Procedure-1 (COP-1)*. Closed-loop, sequence-controlled telecommand transfer (Frame Acceptance and Reporting Mechanism - FARM / Frame Transmission Procedure - FTP).
   - **CCSDS 732.0-B-5 (Blue Book, Oct 2025):** *AOS Space Data Link Protocol*. Advanced Orbiting Systems, multiplexing audio, video, packets, bitstreams.
   - **CCSDS 732.1-B-3 (Blue Book, June 2024):** *Unified Space Data Link Protocol (USLP)*. Modern unified data link replacing legacy distinctions across near-Earth and deep-space links.

2. **Synchronization & Channel Coding:**
   - **CCSDS 131.0-B-6 (Blue Book, April 2026):** *TM Synchronization and Channel Coding*. Convolutional coding, Reed-Solomon $(255, 223)$, Turbo codes, and Low-Density Parity-Check (LDPC) codes; Pseudo-Randomizer polynomial; ASM patterns.
   - **CCSDS 231.0-B-4 (Blue Book, July 2021):** *TC Synchronization and Channel Coding*. Start symbols, BCH codes, CLTU (Command Link Transmission Unit), Tail Sequences.

3. **Space Security Architecture:**
   - **CCSDS 355.0-B-2 (Blue Book, July 2022):** *Space Data Link Security Protocol (SDLS)*. Security Header, Security Trailer, Authentication, Encryption, Authenticated Encryption, Security Associations (SA), Anti-replay counter.
   - **CCSDS 355.1-B-1 (Blue Book, Feb 2020):** *SDLS Extended Procedures (SDLS-EP)*. Key management, Security Association management, monitoring and reporting.

4. **File Delivery & Delay-Tolerant Networking:**
   - **CCSDS 727.0-B-5 (Blue Book, July 2020):** *CCSDS File Delivery Protocol (CFDP)*. Class 1 (Unacknowledged) and Class 2 (Acknowledged) file transfer over space links.
   - **CCSDS 734.x Series:** *Delay/Disruption Tolerant Networking (DTN)* and Bundle Protocol.

---

## 5. Answers to Open Questions & Research Clarifications

### Question 1: What is "IGM" in the context of Ground Segment providers?
- **Finding:** The instructions mention: *"Include providers named by the user as examples to research: KSAT, IGM, Leaf Space (the user said 'leaf')."*
- **Exhaustive industry search results:** There is **no commercial GSaaS provider with the legal entity or public brand "IGM"**.
- In satellite communications and aerospace, "IGM" refers to:
  1. *Ionospheric Gradient Monitor* (GNSS/GBAS ground reference station monitoring systems for aviation signal integrity).
  2. *Iterative Guidance Mode* (launch vehicle upper-stage steering and ascent tracking).
  3. *A phonetic transcription/hearing typo* for:
     - **"AWS"** (Amazon Web Services Ground Station) or **"Azure"** (Azure Orbital, now retired);
     - **"SSC"** (Swedish Space Corporation, *SSC Go*);
     - **"AGN" / "ATLAS"** (ATLAS Space Operations / Freedom Platform);
     - **"Infostellar"** (StellarStation);
     - **"RBC"** (RBC Signals).
- **Project Treatment:** The site will present the provider comparison focusing on **KSAT (KSATlite)** and **Leaf Space (Leaf Line/Key)**, add major benchmark competitors (**AWS Ground Station, ATLAS Space Operations, RBC Signals, SSC**), and clearly document in the provider notes: *"IGM: Not identified as an active commercial GSaaS provider; documented as a potential transcription error for ATLAS, AWS, or SSC, or reference to Ionospheric Gradient Monitoring in navigation ground networks."* This maintains absolute fidelity to the brief's requirement to *"never fabricate or infer coverage/capabilities"*.

---

## 6. Next Steps for Milestones 2 & 3

1. **Information Architecture (Milestone 2):** Detail the multi-tier sitemap, breadcrumbs, and cross-linking rules across the 10 top-level modules.
2. **Review Claude's Penpot Design:** As Claude completes key frames in Penpot, review the layouts against the accessibility contrast targets, technical information density, and the **deep interactivity requirements** detailed in our companion specification: [interactive_simulators_specification.md](file:///Users/vigneshwarane/.gemini/antigravity-ide/brain/17030b8e-3411-471f-898f-9f1da8f1a6fd/interactive_simulators_specification.md).
