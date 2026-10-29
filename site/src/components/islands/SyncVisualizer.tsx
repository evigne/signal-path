import { useMemo, useState } from 'react';
import SyncStateDiagram from './SyncStateDiagram';
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
  const [frame, setFrame] = useState(1);

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

  const marker = wrong ? LDPC_CSM_HI : ASM;
  const firstErrs = mismatches(stream, 0, marker);
  // Bit window: the last 16 bits of the previous frame, then 64 bits of frame `frame`.
  const start = Math.max(0, frame * FRAME_BITS - 16);
  const bitsShown = Array.from(stream.slice(start, start + 80));
  const markerAt = frame * FRAME_BITS - start; // index of the expected marker inside the window
  const table = Array.from({ length: Math.min(FRAMES, Math.floor(stream.length / FRAME_BITS)) }, (_, f) => ({ f, errs: mismatches(stream, f * FRAME_BITS, marker) }));
  // Correlation: matching bits (32 − mismatches) at every offset across 8 frames around the inspected one.
  const CORR_BITS = 8 * FRAME_BITS;
  const corrStart = Math.max(0, Math.min(frame - 2, table.length - 9)) * FRAME_BITS;
  const corr = useMemo(() => Array.from({ length: Math.min(CORR_BITS, stream.length - 32 - corrStart) }, (_, i) => 32 - mismatches(stream, corrStart + i, marker)), [stream, marker, corrStart]);
  const peaks = corr.map((v, i) => ({ v, i })).filter((x) => x.v >= 32 - p.threshold);

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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card min-w-0 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="t-label">Bit view at the start of frame {frame + 1}</p>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-secondary !px-3 !py-1" disabled={frame === 0} onClick={() => setFrame(frame - 1)} aria-label="Previous marker">←</button>
              <span className="t-readout text-xs">bit {frame * FRAME_BITS}</span>
              <button type="button" className="btn btn-secondary !px-3 !py-1" disabled={frame >= table.length - 1} onClick={() => setFrame(frame + 1)} aria-label="Next marker">→</button>
            </div>
          </div>
          <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={`Received bits around frame ${frame + 1}`}>
            <div className="flex min-w-[640px] gap-[2px] font-mono text-[12px]">
              {bitsShown.map((b, i) => {
                const k = i - markerAt;
                const inMarker = k >= 0 && k < 32;
                const expected = inMarker ? ((marker >>> (31 - k)) & 1) : null;
                const bad = expected !== null && expected !== b;
                return <span key={i} className={`flex h-7 w-[7px] flex-1 items-center justify-center rounded-sm ${inMarker ? 'border' : 'text-fg-muted'} ${bad ? 'border-[var(--status-error-fg)] bg-[var(--status-error-bg)]' : inMarker ? 'border-[var(--tag-standard-fg)]' : ''}`}>{b}</span>;
              })}
            </div>
          </div>
          <p className="t-small mt-2 text-fg-2">Grey: end of the previous frame's data. Outlined: where the marker should be. Expected {wrong ? '034776C7… (LDPC, first 32 bits)' : '1ACFFC1D'}; {table[frame]?.errs ?? '—'} bits differ here.{invert && ' Stream inverted: every marker bit reads flipped (E53003E2).'}</p>
          <p className="t-small mt-1 text-fg-muted">Markers repeat every {FRAME_BITS} bits in this shortened stream; a real 8920-bit frame with R-S (255,223) I=5 puts them 10,232 bits apart.</p>
        </div>
        <SyncStateDiagram state={perFrame[frame] ?? run.finalState} />
      </div>

      <figure className="card p-4">
        <figcaption className="t-label">Correlation: matching marker bits at every offset (frames {corrStart / FRAME_BITS + 1}–{corrStart / FRAME_BITS + 8})</figcaption>
        <svg viewBox="0 0 640 140" className="mt-2 w-full" role="img" aria-label={`${peaks.length} offsets match within the threshold; peaks at bits ${peaks.slice(0, 6).map((x) => x.i + corrStart).join(', ')}`}>
          <line x1="30" y1="120" x2="630" y2="120" stroke="var(--border-strong)" />
          <line x1="30" y1={120 - ((32 - p.threshold) / 32) * 110} x2="630" y2={120 - ((32 - p.threshold) / 32) * 110} stroke="var(--status-warn-fg)" strokeDasharray="4 4" />
          <text x="34" y={116 - ((32 - p.threshold) / 32) * 110} fontSize="10" fill="var(--status-warn-fg)">threshold</text>
          <polyline fill="none" stroke="var(--diagram-downlink)" strokeWidth="1" points={corr.map((v, i) => `${30 + (i / CORR_BITS) * 600},${120 - (v / 32) * 110}`).join(' ')} />
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={30 + ((k * FRAME_BITS) / CORR_BITS) * 600} y1="118" x2={30 + ((k * FRAME_BITS) / CORR_BITS) * 600} y2="124" stroke="var(--text-secondary)" />)}
          <text x="30" y="136" fontSize="10" fill="var(--text-secondary)">bit {corrStart}</text>
          <text x="580" y="136" fontSize="10" fill="var(--text-secondary)">{corrStart + CORR_BITS}</text>
          <text x="30" y="10" fontSize="10" fill="var(--text-secondary)">32 of 32</text>
        </svg>
        <p className="t-small text-fg-2">Peaks every {FRAME_BITS} bits are the markers; random data rarely gets close. {slip ? 'With the slip, every peak after frame 17 lands one bit early (step to frame 18) — the synchronizer checks the old position and misses.' : 'Turn on the slip or the wrong marker and watch the peaks move or vanish. Use the arrows to move along the stream.'}</p>
      </figure>

      <details className="card p-4">
        <summary className="cursor-pointer t-label">Marker table: Hamming distance at each expected position</summary>
        <ol className="t-readout mt-2 grid max-h-60 gap-x-4 overflow-y-auto text-[12px] leading-5 sm:grid-cols-2 lg:grid-cols-4" tabIndex={0} aria-label="Marker table">
          {table.map(({ f, errs }) => <li key={f}><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setFrame(f)}>frame {String(f + 1).padStart(2, '0')} · bit {f * FRAME_BITS} · {errs} diff {errs <= p.threshold ? '✓' : '✗'}</button></li>)}
        </ol>
      </details>

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
