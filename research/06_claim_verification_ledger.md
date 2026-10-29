# Claim Verification Ledger — Milestone 1 dossiers vs. primary sources

**Checked:** 2026-10-28 · **Checker:** Claude (design/research agent) · **Scope:** claims in `research/00–03`, `wip_research.md`, and `ccsds_inventory.json` that the site design or content relies on.

**Verdicts:** **Confirmed** = matches the primary source. **Corrected** = partly right; the corrected wording is given. **Unverified** = no first-party evidence found yet; must not be published as fact. **Refuted** = contradicted by the primary source. **Open** = needs the user's input or a source we have not read yet.

Source IDs refer to `research/05_verified_source_register.md`.

## 1. CCSDS standards — issue, date, status

| # | Claim (where) | Verdict | Finding | Source |
| :-- | :-- | :-- | :-- | :-- |
| C1 | 131.0-B-6, TM Sync & Channel Coding, April 2026 (00, 04) | Confirmed | Listed active, Issue 6, April 2026; local PDF cover matches. | CCSDS-CAT, CCSDS-131.0-B-6 |
| C2 | 132.0-B-3, October 2021 (00, 04) | Confirmed | Active, Issue 3, October 2021. | CCSDS-CAT |
| C3 | 133.0-B-2, June 2020 (00, 04) | Confirmed | Active, Issue 2, June 2020. | CCSDS-CAT |
| C4 | 232.0-B-4, October 2021 (00, 04) | Confirmed, with note | Base issue October 2021; **Cor. 1 issued October 2023** (local file `232x0b4e1c1_tc2325.pdf`). The inventory JSON wrongly gives "October 2023" as the publication date. | CCSDS-CAT |
| C5 | 232.1-B-2 COP-1 (00, 04) | Confirmed, with note | Base September 2010; **Cor. 1 April 2019**. The inventory JSON gives "April 2019" (the corrigendum date). | CCSDS-CAT |
| C6 | 231.0-B-4, July 2021 (00, 04) | Corrected | Base July 2021 confirmed. **New Technical Corrigendum 1 issued July 2026**, not in the local library. | CCSDS-CAT |
| C7 | 355.0-B-2 SDLS, "July 2022" (00, 04, inventory) | Corrected | Catalogue lists **August 2022**. | CCSDS-CAT |
| C8 | 355.1-B-1 SDLS-EP, February 2020 | Confirmed | Active, February 2020. | CCSDS-CAT |
| C9 | 727.0-B-5 CFDP, July 2020 | Confirmed | Active, July 2020. | CCSDS-CAT |
| C10 | 732.0-B-5 AOS, October 2025 | Confirmed | Active, October 2025. | CCSDS-CAT |
| C11 | 732.1-B-3 USLP, June 2024 | Confirmed | Active, June 2024. | CCSDS-CAT |
| C12 | SLE RAF 911.1-B / RCF 911.2-B / FCLTU 912.1-B (01) | Confirmed, issue added | Current issues: **911.1-B-5, 911.2-B-4, 912.1-B-5 (all July 2023)**. The dossier gave no issue numbers. | CCSDS-CAT |
| C13 | 131.2-B-2 (SCCC) status | New finding | **Cor. 1 issued October 2026**; not in the local library. | CCSDS-CAT |
| C14 | `ccsds_inventory.json` pub_date field | Corrected | 25 entries carry a corrigendum or other date instead of the base-issue date (e.g. 734.1-B-1 "January 2026" vs base May 2015). Use the catalogue snapshot for dates. | CCSDS-CAT snapshot |
| C15 | Local library is current | Corrected | Superseded locally: **722.1-M-1 → 722.1-M-2 (July 2026)**, **902.12-M-1 → 902.12-M-2 (September 2026)**. Active but missing locally: 529.1-B-1, 722.1-M-2, 734.6-O-1, 902.12-M-2, 902.4-B-1 and the 2026 corrigenda to 131.2-B-2, 231.0-B-4 and 502.0-B-3. | CCSDS-CAT snapshot |

## 2. Protocol facts used in the design

| # | Claim | Verdict | Finding | Source |
| :-- | :-- | :-- | :-- | :-- |
| P1 | ASM `0x1ACFFC1D` is "the" TM sync marker (00, 03) | Corrected | 1ACFFC1D applies to uncoded, convolutional, Reed–Solomon, concatenated and rate-7/8 LDPC data. **Turbo rates and other LDPC rates use different ASM patterns** (131.0-B-6, figures 9-1 to 9-5). Site shows ASM per coding option. | CCSDS-131.0-B-6 |
| P2 | Pseudo-randomizer polynomial x⁸+x⁷+x⁵+x³+1 (00) | **Corrected** | 131.0-B-6 §10.4.1 specifies the **131,071-bit sequence h(x)=x¹⁷+x¹⁴+1** (seed 11000111000111000) as the standard; the 255-bit x⁸ sequence (seed all ones) is allowed **only for backward compatibility with legacy systems** (§10.4.2), with a warning about spectral lines and ITU power-flux-density limits. | CCSDS-131.0-B-6 §10.4 |
| P3 | SPP primary header 6 octets; field sizes 3/1/1/11/2/14/16 | Confirmed | Matches 133.0-B-2 §4.1.3. | CCSDS-133.0-B-2 |
| P4 | Sequence flags 00 cont., 01 first, 10 last, 11 unsegmented | Confirmed | 133.0-B-2 §4.1.3.4.2.2. | CCSDS-133.0-B-2 |
| P5 | Packet Data Length = octets in data field − 1 | Confirmed | 133.0-B-2 §4.1.3.5.2 ("one fewer than"). | CCSDS-133.0-B-2 |
| P6 | Idle packet APID all ones | Confirmed | 133.0-B-2 §4.1.3.3.4.4; secondary header flag 0 for idle packets. | CCSDS-133.0-B-2 |
| P7 | FOP-1 states and FARM-1 states/variables | Confirmed | FOP-1 S1 Active … S6 Initial; FARM-1 Open/Wait/Lockout; V(S), V(R), N(R), NN(R). | CCSDS-232.1-B-2 |
| P8 | SDLS Security Parameter Index is 16 bits; anti-replay sequence numbers | Confirmed | 355.0-B-2 §4.1.1 (SPI 16 bits, mandatory); sequence-number window for replay detection. | CCSDS-355.0-B-2 |
| P9 | TC coding: BCH, CLTU, start/tail sequence, randomizer (00) | Confirmed | Sections present in 231.0-B-4 (BCH coding §3, CLTU §5, randomizer §6). | CCSDS-231.0-B-4 |
| P10 | "Safe key rollover protocol" with overlapping SPIs and grace windows (01) | Open — keep conceptual | Not a normative CCSDS procedure as written; mixes 355.1-B-1 SA management with mission practice. Present only as **conceptual, mission-specific**, citing 355.1-B-1 and NIST SP 800-57 Pt 1 for lifecycle concepts. Applied in topic `key-management-and-rotation` (2026-10-28) as a mission-labelled claim; lifecycle facts from 355.1-B-1 §2.3.2 and SP 800-57 §5.2–5.3 read from the source text. | CCSDS-355.1-B-1, NIST-800-57 |
| P11 | Randomization is a mission option (implied in 00) | **Corrected** | 131.0-B-6 §10.1: the Pseudo-Randomizer is **mandatory** for all CCSDS-recommended modulation/coding combinations; it XORs the frame/codeblock/codeword, not the CSM (CADU = CSM + randomized unit, §9.1.2). | CCSDS-131.0-B-6 |
| P12 | Marker term | **Clarified** | 131.0-B-6 §9 names it the **Code Synchronization Marker (CSM)**; when slicing is not used the CSM also serves as the ASM and the terms may be used interchangeably (§9.2.2). | CCSDS-131.0-B-6 |
| P13 | Synchronizer states "SEARCH → CHECK → LOCK → FLYWHEEL" (03) | **Corrected (practice)** | Not normative. Green Book 130.1-G-3 §9.3.7 describes a common state-diagram synchronizer: Search, Acquire 1–2, Lock, Flywheel 1–2. Use 'Acquire' rather than 'Check'. | CCSDS-130.1-G-3 |
| P14 | Fictional log "frame counter gap vc=0 expected=0x2A1 got=0x2A4" (design) | **Corrected** | TM Virtual Channel Frame Count is 8 bits, modulo 256 (132.0-B-3 §4.1.2.6); 0x2A1 is impossible. Examples now use 0xA1 → 0xA4. | CCSDS-132.0-B-3 |

## 3. Bands and regulation

Checked against **ITU Radio Regulations, Edition of 2024, Volume 1, Article 5 (Table of Frequency Allocations)**, local copy `research/sources/itu-rr-2024/` (source `ITU-RR-2024`), plus CCSDS 401.0-B-32. Table entries in CAPITALS are primary allocations; lower-case are secondary. Every space band below is **shared** with other primary services (e.g. FIXED, MOBILE) and subject to footnotes and national licensing — an allocation is not permission to transmit.

| # | Claim (01) | Verdict | Finding (RR 2024 Art. 5) | Source |
| :-- | :-- | :-- | :-- | :-- |
| B1 | S-band uplink 2025–2110 MHz | **Confirmed** | 2 025–2 110 MHz: SPACE OPERATION, EARTH EXPLORATION-SATELLITE and SPACE RESEARCH (Earth-to-space)(space-to-space), co-primary with FIXED and MOBILE (5.391, 5.392). | ITU-RR-2024, CCSDS-401 |
| B1b | S-band downlink 2200–2290 MHz | **Confirmed** | 2 200–2 290 MHz: SPACE OPERATION, EESS and SPACE RESEARCH (space-to-Earth)(space-to-space), co-primary with FIXED and MOBILE. | ITU-RR-2024 |
| B1c | S-band deep space (not in dossier) | Added | 2 110–2 120 MHz SPACE RESEARCH (deep space)(Earth-to-space); 2 290–2 300 MHz SPACE RESEARCH (deep space)(space-to-Earth). | ITU-RR-2024 |
| B2 | X-band near-Earth uplink "7145–7235 MHz" | **Corrected** | 7 145–7 190 MHz is SPACE RESEARCH **(deep space)** Earth-to-space only. Near-Earth uplink is **7 190–7 235 MHz** (EESS and SPACE RESEARCH Earth-to-space); No. **5.460 prohibits deep-space emissions there**. | ITU-RR-2024 |
| B2b | X-band downlink 8025–8400 MHz labelled "EESS, Space Research" | **Corrected** | 8 025–8 400 MHz is **EARTH EXPLORATION-SATELLITE (space-to-Earth)** only (no space research allocation), shared with FIXED, FIXED-SATELLITE (Earth-to-space), MOBILE. Near-Earth space-research downlink is **8 450–8 500 MHz**. | ITU-RR-2024 |
| B3 | X-band deep space 7145–7190 up / 8400–8450 down | **Confirmed** | 8 400–8 500 MHz SPACE RESEARCH (space-to-Earth); No. **5.465** limits 8 400–8 450 MHz to deep space. Secondary basis in Singapore and Sri Lanka (5.466). | ITU-RR-2024 |
| B4 | Ka-band 25.5–27.0 GHz downlink | **Confirmed** | 25.5–27 GHz: EESS (space-to-Earth) and SPACE RESEARCH (space-to-Earth), co-primary with FIXED, INTER-SATELLITE, MOBILE; country conditions in 5.536C. | ITU-RR-2024 |
| B5 | NASA SST-SOA band table gives these exact ranges | Refuted | NASA ch. 9 Table 9-1 gives broad IEEE-style ranges. Cite ITU RR for allocations. | NASA-SOA-9 |
| B6 | VHF uplink "148.0–150.05 MHz" | **Corrected** | Space operation (Earth-to-space) is an **additional allocation by footnote 5.218 in 148–149.9 MHz only**, primary but subject to agreement under No. 9.21, individual transmissions ≤ 25 kHz; 5.218A covers short-duration missions. **149.9–150.05 MHz is MOBILE-SATELLITE (Earth-to-space) only.** | ITU-RR-2024 |
| B6b | VHF downlink 137–138 MHz | **Confirmed, with nuance** | SPACE OPERATION (space-to-Earth) primary in sub-bands such as 137–137.025 and 137.175–137.825 MHz, shared with METEOROLOGICAL-SATELLITE, MOBILE-SATELLITE and SPACE RESEARCH. | ITU-RR-2024 |
| B6c | UHF uplink "401–403 MHz" | **Refuted (direction)** | 401–402 MHz: SPACE OPERATION is **space-to-Earth** (downlink), alongside EESS and METEOROLOGICAL-SATELLITE **Earth-to-space**; 402–403 MHz: EESS and MET-SAT Earth-to-space, no space operation. Not a generic TT&C uplink band. | ITU-RR-2024 |
| B6d | UHF downlink 400.15–401 MHz | **Corrected** | SPACE RESEARCH (space-to-Earth) primary; **space operation only secondary** (lower-case). | ITU-RR-2024 |
| B6e | UHF "430–440 MHz (Amateur)" for CubeSat TT&C | **Corrected — high caution** | 430–440 MHz is AMATEUR / RADIOLOCATION with regional differences; the **amateur-satellite service** may operate in **435–438 MHz** under No. 5.282 (no harmful interference). Amateur-satellite use carries amateur-service conditions and is **not a general commercial TT&C band**. | ITU-RR-2024 |
| B7 | ITU RR edition | Confirmed | Radio Regulations, Edition of 2024 (texts through WRC-23), Volume 1 PDF dated August 2024. | ITU-RR-2024 |
| B8 | Passive bands "23.6–24, 31.3–31.8, 50.2–50.4 GHz — spacecraft prohibited from radiating" | **Corrected** | No. **5.340: all emissions are prohibited** in 23.6–24 GHz, **31.3–31.5 GHz (all Regions) and 31.5–31.8 GHz in Region 2 only**, 50.2–50.4 GHz, and others (e.g. 1 400–1 427 MHz). The ban applies to all stations, not only spacecraft. | ITU-RR-2024 |

**Teaching rule for the site:** show bands as "allocated to <service> (<direction>) on a primary/secondary basis, shared with …, per ITU RR 2024 Art. 5 (and national regulator)"; never as "the X-band for satellites". Jurisdiction and edition date go next to every band table.

## 4. Ground-station providers

| # | Claim (02) | Verdict | Finding | Source |
| :-- | :-- | :-- | :-- | :-- |
| G1 | KSAT "over 280 antennas across 28+ ground stations" | Corrected | KSAT states **"more than 280 antennas at 26 selected locations."** | KSAT-GNS |
| G2 | KSATlite network size | Conflicting first-party | KSATlite page shows **"135"** antennas in its stats block and **"150+ antennas"** in body text; **"26 stations"**. NASA SST-SOA ch. 11 (secondary) says "over 100 KSATLITE antennas at 15+ ground station sites". Publish only with date and a note that figures differ. | KSAT-LITE, NASA-SOA-11 |
| G3 | KSATlite bands S up/down, X down, Ka down | Confirmed | KSATlite page: S-band (up/down), X-band (down), Ka-band (down); antennas 3.7–6.1 m. Exact frequency ranges **not publicly specified** on that page. | KSAT-LITE |
| G4 | KSAT REST API / M2M scheduling, portal | Confirmed | "API-driven scheduling and machine-to-machine interfaces"; customer portal. No public API documentation linked. | KSAT-LITE |
| G5 | KSAT data delivery via SLE/CSTS, VITA 49, Direct Connect/ExpressRoute | Unverified | Not stated on KSAT pages checked. **Not publicly specified** until a first-party source is found. | — |
| G6 | SvalSat 78°N, TrollSat 72°S, "up to 14 passes/day" | Unverified | Not stated on the KSAT pages checked. | — |
| G7 | KSAT ownership (Space Norway + Kongsberg) | Unverified | Not stated on pages checked. | — |
| G8 | Leaf Space HQ "Lomazzo (Como)" | Corrected | Leaf Space lists offices in **Milan (20125 Milano)** and **Lewes, Delaware**; founded 2014 at Politecnico di Milano. | LEAF-WHO |
| G9 | Leaf Line / Leaf Key product names | Confirmed | Leaf Line (GSaaS), Leaf Key (dedicated ground station), plus Leaf Hosting and TreeNet. | LEAF-HOME |
| G10 | Leaf bands UHF/VHF, S, X; Ka "select Leaf Key apertures" | Corrected | Leaf Line page lists **S, X and Ka** bands; UHF/VHF **not stated**. | LEAF-LINE |
| G11 | Leaf "booking up to 96 hours in advance" | Corrected | **96 h is the automated rolling schedule horizon** (runs daily 00:00 UTC). On-demand booking via API from 4 days to 5 min before; reservation ahead of schedule up to **10 days**. | LEAF-SCHED |
| G12 | Leaf data delivery to AWS S3, GCS, Azure Blob, TCP/UDP/WebSocket | Corrected | Leaf Line states real-time streams (TCP/IP, UDP, GSE) and file transfer to destinations **such as an S3 bucket or Contabo**. GCS/Azure/WebSocket **not stated**. | LEAF-LINE |
| G13 | Leaf network size | New finding | "40+ ground stations in more than 17 locations" (FAQ) vs coverage panel "40 antennas, 20 locations"; who-we-are: "40+ ground stations spanning 20+ locations". Publish with date and range. | LEAF-LINE, LEAF-WHO |
| G14 | Leaf pricing all-inclusive per minute | Confirmed | Per-minute while tracking; includes RF licensing, processing, backhaul and delivery. | LEAF-LINE |
| G15 | "IGM" is not a GSaaS provider; likely AWS/SSC/ATLAS mishearing | Open | One extended web search found no ground-segment company named IGM. Absence of evidence is not proof; **only the user can say what was meant.** Column stays "to research". | Search 2026-10-28 |
| G16 | AWS / ATLAS / SSC capabilities (02 matrix) | Superseded by G17–G30 | First-party pages read 2026-10-28. | — |
| G17 | AWS bands "S-band, X-band" (02); NASA: S up 2025–2120, S down 2200–2300, X down 7750–8400 MHz | **Corrected (first-party conflict)** | AWS **features page**: S up 2025–2120 MHz, S down 2200–2300 MHz, X down 7750–8400 MHz. AWS **User Guide capability table**: S uplink **2025–2110 MHz** (EIRP 20–50 dBW), S downlink **2200–2290 MHz**, X downlink **7750–8500 MHz** (narrowband ≤40 MHz; wideband 50–400 MHz per channel, ≤400 MHz per polarization; demod/decode ≤500 MHz). Prefer the User Guide for technical values and note the mismatch. | AWS-GS-CAP, AWS-GS-FEAT |
| G18 | AWS antenna size 5.4 m (NASA) | Unverified (first-party) | Not stated on AWS pages read. | — |
| G19 | AWS locations | New finding | User Guide lists **11 ground stations**: Alaska 1, Bahrain 1, Cape Town 1, Dubbo 1, Hawaii 1, Ireland 1, Ohio 1, Oregon 1, Punta Arenas 1, Singapore 1, Stockholm 1. **Seoul antenna resources removed as of June 16, 2026.** Dedicated Antenna locations not publicly disclosed. | AWS-GS-LOC |
| G20 | AWS scheduling "Console, CLI, SDKs" (02) | Confirmed | Console and APIs; CLI and SDKs referenced in the User Guide; reservations changeable until 15 min before antenna time. | AWS-GS-FEAT, AWS-GS-UG |
| G21 | AWS data ingestion "VPC, S3, EC2" (02) | Confirmed | Real-time to EC2 (VITA-49), S3 (PCAP); demodulated/decoded or raw DigIF; uplink via DigIF (VITA-49) on S-band only; uplink echo; digital twin for testing. | AWS-GS-UG, AWS-GS-FEAT |
| G22 | AWS commercial model "pay-per-minute or reserved" (02) | Confirmed | Billed per minute of scheduled antenna time; On-Demand or Reserved (monthly commitment); Dedicated Antennas also offered. | AWS-GS-FEAT |
| G23 | ATLAS "network-of-networks", Freedom platform (02) | Confirmed | Federated ground network; Freedom® Ground Software as a Service; "single API"; one streaming entry point (One IP, One Port) across ATLAS, AWS, Viasat and other sites. | ATLAS-FGN, ATLAS-FREEDOM |
| G24 | ATLAS bands UHF, S, X, Ka (02) | Confirmed | S, X, Ka and UHF listed; LEO, MEO, GEO. | ATLAS-FGN |
| G25 | ATLAS network size (NASA: "34 ground stations and 51 antennas") | Confirmed (approx.) | First-party counters (target values in page code): **"50+" antennas, "34+" active ground stations**. Counters render as "0+" without JavaScript. | ATLAS-FGN |
| G26 | ATLAS scheduling | New finding | Flex scheduling "from 14 days out to 1 minute"; FreeTime API for unused antenna time; exact scheduling in the standard API. | ATLAS-FREEDOM |
| G27 | ATLAS "Usage-based subscription" (02) | Unverified | Pricing model not stated on pages read; "monthly minute promises" mentioned without figures. | ATLAS-FREEDOM |
| G28 | SSC brand and network | Partly confirmed | Homepage: brand "**SSC Space**"; "**300+ satellite contacts a day**"; ground-station services Go, Plus, LEOP, Lunar, Optical, Hosting, Teleport. "SSC Infinity" not found on the homepage. | SSC-HOME |
| G29 | SSC stations, bands, booking, delivery (NASA; 02) | **Partly confirmed (retry 2026-10-28)** | Our-stations page: **"11 ground stations"** owned/operated plus **"10 additional partner stations"**; antenna counts, bands, interfaces not stated there. SSC Go page: LEO small-sat service, **S-band up/down, X and Ka down**, **"Thirteen antennas at five locations"**, delivery through a secure regional cloud interface / drop-off zone (e.g. S3), booking by reserving time slots. Booking lead times, API, SLE support and pricing **not publicly specified** on pages read. | SSC-STATIONS, SSC-GO |
| G30 | SSC ownership "Swedish state" | Unverified | Not on pages that loaded. | — |

## 5. Other sources cited by the dossiers

| # | Claim | Verdict | Finding | Source |
| :-- | :-- | :-- | :-- | :-- |
| N1 | NIST SP 800-57 Pt 1 Rev 5 current | Confirmed | Final, May 2020; supersedes Rev 4; no newer revision listed. | NIST-800-57 |
| N2 | NIST SP 800-38D (GCM/GMAC) | Confirmed, with note | Final, November 2007; **NIST announced (March 2024) it will revise this publication.** Recheck before publishing. | NIST-800-38D |
| N3 | NASA SST-SOA chapters 9 and 11 current | Confirmed | Ch. 9 Communications (page dated May 18, 2026); ch. 11 Ground Data Systems & Mission Operations (May 11, 2026). Edition year shown ambiguously (2025/2026). | NASA-SOA-9, NASA-SOA-11 |
| N4 | DVB-S2 demonstrated on NSN | Confirmed (secondary) | NASA ch. 9: NSN test at Wallops over a 5 MHz S-band channel, 15 Mbps with 16APSK LDPC 9/10. | NASA-SOA-9 |


## 7. C2 software stack (dossier 01 §3.1)

| # | Claim (01) | Verdict | Finding | Source |
| :-- | :-- | :-- | :-- | :-- |
| S1 | Yamcs: Java-based, used by ESA and commercial constellation operators | Partly confirmed | First-party: open-source C3 framework by Space Applications Services, AGPL; language and named users **not stated** on pages read. | YAMCS-HOME |
| S2 | Yamcs decodes TM frames, Space Packets, SLE, COP-1 | Partly confirmed | Data-links page lists CCSDS Frame Processing and TCP/UDP TM/TC links; **SLE and COP-1 not on the pages read** — to research in the full manual. | YAMCS-LINKS |
| S3 | OpenC3 COSMOS: decom, commanding, scripting, limits, logging | Confirmed | Home page: telemetry decom, commanding, Script Runner (Ruby/Python), limits and alerts, logging and replay; Core (open source) and Enterprise editions. | OPENC3-HOME |
| S4 | Open MCT: NASA Ames web visualization, used for VIPER/lunar rovers | Partly confirmed | First-party: web-based mission operations data visualization framework from NASA Ames with JPL/AMMOS; named missions **not stated**. | OPENMCT-HOME |
| S5 | cFS uses CCSDS Space Packet headers on its software bus | Unverified | GSFC page describes PSP, OSAL, cFE bus architecture and apps; **CCSDS packet use not stated** there. | CFS-GSFC |

## 8. Next-phase research pass (2026-10-29)

| ID | Claim / question | Result | Sources |
| :-- | :-- | :-- | :-- |
| R1 | Yamcs SLE support (was S2) | **Confirmed.** RAF and RCF (online timely, online complete, offline) and FCLTU, citing 911.1-B-4, 911.2-B-3, 912.1-B-4 and ISP1 913.1-B-2 — older issues than ours. | YAMCS-SLE |
| R2 | Yamcs COP-1 support (was S2) | **Confirmed.** COP-1 on VC TC links with `useCop1: true`; initialize / resume / disable, config and status via HTTP API. | YAMCS-COP1 |
| R3 | cFS uses CCSDS packet headers (was S5) | **Confirmed** from cFE source: `CCSDS_PrimaryHeader_t` plus optional extended header, big-endian, accessed via CFE_MSG. | CFE-CCSDS-HDR |
| R4 | TAI − UTC today | **37 s** since 2017-01-01; no leap second end of 2026 (Bulletin C 72). Recheck each January/July. | IERS-BULC |
| R5 | Ground demodulator lock indicators | **Confirmed for one provider:** AWS Ground Station CloudWatch metrics (carrier and symbol lock flags, C/N0, Es/N0, BER, EVM, offsets). | AWS-GS-METRICS |
| R6 | DVB-S2 structure | **Confirmed** from EN 302 307-1 V1.4.1 §4.2 (BCH+LDPC, 64 800 / 16 200, VCM/ACM per frame, 90-symbol slots, pilots 36 per 16 slots). NASA NSN Wallops test 15 Mbps in 5 MHz S-band, 16APSK LDPC 9/10. | ETSI-DVBS2, NASA-SOA-9 §9.2.8 |
| R7 | 131.2-B-2 Cor. 1 | **Read.** Issue date May 2026 (catalogue: Oct 2026). Changes §3.2.4, §8.1, §8.2.2 (SCCC randomizer reference; typo). No Signal Path claim affected. | CCSDS-131.2-B-2-COR1 |
| R8 | 231.0-B-4 Cor. 1 | **Not found online** (catalogue search and web search 2026-10-29). Stays open. | — |
| R9 | ECSS-E-ST-70-41C (PUS) | **Not read:** ecss.nl redirected to an ESA "site unavailable" page on 2026-10-29. No PUS claims added. | — |
| R10 | Orbital period formula | **Confirmed** (archived NASA GSFC Stargaze page): T = 5063.5 s × (r/R_E)^1.5. Pass durations remain computed examples. | NASA-STARGAZE-K3 |
| R11 | CCSDS reuse terms | **Confirmed:** "reasonable reuse … with attribution" (publications page). | CCSDS-PUBS |
| R12 | NIST SP 800-38D revision | **Still pending:** revision announced 2024-03-06; no draft or final as of 2026-10-29. | NIST-800-38D (CSRC page) |
| R13 | KSAT delivery/latency/support; AWS support/latency | **Still not public** on KSATlite page and AWS FAQ (rechecked). AWS FAQ confirms EC2, S3 and wideband DigIF delivery. | KSAT-LITE, AWS FAQ |
| R14 | "IGM" provider | **Unresolved**; removed from the comparison table and shown as a note until the user confirms the organisation. | — |
