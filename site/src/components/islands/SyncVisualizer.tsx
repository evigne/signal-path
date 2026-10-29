import { useMemo, useState } from 'react';
import { ASM, LDPC_CSM_HI, makeStream, mismatches, runSync, type SyncState } from '../../lib/framesync';

const FRAME_BITS = 256; // shortened from 10,232 bits so a pass fits on screen
const FRAMES = 48;
const PRESETS = {
  'Clean pass': { ber: -6, threshold: 2, confirmations: 2, flywheel: 2 },
  'Noisy pass': { ber: -2, threshold: 2, confirmations: 2, flywheel: 2 },
  'Loose threshold': { ber: -3, threshold: 4, confirmations: 1, flywheel: 4 },
} as const;
const STATE_STYLE: Record<SyncState, { bg: string; fg: string; short: string }> = {
  SEARCH: { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)', short: 'S' },
  ACQUIRE: { bg: 'var(--status-warn-bg)', fg: 'var(--status-warn-fg)', short: 'A' },
  LOCK: { bg: 'var(--status-ok-bg)', fg: 'var(--status-ok-fg)', short: 'L' },
  FLYWHEEL: { bg: 'var(--bg-accent-subtle)', fg: 'var(--text-link)', short: 'F' },
};

export default function SyncVisualizer() {
  const [p, setP] = useState<{ ber: number; threshold: number; confirmations: number; flywheel: number }>({ ...PRESETS['Clean pass'] });
  const [slip, setSlip] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [invert, setInvert] = useState(false);
  const ber = 10 ** p.ber;

  const { stream, run, perFrame } = useMemo(() => {
    const stream = makeStream({ frames: FRAMES, frameBits: FRAME_BITS, ber, seed: 42, slipAtFrame: slip ? 16 : undefined, invert });
    const run = runSync(stream, { frameBits: FRAME_BITS, threshold: p.threshold, confirmations: p.confirmations, flywheel: p.flywheel, marker: wrong ? LDPC_CSM_HI : ASM });
    // state at the start of each frame slot, for the timeline strip
    const perFrame: SyncState[] = [];
    let st: SyncState = 'SEARCH';
    let ei = 0;
    for (let f = 0; f < FRAMES; f++) {
      const end = (f + 1) * FRAME_BITS;
      while (ei < run.events.length && run.events[ei].pos < end) { st = run.events[ei].state; ei++; }
      perFrame.push(st);
    }
    return { stream, run, perFrame };
  }, [ber, p, slip, wrong, invert]);

  const firstErrs = mismatches(stream, 0, wrong ? LDPC_CSM_HI : ASM);
  const bitsShown = Array.from(stream.slice(0, 64));

  return (
    <div className="space-y-4">
      <div className="card grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="t-label">Bit error rate: 1e{p.ber}</span>
          <input type="range" min={-6} max={-1} step={1} value={p.ber} onChange={(e) => setP({ ...p, ber: Number(e.target.value) })} className="mt-2 w-full" aria-valuetext={`10 to the ${p.ber}`} />
        </label>
        <label className="text-sm">
          <span className="t-label">Match threshold: {p.threshold} bits</span>
          <input type="range" min={0} max={4} value={p.threshold} onChange={(e) => setP({ ...p, threshold: Number(e.target.value) })} className="mt-2 w-full" />
        </label>
        <label className="text-sm">
          <span className="t-label">Confirmations: {p.confirmations}</span>
          <input type="range" min={0} max={3} value={p.confirmations} onChange={(e) => setP({ ...p, confirmations: Number(e.target.value) })} className="mt-2 w-full" />
        </label>
        <label className="text-sm">
          <span className="t-label">Flywheel: {p.flywheel} misses</span>
          <input type="range" min={0} max={4} value={p.flywheel} onChange={(e) => setP({ ...p, flywheel: Number(e.target.value) })} className="mt-2 w-full" />
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
          {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
            <button key={k} type="button" className="btn btn-secondary !py-1.5" onClick={() => { setP({ ...PRESETS[k] }); setSlip(false); setWrong(false); setInvert(false); }}>{k}</button>
          ))}
          <span className="t-label self-center pl-2">Break it:</span>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={slip} onChange={(e) => setSlip(e.target.checked)} /> One-bit slip</label>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={wrong} onChange={(e) => setWrong(e.target.checked)} /> Receiver expects the LDPC marker</label>
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} /> Invert the bit stream</label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4" aria-live="polite">
        <div className="card p-3"><p className="t-label-sm text-fg-2">Final state</p><p className="t-h3" style={{ color: STATE_STYLE[run.finalState].fg }}>{run.finalState}</p></div>
        <div className="card p-3"><p className="t-label-sm text-fg-2">Frames in lock</p><p className="t-h3">{run.lockedFrames} / {FRAMES}</p></div>
        <div className="card p-3"><p className="t-label-sm text-fg-2">False matches</p><p className="t-h3">{run.falseMatches}</p></div>
        <div className="card p-3"><p className="t-label-sm text-fg-2">Marker mismatches, frame 1</p><p className="t-h3">{firstErrs} bits</p></div>
      </div>

      <figure className="card p-4">
        <figcaption className="t-label">Synchronizer state per frame ({FRAMES} frames, {FRAME_BITS} bits each — shortened for display)</figcaption>
        <ol className="mt-3 grid gap-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(28px, 1fr))" }}>
          {perFrame.map((st, i) => (
            <li key={i} className="flex h-8 items-center justify-center rounded-sm text-[11px] font-semibold" style={{ background: STATE_STYLE[st].bg, color: STATE_STYLE[st].fg }} title={`Frame ${i + 1}: ${st}`}>
              <span aria-hidden="true">{STATE_STYLE[st].short}</span><span className="sr-only">Frame {i + 1}: {st}</span>
            </li>
          ))}
        </ol>
        <p className="t-small mt-2 text-fg-2">S = search · A = acquire · L = lock · F = flywheel</p>
      </figure>

      <div className="card overflow-x-auto p-4" tabIndex={0} role="region" aria-label="First 64 received bits">
        <p className="t-label">First 64 received bits — the marker should occupy bits 0–31</p>
        <div className="mt-2 flex min-w-[620px] gap-[2px] font-mono text-[12px]">
          {bitsShown.map((b, i) => {
            const expected = i < 32 ? (((wrong ? LDPC_CSM_HI : ASM) >>> (31 - i)) & 1) : null;
            const bad = expected !== null && expected !== b;
            return <span key={i} className={`flex h-7 w-[9px] flex-1 items-center justify-center rounded-sm ${i < 32 ? 'border' : ''} ${bad ? 'border-[var(--status-error-fg)] bg-[var(--status-error-bg)]' : i < 32 ? 'border-[var(--tag-standard-fg)]' : ''}`}>{b}</span>;
          })}
        </div>
        <p className="t-small mt-2 text-fg-2">Expected marker: {wrong ? '034776C7… (LDPC, first 32 bits)' : '1ACFFC1D'}{invert && ' · stream inverted: every marker bit is flipped (reads E53003E2)'}</p>
      </div>

      <details className="card p-4">
        <summary className="cursor-pointer t-label">Event log ({run.events.length} events)</summary>
        <ol className="mt-2 max-h-60 overflow-y-auto font-mono text-[12px] leading-5" tabIndex={0}>
          {run.events.map((e, i) => <li key={i}>bit {e.pos}: {e.state} {e.errs !== null ? `(${e.errs} mismatches)` : ''} — {e.note}</li>)}
        </ol>
      </details>
      <p className="t-small text-fg-2">Synthetic bit stream (seed 42). States follow CCSDS 130.1-G-3 §9.3.7; threshold, confirmation and flywheel counts are configuration choices, not CCSDS requirements.</p>
    </div>
  );
}
