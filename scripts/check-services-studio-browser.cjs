const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.HEXORA_TEST_BASE_URL||'http://127.0.0.1:8080';
const fixtures=[
 {id:801,slug:'web-design',title:'طراحی و توسعه وب‌سایت',shortDescription:'یک وب‌سایت منسجم، سریع و متناسب با نیاز کسب‌وکار شما؛ از طراحی رابط تا پیاده‌سازی.',audience:'برای کسب‌وکارهایی که به حضوری حرفه‌ای در وب نیاز دارند.',deliverables:['طراحی رابط کاربری','نسخه سازگار با موبایل','پیاده‌سازی صفحات','آماده‌سازی برای انتشار','راهنمای استفاده'],featured:true,duration:'۳ تا ۵ هفته',pricingMode:'FROM',priceLabel:'۱۵ میلیون تومان'},
 {id:802,slug:'backend',title:'توسعه بک‌اند و API',shortDescription:'منطق پشت محصول، با تمرکز بر ساختار روشن و ارتباط قابل اعتماد بین بخش‌ها.',audience:'برای محصولاتی که فراتر از یک صفحه وب هستند.',deliverables:'احراز هویت، طراحی دیتابیس، مستندات API',duration:'متناسب با محدوده پروژه',pricingMode:'QUOTE'},
 {id:803,slug:'improve',title:'بازطراحی تجربه کاربری',shortDescription:'بازنگری در مسیرهای کاربر و جزئیات رابط؛ برای تجربه‌ای ساده‌تر و یکپارچه‌تر.',deliverables:'["بررسی رابط فعلی","طراحی مسیرهای کاربر","پروتوتایپ تعاملی"]',pricingMode:'RANGE',priceLabel:'۸ تا ۱۲ میلیون تومان'}
];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HEXORA_CHROMIUM?{executablePath:process.env.HEXORA_CHROMIUM}:{})});
 try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let mode='normal',calls=0;
 await page.route('**/api/services/public',async r=>{calls++;if(mode==='error')return r.fulfill({status:503,json:{message:'Unavailable'}});return r.fulfill({json:{data:mode==='empty'?[]:mode==='unsafe'?[{...fixtures[0],title:'<img src=x onerror=alert(1)>',shortDescription:'<script>window.injected=1</script>',cover:'javascript:alert(1)',deliverables:['<svg onload=alert(1)>']}]:fixtures}});});
 await page.route('**/api/services/public/slug/web-design',r=>r.fulfill({json:{data:{...fixtures[0],description:'جزئیات کامل خدمت',relatedProjectIds:[]}}}));
 await page.goto(base+'/services');await page.locator('.sv-service').first().waitFor();assert.equal(await page.locator('.sv-service').count(),3);assert.equal(await page.locator('#serviceList').getAttribute('aria-busy'),'false');
 assert.equal(await page.locator('.sv-service').first().locator('.sv-outputs li').count(),4);assert.equal(await page.locator('.sv-more').first().getAttribute('href'),'/services/web-design');assert.equal(await page.locator('.sv-request').first().getAttribute('href'),'/contact?service=801');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:960});
 for(const stage of [0,1,2]){await page.locator(`[data-build-select="${stage}"]`).evaluate(e=>e.click());assert(await page.evaluate(()=>{const box=document.querySelector('.sv-build').getBoundingClientRect();return [...document.querySelectorAll('.sv-build-face')].every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom;});}),'3D model cropped at '+width+' stage '+stage);}
 await page.waitForTimeout(50);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow at '+width);if(process.env.HEXORA_SCREENSHOT_DIR&&(width===390||width===1440))await page.screenshot({path:`${process.env.HEXORA_SCREENSHOT_DIR}/services-preview-${width}.png`,fullPage:true});}
 await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.locator('.sv-build-layer').count(),3);assert.equal(await page.locator('.sv-hero-art img').count(),0);await page.locator('[data-build-select="2"]').click();assert.equal(await page.locator('.sv-build').getAttribute('data-build-stage'),'2');assert.equal(await page.locator('.sv-build-controls [aria-pressed="true"]').count(),1);assert.match(await page.locator('#svBuildNote').innerText(),/محصول/);
 await page.locator('[data-service-filter="featured"]').click();assert.equal(await page.locator('.sv-service').count(),1);
 await page.locator('#serviceSearch').fill('یافت‌نمی‌شود');await page.locator('#clearServiceSearch').click();assert.equal(await page.locator('.sv-service').count(),3);assert(await page.locator('#serviceSearch').evaluate(e=>e===document.activeElement));
 await page.locator('#serviceSearch').fill('دیتابیس');assert.equal(await page.locator('.sv-service').count(),1);assert.match(await page.locator('.sv-service h3').innerText(),/API/);
 await page.locator('#langBtn').click();await page.waitForTimeout(200);assert.equal(await page.locator('#svTitle').innerText(),'Services');assert.equal(await page.locator('#serviceSearch').inputValue(),'دیتابیس');assert.equal(await page.locator('.sv-service').count(),1);assert.match(await page.locator('#svBuildNote').innerText(),/usable product/);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:960});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'English overflow '+width);}
 await page.locator('#serviceSearch').fill('');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.sv-build-layer').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await page.locator('[data-service-filter="featured"]').click();assert.equal(await page.locator('.sv-service').evaluateAll(ns=>ns.flatMap(n=>n.getAnimations()).length),0);
 mode='unsafe';await page.reload();await page.locator('.sv-service').waitFor();assert.equal(await page.locator('.sv-service img,.sv-service script,.sv-service svg[onload]').count(),0);assert.match(await page.locator('.sv-service h3').innerText(),/<img/);
 mode='empty';await page.reload();await page.locator('#serviceList .ux-state a[href="/contact"]').waitFor();assert.equal(await page.locator('.sv-service').count(),0);
 mode='error';await page.reload();await page.locator('#serviceRetry').waitFor();const previous=calls;mode='normal';await page.locator('#serviceRetry').click();await page.locator('.sv-service').first().waitFor();assert.equal(calls,previous+1);
 await page.goto(base+'/services/web-design');await page.locator('.hx-svc-detail-header h1').waitFor();assert.equal(await page.locator('.sv-service').count(),0);assert.equal(await page.locator('.hx-svc-summary a[href="/contact?service=801"]').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: five viewport widths, interactive physical 3D layers, actual deliverables/prices/links, search/filter/reset, locale retention, reduced motion, escaping, empty/error/retry and existing detail-page integration.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
