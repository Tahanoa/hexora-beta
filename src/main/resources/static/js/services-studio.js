/* Dedicated service index. Shared cards and service-detail contracts stay intact. */
(()=>{
 'use strict';
 if(!document.body.classList.contains('sv-page'))return;
 const {esc,safeUrl,list,t,path,request,price}=window.HexoraServices;
 const $=id=>document.getElementById(id),number=n=>Number(n).toLocaleString(document.documentElement.lang==='en'?'en-US':'fa-IR');
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 18 6 6m0 10V6h10"/></svg>';
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.uxMotion==='off';
 let items=[],filter='all',stage=0,observer;
 function row(x){
  const outputs=list(x.deliverables),image=safeUrl(x.cover),index=items.indexOf(x)+1;
  return `<article class="sv-service${x.featured?' sv-featured':''}"><div class="sv-service-title"><span class="sv-service-number" aria-hidden="true">${String(index).padStart(2,'0')}</span><div class="sv-service-name">${x.featured?`<span class="sv-featured-label">${t('خدمت ویژه','Featured service')}</span>`:''}<h3><a href="${path(x)}">${esc(x.title)}</a></h3>${x.audience?`<p class="sv-audience">${esc(x.audience)}</p>`:''}<a class="sv-details-link" href="${path(x)}">${t('شناخت بیشتر این خدمت','Explore this service')}${arrow}</a></div></div><div class="sv-service-body">${image?`<a href="${path(x)}" class="sv-service-cover" aria-label="${esc(x.title)}"><img src="${image}" alt="" loading="lazy"></a>`:''}${x.shortDescription||x.description?`<p class="sv-description">${esc(x.shortDescription||x.description)}</p>`:''}${outputs.length?`<div class="sv-outputs"><span class="sv-label">${t('آنچه تحویل می‌گیرید','What you receive')}</span><ul>${outputs.slice(0,4).map(v=>`<li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>${esc(v)}</li>`).join('')}</ul>${outputs.length>4?`<a class="sv-more" href="${path(x)}">${t('همه خروجی‌ها','All deliverables')} (${number(outputs.length)})</a>`:''}</div>`:''}<div class="sv-service-footer"><dl>${x.duration?`<div><dt>${t('زمان تقریبی','Estimated time')}</dt><dd>${esc(x.duration)}</dd></div>`:''}<div><dt>${t('هزینه اجرا','Pricing')}</dt><dd>${esc(price(x))}</dd></div></dl><a class="sv-request" href="${request(x)}">${t('درخواست خدمت','Request service')}${arrow}</a></div></div></article>`;
 }
 function reveal(){
  observer?.disconnect();if(reduced()||!('IntersectionObserver'in window))return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.2,0,0,1)'});observer.unobserve(entry.target);}),{threshold:.08});
  $('serviceList').querySelectorAll('.sv-service').forEach(el=>observer.observe(el));
 }
 function render(data){
  items=data;const query=$('serviceSearch').value.trim().toLocaleLowerCase();
  const shown=items.filter(x=>(filter==='all'||x.featured)&&[x.title,x.shortDescription,x.description,x.audience,...list(x.deliverables)].join(' ').toLocaleLowerCase().includes(query));
  $('serviceList').innerHTML=shown.length?shown.map(row).join(''):window.HexoraUX.state({title:items.length?['با این انتخاب خدمتی پیدا نشد','No services match this selection']:['هنوز خدمتی منتشر نشده','No services published yet'],message:items.length?['جست‌وجو یا فیلتر را تغییر دهید تا انتخاب‌های بیشتری ببینید.','Change your search or filter to explore more options.']:['نیازتان را مستقیماً در گفت‌وگو مطرح کنید.','Discuss your needs directly in chat.'],...(items.length?{}:{href:'/contact',action:['شروع گفت‌وگو','Start a conversation']})})+(items.length?`<button type="button" class="sv-reset" id="clearServiceSearch">${t('نمایش همه خدمات','Show all services')}</button>`:'');
  $('serviceCount').textContent=t(`${number(shown.length)} خدمت از ${number(items.length)}`,`${number(shown.length)} of ${number(items.length)} services`);
  document.querySelectorAll('[data-service-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.serviceFilter===filter)));
  if(!query)reveal();else observer?.disconnect();
 }
 function stageNote(){
  const notes=[['اول، مسئله‌ای که می‌خواهید حل کنید.','First, the problem you want to solve.'],['بعد، محدوده و خروجی مورد انتظار.','Then, the scope and expected outcome.'],['و سپس، تبدیل مسیر به یک محصول واقعی.','Then, turn the plan into a real product.']];
  $('svStageNote').textContent=t(...notes[stage]);
 }
 document.querySelector('.sv-stage-controls').addEventListener('click',e=>{const b=e.target.closest('button[data-stage]');if(!b)return;stage=Number(b.dataset.stage);document.querySelector('.sv-blueprint').dataset.stage=String(stage);document.querySelectorAll('.sv-stage-controls button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stageNote();});
 document.querySelector('.sv-filters').addEventListener('click',e=>{const b=e.target.closest('[data-service-filter]');if(b){filter=b.dataset.serviceFilter;if($('serviceList').dataset.loaded==='true')render(items);else document.querySelectorAll('[data-service-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}});
 // Capture before the existing clear-search handler so it also resets the featured filter.
 $('serviceList').addEventListener('click',e=>{if(e.target.closest('#clearServiceSearch'))filter='all';},true);
 new MutationObserver(stageNote).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});stageNote();
 const stopMotion=()=>{if(reduced()){$('serviceList').querySelectorAll('.sv-service').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));observer?.disconnect();}};
 matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',stopMotion);
 new MutationObserver(stopMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-ux-motion']});
 window.HexoraServiceStudio={render};
})();
