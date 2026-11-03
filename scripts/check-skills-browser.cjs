const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.HEXORA_TEST_BASE_URL||'http://127.0.0.1:8080';
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.HEXORA_CHROMIUM?{executablePath:process.env.HEXORA_CHROMIUM}:{})});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const data=['FRONTEND','BACKEND','DATABASE','DEVOPS','TOOLS','OTHER'].flatMap((category,i)=>[0,1].map((n)=>({id:i*2+n,name:[['React','TypeScript'],['Java','Spring Boot'],['PostgreSQL','Redis'],['Docker','Linux'],['Git','Figma'],['Accessibility','Testing']][i][n],category,level:n?null:85,icon:'fa-solid fa-code',description:'طراحی و توسعهٔ محصولات دیجیتال با تمرکز بر کیفیت و تجربهٔ کاربری.'})));
await page.route('**/api/skills/public',r=>r.fulfill({json:{data}}));
await page.goto(base+'/skills');await page.locator('.ks-card').first().waitFor();await page.waitForTimeout(700);
assert.equal(await page.locator('.ks-card').count(),12);
for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:960});await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);if(process.env.HEXORA_SCREENSHOT_DIR&&(width===390||width===1440))await page.screenshot({path:`${process.env.HEXORA_SCREENSHOT_DIR}/skills-preview-${width}.png`,fullPage:true});}
await page.locator('[data-ks-filter="BACKEND"]').click();assert.equal(await page.locator('.ks-card').count(),2);
await page.locator('.ks-detail').first().click();assert(await page.locator('#ksDialog').evaluate(d=>d.open));await page.keyboard.press('Escape');assert(await page.locator('.ks-detail').first().evaluate(d=>d===document.activeElement));
await page.locator('#ksSearch').fill('no-such-skill');await page.waitForTimeout(150);assert.equal(await page.locator('.ks-card').count(),0);await page.locator('.ks-reset').click();assert.equal(await page.locator('.ks-card').count(),12);
await page.locator('#ksSort').selectOption('level');assert.equal(await page.locator('.ks-card .ks-level strong').first().innerText(),'۸۵%');
await page.locator('#langBtn').click();await page.waitForTimeout(250);assert.equal(await page.locator('.ks-intro h1').innerText(),'Skills.');assert.equal(await page.locator('#ksSort').inputValue(),'level');
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-ks-filter="BACKEND"]').click();assert.equal(await page.locator('.ks-card').evaluateAll(nodes=>nodes.flatMap(n=>n.getAnimations()).length),0);
await page.route('**/api/skills/public',r=>r.fulfill({json:{data:[]}}));await page.reload();await page.locator('.ks-empty').waitFor();assert.equal(await page.locator('.ks-card').count(),0);
await page.goto(base+'/');assert.equal(await page.locator('.ks-studio').count(),0);assert.deepEqual(errors,[]);console.log('PASS: responsive layouts, filtering, search/reset, sorting, dialog focus, locale, reduced motion, empty state and homepage isolation');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
