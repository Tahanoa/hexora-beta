// Run with ADMIN_USERNAME/ADMIN_PASSWORD and a disposable local app.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.HEXORA_TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HEXORA_CHROMIUM ? { executablePath: process.env.HEXORA_CHROMIUM } : {}) });
  try {
    const context = await browser.newContext();
    const login = await context.request.post(base + '/api/auth/login', { data: { usernameOrEmail: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD } });
    assert(login.ok(), 'admin test login failed');
    const token = (await login.json()).data.accessToken;
    const pages = ['/', '/projects', '/projects/loader-check', '/skills', '/about', '/services', '/services/loader-check', '/products', '/products/loader-check', '/contact', '/faq', '/collaboration', '/testimonials', '/terms', '/privacy', '/login', '/register', '/account', '/account/orders', '/account/products', '/account/orders/00000000-0000-0000-0000-000000000001', '/dashboard', '/profile', '/manage/profile', '/manage/projects', '/manage/skills', '/manage/services', '/manage/statistics', '/manage/experience', '/manage/testimonials', '/manage/payments', '/manage/products', '/manage/users', '/manage/media', '/manage/contact', '/manage/demos'];
    for (const path of pages) {
      const response = await context.request.get(base + path, { headers: { Authorization: 'Bearer ' + token } });
      assert(response.ok(), path + ': page did not render');
      assert.equal(new URL(response.url()).pathname, path, path + ': unexpected redirect');
      const html = await response.text();
      assert.equal((html.match(/id="loadingOverlay"/g) || []).length, 1, path + ': missing/duplicate overlay');
      assert.equal((html.match(/href="\/css\/loading.css"/g) || []).length, 1, path + ': missing/duplicate CSS');
      assert.equal((html.match(/src="\/js\/loading.js"/g) || []).length, 1, path + ': missing/duplicate runtime');
      assert(html.includes('cssload-cssload-spinner'), path + ': spinner missing');
    }
    await context.addInitScript(value => localStorage.setItem('accessToken', value), token);
    const page = await context.newPage();
    for (const path of ['/services', '/products', '/contact', '/account', '/dashboard', '/manage/demos', '/loader-missing-page']) {
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      await page.locator('#loadingOverlay').waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.querySelector('#loadingOverlay')?.classList.contains('is-hidden'));
      assert.equal(await page.locator('#loadingOverlay').evaluate(e => getComputedStyle(e).pointerEvents), 'none');
    }
    await page.goto(base + '/terms', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.releaseLoaderTest = window.holdPageLoader(); });
    await page.waitForTimeout(3200);
    assert(await page.locator('#loadingOverlay').isVisible(), 'pending work must keep loader visible');
    await page.evaluate(() => window.releaseLoaderTest());
    await page.locator('#loadingOverlay').waitFor({ state: 'hidden' });
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJS.newPage();
    await plain.goto(base + '/terms');
    assert.equal(await plain.locator('#loadingOverlay').evaluate(e => getComputedStyle(e).display), 'none');
    await noJS.close();
    console.log('Page loaders passed: 36 rendered routes, one shared overlay/CSS/runtime per page; public/account/admin/404 display and dismissal; pending-work release; no-JavaScript fallback.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
