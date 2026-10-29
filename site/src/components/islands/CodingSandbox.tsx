import { useEffect, useMemo, useRef, useState } from 'react';
import { rng } from '../../lib/framesync';
import { CODES, codeInfo, rsDecode, schematicBer, spreadBurst, type Code } from '../../lib/coding';

// Tool 4: channel coding sandbox (content/labs/channel-coding-sandbox.yaml).
// A synthetic 64 × 64 telemetry image is sent uncoded and coded; each image row stands
// for one R-S codeword. Curves are schematic; the gain readout is cited.

const N = 64;
const STREAM_E = 16;

type Preset = { name: string; code: Code; ebn0: number; errs?: number; burst?: number; depth?: number };
const PRESETS: Preset[] = [
  { name: 'LEO CubeSat pass', code: 'concat', ebn0: 4.0 },
  { name: 'Reed–Solomon only', code: 'rs', ebn0: 4.0 },
  { name: 'LDPC/Turbo', code: 'turbo', ebn0: 4.0 },
  { name: 'R-S at the cliff', code: 'rs', ebn0: 4.0, errs: 17 },
];

// Fictional "telemetry image": a planet limb over a star field with a calibration bar.
function pixel(x: number, y: number) {
  const dx = x - 40, dy = y - 46;
  const r = Math.hypot(dx, dy);
  if (y < 6) return Math.round((x / (N - 1)) * 255); // calibration gradient
  if (r < 30) return Math.round(90 + 120 * Math.max(0, 1 - r / 30) + ((x * 7 + y * 3) % 11));
  return (x * 37 + y * 101) % 97 === 0 ? 230 : 18;
}

function drawImage(canvas: HTMLCanvasElement | null, lostRows: Set<number>, noisy: (x: number, y: number) => boolean) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(N, N);
  const r = rng(99);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      let v = pixel(x, y);
      let red = false;
      if (lostRows.has(y)) { v = Math.floor(r() * 255); red = true; }
      else if (noisy(x, y)) { v = 255 - v; red = true; }
      img.data[i] = red ? Math.min(255, v + 120) : v;
      img.data[i + 1] = red ? v * 0.3 : v;
      img.data[i + 2] = red ? v * 0.3 : Math.min(255, v + 12);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function CodingSandbox() {
  const [code, setCode] = useState<Code>('concat');
  const [ebn0, setEbn0] = useState(4);
  const [errs, setErrs] = useState(10);
  const [burst, setBurst] = useState(20);
  const [depth, setDepth] = useState(1);
  const [burstOn, setBurstOn] = useState(false);
  const [decoderE, setDecoderE] = useState(16);
  const c = codeInfo(code);
  const ber = schematicBer(ebn0, c.shift);
  const berUncoded = schematicBer(ebn0, 0);
  const coded = code !== 'uncoded';
  const usesRs = code === 'rs' || code === 'concat';

  const apply = (p: Preset) => {
    setCode(p.code); setEbn0(p.ebn0); setErrs(p.errs ?? 10); setBurst(p.burst ?? 20); setDepth(p.depth ?? 1); setDecoderE(16); setBurstOn(false);
  };

  // Which rows (codewords) are lost in the coded image.
  const draws = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: N }, () => r());
  }, []);
  const lostCoded = useMemo(() => {
    const lost = new Set<number>();
    if (!coded) return lost;
    const rowFail = Math.min(1, ber * 2000); // schematic: frame error rate grows with post-decoding BER
    draws.forEach((d, row) => { if (d < rowFail) lost.add(row); });
    if (usesRs) {
      if (decoderE !== STREAM_E) for (let row = 0; row < N; row++) lost.add(row);
      if (burstOn) spreadBurst(burst, depth).forEach((n, k) => { if (!rsDecode(n, STREAM_E, decoderE).ok) lost.add(30 + k); });
      if (!rsDecode(errs, STREAM_E, decoderE).ok) lost.add(12);
    }
    return lost;
  }, [coded, ber, draws, usesRs, decoderE, burstOn, burst, depth, errs]);

  const uncodedNoise = useMemo(() => {
    const p = Math.min(0.5, 1 - (1 - berUncoded) ** 8); // byte (pixel) error probability
    const r = rng(11);
    const grid = Array.from({ length: N * N }, () => r() < p);
    return (x: number, y: number) => grid[y * N + x] || (burstOn && y === 30 && x < Math.min(N, burst));
  }, [berUncoded, burstOn, burst]);

  const refU = useRef<HTMLCanvasElement>(null);
  const refC = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    drawImage(refU.current, new Set(), uncodedNoise);
    drawImage(refC.current, lostCoded, () => false);
  }, [uncodedNoise, lostCoded]);

  const perCw = spreadBurst(burst, depth);
  const cliff = rsDecode(errs, STREAM_E, decoderE);
  const W = 520, H = 220;
  const px = (e: number) => 40 + (e / 12) * (W - 60);
  const py = (b: number) => 10 + ((-Math.log10(b) - 1) / 8) * (H - 40);
  const uncodedErrPixels = Array.from({ length: N * N }, (_, i) => uncodedNoise(i % N, Math.floor(i / N))).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-head"><span>Module 04 // Channel coding sandbox</span><span>R-S stream E = {STREAM_E} · seed 7 · fictional</span></div>
        <div className="flex flex-wrap items-end gap-4 p-4">
          <div role="group" aria-label="Presets" className="flex w-full flex-wrap gap-2">
            {PRESETS.map((p) => <button key={p.name} type="button" className="btn btn-secondary !py-1.5" onClick={() => apply(p)}>{p.name}</button>)}
          </div>
          <label className="text-sm">
            <span className="t-label">Code</span>
            <select aria-label="Code" className="field-input mt-1" value={code} onChange={(e) => setCode(e.target.value as Code)}>
              {CODES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label className="min-w-[220px] flex-1 text-sm">
            <span className="t-label">Eb/N0: {ebn0.toFixed(1)} dB</span>
            <input type="range" min={0} max={12} step={0.5} value={ebn0} onChange={(e) => setEbn0(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="text-sm">
            <span className="t-label">R-S decoder E</span>
            <select aria-label="R-S decoder E" className="field-input mt-1 !w-auto" value={decoderE} onChange={(e) => setDecoderE(Number(e.target.value))}>
              <option value={16}>E = 16 (matches stream)</option>
              <option value={8}>E = 8 (misconfigured)</option>
            </select>
          </label>
          <button type="button" className="btn btn-secondary" onClick={() => apply({ name: 'reset', code: 'uncoded', ebn0: 4 })}>Reset</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <figure className="card p-4">
          <figcaption className="t-label">Synthetic telemetry image, 64 × 64 (each row = one codeword)</figcaption>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <canvas ref={refU} width={N} height={N} className="pixelated aspect-square w-full rounded-md border border-line" role="img" aria-label={`Uncoded: ${uncodedErrPixels} of ${N * N} pixels corrupted`} />
              <p className="t-readout mt-1 text-xs text-fg-2">UNCODED · {uncodedErrPixels} px bad</p>
            </div>
            <div>
              <canvas ref={refC} width={N} height={N} className="pixelated aspect-square w-full rounded-md border border-line" role="img" aria-label={`${c.name}: ${lostCoded.size} of ${N} rows lost`} />
              <p className="t-readout mt-1 text-xs text-fg-2">{coded ? `CODED · ${lostCoded.size}/${N} rows lost` : 'select a code'}</p>
            </div>
          </div>
          <p className="t-small mt-2 text-fg-2">Uncoded errors scatter as speckle. Coded links are clean until a codeword fails, then a whole row is lost. Red marks corrupted data.</p>
        </figure>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3">
              <p className="t-label-sm text-fg-2">Coding gain at BER 10⁻⁵</p>
              <p className="t-h3 t-readout">{c.gain ? (c.gain.db === 0 ? '0 dB' : `≈ ${c.gain.db.toFixed(1)} dB`) : 'See curves'}</p>
              <p className="t-label-sm text-fg-muted">{c.gain ? c.gain.note : `no single figure in the text · ${c.curves}`}</p>
            </div>
            <div className="card p-3">
              <p className="t-label-sm text-fg-2">Decoder counters (fictional)</p>
              <p className="t-h3 t-readout">{lostCoded.size} <span className="text-sm font-normal text-fg-2">uncorrectable</span></p>
              <p className="t-label-sm text-fg-muted">{decoderE !== STREAM_E && usesRs ? 'every codeword fails: configuration, not RF' : `of ${N} codewords this frame`}</p>
            </div>
          </div>
          <figure className="card p-4">
            <figcaption className="t-label">Bit error rate vs Eb/N0 — schematic shapes, not to scale</figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`Schematic curves; selected ${c.name} at ${ebn0} dB.`}>
              <line x1="40" y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--border-strong)" />
              <line x1="40" y1="10" x2="40" y2={H - 30} stroke="var(--border-strong)" />
              {CODES.map((k) => {
                const pts = Array.from({ length: 49 }, (_, i) => i * 0.25).map((e) => `${px(e)},${Math.min(H - 30, py(schematicBer(e, k.shift)))}`).join(' ');
                return <polyline key={k.id} points={pts} fill="none" stroke={k.id === code ? 'var(--bg-accent)' : 'var(--border-strong)'} strokeWidth={k.id === code ? 3 : 1.2} strokeDasharray={k.id === 'uncoded' ? '5 4' : undefined} />;
              })}
              <line x1={px(ebn0)} y1="10" x2={px(ebn0)} y2={H - 30} stroke="var(--text-secondary)" strokeDasharray="3 3" />
              <text x="44" y="22" fontSize="11" fill="var(--text-secondary)">1e-1</text>
              <text x="44" y={H - 34} fontSize="11" fill="var(--text-secondary)">1e-9</text>
              <text x="40" y={H - 12} fontSize="11" fill="var(--text-secondary)">0 dB</text>
              <text x={W - 50} y={H - 12} fontSize="11" fill="var(--text-secondary)">12 dB</text>
            </svg>
            <p className="t-small text-fg-2">Selected: {c.name} (solid, highlighted). Dashed: uncoded.</p>
          </figure>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4" aria-labelledby="cliff">
          <h3 id="cliff" className="t-h4">The Reed–Solomon cliff</h3>
          <label className="mt-2 block text-sm">Symbol errors in one codeword (row 13): <strong>{errs}</strong>
            <input type="range" min={0} max={24} value={errs} onChange={(e) => setErrs(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <p className={`mt-2 rounded-md p-2 text-sm font-medium ${cliff.ok ? 'bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]' : 'bg-[var(--status-error-bg)] text-[var(--status-error-fg)]'}`} aria-live="polite">
            {cliff.ok ? `✓ Corrected: ${errs} of up to ${STREAM_E} symbols per codeword (E = ${STREAM_E})` : cliff.reason === 'config' ? `✗ Uncorrectable: decoder set to E = ${decoderE} but the stream uses E = ${STREAM_E}` : `✗ Uncorrectable codeword: ${errs} > ${STREAM_E} — the whole block is lost`}
          </p>
          <p className="t-small mt-2 text-fg-2">CCSDS 131.0-B-6 §5: E = 16 corrects up to 16 R-S symbols per codeword; E = 8 corrects 8.</p>
        </section>
        <section className="card p-4" aria-labelledby="burst">
          <h3 id="burst" className="t-h4">Bursts and interleaving</h3>
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={burstOn} onChange={(e) => setBurstOn(e.target.checked)} /> Inject a burst (rows 31+)</label>
          <label className="mt-2 block text-sm">Burst length: <strong>{burst}</strong> symbols
            <input type="range" min={1} max={60} value={burst} onChange={(e) => setBurst(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="mt-2 block text-sm">Interleaving depth I:
            <select className="field-input mt-1 !w-auto" value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 8].map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <ul className="mt-2 space-y-1 text-sm" aria-live="polite">
            {perCw.map((n, i) => {
              const r = rsDecode(n, STREAM_E, decoderE);
              return <li key={i}>Codeword {i + 1}: {n} symbols in error — {r.ok ? <span className="text-[var(--status-ok-fg)]">✓ corrected</span> : <span className="text-[var(--status-error-fg)]">✗ lost</span>}</li>;
            })}
          </ul>
          <p className="t-small mt-2 text-fg-2">Interleaving spreads a burst across I codewords so each sees fewer errors. Allowed depths: I = 1, 2, 3, 4, 5, 8 (131.0-B-6 §5).</p>
        </section>
      </div>
    </div>
  );
}
