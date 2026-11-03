const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.HEXORA_TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HEXORA_CHROMIUM ? { executablePath: process.env.HEXORA_CHROMIUM } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    let journey = 'HTML   CSS,Java،Spring\nReact';
    await page.route('**/api/profile/public', route => route.fulfill({ json: { data: {
      fullName: 'نام اختصاصی', title: 'عنوان اختصاصی', brandName: 'Hexora',
      shortDescription: 'توضیح اختصاصی', workingStatus: 'AVAILABLE', journeyText: journey,
      githubUrl: 'https://github.com/hexora', instagramUrl: 'https://instagram.com/hexora', email: 'hi@example.test'
    } } }));
    await page.route('**/api/skills/public', route => route.fulfill({ json: { data: [
      { name: 'Java', category: 'BACKEND', icon: 'fa-brands fa-java' },
      { name: 'JavaScript', category: 'FRONTEND', icon: 'fa-brands fa-js' }
    ] } }));
    await page.goto(base + '/about');
    await page.locator('.journey-path li').first().waitFor();
    assert.deepEqual(await page.locator('.journey-label').allTextContents(), ['HTML', 'CSS', 'Java', 'Spring', 'React']);
    assert.equal(await page.locator('.journey-path').evaluate(e => e.tagName), 'OL');
    assert((await page.locator('h1').textContent()).includes('داستان من'));
    assert.equal(await page.locator('.bio-story h2').textContent(), 'توضیح اختصاصی');
    for (const selector of ['.contact-icon-link', '.orbit-skill', '.skill-name']) {
      assert.deepEqual(await page.locator(selector).first().evaluate(e => {
        const s = getComputedStyle(e); return [s.borderTopWidth, s.backgroundColor, s.boxShadow];
      }), ['0px', 'rgba(0, 0, 0, 0)', 'none'], selector);
    }
    assert.equal(await page.locator('.bio-identity a[href="mailto:hi@example.test"]').getAttribute('aria-label'), 'hi@example.test');
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const language of ['fa', 'en']) {
        if (await page.locator('html').getAttribute('lang') !== language) await page.locator('#langBtn').click();
        await page.waitForFunction(() => document.querySelectorAll('.journey-path li').length === 5);
        const rows = await page.locator('.journey-path li').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y }; }));
        assert(rows.every((r, i) => !i || r.y > rows[i-1].y), 'journey must always be vertical');
        assert(rows.every(r => Math.abs(r.x - rows[0].x) < 1), 'journey rows must align');
        assert(await page.locator('.journey-path').evaluate(e => e.scrollWidth <= e.clientWidth));
      }
    }
    await page.locator('.skill-category-nav [data-category="BACKEND"]').click();
    assert.equal(await page.locator('.skill-category:visible').count(), 1);
    journey = '  ,،\n ';
    await page.goto(base + '/about');
    await page.locator('.bio-story').waitFor();
    assert.equal(await page.locator('.learning-journey').count(), 0);
    journey = '<script>alert(1)</script>,Java';
    await page.goto(base + '/about');
    await page.locator('.journey-label').first().waitFor();
    assert.equal(await page.locator('.journey-path script').count(), 0);
    assert((await page.locator('.journey-path').textContent()).includes('<script>'));
    assert.deepEqual(errors, []);
    console.log('About page passed: bare accessible icons, unchanged headings, vertical FA/EN desktop/mobile journey, mixed separators, empty/escaped content and skill filters.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
