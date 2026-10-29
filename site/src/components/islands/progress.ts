// Per-reader progress, kept only in this browser (localStorage). Storage can be
// unavailable (private mode, blocked site data), so every access is guarded.
const KEY = 'sp-done-topics';
export const EVENT = 'sp-progress';

export function readDone(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setDone(id: string, done: boolean) {
  const s = readDone();
  if (done) s.add(id);
  else s.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* storage unavailable: progress lasts for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearAll(ids: string[]) {
  const s = readDone();
  ids.forEach((i) => s.delete(i));
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}
