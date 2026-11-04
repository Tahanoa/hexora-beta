const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element{constructor(){this.classes=new Set();this.attrs={};this.events={};this.classList={contains:c=>this.classes.has(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.events[k]=fn;}focus(){this.focused=true;}contains(target){return target===this;}}
const header=new Element(),menu=new Element(),toggle=new Element(),events={},tablet={matches:true,addEventListener:(k,fn)=>tablet.change=fn};const document={documentElement:{lang:'fa'},querySelector:()=>header,getElementById:id=>({mobileNav:menu,menuBtn:toggle})[id],addEventListener:(k,fn)=>events[k]=fn};const source=fs.readFileSync('src/main/resources/static/js/public-shell.js','utf8').split('  const path =')[0]+'})();';vm.runInNewContext(source,{document,matchMedia:()=>tablet});
toggle.events.click();assert(menu.classes.has('open'));assert.equal(menu.inert,false);assert.equal(toggle.attrs['aria-expanded'],'true');events.keydown({key:'Escape'});assert(!menu.classes.has('open'));assert(menu.inert);assert(toggle.focused);
toggle.events.click();events.click({target:{}});assert(!menu.classes.has('open'));toggle.events.click();menu.events.click({target:{closest:()=>({})}});assert(!menu.classes.has('open'));toggle.events.click();tablet.matches=false;tablet.change();assert(!menu.classes.has('open'));
const css=fs.readFileSync('src/main/resources/static/css/public-shell.css','utf8');assert(css.includes('transition:max-height'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('aria-expanded="true"'));console.log('Public menu: toggle, inert state, Escape/focus, outside and link clicks, desktop resize and motion rules passed.');
// Route highlighting belongs to navigation links, never the brand or account links.
for(const path of ['/','/services','/services/example']){
 const brand={href:'/',classes:new Set(),attrs:{}},account={href:'/login',classes:new Set(),attrs:{}};
 const links=['/','/services','/contact'].map(href=>({href,classes:new Set(),attrs:{}}));
 for(const el of [brand,account,...links]){el.getAttribute=k=>el[k];el.setAttribute=(k,v)=>el.attrs[k]=v;el.removeAttribute=k=>delete el.attrs[k];el.classList={toggle:(k,on)=>on?el.classes.add(k):el.classes.delete(k)};}
 const localHeader=new Element();localHeader.querySelectorAll=selector=>{assert.equal(selector,'nav a[href]');return links;};
 const localDocument={...document,querySelector:()=>localHeader};
 const activeSource=fs.readFileSync('src/main/resources/static/js/public-shell.js','utf8').split("  document.getElementById('year')")[0]+'})();';
 vm.runInNewContext(activeSource,{document:localDocument,location:{pathname:path},matchMedia:()=>tablet});
 assert.equal(brand.classes.size,0);assert.equal(account.classes.size,0);assert.equal(links.filter(el=>el.classes.has('active')).length,1);assert(links.find(el=>el.href===(path==='/'?'/':'/services')).classes.has('active'));
}
assert(fs.readFileSync('src/main/resources/static/js/portfolio.js','utf8').includes("querySelectorAll('.public-header nav a[href]')"));
console.log('Public header: home, inner and detail routes highlight menu links only; brand and account stay unchanged.');
