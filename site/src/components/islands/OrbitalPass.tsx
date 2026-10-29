import { useEffect, useMemo, useRef, useState } from 'react';
import { maskAngleDeg, passDurationS, passPoint } from '../../lib/orbit';

// Home-page hero: a fictional LEO spacecraft (550 km) passes over a ground station.
// Physics readouts are computed; the drawing exaggerates altitude so the arc is visible.

const ALT = 550;
const MASK = 5;
const SPAN = 27; // degrees of orbit shown either side of the station's zenith

// Drawing geometry (px)
const W = 640;
const H = 320;
const CX = 320;
const EARTH_R = 560;
const SY = 250; // station
const CY = SY + EARTH_R;
const ORBIT_R = EARTH_R + 120;

const toXY = (phiDeg: number, radius: number) => {
  const p = (phiDeg * Math.PI) / 180;
  return { x: CX + radius * Math.sin(p), y: CY - radius * Math.cos(p) };
};

const fmt = (s: number) => `${s < 0 ? '−' : '+'}${String(Math.floor(Math.abs(s) / 60)).padStart(2, '0')}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, '0')}`;

export default function OrbitalPass() {
  const mask = useMemo(() => maskAngleDeg(ALT, MASK), []);
  const duration = useMemo(() => passDurationS(ALT, MASK), []);
  const [t, setT] = useState(0.22); // 0..1 across the drawn arc
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((v) => (v + dt / 24) % 1); // one sweep every 24 s
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const phi = -SPAN + t * 2 * SPAN;
  const pt = passPoint(phi, ALT);
  const visible = pt.elevationDeg >= MASK;
  const secondsFromTca = (phi / (2 * mask)) * duration;
  const state = !visible ? (phi < 0 ? 'Before AOS' : 'After LOS') : Math.abs(phi) < 1.2 ? 'Max elevation' : phi < 0 ? 'Pass active · rising' : 'Pass active · setting';

  const sat = toXY(phi, ORBIT_R);
  const station = { x: CX, y: SY };
  const aos = toXY(-mask, ORBIT_R);
  const los = toXY(mask, ORBIT_R);
  const arcStart = toXY(-SPAN, ORBIT_R);
  const arcEnd = toXY(SPAN, ORBIT_R);
  const moc = { x: CX + 178, y: SY + 46 };

  return (
    <div className="panel overflow-hidden" data-testid="orbital-pass">
      <div className="panel-head">
        <span><span className="dot" aria-hidden="true" />Module 00 // Orbital pass</span>
        <span>SP-1 (fictional) · LEO {ALT} km · mask {MASK}°</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`A spacecraft crosses the sky over a ground station. ${state}; elevation ${Math.max(0, pt.elevationDeg).toFixed(0)} degrees.`}>
        <defs>
          <radialGradient id="op-earth" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--bg-accent-subtle)" />
            <stop offset="100%" stopColor="var(--bg-canvas)" />
          </radialGradient>
        </defs>
        {/* visibility cone */}
        <path d={`M${station.x} ${station.y} L${aos.x} ${aos.y} A${ORBIT_R} ${ORBIT_R} 0 0 1 ${los.x} ${los.y} Z`} fill="var(--diagram-downlink)" opacity={visible ? 0.14 : 0.07} />
        <line x1={station.x} y1={station.y} x2={aos.x} y2={aos.y} stroke="var(--diagram-downlink)" strokeDasharray="4 5" opacity="0.7" />
        <line x1={station.x} y1={station.y} x2={los.x} y2={los.y} stroke="var(--diagram-downlink)" strokeDasharray="4 5" opacity="0.7" />
        <text x={aos.x - 6} y={aos.y - 10} textAnchor="end" fontSize="12" fill="var(--text-secondary)" fontFamily="var(--font-mono)">AOS</text>
        <text x={los.x + 6} y={los.y - 10} fontSize="12" fill="var(--text-secondary)" fontFamily="var(--font-mono)">LOS</text>
        {/* orbit */}
        <path d={`M${arcStart.x} ${arcStart.y} A${ORBIT_R} ${ORBIT_R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="var(--border-strong)" strokeDasharray="2 6" />
        {/* earth */}
        <circle cx={CX} cy={CY} r={EARTH_R} fill="url(#op-earth)" stroke="var(--diagram-spacecraft)" strokeOpacity="0.5" />
        {/* links */}
        {visible && (
          <line x1={sat.x} y1={sat.y} x2={station.x} y2={station.y - 10} stroke="var(--diagram-downlink)" strokeWidth="2" strokeDasharray="6 6" className="op-flow" />
        )}
        <path d={`M${station.x + 8} ${station.y + 4} Q ${(station.x + moc.x) / 2} ${station.y + 30} ${moc.x - 16} ${moc.y - 2}`} fill="none" stroke={visible ? 'var(--diagram-downlink)' : 'var(--border-strong)'} strokeWidth="1.5" strokeDasharray="3 4" />
        <text x={(station.x + moc.x) / 2 - 20} y={station.y + 62} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontFamily="var(--font-mono)">SLE / terrestrial network</text>
        {/* station dish */}
        <g transform={`translate(${station.x} ${station.y})`}>
          <path d="M-12 -8 A14 14 0 0 0 10 -16 Z" fill="var(--diagram-downlink)" transform="rotate(-20)" />
          <path d="M-2 -6 L-7 6 H7 Z" fill="none" stroke="var(--text-secondary)" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
        <text x={station.x - 14} y={station.y + 24} textAnchor="end" fontSize="12" fill="var(--text-primary)">Ground station</text>
        {/* MOC */}
        <g transform={`translate(${moc.x} ${moc.y})`}>
          <rect x="-16" y="-12" width="32" height="20" rx="3" fill="var(--bg-surface)" stroke="var(--diagram-spacecraft)" />
          <path d="M-10 -4h8m-8 5h14" stroke="var(--diagram-spacecraft)" strokeWidth="1.5" />
          <text x="0" y="26" textAnchor="middle" fontSize="12" fill="var(--text-primary)">Mission control</text>
        </g>
        {/* spacecraft */}
        <g transform={`translate(${sat.x} ${sat.y}) rotate(${phi})`}>
          <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="var(--text-primary)" />
          <rect x="-19" y="-3" width="12" height="6" rx="1" fill="var(--diagram-spacecraft)" />
          <rect x="7" y="-3" width="12" height="6" rx="1" fill="var(--diagram-spacecraft)" />
        </g>
        <text x="16" y="26" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">NOT TO SCALE · ALTITUDE EXAGGERATED</text>
      </svg>
      <div className="grid gap-4 border-t border-line p-4">
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-secondary !px-3 !py-2" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="whitespace-nowrap text-fg-2" aria-hidden="true">Pass time</span>
            <input type="range" min={0} max={1000} aria-label="Pass time" value={Math.round(t * 1000)} onChange={(e) => { setPlaying(false); setT(Number(e.target.value) / 1000); }} className="w-48 accent-[var(--bg-accent)]" aria-valuetext={`${fmt(secondsFromTca)} from max elevation`} />
          </label>
        </div>
        <dl className="t-readout grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
          <div><dt className="text-fg-muted">STATE</dt><dd className={visible ? 'text-downlink' : 'text-fg-2'}>{state}</dd></div>
          <div><dt className="text-fg-muted">T − TCA</dt><dd>{fmt(secondsFromTca)}</dd></div>
          <div><dt className="text-fg-muted">ELEVATION</dt><dd>{visible ? `${pt.elevationDeg.toFixed(1)}°` : 'below mask'}</dd></div>
          <div><dt className="text-fg-muted">RANGE · LIGHT TIME</dt><dd>{Math.round(pt.rangeKm)} km · {pt.lightTimeMs.toFixed(1)} ms</dd></div>
          <div><dt className="text-fg-muted">DOPPLER @ 2.2 GHz</dt><dd>{pt.dopplerKHz >= 0 ? '+' : '−'}{Math.abs(pt.dopplerKHz).toFixed(1)} kHz</dd></div>
        </dl>
      </div>
      <p className="t-small border-t border-line px-4 py-3 text-fg-2">
        Overhead pass, {MASK}° elevation mask: about {Math.round(duration / 60)} minutes from AOS to LOS. Received frequency is high while the spacecraft approaches and low as it recedes.{' '}
        <a href="/topics/contact-planning/">Contact planning</a> · <a href="/topics/ranging-and-doppler/">Ranging and Doppler</a>
      </p>
    </div>
  );
}
