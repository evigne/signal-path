import { useState } from 'react';
import { TREE } from '../../lib/chain';

// Scenario A from the Penpot troubleshooting screen and content/symptoms (fictional).
const SCENARIO_A = {
  title: 'Scenario A · Carrier detected, but no frame lock',
  tests: [
    { name: 'Check demodulator lock states', log: ['09:12:04Z INFO carrier lock: LOCK  Eb/N0 = 9.1 dB', '09:12:05Z INFO symbol lock: LOCK'] },
    { name: 'Inspect frame synchronizer status', log: ['09:12:05Z WARN frame sync: SEARCH  ASM matches 0/120'] },
    { name: 'Compare ASM configuration', log: ['09:12:30Z INFO config: ASM 1ACFFC1D, polarity normal'] },
    { name: 'Capture raw bit dump', log: ['09:12:31Z INFO raw dump: … E5 30 03 E2 … (repeats every frame)'] },
    { name: 'Check spectrum analyzer', log: ['09:12:35Z INFO spectrum: carrier at expected frequency, clean'] },
    { name: 'Query provider pass status', log: ['09:12:40Z INFO provider: pass active, configuration v12 as scheduled'] },
  ],
  hypotheses: [
    { text: 'Inverted bitstream: ASM polarity mismatch', correct: true, why: 'Carrier and symbol lock are fine, so RF and demodulation work. The raw dump repeats E5 30 03 E2, the bitwise inverse of 1ACFFC1D: the bit stream is inverted (for example a 180° phase ambiguity). Fix: enable polarity or ambiguity resolution in the synchronizer configuration.' },
    { text: 'Clock jitter causing bit slips', correct: false, why: 'Bit slips would show markers found and then lost; here no marker is ever matched, but its inverse repeats exactly.' },
    { text: 'FARM-1 in Lockout', correct: false, why: 'FARM-1 is the spacecraft’s command receiver; it cannot affect downlink frame sync.' },
    { text: 'Ground WAN/VPN drop', correct: false, why: 'Frame sync happens at the station, before any network delivery.' },
  ],
};

export default function DecisionTree() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(TREE.map(() => null));
  const [ran, setRan] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  const firstNo = answers.findIndex((a) => a === false);
  const current = firstNo === -1 ? answers.findIndex((a) => a === null) : -1;

  const answer = (i: number, v: boolean) => {
    const next = answers.slice(0, i).concat([v], TREE.slice(i + 1).map(() => null));
    setAnswers(next);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5" aria-labelledby="tree-h">
        <h3 id="tree-h" className="t-h4">Layered decision tree</h3>
        <p className="t-small mt-1 text-fg-2">Work top to bottom. Stop at the first “No” and follow its guide.</p>
        <ol className="mt-4 space-y-2">
          {TREE.map((n, i) => {
            const a = answers[i];
            const active = i === current;
            const hidden = firstNo !== -1 && i > firstNo;
            return (
              <li key={n.layer} className={`rounded-lg border p-3 ${active ? 'border-[var(--border-focus)] bg-accent-subtle' : 'border-line'} ${hidden ? 'opacity-50' : ''}`}>
                <p className="t-overline text-fg-2">Layer {i + 1} · {n.layer}</p>
                <p className="mt-1 text-[15px] font-medium">{n.question}</p>
                {!hidden && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button type="button" aria-pressed={a === true} className={`btn !py-1.5 ${a === true ? 'btn-primary' : 'btn-secondary'}`} onClick={() => answer(i, true)}>Yes</button>
                    <button type="button" aria-pressed={a === false} className={`btn !py-1.5 ${a === false ? 'btn-primary' : 'btn-secondary'}`} onClick={() => answer(i, false)}>No</button>
                    <a href={`/topics/${n.topic}/`} className="text-sm">Learn this layer</a>
                  </div>
                )}
                {a === false && (
                  <p className="mt-2 rounded-md bg-[var(--status-warn-bg)] p-2 text-sm text-[var(--status-warn-fg)]">
                    First “No” at layer {i + 1}. Next: <a href={n.no.href}>{n.no.text}</a>
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {answers.every((a) => a === true) && <p className="mt-3 text-sm text-[var(--status-ok-fg)]">✓ Every layer healthy — the data should be in the archive. Recheck the time range you queried.</p>}
        <button type="button" className="btn btn-ghost mt-3 !px-0" onClick={() => setAnswers(TREE.map(() => null))}>Reset tree</button>
      </section>

      <section className="card p-5" aria-labelledby="scen-h">
        <h3 id="scen-h" className="t-h4">{SCENARIO_A.title}</h3>
        <p className="t-small mt-1 text-fg-2">Run diagnostics to reveal log lines, then submit a root-cause hypothesis. Fictional data, not from a real mission.</p>
        <ul className="mt-3 space-y-1.5">
          {SCENARIO_A.tests.map((t, i) => (
            <li key={t.name} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <span>{t.name}</span>
              <button type="button" className="btn btn-secondary !px-3 !py-1" disabled={ran.has(i)} onClick={() => setRan(new Set([...ran, i]))}>{ran.has(i) ? 'Ran' : 'Run'}</button>
            </li>
          ))}
        </ul>
        <ol className="mt-3 min-h-[96px] rounded-md bg-code p-3 font-mono text-[13px] leading-6 text-[var(--text-code)]" aria-live="polite" aria-label="Pass log">
          {SCENARIO_A.tests.flatMap((t, i) => (ran.has(i) ? t.log : [])).map((l) => <li key={l}>{l}</li>)}
          {ran.size === 0 && <li className="opacity-70">pass-gs-fict-2.log — run a diagnostic</li>}
        </ol>
        <fieldset className="mt-4">
          <legend className="t-label">Root-cause hypothesis</legend>
          <div className="mt-2 space-y-1.5">
            {SCENARIO_A.hypotheses.map((h, i) => (
              <label key={h.text} className="flex items-center gap-2 text-sm">
                <input type="radio" name="hyp" checked={picked === i} onChange={() => setPicked(i)} /> {h.text}
              </label>
            ))}
          </div>
        </fieldset>
        {picked !== null && (
          <div className={`mt-3 rounded-md p-3 text-sm ${SCENARIO_A.hypotheses[picked].correct ? 'bg-[var(--status-ok-bg)]' : 'bg-[var(--status-error-bg)]'}`} role="status">
            <p className={`font-semibold ${SCENARIO_A.hypotheses[picked].correct ? 'text-[var(--status-ok-fg)]' : 'text-[var(--status-error-fg)]'}`}>{SCENARIO_A.hypotheses[picked].correct ? '✓ Correct' : '✗ Not the root cause'}</p>
            <p className="mt-1">{SCENARIO_A.hypotheses[picked].why}</p>
            {ran.size < 4 && SCENARIO_A.hypotheses[picked].correct && <p className="t-small mt-1 text-fg-2">Tip: the raw bit dump is the decisive evidence — run it before deciding.</p>}
          </div>
        )}
        <p className="t-small mt-3 text-fg-2">Real investigations follow your mission's anomaly procedures and involve the provider and flight teams. Phase-ambiguity resolution: CCSDS 401.0-B-32 §2.4.11.</p>
      </section>
    </div>
  );
}
