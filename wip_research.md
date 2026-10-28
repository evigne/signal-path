# Engineering & Research Handoff: Spacecraft Communications Learning Platform
**Target Agent / Implementer:** Claude Code (Design & Implementation Agent)  
**Project Brief:** [`spacecraft-comms-site-project-instructions.md`](./spacecraft-comms-site-project-instructions.md)  
**Date:** October 2026  
**Status:** Milestone 1 Research Baseline & Project Directives  

---

## 1. TWO NON-NEGOTIABLE CORE PILLARS

> ### 🚨 PILLAR 1: NOT AN ENCYCLOPEDIA — A PROGRESSIVE BEGINNER-TO-EXPERT GUIDE
> **This website must NOT be a flat encyclopedia, passive glossary, or dry documentation dump.**  
> It is an end-to-end, progressive **Beginner-to-Expert Learning & Operational Mastery Guide** designed to take a senior software engineer (or an ambitious newcomer) from ground zero all the way to real-time mission control troubleshooting fluency.

> ### 🚨 PILLAR 2: DEEP INTERACTIVITY THROUGHOUT — LEARN BY DOING, NOT BY READING
> **Passive reading does not build space communications intuition. The entire application must be deeply interactive.**  
> Every major module must feature live, responsive, client-side tools, interactive bitstream visualizers, parameter sliders, mathematical sandboxes, and simulated consoles. Learners should manipulate raw bits, inject noise, decode real headers, calibrate sensor curves, and diagnose faults interactively.

---

### The Progressive Learning Journey:
1. **Level 1 — Foundations (Beginner Ground Zero):**
   - Plain-language intuition: What is a satellite contact pass? What is uplink vs. downlink?
   - Digital representations: Bits, bytes, hex, big-endian vs. little-endian, IEEE floats, signed ints.
   - What is radio frequency (RF)? Frequency, wavelength, power, carrier waves, and bandwidth.
   - The end-to-end chain: Spacecraft $\longleftrightarrow$ Atmosphere $\longleftrightarrow$ Ground Antenna $\longleftrightarrow$ Provider WAN $\longleftrightarrow$ Mission Control Center (MOC).
   - *Interactive Anchors:* Interactive Bit/Byte & Endianness Inspector; Interactive Wavelength & Band Explorer.
2. **Level 2 — Space Link & Protocols (Intermediate Engineering):**
   - The layered protocol stack: Application parameters $\to$ Space Packets $\to$ Transfer Frames $\to$ Channel Coding $\to$ RF Modulation.
   - CCSDS Space Packet Protocol (133.0-B-2) and telemetry/telecommand data link protocols (TM 132.0-B-3, TC 232.0-B-4, AOS 732.0-B-5, USLP 732.1-B-3).
   - Synchronization & Coding: ASMs (`0x1ACFFC1D`), pseudo-randomization (scrambling), Reed-Solomon vs. Turbo vs. LDPC coding gains.
   - Ground networks & GSaaS: How KSATlite and Leaf Space manage automated pass scheduling, RF tracking, and data backhaul.
   - *Interactive Anchors:* CCSDS Space Packet Header Decoder; Frame Synchronizer & Noise Simulator; Channel Coding Waterfall BER Sandbox.
3. **Level 3 — Operational Mastery & Anomaly Response (Expert Operator):**
   - Closed-loop telecommanding: COP-1 / FARM-1 state machine, sliding-window sequence counters, CLCW telemetry feedback, and lockout recovery.
   - Space Data Link Security (SDLS 355.0-B-2): Security Associations (SA), SPI, anti-replay sliding windows, and in-flight cryptographic key rollover with zero-lockout grace windows (NIST SP 800-57).
   - High-throughput payload links: DVB-S2 / S2X Variable Coding & Modulation (VCM) downlinks.
   - Real-time pass troubleshooting: Diagnosing carrier drops, frame sync flywheel loss, bit slip, corrupted APIDs, and missing command verification telemetry under live pass pressure.
   - *Interactive Anchors:* COP-1 FARM-1 vs. FOP-1 Interactive State Machine; Pass Contact & Storage Drain Calculator; Interactive Mission Anomaly Decision Tree with Simulated Console Logs.

---

## 2. The 9 Core Interactive Simulators & Tools

Claude Code must incorporate the **9 client-side interactive tools** specified in [`research/03_interactive_learning_and_simulation_architecture.md`](./research/03_interactive_learning_and_simulation_architecture.md). In Penpot and during implementation, these require dedicated component slots:

| Tool # | Interactive Tool / Sandbox | Target Module | Core Interactive Mechanism | Console & Operational Realism |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Interactive Bit/Byte & Endianness Inspector** | Mod 2: Fundamentals | Interactive 64-bit matrix (click to flip bits), live multi-type decoder cards (Big/Little Endian, IEEE-754 floats, signed ints, bitfield masks). | Hex memory dumps, word alignment errors, packed telemetry fields. |
| **2** | **CCSDS Space Packet Header Decoder** | Mod 3: Space Link & Mod 10: Labs | Exploded 48-bit primary header; live APID lookup; interactive bit toggles; real-time CCSDS packet length formula calculation ($\text{Header} + \text{Length} + 1$). | Telemetry packet decommutation, APID filtering, missing sequence counts. |
| **3** | **Frame Synchronizer & Sync Marker (ASM) Visualizer** | Mod 3: Space Link & Mod 8: Troubleshooting | Live noise slider (BER $10^{-1}$ to $10^{-6}$), Hamming distance correlation threshold slider ($0-4$ bits), live state transitions (`SEARCH` $\to$ `CHECK` $\to$ `LOCK` $\to$ `FLYWHEEL`). | Modem carrier/frame lock indicators, bit slips, flywheel slip recovery. |
| **4** | **Channel Coding & Error-Correction Sandbox** | Mod 3: Space Link | Interactive $E_b/N_0$ SNR slider, waterfall BER curves (Reed-Solomon vs. Turbo vs. LDPC), and real-time image reconstruction canvas showing pixel degradation vs. error-free decoding. | Decoder telemetry: corrected byte count, uncorrectable frame discard count. |
| **5** | **Telemetry Calibration & Engineering Units Sandbox** | Mod 5: Operations | Raw integer count slider ($0-4095$); live polynomial ($y=\sum a_n x^n$) / spline calibration curve; interactive Soft/Hard Yellow/Red out-of-limits alarm banner. | Raw counts (DN) vs. calibrated physical units ($^\circ\text{C}$, $\text{V}$, $\text{A}$), limit alarm banners. |
| **6** | **COP-1 Telecommand & FARM-1 Simulator** | Mod 5: Operations | Dual-sided state machine: Ground FOP-1 transmitter vs. Flight FARM-1 receiver. "Drop Next Frame" RF loss toggle; watch ground timer timeout, trigger retransmission, and recover via CLCW telemetry. | Closed-loop commanding verification, FARM lockout recovery, CLCW flags. |
| **7** | **Data Budget & Contact Capacity Calculator** | Mod 7: Data & Capacity | Orbit geometry dropdown, ground network presets (KSAT polar vs. Leaf Space mid-lat), elevation mask, coding overhead, and live chart showing daily GiB return vs. flash backlog accumulation. | Pass planning, link margin tradeoffs, onboard memory overflow risk. |
| **8** | **Interactive Ground-to-Space End-to-End Walkthrough** | Mod 1: Start Here & Mod 4: Ground Segment | Direction toggle (Downlink vs. Uplink). Clicking any subsystem stage highlights protocol data units (PDUs), typical latency/buffering, and failure observables. | System boundaries, owning components, provider demarcation. |
| **9** | **Interactive Troubleshooting Anomaly Decision Tree** | Mod 8: Troubleshooting | Four scenario launchers (e.g. "Carrier OK, No Frame Lock", "Command Radiated, No Execution"). Click diagnostic tests to reveal simulated hex logs and submit root-cause hypotheses with instant feedback. | Real-time pass emergency logs, hypothesis testing, telemetry verification. |

---

## 3. Workspace Organization & Local Assets

```text
/Users/vigneshwarane/Documents/feature-projects/ccsds/
├── spacecraft-comms-site-project-instructions.md   # MASTER BRIEF & SPECIFICATION
├── wip_research.md                                 # THIS HANDOFF & DIRECTIVE DOCUMENT
├── ccsds_inventory.json                            # PROGRAMMATIC CATALOG OF 242 STANDARDS
├── standards/                                      # 242 LOCAL CCSDS STANDARDS (PDF)
│   ├── 131x0b6.pdf                                 # TM Sync & Channel Coding (Issue 6)
│   ├── 132x0b3.pdf                                 # TM Space Data Link Protocol (Issue 3)
│   ├── 133x0b2e2.pdf                               # Space Packet Protocol (Issue 2, Ed 2)
│   ├── 231x0b4e1.pdf                               # TC Sync & Channel Coding (Issue 4)
│   ├── 232x0b4e1c1.pdf                             # TC Space Data Link Protocol (Issue 4)
│   ├── 232x1b2e2c1.pdf                             # COP-1 / FARM (Issue 2)
│   ├── 355x0b2.pdf                                 # Space Data Link Security / SDLS (Issue 2)
│   ├── 355x1b1.pdf                                 # SDLS Extended Procedures (Key Management)
│   ├── 727x0b5e1.pdf                               # CFDP File Delivery Protocol (Issue 5)
│   ├── 732x0b5ec1.pdf                              # AOS Space Data Link Protocol (Issue 5)
│   ├── 732x1b3e1.pdf                               # Unified Space Data Link Protocol / USLP
│   └── ... (231 other standards & corrigenda)
└── research/                                       # INITIAL MILESTONE 1 RESEARCH DOSSIERS
    ├── 00_milestone1_research_brief.md             # Authority rules & vocabulary guide
    ├── 01_external_authoritative_research_dossier.md # NASA SOA, ITU bands, C2, SLE, SDLS
    ├── 02_ground_station_providers_and_gsaas.md    # KSAT, Leaf Space, AWS, & "IGM" resolution
    ├── 03_interactive_learning_and_simulation_architecture.md # 9 interactive tools blueprint
    └── 04_master_source_register.md                # 242-doc metadata & agency URLs
```

---

## 4. The Local Standards Library (`standards/`) & Inventory (`ccsds_inventory.json`)

All 242 local PDF standards are stored in [`standards/`](./standards/).

### 4.1 Document Naming & Book Types
The file naming convention encodes the standard number, book type, issue, and corrigenda:
- **`b` = Blue Book:** Normative Recommended Standards (e.g., `133x0b2e2.pdf` is CCSDS 133.0-B-2, Space Packet Protocol).
- **`m` = Magenta Book:** Recommended Practices (e.g., operational guidelines).
- **`g` = Green Book:** Informational Reports (e.g., protocol rationales and concept summaries).
- **`o` = Orange Book:** Experimental specifications.
- **`y` = Yellow Book:** Administrative, test plans, and workshop records.
- **`e1`, `e2`:** Editorial updates.
- **`c1`, `c2` or `_tcNNNN`:** Official Technical Corrigenda (revisions to standards).

### 4.2 Programmatic Metadata: `ccsds_inventory.json`
To avoid parsing PDFs repeatedly, query [`ccsds_inventory.json`](./ccsds_inventory.json). It contains extracted metadata for all 242 files with the following schema:
```json
{
  "file": "standards/133x0b2e2.pdf",
  "doc_id": "CCSDS 133.0-B-2",
  "title": "Space Packet Protocol",
  "book_color": "BLUE",
  "pub_date": "June 2020",
  "pages": 54,
  "size_bytes": 663940,
  "area": "Space Internetworking Systems (SIS) / Space Link Protocols"
}
```
Use this JSON dataset directly when building the **Reference / Standards Catalogue** module of the website.

---

## 5. Initial Research Dossiers in `research/`

You must read through all dossiers in [`research/`](./research/) to understand the technical groundwork already compiled:

1. **[`00_milestone1_research_brief.md`](./research/00_milestone1_research_brief.md):**
   - Details the mandatory **4-tier labeling system**: `[Standard-defined]`, `[Common practice]`, `[Mission-specific]`, and `[Illustrative example]`.
   - Contains the **Operational Vocabulary Disambiguation Guide** (e.g. *Bit vs. Symbol*, *Packet vs. Transfer Frame*, *ASM Sync Marker vs. Frame Lock*, *Pseudo-Randomization vs. Cryptographic Encryption*, *Link Margin vs. Data Rate*, *Sent vs. Transmitted vs. Accepted vs. Executed vs. Verified*).
2. **[`01_external_authoritative_research_dossier.md`](./research/01_external_authoritative_research_dossier.md):**
   - Synthesizes findings from NASA SmallSat State of the Art (SST-SOA), real flight transceivers/SDRs, ITU Radio Regulations Article 5 frequency allocations, real C2 software stacks (Yamcs, OpenC3 COSMOS, Open MCT), Space Link Extension (SLE RAF/RCF/FCLTU), and SDLS key management.
3. **[`02_ground_station_providers_and_gsaas.md`](./research/02_ground_station_providers_and_gsaas.md):**
   - Comparative analysis of **KSAT (KSATlite)** and **Leaf Space (Leaf Line/Key)** alongside AWS Ground Station, ATLAS Space Operations, and SSC.
   - **Resolution of "IGM":** Documents that "IGM" is not an active GSaaS company, but rather an *Ionospheric Gradient Monitor* in navigation ground systems, or a likely phonetic confusion for AWS, SSC, or ATLAS.
4. **[`03_interactive_learning_and_simulation_architecture.md`](./research/03_interactive_learning_and_simulation_architecture.md):**
   - Complete technical and visual specifications for the 9 client-side interactive sandboxes, decoders, and calculators.
5. **[`04_master_source_register.md`](./research/04_master_source_register.md):**
   - Complete markdown register indexing all local standards and external agency repositories.

---

## 6. MANDATORY DIRECTIVES FOR CLAUDE CODE

When designing in Penpot and developing the site, you must adhere strictly to these principles:

### Directive 1: READ THE RESEARCH DOSSIERS AND LOCAL STANDARDS
* **Examine the `research/` Folder:** Familiarize yourself with the research dossiers in [`research/`](./research/). They contain verified technical parameters, standards cross-references, and operational distinction frameworks.
* **Inspect the PDFs in `standards/`:** For core protocol modules (e.g., Space Packet 133.0, TC 232.0, COP-1 232.1, TM 132.0, Channel Coding 131.0, SDLS 355.0), inspect the actual standard PDF (using command-line tools like `pdfinfo`, `pdftotext`, or Python) to verify normative field layouts, bit allocations, and state transition tables.

### Directive 2: DO NOT RELY SOLELY ON THE LOCAL ASSETS — CONDUCT YOUR OWN ACTIVE RESEARCH
The local files and research dossiers provide a strong head start, but **they do not relieve you of the duty to conduct your own independent research**:
* **Live Primary Source Research:** Use web search / URL fetching tools to verify:
  - The current active status and latest corrigenda on the official [CCSDS active publication catalogue](https://ccsds.org/publications/allpubs/).
  - Real-world flight radio and ground data system trends from the [NASA SmallSat Institute (SST-SOA)](https://www.nasa.gov/smallsat-institute/sst-soa/).
  - Ground network capabilities directly from first-party documentation at [ksat.no](https://www.ksat.no) and [leaf.space](https://leaf.space).
  - Formal cryptographic recommendations from [NIST Special Publications (SP 800-57 / SP 800-38D)](https://csrc.nist.gov/publications/).
* **Citation Rigor:** Always cite the specific document number, issue, publisher, exact URL, and "last checked" date. Separate public facts from details that require an NDA/contract, marking unavailable items *"not publicly specified"*.

### Directive 3: THE SITE MUST BE DEEPLY INTERACTIVE (CORE ARCHITECTURAL PILLAR)
* **Do not treat interactivity as an optional widget or addon:** The educational effectiveness of the site depends on direct manipulation.
* You must implement all **9 interactive sandboxes, calculators, and visualizers** specified in Section 2 and detailed in [`research/03_interactive_learning_and_simulation_architecture.md`](./research/03_interactive_learning_and_simulation_architecture.md).
* In your Penpot designs, provide clear, dedicated container frames, control toolbars (presets, sliders, reset, export), and interactive component slots for each tool.

### Directive 4: MAINTAIN OPERATIONAL REALISM & RIGOROUS BOUNDARIES
* Frame explanations from the perspective of what an engineer or operator observes on console (lock states, hex dumps, telemetry limit alarms, CLCW flags).
* Never publish real keys, proprietary mission ICD values, or sensitive telemetry. Use clearly labeled synthetic/fictional data for all examples and labs.
* Always distinguish normative standard rules from common practice and mission-specific configurations.
