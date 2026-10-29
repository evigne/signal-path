import { useState } from 'react';

// Tool 5: fictional 12-bit battery temperature (content/labs/telemetry-calibration-sandbox.yaml)
// with linear or polynomial calibration and soft (yellow) / hard (red) limits.
const LIMITS = { hardLo: -20, softLo: -10, softHi: 40, hardHi: 50 };
const NOMINAL = { a2: 0, a1: 0.03, a0: -40 };
const POLY = { a2: 0.000002, a1: 0.022, a0: -38 }; // fictional polynomial model
const T_MIN = -40, T_MAX = 90;

type Model = 'linear' | 'polynomial';
const PRESETS: { name: string; raw: number; model: Model }[] = [
  { name: 'Nominal', raw: 2000, model: 'linear' },
  { name: 'LEO CubeSat pass', raw: 2731, model: 'linear' },
  { name: 'Hot', raw: 3100, model: 'linear' },
  { name: 'Polynomial model', raw: 2731, model: 'polynomial' },
];

const fmt = (v: number) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-GB') : v.toFixed(1));

export default function Calibration() {
  const [raw, setRaw] = useState(2731);
  const [model, setModel] = useState<Model>('linear');
  const [a1, setA1] = useState(NOMINAL.a1);
  const [a0, setA0] = useState(NOMINAL.a0);
  const [signed, setSigned] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [noOffset, setNoOffset] = useState(false);

  const coeffs = model === 'polynomial' ? POLY : { a2: 0, a1, a0 };
  const decode = (r: number) => (signed && r >= 2048 ? r - 4096 : r);
  const calibrate = (r: number) => {
    const x = decode(r);
    const c0 = noOffset ? 0 : coeffs.a0;
    return swapped ? c0 * x + coeffs.a1 + coeffs.a2 * x * x : coeffs.a2 * x * x + coeffs.a1 * x + c0;
  };
  const nominal = (r: number) => (model === 'polynomial' ? POLY.a2 * r * r + POLY.a1 * r + POLY.a0 : NOMINAL.a1 * r + NOMINAL.a0);
  const counts = decode(raw);
  const value = calibrate(raw);
  const broken = signed || swapped || noOffset;

  const state = value > LIMITS.hardHi || value < LIMITS.hardLo ? 'hard' : value > LIMITS.softHi || value < LIMITS.softLo ? 'soft' : 'ok';
  const banner = {
    ok: { text: 'Within limits', fg: 'var(--status-ok-fg)', bg: 'var(--status-ok-bg)' },
    soft: { text: 'Soft limit exceeded (yellow) · operator notified', fg: 'var(--status-warn-fg)', bg: 'var(--status-warn-bg)' },
    hard: { text: 'Hard limit exceeded (red)', fg: 'var(--status-error-fg)', bg: 'var(--status-error-bg)' },
  }[state];
  const implausible = value < -100 || value > 200;

  const W = 680, H = 220;
  const x = (r: number) => 40 + (r / 4095) * 620;
  const y = (t: number) => 190 - ((Math.max(T_MIN, Math.min(T_MAX, t)) - T_MIN) / (T_MAX - T_MIN)) * 170;
  const curve = (fn: (r: number) => number) => Array.from({ length: 65 }, (_, i) => i * 64).map((r) => `${x(Math.min(4095, r))},${y(fn(Math.min(4095, r)))}`).join(' ');
  const off = value > T_MAX ? 'above' : value < T_MIN ? 'below' : null;
  const g = (t: number) => 200 - ((Math.max(T_MIN, Math.min(T_MAX, t)) - T_MIN) / (T_MAX - T_MIN)) * 180;

  const apply = (p: (typeof PRESETS)[number]) => { setRaw(p.raw); setModel(p.model); setA1(NOMINAL.a1); setA0(NOMINAL.a0); setSigned(false); setSwapped(false); setNoOffset(false); };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-head"><span>Module 05 // Calibration &amp; limits</span><span>BATT_TEMP · 12-bit · fictional</span></div>
        <div className="flex flex-wrap gap-2 p-4" role="group" aria-label="Presets">
          {PRESETS.map((p) => <button key={p.name} type="button" className="btn btn-secondary !py-1.5" onClick={() => apply(p)}>{p.name}</button>)}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="card space-y-3 p-4">
          <label className="block text-sm">
            <span className="t-label">Raw count (DN), 12-bit</span>
            <input type="range" min={0} max={4095} value={raw} onChange={(e) => setRaw(Number(e.target.value))} className="mt-2 w-full" aria-valuetext={`${raw} counts`} />
            <span className="t-readout">{raw} · 0x{raw.toString(16).toUpperCase().padStart(4, '0')}</span>
          </label>
          <fieldset>
            <legend className="t-label">Calibration model</legend>
            <label className="mt-1 flex items-center gap-2 text-sm"><input type="radio" name="cal-model" checked={model === 'linear'} onChange={() => setModel('linear')} /> Linear y = a₁·x + a₀</label>
            <label className="mt-1 flex items-center gap-2 text-sm"><input type="radio" name="cal-model" checked={model === 'polynomial'} onChange={() => setModel('polynomial')} /> Polynomial y = a₂·x² + a₁·x + a₀</label>
          </fieldset>
          {model === 'linear' ? (
            <>
              <label className="flex items-center gap-2 text-sm">a₁ <input type="number" step="0.001" value={a1} onChange={(e) => setA1(Number(e.target.value))} className="field-input" /></label>
              <label className="flex items-center gap-2 text-sm">a₀ <input type="number" step="0.1" value={a0} onChange={(e) => setA0(Number(e.target.value))} className="field-input" /></label>
            </>
          ) : (
            <p className="t-readout rounded-md bg-subtle p-2 text-xs">a₂ = {POLY.a2} · a₁ = {POLY.a1} · a₀ = {POLY.a0}</p>
          )}
          <p className="t-label pt-2">Break it</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={swapped} onChange={(e) => setSwapped(e.target.checked)} /> Swap the coefficient order</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={noOffset} onChange={(e) => setNoOffset(e.target.checked)} /> Drop the offset term</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} /> Decode as signed 12-bit</label>
          <button type="button" className="btn btn-secondary w-full justify-center" onClick={() => apply(PRESETS[1])}>Reset</button>
        </div>

        <div className="min-w-0 space-y-4">
          <div role="status" className="rounded-lg p-4" style={{ background: banner.bg, color: banner.fg }}>
            <p className="font-semibold">{banner.text}{implausible && ' · physically implausible: suspect the database'}</p>
            <p className="mt-1 text-[var(--text-primary)]">Battery temperature <strong className="t-readout">{fmt(value)} °C</strong> from {counts} counts{broken && <> · correct value {fmt(nominal(raw))} °C</>} · fictional</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_110px]">
            <figure className="card min-w-0 p-4">
              <figcaption className="t-label">Raw count → °C (−40 to 90). Dashed: correct calibration. Solid: what the ground is applying.</figcaption>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`Calibration plot; ${raw} counts gives ${fmt(value)} degrees${off ? `, off the chart ${off}` : ''}`}>
                <rect x="40" y={y(T_MAX)} width="620" height={y(LIMITS.hardHi) - y(T_MAX)} fill="var(--status-error-bg)" />
                <rect x="40" y={y(LIMITS.hardHi)} width="620" height={y(LIMITS.softHi) - y(LIMITS.hardHi)} fill="var(--status-warn-bg)" />
                <rect x="40" y={y(LIMITS.softLo)} width="620" height={y(LIMITS.hardLo) - y(LIMITS.softLo)} fill="var(--status-warn-bg)" />
                <rect x="40" y={y(LIMITS.hardLo)} width="620" height={y(T_MIN) - y(LIMITS.hardLo)} fill="var(--status-error-bg)" />
                <polyline points={curve(nominal)} fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeDasharray="6 5" />
                <polyline points={curve(calibrate)} fill="none" stroke={broken ? 'var(--status-error-fg)' : 'var(--bg-accent)'} strokeWidth="2.5" />
                {off ? (
                  <g>
                    <path d={off === 'above' ? `M${x(raw) - 7} ${y(T_MAX) + 12} L${x(raw)} ${y(T_MAX)} L${x(raw) + 7} ${y(T_MAX) + 12} Z` : `M${x(raw) - 7} ${y(T_MIN) - 12} L${x(raw)} ${y(T_MIN)} L${x(raw) + 7} ${y(T_MIN) - 12} Z`} fill="var(--status-error-fg)" />
                    <text x={Math.min(560, x(raw) + 10)} y={off === 'above' ? y(T_MAX) + 14 : y(T_MIN) - 6} fontSize="12" fill="var(--status-error-fg)" fontFamily="var(--font-mono)">{fmt(value)} °C off chart</text>
                  </g>
                ) : (
                  <circle cx={x(raw)} cy={y(value)} r="6" fill="var(--text-primary)" stroke="var(--bg-surface)" strokeWidth="2" />
                )}
                <text x="44" y={y(LIMITS.softHi) - 4} fontSize="11" fill="var(--text-secondary)">soft high 40 °C</text>
                <text x="44" y={y(LIMITS.hardHi) - 4} fontSize="11" fill="var(--text-secondary)">hard high 50 °C</text>
                <text x="40" y={H - 4} fontSize="11" fill="var(--text-secondary)">0</text>
                <text x="630" y={H - 4} fontSize="11" fill="var(--text-secondary)">4095</text>
              </svg>
            </figure>
            <figure className="card flex flex-col items-center p-3" aria-label={`Gauge: ${fmt(value)} degrees, ${banner.text}`}>
              <figcaption className="t-label-sm text-fg-2">Gauge</figcaption>
              <svg viewBox="0 0 60 220" className="mt-1 h-56 w-14" aria-hidden="true">
                <rect x="22" y={g(T_MAX)} width="16" height={g(LIMITS.hardHi) - g(T_MAX)} fill="var(--status-error-fg)" opacity="0.5" />
                <rect x="22" y={g(LIMITS.hardHi)} width="16" height={g(LIMITS.softHi) - g(LIMITS.hardHi)} fill="var(--status-warn-fg)" opacity="0.5" />
                <rect x="22" y={g(LIMITS.softHi)} width="16" height={g(LIMITS.softLo) - g(LIMITS.softHi)} fill="var(--status-ok-fg)" opacity="0.35" />
                <rect x="22" y={g(LIMITS.softLo)} width="16" height={g(LIMITS.hardLo) - g(LIMITS.softLo)} fill="var(--status-warn-fg)" opacity="0.5" />
                <rect x="22" y={g(LIMITS.hardLo)} width="16" height={g(T_MIN) - g(LIMITS.hardLo)} fill="var(--status-error-fg)" opacity="0.5" />
                <path d={`M10 ${g(value)} L20 ${g(value) - 5} L20 ${g(value) + 5} Z`} fill="var(--text-primary)" />
                <path d={`M50 ${g(value)} L40 ${g(value) - 5} L40 ${g(value) + 5} Z`} fill="var(--text-primary)" />
              </svg>
              <p className="t-readout text-xs">{off ? (off === 'above' ? '> 90' : '< −40') : fmt(value)} °C</p>
            </figure>
          </div>
          <p className="t-small text-fg-2">Bands: red = hard limit, yellow = soft limit, green = nominal; the banner names the state in text. Limits: hard {LIMITS.hardLo}/{LIMITS.hardHi} °C, soft {LIMITS.softLo}/{LIMITS.softHi} °C.</p>
        </div>
      </div>
    </div>
  );
}
