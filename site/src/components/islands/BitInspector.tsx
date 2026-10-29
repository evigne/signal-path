import { useMemo, useState } from 'react';
import { bits, parseHex, toHex, views } from '../../lib/ccsds';

// Tool 1: bit, byte and endianness inspector (content/labs/bit-byte-endianness-inspector.yaml).
// Fields sit at fixed places relative to a movable window: float32 @0, uint16 @4, int16 @6.

const PRESET = '41 48 00 00 08 7E C4 12';
type Order = 'big' | 'little' | 'both';
const fmt = (n: number | null | undefined, digits = 6) => (n === null || n === undefined ? '—' : Number.isInteger(n) ? n.toString() : Number(n.toPrecision(digits)).toString());

// IEEE 754 single: sign 1, exponent 8, fraction 23 bits (big-endian bit order).
const FLOAT_PART = (k: number) => (k === 0 ? 'sign' : k < 9 ? 'exponent' : 'fraction');
const PART_STYLE: Record<string, { bg: string; fg: string }> = {
  sign: { bg: '#7e22ce', fg: '#fff' },
  exponent: { bg: '#b45309', fg: '#fff' },
  fraction: { bg: '#0f766e', fg: '#fff' },
};

type Card = { key: string; label: string; start: number; len: number; value: (le: boolean) => string; note: string };

export default function BitInspector() {
  const [hex, setHex] = useState(PRESET);
  const [order, setOrder] = useState<Order>('big');
  const [offset, setOffset] = useState(0);
  const [sliceStart, setSliceStart] = useState(5);
  const [sliceEnd, setSliceEnd] = useState(15);
  const [hl, setHl] = useState<string | null>(null);

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
  const maxOffset = Math.max(0, b.length - 4);
  const off = Math.min(offset, maxOffset);
  const at = (o: number, le: boolean) => (b.length ? views(b, off + o, le) : null);
  const lo = Math.min(sliceStart, sliceEnd), hi = Math.max(sliceStart, sliceEnd);
  const sliceBytes = b.length >= off + 6 ? b.slice(off + 4, off + 6) : null;
  const slice = sliceBytes ? bits(sliceBytes, lo, hi - lo + 1) : null;

  const cards: Card[] = [
    { key: 'f32', label: `FLOAT32 · bytes ${off}–${off + 3}`, start: off * 8, len: 32, value: (le) => fmt(at(0, le)?.float32), note: 'IEEE 754 single' },
    { key: 'u32', label: `UINT32 · bytes ${off}–${off + 3}`, start: off * 8, len: 32, value: (le) => fmt(at(0, le)?.uint32), note: 'unsigned' },
    { key: 'u16', label: `UINT16 · bytes ${off + 4}–${off + 5}`, start: (off + 4) * 8, len: 16, value: (le) => fmt(at(4, le)?.uint16), note: 'unsigned' },
    { key: 'i16', label: `INT16 · bytes ${off + 6}–${off + 7}`, start: (off + 6) * 8, len: 16, value: (le) => fmt(at(6, le)?.int16), note: "two's complement" },
    { key: 'u16b', label: `UINT16 · bytes ${off + 6}–${off + 7}`, start: (off + 6) * 8, len: 16, value: (le) => fmt(at(6, le)?.uint16), note: 'same bits, unsigned' },
    { key: 'u8', label: `UINT8 · byte ${off}`, start: off * 8, len: 8, value: () => (b.length > off ? String(b[off]) : '—'), note: 'one octet' },
    { key: 'f64', label: `FLOAT64 · bytes ${off}–${off + 7}`, start: off * 8, len: 64, value: (le) => fmt(at(0, le)?.float64, 8), note: 'IEEE 754 double' },
    { key: 'ascii', label: `ASCII · bytes ${off}–${Math.min(b.length, off + 8) - 1}`, start: off * 8, len: Math.min(64, (b.length - off) * 8), value: () => Array.from(b.slice(off, off + 8), (c) => (c >= 32 && c < 127 ? String.fromCharCode(c) : '·')).join(''), note: '· = not printable' },
  ];
  const active = cards.find((c) => c.key === hl);
  const floatStart = off * 8;

  const flip = (i: number) => {
    const c = b.slice();
    c[i >> 3] ^= 1 << (7 - (i & 7));
    setHex(toHex(c));
  };
  const reset = () => { setHex(PRESET); setOrder('big'); setOffset(0); setSliceStart(5); setSliceEnd(15); };
  const orders: boolean[] = order === 'both' ? [false, true] : [order === 'little'];

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-head"><span>Module 01 // Bit &amp; byte inspector</span><span>bit 0 = MSB of byte 0 · fictional</span></div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Presets">
            <button type="button" className="btn btn-secondary !py-1.5" onClick={reset}>LEO CubeSat pass</button>
            <button type="button" className="btn btn-secondary !py-1.5" onClick={() => setOrder('both')}>Both byte orders</button>
            <button type="button" className="btn btn-secondary !py-1.5" onClick={() => { setOffset(0); setSliceStart(5); setSliceEnd(15); }}>APID slice</button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
              <span className="t-label">Hex bytes (2–16, fictional)</span>
              <input className="field-input" value={hex} onChange={(e) => setHex(e.target.value)} spellCheck={false} />
            </label>
            <fieldset className="flex flex-wrap items-center gap-3 text-sm">
              <legend className="t-label mb-1">Byte order</legend>
              <label className="flex items-center gap-1"><input type="radio" name="bo" checked={order === 'big'} onChange={() => setOrder('big')} /> Big-endian</label>
              <label className="flex items-center gap-1"><input type="radio" name="bo" checked={order === 'little'} onChange={() => setOrder('little')} /> Little-endian</label>
              <label className="flex items-center gap-1"><input type="radio" name="bo" checked={order === 'both'} onChange={() => setOrder('both')} /> Both</label>
            </fieldset>
            <label className="flex min-w-[200px] flex-col gap-1 text-sm">
              <span className="t-label">Field window offset: {off} octet{off === 1 ? '' : 's'}</span>
              <input type="range" min={0} max={maxOffset} value={off} onChange={(e) => setOffset(Number(e.target.value))} aria-valuetext={`${off} octets`} />
            </label>
            <button type="button" className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
        </div>
      </div>
      {parsed.error && <p role="alert" className="rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error-fg)]">{parsed.error}</p>}
      {b.length > 0 && (
        <>
          <div className="card overflow-x-auto p-4" tabIndex={0} role="region" aria-label="Bit matrix">
            <p className="t-label mb-2">Bit matrix · click a bit to flip it · hover or focus a card below to highlight its bits</p>
            <div className="min-w-[520px] space-y-1 font-mono text-[12px]">
              {Array.from(b).map((byte, r) => (
                <div key={r} className="flex items-center gap-1">
                  <span className="w-16 text-fg-2">Byte {r}</span>
                  {Array.from({ length: 8 }, (_, k) => {
                    const i = r * 8 + k;
                    const on = (byte >> (7 - k)) & 1;
                    const inFloat = i >= floatStart && i < floatStart + 32 && order !== 'little';
                    const part = inFloat ? PART_STYLE[FLOAT_PART(i - floatStart)] : null;
                    const lit = active && i >= active.start && i < active.start + active.len;
                    return (
                      <button key={k} type="button" onClick={() => flip(i)} aria-label={`Byte ${r} bit ${k}, value ${on}${inFloat ? `, float32 ${FLOAT_PART(i - floatStart)}` : ''}. Flip.`}
                        className={`h-7 w-7 rounded-sm border ${lit ? 'outline outline-2 outline-offset-1 outline-[var(--border-focus)]' : ''}`}
                        style={part ? { background: on ? part.bg : 'var(--bg-surface)', color: on ? part.fg : 'var(--text-primary)', borderColor: part.bg } : { background: on ? 'var(--bg-accent)' : 'var(--bg-surface)', color: on ? 'var(--text-on-accent)' : 'var(--text-primary)', borderColor: 'var(--border-strong)' }}>{on}</button>
                    );
                  })}
                  <span className="ml-2 text-fg-2">0x{byte.toString(16).toUpperCase().padStart(2, '0')}</span>
                </div>
              ))}
            </div>
            {order !== 'little' && <p className="t-small mt-2 text-fg-2">Float32 window (big-endian): <span className="text-[var(--tag-standard-fg)]">sign 1 bit</span> · <span className="text-[var(--status-warn-fg)]">exponent 8 bits</span> · <span className="text-[var(--tag-practice-fg)]">fraction 23 bits</span> (outlined colours in the matrix).</p>}
          </div>
          {orders.map((le) => (
            <div key={String(le)}>
              {order === 'both' && <p className="t-overline mb-2 text-fg-2">{le ? 'Little-endian' : 'Big-endian'}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
                {cards.map((c) => (
                  <div key={c.key} tabIndex={0} onMouseEnter={() => setHl(c.key)} onMouseLeave={() => setHl(null)} onFocus={() => setHl(c.key)} onBlur={() => setHl(null)} className={`card p-3 ${hl === c.key ? '!border-[var(--border-focus)]' : ''}`}>
                    <p className="t-label-sm text-fg-2">{c.label} {c.key === 'u8' || c.key === 'ascii' ? '' : le ? 'LE' : 'BE'}</p>
                    <p className="t-readout break-all text-lg">{c.value(le)}</p>
                    <p className="t-label-sm text-fg-muted">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {sliceBytes && (
            <div className="card p-4">
              <p className="t-label">Bitmask slicer · bytes {off + 4}–{off + 5}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">Start bit <input type="number" min={0} max={15} value={sliceStart} onChange={(e) => setSliceStart(Number(e.target.value))} className="field-input w-20" /></label>
                <label className="flex items-center gap-2">End bit <input type="number" min={0} max={15} value={sliceEnd} onChange={(e) => setSliceEnd(Number(e.target.value))} className="field-input w-20" /></label>
                <span className="t-readout">Bits {lo}–{hi} = 0x{slice!.toString(16).toUpperCase()} ({slice})</span>
              </div>
              <p className="t-small mt-2 text-fg-2">Bits 5–15 of the first two header octets are the Space Packet APID (CCSDS 133.0-B-2 §4.1.3.3.4). Shift the window by one octet and the same slice reads the wrong bytes.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
