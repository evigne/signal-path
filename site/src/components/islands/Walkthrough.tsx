import { useState } from 'react';
import { DOWNLINK, UPLINK, type Stage } from '../../lib/chain';

// Tool 8: end-to-end walkthrough (content/labs/end-to-end-walkthrough.yaml). Downlink,
// uplink, or both as a closed loop, with a fictional byte-level trace at each stage.

type Dir = 'downlink' | 'uplink' | 'both';
const COLOR = { downlink: 'var(--diagram-downlink)', uplink: 'var(--diagram-uplink)' };

function StageButton({ s, selected, onSelect, color }: { s: Stage; selected: boolean; onSelect: () => void; color: string }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className="flex min-h-[88px] w-full flex-col items-start gap-1 rounded-lg border-2 bg-surface p-3 text-left"
      style={{ borderColor: selected ? 'var(--border-focus)' : color, boxShadow: selected ? '0 0 0 2px var(--border-focus)' : undefined }}>
      <span className="t-overline text-fg-2">{s.org}</span>
      <span className="font-semibold">{s.title}</span>
      <span className="t-readout text-xs text-fg-2">out: {s.dataOut}</span>
    </button>
  );
}

function Row({ stages, dir, sel, setSel, broken }: { stages: Stage[]; dir: 'downlink' | 'uplink'; sel: string; setSel: (id: string) => void; broken: string | null }) {
  const brokenIdx = stages.findIndex((s) => s.id === broken);
  return (
    <div>
      <p className="t-readout mb-2 text-xs font-semibold" style={{ color: COLOR[dir] }}>{dir === 'downlink' ? 'DOWNLINK · spacecraft → mission control →' : 'UPLINK · mission control → spacecraft →'}</p>
      <ol className="grid gap-2 md:grid-cols-5" aria-label={`${dir} stages in order`}>
        {stages.map((s, i) => (
          <li key={s.id}>
            <StageButton s={s} selected={s.id === sel} onSelect={() => setSel(s.id)} color={brokenIdx !== -1 && i >= brokenIdx ? 'var(--status-error-fg)' : COLOR[dir]} />
            {brokenIdx !== -1 && i === brokenIdx && <span className="mt-1 block text-xs font-semibold text-[var(--status-error-fg)]">✗ fails here</span>}
            {brokenIdx !== -1 && i > brokenIdx && <span className="mt-1 block text-xs text-[var(--status-error-fg)]">no data reaches here</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Walkthrough() {
  const [dir, setDir] = useState<Dir>('downlink');
  const [sel, setSel] = useState<string>(DOWNLINK[2].id);
  const [broken, setBroken] = useState<string | null>(null);
  const all = [...DOWNLINK, ...UPLINK];
  const visible = dir === 'downlink' ? DOWNLINK : dir === 'uplink' ? UPLINK : all;
  const current = all.find((s) => s.id === sel) ?? visible[0];
  const curDir = DOWNLINK.includes(current) ? 'downlink' : 'uplink';

  const choose = (d: Dir) => {
    setDir(d);
    setSel((d === 'uplink' ? UPLINK : DOWNLINK)[0].id);
    setBroken(null);
  };

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-head"><span>Module 08 // End-to-end walkthrough</span><span>SP-1 · fictional values</span></div>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <span className="t-label">Direction</span>
          {(['downlink', 'uplink', 'both'] as Dir[]).map((d) => (
            <button key={d} type="button" aria-pressed={dir === d} className={`btn ${dir === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => choose(d)}>
              {d === 'downlink' ? 'Downlink' : d === 'uplink' ? 'Uplink' : 'Both (closed loop)'}
            </button>
          ))}
          <label className="flex w-full min-w-0 flex-wrap items-center gap-2 text-sm sm:ml-auto sm:w-auto">
            Break a stage
            <select className="field-input min-w-0 max-w-full sm:!w-auto" value={broken ?? ''} onChange={(e) => setBroken(e.target.value || null)}>
              <option value="">None</option>
              {visible.map((s) => <option key={s.id} value={s.id}>{s.org}: {s.title}</option>)}
            </select>
          </label>
          <div className="flex w-full flex-wrap gap-2">
            <button type="button" className="btn btn-secondary !py-1.5" onClick={() => { if (dir === 'uplink') setDir('downlink'); setBroken('d-network'); setSel('d-network'); }}>Break it: SLE association</button>
            <button type="button" className="btn btn-secondary !py-1.5" onClick={() => { if (dir === 'uplink') setDir('downlink'); setBroken('d-station'); setSel('d-station'); }}>Break it: frame lock at the station</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {dir !== 'uplink' && <Row stages={DOWNLINK} dir="downlink" sel={sel} setSel={setSel} broken={broken} />}
        {dir === 'both' && (
          <p className="rounded-md border border-dashed border-line-strong p-2 text-center text-sm text-fg-2">
            Closed loop: each command's acceptance comes back as a <strong className="text-fg">CLCW</strong> inside downlink frames, so a downlink failure also blinds commanding.
          </p>
        )}
        {dir !== 'downlink' && <Row stages={UPLINK} dir="uplink" sel={sel} setSel={setSel} broken={broken} />}
      </div>

      <section className="card p-5" aria-live="polite" aria-label="Selected stage">
        <p className="t-overline text-fg-2">Selected stage · {current.org} · <span style={{ color: COLOR[curDir] }}>{curDir}</span></p>
        <h3 className="t-h3">{current.title}</h3>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          <dl className="grid gap-3 text-[15px]">
            <div><dt className="t-label text-fg-2">Data unit in → out</dt><dd>{current.dataIn} → {current.dataOut}</dd></div>
            <div><dt className="t-label text-fg-2">Owner</dt><dd>{current.owner}</dd></div>
            <div><dt className="t-label text-fg-2">Healthy when</dt><dd>{current.healthy}</dd></div>
            <div><dt className="t-label text-fg-2">If this stage fails</dt><dd>{current.failure}</dd></div>
          </dl>
          {current.trace && (
            <div>
              <p className="t-label text-fg-2">Trace through this stage (fictional)</p>
              <ol className="t-readout mt-2 space-y-1 text-xs" aria-label="Data at this stage, in processing order">
                {current.trace.map((t, i) => (
                  <li key={t} className="rounded-md border border-line bg-subtle px-3 py-1.5" style={{ marginLeft: `${i * 14}px`, borderLeft: `3px solid ${COLOR[curDir]}` }}>
                    <span className="text-fg-2">{i === 0 ? 'in  ' : i === current.trace!.length - 1 ? 'out ' : '→   '}</span>{t}
                  </li>
                ))}
              </ol>
              {broken && all.findIndex((s) => s.id === broken) <= all.indexOf(current) && (DOWNLINK.includes(current) === DOWNLINK.some((s) => s.id === broken)) && (
                <p className="mt-2 text-sm text-[var(--status-error-fg)]">With the break upstream, this trace stops at the failed stage.</p>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-sm">
          <a href={`/topics/${current.topic}/`}>Learn this stage →</a>
          {current.symptom && <> · <a href={`/symptoms/${current.symptom}/`}>Symptom guide →</a></>}
        </p>
        <p className="t-small mt-3 text-fg-2">Which organisation runs each stage varies by mission. Data units and owners are the common CCSDS shape, not a specific mission.</p>
      </section>
    </div>
  );
}
