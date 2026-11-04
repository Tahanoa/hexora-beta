/* Progressive enhancement: the complete five-stage route is readable without JS. */
(()=>{
 'use strict';
 const root=document.querySelector('.cw-explorer');if(!root)return;
 const tabs=[...root.querySelectorAll('.cw-stop')],panels=[...root.querySelectorAll('.cw-stage')];
 const previous=document.getElementById('cwPrevious'),next=document.getElementById('cwNext');
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.uxMotion==='off';
 let active=0,animation;
 root.classList.add('cw-enhanced');root.querySelector('.cw-stops').setAttribute('role','tablist');
 tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);panels[i].tabIndex=0;});
 root.querySelector('.cw-controls').hidden=false;
 function select(index,{focus=false,animate=true}={}){
  if(index<0||index>=tabs.length)return;
  animation?.cancel();active=index;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;tab.classList.toggle('cw-visited',i<index);panels[i].hidden=i!==index;});
  root.querySelectorAll('[data-route]').forEach(path=>path.classList.toggle('cw-route-done',Number(path.dataset.route)<=index));
  root.querySelectorAll('.cw-control-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===index));
  document.getElementById('cwMapCounter').textContent=String(index+1).padStart(2,'0')+' / 05';
  previous.disabled=index===0;next.disabled=index===tabs.length-1;
  if(focus)tabs[index].focus({preventScroll:true});
  if(animate&&!reduced()&&panels[index].animate)animation=panels[index].animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:360,easing:'cubic-bezier(.2,0,0,1)'});
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',event=>{event.preventDefault();select(i);});
  tab.addEventListener('keydown',event=>{
   // The drawn route runs physically left to right in both locales.
   const direction=1;
   const delta=event.key==='ArrowRight'?direction:event.key==='ArrowLeft'?-direction:0;
   const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:delta?(active+delta+tabs.length)%tabs.length:null;
   if(index===null)return;event.preventDefault();select(index,{focus:true});
  });
 });
 previous.addEventListener('click',()=>{select(active-1);if(previous.disabled)next.focus({preventScroll:true});});
 next.addEventListener('click',()=>{select(active+1);if(next.disabled)previous.focus({preventScroll:true});});
 const stopMotion=()=>{if(reduced())animation?.cancel();};
 matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',stopMotion);
 new MutationObserver(stopMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-ux-motion']});
 // Static localized content uses the same data attributes as the other public pages.
 function language(){const en=document.documentElement.lang==='en';document.querySelectorAll('.cw-main [data-fa][data-en]').forEach(el=>el.textContent=en?el.dataset.en:el.dataset.fa);}
 new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});language();select(0,{animate:false});
})();
