import type { SyncState } from '../../lib/framesync';

// SEARCH → ACQUIRE → LOCK ⇄ FLYWHEEL state diagram (CCSDS 130.1-G-3 §9.3.7); the
// active state is filled and named in text.
const NODES: Record<SyncState, { x: number; y: number; label: string }> = {
  SEARCH: { x: 70, y: 50, label: 'SEARCH' },
  ACQUIRE: { x: 230, y: 50, label: 'ACQUIRE' },
  LOCK: { x: 230, y: 170, label: 'LOCK' },
  FLYWHEEL: { x: 70, y: 170, label: 'FLYWHEEL' },
};

export default function SyncStateDiagram({ state }: { state: SyncState }) {
  const arrow = (a: SyncState, b: SyncState, label: string, dx = 0, dy = 0) => {
    const A = NODES[a], B = NODES[b];
    const ang = Math.atan2(B.y - A.y, B.x - A.x);
    const r = 34;
    const x1 = A.x + r * Math.cos(ang) + dx, y1 = A.y + r * Math.sin(ang) + dy;
    const x2 = B.x - r * Math.cos(ang) + dx, y2 = B.y - r * Math.sin(ang) + dy;
    const active = state === b;
    return (
      <g key={`${a}-${b}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? 'var(--bg-accent)' : 'var(--border-strong)'} strokeWidth={active ? 2 : 1.2} markerEnd="url(#sd-arrow)" />
        <text x={(x1 + x2) / 2 + (dy ? 0 : 0)} y={(y1 + y2) / 2 - 4 + dy * 0.3} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{label}</text>
      </g>
    );
  };
  return (
    <figure className="card p-4">
      <figcaption className="t-label">Synchronizer state: <span className="t-readout text-link">{state}</span></figcaption>
      <svg viewBox="0 0 300 220" className="mt-2 w-full" role="img" aria-label={`State diagram; current state ${state}`}>
        <defs>
          <marker id="sd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--text-secondary)" /></marker>
        </defs>
        {arrow('SEARCH', 'ACQUIRE', 'marker found')}
        {arrow('ACQUIRE', 'LOCK', 'confirmed')}
        {arrow('LOCK', 'FLYWHEEL', 'miss', 0, -10)}
        {arrow('FLYWHEEL', 'LOCK', 'found again', 0, 10)}
        {arrow('FLYWHEEL', 'SEARCH', 'too many misses')}
        {(Object.keys(NODES) as SyncState[]).map((k) => {
          const n = NODES[k];
          const on = k === state;
          return (
            <g key={k}>
              <circle cx={n.x} cy={n.y} r="32" fill={on ? 'var(--bg-accent)' : 'var(--bg-subtle)'} stroke={on ? 'var(--bg-accent)' : 'var(--border-strong)'} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill={on ? 'var(--text-on-accent)' : 'var(--text-primary)'}>{n.label}</text>
            </g>
          );
        })}
      </svg>
      <p className="t-small text-fg-2">ACQUIRE also drops back to SEARCH if a confirmation fails. Counts are configuration choices.</p>
    </figure>
  );
}
