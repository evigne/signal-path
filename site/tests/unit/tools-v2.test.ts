import { describe, expect, it } from 'vitest';
import { codeInfo, rsDecode, spreadBurst } from '../../src/lib/coding';
import { maskAngleDeg, passDurationS, passPoint } from '../../src/lib/orbit';
import { init, sendAD, timerExpiry, windowZone } from '../../src/lib/cop1';
import { clcwFields, parseHex, tcFields, tmFields } from '../../src/lib/ccsds';
import { DOWNLINK, UPLINK } from '../../src/lib/chain';

describe('Tool 4 coding model (channel-coding-sandbox lab)', () => {
  it('uses the gains stated in CCSDS 130.1-G-3 §3.3.3', () => {
    expect(codeInfo('conv').gain?.db).toBe(5.5);
    expect(codeInfo('concat').gain?.db).toBe(7.5);
    expect(codeInfo('turbo').gain?.db).toBe(9.0);
    expect(codeInfo('rs').gain).toBeUndefined();
  });
  it('corrects 16, fails at 17 (E = 16)', () => {
    expect(rsDecode(16, 16, 16).ok).toBe(true);
    expect(rsDecode(17, 16, 16)).toEqual({ ok: false, reason: 'cliff' });
  });
  it('a 20-symbol burst fails at depth 1 and is corrected at depth 2', () => {
    expect(spreadBurst(20, 1)).toEqual([20]);
    expect(spreadBurst(20, 2)).toEqual([10, 10]);
  });
  it('a decoder set to E = 8 fails every codeword even without errors', () => {
    expect(rsDecode(0, 16, 8)).toEqual({ ok: false, reason: 'config' });
  });
});

describe('orbital pass model (home hero, why-space-links-are-different)', () => {
  it('550 km overhead pass above a 5° mask lasts about 9.8 minutes', () => {
    expect(passDurationS(550, 5) / 60).toBeCloseTo(9.8, 1);
  });
  it('is about 2200 km away at the 5° mask and 550 km overhead', () => {
    expect(passPoint(maskAngleDeg(550, 5), 550).rangeKm).toBeCloseTo(2205, -1);
    expect(passPoint(0, 550).rangeKm).toBeCloseTo(550, 3);
  });
  it('Doppler is positive while approaching and zero overhead', () => {
    expect(passPoint(-10, 550).dopplerKHz).toBeGreaterThan(0);
    expect(Math.abs(passPoint(0, 550).dopplerKHz)).toBeLessThan(0.01);
  });
});

describe('Tool 6 additions', () => {
  it('jumping to N(S) = 30 from V(R) = 10 locks out (outside the window)', () => {
    const s = init(10);
    expect(windowZone(s, 30)).toBe('lockout');
    expect(windowZone(s, 14)).toBe('positive');
    expect(windowZone(s, 15)).toBe('lockout');
    expect(windowZone(s, 5)).toBe('negative');
    expect(sendAD(s, 30).farm).toBe('Lockout');
  });
  it('T1 expiry retransmits a dropped frame and the next one', () => {
    let s = { ...init(10), dropNext: true };
    s = sendAD(s); // 10 lost
    s = sendAD(s); // 11 discarded, retransmit flag
    s = timerExpiry(s);
    expect(s.accepted).toEqual([10, 11]);
  });
});

describe('Tool 2 frame decoders (worked examples)', () => {
  it('decodes the TM, TC and CLCW presets', () => {
    expect(tmFields(parseHex('0AB52A111800')).find((f) => f.name === 'Virtual channel ID')?.value).toBe(2);
    expect(tcFields(parseHex('002A041325')).find((f) => f.name === 'Frame sequence number N(S)')?.value).toBe(37);
    const lo = clcwFields(parseHex('01042824'));
    expect(lo.find((f) => f.name === 'Lockout')?.value).toBe(1);
    expect(lo.find((f) => f.name === 'Retransmit')?.value).toBe(1);
    expect(lo.find((f) => f.name === 'Report value N(R)')?.value).toBe(36);
    expect(lo.find((f) => f.name === 'Virtual channel ID')?.value).toBe(1);
  });
});

describe('Tool 8 traces', () => {
  it('every stage carries a trace from the walkthrough lab', () => {
    for (const s of [...DOWNLINK, ...UPLINK]) expect(s.trace?.length).toBeGreaterThan(1);
    expect(DOWNLINK[0].trace?.[0]).toContain('0x0F3A');
    expect(UPLINK[0].trace?.[0]).toContain('HTR_ON');
  });
});
