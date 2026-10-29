import { useEffect, useState } from 'react';
import { EVENT, readDone, setDone } from './progress';

export default function MarkDone({ topicId }: { topicId: string }) {
  const [done, set] = useState(false);
  useEffect(() => {
    const sync = () => set(readDone().has(topicId));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [topicId]);
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => setDone(topicId, !done)}
      className={`btn ${done ? 'btn-secondary' : 'btn-primary'}`}
    >
      {done ? '✓ Marked as done' : 'Mark this topic as done'}
    </button>
  );
}
