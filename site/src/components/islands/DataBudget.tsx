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

const BREAKS: { name: string; patch: (i: BudgetInput) => Partial<BudgetInput>; note: string }[] = [
  { name: 'Symbol rate vs info rate', patch: () => ({ rateMbps: 2.294 }), note: 'Rate set to the 2.294 Msym/s channel symbol rate from the Bits, symbols and rates example: coding and marker overhead now count as useful data, so the plan looks about 15 % better than reality.' },
  { name: 'Mix MB and MiB', patch: (i) => ({ generationMBPerDay: Math.round((i.generationMBPerDay * 2 ** 20) / 1e6 * 10) / 10 }), note: 'The payload team quoted 360 MiB/day; entered as MiB it is 377.5 MB/day — a 4.9 % error that quietly eats the margin.' },
  { name: 'Zero setup time', patch: () => ({ setupSeconds: 0 }), note: 'Setup set to 0 s: every pass looks a minute longer than any station can deliver.' },
];

const RECORDERS = [
  { label: '1 GB (10⁹ bytes)', mb: 1000 },
  { label: '2 GiB', mb: (2 * 2 ** 30) / 1e6 },
  { label: '8 GiB', mb: (8 * 2 ** 30) / 1e6 },
  { label: '512 MiB', mb: 2 ** 29 / 1e6 },
];

const f1 = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export default function DataBudget() {
  const [inp, setInp] = useState<BudgetInput>(DEFAULTS);
  const [binary, setBinary] = useState(false);
  const [recorder, setRecorder] = useState(0);
  const [broke, setBroke] = useState<string | null>(null);
  const r = useMemo(() => computeBudget(inp), [inp]);
  const cap = RECORDERS[recorder].mb;
  const max = Math.max(...r.backlog, cap) * 1.08;
  const overflowDay = r.backlog.findIndex((b) => b > cap);
  const rawPass = (inp.rateMbps * 1e6 * inp.passSeconds) / 8 / 1e6;
  const steps = [
    { label: 'Raw pass capacity', value: rawPass, color: 'var(--text-secondary)' },
    { label: 'Acquisition / setup', value: -(rawPass - r.raw), color: 'var(--status-warn-fg)' },
    { label: 'Framing & coding overhead', value: -(r.raw - r.afterFraming), color: 'var(--status-warn-fg)' },
    { label: 'Retransmission allowance', value: -(r.afterFraming - r.afterRetrans), color: 'var(--status-warn-fg)' },
    { label: 'Operational margin', value: -(r.afterRetrans - r.perPass), color: 'var(--status-warn-fg)' },
    { label: 'Net usable per pass', value: r.perPass, color: 'var(--diagram-downlink)' },
  ];

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
        <button type="button" className="btn btn-secondary w-full justify-center" onClick={() => { setInp(DEFAULTS); setBroke(null); }}>Reset to illustrative defaults</button>
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
          <figcaption className="t-label">Per-pass capacity waterfall (MB)</figcaption>
          <svg viewBox="0 0 700 200" className="mt-3 w-full" role="img" aria-label={steps.map((st) => `${st.label} ${f1(Math.abs(st.value))} MB`).join('; ')}>
            {(() => {
              let level = 0;
              const sc = (v: number) => (v / Math.max(rawPass, 1)) * 140;
              return steps.map((st, i) => {
                const x = 20 + i * 113;
                const isTotal = i === 0 || i === steps.length - 1;
                const top = isTotal ? st.value : level;
                const h = sc(Math.abs(st.value));
                const y = 160 - sc(top);
                if (i === 0) level = st.value; else if (!isTotal) level += st.value;
                return (
                  <g key={st.label}>
                    <rect x={x} y={y} width="80" height={Math.max(1, h)} rx="3" fill={st.color} opacity={isTotal ? 0.9 : 0.6} />
                    <text x={x + 40} y={y - 5} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-primary)">{i === 0 || isTotal ? '' : '−'}{f1(Math.abs(st.value))}</text>
                    <text x={x + 40} y="178" textAnchor="middle" fontSize="10.5" fill="var(--text-secondary)">{st.label.split(' ').slice(0, 2).join(' ')}</text>
                    <text x={x + 40} y="192" textAnchor="middle" fontSize="10.5" fill="var(--text-secondary)">{st.label.split(' ').slice(2).join(' ')}</text>
                  </g>
                );
              });
            })()}
          </svg>
        </figure>

        <figure className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <figcaption className="t-label">Onboard backlog over 7 days (MB) against recorder capacity</figcaption>
            <label className="flex items-center gap-2 text-sm">Recorder
              <select className="field-input !w-auto" value={recorder} onChange={(e) => setRecorder(Number(e.target.value))}>
                {RECORDERS.map((rc, i) => <option key={rc.label} value={i}>{rc.label}</option>)}
              </select>
            </label>
          </div>
          <svg viewBox="0 0 700 200" className="mt-3 w-full" role="img" aria-label={`Backlog by day: ${r.backlog.map((b, i) => `day ${i + 1} ${Math.round(b)} MB`).join(', ')}`}>
            <line x1="40" y1="170" x2="690" y2="170" stroke="var(--border-strong)" />
            <line x1="40" y1={170 - (cap / max) * 150} x2="690" y2={170 - (cap / max) * 150} stroke="var(--status-error-fg)" strokeDasharray="6 4" />
            <text x="690" y={165 - (cap / max) * 150} textAnchor="end" fontSize="11" fill="var(--status-error-fg)">recorder full · {Math.round(cap)} MB</text>
            {r.backlog.map((b, i) => {
              const h = (b / max) * 150;
              const x = 60 + i * 92;
              return (
                <g key={i}>
                  <rect x={x} y={170 - h} width="56" height={h} rx="3" fill={b > cap ? 'var(--status-error-fg)' : 'var(--bg-accent)'} />
                  <text x={x + 28} y={165 - h} textAnchor="middle" fontSize="12" fill="var(--text-primary)">{Math.round(b)}</text>
                  <text x={x + 28} y="188" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">Day {i + 1}</text>
                </g>
              );
            })}
          </svg>
          <p className={`mt-2 text-sm ${overflowDay >= 0 ? 'text-[var(--status-error-fg)]' : 'text-fg-2'}`} aria-live="polite">{overflowDay >= 0 ? `✗ The recorder overflows on day ${overflowDay + 1}: new data would be lost or overwritten.` : `Peak backlog ${Math.round(Math.max(...r.backlog))} MB, ${Math.round((Math.max(...r.backlog) / cap) * 100)} % of the recorder.`}</p>
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
          <p className="t-label mt-4">Break it</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BREAKS.map((b) => (
              <button key={b.name} type="button" aria-pressed={broke === b.name} className={`btn !py-1.5 ${broke === b.name ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setInp({ ...DEFAULTS, ...b.patch(DEFAULTS) }); setBroke(b.name); }}>{b.name}</button>
            ))}
          </div>
          {broke && <p className="mt-2 rounded-md bg-[var(--status-warn-bg)] p-2 text-sm text-[var(--status-warn-fg)]" aria-live="polite">{BREAKS.find((b) => b.name === broke)!.note}</p>}
          <p className="t-small mt-3 text-fg-2">Illustrative values only, not from any mission. Network presets stay generic until provider coverage is researched and cited.</p>
        </div>
      </div>
    </div>
  );
}
