// Scenarios from content/labs/cop1-farm-simulator.yaml (fictional values).
import { describe, expect, it } from 'vitest';
import { clcw, init, processClcw, reinit, sendAD, sendBD, setBusy, unlock } from '../../src/lib/cop1';

describe('COP-1 simulator', () => {
  it('clean sending advances the report value', () => {
    let s = init(10);
    s = sendAD(sendAD(sendAD(s)));
    expect(clcw(s)).toMatchObject({ nr: 13, retransmit: false, lockout: false });
    s = processClcw(s);
    expect(s.fop).toBe('S1 Active');
    expect(s.sent).toEqual([]);
  });

  it('a dropped frame causes discard of the next and go-back-n retransmission', () => {
    let s = { ...init(10), dropNext: true };
    s = sendAD(s); // 10 lost
    s = sendAD(s); // 11 discarded
    expect(clcw(s)).toMatchObject({ nr: 10, retransmit: true });
    s = processClcw(s);
    expect(s.accepted).toEqual([10, 11]);
    expect(clcw(s)).toMatchObject({ nr: 12, retransmit: false });
    expect(s.fop).toBe('S1 Active');
  });

  it('a frame outside the window locks out the FARM until Unlock', () => {
    let s = init(10);
    s = sendAD(s, 30); // 30 > V(R) + PW − 1 = 14
    expect(clcw(s).lockout).toBe(true);
    s = sendAD(s);
    expect(s.accepted).toEqual([]);
    s = processClcw(s);
    expect(s.fop).toBe('S6 Initial');
    s = unlock(s);
    expect(clcw(s).lockout).toBe(false);
    s = reinit(s);
    s = sendAD(s);
    expect(s.accepted).toEqual([10]);
  });

  it('a duplicate in the negative window is discarded without lockout', () => {
    let s = sendAD(init(10));
    s = sendAD(s, 10);
    expect(clcw(s)).toMatchObject({ nr: 11, lockout: false });
  });

  it('a full buffer sets Wait', () => {
    let s = setBusy(init(10), true);
    s = sendAD(s);
    expect(clcw(s)).toMatchObject({ wait: true, retransmit: true });
    s = processClcw(s);
    expect(s.fop).toBe('S3 Retransmit with wait');
    s = setBusy(s, false);
    expect(s.farm).toBe('Open');
  });

  it('Type-BD frames bypass acceptance and count in FARM-B', () => {
    const s = sendBD(init(10));
    expect(s.farmB).toBe(1);
    expect(s.vr).toBe(10);
  });
});
