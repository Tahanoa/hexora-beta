// NODE_PATH=<playwright modules> HEXORA_CHROMIUM=<optional executable> node scripts/check-public-headings.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.HEXORA_TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HEXORA_CHROMIUM ? { executablePath: process.env.HEXORA_CHROMIUM } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    let journey = ' HTML   CSS,Java،Spring\nReact ';
    await page.route('**/api/profile/public', route => route.fulfill({ json: { data: {
      fullName: 'نام اختصاصی', brandName: 'Hexora', title: 'عنوان اختصاصی', workingStatus: 'AVAILABLE',
      shortDescription: 'توضیح اختصاصی', aboutText: 'محتوای نوشته‌شده توسط مدیر', journeyText: journey,
      githubUrl: 'https://github.com/hexora', instagramUrl: 'https://instagram.com/hexora',
      email: 'hello@example.test', phone: '12345'
    } } }));
    await page.route('**/api/skills/public', route => route.fulfill({ json: { data: [
      { name: 'Java', category: 'BACKEND', icon: 'fa-brands fa-java' },
      { name: 'JavaScript', category: 'FRONTEND', icon: 'fa-brands fa-js' }
    ] } }));
    const pages = [
      ['/services', 'خدمات', 'Services'], ['/projects', 'نمونه‌کارها', 'Projects'],
      ['/skills', 'مهارت‌ها', 'Skills'], ['/about', 'درباره من', 'About me'],
      ['/faq', 'سوالات متداول', 'Frequently asked questions'],
      ['/collaboration', 'فرایند همکاری', 'Collaboration process'],
      ['/testimonials', 'نظرات کارفرمایان', 'Testimonials'], ['/contact', 'گفت‌وگو', 'Conversation']
    ];
    for (const [path, fa, en] of pages) {
      await page.goto(base + path);
      const heading = page.locator('main h1:visible').first();
      await heading.filter({ hasText: fa }).waitFor();
      assert.equal((await heading.textContent()).trim(), fa, path);
      const sizes = await heading.evaluate(h => {
        const subtitle = h.parentElement.querySelector('.section-subtitle');
        return [parseFloat(getComputedStyle(h).fontSize), subtitle ? parseFloat(getComputedStyle(subtitle).fontSize) : 0];
      });
      assert(sizes[0] > sizes[1], path + ': name must dominate description');
      await page.locator('#langBtn').click();
      await heading.filter({ hasText: en }).waitFor();
      assert.equal((await heading.textContent()).trim(), en, path + ': English heading');
      await page.locator('#langBtn').click();
    }
    await page.goto(base + '/');
    assert.equal((await page.locator('#services .section-head h2').textContent()).trim(), 'خدمات');
    assert((await page.locator('#services .section-subtitle').textContent()).includes('از ایده'));
    await page.goto(base + '/about');
    await page.locator('.journey-path li').first().waitFor();
    assert.deepEqual(await page.locator('.journey-path li > span:last-child').allTextContents(), ['HTML', 'CSS', 'Java', 'Spring', 'React']);
    assert.equal(await page.locator('.journey-path').evaluate(e => e.tagName), 'OL');
    assert.equal(await page.locator('.bio-story .bio-summary').textContent(), 'توضیح اختصاصی');
    for (const selector of ['.contact-icon-link', '.orbit-skill', '.skill-name']) {
      const styles = await page.locator(selector).first().evaluate(e => {
        const s = getComputedStyle(e); return [s.borderTopWidth, s.backgroundColor, s.boxShadow];
      });
      assert.deepEqual(styles, ['0px', 'rgba(0, 0, 0, 0)', 'none'], selector);
    }
    assert.equal(await page.locator('.bio-identity a[href="mailto:hello@example.test"]').getAttribute('aria-label'), 'hello@example.test');
    await page.locator('#langBtn').click();
    assert.equal(await page.locator('.journey-path li').count(), 5);
    assert.equal(await page.locator('.bio-story .bio-summary').textContent(), 'توضیح اختصاصی');
    await page.setViewportSize({ width: 390, height: 900 });
    assert(await page.locator('.journey-path').evaluate(e => e.scrollWidth <= e.clientWidth));
    journey = '  ,،\n ';
    await page.goto(base + '/about');
    await page.locator('.bio-story').waitFor();
    assert.equal(await page.locator('.learning-journey').count(), 0);
    journey = '<script>alert(1)</script>,Java';
    await page.goto(base + '/about');
    await page.locator('.journey-path li').first().waitFor();
    assert.equal(await page.locator('.journey-path script').count(), 0);
    assert((await page.locator('.journey-path').textContent()).includes('<script>'));
    assert.deepEqual(errors, []);
    console.log('Public headings/biography passed: 8 FA/EN page titles, homepage hierarchy, bare accessible icons, separated ordered journey, mobile wrapping, empty and escaped content.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
