# Interactive Simulators & Tools Specification
**Project:** Spacecraft Communications & Operations Educational Website  
**Focus:** Hands-On Interactivity, Educational Simulation & Operational Realism  
**Date:** October 2026  
**Status:** Interactive Architecture Specification  

---

## 1. Vision: Learning Spacecraft Comms by Doing

Static text and passive diagrams fail to give software engineers intuition for the physical and protocol constraints of space communications. To make the website genuinely engaging and pedagogically transformative, the site features **9 live, client-side interactive sandboxes and decoders**.

Every interactive tool follows four principles:
1. **Direct Manipulation:** Sliders, hex input boxes, toggle switches, and drag-and-drop elements update the visualization instantly ($<16\text{ ms}$).
2. **Visible Assumptions & Formulas:** Every calculation displays its underlying equation, unit breakdown (bits vs. bytes, dB vs. linear ratio), and adjustable constants.
3. **Operational Context:** The tool ties directly to what an engineer or operator sees on a real mission control console (e.g. hex dumps, lock states, alarm limits).
4. **Preset Scenarios & "Break It" Buttons:** Each tool provides realistic presets (e.g., "LEO CubeSat Pass", "Interplanetary Deep Space Probe", "Rain Fade Anomaly") plus a button that injects faults so learners can observe the symptom and diagnose the cause.

---

## 2. The 9 Core Interactive Simulators & Tools

### Tool 1: Interactive Bit/Byte & Endianness Inspector
* **Location:** Module 2 (Fundamentals)
* **Learner Objective:** Master the translation between raw hex memory dumps, big-endian/little-endian byte ordering, signed integers, IEEE 754 floats, and packed bitfields.
* **Interactive Elements:**
  - **Hex Input Bar:** Accepts paste of raw hex strings (e.g. `08 1A 4F C3 41 48 00 00`).
  - **Bit Grid:** Interactive 64-bit matrix where clicking individual bits toggles 0 and 1 with micro-animations.
  - **Decoder Readout Cards:** Real-time synchronized conversion to:
    - Unsigned Int (8, 16, 32, 64-bit Big-Endian and Little-Endian).
    - Signed 2's Complement Int.
    - IEEE 754 Single & Double Precision Float.
    - Raw ASCII / UTF-8 string preview.
  - **Bitmask Slicer:** Sliders to isolate bit ranges (e.g., "Bits 3 to 13 = APID") with color-coded overlays.

---

### Tool 2: CCSDS Space Packet Header Decoder (CCSDS 133.0-B-2)
* **Location:** Module 3 (Space Link) & Module 10 (Reference / Labs)
* **Learner Objective:** Deconstruct the standard 6-octet (48-bit) Space Packet Primary Header and understand the length definition quirk.
* **Interactive Elements:**
  - **Hex Input / Sample Dropdown:** Presets for "Housekeeping Beacon", "Payload Science Burst", "Command Acceptance ACK", and "Idle Fill Packet".
  - **Exploded Header Visualizer:**
    - Packet Version Number (3 bits) $\rightarrow$ Expected `000` (Version 1).
    - Packet Type (1 bit) $\rightarrow$ `0` = Telemetry, `1` = Telecommand.
    - Secondary Header Flag (1 bit) $\rightarrow$ Indicates presence of mission time-tag header.
    - Application Process Identifier (APID) (11 bits) $\rightarrow$ Decoded decimal and subsystem name lookup table.
    - Sequence Flags (2 bits) $\rightarrow$ `01` First, `00` Continuation, `10` Last, `11` Unsegmented.
    - Packet Sequence Count (14 bits) $\rightarrow$ Rolling counter tracking continuity.
    - Packet Data Length (16 bits) $\rightarrow$ **The CCSDS Gotcha:** Live callout showing $\text{Total Octets} = \text{Header (6)} + (\text{Length Field} + 1)$.
  - **Interactive Error Injection:** Learner can flip a bit in the version or length field to trigger realistic parser validation warnings.

---

### Tool 3: Frame Synchronizer & Sync Marker (ASM) Visualizer
* **Location:** Module 3 (Space Link) & Module 8 (Troubleshooting)
* **Learner Objective:** Experience how a hardware/software frame synchronizer locks onto noisy bitstreams using the Attached Sync Marker (ASM `0x1ACFFC1D`).
* **Interactive Elements:**
  - **Noise Slider (Bit Error Rate $10^{-1}$ to $10^{-6}$):** Injects random bit flips into a continuous synthetic bitstream.
  - **Correlation Threshold Slider (Hamming Distance $0$ to $4$ bits):** Learner adjusts how many bit mismatches the synchronizer will accept before rejecting the marker.
  - **Synchronizer State Machine Graphic:**
    - Shows transitions: `SEARCH` $\rightarrow$ `CHECK` $\rightarrow$ `LOCK` $\rightarrow$ `FLYWHEEL`.
    - Live LED status indicators: Carrier Lock, Bit Lock, Frame Lock, Missed ASM Count, False Alarm Count.
  - **Bit Slip Experiment:** A toggle that inserts or deletes a single bit, demonstrating why byte-alignment is lost without frame-level resynchronization.

---

### Tool 4: Channel Coding & Error-Correction Sandbox (CCSDS 131.0-B-6)
* **Location:** Module 3 (Space Link)
* **Learner Objective:** Contrast the coding gain and operational behavior of Reed-Solomon $(255, 223)$, Convolutional $R=1/2$, Turbo, and modern LDPC codes.
* **Interactive Elements:**
  - **Code Selector:** Toggle between Uncoded, Reed-Solomon, Viterbi + RS (Concatenated), Turbo, and LDPC.
  - **Channel $E_b/N_0$ Slider (0 dB to 12 dB):** Move the signal quality slider and watch:
    - **Waterfall Bit Error Rate (BER) Curve:** An animated marker moves along the theoretical BER curve.
    - **Visual Data Corruption Canvas:** A mock satellite image transmitted over the noisy link is reconstructed in real time. At low $E_b/N_0$, uncorrected bit bursts appear as corrupted pixel blocks; as coding is enabled, error-free pixels snap into place!
    - **Decoder Telemetry Panel:** Shows "Corrected Byte Count", "Uncorrectable Frame Discard Count", and "Coding Gain (dB)".

---

### Tool 5: Telemetry Calibration & Engineering Units Sandbox
* **Location:** Module 5 (Operations)
* **Learner Objective:** Understand how raw digital counts (DN / ADC counts) from onboard analog sensors are converted into calibrated physical engineering values ($^\circ\text{C}$, $\text{V}$, $\text{A}$).
* **Interactive Elements:**
  - **Raw Count Input (8, 12, or 16-bit slider):** Change raw sensor reading ($0$ to $4095$).
  - **Calibration Model Selector:**
    - Linear: $y = ax + b$.
    - Polynomial (5th order): $y = \sum a_n x^n$ (typical for thermistors and platinum RTDs).
    - Piecewise Linear Spline interpolation.
  - **Real-Time Calibration Graph:** Displays the calibration curve with an interactive point tracking the current count.
  - **Limit Checking Simulator:** Configurable operational limits:
    - Soft Low / Soft High (Yellow Warning).
    - Hard Low / Hard High (Red Critical Alarm).
    - Out-of-Limits alert banner triggers when learner drags the slider into dangerous territory!

---

### Tool 6: COP-1 Telecommand & FARM-1 State Machine Simulator (CCSDS 232.1-B)
* **Location:** Module 5 (Operations)
* **Learner Objective:** Master the closed-loop, reliable telecommanding protocol that ensures commands are never lost or executed out of sequence.
* **Interactive Elements:**
  - **Interactive Dual Diagram:** Spacecraft Command Handling (FARM-1) on the left, Ground Mission Control (FOP-1) on the right.
  - **Command Sequence Controls:** Send individual Sequence-Controlled [AD] frames or Expedited [BD] frames.
  - **Simulated Link Drop:** Toggle "Drop Next Frame" to simulate uplink RF fade.
  - **State Inspector:**
    - Ground FOP: Transmitter Frame Sequence Number $V(S)$, Acknowledged Number $N(R)$, Wait Timers.
    - Spacecraft FARM: Receiver State Variable $V(R)$, CLCW (Command Link Control Word) telemetry feedback.
    - Watch the ground timeout fire, trigger an retransmission request, and recover the missing telecommand without operator intervention!

---

### Tool 7: Data Budget & Contact Capacity Calculator
* **Location:** Module 7 (Data & Capacity)
* **Learner Objective:** Calculate real-world daily data downlink volume taking into account orbit geometry, elevation masks, modulation order, framing overhead, and margin.
* **Interactive Elements:**
  - **Inputs:**
    - Orbit Type (LEO 500 km SSO, MEO, GEO).
    - Ground Station Network (e.g. KSAT 3 polar passes, Leaf Space mid-lat passes, or custom).
    - Pass Elevation Mask ($5^\circ$, $10^\circ$, $15^\circ$).
    - Configured Downlink RF Rate (e.g. 50 Mbps X-band).
    - Protocol & Coding Overhead % (CCSDS framing, Reed-Solomon, ASM, CADU idle fill).
    - Operational Setup & Loss Margin (loss of lock at acquisition of signal / loss of signal).
  - **Outputs (Live Charts):**
    - Effective Usable Pass Time (minutes per pass and passes per day).
    - Net Delivered Application Data Volume (GiB/day vs. GB/day toggle with clear binary explanation).
    - Backlog Drain Rate: Visualizes whether onboard flash memory is accumulating or successfully emptying over successive orbits.

---

### Tool 8: Interactive Ground-to-Space End-to-End Walkthrough
* **Location:** Module 1 (Start Here) & Module 4 (Ground Segment)
* **Learner Objective:** Trace an end-to-end signal across the complete chain with zoomable sub-system diagrams.
* **Interactive Elements:**
  - **Direction Toggle:** "Downlink: Sensor $\rightarrow$ MOC" vs. "Uplink: Operator Intent $\rightarrow$ Spacecraft Actuator".
  - **Stage Highlighting:** Clicking any block (e.g. "Low Noise Amplifier", "Frame Synchronizer", "CCSDS Packetizer", "GSaaS WAN Gateway") highlights:
    - What protocol data unit (PDU) exists at this interface.
    - Typical latency and buffering delays.
    - What telemetry or error counters an engineer sees on console if this specific component fails.

---

### Tool 9: Interactive Troubleshooting & Anomaly Decision Tree
* **Location:** Module 8 (Troubleshooting)
* **Learner Objective:** Practice structured fault isolation during a real-time pass scenario using realistic simulated station logs.
* **Interactive Elements:**
  - **Scenario Launcher:** Choose from realistic operational emergencies:
    - *Scenario A:* "Valid Carrier Detected, But No Frame Lock".
    - *Scenario B:* "Frame Lock OK, But Missing Packet Sequence Counts".
    - *Scenario C:* "Telecommand Radiated, But No Execution Telemetry".
    - *Scenario D:* "Station Reports Pass Complete, But Zero Telemetry in MOC Archive".
  - **Diagnostic Terminal:** Learners click diagnostic questions (e.g., "Check Demodulator Lock", "Inspect Ground Station Spectrum Analyzer", "Query Provider API Pass Status").
  - **Interactive Log Viewer:** Terminal updates with simulated hex logs and ground status words.
  - **Hypothesis Scoring:** The user selects the root cause (e.g., "Mismatched ASM Polarity", "Clock Jitter causing bit slips", "FARM sliding window lockup", "Ground WAN VPN drop") and receives instant feedback with the exact technical rationale.

---

## 3. Implementation Blueprint for Design & Development

1. **Penpot Design System Integration:**
   - Define designated UI canvas slots for interactive embeds (16:9 responsive aspect ratio, card container with clean borders, header toolbar with "Preset", "Reset", and "Export Log" actions).
2. **Web Technology Selection:**
   - Built with modern vanilla JavaScript / TypeScript and HTML5 `<canvas>` / SVG for crisp 60fps rendering without heavyweight external framework overhead.
   - Clean modular architecture: each tool encapsulated in a standalone, testable component with zero telemetry or tracking.
