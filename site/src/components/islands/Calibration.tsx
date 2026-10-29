import { useState } from 'react';

// Tool 5: fictional 12-bit battery temperature with a linear calibration and
// soft (yellow) / hard (red) limits, as on the Penpot screen.
const LIMITS = { hardLo: -20, softLo: -10, softHi: 40, hardHi: 50 };

export default function Calibration() {
  const [raw, setRaw] = useState(2731);
  const [a1, setA1] = useState(0.03);
  const [a0, setA0] = useState(-40);
  const [signed, setSigned] = useState(false);
  const [swapped, setSwapped] = useState(false);

  const counts = signed && raw >= 2048 ? raw - 4096 : raw;
  const value = swapped ? a0 * counts + a1 : a1 * counts + a0;
  const state =
    value > LIMITS.hardHi || value < LIMITS.hardLo ? 'hard' : value > LIMITS.softHi || value < LIMITS.softLo ? 'soft' : 'ok';
  const banner = {
    ok: { text: 'Within limits', fg: 'var(--status-ok-fg)', bg: 'var(--status-ok-bg)' },
    soft: { text: 'Soft limit exceeded (yellow) · operator notified', fg: 'var(--status-warn-fg)', bg: 'var(--status-warn-bg)' },
    hard: { text: 'Hard limit exceeded (red)', fg: 'var(--status-error-fg)', bg: 'var(--status-error-bg)' },
  }[state];
  const x = (r: number) => 40 + (r / 4095) * 620;
  const y = (t: number) => 180 - ((t + 40) / 130) * 160;

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="card space-y-3 p-4">
        <label className="block text-sm">
          <span className="t-label">Raw count (DN), 12-bit</span>
          <input type="range" min={0} max={4095} value={raw} onChange={(e) => setRaw(Number(e.target.value))} className="mt-2 w-full" aria-valuetext={`${raw} counts`} />
          <span className="font-mono">{raw} · 0x{raw.toString(16).toUpperCase().padStart(4, '0')}</span>
        </label>
        <p className="t-label">Calibration y = a₁·x + a₀ (fictional)</p>
        <label className="flex items-center gap-2 text-sm">a₁ <input type="number" step="0.001" value={a1} onChange={(e) => setA1(Number(e.target.value))} className="field-input" /></label>
        <label className="flex items-center gap-2 text-sm">a₀ <input type="number" step="0.1" value={a0} onChange={(e) => setA0(Number(e.target.value))} className="field-input" /></label>
        <p className="t-label pt-2">Break it</p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={swapped} onChange={(e) => setSwapped(e.target.checked)} /> Swap the coefficient order</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} /> Decode as signed 12-bit</label>
        <button type="button" className="btn btn-secondary w-full justify-center" onClick={() => { setRaw(2731); setA1(0.03); setA0(-40); setSigned(false); setSwapped(false); }}>Reset</button>
      </div>
      <div className="min-w-0 space-y-4">
        <div role="status" className="rounded-lg p-4" style={{ background: banner.bg, color: banner.fg }}>
          <p className="font-semibold">{banner.text}</p>
          <p className="mt-1 text-[var(--text-primary)]">Battery temperature <strong className="font-mono">{value.toFixed(1)} °C</strong> from {counts} counts · fictional values</p>
        </div>
        <figure className="card p-4">
          <figcaption className="t-label">Raw count → engineering value (°C, −40 to 90)</figcaption>
          <svg viewBox="0 0 680 200" className="mt-2 w-full" role="img" aria-label={`Linear calibration line; current point ${raw} counts gives ${value.toFixed(1)} degrees Celsius`}>
            <rect x="40" y={y(90)} width="620" height={y(LIMITS.hardHi) - y(90)} fill="var(--status-error-bg)" />
            <rect x="40" y={y(LIMITS.hardHi)} width="620" height={y(LIMITS.softHi) - y(LIMITS.hardHi)} fill="var(--status-warn-bg)" />
            <rect x="40" y={y(LIMITS.softLo)} width="620" height={y(LIMITS.hardLo) - y(LIMITS.softLo)} fill="var(--status-warn-bg)" />
            <rect x="40" y={y(LIMITS.hardLo)} width="620" height={y(-40) - y(LIMITS.hardLo)} fill="var(--status-error-bg)" />
            <line x1="40" y1={y(a0)} x2="660" y2={y(a1 * 4095 + a0)} stroke="var(--bg-accent)" strokeWidth="2" />
            {value >= -40 && value <= 90 && <circle cx={x(raw)} cy={y(value)} r="6" fill="var(--text-primary)" />}
            <text x="44" y={y(LIMITS.softHi) - 4} fontSize="11" fill="var(--text-secondary)">soft high 40 °C</text>
            <text x="44" y={y(LIMITS.hardHi) - 4} fontSize="11" fill="var(--text-secondary)">hard high 50 °C</text>
            <text x="40" y="198" fontSize="11" fill="var(--text-secondary)">0</text>
            <text x="640" y="198" fontSize="11" fill="var(--text-secondary)">4095</text>
          </svg>
          <p className="t-small mt-2 text-fg-2">Bands: red = hard limit zone, yellow = soft limit zone; the banner above names the state in text. Limits: hard {LIMITS.hardLo}/{LIMITS.hardHi} °C, soft {LIMITS.softLo}/{LIMITS.softHi} °C.</p>
        </figure>
      </div>
    </div>
  );
}
