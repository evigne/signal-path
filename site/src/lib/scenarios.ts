// Scripted anomaly scenarios for Tool 9 (content/labs/anomaly-decision-tree.yaml).
// All logs, values and times are fictional. Each test names the tree layer it probes;
// `lowValue` marks tests at layers the opening evidence already proves healthy.

export type Test = { name: string; layer: number; log: string[]; lowValue?: boolean };
export type Hypothesis = { text: string; correct: boolean; why: string };
export type Scenario = {
  id: string;
  title: string;
  tree: 'downlink' | 'uplink';
  opening: string[];
  healthy: string;
  firstBad: number; // layer index in the scenario's tree
  tests: Test[];
  hypotheses: Hypothesis[];
  keyEvidence: number; // index of the decisive test
  learn: { href: string; label: string };
};

const LOW = 'already proven healthy by the opening evidence';

export const SCENARIOS: Scenario[] = [
  {
    id: 'carrier-but-no-frame-lock',
    title: 'A · Carrier detected, but no frame lock',
    tree: 'downlink',
    opening: ['09:12:00Z AOS  EL 6.2°', '09:12:04Z ALARM frame sync not achieved after 60 s'],
    healthy: 'Schedule, station and RF acquisition (the station has carrier).',
    firstBad: 4,
    tests: [
      { name: 'Query provider pass status', layer: 1, lowValue: true, log: ['09:12:40Z INFO provider: pass active, configuration v12 as scheduled'] },
      { name: 'Check spectrum analyzer', layer: 2, lowValue: true, log: ['09:12:35Z INFO spectrum: carrier at expected frequency, clean'] },
      { name: 'Check demodulator lock states', layer: 3, log: ['09:12:04Z INFO carrier lock: LOCK  Eb/N0 = 9.1 dB', '09:12:05Z INFO symbol lock: LOCK'] },
      { name: 'Inspect frame synchronizer status', layer: 4, log: ['09:12:05Z WARN frame sync: SEARCH  ASM matches 0/120'] },
      { name: 'Compare ASM configuration', layer: 4, log: ['09:12:30Z INFO config: ASM 1ACFFC1D, polarity normal, ambiguity resolution OFF'] },
      { name: 'Capture raw bit dump', layer: 4, log: ['09:12:31Z INFO raw dump: … E5 30 03 E2 … (repeats every frame)'] },
    ],
    hypotheses: [
      { text: 'Inverted bitstream: marker polarity / phase ambiguity', correct: true, why: 'Carrier and symbol lock are fine, so RF and demodulation work. The raw dump repeats E5 30 03 E2 — the bitwise inverse of 1ACFFC1D — so the stream is inverted (a 180° phase ambiguity). Fix: enable polarity or ambiguity resolution in the synchronizer.' },
      { text: 'Clock jitter causing bit slips', correct: false, why: 'Bit slips would show markers found and then lost; here no marker is ever matched, but its inverse repeats exactly.' },
      { text: 'FARM-1 in Lockout', correct: false, why: 'FARM-1 is the spacecraft’s command receiver; it cannot affect downlink frame sync.' },
      { text: 'Ground WAN/VPN drop', correct: false, why: 'Frame sync happens at the station, before any network delivery.' },
    ],
    keyEvidence: 5,
    learn: { href: '/topics/sync-markers/', label: 'Sync markers' },
  },
  {
    id: 'frame-lock-with-errors',
    title: 'B · Frame lock, but errors and gaps',
    tree: 'downlink',
    opening: ['14:20:00Z AOS  EL 5.0°', '14:20:03Z INFO frame sync: LOCK', '14:21:10Z WARN R-S uncorrectable codewords rising; VC0 frame-count gaps'],
    healthy: 'Schedule, station, RF acquisition, carrier/symbol lock and frame sync (frames are locking).',
    firstBad: 5,
    tests: [
      { name: 'Query provider pass status', layer: 1, lowValue: true, log: ['14:22:00Z INFO provider: pass active, configuration v12 as scheduled'] },
      { name: 'Inspect frame synchronizer status', layer: 4, lowValue: true, log: ['14:22:05Z INFO frame sync: LOCK  flywheel events 3 (all at EL < 10°)'] },
      { name: 'Plot Eb/N0 against elevation', layer: 3, log: ['14:20:30Z INFO EL 8.9°  Eb/N0 3.1 dB (required 2.6 dB)', '14:25:00Z INFO EL 41.7°  Eb/N0 8.7 dB', '14:29:20Z INFO EL 8.5°  Eb/N0 3.0 dB'] },
      { name: 'Read decoder counters per minute', layer: 5, log: ['14:20–14:21Z RS uncorrectable 37/min  (EL 5–9°)', '14:22–14:28Z RS uncorrectable 0/min  (EL 12–48°)', '14:29–14:30Z RS uncorrectable 29/min  (EL 9–5°)'] },
      { name: 'Compare decoder configuration with the ICD', layer: 5, log: ['14:23:00Z INFO config: RS(255,223) E=16, interleave I=5, randomizer ON — matches ICD v4'] },
      { name: 'Check VC0 gap times', layer: 6, log: ['14:31:00Z INFO VC0 gaps 14 — all within the first and last 90 s of the pass'] },
    ],
    hypotheses: [
      { text: 'Link margin runs out at low elevation (Eb/N0 fade)', correct: true, why: 'Errors and gaps appear only at the edges of the pass, where Eb/N0 falls to within about 0.5 dB of the requirement; mid-pass the counters are zero and the configuration matches the ICD. This is geometry, not a fault. Options: raise the data elevation mask, lower the rate near the horizon, or accept the edge losses and replay.' },
      { text: 'Wrong R-S interleaving depth configured', correct: false, why: 'A wrong interleaving depth would make nearly every codeword uncorrectable for the whole pass, and the configuration matches the ICD.' },
      { text: 'Wrong sync marker', correct: false, why: 'Frame sync is locked; a wrong marker would prevent lock entirely.' },
      { text: 'Onboard recorder corruption', correct: false, why: 'Recorder corruption would not follow elevation, and real-time frames show the same pattern.' },
    ],
    keyEvidence: 3,
    learn: { href: '/topics/link-budgets/', label: 'Link budgets and margin' },
  },
  {
    id: 'packets-missing-frames-ok',
    title: 'C · Frames fine, science packets missing',
    tree: 'downlink',
    opening: ['08:45:00Z INFO VC0 frames continuous, FECF errors 0', '08:46:00Z ALARM science display (APID 0x2C0) stale since 08:40Z'],
    healthy: 'Everything up to the virtual channel on VC0: frames arrive cleanly.',
    firstBad: 6,
    tests: [
      { name: 'Check demodulator lock states', layer: 3, lowValue: true, log: ['08:46:10Z INFO carrier, symbol and frame lock: LOCK'] },
      { name: 'Read decoder counters', layer: 5, lowValue: true, log: ['08:46:12Z INFO RS uncorrectable 0, FECF errors 0'] },
      { name: 'Count frames per virtual channel', layer: 6, log: ['08:46:20Z INFO VC0 18402→19020 continuous', '08:46:20Z WARN VC1 0 frames this pass (expected ≈ 600)'] },
      { name: 'Count packets per APID', layer: 7, log: ['08:46:25Z INFO APID 0x07E housekeeping: fresh', '08:46:25Z WARN APID 0x2C0 science: 0 packets'] },
      { name: 'Read onboard event log (VC0 housekeeping)', layer: 7, log: ['08:39:58Z EVT TM_ROUTE: table 3 loaded — VC1 output disabled'] },
      { name: 'Check ground extractor configuration', layer: 8, log: ['08:46:40Z INFO extractor accepts VC0, VC1; database v12 unchanged'] },
    ],
    hypotheses: [
      { text: 'Onboard routing change stopped VC1 (science) frames', correct: true, why: 'VC0 is perfect and housekeeping is fresh, so the link and ground are fine. VC1 carries no frames at all, and the onboard event log shows a routing table that disabled VC1 output two minutes before the display went stale. The first bad layer is the virtual channel — caused onboard. Next: flight team reviews the table load.' },
      { text: 'Low Eb/N0 at low elevation', correct: false, why: 'VC0 has zero errors throughout; a fade would hit both virtual channels.' },
      { text: 'Calibration error in the telemetry database', correct: false, why: 'A calibration error gives wrong values, not missing packets.' },
      { text: 'SLE delivery dropped', correct: false, why: 'VC0 frames are being delivered continuously over the same service.' },
    ],
    keyEvidence: 4,
    learn: { href: '/topics/packets-vs-frames-postal-analogy/', label: 'Packets and frames' },
  },
  {
    id: 'command-radiated-no-execution',
    title: 'D · Command radiated, not executed',
    tree: 'uplink',
    opening: ['10:04:12Z INFO station: CLTU #812 radiated', '10:04:40Z ALARM command counter unchanged; FOP-1 retransmitting'],
    healthy: 'Command system, ground network and station transmitter (the station reports the CLTU radiated).',
    firstBad: 4,
    tests: [
      { name: 'Check SLE Forward CLTU status', layer: 1, lowValue: true, log: ['10:04:13Z INFO FCLTU #812 radiation started → radiated'] },
      { name: 'Read station transmitter log', layer: 2, lowValue: true, log: ['10:04:12Z INFO uplink carrier ON, sweep complete, CLTU #812 radiated'] },
      { name: 'Read CLCW RF and bit-lock flags', layer: 3, log: ['10:04:20Z INFO CLCW VC1 NoRF=0 NoBitLock=0'] },
      { name: 'Read CLCW FARM flags', layer: 4, log: ['10:04:20Z WARN CLCW VC1 Lockout=1 Wait=0 Retransmit=1 N(R)=36'] },
      { name: 'Read FOP-1 log', layer: 0, log: ['10:01:55Z INFO FOP-1 re-initialised after command-system restart; V(S)=52', '10:04:12Z INFO AD frame N(S)=52 sent'] },
      { name: 'Check onboard command rejection counter', layer: 5, log: ['10:04:45Z INFO cmd reject count 0 (no command reached execution)'] },
    ],
    hypotheses: [
      { text: 'FARM-1 Lockout: frame arrived outside the FARM window after a ground V(S) jump', correct: true, why: 'The spacecraft hears the uplink (NoRF=0, NoBitLock=0) but the CLCW shows Lockout with N(R)=36, while the ground restarted at V(S)=52 — outside the FARM positive window. Commanding on VC1 stops until a BD Unlock directive (and a Set V(R) to resynchronise). See the COP-1 simulator.' },
      { text: 'Uplink never radiated', correct: false, why: 'The station and the forward service both report the CLTU radiated, and the CLCW shows RF present.' },
      { text: 'Spacecraft receiver not in lock', correct: false, why: 'NoBitLock=0 means the receiver has bit lock.' },
      { text: 'Command rejected by an onboard constraint', correct: false, why: 'The rejection counter is 0 and N(R) is not advancing: the frame never got past FARM-1 to execution.' },
    ],
    keyEvidence: 3,
    learn: { href: '/labs/cop1-farm-simulator/', label: 'COP-1 simulator' },
  },
];

export const LOW_VALUE_REASON = LOW;
