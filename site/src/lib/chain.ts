// Stage data for the end-to-end walkthrough (Tool 8) and the layered decision tree
// (Tool 9). Owners and data units describe the common CCSDS shape (CCSDS 130.0-G-4);
// who operates each stage is mission-specific.

export type Stage = {
  id: string;
  org: string;
  title: string;
  dataIn: string;
  dataOut: string;
  owner: string;
  healthy: string;
  failure: string;
  topic: string;
  symptom?: string;
};

export const DOWNLINK: Stage[] = [
  { id: 'd-packetize', org: 'Spacecraft', title: 'Packetize & frame', dataIn: 'parameters', dataOut: 'Space Packets in TM frames', owner: 'Flight software', healthy: 'Per-APID sequence counts continuous', failure: 'An APID stops or gaps while frames flow', topic: 'space-packet-protocol', symptom: 'packets-missing-frames-ok' },
  { id: 'd-code', org: 'Spacecraft', title: 'Code & transmit', dataIn: 'frames', dataOut: 'CADUs on an RF carrier', owner: 'Spacecraft communications subsystem', healthy: 'Carrier present at the expected frequency', failure: 'No carrier: transmitter off, wrong mode or pointing', topic: 'channel-coding', symptom: 'no-carrier' },
  { id: 'd-station', org: 'Ground station', title: 'Demodulate & decode', dataIn: 'RF signal', dataOut: 'frames (CADUs decoded)', owner: 'Ground station provider; configuration agreed with the mission', healthy: 'Carrier, symbol and frame lock; low uncorrectable count', failure: 'Carrier but no frame lock: marker, coding or randomizer settings', topic: 'sync-markers', symptom: 'carrier-but-no-frame-lock' },
  { id: 'd-network', org: 'Provider network', title: 'Deliver to mission', dataIn: 'frames', dataOut: 'frames or files over SLE or a provider interface', owner: 'Provider and ground network team', healthy: 'Delivery session active for the whole pass', failure: 'Lock at the station, no data at mission control', topic: 'sle-transfer-services', symptom: 'pass-done-data-missing' },
  { id: 'd-moc', org: 'Mission control', title: 'Process & display', dataIn: 'frames', dataOut: 'calibrated telemetry, archive', owner: 'Mission ground software and database owners', healthy: 'Parameters fresh, values plausible', failure: 'Packets arrive but values are wrong', topic: 'telemetry-lifecycle', symptom: 'packets-present-values-invalid' },
];

export const UPLINK: Stage[] = [
  { id: 'u-moc', org: 'Mission control', title: 'Validate & send', dataIn: 'operator command', dataOut: 'TC packets in TC frames', owner: 'Flight operations and command system', healthy: 'Constraints pass; COP-1 in S1', failure: 'Command blocked or significance confirmation missing', topic: 'command-lifecycle' },
  { id: 'u-network', org: 'Provider network', title: 'Route to station', dataIn: 'command frames / CLTUs', dataOut: 'CLTUs at the station', owner: 'Provider and ground network team', healthy: 'Forward service bound and started', failure: 'CLTUs rejected (sequence number) or never radiated', topic: 'sle-transfer-services' },
  { id: 'u-station', org: 'Ground station', title: 'Modulate & transmit', dataIn: 'CLTUs', dataOut: 'RF uplink', owner: 'Ground station provider', healthy: 'Transmitter on, sweep complete', failure: 'Spacecraft never locks the uplink (CLCW No RF / No Bit Lock)', topic: 'uplink-and-downlink', symptom: 'command-radiated-no-execution' },
  { id: 'u-sc-rx', org: 'Spacecraft', title: 'Receive & decode', dataIn: 'RF signal', dataOut: 'TC frames', owner: 'Spacecraft communications subsystem', healthy: 'Bit lock; frames pass validation', failure: 'Lockout or Wait in the CLCW', topic: 'tc-space-data-link-protocol', symptom: 'command-radiated-no-execution' },
  { id: 'u-sc-exec', org: 'Spacecraft', title: 'Accept & execute', dataIn: 'frames', dataOut: 'executed commands', owner: 'Flight software', healthy: 'Execution verifier passes', failure: 'Accepted but rejected onboard (mode, constraint, argument)', topic: 'command-lifecycle', symptom: 'command-radiated-no-execution' },
];

export type TreeNode = { layer: string; question: string; no: { text: string; href: string }; topic: string };

// Layered decision tree for "telemetry missing, late or corrupt" (the Penpot tree).
export const TREE: TreeNode[] = [
  { layer: 'Schedule & configuration', question: 'Was the pass scheduled with the expected configuration version?', no: { text: 'Fix the schedule or configuration; compare versions', href: '/topics/ground-stations-and-networks/' }, topic: 'ground-stations-and-networks' },
  { layer: 'Ground station / provider', question: 'Did the station report the pass as executed?', no: { text: 'Ask the provider for the pass report', href: '/topics/ground-stations-and-networks/' }, topic: 'ground-stations-and-networks' },
  { layer: 'RF acquisition', question: 'Was a carrier acquired at the expected frequency?', no: { text: 'Symptom guide: No carrier', href: '/symptoms/no-carrier/' }, topic: 'rf-basics' },
  { layer: 'Carrier, symbol & bit sync', question: 'Did symbol and bit lock hold through the pass?', no: { text: 'Check link quality, Doppler and pointing', href: '/topics/carrier-and-symbol-sync/' }, topic: 'carrier-and-symbol-sync' },
  { layer: 'Frame sync', question: 'Is frame lock stable?', no: { text: 'Symptom guide: Carrier but no frame lock', href: '/symptoms/carrier-but-no-frame-lock/' }, topic: 'sync-markers' },
  { layer: 'Channel decoding', question: 'Are uncorrectable codeword counts low?', no: { text: 'Symptom guide: Frame lock with errors', href: '/symptoms/frame-lock-with-errors/' }, topic: 'channel-coding' },
  { layer: 'Virtual channel', question: 'Are frames arriving on the expected virtual channels with continuous counts?', no: { text: 'Check VC configuration and frame counters', href: '/topics/tm-space-data-link-protocol/' }, topic: 'tm-space-data-link-protocol' },
  { layer: 'Packet extraction', question: 'Are expected APIDs present with continuous sequence counts?', no: { text: 'Symptom guide: Packets missing but frames fine', href: '/symptoms/packets-missing-frames-ok/' }, topic: 'space-packet-protocol' },
  { layer: 'Telemetry definition & time', question: 'Do values decode with valid time and quality?', no: { text: 'Symptom guide: Packets present, values invalid', href: '/symptoms/packets-present-values-invalid/' }, topic: 'telemetry-and-command-databases' },
  { layer: 'Application, C2 & archive', question: 'Is the data visible in displays and the archive?', no: { text: 'Symptom guide: Pass done, data late or incomplete', href: '/symptoms/pass-done-data-missing/' }, topic: 'sle-transfer-services' },
];
