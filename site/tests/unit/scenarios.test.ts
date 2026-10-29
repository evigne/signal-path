import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../../src/lib/scenarios';
import { TREE, UPLINK_TREE } from '../../src/lib/chain';

describe('Tool 9 scenarios', () => {
  it('covers the four scenarios promised by the lab', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual(['carrier-but-no-frame-lock', 'frame-lock-with-errors', 'packets-missing-frames-ok', 'command-radiated-no-execution']);
  });
  for (const s of SCENARIOS) {
    it(`${s.id}: one correct hypothesis and valid layers`, () => {
      const tree = s.tree === 'uplink' ? UPLINK_TREE : TREE;
      expect(s.hypotheses.filter((h) => h.correct)).toHaveLength(1);
      expect(s.firstBad).toBeLessThan(tree.length);
      for (const t of s.tests) expect(t.layer).toBeLessThan(tree.length);
      expect(s.tests[s.keyEvidence].lowValue).toBeFalsy();
      // tests flagged low value probe layers at or below the first bad layer
      for (const t of s.tests.filter((t) => t.lowValue)) expect(t.layer).toBeLessThanOrEqual(s.firstBad);
    });
  }
});
