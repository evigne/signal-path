// Behaviours from content/labs/sync-marker-visualiser.yaml.
import { describe, expect, it } from 'vitest';
import { LDPC_CSM_HI, makeStream, runSync } from '../../src/lib/framesync';

const cfg = { frameBits: 256, threshold: 2, confirmations: 2, flywheel: 2 };

describe('frame synchronizer', () => {
  it('locks on a clean stream after the confirmations', () => {
    const s = makeStream({ frames: 20, frameBits: 256, ber: 1e-6, seed: 42 });
    const r = runSync(s, cfg);
    expect(r.lockedOnce).toBe(true);
    expect(r.events.find((e) => e.state === 'LOCK')!.pos).toBe(512);
    expect(r.finalState).toBe('LOCK');
  });

  it('never locks when the receiver expects the wrong marker', () => {
    const s = makeStream({ frames: 20, frameBits: 256, ber: 1e-6, seed: 42 });
    expect(runSync(s, { ...cfg, marker: LDPC_CSM_HI }).lockedOnce).toBe(false);
  });

  it('never locks on an inverted stream', () => {
    const s = makeStream({ frames: 20, frameBits: 256, ber: 1e-6, seed: 42, invert: true });
    expect(runSync(s, cfg).lockedOnce).toBe(false);
  });

  it('loses lock after a one-bit slip and reacquires', () => {
    const s = makeStream({ frames: 30, frameBits: 256, ber: 1e-6, seed: 42, slipAtFrame: 10 });
    const r = runSync(s, cfg);
    const lost = r.events.findIndex((e) => e.note.startsWith('lost lock'));
    expect(lost).toBeGreaterThan(-1);
    expect(r.events.slice(lost).some((e) => e.state === 'LOCK')).toBe(true);
  });
});
