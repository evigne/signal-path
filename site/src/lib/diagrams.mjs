// Inline SVG diagrams placed in topic Markdown with a leaf directive: ::diagram{name="fhp"}.
// Colours come from the theme tokens so both themes work; each figure carries a text
// caption and an aria-label, and the topic text around it explains the same content.

const T = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 12}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} ${o.weight ? `font-weight="${o.weight}"` : ''} font-family="${o.mono ? 'var(--font-mono)' : 'var(--font-sans)'}" fill="${o.fill ?? 'var(--text-primary)'}">${s}</text>`;
const R = (x, y, w, h, fill, stroke = 'var(--border-strong)', extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const fig = (label, viewBox, body, caption) =>
  `<figure class="sp-diagram" tabindex="0"><svg viewBox="${viewBox}" role="img" aria-label="${label}" class="w-full">${body}</svg><figcaption>${caption}</figcaption></figure>`;

function fhp() {
  // Two consecutive TM frames; packet B spills from frame 1 into frame 2.
  const hdr = 'var(--tag-standard-bg)';
  const pk = ['var(--tag-practice-bg)', 'var(--tag-example-bg)', 'var(--tag-mission-bg)'];
  let b = '';
  const frame = (x, n, segs, fhpAt, fhpLabel) => {
    let s = R(x, 40, 340, 60, 'var(--bg-surface)', 'var(--diagram-downlink)', 'stroke-width="2"');
    s += R(x + 4, 44, 52, 52, hdr) + T(x + 30, 66, 'Hdr', { anchor: 'middle', size: 11 }) + T(x + 30, 82, 'FHP', { anchor: 'middle', size: 10, mono: true, fill: 'var(--text-secondary)' });
    let cx = x + 60;
    for (const sg of segs) {
      s += R(cx, 44, sg.w, 52, pk[sg.c]) + T(cx + sg.w / 2, 74, sg.t, { anchor: 'middle', size: 11 });
      cx += sg.w;
    }
    s += T(x, 30, `TM frame ${n} · data field`, { size: 11, fill: 'var(--text-secondary)' });
    // FHP arrow from header to first packet start
    s += `<path d="M${x + 30} 100 C ${x + 30} 128, ${fhpAt} 128, ${fhpAt} 100" fill="none" stroke="var(--bg-accent)" stroke-width="1.6" marker-end="url(#fhp-a)"/>`;
    s += T((x + 30 + fhpAt) / 2, 140, fhpLabel, { anchor: 'middle', size: 11, mono: true, fill: 'var(--text-link)' });
    return s;
  };
  b += `<defs><marker id="fhp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--bg-accent)"/></marker></defs>`;
  b += frame(10, 1, [{ w: 120, c: 0, t: 'packet A' }, { w: 156, c: 1, t: 'packet B (start)' }], 70, 'FHP = 0');
  b += frame(370, 2, [{ w: 90, c: 1, t: 'B (rest)' }, { w: 186, c: 2, t: 'packet C' }], 520, 'FHP = 90');
  b += T(360, 172, 'If frame 1 is lost, the receiver skips the rest of B and restarts at the octet the FHP points to.', { anchor: 'middle', size: 11, fill: 'var(--text-secondary)' });
  return fig(
    'Two consecutive TM transfer frames. Frame 1 holds packet A and the start of packet B; its First Header Pointer is 0. Frame 2 begins with the rest of packet B; its First Header Pointer is 90, pointing at packet C.',
    '0 0 720 180',
    b,
    'First Header Pointer: the offset of the first packet that <em>starts</em> in this frame (fictional lengths, octets). CCSDS 132.0-B-3 §4.1.2.7.6.',
  );
}

function codingPipeline() {
  const steps = [
    ['Transfer frame', 'with FECF (CRC-16)'],
    ['Block code', 'R-S / Turbo / LDPC'],
    ['Pseudo-randomizer', 'XOR with PN sequence'],
    ['Attach sync marker', 'ASM / CSM'],
    ['Convolutional code', 'optional, inner'],
    ['Modulator', 'symbols on RF'],
  ];
  const w = 108, g = 12;
  let b = `<defs><marker id="cp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--diagram-downlink)"/></marker></defs>`;
  steps.forEach(([t, s], i) => {
    const x = 6 + i * (w + g);
    const optional = i === 4;
    b += R(x, 30, w, 64, 'var(--bg-surface)', 'var(--diagram-downlink)', `stroke-width="2" ${optional ? 'stroke-dasharray="5 4"' : ''}`);
    b += T(x + w / 2, 56, t, { anchor: 'middle', size: 11.5, weight: 600 });
    b += T(x + w / 2, 76, s, { anchor: 'middle', size: 10.5, fill: 'var(--text-secondary)' });
    if (i < steps.length - 1) b += `<line x1="${x + w + 1}" y1="62" x2="${x + w + g - 1}" y2="62" stroke="var(--diagram-downlink)" stroke-width="2" marker-end="url(#cp-a)"/>`;
  });
  b += `<path d="M${6 + w + g} 104 h${3 * w + 2 * g}" stroke="var(--text-secondary)" fill="none"/>`;
  b += T(6 + w + g + (3 * w + 2 * g) / 2, 122, 'CADU = sync marker + randomized codeblock (before any convolutional code)', { anchor: 'middle', size: 11, fill: 'var(--text-secondary)' });
  return fig(
    'Downlink coding order: transfer frame with error control field, then block code, then pseudo-randomizer, then sync marker, then optional convolutional code, then modulator.',
    '0 0 726 132',
    b,
    'Order of the TM synchronization and channel coding steps (CCSDS 131.0-B-6 §9–§10; CADU per Table 9-1). Dashed: optional. The receiver undoes them in reverse.',
  );
}

function gsaas() {
  const rows = [
    ['RF / digitized IF', 'Station samples the RF and streams it; the mission runs its own (software) modem.', 'e.g. AWS wideband DigIF', 'var(--diagram-spacecraft)'],
    ['Frames over SLE', 'Station demodulates and decodes; frames reach the mission over SLE RAF / RCF.', 'CCSDS 911.1 / 911.2', 'var(--diagram-downlink)'],
    ['Files after the pass', 'Station records the pass; data lands as files in a store or bucket afterwards.', 'e.g. AWS S3 delivery', 'var(--diagram-uplink)'],
  ];
  let b = '';
  rows.forEach(([t, d, ex, c], i) => {
    const y = 10 + i * 66;
    b += R(6, y, 150, 52, 'var(--bg-surface)', c, 'stroke-width="2"') + T(81, y + 31, t, { anchor: 'middle', size: 12, weight: 600 });
    b += `<line x1="160" y1="${y + 26}" x2="196" y2="${y + 26}" stroke="${c}" stroke-width="2" stroke-dasharray="${i === 2 ? '4 4' : '0'}"/>`;
    b += T(204, y + 22, d, { size: 11.5 });
    b += T(204, y + 40, ex, { size: 10.5, mono: true, fill: 'var(--text-secondary)' });
  });
  b += T(6, 212, 'Real time ← → Store and forward', { size: 11, fill: 'var(--text-secondary)' });
  return fig(
    'Three ways a ground-station provider hands data to a mission: digitized RF for the mission to demodulate, decoded frames over SLE, or files after the pass.',
    '0 0 720 220',
    b,
    'Ground-station hand-off options. The further down, the more the provider does and the later the data arrives.',
  );
}

export const DIAGRAMS = { fhp, 'coding-pipeline': codingPipeline, gsaas };
