import { useEffect, useState } from 'react';
import { EVENT, clearAll, readDone } from './progress';

type Module = { title: string; topics: string[] };

export default function PathProgress({ modules, titles }: { modules: Module[]; titles: Record<string, string> }) {
  const [done, setDoneSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    const sync = () => setDoneSet(readDone());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const complete = modules.filter((m) => m.topics.every((t) => done.has(t))).length;
  const pct = Math.round((complete / modules.length) * 100);
  const next = modules.find((m) => !m.topics.every((t) => done.has(t)));
  const nextTopic = next?.topics.find((t) => !done.has(t));
  const all = modules.flatMap((m) => m.topics);
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="t-label">Path progress</span>
        <span className="t-label-sm text-fg-2">{complete} of {modules.length} modules · {pct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuemin={0} aria-valuemax={modules.length} aria-valuenow={complete} aria-label="Modules completed">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="t-label-sm mt-2 text-fg-muted">
        {next ? <>Next: {next.title}{nextTopic ? <> · <a href={`/topics/${nextTopic}/`}>{titles[nextTopic] ?? nextTopic}</a></> : null}</> : 'Path complete'} · stored in this browser only
      </p>
      {done.size > 0 && (
        <button type="button" className="btn btn-ghost mt-2 !px-0" onClick={() => clearAll(all)}>Reset progress</button>
      )}
    </div>
  );
}
