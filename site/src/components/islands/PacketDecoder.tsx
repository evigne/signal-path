import { useEffect, useMemo, useState } from 'react';
import { bitString, clcwFields, decodeSpacePacket, parseHex, seqGap, tcFields, tmFields, toHex, type Field } from '../../lib/ccsds';

// Tool 2: header decoder (content/labs/space-packet-header-decoder.yaml). Space Packet
// mode follows the lab; TM, TC and CLCW modes reuse the same 16-bit word diagram.
// All bytes are fictional.

type Mode = 'sp' | 'tm' | 'tc' | 'clcw';
const MODES: { id: Mode; name: string; octets: number; ref: string }[] = [
  { id: 'sp', name: 'Space Packet', octets: 6, ref: 'CCSDS 133.0-B-2 §4.1.3' },
  { id: 'tm', name: 'TM frame', octets: 6, ref: 'CCSDS 132.0-B-3 §4.1.2' },
  { id: 'tc', name: 'TC frame', octets: 5, ref: 'CCSDS 232.0-B-4 §4.1.2' },
  { id: 'clcw', name: 'CLCW', octets: 4, ref: 'CCSDS 232.0-B-4 §4.2.1' },
];

const PRESETS: Record<Mode, { name: string; hex: string; prev?: number }[]> = {
  sp: [
    { name: 'Housekeeping packet', hex: '08 7E C4 12 00 3F' },
    { name: 'Next packet (sequence gap)', hex: '08 7E C4 14 00 3F', prev: 1042 },
    { name: 'Telecommand packet', hex: '18 2A C0 07 00 09' },
    { name: 'Idle packet (APID all ones)', hex: '07 FF C0 00 00 03' },
  ],
  tm: [{ name: 'TM frame, VC2', hex: '0A B5 2A 11 18 00' }],
  tc: [{ name: 'TC frame, VC1, N(S)=37', hex: '00 2A 04 13 25' }],
  clcw: [
    { name: 'CLCW, all accepted', hex: '01 04 00 25' },
    { name: 'CLCW, Lockout', hex: '01 04 28 24' },
  ],
};

const COLORS = ['#5b4bd1', '#0f766e', '#b45309', '#1d4ed8', '#be123c', '#15803d', '#475569', '#7e22ce', '#0e7490', '#a16207', '#be185d', '#4338ca', '#047857', '#c2410c'];

function WordDiagram({ bytes, fields, onFlip }: { bytes: Uint8Array; fields: Field[]; onFlip: (bit: number) => void }) {
  // 16-bit words; on narrow screens one octet per row so every bit stays a 24 px target.
  const [per, setPer] = useState(8);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 560px)');
    const update = () => setPer(mq.matches ? 16 : 8);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const total = bytes.length * 8;
  const words = Array.from({ length: Math.ceil(total / per) }, (_, w) => ({ start: w * per, len: Math.min(per, total - w * per) }));
  return (
    <div className="space-y-3" role="group" aria-label="Header bits, 16 per row">
      {words.map((w) => {
        const segs = fields
          .map((fd, fi) => ({ fi, a: Math.max(fd.start, w.start), b: Math.min(fd.start + fd.len, w.start + w.len) }))
          .filter((s) => s.b > s.a);
        return (
          <div key={w.start}>
            <p className="t-readout mb-1 text-[11px] text-fg-2">{per === 16 ? `OCTETS ${w.start / 8 + 1}–${(w.start + w.len) / 8}` : `OCTET ${w.start / 8 + 1}`} · BITS {w.start}–{w.start + w.len - 1}</p>
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${per}, minmax(0, 1fr))` }}>
              {Array.from({ length: w.len }, (_, k) => {
                const i = w.start + k;
                const fi = fields.findIndex((fd) => i >= fd.start && i < fd.start + fd.len);
                const on = (bytes[i >> 3] >> (7 - (i & 7))) & 1;
                return (
                  <button key={i} type="button" onClick={() => onFlip(i)} aria-label={`Bit ${i}, ${fields[fi].name}, value ${on}. Flip.`}
                    className="t-readout flex h-9 min-w-[24px] items-center justify-center rounded-sm border text-[12px]"
                    style={{ borderColor: COLORS[fi % COLORS.length], background: on ? COLORS[fi % COLORS.length] : 'var(--bg-surface)', color: on ? '#fff' : 'var(--text-primary)' }}>{on}</button>
                );
              })}
            </div>
            <div className="mt-1 grid gap-[2px] text-[11px] leading-4 text-fg-2" style={{ gridTemplateColumns: `repeat(${per}, minmax(0, 1fr))` }} aria-hidden="true">
              {segs.map((s) => (
                <span key={`${s.fi}-${s.a}`} className="truncate pt-1" style={{ gridColumn: `${s.a - w.start + 1} / span ${s.b - s.a}`, borderTop: `3px solid ${COLORS[s.fi % COLORS.length]}` }} title={fields[s.fi].name}>{fields[s.fi].name}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Fictional data-field bytes so the framing bar can show what a mis-aligned parser reads.
const fakeData = (n: number) => Uint8Array.from({ length: n }, (_, i) => (i * 73 + 41) & 0xff);

export default function PacketDecoder() {
  const [mode, setMode] = useState<Mode>('sp');
  const [hex, setHex] = useState(PRESETS.sp[0].hex);
  const [prev, setPrev] = useState<number | undefined>(undefined);
  const [lengthMistake, setLengthMistake] = useState(false);
  const [inject, setInject] = useState(false);
  const [apidGuess, setApidGuess] = useState('');
  const [guessResult, setGuessResult] = useState<null | boolean>(null);
  const m = MODES.find((x) => x.id === mode)!;

  const result = useMemo(() => {
    try {
      const raw = parseHex(hex);
      if (raw.length < m.octets) throw new Error(`${m.name} header needs ${m.octets} octets`);
      const bytes = raw.slice(0, m.octets);
      if (inject && mode === 'sp') bytes[0] ^= 0x20; // flip bit 2: version becomes 001
      const fields = mode === 'sp' ? decodeSpacePacket(bytes).fields : mode === 'tm' ? tmFields(bytes) : mode === 'tc' ? tcFields(bytes) : clcwFields(bytes);
      return { bytes, fields, sp: mode === 'sp' ? decodeSpacePacket(bytes) : null, error: null as string | null };
    } catch (e) {
      return { bytes: new Uint8Array(), fields: [] as Field[], sp: null, error: (e as Error).message };
    }
  }, [hex, mode, inject, m]);

  const switchMode = (id: Mode) => {
    setMode(id);
    setHex(PRESETS[id][0].hex);
    setPrev(PRESETS[id][0].prev);
    setInject(false);
    setGuessResult(null);
  };
  const flipBit = (bit: number) => {
    const b = parseHex(hex);
    b[bit >> 3] ^= 1 << (7 - (bit & 7));
    setHex(toHex(b));
    setGuessResult(null);
  };
  const checkApid = () => {
    if (!result.sp) return;
    setGuessResult(parseInt(apidGuess.replace(/^0x/i, ''), 16) === result.sp.apid);
  };
  const reset = () => { switchMode('sp'); setLengthMistake(false); setApidGuess(''); };

  const p = result.sp;
  // Two packets back to back: header + data of packet 1, then packet 2's header (same header bytes).
  const stream = p ? Uint8Array.from([...result.bytes, ...fakeData(p.dataFieldOctets), ...result.bytes]) : null;
  const landing = p ? (lengthMistake ? p.dataLength : p.totalOctets) : 0;
  const bogus = p && stream && lengthMistake ? decodeSpacePacket(stream.slice(landing, landing + 6)) : null;

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-head"><span>Module 02 // Header decoder</span><span>{m.ref}</span></div>
        <div className="space-y-3 p-4">
          <div role="tablist" aria-label="What to decode" className="flex flex-wrap gap-2">
            {MODES.map((x) => (
              <button key={x.id} type="button" role="tab" aria-selected={mode === x.id} className={`btn !py-1.5 ${mode === x.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchMode(x.id)}>{x.name} · {x.octets} octets</button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
              <span className="t-label">Header bytes (hex, fictional)</span>
              <input className="field-input" value={hex} onChange={(e) => { setHex(e.target.value); setGuessResult(null); }} spellCheck={false} aria-describedby="hex-help" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="t-label">Preset</span>
              <select className="field-input" value={PRESETS[mode].findIndex((x) => x.hex === hex)} onChange={(e) => { const pr = PRESETS[mode][Number(e.target.value)]; if (!pr) return; setHex(pr.hex); setPrev(pr.prev); setGuessResult(null); setApidGuess(''); }}>
                {PRESETS[mode].findIndex((x) => x.hex === hex) === -1 && <option value={-1}>Custom</option>}
                {PRESETS[mode].map((pr, i) => <option key={pr.name} value={i}>{pr.name}</option>)}
              </select>
            </label>
            {mode === 'sp' && <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={inject} onChange={(e) => setInject(e.target.checked)} className="h-4 w-4" /> Inject error (flip a version bit)</label>}
            <button type="button" className="btn btn-secondary" onClick={reset}>Reset lab</button>
          </div>
          <p id="hex-help" className="t-small text-fg-2">{m.octets} octets. Spaces optional. Click any bit below to flip it. Bit 0 is the most significant bit of octet 1.</p>
        </div>
      </div>

      {result.error && <p role="alert" className="rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error-fg)]">{result.error}</p>}

      {result.fields.length > 0 && (
        <>
          <div className="card p-4"><WordDiagram bytes={result.bytes} fields={result.fields} onFlip={flipBit} /></div>

          <div className="card overflow-x-auto" tabIndex={0} role="region" aria-label="Decoded fields">
            <table className="w-full text-left text-sm">
              <thead className="bg-subtle"><tr><th className="p-3">Field</th><th className="p-3">Bits</th><th className="p-3 font-mono">Binary</th><th className="p-3">Value / meaning</th></tr></thead>
              <tbody>
                {result.fields.map((fd, fi) => (
                  <tr key={`${fd.name}-${fd.start}`} className="border-t border-line">
                    <td className="p-3"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[fi % COLORS.length] }} aria-hidden="true" />{fd.name}</td>
                    <td className="p-3">{fd.start}–{fd.start + fd.len - 1}</td>
                    <td className="p-3 font-mono">{bitString(result.bytes, fd.start, fd.len)}</td>
                    <td className="p-3">{fd.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {p && p.warnings.length > 0 && (
        <div role="alert" className="rounded-lg bg-[var(--status-warn-bg)] p-3 text-sm text-[var(--status-warn-fg)]"><strong>Parser check:</strong> {p.warnings.join(' ')}</div>
      )}

      {p && stream && (
        <>
          <section className="card p-4" aria-labelledby="stream-h">
            <h3 id="stream-h" className="t-label">Two packets back to back — where does the parser land?</h3>
            <div className="mt-3 flex h-10 overflow-hidden rounded-md border border-line text-[11px]" aria-hidden="true">
              <div className="flex items-center justify-center bg-[var(--tag-standard-bg)] text-[var(--tag-standard-fg)]" style={{ flex: 6 }}>hdr</div>
              <div className="relative flex items-center justify-center bg-subtle text-fg-2" style={{ flex: p.dataFieldOctets }}>packet 1 data · {p.dataFieldOctets} octets</div>
              <div className="flex items-center justify-center bg-[var(--tag-practice-bg)] text-[var(--tag-practice-fg)]" style={{ flex: 6 }}>hdr 2</div>
            </div>
            <div className="relative mt-1 h-6" aria-hidden="true">
              <span className="t-readout absolute -translate-x-1/2 text-xs" style={{ left: `${(landing / stream.length) * 100}%`, color: lengthMistake ? 'var(--status-error-fg)' : 'var(--status-ok-fg)' }}>▲ {landing}</span>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={lengthMistake} onChange={(e) => setLengthMistake(e.target.checked)} className="h-4 w-4" />
              Break it: use the length field as the whole packet length
            </label>
            <p className="mt-2 text-sm" aria-live="polite">
              {lengthMistake && bogus ? (
                <span className="text-[var(--status-error-fg)]">The parser jumps to octet {landing}, {p.totalOctets - landing} octets short of the next header, inside packet 1's data. It reads “APID 0x{bogus.apid.toString(16).toUpperCase().padStart(3, '0')}, length {bogus.dataLength}” — garbage that derails every packet after it.</span>
              ) : (
                <>Next header at 6 + (C + 1) = 6 + {p.dataFieldOctets} = <strong>{p.totalOctets} octets</strong>. The parser lands exactly on packet 2.</>
              )}
            </p>
            <p className="t-small mt-2 text-fg-2">CCSDS 133.0-B-2 §4.1.3.5: the length field holds data-field octets minus one.</p>
          </section>

          <div className="card p-4">
            <p className="t-label">Check yourself: the APID</p>
            <div className="mt-2 flex gap-2">
              <label className="sr-only" htmlFor="apid-guess">APID as hex</label>
              <input id="apid-guess" className="field-input" placeholder="e.g. 0x1A3" value={apidGuess} onChange={(e) => { setApidGuess(e.target.value); setGuessResult(null); }} />
              <button type="button" className="btn btn-primary" onClick={checkApid}>Check</button>
            </div>
            <p aria-live="polite" className="mt-2 text-sm">
              {guessResult === true && <span className="text-[var(--status-ok-fg)]">✓ Correct: APID = 0x{p.apid.toString(16).toUpperCase().padStart(3, '0')} ({p.apid} decimal).</span>}
              {guessResult === false && <span className="text-[var(--status-error-fg)]">✗ Not quite. Mask off the first 5 bits (version, type, secondary header flag); the APID is the remaining 11 bits of the first two octets.</span>}
            </p>
            {prev !== undefined && (
              <p className="mt-2 text-sm">Previous count on this APID: {prev}. This packet: {p.seqCount}. <strong>{seqGap(prev, p.seqCount)} packet(s) missing.</strong> Counts are per APID — never compare counts across two APIDs.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
