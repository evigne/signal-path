import { useMemo, useState } from 'react';
import { bits, parseHex, toHex, views } from '../../lib/ccsds';

const PRESET = '41 48 00 00 08 7E C4 12';
const fmt = (n: number | null, digits = 6) => (n === null ? '—' : Number.isInteger(n) ? n.toString() : Number(n.toPrecision(digits)).toString());

export default function BitInspector() {
  const [hex, setHex] = useState(PRESET);
  const [le, setLe] = useState(false);
  const [sliceStart, setSliceStart] = useState(5);
  const [sliceEnd, setSliceEnd] = useState(15);

  const parsed = useMemo(() => {
    try {
      const b = parseHex(hex);
      if (b.length < 2 || b.length > 16) throw new Error('Enter 2–16 bytes');
      return { b, error: null as string | null };
    } catch (e) {
      return { b: new Uint8Array(), error: (e as Error).message };
    }
  }, [hex]);
  const b = parsed.b;
  const v0 = b.length ? views(b, 0, le) : null;
  const v6 = b.length >= 8 ? views(b, 6, le) : null;
  const sliceBytes = b.length >= 6 ? b.slice(4, 6) : null;
  const lo = Math.min(sliceStart, sliceEnd), hi = Math.max(sliceStart, sliceEnd);
  const slice = sliceBytes ? bits(sliceBytes, lo, hi - lo + 1) : null;

  const flip = (i: number) => {
    const c = b.slice();
    c[i >> 3] ^= 1 << (7 - (i & 7));
    setHex(toHex(c));
  };

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm">
          <span className="t-label">Hex bytes (2–16, fictional)</span>
          <input className="field-input" value={hex} onChange={(e) => setHex(e.target.value)} spellCheck={false} />
        </label>
        <fieldset className="flex items-center gap-3 text-sm">
          <legend className="t-label mb-1">Byte order</legend>
          <label className="flex items-center gap-1"><input type="radio" name="bo" checked={!le} onChange={() => setLe(false)} /> Big-endian</label>
          <label className="flex items-center gap-1"><input type="radio" name="bo" checked={le} onChange={() => setLe(true)} /> Little-endian</label>
        </fieldset>
        <button type="button" className="btn btn-secondary" onClick={() => { setHex(PRESET); setLe(false); setSliceStart(5); setSliceEnd(15); }}>Reset</button>
      </div>
      {parsed.error && <p role="alert" className="rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error-fg)]">{parsed.error}</p>}
      {b.length > 0 && (
        <>
          <div className="card overflow-x-auto p-4" tabIndex={0} role="region" aria-label="Bit matrix">
            <p className="t-label mb-2">Bit matrix · click a bit to flip it · bit 0 is the most significant bit of byte 0</p>
            <div className="min-w-[520px] space-y-1 font-mono text-[12px]">
              {Array.from(b).map((byte, r) => (
                <div key={r} className="flex items-center gap-1">
                  <span className="w-16 text-fg-2">Byte {r}</span>
                  {Array.from({ length: 8 }, (_, k) => {
                    const i = r * 8 + k;
                    const on = (byte >> (7 - k)) & 1;
                    return <button key={k} type="button" onClick={() => flip(i)} aria-label={`Byte ${r} bit ${k}, value ${on}. Flip.`} className={`h-7 w-7 rounded-sm border border-line-strong ${on ? 'bg-accent text-on-accent' : 'bg-surface'}`}>{on}</button>;
                  })}
                  <span className="ml-2 text-fg-2">0x{byte.toString(16).toUpperCase().padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {[
              ['FLOAT32 · bytes 0–3', fmt(v0?.float32 ?? null), 'IEEE 754 single'],
              ['UINT32 · bytes 0–3', fmt(v0?.uint32 ?? null), 'unsigned'],
              ['UINT16 · bytes 0–1', fmt(v0?.uint16 ?? null), 'unsigned'],
              ['INT16 · bytes 6–7', fmt(v6?.int16 ?? null), "two's complement"],
              ['UINT16 · bytes 6–7', fmt(v6?.uint16 ?? null), 'unsigned'],
              ['FLOAT64 · bytes 0–7', fmt(v0?.float64 ?? null, 8), 'IEEE 754 double'],
            ].map(([k, val, note]) => (
              <div key={k} className="card p-3"><p className="t-label-sm text-fg-2">{k} {le ? 'LE' : 'BE'}</p><p className="font-mono text-lg">{val}</p><p className="t-label-sm text-fg-muted">{note}</p></div>
            ))}
          </div>
          {sliceBytes && (
            <div className="card p-4">
              <p className="t-label">Bitmask slicer · bytes 4–5</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">Start bit <input type="number" min={0} max={15} value={sliceStart} onChange={(e) => setSliceStart(Number(e.target.value))} className="field-input w-20" /></label>
                <label className="flex items-center gap-2">End bit <input type="number" min={0} max={15} value={sliceEnd} onChange={(e) => setSliceEnd(Number(e.target.value))} className="field-input w-20" /></label>
                <span className="font-mono">Bits {lo}–{hi} = 0x{slice!.toString(16).toUpperCase()} ({slice})</span>
              </div>
              <p className="t-small mt-2 text-fg-2">Bits 5–15 of the first two header octets are the Space Packet APID (CCSDS 133.0-B-2 §4.1.3.3.4).</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
