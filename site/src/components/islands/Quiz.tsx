import { useId, useMemo, useState } from 'react';

type Choice = { text: string; correct: boolean; feedback?: string };
type Item = {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'numeric' | 'decode';
  prompt: string;
  data?: string;
  choices?: Choice[];
  answer?: { value?: number | string; tolerance?: number; unit?: string; fields?: Record<string, number | string> };
  explanation: string;
  label: 'standard' | 'practice' | 'example' | 'mission';
  sources?: { id: string; loc?: string }[];
};

const LABEL_TEXT = { standard: 'Standard-defined', practice: 'Common practice', example: 'Illustrative example', mission: 'Mission-specific' };

// Deterministic order so server and client render the same markup; the stored order
// always puts the correct answer first, so it must never be shown as stored.
function seededOrder<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = arr.map((v, i) => ({ v, k: ((h ^ (i * 2654435761)) >>> 0) % 1000003 }));
  return out.sort((a, b) => a.k - b.k).map((x) => x.v);
}

function parseNumber(s: string): number | null {
  const t = s.trim().replace(/[,_\s]/g, '');
  if (!t) return null;
  const n = /^0x[0-9a-f]+$/i.test(t) ? parseInt(t, 16) : Number(t);
  return Number.isFinite(n) ? n : null;
}

function matches(expected: number | string, given: string, tol = 0): boolean {
  if (typeof expected === 'number') {
    const n = parseNumber(given);
    return n !== null && Math.abs(n - expected) <= tol + 1e-9;
  }
  return given.trim().toLowerCase() === String(expected).toLowerCase();
}

function QuizItem({ item, quizId, index }: { item: Item; quizId: string; index: number }) {
  const uid = useId();
  const choices = useMemo(() => (item.choices ? seededOrder(item.choices, `${quizId}/${item.id}`) : []), [item, quizId]);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [value, setValue] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<null | boolean>(null);

  const check = () => {
    if (item.type === 'single-choice' || item.type === 'multi-choice') {
      const ok = choices.every((c, i) => c.correct === picked.has(i)) && picked.size > 0;
      setResult(ok);
    } else if (item.type === 'numeric') {
      setResult(item.answer?.value !== undefined && matches(item.answer.value, value, item.answer.tolerance));
    } else {
      const f = item.answer?.fields ?? {};
      setResult(Object.entries(f).every(([k, v]) => matches(v, fields[k] ?? '')));
    }
  };

  const toggle = (i: number) => {
    setResult(null);
    setPicked((prev) => {
      const next = new Set(item.type === 'single-choice' ? [] : prev);
      if (prev.has(i) && item.type === 'multi-choice') next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <fieldset className="card p-5">
      <legend className="sr-only">Question {index + 1}</legend>
      <p className="t-overline text-fg-2">Question {index + 1}</p>
      <p className="mt-1 text-[17px] leading-7 font-medium">{item.prompt}</p>
      {item.data && (
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-code px-2 py-1 text-[14px] text-[var(--text-code)]">{item.data}</code>
          <span className="text-xs text-fg-muted">fictional data</span>
        </p>
      )}

      {(item.type === 'single-choice' || item.type === 'multi-choice') && (
        <div className="mt-3 space-y-2" role={item.type === 'single-choice' ? 'radiogroup' : 'group'}>
          {choices.map((c, i) => {
            const id = `${uid}-${i}`;
            const sel = picked.has(i);
            const state = result === null ? '' : c.correct ? 'border-[var(--status-ok-fg)]' : sel ? 'border-[var(--status-error-fg)]' : '';
            return (
              <label key={i} htmlFor={id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[15px] leading-6 ${sel ? 'border-[var(--border-focus)] bg-accent-subtle' : 'border-line'} ${state}`}>
                <input
                  id={id}
                  type={item.type === 'single-choice' ? 'radio' : 'checkbox'}
                  name={`${uid}-q`}
                  checked={sel}
                  onChange={() => toggle(i)}
                  className="mt-1 h-4 w-4 accent-[var(--bg-accent)]"
                />
                <span>
                  {c.text}
                  {result !== null && c.correct && <span className="ml-2 text-xs font-semibold text-[var(--status-ok-fg)]">✓ correct answer</span>}
                  {result !== null && sel && !c.correct && <span className="ml-2 text-xs font-semibold text-[var(--status-error-fg)]">✗ your answer</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {item.type === 'numeric' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor={`${uid}-n`} className="sr-only">Your answer</label>
          <input id={`${uid}-n`} inputMode="decimal" value={value} onChange={(e) => { setValue(e.target.value); setResult(null); }} className="field-input max-w-[220px]" placeholder="Your answer" />
          {item.answer?.unit && <span className="text-sm text-fg-2">{item.answer.unit}</span>}
        </div>
      )}

      {item.type === 'decode' && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.keys(item.answer?.fields ?? {}).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0 font-mono text-fg-2">{k}</span>
              <input value={fields[k] ?? ''} onChange={(e) => { setFields({ ...fields, [k]: e.target.value }); setResult(null); }} className="field-input" inputMode="numeric" />
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={check}>Check answer</button>
        {result !== null && (
          <button type="button" className="btn btn-ghost" onClick={() => { setResult(null); setPicked(new Set()); setValue(''); setFields({}); }}>Try again</button>
        )}
      </div>

      <div aria-live="polite">
        {result !== null && (
          <div className={`mt-4 rounded-lg p-4 text-[15px] leading-6 ${result ? 'bg-[var(--status-ok-bg)]' : 'bg-[var(--status-error-bg)]'}`}>
            <p className={`font-semibold ${result ? 'text-[var(--status-ok-fg)]' : 'text-[var(--status-error-fg)]'}`}>{result ? '✓ Correct' : '✗ Not quite'}</p>
            {!result && item.type === 'numeric' && item.answer?.value !== undefined && (
              <p className="mt-1">Expected {String(item.answer.value)}{item.answer.unit ? ` ${item.answer.unit}` : ''}{item.answer.tolerance ? ` (±${item.answer.tolerance})` : ''}.</p>
            )}
            {!result && item.type === 'decode' && (
              <p className="mt-1 font-mono text-sm">{Object.entries(item.answer?.fields ?? {}).map(([k, v]) => `${k} = ${v}`).join(' · ')}</p>
            )}
            <p className="mt-1">{item.explanation}</p>
            <p className="mt-2 text-xs text-fg-2">
              {LABEL_TEXT[item.label]}
              {item.sources?.length ? <> · {item.sources.map((s, i) => <span key={s.id}>{i > 0 && ', '}<a href={`/sources/#${s.id}`}>{s.id}</a>{s.loc ? ` ${s.loc}` : ''}</span>)}</> : null}
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

export default function Quiz({ items, quizId }: { items: Item[]; quizId: string }) {
  return (
    <div className="space-y-4">
      {items.map((it, i) => <QuizItem key={it.id} item={it} quizId={quizId} index={i} />)}
    </div>
  );
}
