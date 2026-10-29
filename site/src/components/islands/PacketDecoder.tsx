import { useMemo, useState } from 'react';
import { bitString, decodeSpacePacket, parseHex, seqGap, toHex } from '../../lib/ccsds';

const PRESETS = [
  { name: 'Housekeeping packet', hex: '08 7E C4 12 00 3F' },
  { name: 'Next packet (sequence gap)', hex: '08 7E C4 14 00 3F', prev: 1042 },
  { name: 'Telecommand packet', hex: '18 2A C0 07 00 09' },
  { name: 'Idle packet (APID all ones)', hex: '07 FF C0 00 00 03' },
];

const COLORS = ['#5136C2', '#0F6B63', '#8A5200', '#2A57C4', '#A81E40', '#166534', '#46536E'];

export default function PacketDecoder() {
  const [hex, setHex] = useState(PRESETS[0].hex);
  const [prev, setPrev] = useState<number | undefined>(undefined);
  const [lengthMistake, setLengthMistake] = useState(false);
  const [apidGuess, setApidGuess] = useState('');
  const [guessResult, setGuessResult] = useState<null | boolean>(null);

  const result = useMemo(() => {
    try {
      const bytes = parseHex(hex);
      return { bytes, p: decodeSpacePacket(bytes), error: null as string | null };
    } catch (e) {
      return { bytes: new Uint8Array(), p: null, error: (e as Error).message };
    }
  }, [hex]);

  const flipBit = (bit: number) => {
    const b = result.bytes.slice();
    b[bit >> 3] ^= 1 << (7 - (bit & 7));
    setHex(toHex(b));
    setGuessResult(null);
  };

  const checkApid = () => {
    if (!result.p) return;
    const v = parseInt(apidGuess.replace(/^0x/i, ''), 16);
    setGuessResult(v === result.p.apid);
  };

  const p = result.p;
  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1 text-sm">
            <span className="t-label">Header bytes (hex, fictional)</span>
            <input className="field-input" value={hex} onChange={(e) => { setHex(e.target.value); setGuessResult(null); }} spellCheck={false} aria-describedby="hex-help" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="t-label">Preset</span>
            <select
              className="field-input"
              onChange={(e) => {
                const pr = PRESETS[Number(e.target.value)];
                setHex(pr.hex);
                setPrev(pr.prev);
                setGuessResult(null);
                setApidGuess('');
              }}
            >
              {PRESETS.map((pr, i) => <option key={pr.name} value={i}>{pr.name}</option>)}
            </select>
          </label>
          <button type="button" className="btn btn-secondary" onClick={() => { setHex(PRESETS[0].hex); setPrev(undefined); setLengthMistake(false); setApidGuess(''); setGuessResult(null); }}>Reset lab</button>
        </div>
        <p id="hex-help" className="t-small mt-2 text-fg-2">Six octets of a Space Packet primary header. Spaces optional. Click any bit below to flip it.</p>
      </div>

      {result.error && <p role="alert" className="rounded-lg bg-[var(--status-error-bg)] p-3 text-sm text-[var(--status-error-fg)]">{result.error}</p>}

      {p && (
        <>
          <div className="card overflow-x-auto p-4" tabIndex={0} role="region" aria-label="Header bit map">
            <p className="t-label mb-2">Primary header · 6 octets (48 bits) · bit 0 is the most significant bit of octet 1</p>
            <div className="flex min-w-[1250px] gap-[2px] font-mono text-[13px]" role="group" aria-label="Header bits">
              {Array.from({ length: 48 }, (_, i) => {
                const fi = p.fields.findIndex((f) => i >= f.start && i < f.start + f.len);
                const on = (result.bytes[i >> 3] >> (7 - (i & 7))) & 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => flipBit(i)}
                    aria-label={`Bit ${i}, ${p.fields[fi].name}, value ${on}. Flip.`}
                    className="flex h-9 min-w-[24px] flex-1 items-center justify-center rounded-sm border text-[12px]"
                    style={{ borderColor: COLORS[fi], background: on ? COLORS[fi] : 'var(--bg-surface)', color: on ? '#fff' : 'var(--text-primary)' }}
                  >{on}</button>
                );
              })}
            </div>
            <div className="mt-2 flex min-w-[1250px] gap-[2px] text-[11px] text-fg-2">
              {p.fields.map((f, fi) => (
                <div key={f.name} style={{ flex: f.len, borderTop: `3px solid ${COLORS[fi]}` }} className="truncate pt-1" title={f.name}>{f.name} · {f.len}b</div>
              ))}
            </div>
          </div>

          <div className="card overflow-x-auto" tabIndex={0} role="region" aria-label="Decoded fields">
            <table className="w-full text-left text-sm">
              <thead className="bg-subtle"><tr><th className="p-3">Field</th><th className="p-3">Bits</th><th className="p-3 font-mono">Binary</th><th className="p-3">Value / meaning</th></tr></thead>
              <tbody>
                {p.fields.map((f, fi) => (
                  <tr key={f.name} className="border-t border-line">
                    <td className="p-3"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[fi] }} aria-hidden="true" />{f.name}</td>
                    <td className="p-3">{f.start}–{f.start + f.len - 1}</td>
                    <td className="p-3 font-mono">{bitString(result.bytes, f.start, f.len)}</td>
                    <td className="p-3">{f.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {p.warnings.length > 0 && (
            <div role="alert" className="rounded-lg bg-[var(--status-warn-bg)] p-3 text-sm text-[var(--status-warn-fg)]">
              <strong>Parser check:</strong> {p.warnings.join(' ')}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <p className="t-label">The length-field gotcha</p>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={lengthMistake} onChange={(e) => setLengthMistake(e.target.checked)} className="h-4 w-4" />
                Break it: use the length field as the packet length
              </label>
              <p className="mt-2 text-sm">
                {lengthMistake ? (
                  <span className="text-[var(--status-error-fg)]">Extractor jumps {p.dataLength} octets and lands {p.totalOctets - p.dataLength} octets short of the next header — the next "packet" is garbage.</span>
                ) : (
                  <>Total = 6 header octets + (C + 1) = 6 + {p.dataFieldOctets} = <strong>{p.totalOctets} octets</strong>.</>
                )}
              </p>
              <p className="t-small mt-2 text-fg-2">CCSDS 133.0-B-2 §4.1.3.5: the field holds data-field octets minus one.</p>
            </div>
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
                <p className="mt-2 text-sm">Previous count on this APID: {prev}. This packet: {p.seqCount}. <strong>{seqGap(prev, p.seqCount)} packet(s) missing.</strong></p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
