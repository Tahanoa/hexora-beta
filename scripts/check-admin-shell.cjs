const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element{constructor(){this.attrs={};this.classes=new Set();this.classList={toggle:(c,on)=>{on??=!this.classes.has(c);if(on)this.classes.add(c);else this.classes.delete(c);return on},contains:c=>this.classes.has(c)};}addEventListener(event,fn){(this.events??={})[event]=fn;}setAttribute(k,v){this.attrs[k]=v;}}
const sidebar=new Element(),overlay=new Element(),button=new Element(),label=new Element(),refresh=new Element(),title=new Element(),body=new Element(),html={lang:'fa',dir:'rtl'};
const dashboardLanguage=new Element(),profileLanguage=new Element(),dashboardRefresh=new Element();let languageCalls=0,refreshCalls=0;
const ids={dashboardLanguage,profileLanguage,dashboardRefresh,sidebar,sidebarOverlay:overlay,dmPageTitle:title},listeners={},winlisteners={};let observer;
const document={documentElement:html,body,getElementById:id=>ids[id]||null,querySelectorAll:q=>q==='.sidebar-toggle'?[button]:q==='[data-admin-language]'?[label]:q==='[data-admin-refresh]'?[refresh]:[],addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn)}};
const window={toggleLanguage:()=>languageCalls++,refreshData:()=>refreshCalls++,innerWidth:768,addEventListener:(event,fn)=>{(winlisteners[event]??=[]).push(fn)}};
const context={document,window,localStorage:{getItem:()=>null},location:{pathname:'/manage/demos'},MutationObserver:class{constructor(fn){observer=fn}observe(){}},URL};
vm.runInNewContext(fs.readFileSync('src/main/resources/static/js/dashboard-shell.js','utf8'),context);
listeners.DOMContentLoaded.forEach(fn=>fn());
dashboardLanguage.events.click();profileLanguage.events.click();dashboardRefresh.events.click();
assert.equal(languageCalls,2);assert.equal(refreshCalls,1);
const fragment=fs.readFileSync('src/main/resources/templates/dashboard/fragments/topbar.html','utf8');
assert(!/th:on\w+\s*=/.test(fragment),'Shared header must not interpolate event handlers');
for(const name of ['index','profile','manage','chat','demos','media']){
 const template=fs.readFileSync(`src/main/resources/templates/dashboard/${name}.html`,'utf8');
 const call=template.match(/topbar\((.*?)\)\}/)[1];
 assert.equal([...call.matchAll(/'([^']*)'/g)].length,7,`${name}: fragment argument count`);
}

for(const width of [768,1023]){window.innerWidth=width;window.toggleSidebar();assert(sidebar.classes.has('open'));assert(overlay.classes.has('show'));assert(body.classes.has('sidebar-open'));assert.equal(button.attrs['aria-expanded'],'true');listeners.keydown.forEach(fn=>fn({key:'Escape'}));assert(!sidebar.classes.has('open'));}
window.toggleSidebar();listeners.click.forEach(fn=>fn({target:{closest:()=>null}}));assert(!sidebar.classes.has('open'));
window.toggleSidebar();window.innerWidth=1024;winlisteners.resize.forEach(fn=>fn());assert(!sidebar.classes.has('open'));window.toggleSidebar();assert(!overlay.classes.has('show'));
html.lang='en';observer();assert.equal(label.textContent,'English');assert.equal(title.textContent,'Demo studio');assert.equal(button.attrs['aria-label'],'Open menu');assert.equal(refresh.attrs['aria-label'],'Refresh');
window.innerWidth=900;window.toggleSidebar();assert.equal(button.attrs['aria-label'],'Close menu');html.lang='fa';observer();assert.equal(label.textContent,'فارسی');assert.equal(title.textContent,'دموساز');assert.equal(button.attrs['aria-label'],'بستن منو');
console.log('Header buttons, safe template attributes, fragment arguments, admin shell: tablet boundaries, overlay, Escape, outside click, resize, and FA/EN passed.');
