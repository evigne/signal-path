import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';

// Islands render on the server and hydrate later; interact only once the islands in
// view have hydrated (client:visible islands off screen never will).
async function hydrated(page: Page, within?: Locator) {
  await page.waitForLoadState('networkidle');
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
  '/paths/space-comms-101/',
  '/topics/why-space-links-are-different/',
  '/topics/anatomy-of-a-pass/',
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

test('decision tree runs all four scenarios', async ({ page }) => {
  await page.goto('/labs/anomaly-decision-tree/');
  await hydrated(page);
  const pick = page.getByRole('group', { name: 'Scenario' });
  for (const name of [/^A ·/, /^B ·/, /^C ·/, /^D ·/]) await expect(pick.getByRole('button', { name })).toBeVisible();
  await expect(async () => {
    await pick.getByRole('button', { name: /^D ·/ }).click();
    await expect(page.getByLabel(/FARM-1 Lockout/)).toBeVisible({ timeout: 1000 });
  }).toPass();
  await page.getByLabel(/FARM-1 Lockout/).check();
  await expect(page.getByText('✓ Correct', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Uplink decision tree' })).toBeVisible();
});

test('coding sandbox shows cited gains and the E mismatch', async ({ page }) => {
  await page.goto('/labs/channel-coding-sandbox/');
  await hydrated(page);
  await expect(page.getByText('≈ 7.5 dB')).toBeVisible();
  await page.getByLabel('Code', { exact: true }).selectOption('turbo');
  await expect(page.getByText('≈ 9.0 dB')).toBeVisible();
  await page.getByLabel('R-S decoder E').selectOption('8');
  await page.getByLabel('Code', { exact: true }).selectOption('rs');
  await expect(page.getByText('every codeword fails: configuration, not RF')).toBeVisible();
});

test('packet decoder rejects an injected version error and decodes a CLCW', async ({ page }) => {
  await page.goto('/labs/space-packet-header-decoder/');
  await hydrated(page);
  await page.getByLabel('Inject error (flip a version bit)').check();
  await expect(page.getByText(/Packet Version Number is not 000/)).toBeVisible();
  await page.getByRole('tab', { name: /CLCW/ }).click();
  await page.getByLabel('Preset').selectOption({ label: 'CLCW, Lockout' });
  await expect(page.getByRole('cell', { name: 'LOCKOUT', exact: true })).toBeVisible();
});

test('walkthrough offers the closed loop', async ({ page }) => {
  await page.goto('/labs/end-to-end-walkthrough/');
  await hydrated(page);
  // Retry the click in case it landed before hydration finished.
  await expect(async () => {
    await page.getByRole('button', { name: 'Both (closed loop)' }).click();
    await expect(page.getByRole('list', { name: 'uplink stages in order' })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole('list', { name: 'downlink stages in order' })).toBeVisible();
});

test('beginner path is first and linked from home', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /New to space comms/ })).toHaveAttribute('href', '/paths/space-comms-101/');
  await page.goto('/paths/');
  await expect(page.locator('main ol.mt-8 > li').first()).toContainText('Space comms 101');
});
