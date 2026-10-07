const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('src/main/resources/static/js/i18n.js','utf8');
function context(lang){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}});return elements.get(id)};
 const document={documentElement:{lang,dir:lang==='en'?'ltr':'rtl'},querySelector:q=>element(q),getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){}};
 const ctx={document,window:{},localStorage:{getItem:()=>lang},MutationObserver:class{observe(){}},URL,location:{origin:'https://example.test'},fetch:async()=>({ok:true,json:async()=>({data:[]})})};
 vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,element};
}
for(const lang of ['fa','en']){
 const {ctx}=context(lang),i18n=ctx.window.HexoraI18n;
 assert.equal(i18n.tr('نام کامل'),lang==='en'?'Full name':'نام کامل');
 assert.equal(i18n.tr('PLANNING'),lang==='en'?'Planning':'برنامه‌ریزی');
 assert.equal(i18n.tr('Invalid credentials'),lang==='en'?'Invalid credentials':'اطلاعات ورود اشتباه است');
 assert.equal(i18n.tr('متن اختصاصی کارفرما'),'متن اختصاصی کارفرما');
 assert(!i18n.markup('<script>alert(1)</script>').includes('<script>'));
 ctx.document.documentElement.lang=lang==='en'?'fa':'en';assert.equal(i18n.tr('نام کامل'),lang==='en'?'نام کامل':'Full name');
}
const original=fs.readFileSync('src/main/resources/static/js/manage.js','utf8');
// Exercise the production renderers without mounting network/event handlers.
const renderer=original.replace("  $('#editorForm').addEventListener('submit', save);","  window.testRenderers={fieldHtml,renderRows,meta};return;\n  $('#editorForm').addEventListener('submit', save);");
for(const section of ['projects','skills','services','statistics','experience','media','testimonials','contact','profile'])for(const lang of ['en','fa']){
 const {ctx,element}=context(lang);ctx.window.HEXORA_SECTION=section;vm.runInContext(renderer,ctx);
 const {fieldHtml,renderRows,meta}=ctx.window.testRenderers;
 const html=meta.fields.map(field=>fieldHtml(field)).join('');
 if(lang==='en')assert(!/[\u0600-\u06ff]/.test(html),`${section}: untranslated form in English`);
 renderRows([]);assert(element('#rows').innerHTML.includes(lang==='en'?'No items yet':'موردی ثبت نشده است'));
 if(section==='skills'){assert(html.includes('value="FRONTEND"'));assert(html.includes(lang==='en'?'>Frontend<':'>فرانت‌اند<'));}
 if(section==='projects'){
  renderRows([{id:1,title:'متن اختصاصی کارفرما',status:'PLANNING'}]);
  assert(element('#rows').innerHTML.includes('متن اختصاصی کارفرما'));assert(element('#rows').innerHTML.includes(lang==='en'?'Planning':'برنامه‌ریزی'));
 }
}
console.log('FA/EN: all 9 management form/table renderers, enum values, errors, switching and user content preservation passed.');
(async()=>{
 for(const lang of ['fa','en']){
  const {ctx,element}=context(lang),callbacks=[];
  ctx.document.getElementById=id=>element(id);ctx.location.hash='';
  ctx.MutationObserver=class{constructor(callback){callbacks.push(callback)}observe(){}};
  const payloads={
   '/api/profile/public':{fullName:'نام اختصاصی',brandName:'Hexora',title:'عنوان اختصاصی',workingStatus:'AVAILABLE',aboutText:'محتوای نوشته‌شده توسط مدیر',journeyText:'مسیر اختصاصی'},
   '/api/experience/public':[{position:'سمت اختصاصی',company:'شرکت اختصاصی',startDate:'2024-01-01',isCurrent:true}],
   '/api/skills/public':[{name:'مهارت اختصاصی',category:'BACKEND',icon:'fa-solid fa-code'}],
   '/api/statistics/public':[], '/api/services/public':[], '/api/projects/public':[]
  };
  ctx.fetch=async path=>({ok:true,json:async()=>({data:payloads[path]})});
  await vm.runInContext(fs.readFileSync('src/main/resources/static/js/biography.js','utf8'),ctx);
  assert(element('profileArea').innerHTML.includes('محتوای نوشته‌شده توسط مدیر'));
  assert(element('profileArea').innerHTML.includes(lang==='en'?'>My professional story<':'>داستان حرفه‌ای من<'));
  assert(element('detailArea').innerHTML.includes(lang==='en'?'Present':'اکنون'));
  assert(element('detailArea').innerHTML.includes(lang==='en'?'January':'دی'));
  assert(element('skillGroups').innerHTML.includes(lang==='en'?'>Backend<':'>بک‌اند<'));
  ctx.document.documentElement.lang=lang==='en'?'fa':'en';callbacks.forEach(fn=>fn());
  assert(element('skillGroups').innerHTML.includes(lang==='en'?'>بک‌اند<':'>Backend<'));
  assert(element('profileArea').innerHTML.includes('محتوای نوشته‌شده توسط مدیر'));
 }
 console.log('Biography: fetched content, category labels, date locale and live FA/EN switching passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
