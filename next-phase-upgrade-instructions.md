# Next-Phase Upgrade Instructions: Beginner-to-Expert Progression, Immersive Space Theme & External Research Completion

**Target:** Coding & Design Agent (Claude Code / Implementer)  
**Date:** October 29, 2026  
**Scope:** Full architectural, pedagogical, visual, interactive, and research upgrade of `content/`, `research/`, and `site/`.

---

## 0. Progress Checkpoint (After Commits `857cf51` .. `3ce77db` at 20:52)

Claude completed **~90% of this specification** across 6 commits before running out of tokens at `20:52`:
- ✅ **`857cf51`**: Pedagogical `order` on all topics, Previous/Next topic navigation, inline `<ToolEmbed>` on topic pages, and custom spacecraft/dish favicon.
- ✅ **`c94881c`**: Default Deep-Space dark theme (`tokens.css`, `global.css`), `Space Grotesk` headings, reticle grids & hardware panel headers, live UTC/TAI + simulated pass header strip (`Base.astro`), interactive `OrbitalPass.tsx` hero, animated `ChainExplorer.tsx`, and the 3-way `Beginner / Intermediate / Expert` depth switcher with `::::beginner` and `::::expert` blocks.
- ✅ **`a1738dc`**: New `space-comms-101.yaml` beginner path, 4 new `intro` topics + quizzes (`why-space-links-are-different`, `anatomy-of-a-pass`, `packets-vs-frames-postal-analogy`, `decibels-and-noise-101`), de-jargoned intro pages, and 7 new primary sources (`NASA-BSF-10`, `ITU-R-P525`, `ITU-R-V574`, `NIST-CODATA-K`, `NIST-CODATA-C`, `IERS-BULC`, `NASA-STARGAZE-K3`).
- ✅ **`fa39511`**: Upgraded all 9 interactive tools (`BitInspector`, `PacketDecoder`, `SyncVisualizer` + `SyncStateDiagram`, `CodingSandbox` with 64×64 canvas & cited gains, `Calibration` with polynomial + gauge, `Cop1Sim` with sliding window + frame lane, `DataBudget` with waterfall + recorder capacity line, `Walkthrough` with closed-loop byte trace, `DecisionTree` with Scenarios A–D and uplink tree) + unit/E2E tests.
- ✅ **`cbe84dd`**: Closed 8 topic `open_issues` with 7 new primary sources (`YAMCS-SLE`, `YAMCS-COP1`, `CFE-CCSDS-HDR`, `AWS-GS-METRICS`, `ETSI-DVBS2`, `CCSDS-131.2-B-2-COR1`, `CCSDS-PUBS`) and moved `igm` out of the provider table into an explanatory note.
- ✅ **`3ce77db`**: Added 3 inline SVG diagrams (`::diagram{name="fhp|coding-pipeline|gsaas"}` in `site/src/lib/diagrams.mjs`) and added `::::expert` deep-dives + 3 new sources (`OMG-XTCE-XSD`, `OPENC3-TLM`, `OPENC3-CMD`) to `command-lifecycle.md`, `telemetry-and-command-databases.md`, `security-associations-and-anti-replay.md`, and `aos-and-uslp.md`.

### Remaining Punch-List to Finish (Where Claude Ran Out of Tokens)
1. **Fix `.gitignore` Bug (`standards/` → `/standards/`)**:
   - Line 10 of `.gitignore` has `standards/` without a leading slash, causing Git to ignore `content/standards/*.yaml` (26 files) and `site/src/pages/standards/*.astro` (2 files)! Change line 10 to `/standards/` and commit `content/standards/` and `site/src/pages/standards/`.
2. **Finish the Remaining 4 Expert Deep-Dives (`::::expert` blocks in §2.4)**:
   - `content/topics/security-resilience/space-link-cryptography.md`: Add `## Deep dive & operational edge cases` + `::::expert` block on Non-Volatile Memory (MRAM/EEPROM) AES-GCM IV high-water-mark counter persistence and boot-epoch/stride jumps across unexpected spacecraft resets.
   - `content/topics/ground-segment/sle-transfer-services.md`: Add `## Deep dive & operational edge cases` + `::::expert` block covering ASN.1 BER encoding over TCP/IP (`CCSDS 913.1-B-2` ISP1 transport mapping, heartbeat/peer-abort), Service Instance Identifiers (`sii`), and `ForwardProductionStatus` / `CltuNotification` behavior during mid-pass carrier drops.
   - `content/topics/space-link/high-rate-coding-and-modulation.md`: Add `## Deep dive & operational edge cases` + `::::expert` block detailing the `CCSDS 131.3-B-2` / `ETSI EN 302 307-1` encapsulation pipeline (`CADU` → `BBFRAME` with `BBHEADER`/`SYNCD` → `FECFRAME` → `PLFRAME` with `PLHEADER` `MODCOD` + pilot blocks).
   - `content/topics/ground-segment/c2-software-landscape.md`: Add `## Deep dive & operational edge cases` + `::::expert` block with a concrete NASA cFS `CFE_SB`/`CFE_MSG` header snippet and Yamcs SLE/UDP link → packet preprocessor → XTCE pipeline configuration snippet (plus add `<xtce:CommandMetaData>` / `<xtce:MetaCommand>` to the XTCE XML snippet in `telemetry-and-command-databases.md`).
3. **Make `Beginner` vs. `Intermediate` Depth Modes Visibly Distinct in `Base.astro`**:
   - Currently in `site/src/layouts/Base.astro`, `d.open = kind === 'expert' ? mode === 'expert' : mode !== 'expert'` gives `Beginner` and `Intermediate` the exact same open/closed state for `::::beginner` and `::::expert` blocks. Differentiate them (e.g., fold `::::beginner` basic analogies by default in `Intermediate` mode so `Beginner` opens `::::beginner`, `Intermediate` shows the clean core article, and `Expert` opens `::::expert` + full boxed claims) and move the initial `<details>` open-state sync into the `<head>` script to avoid any flash.
4. **Validate `::diagram{name="..."}` in `content/tools/validate.py` & Update Handoff Docs**:
   - Add a check for `::diagram{name="..."}` against `{fhp, coding-pipeline, gsaas}` in `content/tools/validate.py`.
   - Update `content/reviews/milestone-5-site-build.md` (which still has pre-upgrade numbers from `18:15`), remove the stale footnote in `research/05_verified_source_register.md` line 85 (`NASA-BSF-10` is now registered), and update the old `"CCSDS reuse terms not yet confirmed"` strings in `research/source_register.json` now that `CCSDS-PUBS` is verified.

---

## 1. Executive Summary of the Multi-Agent Audit

Three specialist review agents audited `content/`, `research/`, and `site/`. While the current Astro 7 + React 19 build (`site/`) and 35-topic content engine (`content/`) pass schema, link, unit, and accessibility checks, **four major shortcomings must be resolved**:

1. **Written for Insiders, Not True Beginners (or Deep Experts):**
   - Every topic is forced into a rigid 11-heading reference template where 40%–60% of the body consists of bordered `:::claim` standards-compliance boxes citing CCSDS section numbers.
   - The very first page (`content/topics/start-here/end-to-end-system.md`) opens with unexplained operator jargon (*"VC0 is gapping"*, *"APID 126 is stale"*, *"the SLE link dropped"*) and hits the reader with OSI layer citations by line 42.
   - There is **no Beginner learning path** (`operator-conversation-fluency` is `level: core`; `fast-reference` is a lookup cheat-sheet for experienced engineers).
   - Topics in sections and sidebars are sorted **alphabetically** (`localeCompare` in `site/src/pages/section/[id].astro` and `site/src/pages/topics/[id].astro`), placing `advanced` topics like *AOS and USLP* at the top of lists ahead of `intro` and `core` topics.
   - Interactive labs (`tool: 1`–`9`) are **not embedded** inside the topic pages—even though topics declare `tool: N` in their frontmatter, `site/src/pages/topics/[id].astro` ignores `d.tool`.
2. **Dry, Clinical Textbook Aesthetic Instead of an Engaging Space Theme:**
   - Over-correcting for the earlier note to avoid "tiny low-contrast console text," the site defaults to a flat Light Mode (`#f6f7f9`) with plain white cards, zero space/orbital atmosphere, static rectangle diagrams (`ChainDiagram.astro`), and the default Astro "A" logo still sitting in `site/public/favicon.svg`.
3. **Incomplete Interactive Simulators (Tools 1–9):**
   - Multiple labs in `site/src/components/islands/*.tsx` do not implement the features, presets, or scenarios promised in their own `content/labs/*.yaml` instructions (e.g., Tool 9 `DecisionTree.tsx` hardcodes only Scenario A and omits Scenarios B, C, and D; Tool 4 `CodingSandbox.tsx` displays `"Not shown · cited figure not wired yet"`; Tool 3 `SyncVisualizer.tsx` slices only 64 bits so learners cannot see the second sync marker in Step 1; Tool 2 overflows horizontally at `min-w-[1250px]`; Tool 5's SVG curve ignores its own "Break it" checkboxes).
4. **Heavy Reliance on Local CCSDS PDFs in Topics (86.4%) vs. Shallow External Research:**
   - Claude **did** conduct genuine external verification in `research/05_verified_source_register.md` and `research/06_claim_verification_ledger.md` (29 external sources out of 55 total in `research/source_register.json`, including ITU Radio Regulations 2024 Vol. 1 Art. 5, live CCSDS catalogue, SANA registries, NIST SP 800-57/38D, NASA SST-SOA, and 15 GSaaS provider pages, correcting 23+ errors from the initial dossiers).
   - **However, inside `content/topics/`**, **86.4% (172 of 199)** of all source-backed `:::claim` blocks cite **only the 26 local CCSDS PDFs**, and **23 of the 35 topic pages have zero external citations**. Where external operational/industry research was needed (e.g., Yamcs SLE/COP-1 docs, NASA cFS software bus headers, ECSS PUS, ETSI DVB-S2, IERS leap seconds, ground modem lock metrics, orbital pass geometry), the agent stopped at top-level landing pages and left `open_issues`.

---

## 2. Pillar 1: True 3-Tier Progressive Learning (Beginner → Intermediate → Expert)

The site must serve **three distinct audiences seamlessly**: a complete newcomer to space/RF (**Beginner**), a software/systems engineer working with space links (**Intermediate**), and a senior mission control operator or protocol architect (**Expert**).

### 2.1 Global & Per-Topic "Flight Deck Depth Mode" (Beginner / Intermediate / Expert)
1. **Persistent Mode Switcher in `site/src/layouts/Base.astro`:**
   - Add a 3-way segmented control in the top navigation bar (persisted in `localStorage['sp-depth-mode']` and reflected via `data-depth="beginner|intermediate|expert"` on `<html>`):
     - **🚀 Beginner (`Flight Cadet — Intuition & Visuals`)**: Emphasizes plain-language analogies, visual step-by-step stories, inline interactive widgets in guided mode, and collapses dense CCSDS section-number citations into compact expandable footnotes.
     - **🛰️ Intermediate (`Systems Engineer — Protocols & Framing`)**: Default balanced view showing plain-language intuition, full bit/byte protocol structures, interactive labs, and worked engineering calculations.
     - **🎛️ Expert (`Flight Director — Normative Standards & Edge Cases`)**: Expands all normative `:::claim` citations, deep protocol interaction edge cases, raw hex/binary console logs, and advanced fault-injection modes.
2. **Progressive Disclosure Structure Inside Topic Pages (`content/topics/**/*.md` & `site/src/pages/topics/[id].astro`):**
   - Update `site/src/lib/remark-claims.mjs` and topic CSS so `:::claim` blocks do not interrupt basic reading flow like bulky legal compliance boxes. In Beginner/Intermediate mode, render `standard` and `practice` citations as sleek inline or margin citation pills (`[CCSDS 131.0-B-6 §9.2]`) with hover previews, or group normative rules cleanly in the **Standard, practice and mission choices** section.
   - Add an **Expert Deep-Dive (`## Deep dive & operational edge cases`)** section or callout block to core/advanced topics.

### 2.2 Create a True Beginner Onboarding Path & Foundational 101 Topics
1. **New Learning Path — `content/paths/space-comms-101.yaml` (`level: intro`, 3–4 hours):**
   - Make this the primary `"New to Space Comms? Start Here"` CTA on the homepage (`site/src/pages/index.astro`) alongside the Intermediate (`operator-conversation-fluency`) and Expert (`communications-deep-dive`) paths.
   - Update `PATH_ORDER` in `site/src/lib/site.ts` so paths are grouped clearly by tier: **Beginner (`intro`) → Intermediate (`core`) → Expert (`advanced`)**.
2. **Add 4 True Beginner (`level: intro`) Topics:**
   - `content/topics/start-here/why-space-links-are-different.md`: Why a spacecraft cannot just use Wi-Fi and TCP/IP (inverse-square free-space loss over 500 km to 400,000,000 km, 10-minute LEO horizon passes, one-way light time delay, radiation single-event bit flips, asymmetric uplink/downlink pipes, and zero physical reboot access).
   - `content/topics/start-here/anatomy-of-a-pass.md`: A narrative, visual minute-by-minute story of a 10-minute LEO contact pass from pre-pass schedule to Acquisition of Signal (AOS), Doppler frequency shift, carrier/symbol/frame lock, command uplink, recorder playback dump, and Loss of Signal (LOS).
   - `content/topics/fundamentals/packets-vs-frames-postal-analogy.md`: Visual "envelopes inside shipping containers" explanation of why variable-length application messages (Space Packets) get packed into fixed-length conveyor-belt boxes (Transfer Frames) with a front chime (ASM/CSM) and parity protection (CADU).
   - `content/topics/fundamentals/decibels-and-noise-101.md`: Gentle, intuitive introduction to decibels ($+3\text{ dB} = 2\times$, $+10\text{ dB} = 10\times$, $-3\text{ dB} = 0.5\times$), watts vs. $\text{dBW}$ vs. $\text{dBm}$, thermal noise floor ($k_B T$), and why higher bit rates divide the energy available per bit ($E_b/N_0$).
3. **De-Jargon Existing `level: intro` Topics & Quizzes:**
   - **`content/topics/start-here/end-to-end-system.md`**: Rewrite `## Why it matters` and `## Plain-language explanation` so terms like `carrier`, `VC0`, `APID`, `SLE`, and `AOS` (explicitly disambiguating *Acquisition of Signal* vs. *Advanced Orbiting Systems*!) are introduced gently in plain English before any CCSDS citations appear.
   - **`content/topics/start-here/uplink-and-downlink.md`**: Move low-level BCH/LDPC start/tail hex sequences (`1110101110010000`, `C5C5C5C5C5C5C579`) and `FARM-B` specifics into Intermediate/Expert callouts so beginners focus on the physical and operational asymmetry between uplink commanding and downlink telemetry.
   - **`content/topics/fundamentals/bits-symbols-and-rates.md`**: Introduce bit vs. symbol with a simple 1-bit (BPSK) vs. 2-bit (QPSK) visual before introducing $R_{\text{ChS}} = R_s / \log_2 M$, 64APSK, or Reed-Solomon $(255,223)$ interleaving math.
   - **`content/topics/space-link/rf-basics.md`**: Explain wavelength, carrier wave, modulation (amplitude/frequency/phase), and antenna gain intuitively before diving into coherent transponder turnaround ratios (`221/240`) and QPSK phase ambiguity.
   - **Beginner Quizzes (`content/quizzes/end-to-end-system.yaml`, `rf-basics.yaml`)**: Replace rote standards-trivia questions (e.g., memorizing the `221/240` ratio or OSI sublayer names) with conceptual and operational intuition questions.

### 2.3 Fix Topic Ordering, Navigation Stepping & Inline Lab Embedding
1. **Pedagogical Ordering Instead of Alphabetical Sorting:**
   - Add an `order: integer` field to `content/schema/topic.schema.json` (and populate `order` across all topics in `content/topics/**/*.md`) **or** sort by `(levelOrder, order)` in `site/src/pages/section/[id].astro` and `site/src/pages/topics/[id].astro`. Never list an `advanced` topic (like *AOS and USLP*) before `intro` and `core` prerequisites.
2. **Previous / Next Topic Progression Bar:**
   - In `site/src/pages/topics/[id].astro`, add a Previous / Next topic navigation bar at the bottom of every article so learners can step through each section and learning path sequentially without hitting a dead end.
3. **Embed Interactive Simulators Directly Inside Topic Pages:**
   - In `site/src/pages/topics/[id].astro`, inspect `d.tool` (`1`–`9`) from the topic frontmatter and render the matching interactive simulator island (`BitInspector`, `PacketDecoder`, `SyncVisualizer`, `CodingSandbox`, `Calibration`, `Cop1Sim`, `DataBudget`, `Walkthrough`, `DecisionTree`) inline inside the topic page (with a link to open the full guided lab page in `/labs/[id]/`).
4. **Add Visual Inline SVG Diagrams to Topic Pages:**
   - Add clean, responsive inline SVG diagrams for:
     - **First Header Pointer (FHP)** spanning across two consecutive TM Transfer Frames (`tm-space-data-link-protocol.md`).
     - **Coding & Sync Sublayer Pipeline** comparing the exact order of CRC (FECF) $\to$ Reed-Solomon/Turbo/LDPC $\to$ Pseudo-Randomizer $\to$ CSM/ASM attachment $\to$ Convolutional encoding (`channel-coding.md`, `sync-markers.md`).
     - **GSaaS Handoff Architectures** comparing RF/DigIF (VITA-49) vs. Baseband Frame (SLE RAF/RCF) vs. Post-Pass Cloud Bucket (S3 PCAP/files) (`ground-stations-and-networks.md`).

### 2.4 Intermediate & Expert Content Deepening
1. **Concrete Code & Database Snippets (`telemetry-and-command-databases.md`, `c2-software-landscape.md`):**
   - Include a real, annotated **XTCE XML** snippet (`<IntegerParameterType>`, `<PolynomialCalibrator>`, `<SequenceContainer>`, `<MetaCommand>`) alongside an **OpenC3 COSMOS** `tlm.txt` / `cmd.txt` comparison so software engineers see actual mission database syntax.
   - Show how **NASA cFS** routes CCSDS Space Packets on its onboard Software Bus (`CFE_SB` / `CFE_MSG`) and how **Yamcs** wires an SLE/UDP Frame Link $\to$ Packet Preprocessor $\to$ XTCE MDB container pipeline.
2. **Expert Protocol Mechanics & Edge Cases:**
   - **COP-1 (`command-lifecycle.md`)**: Document FOP-1 timer `T1` expiry, `Transmission_Count` vs. `Transmission_Limit`, FOP-1 `Alert` conditions (`Alert[T1]`, `Alert[Limit]`, `Alert[Synch]`, `Alert[LLIF]`), `S1`–`S6` state transitions, `Set V(R)` (`BC` frame) directives, and FARM-1 modulo-256 sliding window (`W`, `PW`, `NW`) wrap-around.
   - **SDLS + COP-1 Interaction (`security-associations-and-anti-replay.md`, `space-link-cryptography.md`)**: Explain the exact onboard verification order between TC Frame header validation, SDLS `ProcessSecurity` (SPI + anti-replay sequence number + MAC), and FARM-1 acceptance so unauthenticated frames cannot drive FARM-1 into `Lockout`. Detail how flight systems persist AES-GCM IV high-water-mark counters in Non-Volatile Memory (MRAM/EEPROM) across unexpected spacecraft resets to prevent catastrophic IV reuse.
   - **SLE (`sle-transfer-services.md`)**: Cover ASN.1 BER encoding over TCP/IP (CCSDS 913.1-B-2 ISP1 transport mapping, heartbeat/peer-abort), Service Instance Identifiers (`sii`), and `ForwardProductionStatus` / `CltuNotification` behavior during mid-pass carrier drops.
   - **AOS/USLP & DVB-S2 (`aos-and-uslp.md`, `high-rate-coding-and-modulation.md`)**: Explain AOS `MPDU` vs. `B_PDU` multiplexing, USLP Transfer Frame Data Zone (`TFDZ`) construction rules (`000`–`111`) and UPIDs, and how CCSDS frames map into DVB-S2 `BBFRAME` / `PLFRAME` with `MODCOD` and pilot symbols for VCM/ACM downlinks.

---

## 3. Pillar 2: Immersive Space & Mission Control Theme

Transform the visual identity of `site/` from a clinical white doc site into an inspiring, high-craft **Deep-Space Telemetry & Mission Control Learning Platform** while preserving 100% WCAG 2.2 AA contrast and automated Playwright axe-core passes.

### 3.1 Dark-First Deep-Space Palette & Tactical Surface Styling (`site/src/styles/tokens.css`, `global.css`)
1. **Default to Dark Mode (`Deep Space Console`):**
   - Set Dark Mode as the default theme in `Base.astro` and `tokens.css` (while keeping Light Mode available as `"Daylight / Cleanroom Mode"` via the theme toggle and ensuring both pass `@axe-core/playwright`).
   - Deepen the dark palette: obsidian space canvas (`--canvas: #060a12`), orbital slate surfaces (`--surface-1: #0c1424`, `--surface-2: #121e36`), crisp ice-white primary text (`#f0f6fc`), and luminous telemetry accents:
     - **Downlink / Nominal Lock:** `--teal-400: #2dd4bf` (with subtle glow `0 0 12px rgba(45, 212, 191, 0.25)`)
     - **Uplink / Telecommand Radiating:** `--orange-400: #fb923c`
     - **Spacecraft / Orbital Accent:** `--cyan-400: #38bdf8` / `--indigo-400: #818cf8`
     - **Caution / Wait / Flywheel:** `--amber-400: #fbbf24`
     - **Fault / Lockout / Loss of Lock:** `--red-400: #f87171`
2. **Subtle Orbital Reticle Grids & Hardware Rack Framing:**
   - Add a subtle, non-distracting **orbital coordinate grid & star-chart reticle backdrop** on hero banners, section headers, and simulator canvases using layered CSS radial/linear gradients.
   - Give `.card` and simulator containers a refined **mission-control panel treatment**: subtle top-edge highlight border, technical corner tick marks (`+`), and monospaced panel headers (`MODULE 03 // FRAME SYNCHRONIZER`).
3. **Aerospace Display Typography & Tabular Telemetry Readouts:**
   - Pair a geometric aerospace display typeface (e.g., self-hosted `@fontsource/space-grotesk` for `.t-display`, `.t-h1`, `.t-h2`) with `IBM Plex Sans` for long-form prose readability and `IBM Plex Mono` (`font-variant-numeric: tabular-nums`) for all hex dumps, bit grids, counters, frequencies, and dB readouts.
4. **Custom Spacecraft Emblem & Favicon (`site/public/favicon.svg`, `Base.astro`):**
   - Replace the default Astro "A" logo in `site/public/favicon.svg` and the minimal header circle with a custom **Signal Path spacecraft-to-ground dish vector emblem**.

### 3.2 Live Mission Telemetry Header Strip & Animated Orbital Hero
1. **Live Mission Telemetry Bar (`site/src/layouts/Base.astro`):**
   - Add a sleek telemetry status bar at the top of the viewport displaying:
     - **Live UTC Clock & TAI Offset (`TAI = UTC + 37s`)** in `IBM Plex Mono` (clickable to `/topics/time-codes/`).
     - **Live Simulated Pass Status Pill**: e.g., `SAT-SP1 (LEO 550 km) · PASS ACTIVE · EL 48° · S-BAND LOCK · CSM 0x1ACFFC1D` (clickable to launch the End-to-End Walkthrough or Data Budget lab).
2. **Interactive Orbital Pass & Animated Signal Chain Hero (`site/src/pages/index.astro`, `site/src/components/ChainDiagram.astro`):**
   - Upgrade the homepage hero (`index.astro`) with an **interactive orbital pass visualization** showing a spacecraft moving along an orbital arc over a ground station's visibility cone (AOS $\to$ Max Elevation $\to$ LOS), connected via SLE terrestrial fiber to a Mission Operations Center (MOC).
   - Upgrade `ChainDiagram.astro` from 10 plain rectangles into a rich, **animated spacecraft-to-MOC signal path**:
     - Include custom SVG silhouettes/icons for each segment (Spacecraft Bus, Flight Transceiver, RF Space Link with wave fronts, Ground Station Dish, SLE Provider WAN, Mission Control Console).
     - Animate glowing downlink telemetry frames (teal) flowing left-to-right and uplink command CLTUs (orange) flowing right-to-left along the SVG paths (automatically paused when `prefers-reduced-motion: reduce` is active).
     - Make each stage node in `ChainDiagram.astro` interactive: clicking or hovering reveals the exact PDU at that boundary (`Engineering Value → Space Packet → TM Transfer Frame → CADU → Modulated Symbols`) and links directly to the corresponding topic and lab.

---

## 4. Pillar 3: Complete & Upgrade All 9 Interactive Simulators (Tools 1–9)

Every interactive tool in `site/src/components/islands/*.tsx` must match 100% of the steps, presets, and "Break It" cases in `content/labs/*.yaml` AND provide rich visual feedback:

| Tool | Target Component (`site/src/components/islands/`) | Required Fixes & Visual Upgrades |
| :---: | :--- | :--- |
| **1** | `BitInspector.tsx` | 1. Add the 3 YAML presets (`LEO CubeSat pass`, `Both byte orders`, `APID slice`).<br>2. Add an interactive **byte-offset window slider** so learners can perform the `"Shift the field window by one octet"` break-it exercise.<br>3. Color-code IEEE-754 float bits (`Sign` = 1 bit, `Exponent` = 8/11 bits, `Mantissa` = 23/52 bits) and highlight active bit slices directly in the 64-bit matrix when hovering any readout card.<br>4. Add 8-bit/64-bit integer and ASCII preview cards. |
| **2** | `PacketDecoder.tsx` | 1. Fix the `min-w-[1250px]` horizontal overflow by rendering the 48-bit primary header as a responsive **3 × 16-bit word diagram** (Octets 0–1, Octets 2–3, Octets 4–5) with color-coded bit brackets.<br>2. Add the missing **"Inject error"** toggle required by Step 5 of `space-packet-header-decoder.yaml` and a multi-packet sequence continuity inspector.<br>3. Add a **visual packet-stream framing bar** showing two back-to-back packets so toggling `"Break it: use C instead of C + 1"` visually shows the parser pointer landing inside the payload and corrupting the next header.<br>4. Add a mode tab to also inspect **TM Transfer Frame (6-octet)** and **TC Transfer Frame (5-octet) + 32-bit CLCW** headers. |
| **3** | `SyncVisualizer.tsx` | 1. Fix Step 1 of `sync-marker-visualiser.yaml`: allow viewing/scrolling across **multiple consecutive frames and markers** (showing exact marker bit offsets and Hamming distances) instead of slicing only the first 64 bits (`stream.slice(0, 64)`).<br>2. Add an interactive **`SEARCH → ACQUIRE → LOCK → FLYWHEEL` SVG state diagram** that highlights the active state and transition arrows.<br>3. Add a **correlation spike chart** plotting Hamming-distance matches across the bitstream so learners visually see periodic correlation peaks every frame—and see the peak shift when `"One-bit slip"` is toggled. |
| **4** | `CodingSandbox.tsx` | 1. **Fix `"Not shown · cited figure not wired yet"`**: wire the cited reference curves and coding gains from `CCSDS 130.1-G-3` (§3.3.3, §7.4.1) for Uncoded, Reed-Solomon $(255,223)$, Concatenated RS+Conv, Turbo, and LDPC.<br>2. Add the 4 YAML presets (`LEO CubeSat pass`, `Deep-space probe`, `Rain fade`, `Burst error`) and the **`E=16` vs `E=8` R-S decoder selector** required by Step 6 of `channel-coding-sandbox.yaml`.<br>3. Replace the tiny 16×16 grey checkerboard with a **side-by-side Uncoded vs. Coded 64×64 synthetic spacecraft telemetry image `<canvas>`**, where burst errors visually streak across un-interleaved rows and snap clean when interleaving depth $I=5$ is enabled. |
| **5** | `Calibration.tsx` | 1. Add the 4 YAML presets (`Nominal`, `LEO CubeSat pass`, `Hot`, `Polynomial model`) including a **polynomial calibration option** ($y = a_2 x^2 + a_1 x + a_0$).<br>2. Add the missing **`"Drop the offset term"`** break-it checkbox required by `telemetry-calibration-sandbox.yaml`.<br>3. **Fix the SVG calibration plot**: plot both the **nominal reference curve** (dashed) and the **active/broken curve** (solid) so toggling `"Swap coefficient order"`, `"Drop offset"`, or `"Signed 12-bit"` visibly warps the plotted line and clamps/displays out-of-range markers instead of letting the dot disappear.<br>4. Add a visual thermometer/gauge readout with Soft (`Yellow`) and Hard (`Red`) limit bands. |
| **6** | `Cop1Sim.tsx` | 1. Add the 4 YAML presets (`Nominal pass`, `Drop one AD frame`, `Jump outside window`, `Unlock from lockout`).<br>2. Add a **visual modulo-256 FARM-1 Sliding Window diagram** showing `Negative Window [V(R)-NW .. V(R)-1]`, `Expected V(R)`, `Positive Window [V(R)+1 .. V(R)+PW-1]`, and the `Lockout Zone`.<br>3. Add a **visual Uplink / Downlink frame lane** between Ground FOP-1 and Spacecraft FARM-1, plus an optional auto-CLCW / `T1` timer mode so Step 2 of `cop1-farm-simulator.yaml` (*"FOP-1 enters S2 and resends from 10"*) works intuitively. |
| **7** | `DataBudget.tsx` | 1. Add a **visual per-pass capacity waterfall bar** showing `Raw Pass Capacity → Acquisition/Setup Loss → Framing/Coding Overhead → Retransmission Allowance → Margin → Net Usable Data`.<br>2. Fix the 7-day backlog SVG chart scaling: plot against an **onboard storage capacity limit line** (e.g., configurable `2 GiB` / `8 GiB` recorder capacity with overflow warning) rather than always normalizing the tallest bar to `100%` height.<br>3. Add interactive quick-toggle buttons for the 3 YAML break-it cases (`Symbol rate vs info rate`, `Mix MB and MiB`, `Zero setup time`). |
| **8** | `Walkthrough.tsx` | 1. Add the missing **`"Both (Closed-Loop)"`** direction preset specified in `end-to-end-walkthrough.yaml` alongside `Downlink` and `Uplink`.<br>2. Wire the concrete **live byte-transformation trace** from the YAML (`Star-tracker temp 0x0F3A → 31.2 °C → Space Packet APID 0x07E → TM Frame VC0 → RS(255,223) + CSM 1ACFFC1D → OQPSK → Ground Station → SLE RAF → MOC` and `HTR_ON → TC Packet APID 0x02A → TC Frame VC1 → BCH CLTU → SLE FCLTU → Station → Spacecraft → CLCW N(R)`), showing a visual nested PDU encapsulation stack at each stage. |
| **9** | `DecisionTree.tsx` | 1. **Implement all 4 scripted scenarios** promised in `anomaly-decision-tree.yaml` (currently only Scenario A is coded!):<br>   • **Scenario A:** `carrier-but-no-frame-lock` (Carrier detected, no frame lock — BPSK/QPSK phase inversion)<br>   • **Scenario B:** `frame-lock-with-errors` (Frame lock with rising R-S uncorrectables & VC gaps — low-elevation multipath / Eb/N0 fade)<br>   • **Scenario C:** `packets-missing-frames-ok` (TM frames locking with 0 FECF errors on VC0, but science APID missing — onboard VC1 routing / packet filter disabled)<br>   • **Scenario D:** `command-radiated-no-execution` (CLTU radiated by station, but command counter unchanged — FARM-1 in Lockout with CLCW `lockout=1`)<br>2. Link each diagnostic test to its corresponding layer in the 10-layer fault-isolation tree, flagging tests at already-proven-healthy layers as `"Low value (downstream already healthy)"` per Step 2 of the lab YAML. |

---

## 5. Pillar 4: Complete External Research & Close All Open Source Gaps

Do not rely solely on the 26 local CCSDS PDFs. Conduct targeted external research to close the open issues across `content/topics/`, `content/providers/`, and `research/source_register.json`:

1. **Mission Control (C2) & Flight Software Primary Documentation (`content/topics/ground-segment/c2-software-landscape.md`):**
   - **Yamcs (`S1`, `S2`)**: Read and register the official Yamcs Server Manual sub-pages for SLE (`https://docs.yamcs.org/yamcs-server-manual/links/sle/`) and COP-1 / Frame Links (`https://docs.yamcs.org/yamcs-server-manual/links/tc-data-link/` or GitHub `yamcs/yamcs`, `yamcs/jsle`) to verify and cite Java implementation, SLE RAF/RCF/FCLTU support, COP-1 FOP-1 state machine, and XTCE MDB support. Close the `open_issue` in `c2-software-landscape.md`.
   - **NASA cFS (`S5`)**: Read and register the official NASA cFS / cFE documentation (`https://cfs.gsfc.nasa.gov/` or `https://github.com/nasa/cFE`) verifying that the cFE Software Bus (`CFE_SB` / `CFE_MSG`) uses CCSDS Space Packet headers. Close the `open_issue` in `c2-software-landscape.md`.
2. **Agency & Industry Standards (`time-codes.md`, `high-rate-coding-and-modulation.md`, `telemetry-lifecycle.md`, `command-lifecycle.md`):**
   - **IERS Leap Second Bulletin (`time-codes.md`)**: Register **IERS Bulletin C** (or NIST/USNO leap-second table confirming $\text{TAI} - \text{UTC} = 37\text{ s}$ since January 1, 2017) in `research/source_register.json`, cite it in `content/topics/fundamentals/time-codes.md`, and close the `open_issue`.
   - **ETSI DVB-S2 & NASA SOA Ch. 9 (`high-rate-coding-and-modulation.md`, `rf-basics.md`)**: Register **ETSI EN 302 307-1 (DVB-S2)** and actively cite `NASA-SOA-9` (already in `source_register.json` but currently 0 citations in topics!) for real smallsat transceiver power/mass/band data and NASA NSN Wallops 16APSK DVB-S2 test results.
   - **ESA TM/TC & ECSS Packet Utilization Standard (`ECSS-E-ST-70-41C`)**: Register the ESA Telemetry/Telecommand reference and **ECSS-E-ST-70-41C (PUS)** so `telemetry-lifecycle.md`, `command-lifecycle.md`, and `space-packet-protocol.md` explain how missions standardize secondary headers and application services (e.g., PUS Service 1 Telecommand Verification, Service 3 Housekeeping, Service 11 Time-Based Scheduling).
   - **Orbital Pass Geometry (`contact-planning.md`)**: Register an authoritative NASA source (e.g., NASA *Basics of Space Flight* or NASA Systems Engineering / Flight Dynamics reference) for horizon elevation mask and pass duration geometry to close the `open_issue` in `contact-planning.md`.
   - **Ground Demodulator Lock Telemetry (`carrier-and-symbol-sync.md`)**: Register a primary ground-equipment or cloud-station documentation source (e.g., AWS Ground Station CloudWatch metrics documentation for demodulator carrier/symbol/frame lock or commercial TT&C modem documentation) to close the `open_issue` in `carrier-and-symbol-sync.md`.
3. **2026 CCSDS Technical Corrigenda (`standards-map.md`, `high-rate-coding-and-modulation.md`):**
   - Fetch **`CCSDS 231.0-B-4 Cor. 1` (July 2026)** and **`CCSDS 131.2-B-2 Cor. 1` (October 2026)** from `https://ccsds.org/publications/allpubs/`, verify whether any cited sections are affected, update `content/standards/`, and close the `open_issues`.
4. **GSaaS Provider Matrix Completion (`content/providers/*.yaml`, `site/src/pages/providers.astro`):**
   - Check deeper first-party pages on `ksat.no` (SvalSat / TrollSat station pages, About/Ownership page) and `aws.amazon.com/ground-station/faqs/` to fill in remaining verifiable `cited` cells.
   - For `content/providers/igm.yaml` (where all 9 cells are currently `to_research` because no commercial GSaaS provider named "IGM" exists), either replace `igm.yaml` with a verified major ground network provider (such as **Viasat Real-Time Earth (RTE)** or **NASA Near Space Network (NSN)**, with a note explaining the "IGM" disambiguation from `research/02_ground_station_providers_and_gsaas.md`) or collapse unverified placeholder columns cleanly behind an explanatory note so the comparison table has zero broken placeholder rows.

---

## 6. Verification & Quality Gates Before Completion

After implementing the upgrades across `content/`, `research/`, and `site/`, run the full validation suite and confirm all checks pass with zero errors:

```bash
cd /Users/vigneshwarane/Documents/feature-projects/ccsds/site
npm run check
```

Specifically verify:
1. `validate.py`: **0 errors, 0 warnings** across all schemas, topics (including the 4 new Beginner 101 topics), paths (including `space-comms-101.yaml`), glossary, standards, labs, symptoms, providers, and `source_register.json`.
2. **Zero unresolved `open_issues`** blocking topic completeness where external web sources are publicly available.
3. **Unit & E2E Tests (`vitest` & `playwright`)**: Expand unit and E2E tests to cover the new Beginner path, the 3-tier Flight Deck Depth Switcher, inline lab rendering on topic pages, all 4 scenarios in `DecisionTree.tsx`, and WCAG 2.2 AA accessibility in both the new default **Deep-Space Dark Mode** and **Cleanroom Light Mode**.

