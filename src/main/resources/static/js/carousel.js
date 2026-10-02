(()=>{
 const mounted=new WeakMap();
 window.HexoraCarousel={mount(track,kind){
  if(mounted.has(track)){mounted.get(track)();return;}
  const shell=document.createElement('div');shell.className=`hx-carousel hx-carousel--${kind}`;
  track.before(shell);shell.append(track);track.classList.add('hx-carousel-track');track.removeAttribute('aria-live');
  shell.setAttribute('role','region');shell.setAttribute('aria-roledescription','carousel');
  const controls=document.createElement('div');controls.className='hx-carousel-controls';
  controls.innerHTML='<button type="button" class="hx-prev"><i aria-hidden="true"></i></button><div class="hx-dots"></div><span class="hx-position" aria-live="polite"></span><button type="button" class="hx-next"><i aria-hidden="true"></i></button>';shell.append(controls);
  const prev=controls.querySelector('.hx-prev'),next=controls.querySelector('.hx-next'),dots=controls.querySelector('.hx-dots'),position=controls.querySelector('.hx-position');
  let index=0,cards=[],frame,autoplayTimer;
  const en=()=>document.documentElement.lang==='en',reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paint(){
   prev.disabled=index===0;next.disabled=index>=cards.length-1;position.textContent=cards.length?`${index+1} / ${cards.length}`:'';
   cards.forEach((card,i)=>{card.classList.toggle('is-active',i===index);card.classList.toggle('is-before',i<index);card.classList.toggle('is-after',i>index);});
   dots.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'true':'false');});
  }
  function go(i,instant=false){
   index=Math.max(0,Math.min(cards.length-1,i));const card=cards[index];if(!card)return;paint();
   const left=card.offsetLeft-(track.clientWidth-card.offsetWidth)/2;track.scrollTo({left,behavior:instant||reduced()?'auto':'smooth'});
  }
  function schedule(){
   clearInterval(autoplayTimer);
   if(cards.length<2)return;
   autoplayTimer=setInterval(()=>{if(document.hidden||shell.matches(':hover')||shell.contains(document.activeElement))return;go(index>=cards.length-1?0:index+1);},5200);
  }
  function refresh(){
   cards=[...track.children].filter(x=>x.matches('article'));controls.hidden=cards.length<2;
   const rtl=getComputedStyle(track).direction==='rtl';
   prev.firstElementChild.className=`fa-solid ${rtl?'fa-chevron-right':'fa-chevron-left'}`;
   next.firstElementChild.className=`fa-solid ${rtl?'fa-chevron-left':'fa-chevron-right'}`;
   shell.setAttribute('aria-label',en()?(kind==='projects'?'Selected projects':'Client feedback'):(kind==='projects'?'منتخب کارها':'نظرات کارفرمایان'));
   prev.setAttribute('aria-label',en()?'Previous slide':'اسلاید قبلی');next.setAttribute('aria-label',en()?'Next slide':'اسلاید بعدی');
   index=Math.min(index,Math.max(0,cards.length-1));
   cards.forEach((card,i)=>{card.setAttribute('role','group');card.setAttribute('aria-roledescription','slide');card.setAttribute('aria-label',`${i+1} / ${cards.length}`);});
   dots.innerHTML=cards.map((_,i)=>`<button type="button" data-index="${i}" aria-label="${en()?'Slide':'اسلاید'} ${i+1}"></button>`).join('');paint();
   requestAnimationFrame(()=>go(index,true));schedule();
  }
  prev.onclick=()=>{go(index-1);schedule()};next.onclick=()=>{go(index+1);schedule()};
  dots.onclick=e=>{const b=e.target.closest('[data-index]');if(b){go(Number(b.dataset.index));schedule()}};
  shell.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const rtl=getComputedStyle(track).direction==='rtl';go(index+(e.key==='ArrowRight'?(rtl?-1:1):(rtl?1:-1)));schedule()});
  track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const viewport=track.getBoundingClientRect(),center=viewport.left+track.clientWidth/2;let closest=Infinity;
   cards.forEach((card,i)=>{const box=card.getBoundingClientRect(),distance=Math.abs(box.left+box.width/2-center);if(distance<closest){closest=distance;index=i;}});paint();
  });},{passive:true});
  new MutationObserver(refresh).observe(track,{childList:true});
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  if('ResizeObserver'in window)new ResizeObserver(()=>go(index,true)).observe(track);
  mounted.set(track,refresh);refresh();
 }};
})();