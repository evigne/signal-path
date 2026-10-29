import { useState } from 'react';
import { clcw, init, processClcw, reinit, sendAD, sendBD, setBusy, unlock, type Cop1 } from '../../lib/cop1';

const FOP_STATES = ['S1 Active', 'S2 Retransmit without wait', 'S3 Retransmit with wait', 'S6 Initial'];
const FARM_STATES = ['Open', 'Wait', 'Lockout'];

function StateList({ title, states, current }: { title: string; states: string[]; current: string }) {
  return (
    <div>
      <p className="t-label">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {states.map((s) => (
          <li key={s} aria-current={s === current ? 'true' : undefined} className={`flex items-center gap-2 rounded-md border px-2 py-1 ${s === current ? 'border-[var(--border-focus)] bg-accent-subtle font-semibold' : 'border-line text-fg-2'}`}>
            <span aria-hidden="true">{s === current ? '●' : '○'}</span>{s}{s === current && <span className="sr-only"> (current)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Cop1Sim() {
  const [s, setS] = useState<Cop1>(() => init(10));
  const c = clcw(s);
  const act = (f: (x: Cop1) => Cop1) => setS(f);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap gap-2 p-4" role="toolbar" aria-label="Simulator controls">
        <button type="button" className="btn btn-primary" onClick={() => act(sendAD)}>Send AD frame</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(processClcw)}>Read CLCW (ground reacts)</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(sendBD)}>Send BD frame</button>
        <label className="btn btn-secondary cursor-pointer">
          <input type="checkbox" checked={s.dropNext} onChange={(e) => setS({ ...s, dropNext: e.target.checked })} className="h-4 w-4" /> Drop next frame
        </label>
        <label className="btn btn-secondary cursor-pointer">
          <input type="checkbox" checked={s.busy} onChange={(e) => act((x) => setBusy(x, e.target.checked))} className="h-4 w-4" /> Spacecraft busy
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => act((x) => sendAD(x, (x.vr + 20) % 256))}>Jump outside window</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(unlock)}>Send Unlock (BC)</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(reinit)}>Re-initialise FOP</button>
        <button type="button" className="btn btn-ghost" onClick={() => setS(init(10))}>Reset</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="card p-4" aria-label="Ground: FOP-1">
          <p className="t-overline text-fg-2">Ground · mission control</p>
          <div className="mt-2"><StateList title="FOP-1 (sender)" states={FOP_STATES} current={s.fop} /></div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-fg-2">V(S) next to send</dt><dd className="font-mono text-lg">{s.vs}</dd></div>
            <div><dt className="text-fg-2">NN(R) oldest unacked</dt><dd className="font-mono text-lg">{s.nnr}</dd></div>
            <div className="col-span-2"><dt className="text-fg-2">Sent queue</dt><dd className="font-mono">{s.sent.length ? s.sent.map((n) => `#${n}`).join(', ') : '—'}</dd></div>
          </dl>
        </section>

        <section className="card p-4" aria-label="Space link">
          <p className="t-overline text-fg-2">Space link</p>
          <p className="mt-2 text-sm"><span className="font-medium" style={{ color: 'var(--diagram-uplink)' }}>Uplink · TC frames →</span></p>
          <p className="mt-1 text-sm text-fg-2">{s.dropNext ? 'Next frame will be lost (simulated fade).' : 'Link clear.'}</p>
          <p className="mt-4 text-sm"><span className="font-medium" style={{ color: 'var(--diagram-downlink)' }}>← Downlink · CLCW</span></p>
          <dl className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm" aria-live="polite">
            <div><dt className="font-sans text-fg-2">Report N(R)</dt><dd className="text-lg">{c.nr}</dd></div>
            <div><dt className="font-sans text-fg-2">Retransmit</dt><dd className="text-lg">{+c.retransmit}</dd></div>
            <div><dt className="font-sans text-fg-2">Lockout</dt><dd className="text-lg">{+c.lockout}</dd></div>
            <div><dt className="font-sans text-fg-2">Wait</dt><dd className="text-lg">{+c.wait}</dd></div>
            <div><dt className="font-sans text-fg-2">FARM-B</dt><dd className="text-lg">{c.farmB}</dd></div>
          </dl>
        </section>

        <section className="card p-4" aria-label="Spacecraft: FARM-1">
          <p className="t-overline text-fg-2">Spacecraft · command receiver</p>
          <div className="mt-2"><StateList title="FARM-1 (receiver)" states={FARM_STATES} current={s.farm} /></div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-fg-2">V(R) next expected</dt><dd className="font-mono text-lg">{s.vr}</dd></div>
            <div><dt className="text-fg-2">Window W</dt><dd className="font-mono text-lg">{s.W}</dd></div>
            <div className="col-span-2"><dt className="text-fg-2">Accepted frames</dt><dd className="font-mono">{s.accepted.length ? s.accepted.map((n) => `#${n}`).join(', ') : '—'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="card p-4" aria-label="Simulator log">
        <div className="flex items-center justify-between">
          <p className="t-label">cop1-sim.log · fictional data</p>
        </div>
        <ol className="mt-2 max-h-72 overflow-y-auto rounded-md bg-code p-3 font-mono text-[13px] leading-6 text-[var(--text-code)]" tabIndex={0} aria-label="Event log, newest last">
          {s.log.map((l, i) => <li key={i}><span className="opacity-60">{String(i).padStart(3, '0')} </span>{l}</li>)}
        </ol>
        <p className="t-small mt-2 text-fg-2">Simplified model of CCSDS 232.1-B-2: timers, the transmission limit and the full FOP-1 state table are left out. State and variable names follow the standard; window size and values are fictional.</p>
      </section>
    </div>
  );
}
