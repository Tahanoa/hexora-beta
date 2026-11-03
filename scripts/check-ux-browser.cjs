const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.HEXORA_TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
 const browser = await chromium.launch({headless:true,...(process.env.HEXORA_CHROMIUM?{executablePath:process.env.HEXORA_CHROMIUM}:{})});
 try {
  const context = await browser.newContext();
  const page = await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let owner=1,serviceDelay=true,catalogFail=true,ordersFail=true,chatFail=true,reviewFail=true,review=null;
  const messages=[];const empty={content:[],totalElements:0,totalPages:0,last:true};
  const profile={brandName:'Hexora',fullName:'Test',shortDescription:'Test profile',workingStatus:'AVAILABLE'};
  const account=()=>({id:owner,username:'user'+owner,phone:'09123456789',roles:['USER']});
  await context.addInitScript(()=>{if(!sessionStorage.getItem('ux-test-initialized')){sessionStorage.setItem('ux-test-initialized','true');localStorage.setItem('accessToken','browser-test');localStorage.setItem('user',JSON.stringify({id:1,username:'user1'}));}});
  await context.route('**/api/**',async route=>{
   const u=new URL(route.request().url()),path=u.pathname,method=route.request().method();
   const ok=data=>route.fulfill({json:{success:true,data}});const fail=()=>route.fulfill({status:503,json:{success:false,message:'Temporarily unavailable'}});
   if(path==='/api/profile/public')return ok(profile);
   if(path==='/api/auth/me')return ok(account());
   if(path==='/api/auth/logout')return ok(null);
   if(path==='/api/services/public'){if(serviceDelay){await new Promise(r=>setTimeout(r,1400));serviceDelay=false;}return ok([]);}
   if(path==='/api/services/public/77')return ok({id:77,title:'Test service',published:true});
   if(path==='/api/products/public')return catalogFail?fail():ok(empty);
   if(path==='/api/products/orders')return ordersFail?fail():ok(empty);
   if(path==='/api/products/mine')return ok(empty);
   if(path==='/api/chat/messages'){
    if(method==='POST'){if(chatFail)return fail();const body=route.request().postDataJSON();messages.push({id:messages.length+1,text:body.text,fromAdmin:false,createdAt:new Date().toISOString()});return ok(messages.at(-1));}
    return ok(messages);
   }
   if(path==='/api/products/public/ux-demo')return ok({id:11,slug:'ux-demo',title:'محصول آزمایشی',titleEn:'Test product',description:'Description',price:0,releases:[],features:'Feature one',requirements:'',demoUrl:null});
   if(path==='/api/products/public/ux-demo/reviews')return ok({average:0,count:review?1:0,reviews:empty});
   if(path==='/api/products/11/review'){
    if(method==='POST'){if(reviewFail)return fail();review=route.request().postDataJSON();return ok(review);}
    return ok({eligible:!review,review});
   }
   return ok([]);
  });
  // A slow data section must not block the shell; skeletons explain the wait.
  await page.goto(base+'/services',{waitUntil:'domcontentloaded'});
  await page.locator('#serviceList .ux-skeleton').first().waitFor();
  await page.locator('#loadingOverlay').waitFor({state:'hidden',timeout:1200});
  assert.equal(await page.locator('#serviceList').getAttribute('aria-busy'),'true');
  await page.locator('#serviceList .ux-state a[href="/contact"]').waitFor();
  await page.goto(base+'/products');
  await page.locator('#pdContent .ux-state-error [data-ux-retry]').waitFor();
  catalogFail=false;await page.locator('#pdContent [data-ux-retry]').click();
  await page.locator('#pdContent .ux-state a[href="/projects"]').waitFor();
  assert.equal(await page.locator('#pdContent').getAttribute('aria-busy'),'false');
  await page.goto(base+'/account/orders');
  await page.locator('#uaContent [data-ux-retry]').waitFor();ordersFail=false;
  await page.locator('#uaContent [data-ux-retry]').click();
  await page.locator('#uaContent .ux-state a[href="/products"]').waitFor();
  // A failed send retains the draft; navigation restores it; confirmed send clears it.
  await page.goto(base+'/contact?service=77');
  await page.locator('#chatText:not([disabled])').waitFor();
  await page.locator('#chatText').fill('پیش‌نویس درخواست همکاری');
  await page.locator('#chatSend').click();
  await page.waitForFunction(()=>!document.getElementById('chatSend').disabled);
  assert.equal(await page.locator('#chatText').inputValue(),'پیش‌نویس درخواست همکاری');
  await page.goto(base+'/terms');await page.goto(base+'/contact');
  await page.waitForFunction(()=>document.getElementById('chatText').value==='پیش‌نویس درخواست همکاری');
  chatFail=false;await page.locator('#chatSend').click();
  await page.waitForFunction(()=>document.getElementById('chatText').value==='');
  await page.reload();await page.locator('#chatText:not([disabled])').waitFor();
  assert.equal(await page.locator('#chatText').inputValue(),'');
  await page.locator('#chatText').fill('Only user one');
  owner=2;await page.evaluate(()=>localStorage.setItem('user',JSON.stringify({id:2,username:'user2'})));
  await page.reload();await page.locator('#chatText:not([disabled])').waitFor();
  assert.equal(await page.locator('#chatText').inputValue(),'');
  owner=1;await page.evaluate(()=>localStorage.setItem('user',JSON.stringify({id:1,username:'user1'})));
  await page.reload();await page.waitForFunction(()=>document.getElementById('chatText').value==='Only user one');
  await page.locator('.ux-draft-clear').click();assert.equal(await page.locator('#chatText').inputValue(),'');
  // Review form fields survive page changes; only successful submission removes them.
  await page.goto(base+'/products/ux-demo');await page.locator('[data-tab="reviews"]').click();
  await page.locator('#pdReviewForm textarea').fill('نظر ناتمام درباره محصول');
  await page.locator('#pdReviewForm label[data-star-value="5"]').click();
  await page.goto(base+'/terms');await page.goto(base+'/products/ux-demo');
  await page.locator('[data-tab="reviews"]').click();
  assert.equal(await page.locator('#pdReviewForm textarea').inputValue(),'نظر ناتمام درباره محصول');
  assert(await page.locator('#pdReviewForm input[value="5"]').isChecked());
  await page.locator('#pdReviewForm button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#pdReviewForm button')?.disabled);
  assert.equal(await page.locator('#pdReviewForm textarea').inputValue(),'نظر ناتمام درباره محصول');
  reviewFail=false;await page.locator('#pdReviewForm button[type="submit"]').click();
  await page.locator('.pd-review-note').waitFor();
  assert.equal(await page.evaluate(()=>HexoraUX.drafts.read('review:ux-demo')),null);
  // Existing tab handlers and the shared keyboard helper must not double-advance.
  await page.locator('[data-tab="overview"]').focus();await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('[data-tab="features"]').getAttribute('aria-selected'),'true');
  await page.goto(base+'/terms');await page.keyboard.press('Tab');
  assert.equal(await page.locator('.ux-skip').evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Enter');assert.equal(await page.locator('main').evaluate(e=>e===document.activeElement),true);
  await page.locator('.ux-motion-toggle').click();assert.equal(await page.locator('html').getAttribute('data-ux-motion'),'off');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-ux-motion'),'off');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('html').getAttribute('data-ux-motion'),'off');
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/contact');await page.locator('#chatText:not([disabled])').waitFor();
  assert((await page.locator('#chatSend').boundingBox()).height>=44);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#chatText').fill('Clear this on logout');
  await page.evaluate(()=>window.logoutSession());
  assert.equal(await page.evaluate(()=>Object.keys(sessionStorage).filter(k=>k.startsWith('hexora-draft-v1:')).length),0);
  await page.goto(base+'/login');await page.locator('input[type="password"]').fill('not-a-draft');
  assert(!(await page.evaluate(()=>JSON.stringify(sessionStorage))).includes('not-a-draft'));
  assert.deepEqual(errors,[]);
  console.log('UX passed: nonblocking skeletons, actionable empty/error + retry, account recovery, per-user draft restore/failure/success/logout, review text/rating, skip link, keyboard tabs, reduced motion persistence and mobile targets.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
