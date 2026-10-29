import { useState } from 'react';
import { clcw, init, mod, processClcw, reinit, sendAD, sendBD, setBusy, timerExpiry, unlock, windowZone, type Cop1 } from '../../lib/cop1';

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

const PRESETS: { name: string; make: () => Cop1 }[] = [
  { name: 'Clean', make: () => init(10) },
  { name: 'LEO CubeSat pass (drop one frame)', make: () => ({ ...init(10), dropNext: true }) },
  { name: 'Jump outside window', make: () => sendAD(init(10), 30) },
  { name: 'Spacecraft busy', make: () => setBusy(init(10), true) },
];

const ZONE = {
  expected: { fill: 'var(--status-ok-bg)', stroke: 'var(--status-ok-fg)', label: 'expected V(R)' },
  positive: { fill: 'var(--bg-accent-subtle)', stroke: 'var(--text-link)', label: 'positive window' },
  negative: { fill: 'var(--bg-subtle)', stroke: 'var(--text-secondary)', label: 'negative window' },
  lockout: { fill: 'var(--status-error-bg)', stroke: 'var(--status-error-fg)', label: 'lockout zone' },
} as const;

/** FARM-1 sliding window around V(R), modulo 256. */
function WindowStrip({ s }: { s: Cop1 }) {
  const span = Array.from({ length: 22 }, (_, i) => mod(s.vr - 8 + i));
  const last = [...s.log].reverse().map((l) => /AD N\(S\)=(\d+)/.exec(l)).find(Boolean);
  const lastNs = last ? Number(last[1]) : null;
  const w = 30;
  return (
    <figure className="card min-w-0 p-4">
      <figcaption className="t-label">FARM-1 sliding window · W = {s.W}, PW = NW = {s.W / 2} · numbers wrap at 256</figcaption>
      <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Sliding window diagram">
        <svg viewBox={`0 0 ${span.length * w + 10} 78`} className="min-w-[600px] w-full" role="img" aria-label={`V(R) = ${s.vr}. Positive window ${mod(s.vr + 1)} to ${mod(s.vr + s.W / 2 - 1)}; negative window ${mod(s.vr - s.W / 2)} to ${mod(s.vr - 1)}; anything else locks out.${lastNs !== null ? ` Last frame N(S) = ${lastNs}, ${windowZone(s, lastNs)}.` : ''}`}>
          {span.map((n, i) => {
            const z = ZONE[windowZone(s, n)];
            return (
              <g key={i}>
                <rect x={5 + i * w} y="16" width={w - 3} height="30" rx="4" fill={z.fill} stroke={z.stroke} strokeWidth={n === s.vr ? 2.5 : 1} />
                <text x={5 + i * w + (w - 3) / 2} y="36" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-primary)">{n}</text>
                {n === lastNs && <path d={`M${5 + i * w + (w - 3) / 2 - 6} 8 h12 l-6 7 z`} fill="var(--diagram-uplink)" />}
              </g>
            );
          })}
          <text x="5" y="64" fontSize="11" fill="var(--text-secondary)">◄ lockout · negative window · V(R) · positive window · lockout ►{lastNs !== null ? `   ▼ last N(S) = ${lastNs}` : ''}</text>
        </svg>
      </div>
    </figure>
  );
}

/** Recent traffic between FOP-1 and FARM-1, parsed from the log. */
function Lane({ s }: { s: Cop1 }) {
  type Item = { dir: 'up' | 'down' | 'lost'; text: string };
  const items = s.log.slice(-14).flatMap((l): Item[] => {
    let m = /transmit (AD|BD|BC)(?: N\(S\)=(\d+))?/.exec(l);
    if (m) return [{ dir: 'up', text: `${m[1]}${m[2] ? ' ' + m[2] : ''}` }];
    m = /Link: .*lost/.exec(l);
    if (m) return [{ dir: 'lost', text: 'lost' }];
    m = /CLCW: N\(R\)=(\d+) Lockout=(\d) Wait=(\d) Retransmit=(\d)/.exec(l);
    if (m) return [{ dir: 'down', text: `CLCW N(R)=${m[1]}${m[2] === '1' ? ' LO' : ''}${m[3] === '1' ? ' W' : ''}${m[4] === '1' ? ' RT' : ''}` }];
    return [];
  }).slice(-8);
  return (
    <figure className="card min-w-0 p-4">
      <figcaption className="t-label">Frame lane · ground FOP-1 ⇄ spacecraft FARM-1 (latest right)</figcaption>
      <ol className="t-readout mt-3 flex flex-wrap gap-2 text-xs" aria-label="Recent frames">
        {items.length === 0 && <li className="text-fg-muted">No traffic yet</li>}
        {items.map((it, i) => (
          <li key={i} className="rounded-md border px-2 py-1" style={{ borderColor: it.dir === 'up' ? 'var(--diagram-uplink)' : it.dir === 'down' ? 'var(--diagram-downlink)' : 'var(--status-error-fg)', color: it.dir === 'lost' ? 'var(--status-error-fg)' : 'var(--text-primary)' }}>
            {it.dir === 'up' ? '↑ ' : it.dir === 'down' ? '↓ ' : '✗ '}{it.text}
          </li>
        ))}
      </ol>
      <p className="t-small mt-2 text-fg-2">↑ uplink TC frames (orange) · ↓ downlink CLCW reports (teal) · ✗ lost on the link</p>
    </figure>
  );
}

export default function Cop1Sim() {
  const [s, setS] = useState<Cop1>(() => init(10));
  const [auto, setAuto] = useState(false);
  const c = clcw(s);
  const act = (f: (x: Cop1) => Cop1) => setS((x) => (auto ? processClcw(f(x)) : f(x)));

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-head"><span>Module 06 // COP-1 simulator</span><span>FOP-1 ⇄ FARM-1 · fictional</span></div>
        <div className="flex flex-wrap gap-2 p-4" role="group" aria-label="Presets">
          {PRESETS.map((p) => <button key={p.name} type="button" className="btn btn-secondary !py-1.5" onClick={() => setS(p.make())}>{p.name}</button>)}
          <label className="flex items-center gap-2 pl-2 text-sm"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-4 w-4" /> Auto CLCW (ground reads the report after every frame)</label>
        </div>
      </div>
      <div className="card flex flex-wrap gap-2 p-4" role="toolbar" aria-label="Simulator controls">
        <button type="button" className="btn btn-primary" onClick={() => act(sendAD)}>Send AD frame</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(processClcw)}>Read CLCW (ground reacts)</button>
        <button type="button" className="btn btn-secondary" onClick={() => setS(timerExpiry)}>T1 timer expires</button>
        <button type="button" className="btn btn-secondary" onClick={() => act(sendBD)}>Send BD frame</button>
        <label className="btn btn-secondary cursor-pointer">
          <input type="checkbox" checked={s.dropNext} onChange={(e) => setS({ ...s, dropNext: e.target.checked })} className="h-4 w-4" /> Drop next frame
        </label>
        <label className="btn btn-secondary cursor-pointer">
          <input type="checkbox" checked={s.busy} onChange={(e) => act((x) => setBusy(x, e.target.checked))} className="h-4 w-4" /> Spacecraft busy
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => act((x) => sendAD(x, mod(x.vr + 20)))}>Jump outside window</button>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <WindowStrip s={s} />
        <Lane s={s} />
      </div>

      <section className="card p-4" aria-label="Simulator log">
        <div className="flex items-center justify-between">
          <p className="t-label">cop1-sim.log · fictional data</p>
        </div>
        <ol className="mt-2 max-h-72 overflow-y-auto rounded-md bg-code p-3 font-mono text-[13px] leading-6 text-[var(--text-code)]" tabIndex={0} aria-label="Event log, newest last">
          {s.log.map((l, i) => <li key={i}><span className="opacity-60">{String(i).padStart(3, '0')} </span>{l}</li>)}
        </ol>
        <p className="t-small mt-2 text-fg-2">Simplified model of CCSDS 232.1-B-2: T1 is a button rather than a clock, and the transmission limit, alerts and the full FOP-1 state table are left out. State and variable names follow the standard; window size and values are fictional.</p>
      </section>
    </div>
  );
}
