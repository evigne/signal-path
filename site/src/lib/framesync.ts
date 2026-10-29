// Frame-synchronizer model for Tool 3. Search / Acquire / Lock / Flywheel follow the
// states described in CCSDS 130.1-G-3 §9.3.7; threshold, confirmation and flywheel
// counts are configuration choices, not CCSDS requirements. Streams are synthetic.

export const ASM = 0x1acffc1d;
export const LDPC_CSM_HI = 0x034776c7; // first 32 bits of the 64-bit marker, for the wrong-marker case

export type SyncState = 'SEARCH' | 'ACQUIRE' | 'LOCK' | 'FLYWHEEL';

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export type StreamOptions = { frames: number; frameBits: number; ber: number; seed: number; slipAtFrame?: number; invert?: boolean };

/** Synthetic stream: marker + random data per frame, independent bit errors, optional slip/inversion. */
export function makeStream(o: StreamOptions): Uint8Array {
  const r = rng(o.seed);
  const out: number[] = [];
  for (let f = 0; f < o.frames; f++) {
    for (let i = 31; i >= 0; i--) out.push((ASM >>> i) & 1);
    for (let i = 32; i < o.frameBits; i++) out.push(r() < 0.5 ? 1 : 0);
    if (o.slipAtFrame !== undefined && f === o.slipAtFrame) out.pop(); // one-bit slip
  }
  const er = rng(o.seed ^ 0x9e3779b9);
  return Uint8Array.from(out, (b) => {
    let v = er() < o.ber ? b ^ 1 : b;
    if (o.invert) v ^= 1;
    return v;
  });
}

export function mismatches(stream: Uint8Array, at: number, marker = ASM): number {
  let n = 0;
  for (let i = 0; i < 32; i++) if (stream[at + i] !== ((marker >>> (31 - i)) & 1)) n++;
  return n;
}

export type SyncEvent = { pos: number; state: SyncState; errs: number | null; note: string };
export type SyncConfig = { frameBits: number; threshold: number; confirmations: number; flywheel: number; marker?: number };

/** Run the synchronizer over the stream; returns state changes and per-check results. */
export function runSync(stream: Uint8Array, c: SyncConfig) {
  const marker = c.marker ?? ASM;
  const events: SyncEvent[] = [];
  let state: SyncState = 'SEARCH';
  let pos = 0;
  let confirms = 0;
  let misses = 0;
  let locked = 0;
  let falseMatches = 0;
  const truePos = (p: number) => p % c.frameBits === 0;
  while (pos + 32 <= stream.length) {
    if (state === 'SEARCH') {
      let found = -1;
      for (let p = pos; p + 32 <= stream.length; p++) {
        if (mismatches(stream, p, marker) <= c.threshold) { found = p; break; }
      }
      if (found < 0) { events.push({ pos, state, errs: null, note: 'no marker found' }); break; }
      if (!truePos(found)) falseMatches++;
      state = c.confirmations > 0 ? 'ACQUIRE' : 'LOCK';
      confirms = 0;
      events.push({ pos: found, state, errs: mismatches(stream, found, marker), note: 'marker candidate found' });
      pos = found + c.frameBits;
      continue;
    }
    const e = mismatches(stream, pos, marker);
    const ok = e <= c.threshold;
    if (state === 'ACQUIRE') {
      if (ok) {
        confirms++;
        if (confirms >= c.confirmations) { state = 'LOCK'; events.push({ pos, state, errs: e, note: 'confirmed at expected spacing' }); }
        else events.push({ pos, state, errs: e, note: `confirmation ${confirms}/${c.confirmations}` });
      } else {
        state = 'SEARCH';
        events.push({ pos, state, errs: e, note: 'confirmation failed' });
        pos = pos - c.frameBits + 1;
        continue;
      }
    } else if (state === 'LOCK' || state === 'FLYWHEEL') {
      if (ok) {
        if (state === 'FLYWHEEL') events.push({ pos, state: 'LOCK', errs: e, note: 'marker back' });
        state = 'LOCK';
        misses = 0;
        locked++;
      } else {
        misses++;
        if (misses > c.flywheel) {
          state = 'SEARCH';
          events.push({ pos, state, errs: e, note: `lost lock after ${misses} missed markers` });
          continue;
        }
        state = 'FLYWHEEL';
        events.push({ pos, state, errs: e, note: `missed marker ${misses}/${c.flywheel}` });
      }
    }
    pos += c.frameBits;
  }
  const lockedOnce = events.some((ev) => ev.state === 'LOCK');
  return { events, finalState: state, lockedFrames: locked, falseMatches, lockedOnce };
}
