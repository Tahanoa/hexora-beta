(async()=>{
 const area=document.getElementById('testimonialsList');if(!area||area.closest('section')?.hidden)return;
 const release=window.holdPageLoader?.()||(()=>{}),home=!!area.closest('.home-testimonials');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=v=>{if(!v?.trim())return '';try{const url=new URL(v,location.origin);return ['http:','https:'].includes(url.protocol)?esc(url.href):''}catch{return ''}};
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 let items=[],failed=false;
 function render(){
  if(failed){area.innerHTML=`<div class="testimonial-empty"><p>${t('دریافت بازخوردها ناموفق بود.','Unable to load feedback.')}</p><button type="button" class="testimonial-retry">${t('تلاش مجدد','Try again')}</button></div>`;area.querySelector('button').onclick=load;return;}
  if(!items.length){if(home){area.closest('section').hidden=true;return;}area.innerHTML=`<div class="testimonial-empty"><i class="fa-regular fa-comment" aria-hidden="true"></i><h2>${t('بازخورد تازه‌ای در راه است.','More feedback to come.')}</h2><p>${t('هنوز نظری برای نمایش منتشر نشده است.','No client feedback has been published yet.')}</p></div>`;return;}
  area.innerHTML=(home?items.slice(0,6):items).map(x=>{
   const rating=Number(x.rating),validRating=x.rating!=null&&Number.isInteger(rating)&&rating>=1&&rating<=5;
   const avatar=safe(x.avatar),source=safe(x.sourceUrl);
   const full=String(x.quote||''),compact=full.replace(/\s+/g,' ').trim(),characters=Array.from(compact);
   const long=home;
   const excerpt=characters.slice(0,180).join('')+(characters.length>180?'…':'');
   return `<article id="testimonial-${esc(x.id)}" class="testimonial-card"><i class="fa-solid fa-quote-right testimonial-quote-mark" aria-hidden="true"></i>${validRating?`<div class="testimonial-stars" role="img" aria-label="${t(`امتیاز ${rating} از ۵`,`Rating ${rating} out of 5`)}">${Array.from({length:5},(_,i)=>`<i class="${i<rating?'fa-solid':'fa-regular'} fa-star" aria-hidden="true"></i>`).join('')}</div>`:''}<blockquote id="testimonial-quote-${esc(x.id)}">${esc(long?excerpt:full)}</blockquote>${long?`<a class="testimonial-read-more" href="/testimonials#testimonial-${esc(x.id)}">${t('ادامه نظر','Read full feedback')} <span aria-hidden="true">↗</span></a>`:''}<div class="testimonial-author">${avatar?`<img src="${avatar}" alt="${esc(x.authorName)}" loading="lazy">`:`<span class="testimonial-initial" aria-hidden="true">${esc(Array.from(x.authorName||'')[0])}</span>`}<div><h2>${esc(x.authorName)}</h2>${x.role||x.company?`<p>${[x.role,x.company].filter(Boolean).map(esc).join(' · ')}</p>`:''}</div></div>${x.projectTitle||source?`<div class="testimonial-context">${x.projectTitle?`<span>${esc(x.projectTitle)}</span>`:''}${source?`<a href="${source}" target="_blank" rel="noopener noreferrer">${t('منبع بازخورد ↗','Feedback source ↗')}</a>`:''}</div>`:''}</article>`;
  }).join('');
  if(home)window.HexoraCarousel?.mount(area,'testimonials');
  area.querySelectorAll('.testimonial-author img').forEach(img=>{img.onerror=()=>{const fallback=document.createElement('span');fallback.className='testimonial-initial';fallback.textContent=Array.from(img.alt)[0]||'';fallback.setAttribute('aria-hidden','true');img.replaceWith(fallback);};});
 }
  async function load(){failed=false;try{const response=await fetch('/api/testimonials/public');if(!response.ok)throw Error();const json=await response.json();items=Array.isArray(json.data)?json.data:[];}catch{failed=true;}render();}
 try{await load();requestAnimationFrame(()=>{const target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;if(target){target.scrollIntoView({block:'center'});target.classList.add('is-target');}});}finally{release();}
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();

