/* Dedicated /skills presentation; the homepage marquee and API stay unchanged. */
(() => {
 'use strict';
 if(document.body.dataset.section!=='skills')return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const en=()=>document.documentElement.lang==='en';
 const t=(fa,english)=>en()?english:fa;
 const labels={FRONTEND:['فرانت‌اند','Frontend'],BACKEND:['بک‌اند','Backend'],DATABASE:['داده و دیتابیس','Data & databases'],DEVOPS:['زیرساخت و استقرار','DevOps'],TOOLS:['ابزارهای توسعه','Development tools'],OTHER:['سایر توانایی‌ها','Other capabilities']};
 const category=x=>Object.hasOwn(labels,x.category)?x.category:'OTHER';
 const label=key=>labels[key][en()?1:0];
 const level=x=>x.level==null||!Number.isFinite(Number(x.level))?null:Math.min(100,Math.max(0,Number(x.level)));
 const number=value=>Number(value).toLocaleString(en()?'en-US':'fa-IR');
 const icon=x=>/^fa-(solid|regular|brands)\s+fa-[a-z0-9-]+$/i.test(x.icon||'')?x.icon:'fa-solid fa-code';
 const iconMarkup=x=>window.HexoraIcons?.render(x.icon)||`<i class="${esc(icon(x))}" aria-hidden="true"></i>`;
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 18 6 6m0 10V6h10"/></svg>';
 const mark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/></svg>';
 let data=[],filter='ALL',query='',sort='category',root,dialog,lastTrigger=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.uxMotion==='off';
 function groups(){return Object.keys(labels).filter(key=>data.some(x=>category(x)===key));}
 function frame(){
  const keys=groups(),max=Math.max(1,...keys.map(key=>data.filter(x=>category(x)===key).length));
  return `<div class="ks-studio"><header class="ks-intro"><div class="ks-intro-copy"><span class="ks-overline">${mark}<span>${t('ابزارها، با یک نگاه شخصی','Tools, with a personal perspective')}</span></span><h1>${t('مهارت‌ها','Skills')}<span class="ks-title-dot" aria-hidden="true">.</span></h1><p class="ks-lead">${t('از رابطی که دیده می‌شود،<br>تا منطقی که پشت آن کار می‌کند.','From the interface you see,<br>to the logic behind it.')}</p><p class="ks-intro-note">${t('توانایی‌ها را بر اساس نقششان در ساخت یک محصول ببینید؛ هر ابزار، در جای درست خودش.','Explore capabilities by their role in building a product. Every tool has its place.')}</p><div class="ks-summary"><span><strong>${number(data.length)}</strong>${t('مهارت ثبت‌شده','listed skills')}</span><span><strong>${number(keys.length)}</strong>${t('حوزه تخصصی','specialist areas')}</span><a href="/contact">${t('درباره پروژه‌ات بگو','Tell me about your project')}${arrow}</a></div></div><div class="ks-atlas" aria-label="${t('توزیع مهارت‌ها بر اساس دسته‌بندی','Skills by category')}"><div class="ks-atlas-heading"><span class="ks-mono">CAPABILITY MAP</span><span>${t('یک نگاه به جعبه‌ابزار','A view of the toolkit')}</span></div>${keys.length?`<div class="ks-columns">${keys.map(key=>{const count=data.filter(x=>category(x)===key).length;return `<button type="button" class="ks-column" data-map-category="${key}" aria-pressed="${filter===key}" aria-label="${esc(label(key))}: ${number(count)}"><span class="ks-column-count">${number(count)}</span><span class="ks-column-track" aria-hidden="true"><i style="--fill:${count/max}"></i></span><span class="ks-column-name">${esc(label(key))}</span></button>`}).join('')}</div>`:`<p class="ks-map-empty">${t('این نقشه با ثبت مهارت‌ها شکل می‌گیرد.','This map takes shape as skills are added.')}</p>`}<div class="ks-atlas-foot"><span class="ks-map-dot" aria-hidden="true"></span>${t('هر ستون، تعداد مهارت‌های یک حوزه است.','Each column shows the number of skills in one area.')}</div></div></header><section class="ks-explorer" aria-labelledby="ksExplorerTitle"><div class="ks-explorer-heading"><div><span class="ks-mono">EXPLORE THE TOOLKIT / 01</span><h2 id="ksExplorerTitle">${t('ابزار مناسب را پیدا کن.','Find the right tool.')}</h2></div><p>${t('جست‌وجو، مقایسه و نگاهی نزدیک‌تر.','Search, compare and take a closer look.')}</p></div><div class="ks-toolbar"><label class="ks-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="ks-sr">${t('جست‌وجوی مهارت‌ها','Search skills')}</span><input id="ksSearch" type="search" maxlength="150" value="${esc(query)}" placeholder="${t('نام ابزار یا توضیح آن…','Tool name or description…')}" autocomplete="off"></label><label class="ks-sort"><span>${t('مرتب‌سازی','Sort by')}</span><select id="ksSort"><option value="category" ${sort==='category'?'selected':''}>${t('حوزه تخصصی','Category')}</option><option value="name" ${sort==='name'?'selected':''}>${t('نام مهارت','Skill name')}</option><option value="level" ${sort==='level'?'selected':''}>${t('سطح ثبت‌شده','Listed level')}</option></select></label></div><div class="ks-filters" role="group" aria-label="${t('فیلتر حوزه تخصصی','Filter by category')}"><button type="button" data-ks-filter="ALL" aria-pressed="${filter==='ALL'}">${t('همه توانایی‌ها','All capabilities')}<span>${number(data.length)}</span></button>${keys.map(key=>`<button type="button" data-ks-filter="${key}" aria-pressed="${filter===key}">${esc(label(key))}<span>${number(data.filter(x=>category(x)===key).length)}</span></button>`).join('')}</div><div class="ks-results-meta"><p id="ksResultCount" role="status" aria-live="polite" aria-atomic="true"></p><span>${t('سطح‌ها مطابق اطلاعات ثبت‌شده در پروفایل‌اند.','Levels reflect the information entered in the profile.')}</span></div><div class="ks-grid" id="ksGrid"></div></section><section class="ks-end"><div><span class="ks-mono">FROM TOOLKIT TO REAL WORK</span><h2>${t('ابزارها وقتی معنا دارند که چیزی بسازند.','Tools matter when they build something.')}</h2><p>${t('نتیجه کنار هم قرار گرفتن این توانایی‌ها را در نمونه‌کارها ببینید.','See how these capabilities come together in selected projects.')}</p></div><a class="ks-project-link" href="/projects">${t('دیدن نمونه‌کارها','Explore projects')}${arrow}</a></section><dialog class="ks-dialog" id="ksDialog" aria-labelledby="ksDialogTitle"><button class="ks-close" type="button" aria-label="${t('بستن جزئیات','Close details')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><div id="ksDialogContent"></div></dialog></div>`;
 }
 function selection(){
  const collator=new Intl.Collator(en()?'en':'fa',{numeric:true,sensitivity:'base'}),order=groups();
  return data.filter(x=>(filter==='ALL'||category(x)===filter)&&(!query||[x.name,x.description,label(category(x))].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()))).sort((a,b)=>sort==='level'?(level(b)??-1)-(level(a)??-1)||collator.compare(a.name,b.name):sort==='name'?collator.compare(a.name,b.name):order.indexOf(category(a))-order.indexOf(category(b))||collator.compare(a.name,b.name));
 }
 function cards(animate=false){
  const shown=selection(),grid=root.querySelector('#ksGrid');
  root.querySelector('#ksResultCount').textContent=t(`${number(shown.length)} مهارت از ${number(data.length)}`,`${number(shown.length)} of ${number(data.length)} skills`);
  grid.innerHTML=shown.length?shown.map(x=>{const value=level(x),index=data.indexOf(x);return `<article class="ks-card"><div class="ks-card-top">${iconMarkup(x)}<span>${esc(label(category(x)))}</span></div><h3 dir="auto">${esc(x.name)}</h3>${x.description?.trim()?`<p class="ks-card-description" dir="auto">${esc(x.description)}</p>`:'<div class="ks-card-spacer" aria-hidden="true"></div>'}<div class="ks-level"><span>${t('سطح ثبت‌شده','Listed level')}</span><strong>${value==null?t('ثبت نشده','Not listed'):number(value)+'%'}</strong></div>${value==null?'':`<div class="ks-meter" role="meter" aria-label="${esc(x.name)} — ${t('سطح ثبت‌شده','Listed level')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><i style="--level:${value/100}"></i></div>`}<button class="ks-detail" type="button" data-skill-index="${index}" aria-label="${esc(t('جزئیات مهارت '+x.name,'Details for '+x.name))}">${t('نگاه نزدیک‌تر','Take a closer look')}${arrow}</button></article>`}).join(''):`<div class="ks-empty">${mark}<h3>${data.length?t('مهارتی با این انتخاب پیدا نشد.','No skills match this selection.'):t('جعبه‌ابزار در حال تکمیل است.','The toolkit is taking shape.')}</h3><p>${data.length?t('عبارت دیگری را امتحان کنید یا فیلترها را کنار بگذارید.','Try another phrase or clear your filters.'):t('پس از ثبت مهارت‌ها، می‌توانید آن‌ها را اینجا کشف کنید.','Skills will appear here as they are added.')}</p>${data.length?`<button type="button" class="ks-reset">${t('نمایش همه مهارت‌ها','Show all skills')}</button>`:`<a href="/contact">${t('شروع گفت‌وگو','Start a conversation')}</a>`}</div>`;
  if(animate&&!reduced())grid.querySelectorAll('.ks-card').forEach((card,i)=>card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:360,delay:Math.min(i*35,175),easing:'cubic-bezier(.2,0,0,1)'}));
 }
 function choose(key){filter=key;root.querySelectorAll('[data-ks-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ksFilter===key)));root.querySelectorAll('[data-map-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapCategory===key)));cards(true);}
 function detail(index,button){
  const x=data[index];if(!x)return;const value=level(x);lastTrigger=button;
  root.querySelector('#ksDialogContent').innerHTML=`<span class="ks-dialog-icon">${iconMarkup(x)}</span><span class="ks-mono">TOOLKIT / ${String(index+1).padStart(2,'0')}</span><h2 id="ksDialogTitle" dir="auto">${esc(x.name)}</h2><p class="ks-dialog-category">${esc(label(category(x)))}</p><p class="ks-dialog-description" dir="auto">${esc(x.description||t('توضیح تکمیلی برای این مهارت ثبت نشده است.','No additional description is available for this skill.'))}</p><div class="ks-dialog-level"><span>${t('سطح ثبت‌شده','Listed level')}</span><strong>${value==null?t('ثبت نشده','Not listed'):number(value)+'%'}</strong></div><a href="/contact" class="ks-project-link">${t('گفت‌وگو درباره پروژه','Discuss a project')}${arrow}</a>`;
  dialog.showModal();
 }
 function mount(){
  root=document.getElementById('skillsList');if(!root)return;
  root.classList.remove('skills-atelier');root.classList.add('ks-root');root.innerHTML=frame();dialog=root.querySelector('#ksDialog');
  cards(true);
  root.addEventListener('click',click);
  root.addEventListener('input',input);
  root.addEventListener('change',change);
  dialog.querySelector('.ks-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 }
 function click(event){
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.ksFilter)choose(button.dataset.ksFilter);
  else if(button.dataset.mapCategory)choose(button.dataset.mapCategory);
  else if(button.dataset.skillIndex!==undefined)detail(Number(button.dataset.skillIndex),button);
  else if(button.classList.contains('ks-reset')){query='';root.querySelector('#ksSearch').value='';choose('ALL');root.querySelector('#ksSearch').focus();}
 }
 let searchTimer;
 function input(event){if(event.target.id==='ksSearch'){query=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>cards(false),90);}}
 function change(event){if(event.target.id==='ksSort'){sort=event.target.value;cards(true);}}
 new MutationObserver(()=>{
  if(!root?.isConnected)return;clearTimeout(searchTimer);
  if(dialog?.open)dialog.close();
  root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('change',change);
  mount();
 }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 window.HexoraSkills={render(items){data=items;queueMicrotask(mount);return '<div class="ks-initializing" role="status"></div>';}};
})();
