// Every worked example in the content is a test: if a tool disagrees with a topic page,
// the build fails. Values are fictional and come from content/topics and content/labs.
import { describe, expect, it } from 'vitest';
import { decodeSpacePacket, decodeTcHeader, decodeTmHeader, parseHex, seqGap, views, bits } from '../../src/lib/ccsds';
import { computeBudget, DEFAULTS } from '../../src/lib/budget';

describe('Space Packet Protocol (space-packet-protocol worked example)', () => {
  it('decodes 08 7E C4 12 00 3F', () => {
    const p = decodeSpacePacket(parseHex('08 7E C4 12 00 3F'));
    expect(p).toMatchObject({ version: 0, type: 0, secHdr: 1, apid: 126, seqFlags: 3, seqCount: 1042, dataLength: 63, dataFieldOctets: 64, totalOctets: 70 });
    expect(p.warnings).toEqual([]);
  });
  it('decodes the telecommand preset 18 2A C0 07 00 09', () => {
    expect(decodeSpacePacket(parseHex('182AC0070009'))).toMatchObject({ type: 1, secHdr: 1, apid: 42, seqCount: 7, dataFieldOctets: 10 });
  });
  it('recognises the idle packet 07 FF C0 00 00 03', () => {
    expect(decodeSpacePacket(parseHex('07FFC0000003'))).toMatchObject({ idle: true, apid: 2047, secHdr: 0, totalOctets: 10 });
  });
  it('flags a non-zero version', () => {
    expect(decodeSpacePacket(parseHex('287EC412003F')).warnings[0]).toMatch(/not 000/);
  });
  it('counts a sequence gap modulo 16384', () => {
    expect(seqGap(1042, 1044)).toBe(1);
    expect(seqGap(16383, 0)).toBe(0);
  });
});

describe('TM and TC headers', () => {
  it('decodes TM 0A B5 2A 11 18 00', () => {
    expect(decodeTmHeader(parseHex('0AB52A111800'))).toMatchObject({ version: 0, scid: 171, vcid: 2, ocf: 1, mcfc: 42, vcfc: 17, segLenId: 3, fhp: 0 });
  });
  it('decodes TC 00 2A 04 13 25', () => {
    expect(decodeTcHeader(parseHex('002A041325'))).toMatchObject({ bypass: 0, controlCommand: 0, scid: 42, vcid: 1, frameLength: 19, totalOctets: 20, ns: 37 });
  });
});

describe('Bit/byte inspector (Tool 1)', () => {
  const b = parseHex('41 48 00 00 08 7E C4 12');
  it('reads big-endian values', () => {
    const v = views(b, 0, false);
    expect(v.float32).toBe(12.5);
    expect(v.uint32).toBe(1095237632);
    expect(views(b, 6, false).int16).toBe(-15342);
    expect(views(b, 6, false).uint16).toBe(50194);
  });
  it('slices the APID from bytes 4–5', () => {
    expect(bits(b, 32 + 5, 11)).toBe(0x7e);
  });
});

describe('Data budget (Tool 7 defaults)', () => {
  const r = computeBudget(DEFAULTS);
  it('matches the calculator screen', () => {
    expect(r.usable).toBe(540);
    expect(r.raw).toBeCloseTo(135.0, 1);
    expect(r.afterFraming).toBeCloseTo(124.2, 1);
    expect(r.afterRetrans).toBeCloseTo(118.0, 1);
    expect(r.perPass).toBeCloseTo(106.2, 1);
    expect(r.perPassMiB).toBeCloseTo(101.3, 1);
    expect(r.perDay).toBeCloseTo(424.8, 1);
    expect(r.balance).toBeCloseTo(64.8, 1);
  });
  it('matches the scenarios', () => {
    expect(computeBudget({ ...DEFAULTS, passSeconds: 480 }).perPass).toBeCloseTo(82.6, 1);
    expect(computeBudget({ ...DEFAULTS, rateMbps: 1.0 }).perPass).toBeCloseTo(53.1, 1);
    expect(computeBudget({ ...DEFAULTS, passesPerDay: 3 }).balance).toBeCloseTo(-41.4, 1);
    expect(computeBudget({ ...DEFAULTS, generationMBPerDay: 460 }).balance).toBeCloseTo(-35.2, 1);
  });
  it('drains the 300 MB backlog by day 6', () => {
    expect(r.backlog.slice(0, 5).map(Math.round)).toEqual([300, 235, 170, 106, 41]);
    expect(r.backlog[5]).toBe(0);
  });
});
