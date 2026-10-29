import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';

// Islands render on the server and hydrate later; interact only once the islands in
// view have hydrated (client:visible islands off screen never will).
async function hydrated(page: Page, within?: Locator) {
  if (within) await within.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll('astro-island[ssr]')].every((el) => {
      // astro-island is display: contents, so measure its rendered child.
      const r = (el.firstElementChild ?? el).getBoundingClientRect();
      return r.top > window.innerHeight || r.bottom < 0;
    }),
  );
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

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Deep Space (dark) is the default; Cleanroom (light) is chosen with the theme toggle,
// which stores sp-theme=light.
async function useTheme(page: Page, theme: 'dark' | 'light', depth = 'intermediate') {
  await page.addInitScript(([t, d]) => {
    localStorage.setItem('sp-theme', t);
    localStorage.setItem('sp-depth-mode', d);
  }, [theme, depth]);
}

for (const theme of ['dark', 'light'] as const) {
  for (const path of PAGES) {
    test(`${theme}: ${path} has no WCAG A/AA violations`, async ({ page }) => {
      await useTheme(page, theme);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }
  for (const depth of ['beginner', 'expert']) {
    test(`${theme}: topic in ${depth} mode has no WCAG A/AA violations`, async ({ page }) => {
      await useTheme(page, theme, depth);
      await page.goto('/topics/end-to-end-system/');
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
}

test('theme toggle switches to Cleanroom and back', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
});

test('depth switch persists and folds depth blocks', async ({ page }) => {
  await page.goto('/topics/end-to-end-system/');
  await expect(page.locator('html')).toHaveAttribute('data-depth', 'intermediate');
  await page.getByRole('group', { name: 'Reading depth' }).getByRole('button', { name: 'Expert' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-depth', 'expert');
  const expert = page.locator('details[data-depth-block="expert"]');
  if (await expert.count()) await expect(expert.first()).toHaveAttribute('open', '');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-depth', 'expert');
  await page.getByRole('group', { name: 'Reading depth' }).getByRole('button', { name: 'Beginner' }).click();
  if (await expert.count()) await expect(expert.first()).not.toHaveAttribute('open', '');
});

test('topic pages embed their tool and link prev/next', async ({ page }) => {
  await page.goto('/topics/sync-markers/');
  await expect(page.getByRole('heading', { name: 'Try it' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Previous and next topic' });
  await expect(nav.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/topics/carrier-and-symbol-sync/');
  await expect(nav.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/topics/pseudo-randomization/');
});

test('section lists intro topics before advanced ones', async ({ page }) => {
  await page.goto('/section/space-link/');
  const titles = await page.locator('main h3, main a .t-h4').allTextContents();
  const aos = titles.findIndex((t) => t.includes('AOS'));
  const packets = titles.findIndex((t) => t.includes('Space Packet Protocol'));
  expect(packets).toBeGreaterThanOrEqual(0);
  expect(aos).toBeGreaterThan(packets);
});

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
