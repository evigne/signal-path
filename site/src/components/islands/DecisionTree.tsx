import { useState } from 'react';
import { TREE, UPLINK_TREE } from '../../lib/chain';
import { SCENARIOS, LOW_VALUE_REASON } from '../../lib/scenarios';

// Tool 9: layered decision tree plus four scripted, fictional anomaly scenarios
// (content/labs/anomaly-decision-tree.yaml).

export default function DecisionTree() {
  const [sid, setSid] = useState(0);
  const sc = SCENARIOS[sid];
  const tree = sc.tree === 'uplink' ? UPLINK_TREE : TREE;
  const [answers, setAnswers] = useState<(boolean | null)[]>(TREE.map(() => null));
  const [ran, setRan] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  const firstNo = answers.slice(0, tree.length).findIndex((a) => a === false);
  const current = firstNo === -1 ? answers.slice(0, tree.length).findIndex((a) => a === null) : -1;

  const answer = (i: number, v: boolean) => setAnswers(answers.slice(0, i).concat([v], tree.slice(i + 1).map(() => null)));
  const choose = (i: number) => {
    setSid(i);
    setRan([]);
    setPicked(null);
    setAnswers(TREE.map(() => null));
  };
  const lowRuns = ran.filter((i) => sc.tests[i].lowValue).length;
  const hyp = picked !== null ? sc.hypotheses[picked] : null;

  return (
    <div className="space-y-6">
      <div className="panel" role="group" aria-label="Scenario">
        <div className="panel-head"><span>Module 09 // Anomaly scenarios</span><span>{sid + 1} of {SCENARIOS.length} · fictional</span></div>
        <div className="flex flex-wrap gap-2 p-4">
          {SCENARIOS.map((s, i) => (
            <button key={s.id} type="button" aria-pressed={i === sid} className={`btn !py-1.5 ${i === sid ? 'btn-primary' : 'btn-secondary'}`} onClick={() => choose(i)}>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="scen-h">
          <h3 id="scen-h" className="t-h4">Scenario {sc.title}</h3>
          <p className="t-label mt-3">Opening alarm</p>
          <ol className="t-readout mt-1 rounded-md bg-code p-3 text-[13px] leading-6 text-[var(--text-code)]" aria-label="Opening log">
            {sc.opening.map((l) => <li key={l}>{l}</li>)}
          </ol>
          <p className="t-small mt-2 text-fg-2"><strong className="text-fg">Already looks healthy:</strong> {sc.healthy}</p>

          <p className="t-label mt-4">Diagnostic tests</p>
          <ul className="mt-2 space-y-1.5">
            {sc.tests.map((t, i) => {
              const done = ran.includes(i);
              return (
                <li key={t.name} className="rounded-md border border-line px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {t.name}
                      <span className="t-readout ml-2 text-xs text-fg-muted">L{t.layer + 1} · {tree[t.layer].layer}</span>
                    </span>
                    <button type="button" className="btn btn-secondary !px-3 !py-1" disabled={done} onClick={() => setRan([...ran, i])}>{done ? 'Ran' : 'Run'}</button>
                  </div>
                  {done && t.lowValue && <p className="mt-1 text-xs text-[var(--status-warn-fg)]">Low value (downstream already healthy): this layer was {LOW_VALUE_REASON}.</p>}
                </li>
              );
            })}
          </ul>
          <ol className="t-readout mt-3 min-h-[96px] rounded-md bg-code p-3 text-[13px] leading-6 text-[var(--text-code)]" aria-live="polite" aria-label="Pass log">
            {ran.flatMap((i) => sc.tests[i].log).map((l) => <li key={l}>{l}</li>)}
            {ran.length === 0 && <li className="opacity-70">Run a diagnostic to add log lines</li>}
          </ol>

          <fieldset className="mt-4">
            <legend className="t-label">Root-cause hypothesis</legend>
            <div className="mt-2 space-y-1.5">
              {sc.hypotheses.map((h, i) => (
                <label key={h.text} className="flex items-start gap-2 text-sm">
                  <input type="radio" className="mt-1" name={`hyp-${sc.id}`} checked={picked === i} onChange={() => setPicked(i)} /> {h.text}
                </label>
              ))}
            </div>
          </fieldset>
          {hyp && (
            <div className={`mt-3 rounded-md p-3 text-sm ${hyp.correct ? 'bg-[var(--status-ok-bg)]' : 'bg-[var(--status-error-bg)]'}`} role="status">
              <p className={`font-semibold ${hyp.correct ? 'text-[var(--status-ok-fg)]' : 'text-[var(--status-error-fg)]'}`}>{hyp.correct ? '✓ Correct' : '✗ Not the root cause'}</p>
              <p className="mt-1">{hyp.why}</p>
              {hyp.correct && (
                <p className="t-small mt-2 text-fg-2">
                  First bad layer: L{sc.firstBad + 1} · {tree[sc.firstBad].layer}. Tests run: {ran.length} ({lowRuns} low value).
                  {!ran.includes(sc.keyEvidence) && <> The decisive evidence is “{sc.tests[sc.keyEvidence].name}” — run it to confirm.</>}
                  {' '}Learn: <a href={sc.learn.href}>{sc.learn.label}</a>
                </p>
              )}
            </div>
          )}
          <button type="button" className="btn btn-ghost mt-3 !px-0" onClick={() => choose(sid)}>Reset scenario</button>
        </section>

        <section className="card p-5" aria-labelledby="tree-h">
          <h3 id="tree-h" className="t-h4">{sc.tree === 'uplink' ? 'Uplink' : 'Downlink'} decision tree</h3>
          <p className="t-small mt-1 text-fg-2">Work top to bottom. Stop at the first “No” and follow its guide.</p>
          <ol className="mt-4 space-y-2">
            {tree.map((n, i) => {
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
                      First “No” at layer {i + 1}{i === sc.firstBad ? ' — matches this scenario' : ''}. Next: <a href={n.no.href}>{n.no.text}</a>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          {answers.slice(0, tree.length).every((a) => a === true) && <p className="mt-3 text-sm text-[var(--status-ok-fg)]">✓ Every layer healthy — recheck the time range or command you are looking at.</p>}
        </section>
      </div>
      <p className="t-small text-fg-2">Real investigations follow your mission's anomaly procedures and involve the provider and flight teams. Logs and values are fictional.</p>
    </div>
  );
}
