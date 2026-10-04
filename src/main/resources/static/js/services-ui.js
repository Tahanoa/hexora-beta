(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUrl=value=>{if(!value)return '';try{const u=new URL(value,location.origin);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?esc(u.href):'';}catch{return '';}};
 const list=value=>{if(Array.isArray(value))return value;try{const parsed=JSON.parse(value);if(Array.isArray(parsed))return parsed;}catch{}return String(value||'').split(/[,،\n]/).map(v=>v.trim()).filter(Boolean);};
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 const icon=x=>/^fa-(solid|regular|brands)\s+fa-[a-z0-9-]+$/i.test(x.icon||'')?x.icon:'fa-solid fa-code';
 const path=x=>'/services/'+encodeURIComponent(x.slug||x.id);
 const request=x=>'/contact?service='+encodeURIComponent(x.id);
 const price=x=>x.pricingMode==='FROM'&&x.priceLabel?t('شروع از ','Starting from ')+x.priceLabel:x.pricingMode==='RANGE'&&x.priceLabel?x.priceLabel:t('پس از بررسی نیاز','After reviewing requirements');
 const cover=x=>`<div class="hx-svc-cover ${safeUrl(x.cover)?'':'hx-svc-cover-empty'}">${safeUrl(x.cover)?`<img src="${safeUrl(x.cover)}" alt="${esc(x.title)}" loading="lazy">`:`<i class="${esc(icon(x))}" aria-hidden="true"></i>`}${x.featured?`<span class="hx-svc-featured">${t('خدمت ویژه','Featured service')}</span>`:''}</div>`;
 const card=x=>`<article class="hx-svc-card"><a class="hx-svc-image-link" href="${path(x)}" aria-label="${esc(x.title)}">${cover(x)}</a><div class="hx-svc-card-copy"><div class="hx-svc-title"><i class="${esc(icon(x))}" aria-hidden="true"></i><h2><a href="${path(x)}">${esc(x.title)}</a></h2></div><p>${esc(x.shortDescription||x.description||'')}</p>${list(x.deliverables).length?`<ul class="hx-svc-deliverables">${list(x.deliverables).slice(0,3).map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}<div class="hx-svc-meta">${x.duration?`<span><i class="fa-regular fa-clock" aria-hidden="true"></i>${esc(x.duration)}</span>`:''}<span>${esc(price(x))}</span></div><div class="hx-svc-actions"><a class="hx-svc-button" href="${path(x)}">${t('بررسی این خدمت','Explore service')} <span aria-hidden="true">↗</span></a><a class="hx-svc-link" href="${request(x)}">${t('درخواست خدمت','Request service')}</a></div></div></article>`;
 window.HexoraServices={esc,safeUrl,list,t,icon,path,request,price,cover,card};
})();
