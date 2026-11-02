// Run against a local app: NODE_PATH=<playwright node_modules> node scripts/check-hero-browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.HEXORA_TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HEXORA_CHROMIUM ? { executablePath: process.env.HEXORA_CHROMIUM } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Exercise the existing public profile binding without modifying the database.
    await page.route('**/api/profile/public', route => route.fulfill({ json: { data: { brandName: 'Hexora', shortDescription: 'Hero profile integration check', workingStatus: 'BUSY' } } }));
    await page.goto(base + '/');
    await page.locator('#heroText').filter({ hasText: 'Hero profile integration check' }).waitFor();
    assert((await page.locator('.hx-status b').textContent()).includes('مشغول'));
    await page.evaluate(() => document.fonts.ready);
    assert(await page.locator('.hx-logo').evaluate(image => image.complete && image.naturalWidth > 0));
    assert.equal(await page.locator('.hx-depth').count(), 30);
    assert.equal(await page.locator('.hx-hero video').count(), 0);
    assert.equal(await page.locator('.hx-particles').count(), 1);
    const canvas = page.locator('.hx-particles');
    const first = await canvas.evaluate(c => c.toDataURL());
    await page.waitForTimeout(180);
    assert.notEqual(await canvas.evaluate(c => c.toDataURL()), first, 'particles should animate');
    const rect = await page.locator('.hx-stage').boundingBox();
    await page.locator('.hx-stage').hover({ position: { x: rect.width * .75, y: rect.height * .25 } });
    await page.waitForFunction(() => document.querySelector('.hx-tilt').style.getPropertyValue('--ry')); 
    assert((await page.locator('.hx-tilt').getAttribute('style')).includes('--ry'));
    await page.locator('.hx-turn').click();
    assert(await page.locator('.hx-solid').evaluate(e => e.getAnimations().some(a => a.effect.getKeyframes().length === 3)));
    await page.locator('.hx-motion').click();
    assert.equal(await page.locator('.hx-hero').getAttribute('data-motion'), 'off');
    assert.equal(await canvas.evaluate(c => getComputedStyle(c).visibility), 'hidden');
    await page.locator('#langBtn').click();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert((await page.locator('.hx-title').textContent()).includes('From an idea'));
    assert((await page.locator('.hx-motion').textContent()).includes('Enable animations'));
    assert.equal(await page.locator('#heroText').textContent(), 'Hero profile integration check');
    for (const lang of ['en', 'fa']) {
      if (await page.locator('html').getAttribute('lang') !== lang) await page.locator('#langBtn').click();
      for (const width of [1440, 1024, 768, 620, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const layout = await page.locator('.hx-hero').evaluate(e => ({ width: e.clientWidth, scroll: e.scrollWidth }));
        assert(layout.scroll <= layout.width + 1, `${lang}/${width}: hero overflow ${JSON.stringify(layout)}`);
      }
    }
    assert.equal(await page.locator('.hx-actions a[href="/contact"]').count(), 1);
    assert.equal(await page.locator('.hx-actions a[href="/projects"]').count(), 1);
    assert(await page.locator('#servicesList').count());
    assert(await page.locator('#projects').count());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.hx-hero').getAttribute('data-motion'), 'off');
    await page.locator('.hx-turn').click();
    assert.equal(await page.locator('.hx-solid').evaluate(e => e.getAnimations().length), 0);
    await page.goto(base + '/skills');
    assert.equal(await page.locator('.hx-hero:visible').count(), 0);
    assert.deepEqual(errors, []);
    console.log('Hero browser checks passed: live profile/status, FA/EN, 12 layouts, PNG depth, particles, tilt/rotation, pause, reduced motion, real links and other-page isolation.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
