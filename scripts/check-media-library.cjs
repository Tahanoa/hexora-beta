const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element{
 constructor(){this.value='';this.innerHTML='';this.textContent='';this.dataset={};this.attrs={};this.hidden=false;this.open=false;this.disabled=false;this.events={};this.classes=new Set();this.classList={toggle:(name,value)=>{value??=!this.classes.has(name);value?this.classes.add(name):this.classes.delete(name);return value},add:name=>this.classes.add(name),remove:name=>this.classes.delete(name)};}
 setAttribute(name,value){this.attrs[name]=value;}addEventListener(name,fn){this.events[name]=fn;}showModal(){this.open=true;}close(){this.open=false;this.events.close?.();}click(){this.onclick?.();}querySelectorAll(){return []}
}
const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
const events={},document={documentElement:{lang:'en',dir:'ltr'},getElementById:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn};
class FormData{constructor(){this.fields=new Map()}append(key,value){this.fields.set(key,value)}get(key){return this.fields.get(key)}}
let files=[],requests=[],failUpload=false,failLoad=false;
const context={document,window:{HexoraI18n:{tr:value=>value}},location:{origin:'https://hexora.test',href:''},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},navigator:{clipboard:{writeText:async()=>{}}},MutationObserver:class{observe(){}},URL,FormData,confirm:()=>true,
 fetch:async(path,options={})=>{
  requests.push({path,options});
  if(path==='/api/media'&&failLoad)throw Error('Network failed');
  if(path==='/api/media')return {ok:true,status:200,json:async()=>({data:files})};
  if(path==='/api/media/upload'){
   if(failUpload)return {ok:false,status:400,json:async()=>({message:'Invalid file size'})};
   const file=options.body.get('file'),type=options.body.get('type');files.push({id:files.length+1,fileName:file.name,contentType:file.type,size:file.size,type,createdAt:'2026-10-07',updatedAt:'2026-10-07'});
   return {ok:true,status:201,json:async()=>({data:files.at(-1)})};
  }
  if(options.method==='PUT'){const item=files.find(item=>'/api/media/'+item.id===path),file=options.body.get('file');item.fileName=file.name;item.contentType=file.type;item.updatedAt='2026-10-08';return {ok:true,status:200,json:async()=>({data:item})};}
  if(options.method==='DELETE'){files=files.filter(item=>'/api/media/'+item.id!==path);return {ok:true,status:204};}
  throw Error('Unexpected request '+path);
 }};
vm.createContext(context);
let source=fs.readFileSync('src/main/resources/static/js/media-library.js','utf8');source=source.replace('\n  start();\n','\n  window.testMedia={state,validate,filterItems,card,addFiles,upload,load,replace,details,remove,render,wire,language};\n');vm.runInContext(source,context);
const api=context.window.testMedia,png={name:'cover.png',size:1024,type:'image/png',lastModified:1},pdf={name:'brief.pdf',size:1024,type:'application/pdf',lastModified:2};
(async()=>{
 assert.equal(api.validate(png),'');assert.equal(api.validate({...png,size:5*1024*1024}),'');assert(api.validate({...png,size:5*1024*1024+1}));assert(api.validate({...png,size:0}));assert(api.validate({...png,type:'image/svg+xml',name:'bad.svg'}));assert(api.validate(pdf,{type:'IMAGE'}));
 api.addFiles([png]);assert.equal(api.state.queue.length,0,'Upload queue requires admin authorization');
 api.state.authorized=true;api.addFiles([png,png,pdf]);assert.equal(api.state.queue.length,2,'Deduplicate chosen files');
 failUpload=true;await api.upload();assert(api.state.queue.every(item=>item.status==='error'));assert(!api.state.busy);assert.equal(files.length,0);
 failUpload=false;await api.upload();assert(api.state.queue.every(item=>item.status==='done'));assert.equal(files.length,2);assert.equal(requests.filter(request=>request.path==='/api/media/upload').at(-1).options.body.get('type'),'DOCUMENT');
 const uploadCalls=requests.filter(request=>request.path==='/api/media/upload').length;await api.upload();assert.equal(requests.filter(request=>request.path==='/api/media/upload').length,uploadCalls,'Completed files must not upload again');
 assert.equal(api.filterItems(files,'COVER','image','newest').length,1);assert.equal(api.filterItems(files,'','pdf','name')[0].fileName,'brief.pdf');
 const unsafe=api.card({...files[0],fileName:'<img src=x onerror=alert(1)>"',url:'javascript:alert(1)'});assert(!unsafe.includes('<img src=x'));assert(!unsafe.includes('javascript:'));assert(unsafe.includes('&lt;img'));assert(unsafe.includes('/api/media/public/1?v='));
 element('mediaFilter').value='all';element('mediaSort').value='newest';api.state.items=Array.from({length:30},(_,i)=>({...files[0],id:i+1}));api.render();assert.equal((element('mediaGrid').innerHTML.match(/class="hx-media-card"/g)||[]).length,24);assert.equal(element('mediaLoadMore').hidden,false);
 api.state.items=files;api.state.selected=1;api.state.replace=1;element('mediaDetails').open=true;await api.replace({...png,name:'new-cover.png'});assert.equal(files[0].fileName,'new-cover.png');assert(element('mediaDetailContent').innerHTML.includes('?v=2026-10-08'));assert(element('mediaDetailContent').innerHTML.includes('https://hexora.test/api/media/public/1'));
 context.document.documentElement.lang='fa';api.language();assert.equal(element('mediaTitle').textContent,'رسانه‌ها');assert(element('mediaDetailContent').innerHTML.includes('جایگزینی فایل'));context.document.documentElement.lang='en';api.language();assert.equal(element('mediaTitle').textContent,'Media');
 await api.remove(files[0]);assert.equal(files.length,1);assert.equal(api.state.items.length,1);assert(!element('mediaDetails').open);
 api.state.items=[];failLoad=true;await api.load();assert(api.state.failed);assert(element('mediaGrid').innerHTML.includes('data-media-retry'));assert(!api.state.loading);failLoad=false;await api.load();assert(!api.state.failed);
 console.log('Media library: validation, authorization, upload failure/retry, deduplication, image/PDF types, filters, paging, escaping, replacement cache, deletion, load recovery and FA/EN passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
