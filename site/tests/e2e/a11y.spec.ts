import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';

// Islands render on the server and hydrate later; interact only once hydrated.
async function hydrated(page: Page, within?: Locator) {
  if (within) await within.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll('astro-island[ssr]').length === 0 || [...document.querySelectorAll('astro-island[ssr]')].every((el) => el.getBoundingClientRect().top > window.innerHeight * 2));
}

const PAGES = [
  '/',
  '/start-here/',
  '/topics/sync-markers/',
  '/topics/space-packet-protocol/',
  '/paths/operator-conversation-fluency/',
  '/labs/space-packet-header-decoder/',
  '/labs/data-budget-calculator/',
  '/labs/telemetry-calibration-sandbox/',
  '/labs/bit-byte-endianness-inspector/',
  '/labs/sync-marker-visualiser/',
  '/labs/channel-coding-sandbox/',
  '/labs/cop1-farm-simulator/',
  '/labs/end-to-end-walkthrough/',
  '/labs/anomaly-decision-tree/',
  '/glossary/',
  '/providers/',
  '/standards/ccsds-133-0-b-2/',
  '/symptoms/carrier-but-no-frame-lock/',
  '/sources/',
];

for (const theme of ['light', 'dark'] as const) {
  for (const path of PAGES) {
    test(`${theme}: ${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }
}

test('pages do not scroll horizontally', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});

test('claims render with labels and register links', async ({ page }) => {
  await page.goto('/topics/sync-markers/');
  const claims = page.locator('aside.claim');
  expect(await claims.count()).toBeGreaterThan(10);
  await expect(claims.first().locator('.label-chip')).toHaveText(/Standard-defined|Common practice|Illustrative example|Mission-specific/);
  await expect(claims.first().locator('.claim-cite a').first()).toHaveAttribute('href', /\/sources\/#/);
});

test('quiz gives feedback', async ({ page }) => {
  await page.goto('/topics/space-packet-protocol/');
  const q = page.locator('fieldset').filter({ hasText: 'Idle Packet' });
  await hydrated(page, q);
  await q.getByLabel(/All ones/).check();
  await q.getByRole('button', { name: 'Check answer' }).click();
  await expect(q.getByText('✓ Correct', { exact: true })).toBeVisible();
});

test('packet decoder decodes the preset', async ({ page }) => {
  await page.goto('/labs/space-packet-header-decoder/');
  await hydrated(page);
  await expect(page.getByRole('cell', { name: '63 → 64-octet data field → 70-octet packet' })).toBeVisible();
  await page.getByLabel('APID as hex').fill('0x07E');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/Correct: APID = 0x07E/)).toBeVisible();
});
