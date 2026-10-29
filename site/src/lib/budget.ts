// Data-budget arithmetic for Tool 7. Units: Mbit/s = 10^6 bit/s, MB = 10^6 octets,
// MiB = 2^20 octets. The rate is the usable information rate, after coding and framing.

export type BudgetInput = {
  rateMbps: number;
  passSeconds: number;
  setupSeconds: number;
  framingPct: number;
  retransPct: number;
  marginPct: number;
  passesPerDay: number;
  generationMBPerDay: number;
  startBacklogMB: number;
};

export const DEFAULTS: BudgetInput = {
  rateMbps: 2.0,
  passSeconds: 600,
  setupSeconds: 60,
  framingPct: 8,
  retransPct: 5,
  marginPct: 10,
  passesPerDay: 4,
  generationMBPerDay: 360,
  startBacklogMB: 300,
};

export function computeBudget(i: BudgetInput) {
  const usable = Math.max(0, i.passSeconds - i.setupSeconds);
  const raw = (i.rateMbps * 1e6 * usable) / 8 / 1e6;
  const afterFraming = raw * (1 - i.framingPct / 100);
  const afterRetrans = afterFraming * (1 - i.retransPct / 100);
  const perPass = afterRetrans * (1 - i.marginPct / 100);
  const perDay = perPass * i.passesPerDay;
  const balance = perDay - i.generationMBPerDay;
  const backlog: number[] = [];
  let b = i.startBacklogMB;
  // Day 1 shows the starting backlog; each later day applies one day's balance.
  for (let d = 0; d < 7; d++) {
    backlog.push(b);
    b = Math.max(0, b - balance);
  }
  return {
    usable,
    raw,
    afterFraming,
    afterRetrans,
    perPass,
    perPassMiB: (perPass * 1e6) / 2 ** 20,
    perDay,
    perDayMiB: (perDay * 1e6) / 2 ** 20,
    balance,
    backlog,
  };
}
