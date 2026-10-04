// Headless UI and browser-origin isolation checks against a disposable app.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.HEXORA_TEST_BASE_URL||'http://127.0.0.1:8080';
const suffix=Date.now().toString(36),slug='browser-demo-'+suffix;
(async()=>{
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 let demoId,projectId,token;const failures=[];page.on('pageerror',e=>failures.push(e.message));
 const api=async(method,path,data)=>{const response=await context.request.fetch(base+path,{method,headers:token?{Authorization:'Bearer '+token}:{},data});assert(response.ok(),method+' '+path+' '+response.status()+' '+await response.text());const raw=await response.text();return raw?JSON.parse(raw).data:null;};
 try{
  token=(await api('POST','/api/auth/login',{usernameOrEmail:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})).accessToken;
  projectId=(await api('POST','/api/projects',{title:'Browser demo project '+suffix,slug:'browser-project-'+suffix,status:'COMPLETED'})).id;
  await page.goto(base+'/login');await page.evaluate(token=>localStorage.setItem('accessToken',token),token);await page.goto(base+'/manage/demos');
  await page.locator('#dmCreate').click();await page.locator('#dmEditForm [name=title]').fill('Browser demo '+suffix);await page.locator('#dmEditForm [name=slug]').fill(slug);
  await page.waitForFunction(()=>!document.querySelector('#dmProject').disabled);await page.locator('#dmProject').selectOption(String(projectId));await page.locator('#dmEditForm button[type=submit]').click();
  await page.waitForFunction(()=>!document.querySelector('#dmEditDialog').open);await page.locator('.dm-card').filter({hasText:'Browser demo '+suffix}).waitFor();
  demoId=(await api('GET','/api/demos')).find(x=>x.slug===slug).id;
  const card=page.locator('.dm-card').filter({hasText:'Browser demo '+suffix});await card.locator('[data-upload]').click();
  const html=`<!doctype html><html><body><h1>Demo isolation check</h1><output id="probe"></output><script>
   const result={scripts:true};
   try{localStorage.setItem('demo-write','unsafe');result.storage='allowed';}catch{result.storage='blocked';}
   try{result.parent=parent.document.querySelector('#dmStatus')?'allowed':'self';}catch{result.parent='blocked';}
   try{sessionStorage.getItem('test');result.session='allowed';}catch{result.session='blocked';}
   document.getElementById('probe').textContent=JSON.stringify(result);
  </script></body></html>`;
  await page.locator('#dmUploadForm input[type=file]').setInputFiles({name:'demo.html',mimeType:'text/html',buffer:Buffer.from(html)});
  await page.locator('#dmUploadForm button[type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#dmUploadDialog').open);
  assert.equal((await context.request.get(base+'/demo-sites/'+slug+'/')).status(),404);
  await card.locator('[data-preview]').click();const frame=page.frameLocator('#dmPreviewFrame');await frame.locator('#probe').waitFor();
  let probe=JSON.parse(await frame.locator('#probe').textContent());assert.deepEqual(probe,{scripts:true,storage:'blocked',parent:'blocked',session:'blocked'});
  await page.locator('[data-width="390"]').click();assert.equal(await page.locator('#dmPreviewFrame').evaluate(e=>e.clientWidth),390);
  await page.locator('[data-width="768"]').click();assert.equal(await page.locator('#dmPreviewFrame').evaluate(e=>e.clientWidth),768);
  assert.equal(await page.evaluate(()=>localStorage.getItem('accessToken')),token);
  page.once('dialog',dialog=>dialog.accept());await page.locator('#dmPreviewPublish').click();await page.waitForFunction(()=>!document.querySelector('#dmPreviewDialog').open);
  const linked=await api('GET','/api/projects/'+projectId);assert.equal(linked.demoUrl,'/demo-sites/'+slug+'/');
  // Exercise a ZIP with relative styles, ES modules and nested imports.
  const fixture=JSON.stringify({'dist/index.html':'<html><head><link rel="stylesheet" href="assets/app.css"></head><body><h1>ZIP module demo</h1><script type="module" src="assets/app.mjs"></script></body></html>','dist/assets/app.css':'h1{color:rgb(20, 150, 90)}','dist/assets/app.mjs':'import {mark} from "./part.mjs"; mark();','dist/assets/part.mjs':'export function mark(){document.body.dataset.module="ready";}'});
  const zip=require('node:child_process').execFileSync('python3',['-c','import sys,json,io,zipfile; files=json.load(sys.stdin); out=io.BytesIO(); z=zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED); [z.writestr(k,v) for k,v in files.items()]; z.close(); sys.stdout.buffer.write(out.getvalue())'],{input:fixture});
  await card.locator('[data-upload]').click();await page.locator('#dmUploadForm input[type=file]').setInputFiles({name:'module-demo.zip',mimeType:'application/zip',buffer:zip});await page.locator('#dmUploadForm button[type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#dmUploadDialog').open);
  const sites=await api('GET','/api/demos'),newVersion=sites.find(x=>x.id===demoId).versions[0].id;
  await card.locator(`[data-preview="${newVersion}"]`).click();await frame.locator('body[data-module="ready"]').waitFor();assert.equal(await frame.locator('h1').evaluate(e=>getComputedStyle(e).color),'rgb(20, 150, 90)');await page.locator('#dmPreviewDialog [data-close]').click();
  const publicPage=await context.newPage();await publicPage.goto(base+'/demo-sites/'+slug+'/');await publicPage.locator('#probe').waitFor();probe=JSON.parse(await publicPage.locator('#probe').textContent());assert.equal(probe.storage,'blocked');assert.equal(probe.session,'blocked');await publicPage.close();
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await card.locator('[data-preview]').last().click();await frame.locator('#probe').waitFor();await page.locator('#dmPreviewDialog [data-close]').click();
  page.once('dialog',dialog=>dialog.accept());await card.locator('[data-deactivate]').click();await page.waitForFunction(()=>!document.querySelector('[data-deactivate]'));
  assert.equal((await context.request.get(base+'/demo-sites/'+slug+'/')).status(),404);
  assert.deepEqual(failures,[]);
  console.log('Demo browser checks passed: admin create/upload/preview/publish/disable, responsive layout, scripts run while panel DOM and storage are blocked.');
 }finally{
  if(demoId)await api('DELETE','/api/demos/'+demoId);
  if(projectId)await api('DELETE','/api/projects/'+projectId);
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
