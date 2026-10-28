# External Authoritative Research Dossier: Spacecraft Communications & C2 Architecture
**Project:** Spacecraft Communications & Operations Educational Website  
**Date:** October 2026  
**Status:** Milestone 1 Research Deliverable — External Authoritative Research  

---

## 1. NASA Small Spacecraft Technology State of the Art (SST-SOA)

Grounded in the latest NASA S3VI State of the Art Assessment (Chapters 9: Communications & 11: Ground Data Systems):

### 1.1 Radio Frequency (RF) Spectrum & Operational Bands
Real flight missions choose frequencies based on mission class (Near-Earth vs. Deep Space), regulatory licensing, and required data throughput:

| Band | Typical Spacecraft Uplink (Earth $\to$ Space) | Typical Spacecraft Downlink (Space $\to$ Earth) | Primary Space Service Allocations (ITU RR Art. 5) | Typical Operational Role & Hardware Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **VHF** | $148.0 - 150.05\text{ MHz}$ | $137.0 - 138.0\text{ MHz}$ | Space Operation (SOS), Space Research (SRS) | Early orbit beaconing, LEOP recovery, omnidirectional whip/turnstile antennas (ISIS, AAC Clyde). Low data rate ($1.2 - 9.6\text{ kbps}$). |
| **UHF** | $401.0 - 403.0\text{ MHz}$ | $430.0 - 440.0\text{ MHz}$ (Amateur) / $400.15 - 401.0\text{ MHz}$ | Space Operation, Meteorological Satellite, Amateur Satellite | CubeSat TT&C, deployable tape/monopole antennas. Moderate rate ($9.6 - 38.4\text{ kbps}$), high link margin, low rain fade sensitivity. |
| **S-band** | $\mathbf{2025 - 2110\text{ MHz}}$ | $\mathbf{2200 - 2290\text{ MHz}}$ | **Space Operation, Space Research, EESS** | **The global standard for satellite TT&C**. Paired Earth-to-space and space-to-Earth. Patch antennas (ANYWAVES, EnduroSat, Haigh-Farr), transponders (Vulcan Wireless NSR-SDR, Syrlinks). Rates: $100\text{ kbps} - 10\text{ Mbps}$. |
| **X-band (Near-Earth)** | $7145 - 7235\text{ MHz}$ | $\mathbf{8025 - 8400\text{ MHz}}$ | Earth Exploration-Satellite Service (EESS), Space Research | High-rate payload/science data downlink. Patch arrays, horn antennas. Downlink rates: $50\text{ Mbps} - 1.5\text{ Gbps}$ using DVB-S2 / VCM (Variable Coding & Modulation). |
| **X-band (Deep Space)** | $7145 - 7190\text{ MHz}$ | $8400 - 8450\text{ MHz}$ | Deep Space Research (SRS) ($> 2\times 10^6\text{ km}$ distance) | NASA Deep Space Network (DSN) tracking, ranging, and high-margin telemetry (General Dynamics Small Deep Space Transponder). |
| **Ka-band** | $27.5 - 30.0\text{ GHz}$ | $\mathbf{25.5 - 27.0\text{ GHz}}$ | Earth Exploration-Satellite Service, Space Research | Multi-gigabit payload return ($1 - 10\text{ Gbps}$). High atmospheric attenuation and severe rain fade sensitivity; requires adaptive coding and elevation angle $>10^\circ-15^\circ$. |
| **Optical / Lasercom** | $1550\text{ nm}$ (Near Infrared) | $1550\text{ nm}$ | N/A (Ungoverned by ITU RF allocations; Laser Clearinghouse safety coordination) | Terabit-scale optical downlinks (NASA TBIRD, LCRD, ODTL). Extremely narrow beamdivergence ($<50\ \mu\text{rad}$), requiring sub-arcsecond pointing and clear atmospheric line-of-sight. |

### 1.2 Modern Flight Transceivers & Software-Defined Radios (SDR)
Small satellite communications have transitioned almost entirely from fixed-hardware radios to multi-band **Software-Defined Radios (SDRs)**:
* **COTS Flight Transceivers:** SkyLabs NANOcomm/NANOlink, Vulcan Wireless NSR-SDR (S/X/Ka), EnduroSat S-band / X-band transmitters, Syrlinks, GomSpace AX100/NanoCom.
* **Flight Software Integration:** SDR baseband processors perform onboard framing (CCSDS 133.0 Space Packets $\rightarrow$ 132.0 TM Frames), channel coding (Reed-Solomon, Turbo, LDPC), and modulation (BPSK, QPSK, 8PSK, 16APSK, 32APSK).

---

## 2. ITU Radio Regulations (Article 5) Regulatory Framework

1. **Service Classifications (Article 1):**
   - **Space Operation Service (SOS):** Strictly confined to telemetry, tracking, and telecommand (TT&C) necessary to navigate and control the spacecraft.
   - **Space Research Service (SRS):** Utilization of spacecraft for scientific experiments or technological research.
   - **Earth Exploration-Satellite Service (EESS):** Radiocommunication between space and Earth to observe Earth's environment via active (radar/scatterometer) or passive (radiometer) sensors.
2. **Category of Allocation:**
   - **PRIMARY (Capitalized in ITU Table):** Guaranteed legal right against harmful interference; protected priority over secondary users.
   - **Secondary (Lowercase):** Permitted to transmit on a non-interference, non-protection basis (cannot cause interference to primary users, cannot claim protection from primary transmissions).
3. **Protected Passive Bands (No Transmissions Allowed):**
   - Specific spectrum bands are permanently protected for passive Earth observation and radio astronomy, including **$23.6 - 24.0\text{ GHz}$**, **$31.3 - 31.8\text{ GHz}$**, and **$50.2 - 50.4\text{ GHz}$**. Spacecraft are legally prohibited from radiating in these windows.
4. **Registration & Coordination:**
   - Filing with the ITU Radiocommunication Bureau (BR) and entry into the **Master International Frequency Register (MIFR)** via the national notifying administration (e.g., FCC/NTIA in the US, Ofcom in the UK, ANFR in France, RSM in NZ).

---

## 3. Mission Operations Center (MOC) & C2 Software Stack

Software engineers in space operations rarely interact directly with raw radio waves; they interface with the **Command and Control (C2)** and ground data processing suite:

### 3.1 Real-World Open-Source & Institutional C2 Systems
* **Yamcs (Space Applications Services):**
  - Modern Java-based mission control framework used by ESA and commercial constellation operators.
  - Features native decoding of CCSDS TM Frames (CCSDS 132.0-B), Space Packets (CCSDS 133.0-B), Space Link Extension (SLE) interfaces, and closed-loop COP-1 FOP-1 telecommand uplink.
* **OpenC3 COSMOS (OpenC3, Inc.):**
  - Microservice-based, web-native C2 suite for satellite integration, testing, and flight operations.
  - Features real-time telemetry decommutation, command scripting, limits monitoring, and packet logging.
* **NASA Open MCT (Mission Control Technologies, NASA Ames):**
  - Web-based telemetry visualization platform used for lunar and planetary missions (VIPER, lunar rovers).
  - Provides composable time-series charts, layout displays, and telemetry health plots.
* **NASA Core Flight System (cFS):**
  - Open-source, reusable flight software framework developed by NASA Goddard Space Flight Center (GSFC).
  - Utilizes standard CCSDS Space Packet Protocol headers for inter-application messaging on the flight computer software bus.

### 3.2 Ground-to-MOC Interfacing: CCSDS Space Link Extension (SLE)
When an operator books a pass with an institutional network (NASA DSN, NASA NSN, ESA ESTRACK) or a ground provider, data is transferred between the antenna site and the MOC using **CCSDS Space Link Extension (SLE)** protocols over secure WAN circuits:
* **RAF (Return All Frames / CCSDS 911.1-B):** Streams all valid demodulated physical frames received by the antenna to the MOC in real time, regardless of Virtual Channel.
* **RCF (Return Channel Frames / CCSDS 911.2-B):** Ground station filters and delivers only frames matching specific Virtual Channel IDs (VCIDs) assigned to that mission.
* **FCLTU (Forward Command Link Transmission Unit / CCSDS 912.1-B):** The MOC streams prepared command bitblocks (CLTUs) to the ground station transmitter for scheduled radiation.

---

## 4. Space Data Link Security (SDLS) & Cryptographic Key Management

Based on **CCSDS 355.0-B-2**, **CCSDS 355.1-B-1**, and **NIST SP 800-57 Part 1 Rev 5**:

### 4.1 Frame-Level Security Mechanics
SDLS operates directly at the space link layer (wrapping TM, TC, AOS, or USLP transfer frames):
* **Security Header:** Carries the 16-bit **Security Parameter Index (SPI)** and the **Anti-Replay Sequence Number (ARSN)** or initialization vector (IV).
  - SPI defines the active **Security Association (SA)**.
* **Security Trailer:** Carries the **Message Authentication Code (MAC)** generated via keyed cryptographic algorithms (e.g., HMAC-SHA-256 or AES-GMAC).
* **Authenticated Encryption (AEAD):** In modern architectures, **AES-GCM (Galois/Counter Mode)** provides simultaneous confidentiality (encryption of the frame payload) and cryptographic integrity/authenticity (MAC) in a single algorithm.

### 4.2 Key Lifecycle & Operational Rollover
The primary operational risk in spacecraft cryptography is **loss of command authority** caused by a key mismatch between the ground MOC and the flight computer.

```
       [PRE-ACTIVATION]
              │
              ▼  (Encrypted telecommand uploads new key into secure flight crypto storage)
          [ACTIVE] ◄── Transition/Grace Window ──► [OVERLAPPING OLD ACTIVE]
              │     (Ground transmits with new SPI; Spacecraft accepts both old & new SPI)
              ▼  (Telemetry confirms execution & receipt of new SPI frames)
        [DEACTIVATED]
              │
              ▼
         [DESTROYED]
```

#### Safe Key Rollover Protocol:
1. **Pre-loading:** New operational keys are pre-loaded prior to launch or uploaded in flight encrypted under an offline **Key Encryption Key (KEK)**.
2. **Security Association Association:** New key is assigned a distinct **SPI** (e.g. `SPI=0x0102`).
3. **Overlapping Activation Window:** Spacecraft command handler is instructed to accept frames from *either* `SPI=0x0101` (old) or `SPI=0x0102` (new) for a predefined grace period.
4. **Switchover & Verification:** Ground transmits telecommand frames with `SPI=0x0102`. Ground operators verify from downlinked CLCW / frame acceptance telemetry that `SPI=0x0102` frames are being accepted.
5. **Rollback Protection:** If ground transmission fails or unexpected RF loss occurs during transition, ground falls back to sending on `SPI=0x0101` before the grace window expires, preventing a lockout anomaly.
6. **Retirement:** Once confirmed, old `SPI=0x0101` is deactivated and zeroized.
