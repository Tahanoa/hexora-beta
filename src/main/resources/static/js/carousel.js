(()=>{
 const mounted=new WeakMap();
 window.HexoraCarousel={mount(track,kind){
  if(mounted.has(track)){mounted.get(track)();return;}
  const shell=document.createElement('div');shell.className=`hx-carousel hx-carousel--${kind}`;
  track.before(shell);shell.append(track);track.classList.add('hx-carousel-track');
  shell.setAttribute('role','region');shell.setAttribute('aria-roledescription','carousel');track.removeAttribute('aria-live');
  const controls=document.createElement('div');controls.className='hx-carousel-controls';controls.innerHTML='<button type="button" class="hx-prev"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button><div class="hx-dots"></div><span class="hx-position" aria-live="polite"></span><button type="button" class="hx-next"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>';shell.append(controls);
  const prev=controls.querySelector('.hx-prev'),next=controls.querySelector('.hx-next'),dots=controls.querySelector('.hx-dots'),position=controls.querySelector('.hx-position');
  let index=0,cards=[],frame;
  const en=()=>document.documentElement.lang==='en';
  function paint(){prev.disabled=index===0;next.disabled=index>=cards.length-1;position.textContent=`${index+1} / ${cards.length}`;dots.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'true':'false');});}
  function go(i){index=Math.max(0,Math.min(cards.length-1,i));const card=cards[index];if(!card)return;card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'});cards.forEach((item,n)=>item.classList.toggle('is-active',n===index));paint();}
  function refresh(){cards=[...track.children].filter(x=>x.matches('article'));controls.hidden=cards.length<2;shell.setAttribute('aria-label',en()?(kind==='projects'?'Selected projects':'Client feedback'):(kind==='projects'?'منتخب کارها':'نظرات کارفرمایان'));prev.setAttribute('aria-label',en()?'Previous slide':'اسلاید قبلی');next.setAttribute('aria-label',en()?'Next slide':'اسلاید بعدی');index=Math.min(index,Math.max(0,cards.length-1));cards.forEach((card,i)=>{card.setAttribute('role','group');card.setAttribute('aria-roledescription','slide');card.setAttribute('aria-label',`${i+1} / ${cards.length}`)});dots.innerHTML=cards.map((_,i)=>`<button type="button" data-index="${i}" aria-label="${en()?'Slide':'اسلاید'} ${i+1}"></button>`).join('');paint();if(cards.length)requestAnimationFrame(()=>go(index));}
  prev.onclick=()=>go(index-1);next.onclick=()=>go(index+1);dots.onclick=e=>{const b=e.target.closest('[data-index]');if(b)go(Number(b.dataset.index));};
  shell.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const right=e.key==='ArrowRight',rtl=getComputedStyle(track).direction==='rtl';go(index+(right?(rtl?-1:1):(rtl?1:-1)));});
  track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const center=track.getBoundingClientRect().left+track.clientWidth/2;let closest=Infinity;cards.forEach((card,i)=>{const box=card.getBoundingClientRect();const distance=Math.abs((box.left+box.width/2)-center);if(distance<closest){closest=distance;index=i;}});cards.forEach((item,n)=>item.classList.toggle('is-active',n===index));paint();});},{passive:true});
  new MutationObserver(refresh).observe(track,{childList:true});new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  if('ResizeObserver'in window)new ResizeObserver(()=>{if(cards.length)go(index)}).observe(track);
  mounted.set(track,refresh);refresh();
 }};
})();
