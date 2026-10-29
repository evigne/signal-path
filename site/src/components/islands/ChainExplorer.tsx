import { useState } from 'react';

// Animated end-to-end chain (Home and Start Here). Downlink frames (teal) flow left to
// right, uplink CLTUs (orange) right to left; the animation stops under reduced motion.
// Selecting a stage shows the data unit at that boundary and where to learn more.

type Stage = {
  id: string;
  org: string;
  name: string;
  icon: 'bus' | 'radio' | 'dish' | 'network' | 'console';
  down: { does: string; stack: string[] };
  up: { does: string; stack: string[] };
  topic: { href: string; label: string };
  lab: { href: string; label: string };
};

const STAGES: Stage[] = [
  {
    id: 'bus', org: 'Spacecraft', name: 'Flight software', icon: 'bus',
    down: { does: 'Samples sensors and packs values into Space Packets, then packets into transfer frames.', stack: ['Engineering value (e.g. 31.2 °C)', 'Space Packet · APID 0x07E', 'TM Transfer Frame · VC0'] },
    up: { does: 'Checks the TC frame, extracts the packet and executes the command.', stack: ['TC Transfer Frame · VC1', 'TC Space Packet · APID 0x02A', 'Executed command: HTR_ON'] },
    topic: { href: '/topics/space-packet-protocol/', label: 'Space Packet Protocol' },
    lab: { href: '/labs/space-packet-header-decoder/', label: 'Packet header decoder' },
  },
  {
    id: 'radio', org: 'Spacecraft', name: 'Transceiver', icon: 'radio',
    down: { does: 'Adds error-correcting code and a sync marker, then modulates the carrier.', stack: ['TM Transfer Frame', 'Coded block + sync marker (CADU)', 'Modulated symbols on RF'] },
    up: { does: 'Locks onto the uplink carrier, finds each CLTU and decodes it back into a frame.', stack: ['RF carrier', 'CLTU (BCH or LDPC coded)', 'TC Transfer Frame'] },
    topic: { href: '/topics/channel-coding/', label: 'Channel coding' },
    lab: { href: '/labs/channel-coding-sandbox/', label: 'Channel coding sandbox' },
  },
  {
    id: 'dish', org: 'Ground station', name: 'Antenna & modem', icon: 'dish',
    down: { does: 'Tracks the spacecraft, locks carrier, symbols and frames, and decodes.', stack: ['Modulated symbols', 'CADU (sync marker found)', 'TM Transfer Frame (decoded)'] },
    up: { does: 'Modulates CLTUs onto the uplink carrier and radiates them.', stack: ['CLTU', 'Modulated symbols', 'RF uplink'] },
    topic: { href: '/topics/sync-markers/', label: 'Sync markers' },
    lab: { href: '/labs/sync-marker-visualiser/', label: 'Frame sync visualiser' },
  },
  {
    id: 'network', org: 'Provider network', name: 'SLE / delivery', icon: 'network',
    down: { does: 'Carries frames from the station to the mission over the ground network.', stack: ['TM Transfer Frame', 'SLE RAF / RCF transfer', 'TCP/IP to mission control'] },
    up: { does: 'Carries CLTUs from mission control to the station for radiation.', stack: ['TC frame inside a CLTU', 'SLE Forward CLTU transfer', 'Station CLTU queue'] },
    topic: { href: '/topics/sle-transfer-services/', label: 'SLE transfer services' },
    lab: { href: '/labs/end-to-end-walkthrough/', label: 'End-to-end walkthrough' },
  },
  {
    id: 'console', org: 'Mission control', name: 'C2 software', icon: 'console',
    down: { does: 'Extracts packets, calibrates values, checks limits and archives.', stack: ['TM Transfer Frame', 'Space Packet', 'Calibrated parameter on a display'] },
    up: { does: 'Validates the command, wraps it in a TC packet and frame, and runs COP-1.', stack: ['Operator command', 'TC Space Packet', 'TC Transfer Frame (COP-1)'] },
    topic: { href: '/topics/telemetry-lifecycle/', label: 'Telemetry lifecycle' },
    lab: { href: '/labs/telemetry-calibration-sandbox/', label: 'Calibration sandbox' },
  },
];

function StageIcon({ icon }: { icon: Stage['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      {icon === 'bus' && (<g {...common}><rect x="12" y="11" width="12" height="14" rx="2" /><path d="M3 15h9m-9 6h9M24 15h9m-9 6h9M18 11V6m-2 0h4" /></g>)}
      {icon === 'radio' && (<g {...common}><rect x="9" y="16" width="14" height="12" rx="2" /><path d="M16 16V9m0 0 4-3M24 9a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></g>)}
      {icon === 'dish' && (<g {...common}><path d="M7 9a13 13 0 0 0 17 17z" /><path d="M14 20 8 30h12M16 18l7-7m0 0a4 4 0 1 0-1-1" /></g>)}
      {icon === 'network' && (<g {...common}><circle cx="8" cy="18" r="3" /><circle cx="28" cy="10" r="3" /><circle cx="28" cy="26" r="3" /><path d="M11 17l14-6m-14 8 14 6M28 13v10" /></g>)}
      {icon === 'console' && (<g {...common}><rect x="5" y="7" width="26" height="17" rx="2" /><path d="M9 19l4-4 3 3 5-6 5 4M12 29h12m-6-5v5" /></g>)}
    </svg>
  );
}

export default function ChainExplorer() {
  const [sel, setSel] = useState(2);
  const s = STAGES[sel];
  return (
    <div className="panel overflow-hidden" data-testid="chain-explorer">
      <div className="panel-head">
        <span><span className="dot" aria-hidden="true" />Signal path // spacecraft to mission control</span>
        <span>Select a stage</span>
      </div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Chain stages (scrolls sideways on small screens)">
        <div className="relative min-w-[720px] px-4 py-6">
          <p className="t-readout mb-2 text-xs font-semibold text-downlink">DOWNLINK · telemetry →</p>
          <div className="chain-track chain-down" aria-hidden="true"><span /><span /><span /><span /></div>
          <ol className="relative z-10 grid grid-cols-5 gap-3" aria-label="Stages">
            {STAGES.map((st, i) => (
              <li key={st.id}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  aria-pressed={i === sel}
                  className={`chain-node flex w-full flex-col items-center gap-1 rounded-lg border p-3 text-center ${i === sel ? 'border-accent bg-accent-subtle' : 'border-line bg-surface hover:border-line-strong'}`}
                >
                  <span className={i === sel ? 'text-link' : 'text-spacecraft'}><StageIcon icon={st.icon} /></span>
                  <span className="t-label-sm uppercase tracking-wider text-fg-2">{st.org}</span>
                  <span className="text-sm font-semibold text-fg">{st.name}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="chain-track chain-up" aria-hidden="true"><span /><span /><span /><span /></div>
          <p className="t-readout mt-2 text-right text-xs font-semibold text-uplink">← UPLINK · commands</p>
        </div>
      </div>
      <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2 md:p-5" aria-live="polite">
        <div>
          <p className="t-overline text-downlink">Downlink at {s.org.toLowerCase()} · {s.name}</p>
          <p className="mt-1 text-[15px]">{s.down.does}</p>
          <ol className="t-readout mt-3 space-y-1 text-xs" aria-label="Data units, outermost last">
            {s.down.stack.map((d, i) => (
              <li key={d} className="rounded-md border border-line bg-subtle px-3 py-1.5" style={{ marginLeft: `${i * 14}px`, borderLeft: '3px solid var(--diagram-downlink)' }}>{d}</li>
            ))}
          </ol>
        </div>
        <div>
          <p className="t-overline text-uplink">Uplink at {s.org.toLowerCase()} · {s.name}</p>
          <p className="mt-1 text-[15px]">{s.up.does}</p>
          <ol className="t-readout mt-3 space-y-1 text-xs" aria-label="Data units, in processing order">
            {s.up.stack.map((d, i) => (
              <li key={d} className="rounded-md border border-line bg-subtle px-3 py-1.5" style={{ marginLeft: `${i * 14}px`, borderLeft: '3px solid var(--diagram-uplink)' }}>{d}</li>
            ))}
          </ol>
        </div>
        <p className="text-sm md:col-span-2">
          Learn: <a href={s.topic.href}>{s.topic.label}</a> · Try: <a href={s.lab.href}>{s.lab.label}</a>
          <span className="text-fg-muted"> · Who runs each stage varies by mission. Values are fictional.</span>
        </p>
      </div>
    </div>
  );
}
