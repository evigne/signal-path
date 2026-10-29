import { useState } from 'react';
import { DOWNLINK, UPLINK, type Stage } from '../../lib/chain';

type Dir = 'downlink' | 'uplink';

function StageButton({ s, selected, onSelect, color }: { s: Stage; selected: boolean; onSelect: () => void; color: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex min-h-[88px] flex-col items-start gap-1 rounded-lg border-2 bg-surface p-3 text-left"
      style={{ borderColor: selected ? 'var(--border-focus)' : color, boxShadow: selected ? '0 0 0 2px var(--border-focus)' : undefined }}
    >
      <span className="t-overline text-fg-2">{s.org}</span>
      <span className="font-semibold">{s.title}</span>
      <span className="font-mono text-xs text-fg-2">out: {s.dataOut}</span>
    </button>
  );
}

export default function Walkthrough() {
  const [dir, setDir] = useState<Dir>('downlink');
  const [sel, setSel] = useState<string>(DOWNLINK[2].id);
  const [broken, setBroken] = useState<string | null>(null);
  const stages = dir === 'downlink' ? DOWNLINK : UPLINK;
  const color = dir === 'downlink' ? 'var(--diagram-downlink)' : 'var(--diagram-uplink)';
  const current = stages.find((s) => s.id === sel) ?? stages[0];
  const brokenIdx = stages.findIndex((s) => s.id === broken);

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="t-label">Direction</span>
        {(['downlink', 'uplink'] as Dir[]).map((d) => (
          <button key={d} type="button" aria-pressed={dir === d} className={`btn ${dir === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setDir(d); setSel((d === 'downlink' ? DOWNLINK : UPLINK)[0].id); setBroken(null); }}>
            {d === 'downlink' ? 'Downlink (spacecraft → ground)' : 'Uplink (ground → spacecraft)'}
          </button>
        ))}
        <label className="flex w-full min-w-0 flex-wrap items-center gap-2 text-sm sm:ml-auto sm:w-auto">
          Break a stage
          <select className="field-input min-w-0 max-w-full sm:!w-auto" value={broken ?? ''} onChange={(e) => setBroken(e.target.value || null)}>
            <option value="">None</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.org}: {s.title}</option>)}
          </select>
        </label>
      </div>

      <ol className="grid gap-2 md:grid-cols-5" aria-label={`${dir} stages in order`}>
        {stages.map((s, i) => (
          <li key={s.id} className="relative">
            <StageButton s={s} selected={s.id === sel} onSelect={() => setSel(s.id)} color={brokenIdx !== -1 && i >= brokenIdx ? 'var(--status-error-fg)' : color} />
            {brokenIdx !== -1 && i === brokenIdx && <span className="mt-1 block text-xs font-semibold text-[var(--status-error-fg)]">✗ fails here</span>}
            {brokenIdx !== -1 && i > brokenIdx && <span className="mt-1 block text-xs text-[var(--status-error-fg)]">no data reaches here</span>}
          </li>
        ))}
      </ol>
      <p className="text-sm" style={{ color }}>{dir === 'downlink' ? 'Read left to right: spacecraft → ground.' : 'Read left to right: mission control → spacecraft.'}</p>

      <section className="card p-5" aria-live="polite" aria-label="Selected stage">
        <p className="t-overline text-fg-2">Selected stage · {current.org}</p>
        <h3 className="t-h3">{current.title}</h3>
        <dl className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
          <div><dt className="t-label text-fg-2">Data unit in → out</dt><dd>{current.dataIn} → {current.dataOut}</dd></div>
          <div><dt className="t-label text-fg-2">Owner</dt><dd>{current.owner}</dd></div>
          <div><dt className="t-label text-fg-2">Healthy when</dt><dd>{current.healthy}</dd></div>
          <div><dt className="t-label text-fg-2">If this stage fails</dt><dd>{current.failure}</dd></div>
        </dl>
        <p className="mt-3 text-sm">
          <a href={`/topics/${current.topic}/`}>Learn this stage →</a>
          {current.symptom && <> · <a href={`/symptoms/${current.symptom}/`}>Symptom guide →</a></>}
        </p>
        <p className="t-small mt-3 text-fg-2">Which organisation runs each stage varies by mission. Data units and owners here are the common CCSDS shape, not a specific mission.</p>
      </section>
    </div>
  );
}
