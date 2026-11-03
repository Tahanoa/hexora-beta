/* Service brief: presentation only, using the existing public service payload. */
(()=>{
 'use strict';
 if(!document.body.classList.contains('sd-page'))return;
 const {esc,safeUrl,list,t,request,price}=window.HexoraServices;
 const root=document.getElementById('serviceDetail');
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 18 6 6m0 10V6h10"/></svg>';
 const check='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.uxMotion==='off';
 const number=n=>Number(n).toLocaleString(document.documentElement.lang==='en'?'en-US':'fa-IR');
 let sections=[],observer,navObserver,initialized=false;
 const faqMotion=new Map();
 function settleFaq(details){
  const state=faqMotion.get(details);if(!state)return;
  state.animation.cancel();state.contentAnimation.cancel();details.open=state.target;
  details.style.removeProperty('overflow');delete details.dataset.sdAnimating;faqMotion.delete(details);
 }
 root.addEventListener('click',event=>{
  const summary=event.target.closest('.sd-faq summary');if(!summary||event.target.closest('a,button'))return;
  event.preventDefault();const details=summary.parentElement,answer=details.querySelector('.sd-faq-answer');
  const previous=faqMotion.get(details),target=previous?!previous.target:!details.open;
  const startHeight=details.getBoundingClientRect().height;
  const startOpacity=details.open?Number(getComputedStyle(answer).opacity):0;
  if(previous){previous.animation.cancel();previous.contentAnimation.cancel();faqMotion.delete(details);}
  if(reduced()||typeof details.animate!=='function'){
   details.open=target;details.style.removeProperty('overflow');delete details.dataset.sdAnimating;return;
  }
  details.open=true;
  const border=details.getBoundingClientRect().height-details.clientHeight;
  const endHeight=target?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+border;
  details.style.overflow='hidden';details.dataset.sdAnimating=target?'open':'close';
  const options={duration:target?400:300,easing:'cubic-bezier(.2,0,0,1)',fill:'both'};
  const animation=details.animate([{height:startHeight+'px'},{height:endHeight+'px'}],options);
  const contentAnimation=answer.animate([{opacity:startOpacity,transform:target?'translateY(-6px)':'none'},{opacity:target?1:0,transform:target?'none':'translateY(-4px)'}],options);
  faqMotion.set(details,{animation,contentAnimation,target});
  animation.onfinish=()=>{if(faqMotion.get(details)?.animation===animation)settleFaq(details);};
 });
 const has=value=>typeof value==='string'&&value.trim().length>0;
 const prose=value=>`<p class="sd-prose">${esc(value)}</p>`;
 function section(key,title,body){
  if(!body)return '';sections.push({key,title});
  return `<section class="sd-section" id="sd-${key}" aria-labelledby="sd-${key}-title"><div class="sd-section-heading"><span aria-hidden="true">${String(sections.length).padStart(2,'0')}</span><h2 id="sd-${key}-title">${title}</h2></div>${body}</section>`;
 }
 function render(x,projects){
  const opened=new Set([...root.querySelectorAll('[data-sd-faq]')].filter(el=>faqMotion.get(el)?.target??el.open).map(el=>el.dataset.sdFaq));
  [...faqMotion.keys()].forEach(settleFaq);
  const focusId=root.contains(document.activeElement)?document.activeElement.id:'';
  sections=[];const outputs=list(x.deliverables),features=list(x.features),image=safeUrl(x.cover);
  const overview=section('overview',t('درباره این خدمت','About this service'),(has(x.description)?prose(x.description):'')+(has(x.audience)?`<aside class="sd-audience"><h3>${t('این خدمت برای چه کسانی است؟','Who is this service for?')}</h3>${prose(x.audience)}</aside>`:''));
  const deliverables=section('outputs',t('آنچه تحویل می‌گیرید','What you receive'),outputs.length?`<ol class="sd-outputs">${outputs.map((v,i)=>`<li><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span><p>${esc(v)}</p></li>`).join('')}</ol>`:'');
  const capabilities=section('features',t('ویژگی‌های خدمت','Service features'),features.length?`<ul class="sd-features">${features.map(v=>`<li>${check}<span>${esc(v)}</span></li>`).join('')}</ul>`:'');
  const boundary=section('scope',t('مرزهای پروژه، روشن و مشخص','A clearly defined scope'),has(x.scope)||has(x.exclusions)?`<div class="sd-pair">${has(x.scope)?`<article class="sd-boundary"><span class="sd-small-label">IN SCOPE</span><h3>${t('در محدودهٔ این خدمت','Included scope')}</h3>${prose(x.scope)}</article>`:''}${has(x.exclusions)?`<article class="sd-boundary sd-excluded"><span class="sd-small-label">OUT OF SCOPE</span><h3>${t('خارج از محدوده','Excluded scope')}</h3>${prose(x.exclusions)}</article>`:''}</div>`:'');
  const terms=section('terms',t('بعد از اجرا، چه می‌شود؟','What happens after delivery?'),has(x.support)||has(x.revisions)?`<div class="sd-terms">${has(x.support)?`<article><h3>${t('پشتیبانی پس از تحویل','Support after delivery')}</h3>${prose(x.support)}</article>`:''}${has(x.revisions)?`<article><h3>${t('شرایط اصلاحات','Revision terms')}</h3>${prose(x.revisions)}</article>`:''}</div>`:'');
  const work=section('work',t('نمونه‌کارهای مرتبط','Related work'),projects.length?`<div class="sd-projects">${projects.map(p=>`<a href="/projects/${encodeURIComponent(p.slug||p.id)}" class="sd-project">${safeUrl(p.image)?`<img src="${safeUrl(p.image)}" alt="" loading="lazy">`:''}<div><h3>${esc(p.title)}</h3>${has(p.shortDescription)?`<p>${esc(p.shortDescription)}</p>`:''}<span>${t('بررسی پروژه','Explore project')}${arrow}</span></div></a>`).join('')}</div>`:'');
  const faq=section('faq',t('پیش از شروع بپرسید','Before we begin'),x.faqs?.length?`<div class="sd-faq">${x.faqs.map((f,i)=>`<details data-sd-faq="${i}"${opened.has(String(i))?' open':''}><summary id="sd-question-${i}"><span>${esc(f.question)}</span><i aria-hidden="true"></i></summary><div class="sd-faq-answer">${prose(f.answer)}</div></details>`).join('')}</div>`:'');
  root.innerHTML=`<header class="sd-hero"><div class="sd-hero-copy hx-svc-detail-header"><div class="sd-eyebrow"><span>SERVICE BRIEF</span>${x.featured?`<span class="sd-featured">${t('خدمت ویژه','Featured service')}</span>`:''}</div><h1>${esc(x.title)}</h1>${has(x.shortDescription)?`<p class="sd-lead">${esc(x.shortDescription)}</p>`:''}<a class="sd-explore" href="${sections.length?'#sd-'+sections[0].key:'/contact'}">${sections.length?t('جزئیات را کشف کنید','Explore the details'):t('درباره نیازتان بگویید','Tell me what you need')}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg></a></div><aside class="sd-brief hx-svc-summary" aria-labelledby="sdBriefTitle"><span class="sd-small-label">AT A GLANCE</span><h2 id="sdBriefTitle">${t('خلاصهٔ همکاری','At a glance')}</h2><dl>${has(x.duration)?`<div><dt>${t('زمان تقریبی','Estimated duration')}</dt><dd>${esc(x.duration)}</dd></div>`:''}<div><dt>${t('هزینه اجرا','Pricing')}</dt><dd>${esc(price(x))}</dd></div>${outputs.length?`<div><dt>${t('خروجی‌های ثبت‌شده','Listed deliverables')}</dt><dd>${number(outputs.length)} ${t('خروجی','deliverables')}</dd></div>`:''}</dl><a class="sd-primary" href="${request(x)}">${t('درخواست این خدمت','Request this service')}${arrow}</a><p class="sd-brief-note">${t('محدوده، زمان و هزینهٔ نهایی پس از بررسی نیاز شما مشخص می‌شود.','Final scope, timeline and cost are agreed after reviewing your needs.')}</p></aside></header>${image?`<figure class="sd-cover"><img src="${image}" alt="${esc(x.title)}" fetchpriority="high"><figcaption><span>SERVICE / ${esc(x.slug||x.id)}</span><span>${esc(x.title)}</span></figcaption></figure>`:''}${sections.length?`<div class="sd-layout"><nav class="sd-index" aria-label="${t('بخش‌های این خدمت','Service sections')}"><span class="sd-small-label">IN THIS BRIEF</span><div class="sd-index-links">${sections.map((s,i)=>`<a id="sd-nav-${s.key}" href="#sd-${s.key}"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${s.title}</a>`).join('')}</div><a class="sd-index-request" href="${request(x)}">${t('شروع گفت‌وگو','Start a conversation')}${arrow}</a></nav><div class="sd-content">${overview}${deliverables}${capabilities}${boundary}${terms}${work}${faq}</div></div>`:''}<section class="sd-next"><div><span class="sd-small-label">YOUR NEXT STEP</span><h2>${t('این مسیر به پروژهٔ شما می‌رسد؟','Is this the right path for your project?')}</h2><p>${t('از هدف و نیازتان بگویید تا دربارهٔ قدم بعدی صحبت کنیم.','Share your goals and needs so we can discuss the next step.')}</p></div><div class="sd-next-actions"><a class="sd-primary" href="${request(x)}">${t('گفت‌وگو دربارهٔ این خدمت','Discuss this service')}${arrow}</a><a class="sd-back" href="/services">${t('بازگشت به همهٔ خدمات','Back to all services')}</a></div></section>`;
  if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});
  setupObservers(!initialized);initialized=true;
 }
 function setupObservers(animate){
  observer?.disconnect();navObserver?.disconnect();
  if(!('IntersectionObserver'in window))return;
  if(animate&&!reduced()){
   observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.2,0,0,1)'});observer.unobserve(e.target);}}),{threshold:.05});
   root.querySelectorAll('.sd-section').forEach(s=>observer.observe(s));
  }
  navObserver=new IntersectionObserver(entries=>{
   const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   if(!visible.length)return;const key=visible[0].target.id;
   root.querySelectorAll('.sd-index-links a').forEach(a=>{if(a.hash==='#'+key)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  },{rootMargin:'-15% 0px -55% 0px',threshold:0});
  root.querySelectorAll('.sd-section').forEach(s=>navObserver.observe(s));
 }
 const stopMotion=()=>{if(reduced()){[...faqMotion.keys()].forEach(settleFaq);observer?.disconnect();root.querySelectorAll('.sd-section').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));}};
 matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',stopMotion);
 new MutationObserver(stopMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-ux-motion']});
 window.HexoraServiceDetailStudio={render};
})();
