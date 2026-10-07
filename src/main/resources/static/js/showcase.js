(async()=>{
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=v=>{if(!v)return '';try{const u=new URL(v,location.origin);return ['https:','http:'].includes(u.protocol)?esc(u.href):''}catch{return ''}};
let en=localStorage.getItem('hexora-lang')==='en';
const text=(fa,english)=>`data-fa="${esc(fa)}" data-en="${esc(english)}"`;
function language(){document.documentElement.lang=en?'en':'fa';document.documentElement.dir=en?'ltr':'rtl';$('langBtn').textContent=en?'FA':'EN';document.querySelectorAll('[data-fa]').forEach(el=>{const value=en?el.dataset.en:el.dataset.fa;el.innerHTML=value.split(/<br\s*\/?>/i).map(esc).join('<br>')})}
$('year').textContent=new Date().getFullYear();$('langBtn').onclick=()=>{en=!en;localStorage.setItem('hexora-showcase-language',en?'en':'fa');language()};language();
const area=$('projectDetail');if(area){const release=window.holdPageLoader?.()||(()=>{});try{
 const slug=document.body.dataset.projectSlug;let response=await fetch('/api/projects/public/'+encodeURIComponent(slug));if(response.status===404&&/^\d+$/.test(slug))response=await fetch('/api/projects/public/by-id/'+slug);if(!response.ok)throw new Error(String(response.status));const json=await response.json(),p=json.data??json;if(!p||!p.title)throw new Error('404');
 document.title=p.title+' | Hexora';
 const states={COMPLETED:['تکمیل‌شده','Completed'],IN_PROGRESS:['در حال اجرا','In progress'],PLANNING:['در مرحله برنامه‌ریزی','Planning']},state=states[p.status]||[p.status||'—',p.status||'—'];
 const date=p.projectDate?new Date(p.projectDate):null;const dateText=date&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat(en?'en':'fa',{year:'numeric',month:'long'}).format(date):null;
 const has=v=>typeof v==='string'&&v.trim().length>0;
 const image=safe(p.image),demo=safe(p.demoUrl),github=safe(p.githubUrl);
 area.innerHTML=`<section class="project-cover ${image?'':'without-image'}"><div class="project-summary"><span class="project-eyebrow" ${text('طراحی · توسعه · تجربه','Design · Development · Experience')}>طراحی · توسعه · تجربه</span>${p.status?`<span class="project-status"><i aria-hidden="true"></i><span ${text(...state)}>${esc(state[0])}</span></span>`:''}<h1>${esc(p.title)}</h1>${has(p.shortDescription)?`<p class="project-intro">${esc(p.shortDescription)}</p>`:''}${demo||github?`<div class="project-actions">${demo?`<a class="project-launch" href="${demo}" target="_blank" rel="noopener noreferrer"><span ${text('مشاهده زنده پروژه','Explore live project')}>مشاهده زنده پروژه</span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`:''}${github?`<a class="project-source" href="${github}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i><span ${text('کد پروژه','Source code')}>کد پروژه</span></a>`:''}</div>`:''}${has(p.clientName)||dateText?`<dl class="project-facts">${has(p.clientName)?`<div><dt ${text('کارفرما','Client')}>کارفرما</dt><dd>${esc(p.clientName)}</dd></div>`:''}${dateText?`<div><dt ${text('تاریخ پروژه','Project date')}>تاریخ پروژه</dt><dd id="projectDate">${esc(dateText)}</dd></div>`:''}</dl>`:''}</div>${image?`<figure class="project-preview"><div class="preview-chrome" aria-hidden="true"><span></span><span></span><span></span></div><img src="${image}" alt="${esc(p.title)}"><figcaption ${text('نگاهی به محصول','A look at the product')}>نگاهی به محصول</figcaption></figure>`:''}</section>${has(p.description)?`<section class="project-narrative"><div><small>THE STORY</small><h2 ${text('از ایده،<br>تا نتیجه.','From idea,<br>to outcome.')}>از ایده،<br>تا نتیجه.</h2></div><p class="project-description">${esc(p.description)}</p></section>`:''}`;

 const toggle=$('langBtn').onclick;$('langBtn').onclick=()=>{toggle();if(dateText)$('projectDate').textContent=new Intl.DateTimeFormat(en?'en':'fa',{year:'numeric',month:'long'}).format(date)};language();
 }catch(error){area.innerHTML=`<section class="detail-empty"><h1 ${text(error.message==='404'?'پروژه پیدا نشد.':'دریافت پروژه ناموفق بود.',error.message==='404'?'Project not found.':'Unable to load project.')}></h1><p ${text('به فهرست نمونه‌کارها برگردید یا دوباره تلاش کنید.','Return to the project list or try again.')}></p><div class="showcase-links"><a class="primary" href="/projects" ${text('همه نمونه‌کارها','All projects')}></a><button id="retryProject" ${text('تلاش مجدد','Try again')}></button></div></section>`;$('retryProject').onclick=()=>location.reload();language()}finally{release()}}
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.process-step').forEach(el=>{el.classList.add('pending');observer.observe(el)})}
})();

// Keep native details semantics while animating both directions, including rapid toggles.
document.querySelectorAll('.faq-item').forEach(item=>{
 const summary=item.querySelector('summary'),answer=item.querySelector('.faq-answer');
 if(!summary||!answer||!item.animate)return;
 let heightAnimation,fadeAnimation,expanded=item.open;
 summary.addEventListener('click',event=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  event.preventDefault();expanded=!expanded;
  const start=item.getBoundingClientRect().height,opacity=item.open?getComputedStyle(answer).opacity:'0';
  heightAnimation?.cancel();fadeAnimation?.cancel();
  item.open=true;item.classList.toggle('is-closing',!expanded);
  item.style.height=start+'px';item.style.overflow='hidden';
  const border=parseFloat(getComputedStyle(item).borderTopWidth)+parseFloat(getComputedStyle(item).borderBottomWidth);
  const end=summary.offsetHeight+(expanded?answer.offsetHeight:0)+border;
  const settings={duration:340,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'};
  heightAnimation=item.animate({height:[start+'px',end+'px']},settings);
  fadeAnimation=answer.animate({opacity:[opacity,expanded?'1':'0'],transform:expanded?['translateY(-5px)','translateY(0)']:['translateY(0)','translateY(-5px)']},settings);
  const current=heightAnimation;
  current.onfinish=()=>{
   if(heightAnimation!==current)return;
   item.open=expanded;item.classList.remove('is-closing');item.style.height='';item.style.overflow='';
   current.cancel();fadeAnimation?.cancel();heightAnimation=null;fadeAnimation=null;
  };
 });
});
