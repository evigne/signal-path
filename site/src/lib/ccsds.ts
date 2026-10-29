// Pure decoders for CCSDS headers used by the labs. Bit 0 is the first transmitted,
// most significant bit (CCSDS 133.0-B-2 §1.6.3). No mission data lives here.

export function parseHex(input: string): Uint8Array {
  const clean = input.replace(/0x/gi, '').replace(/[^0-9a-f]/gi, '');
  if (clean.length % 2 !== 0) throw new Error('Hex input needs an even number of digits');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');

/** Read `len` bits starting at bit `start` (bit 0 = MSB of byte 0). Up to 53 bits. */
export function bits(bytes: Uint8Array, start: number, len: number): number {
  let v = 0;
  for (let i = 0; i < len; i++) {
    const b = start + i;
    const bit = (bytes[b >> 3] >> (7 - (b & 7))) & 1;
    v = v * 2 + bit;
  }
  return v;
}

export const bitString = (bytes: Uint8Array, start: number, len: number) =>
  Array.from({ length: len }, (_, i) => {
    const b = start + i;
    return ((bytes[b >> 3] >> (7 - (b & 7))) & 1).toString();
  }).join('');

export type Field = { name: string; start: number; len: number; value: number; meaning: string };

export const SEQ_FLAGS = ['continuation segment', 'first segment', 'last segment', 'unsegmented'] as const;

/** Space Packet primary header (CCSDS 133.0-B-2 §4.1.3). */
export function decodeSpacePacket(bytes: Uint8Array) {
  if (bytes.length < 6) throw new Error('A Space Packet primary header is 6 octets');
  const version = bits(bytes, 0, 3);
  const type = bits(bytes, 3, 1);
  const secHdr = bits(bytes, 4, 1);
  const apid = bits(bytes, 5, 11);
  const seqFlags = bits(bytes, 16, 2);
  const seqCount = bits(bytes, 18, 14);
  const dataLength = bits(bytes, 32, 16);
  const dataFieldOctets = dataLength + 1;
  const totalOctets = 6 + dataFieldOctets;
  const idle = apid === 0x7ff;
  const warnings: string[] = [];
  if (version !== 0) warnings.push('Packet Version Number is not 000: a parser rejects this packet.');
  if (idle && secHdr === 1) warnings.push('Idle Packets must not have a secondary header.');
  const fields: Field[] = [
    { name: 'Packet version number', start: 0, len: 3, value: version, meaning: version === 0 ? 'Version 1 Space Packet (000)' : 'Not a valid Space Packet' },
    { name: 'Packet type', start: 3, len: 1, value: type, meaning: type ? 'telecommand' : 'telemetry' },
    { name: 'Secondary header flag', start: 4, len: 1, value: secHdr, meaning: secHdr ? 'present' : 'absent' },
    { name: 'APID', start: 5, len: 11, value: apid, meaning: idle ? 'Idle Packet (all ones)' : `0x${apid.toString(16).toUpperCase().padStart(3, '0')}` },
    { name: 'Sequence flags', start: 16, len: 2, value: seqFlags, meaning: SEQ_FLAGS[seqFlags] },
    { name: type ? 'Sequence count or name' : 'Packet sequence count', start: 18, len: 14, value: seqCount, meaning: `${seqCount} (modulo 16,384, per APID)` },
    { name: 'Packet data length', start: 32, len: 16, value: dataLength, meaning: `${dataLength} → ${dataFieldOctets}-octet data field → ${totalOctets}-octet packet` },
  ];
  return { version, type, secHdr, apid, seqFlags, seqCount, dataLength, dataFieldOctets, totalOctets, idle, warnings, fields };
}

/** TM transfer frame primary header (CCSDS 132.0-B-3 §4.1.2). */
export function decodeTmHeader(bytes: Uint8Array) {
  if (bytes.length < 6) throw new Error('A TM primary header is 6 octets');
  return {
    version: bits(bytes, 0, 2),
    scid: bits(bytes, 2, 10),
    vcid: bits(bytes, 12, 3),
    ocf: bits(bytes, 15, 1),
    mcfc: bits(bytes, 16, 8),
    vcfc: bits(bytes, 24, 8),
    secHdr: bits(bytes, 32, 1),
    sync: bits(bytes, 33, 1),
    packetOrder: bits(bytes, 34, 1),
    segLenId: bits(bytes, 35, 2),
    fhp: bits(bytes, 37, 11),
  };
}

/** TC transfer frame primary header (CCSDS 232.0-B-4 §4.1.2). */
export function decodeTcHeader(bytes: Uint8Array) {
  if (bytes.length < 5) throw new Error('A TC primary header is 5 octets');
  const frameLength = bits(bytes, 22, 10);
  return {
    version: bits(bytes, 0, 2),
    bypass: bits(bytes, 2, 1),
    controlCommand: bits(bytes, 3, 1),
    scid: bits(bytes, 6, 10),
    vcid: bits(bytes, 16, 6),
    frameLength,
    totalOctets: frameLength + 1,
    ns: bits(bytes, 32, 8),
  };
}

/** Per-APID sequence gap, modulo 16,384. Returns packets missing between prev and next. */
export const seqGap = (prev: number, next: number) => ((next - prev + 16384) % 16384) - 1;

/** Typed views over raw bytes for the bit/byte inspector. */
export function views(bytes: Uint8Array, offset: number, littleEndian: boolean) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const has = (n: number) => offset + n <= bytes.length;
  return {
    uint16: has(2) ? dv.getUint16(offset, littleEndian) : null,
    int16: has(2) ? dv.getInt16(offset, littleEndian) : null,
    uint32: has(4) ? dv.getUint32(offset, littleEndian) : null,
    int32: has(4) ? dv.getInt32(offset, littleEndian) : null,
    float32: has(4) ? dv.getFloat32(offset, littleEndian) : null,
    float64: has(8) ? dv.getFloat64(offset, littleEndian) : null,
  };
}

const f = (bytes: Uint8Array, name: string, start: number, len: number, meaning: (v: number) => string): Field => {
  const value = bits(bytes, start, len);
  return { name, start, len, value, meaning: meaning(value) };
};

/** TM primary header as display fields (CCSDS 132.0-B-3 §4.1.2). */
export function tmFields(bytes: Uint8Array): Field[] {
  if (bytes.length < 6) throw new Error('A TM primary header is 6 octets');
  return [
    f(bytes, 'Transfer frame version', 0, 2, (v) => (v === 0 ? 'Version 1 (00)' : 'Not a TM frame')),
    f(bytes, 'Spacecraft ID', 2, 10, (v) => `${v} (0x${v.toString(16).toUpperCase()})`),
    f(bytes, 'Virtual channel ID', 12, 3, (v) => `VC${v}`),
    f(bytes, 'OCF flag', 15, 1, (v) => (v ? 'OCF present (e.g. CLCW)' : 'no OCF')),
    f(bytes, 'Master channel frame count', 16, 8, (v) => `${v} (mod 256)`),
    f(bytes, 'Virtual channel frame count', 24, 8, (v) => `${v} (mod 256, per VC)`),
    f(bytes, 'Secondary header flag', 32, 1, (v) => (v ? 'present' : 'absent')),
    f(bytes, 'Synchronization flag', 33, 1, (v) => (v ? 'octet-synchronized data (no packets)' : 'packets')),
    f(bytes, 'Packet order flag', 34, 1, (v) => String(v)),
    f(bytes, 'Segment length ID', 35, 2, (v) => (v === 3 ? '11 (required when sync flag is 0)' : String(v))),
    f(bytes, 'First header pointer', 37, 11, (v) => (v === 0x7ff ? 'no packet starts in this frame' : v === 0x7fe ? 'only idle data' : `first packet starts at data octet ${v}`)),
  ];
}

/** TC primary header as display fields (CCSDS 232.0-B-4 §4.1.2). */
export function tcFields(bytes: Uint8Array): Field[] {
  if (bytes.length < 5) throw new Error('A TC primary header is 5 octets');
  return [
    f(bytes, 'Transfer frame version', 0, 2, (v) => (v === 0 ? 'Version 1 (00)' : 'Not a TC frame')),
    f(bytes, 'Bypass flag', 2, 1, (v) => (v ? 'Type-B (bypass FARM checks)' : 'Type-A (sequence-controlled)')),
    f(bytes, 'Control command flag', 3, 1, (v) => (v ? 'control command (directive)' : 'data')),
    f(bytes, 'Reserved spare', 4, 2, (v) => String(v)),
    f(bytes, 'Spacecraft ID', 6, 10, (v) => `${v} (0x${v.toString(16).toUpperCase()})`),
    f(bytes, 'Virtual channel ID', 16, 6, (v) => `VC${v}`),
    f(bytes, 'Frame length', 22, 10, (v) => `${v} → ${v + 1}-octet frame`),
    f(bytes, 'Frame sequence number N(S)', 32, 8, (v) => `${v} (mod 256)`),
  ];
}

/** Communications Link Control Word (CCSDS 232.0-B-4 §4.2.1). */
export function clcwFields(bytes: Uint8Array): Field[] {
  if (bytes.length < 4) throw new Error('A CLCW is 4 octets');
  const flag = (on: string, off: string) => (v: number) => (v ? on : off);
  return [
    f(bytes, 'Control word type', 0, 1, (v) => (v === 0 ? 'CLCW (0)' : 'not a CLCW')),
    f(bytes, 'CLCW version', 1, 2, (v) => String(v)),
    f(bytes, 'Status field', 3, 3, (v) => `${v} (mission-defined)`),
    f(bytes, 'COP in effect', 6, 2, (v) => (v === 1 ? 'COP-1' : String(v))),
    f(bytes, 'Virtual channel ID', 8, 6, (v) => `VC${v}`),
    f(bytes, 'Reserved spare', 14, 2, (v) => String(v)),
    f(bytes, 'No RF available', 16, 1, flag('no RF', 'RF available')),
    f(bytes, 'No bit lock', 17, 1, flag('no bit lock', 'bit lock')),
    f(bytes, 'Lockout', 18, 1, flag('LOCKOUT', 'no lockout')),
    f(bytes, 'Wait', 19, 1, flag('WAIT', 'no wait')),
    f(bytes, 'Retransmit', 20, 1, flag('retransmit requested', 'no retransmit')),
    f(bytes, 'FARM-B counter', 21, 2, (v) => String(v)),
    f(bytes, 'Reserved spare', 23, 1, (v) => String(v)),
    f(bytes, 'Report value N(R)', 24, 8, (v) => `next expected frame ${v}`),
  ];
}
