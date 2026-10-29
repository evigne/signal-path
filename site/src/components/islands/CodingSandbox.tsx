import { useMemo, useState } from 'react';
import { rng } from '../../lib/framesync';

// Tool 4. The BER curves are schematic shapes for teaching; only the coding-gain
// readout uses cited figures (CCSDS 130.1-G-3 §3.3.3). The R-S correction limit is
// CCSDS 131.0-B-6 §5.1 (E = 16 corrects 16 symbols per codeword).
type Code = 'uncoded' | 'rs' | 'concat' | 'ldpc';
const CODES: { id: Code; name: string; shift: number }[] = [
  { id: 'uncoded', name: 'Uncoded', shift: 0 },
  { id: 'rs', name: 'Reed–Solomon only', shift: 4.0 },
  { id: 'concat', name: 'Concatenated: conv. + RS', shift: 7.5 },
  { id: 'ldpc', name: 'LDPC/Turbo', shift: 9.0 },
];

// Schematic uncoded-like waterfall shifted left by the code's (schematic) gain.
const schematicBer = (ebn0: number, shift: number) => {
  const x = ebn0 + shift;
  const v = 0.5 * Math.exp(-0.06 * x * x - 0.18 * x);
  return Math.min(0.5, Math.max(1e-9, shift > 0 ? v ** (1 + shift / 6) : v));
};

export default function CodingSandbox() {
  const [code, setCode] = useState<Code>('concat');
  const [ebn0, setEbn0] = useState(4);
  const [errs, setErrs] = useState(10);
  const [burst, setBurst] = useState(20);
  const [depth, setDepth] = useState(1);
  const c = CODES.find((x) => x.id === code)!;
  const ber = schematicBer(ebn0, c.shift);
  const berUncoded = schematicBer(ebn0, 0);

  const blocks = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 256 }, () => r());
  }, []);
  const blockFail = (b: number, p: number) => b < Math.min(1, p * 400);

  const perCw = Array.from({ length: depth }, (_, i) => Math.floor(burst / depth) + (i < burst % depth ? 1 : 0));

  const W = 520, H = 220;
  const px = (e: number) => 40 + (e / 12) * (W - 60);
  const py = (b: number) => 10 + ((-Math.log10(b) - 1) / 8) * (H - 40);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <label className="text-sm">
          <span className="t-label">Code</span>
          <select className="field-input mt-1" value={code} onChange={(e) => setCode(e.target.value as Code)}>
            {CODES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="t-label">Eb/N0: {ebn0.toFixed(1)} dB</span>
          <input type="range" min={0} max={12} step={0.5} value={ebn0} onChange={(e) => setEbn0(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => { setCode('concat'); setEbn0(4); setErrs(10); setBurst(20); setDepth(1); }}>Reset</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <figure className="card p-4">
          <figcaption className="t-label">Bit error rate vs Eb/N0 — schematic shapes, not to scale</figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`Schematic curves; at ${ebn0} dB the selected code is far below the uncoded curve.`}>
            <line x1="40" y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--border-strong)" />
            <line x1="40" y1="10" x2="40" y2={H - 30} stroke="var(--border-strong)" />
            {CODES.map((k) => {
              const pts = Array.from({ length: 49 }, (_, i) => i * 0.25).map((e) => `${px(e)},${Math.min(H - 30, py(schematicBer(e, k.shift)))}`).join(' ');
              return <polyline key={k.id} points={pts} fill="none" stroke={k.id === code ? 'var(--bg-accent)' : 'var(--border-strong)'} strokeWidth={k.id === code ? 3 : 1.5} strokeDasharray={k.id === 'uncoded' ? '5 4' : undefined} />;
            })}
            <line x1={px(ebn0)} y1="10" x2={px(ebn0)} y2={H - 30} stroke="var(--text-secondary)" strokeDasharray="3 3" />
            <text x="44" y="22" fontSize="11" fill="var(--text-secondary)">1e-1</text>
            <text x="44" y={H - 34} fontSize="11" fill="var(--text-secondary)">1e-9</text>
            <text x="40" y={H - 12} fontSize="11" fill="var(--text-secondary)">0 dB</text>
            <text x={W - 50} y={H - 12} fontSize="11" fill="var(--text-secondary)">12 dB</text>
          </svg>
          <p className="t-small text-fg-2">Selected: {c.name} (solid). Dashed: uncoded.</p>
        </figure>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3"><p className="t-label-sm text-fg-2">Coding gain at BER 1e-5</p><p className="t-h3">{code === 'concat' ? '≈ 7.5 dB' : code === 'uncoded' ? '0 dB' : 'Not shown'}</p><p className="t-label-sm text-fg-muted">{code === 'concat' ? 'conv. 5.5 + RS 2.0 · 130.1-G-3 §3.3.3' : code === 'uncoded' ? 'reference' : 'cited figure not wired yet'}</p></div>
            <div className="card p-3"><p className="t-label-sm text-fg-2">Blocks lost in the image</p><p className="t-h3">{blocks.filter((b) => blockFail(b, ber)).length} / 256</p><p className="t-label-sm text-fg-muted">uncoded: {blocks.filter((b) => blockFail(b, berUncoded)).length}</p></div>
          </div>
          <div className="card p-3">
            <p className="t-label-sm text-fg-2">Synthetic 16 × 16 image (each square is a block)</p>
            <div className="mt-2 grid grid-cols-16 gap-[2px]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }} role="img" aria-label={`${blocks.filter((b) => blockFail(b, ber)).length} of 256 blocks corrupted`}>
              {blocks.map((b, i) => {
                const bad = blockFail(b, ber);
                const shade = ((i % 16) + Math.floor(i / 16)) % 2 === 0;
                return <span key={i} className="aspect-square rounded-[2px]" style={{ background: bad ? 'var(--status-error-fg)' : shade ? 'var(--ink-700)' : 'var(--ink-300)' }} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4" aria-labelledby="cliff">
          <h3 id="cliff" className="t-h4">The Reed–Solomon cliff</h3>
          <label className="mt-2 block text-sm">Symbol errors in one codeword: <strong>{errs}</strong>
            <input type="range" min={0} max={24} value={errs} onChange={(e) => setErrs(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <p className={`mt-2 rounded-md p-2 text-sm font-medium ${errs <= 16 ? 'bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]' : 'bg-[var(--status-error-bg)] text-[var(--status-error-fg)]'}`} aria-live="polite">
            {errs <= 16 ? `✓ Corrected: ${errs} of up to 16 symbols per codeword (E = 16)` : `✗ Uncorrectable codeword: ${errs} > 16 — the whole block is lost`}
          </p>
          <p className="t-small mt-2 text-fg-2">CCSDS 131.0-B-6 §5.1: E = 16 corrects up to 16 R-S symbols per codeword; E = 8 corrects 8.</p>
        </section>
        <section className="card p-4" aria-labelledby="burst">
          <h3 id="burst" className="t-h4">Bursts and interleaving</h3>
          <label className="mt-2 block text-sm">Burst length: <strong>{burst}</strong> symbols
            <input type="range" min={1} max={60} value={burst} onChange={(e) => setBurst(Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="mt-2 block text-sm">Interleaving depth I:
            <select className="field-input mt-1 !w-auto" value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 8].map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <ul className="mt-2 space-y-1 text-sm" aria-live="polite">
            {perCw.map((n, i) => <li key={i}>Codeword {i + 1}: {n} symbols in error — {n <= 16 ? <span className="text-[var(--status-ok-fg)]">✓ corrected</span> : <span className="text-[var(--status-error-fg)]">✗ lost</span>}</li>)}
          </ul>
          <p className="t-small mt-2 text-fg-2">Interleaving spreads a burst across I codewords so each sees fewer errors. Allowed depths: I = 1, 2, 3, 4, 5, 8 (131.0-B-6 §5).</p>
        </section>
      </div>
    </div>
  );
}
