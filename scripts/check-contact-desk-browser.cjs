const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.HEXORA_TEST_BASE_URL||'http://127.0.0.1:8080';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HEXORA_CHROMIUM?{executablePath:process.env.HEXORA_CHROMIUM}:{})});
 try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let phone=null,failSend=false,messages=[],sentBody,phoneBody;
 const user=()=>({id:901,username:'contact-test',phone,roles:['USER']});
 await context.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname,method=route.request().method();const ok=data=>route.fulfill({json:{data}});
  if(path==='/api/profile/public')return ok({brandName:'Hexora',githubUrl:'https://github.com/example',email:'hello@example.com',phone:'+989123456789'});
  if(path==='/api/auth/me')return ok(user());
  if(path==='/api/auth/phone'){phoneBody=route.request().postDataJSON();phone=phoneBody.phone;return ok(user());}
  if(path==='/api/services/public/77')return ok({id:77,title:'طراحی وب‌سایت'});
  if(path==='/api/chat/messages'){
   if(method==='POST'){sentBody=route.request().postDataJSON();if(failSend)return route.fulfill({status:503,json:{message:'Please try again'}});messages.push({id:messages.length+1,text:sentBody.text,fromAdmin:false,createdAt:'2026-11-03T12:00:00Z'});return ok(messages.at(-1));}
   return ok(messages);
  }
  return ok([]);
 });
 async function layouts(){for(const language of ['fa','en']){await page.evaluate(lang=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';localStorage.setItem('hexora-lang',lang);},language);for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:960});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+language+' '+width);}}}
 await page.goto(base+'/contact');await page.locator('#chatGate a[href="/login"]').waitFor();assert(await page.locator('.chat-app').isHidden());assert.equal(await page.locator('#chatGate a[href="/register"]').count(),1);assert.equal(await page.locator('.contact-brief li').count(),3);await page.locator('#chatSocials a[href="mailto:hello@example.com"]').waitFor();await layouts();
 await page.locator('.contact-jump').click();assert.equal(new URL(page.url()).hash,'#contactDesk');assert(await page.locator('#contactDesk').evaluate(e=>e===document.activeElement));
 await page.evaluate(()=>{localStorage.setItem('accessToken','contact-browser-test');localStorage.setItem('user',JSON.stringify({id:901,username:'contact-test'}));});
 await page.goto(base+'/contact?service=77');await page.locator('.contact-empty').waitFor();assert(await page.locator('#chatText').isDisabled());assert(await page.locator('#chatPhoneSettings').evaluate(e=>e.open));assert.equal(await page.locator('.chat-service-request').count(),1);
 await page.locator('#chatPhone').fill('۰۹۱۲۳۴۵۶۷۸۹');await page.locator('#chatPhoneForm button').click();await page.locator('#chatText:not([disabled])').waitFor();assert.equal(phoneBody.phone,'09123456789');assert(!(await page.locator('#chatPhoneSettings').evaluate(e=>e.open)));
 await page.locator('[data-chat-starter="project"]').click();assert((await page.locator('#chatText').inputValue()).length>0);assert(await page.locator('#chatText').evaluate(e=>e===document.activeElement));
 await page.locator('#chatText').fill('پیام ناتمام من');await layouts();assert.equal(await page.locator('#chatText').inputValue(),'پیام ناتمام من');
 assert((await page.locator('#chatSend').boundingBox()).height>=44);assert.equal(await page.locator('.ux-draft-note,.ux-draft-clear').count(),0);
 failSend=true;await page.locator('#chatSend').click();await page.waitForFunction(()=>!document.getElementById('chatSend').disabled);assert.equal(await page.locator('#chatText').inputValue(),'پیام ناتمام من');
 failSend=false;await page.locator('#chatSend').click();await page.waitForFunction(()=>document.getElementById('chatText').value==='');assert.equal(sentBody.serviceId,77);assert.equal(await page.locator('.chat-service-request').count(),0);await page.locator('.chat-bubble.mine').waitFor();assert.equal(await page.locator('#chatCount').innerText(),'0 / 4000');
 // History remains readable and escaped, and long unbroken messages fit narrow screens.
 messages.push({id:2,fromAdmin:true,text:'<script>alert(1)</script> '+ 'longmessage'.repeat(80),createdAt:'2026-11-03T12:02:00Z'});await page.reload();await page.locator('.chat-bubble:not(.mine)').waitFor();assert.equal(await page.locator('#chatMessages script').count(),0);await page.setViewportSize({width:320,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert(await page.locator('#chatMessages').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.chat-bubble').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.deepEqual(errors,[]);console.log('PASS: guest and signed-in layouts in FA/EN at five widths, real profile links, keyboard jump, phone gating/save, starters, service context, failure retention/success, mobile controls, history escaping and reduced motion; no screenshots generated.');
 await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
