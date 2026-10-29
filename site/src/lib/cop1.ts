// Simplified COP-1 model for Tool 6 (CCSDS 232.1-B-2). Teaches the main behaviours:
// in-sequence acceptance, go-back-n retransmission driven by the CLCW, the FARM
// sliding window and Lockout, Wait, and Unlock. Timers, transmission limits and the
// full FOP-1 state table are left out; the UI says so.

export type FarmState = 'Open' | 'Wait' | 'Lockout';
export type FopState = 'S1 Active' | 'S2 Retransmit without wait' | 'S3 Retransmit with wait' | 'S6 Initial';

export type Clcw = { nr: number; lockout: boolean; wait: boolean; retransmit: boolean; farmB: number };

export type Cop1 = {
  // ground (FOP-1)
  vs: number; // next N(S) to send
  nnr: number; // oldest unacknowledged
  sent: number[]; // sent queue, awaiting acknowledgement
  fop: FopState;
  // spacecraft (FARM-1)
  vr: number; // next expected N(S)
  farm: FarmState;
  retransmit: boolean;
  busy: boolean;
  farmB: number;
  // link
  dropNext: boolean;
  accepted: number[];
  log: string[];
  W: number;
};

export const mod = (n: number) => ((n % 256) + 256) % 256;

export function init(start = 10, W = 10): Cop1 {
  return { vs: start, nnr: start, sent: [], fop: 'S1 Active', vr: start, farm: 'Open', retransmit: false, busy: false, farmB: 0, dropNext: false, accepted: [], log: [`FOP and FARM initialised: V(S) = V(R) = ${start}, window W = ${W}`], W };
}

export const clcw = (s: Cop1): Clcw => ({ nr: s.vr, lockout: s.farm === 'Lockout', wait: s.farm === 'Wait', retransmit: s.retransmit, farmB: s.farmB });

/** FARM-1 receives a Type-AD frame. */
function farmReceiveAD(s: Cop1, ns: number): Cop1 {
  const log = [...s.log];
  const PW = s.W / 2;
  const NW = s.W / 2;
  const ahead = mod(ns - s.vr);
  const behind = mod(s.vr - 1 - ns);
  if (s.farm === 'Lockout') {
    log.push(`FARM: N(S)=${ns} discarded — FARM is in Lockout`);
    return { ...s, log };
  }
  if (ahead === 0) {
    if (s.busy) {
      log.push(`FARM: N(S)=${ns} expected but no buffer — Wait, Retransmit=1`);
      return { ...s, farm: 'Wait', retransmit: true, log };
    }
    log.push(`FARM: N(S)=${ns} = V(R) → accepted, V(R) = ${mod(ns + 1)}`);
    return { ...s, vr: mod(ns + 1), farm: 'Open', retransmit: false, accepted: [...s.accepted, ns], log };
  }
  if (ahead <= PW - 1) {
    log.push(`FARM: N(S)=${ns} > V(R)=${s.vr} (positive window) → discarded, Retransmit=1`);
    return { ...s, retransmit: true, log };
  }
  if (behind <= NW - 1) {
    log.push(`FARM: N(S)=${ns} < V(R)=${s.vr} (negative window, already accepted) → discarded`);
    return { ...s, log };
  }
  log.push(`FARM: N(S)=${ns} outside the sliding window (V(R)=${s.vr}, W=${s.W}) → LOCKOUT`);
  return { ...s, farm: 'Lockout', log };
}

/** Ground sends the next Type-AD frame (or a specific N(S) for the out-of-window case). */
export function sendAD(s: Cop1, forceNs?: number): Cop1 {
  if (s.fop === 'S6 Initial' && forceNs === undefined) {
    return { ...s, log: [...s.log, 'FOP: in S6 Initial — re-initialise before sending Type-AD frames'] };
  }
  const ns = forceNs ?? s.vs;
  let next: Cop1 = {
    ...s,
    vs: forceNs === undefined ? mod(s.vs + 1) : s.vs,
    sent: forceNs === undefined ? [...s.sent, ns] : s.sent,
    log: [...s.log, `FOP: transmit AD N(S)=${ns}`],
  };
  if (next.dropNext) {
    next = { ...next, dropNext: false, log: [...next.log, `Link: frame N(S)=${ns} lost (simulated fade)`] };
    return next;
  }
  return farmReceiveAD(next, ns);
}

/** Ground sends a Type-BD frame: bypasses FARM acceptance checks. */
export function sendBD(s: Cop1): Cop1 {
  const log = [...s.log, 'FOP: transmit BD frame (expedited, no sequence check)'];
  if (s.dropNext) return { ...s, dropNext: false, log: [...log, 'Link: BD frame lost — no retransmission for Type-B'] };
  return { ...s, farmB: (s.farmB + 1) % 4, log: [...log, 'FARM: BD frame accepted (bypass); FARM-B counter +1'] };
}

/** Ground sends an Unlock control command (Type-BC). */
export function unlock(s: Cop1): Cop1 {
  const log = [...s.log, 'FOP: transmit BC Unlock'];
  if (s.dropNext) return { ...s, dropNext: false, log: [...log, 'Link: BC frame lost'] };
  return { ...s, farm: 'Open', retransmit: false, busy: s.busy, farmB: (s.farmB + 1) % 4, fop: 'S6 Initial', log: [...log, 'FARM: Unlock → Open, Lockout/Wait/Retransmit cleared'] };
}

/** Re-initialise FOP-1 from the CLCW report value. */
export function reinit(s: Cop1): Cop1 {
  return { ...s, vs: s.vr, nnr: s.vr, sent: [], fop: 'S1 Active', log: [...s.log, `FOP: initialise with V(S) = N(R) = ${s.vr}, queues purged`] };
}

/** Ground reads the CLCW and reacts (acknowledge, retransmit, or detect lockout). */
export function processClcw(s: Cop1): Cop1 {
  const c = clcw(s);
  let log = [...s.log, `CLCW: N(R)=${c.nr} Lockout=${+c.lockout} Wait=${+c.wait} Retransmit=${+c.retransmit}`];
  if (c.lockout) {
    return { ...s, fop: 'S6 Initial', log: [...log, 'FOP: Lockout reported → S6 Initial; send Unlock, then re-initialise'] };
  }
  const sent = s.sent.filter((n) => mod(n - c.nr) < 128); // drop acknowledged frames
  let next: Cop1 = { ...s, sent, nnr: c.nr, log };
  if (c.wait) return { ...next, fop: 'S3 Retransmit with wait', log: [...log, 'FOP: Wait → S3, holding until buffers free'] };
  if (c.retransmit && sent.length) {
    next = { ...next, fop: 'S2 Retransmit without wait', log: [...log, `FOP: Retransmit → S2, resend from N(S)=${sent[0]} (go-back-n)`] };
    for (const ns of sent) {
      next = { ...next, log: [...next.log, `FOP: retransmit AD N(S)=${ns}`] };
      next = next.dropNext ? { ...next, dropNext: false, log: [...next.log, `Link: frame N(S)=${ns} lost`] } : farmReceiveAD(next, ns);
    }
    const after = clcw(next);
    const remaining = next.sent.filter((n) => mod(n - after.nr) < 128);
    return { ...next, sent: remaining, nnr: after.nr, fop: after.retransmit ? next.fop : 'S1 Active', log: [...next.log, after.retransmit ? 'FOP: still awaiting acknowledgement' : 'FOP: all frames acknowledged → S1 Active'] };
  }
  return { ...next, fop: next.fop === 'S6 Initial' ? next.fop : 'S1 Active', log: [...log, sent.length ? `FOP: ${sent.length} frame(s) still unacknowledged` : 'FOP: all frames acknowledged'] };
}

export const setBusy = (s: Cop1, busy: boolean): Cop1 => {
  const log = [...s.log, busy ? 'Spacecraft: command buffer full' : 'Spacecraft: buffer free'];
  if (!busy && s.farm === 'Wait') return { ...s, busy, farm: 'Open', log: [...log, 'FARM: Wait → Open'] };
  return { ...s, busy, log };
};

/** Timer T1 expires with frames unacknowledged: FOP-1 retransmits them all (go-back-n). */
export function timerExpiry(s: Cop1): Cop1 {
  if (!s.sent.length) return { ...s, log: [...s.log, 'FOP: T1 expired — nothing unacknowledged'] };
  let next: Cop1 = { ...s, fop: 'S2 Retransmit without wait', log: [...s.log, `FOP: T1 expired → S2, resend from N(S)=${s.sent[0]}`] };
  for (const ns of s.sent) {
    next = { ...next, log: [...next.log, `FOP: retransmit AD N(S)=${ns}`] };
    next = next.dropNext ? { ...next, dropNext: false, log: [...next.log, `Link: frame N(S)=${ns} lost`] } : farmReceiveAD(next, ns);
  }
  return next;
}

/** Sliding-window zones for display (CCSDS 232.1-B-2 FARM-1: W, PW = NW = W/2). */
export function windowZone(s: Cop1, ns: number): 'expected' | 'positive' | 'negative' | 'lockout' {
  const ahead = mod(ns - s.vr);
  const behind = mod(s.vr - 1 - ns);
  if (ahead === 0) return 'expected';
  if (ahead <= s.W / 2 - 1) return 'positive';
  if (behind <= s.W / 2 - 1) return 'negative';
  return 'lockout';
}
