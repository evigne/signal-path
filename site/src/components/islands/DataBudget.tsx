import { useMemo, useState } from 'react';
import { computeBudget, DEFAULTS, type BudgetInput } from '../../lib/budget';

const FIELDS: { key: keyof BudgetInput; label: string; unit: string; step: number; help?: string }[] = [
  { key: 'rateMbps', label: 'Usable information data rate', unit: 'Mbit/s (10⁶ bit/s)', step: 0.1, help: 'After coding and framing at the physical layer; not the symbol rate.' },
  { key: 'passSeconds', label: 'Pass duration, AOS to LOS', unit: 's', step: 10 },
  { key: 'setupSeconds', label: 'Acquisition and setup time', unit: 's', step: 5 },
  { key: 'framingPct', label: 'Protocol and framing overhead', unit: '%', step: 1 },
  { key: 'retransPct', label: 'Retransmission and outage allowance', unit: '%', step: 1 },
  { key: 'marginPct', label: 'Operational margin', unit: '%', step: 1 },
  { key: 'passesPerDay', label: 'Passes per day', unit: 'passes', step: 1 },
  { key: 'generationMBPerDay', label: 'Data generated per day', unit: 'MB (10⁶ bytes)', step: 10 },
  { key: 'startBacklogMB', label: 'Onboard backlog at start', unit: 'MB', step: 10 },
];

const SCENARIOS: { name: string; patch: Partial<BudgetInput> }[] = [
  { name: 'Shorter pass (480 s)', patch: { passSeconds: 480 } },
  { name: 'Rate halved (1.0 Mbit/s)', patch: { rateMbps: 1.0 } },
  { name: 'One missed contact', patch: { passesPerDay: 3 } },
  { name: '+100 MB/day payload', patch: { generationMBPerDay: 460 } },
];

const f1 = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function DataBudget() {
  const [inp, setInp] = useState<BudgetInput>(DEFAULTS);
  const [binary, setBinary] = useState(false);
  const r = useMemo(() => computeBudget(inp), [inp]);
  const max = Math.max(...r.backlog, 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <form className="card space-y-3 p-4" onSubmit={(e) => e.preventDefault()} aria-label="Assumptions">
        <p className="t-label">Assumptions (editable, illustrative)</p>
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="font-medium">{f.label}</span>
            <span className="mt-1 flex items-center gap-2">
              <input
                type="number"
                className="field-input"
                step={f.step}
                min={0}
                value={inp[f.key]}
                onChange={(e) => setInp({ ...inp, [f.key]: Number(e.target.value) })}
              />
              <span className="shrink-0 text-xs text-fg-2">{f.unit}</span>
            </span>
            {f.help && <span className="t-small mt-1 block text-fg-2">{f.help}</span>}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={binary} onChange={(e) => setBinary(e.target.checked)} className="h-4 w-4" />
          Also show binary units (MiB = 2²⁰ bytes)
        </label>
        <button type="button" className="btn btn-secondary w-full justify-center" onClick={() => setInp(DEFAULTS)}>Reset to illustrative defaults</button>
      </form>

      <div className="min-w-0 space-y-5">
        <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
          <div className="card p-4"><p className="t-small text-fg-2">Deliverable per pass</p><p className="t-h2">{f1(r.perPass)} MB</p>{binary && <p className="t-small text-fg-2">≈ {f1(r.perPassMiB)} MiB</p>}</div>
          <div className="card p-4"><p className="t-small text-fg-2">Per day ({inp.passesPerDay} passes)</p><p className="t-h2">{f1(r.perDay)} MB</p>{binary && <p className="t-small text-fg-2">≈ {f1(r.perDayMiB)} MiB</p>}</div>
          <div className="card p-4">
            <p className="t-small text-fg-2">Daily balance</p>
            <p className={`t-h2 ${r.balance >= 0 ? 'text-[var(--status-ok-fg)]' : 'text-[var(--status-error-fg)]'}`}>{r.balance >= 0 ? '+' : '−'}{f1(Math.abs(r.balance))} MB</p>
            <p className="t-small text-fg-2">{r.balance >= 0 ? 'Backlog drains' : 'Backlog grows'}</p>
          </div>
        </div>

        <div className="card p-4">
          <p className="t-label">Formulas and working</p>
          <ol className="mt-2 space-y-1 font-mono text-[13px] leading-6">
            <li>usable_time = pass − setup = {inp.passSeconds} s − {inp.setupSeconds} s = {r.usable} s</li>
            <li>raw = rate × usable_time = {inp.rateMbps} Mbit/s × {r.usable} s = {f1(inp.rateMbps * r.usable)} Mbit = {f1(r.raw)} MB</li>
            <li>after framing = {f1(r.raw)} × (1 − {inp.framingPct / 100}) = {f1(r.afterFraming)} MB</li>
            <li>after retransmission = {f1(r.afterFraming)} × (1 − {inp.retransPct / 100}) = {f1(r.afterRetrans)} MB</li>
            <li>deliverable = {f1(r.afterRetrans)} × (1 − {inp.marginPct / 100}) = {f1(r.perPass)} MB</li>
            <li>per day = {f1(r.perPass)} × {inp.passesPerDay} = {f1(r.perDay)} MB; balance = {f1(r.perDay)} − {inp.generationMBPerDay} = {f1(r.balance)} MB/day</li>
          </ol>
        </div>

        <figure className="card p-4">
          <figcaption className="t-label">Onboard backlog over 7 days (MB)</figcaption>
          <svg viewBox="0 0 700 200" className="mt-3 w-full" role="img" aria-label={`Backlog by day: ${r.backlog.map((b, i) => `day ${i + 1} ${Math.round(b)} MB`).join(', ')}`}>
            <line x1="40" y1="170" x2="690" y2="170" stroke="var(--border-strong)" />
            {r.backlog.map((b, i) => {
              const h = (b / max) * 140;
              const x = 60 + i * 92;
              return (
                <g key={i}>
                  <rect x={x} y={170 - h} width="56" height={h} rx="3" fill="var(--bg-accent)" />
                  <text x={x + 28} y={165 - h} textAnchor="middle" fontSize="12" fill="var(--text-primary)">{Math.round(b)}</text>
                  <text x={x + 28} y="188" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">Day {i + 1}</text>
                </g>
              );
            })}
          </svg>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-link">View data table</summary>
            <table className="mt-2 text-left">
              <thead><tr><th className="pr-6">Day</th><th>Backlog (MB)</th></tr></thead>
              <tbody>{r.backlog.map((b, i) => <tr key={i}><td className="pr-6">{i + 1}</td><td>{f1(b)}</td></tr>)}</tbody>
            </table>
          </details>
        </figure>

        <div className="card p-4">
          <p className="t-label">What changed? Try a scenario</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map((s) => {
              const sr = computeBudget({ ...inp, ...s.patch });
              return (
                <button key={s.name} type="button" onClick={() => setInp({ ...inp, ...s.patch })} className="rounded-lg border border-line p-3 text-left hover:bg-subtle">
                  <span className="block font-medium">{s.name}</span>
                  <span className="t-small block text-fg-2">{f1(sr.perPass)} MB per pass; {f1(sr.perDay)} MB/day; balance {sr.balance >= 0 ? '+' : '−'}{f1(Math.abs(sr.balance))} MB/day</span>
                </button>
              );
            })}
          </div>
          <p className="t-small mt-3 text-fg-2">Illustrative values only, not from any mission. Network presets stay generic until provider coverage is researched and cited.</p>
        </div>
      </div>
    </div>
  );
}
