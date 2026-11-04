/* A readable, continuous process. Native anchors work without JavaScript. */
(()=>{
 'use strict';
 const root=document.querySelector('.cf-main');if(!root)return;
 const chapters=[...root.querySelectorAll('.cf-chapter')],links=[...root.querySelectorAll('[data-cf-index]')];
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.uxMotion==='off';
 let active=-1,frame=0,observer;const animations=new Set();
 function update(){
  frame=0;const point=Math.min(innerHeight*.35,300);let current=0;
  chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<=point)current=i;});
  if(current===active)return;active=current;
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  root.querySelector('.cf-current').textContent=String(current+1).padStart(2,'0');
  root.querySelector('.cf-reading-line').style.setProperty('--progress',(current+1)/chapters.length);
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 function language(){const en=document.documentElement.lang==='en';root.querySelectorAll('[data-fa][data-en]').forEach(el=>el.textContent=en?el.dataset.en:el.dataset.fa);schedule();}
 new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});language();update();
 if('IntersectionObserver'in window&&!reduced()){
  observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;
   if(!reduced()&&e.target.animate){const a=e.target.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.2,0,0,1)'});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));}
   observer.unobserve(e.target);
  }),{threshold:.15});
  root.querySelectorAll('.cf-chapter-heading').forEach(el=>observer.observe(el));
 }
 const stopMotion=()=>{if(reduced()){observer?.disconnect();animations.forEach(a=>a.cancel());}};
 matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',stopMotion);
 new MutationObserver(stopMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-ux-motion']});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;animations.forEach(a=>a.cancel());});
})();
