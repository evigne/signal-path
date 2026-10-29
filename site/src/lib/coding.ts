// Tool 4 model. Curves are schematic shapes for teaching; the coding-gain readout uses
// only figures stated in the text of CCSDS 130.1-G-3 §3.3.3 (BER 10⁻⁵, ideal
// interleaving, no synchronization losses). The R-S limit E follows CCSDS 131.0-B-6 §5.

export type Code = 'uncoded' | 'conv' | 'rs' | 'concat' | 'turbo' | 'ldpc';

export type CodeInfo = {
  id: Code;
  name: string;
  /** Shift used to draw the schematic curve (dB). */
  shift: number;
  /** Cited coding gain at BER 1e-5, if the guide states one in text. */
  gain?: { db: number; note: string };
  /** Where to read the curves when no single figure is stated. */
  curves?: string;
};

export const CODES: CodeInfo[] = [
  { id: 'uncoded', name: 'Uncoded', shift: 0, gain: { db: 0, note: 'reference' } },
  { id: 'conv', name: 'Convolutional (7, 1/2) only', shift: 5.5, gain: { db: 5.5, note: '130.1-G-3 §3.3.3' } },
  { id: 'rs', name: 'Reed–Solomon (255,223) only', shift: 4.0, curves: '130.1-G-3 §5.5' },
  { id: 'concat', name: 'Concatenated: conv. + RS', shift: 7.5, gain: { db: 7.5, note: 'conv. 5.5 + RS 2.0 · 130.1-G-3 §3.3.3' } },
  { id: 'turbo', name: 'Turbo rate 1/2 (k = 8920)', shift: 9.0, gain: { db: 9.0, note: 'about 1.5 dB beyond concatenated · 130.1-G-3 §3.3.3' } },
  { id: 'ldpc', name: 'LDPC', shift: 9.0, curves: '130.1-G-3 §8.6, figure 8-8' },
];

export const codeInfo = (id: Code) => CODES.find((c) => c.id === id)!;

/** Schematic BER: an uncoded-like waterfall shifted left by the code's gain. */
export function schematicBer(ebn0: number, shift: number) {
  const x = ebn0 + shift;
  const v = 0.5 * Math.exp(-0.06 * x * x - 0.18 * x);
  return Math.min(0.5, Math.max(1e-12, shift > 0 ? v ** (1 + shift / 6) : v));
}

/** Symbols in error per codeword after spreading a burst over interleaving depth I. */
export function spreadBurst(burst: number, depth: number) {
  return Array.from({ length: depth }, (_, i) => Math.floor(burst / depth) + (i < burst % depth ? 1 : 0));
}

/** R-S decode outcome for one codeword. A decoder set to a different E than the stream fails every codeword. */
export function rsDecode(symbolErrors: number, streamE: number, decoderE: number) {
  if (streamE !== decoderE) return { ok: false, reason: 'config' as const };
  return symbolErrors <= streamE ? { ok: true, reason: 'corrected' as const } : { ok: false, reason: 'cliff' as const };
}
