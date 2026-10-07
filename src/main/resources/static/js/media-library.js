(() => {
  const $=id=>document.getElementById(id);
  const en=()=>document.documentElement.lang==='en';
  const t=(fa,english)=>en()?english:fa;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=value=>Number(value||0).toLocaleString(en()?'en-US':'fa-IR');
  function size(value){const bytes=Math.max(0,Number(value)||0);if(bytes<1024)return number(bytes)+' B';if(bytes<1024**2)return number(Math.round(bytes/1024))+' KB';return Number(bytes/1024**2).toLocaleString(en()?'en-US':'fa-IR',{maximumFractionDigits:1})+' MB';}
  const kind=item=>String(item.contentType||'').startsWith('image/')?'image':item.contentType==='application/pdf'?'pdf':'other';
  function fileURL(item){const id=String(item.id??'');return /^\d+$/.test(id)?'/api/media/public/'+id:'';}
  function date(value){if(!value)return '—';const parsed=new Date(value);return Number.isNaN(+parsed)?'—':parsed.toLocaleDateString(en()?'en-US':'fa-IR',{year:'numeric',month:'short',day:'numeric'});}
  function validate(file,replace){
    if(!file||file.size<=0||file.size>5*1024*1024)return t('فایل باید بین ۱ بایت و ۵ مگابایت باشد.','Each file must be between 1 byte and 5 MB.');
    const image=['image/png','image/jpeg','image/gif','image/webp'].includes(file.type)||(!file.type&&/\.(png|jpe?g|gif|webp)$/i.test(file.name));
    const pdf=file.type==='application/pdf'||(!file.type&&/\.pdf$/i.test(file.name));
    if(!image&&!pdf)return t('فقط PNG، JPG، GIF، WebP و PDF قابل آپلود هستند.','Only PNG, JPG, GIF, WebP and PDF files are supported.');
    if(replace?.type==='IMAGE'&&!image)return t('برای جایگزینی تصویر، یک فایل تصویری انتخاب کنید.','Choose an image to replace this image.');
    return '';
  }
  function filterItems(items,query,filter,sort){
    const q=String(query||'').trim().toLocaleLowerCase();
    return items.filter(item=>(filter==='all'||kind(item)===filter)&&String(item.fileName||'').toLocaleLowerCase().includes(q)).sort((a,b)=>sort==='name'?String(a.fileName).localeCompare(String(b.fileName),en()?'en':'fa',{numeric:true}):sort==='size'?Number(b.size)-Number(a.size):sort==='oldest'?String(a.createdAt||'').localeCompare(String(b.createdAt||'')):String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  }
  const state={items:[],queue:[],busy:false,loading:false,authorized:false,failed:false,selected:null,replace:null,limit:24,sequence:0,message:null};
  function controls(){
    const locked=state.busy||state.loading||!state.authorized;
    $('mediaRefresh').disabled=locked;
    $('mediaUpload').disabled=locked||!state.queue.some(entry=>entry.status!=='done');
    $('mediaClearQueue').disabled=locked;
    $('mediaDropzone').setAttribute('aria-disabled',String(locked));
    $('mediaDropzone').tabIndex=locked?-1:0;
    document.querySelectorAll('[data-media-copy],[data-media-delete],[data-media-replace],[data-queue-remove]').forEach(button=>button.disabled=locked);
  }
  function status(fa,english,error=false){state.message={fa,english,error};$('mediaStatus').textContent=t(fa,english);$('mediaStatus').classList.toggle('is-error',error);}
  function errorText(error){
    const known={
      'Invalid file size':t('حجم فایل نامعتبر است؛ حداکثر ۵ مگابایت.','Invalid file size; maximum 5 MB.'),
      'Unsupported file content':t('محتوای فایل پشتیبانی نمی‌شود.','The file content is not supported.'),
      'Only PNG, JPEG, GIF or WebP images are allowed':t('فقط تصاویر PNG، JPG، GIF یا WebP مجاز هستند.','Only PNG, JPG, GIF or WebP images are allowed.'),
      'Only images and PDF documents are allowed':t('فقط تصاویر و اسناد PDF مجاز هستند.','Only images and PDF documents are allowed.')
    };
    return known[error.message]||window.HexoraI18n.tr(error.message)||t('درخواست ناموفق بود؛ دوباره تلاش کنید.','The request failed. Please try again.');
  }
  async function request(path,options={}){
    const response=await fetch(path,options);
    if(response.status===401){state.authorized=false;location.href='/login';throw Error(t('نشست شما منقضی شده است.','Your session has expired.'));}
    const json=response.status===204?{}:await response.json().catch(()=>({}));
    if(!response.ok)throw Error(json.message||t('درخواست ناموفق بود؛ دوباره تلاش کنید.','The request failed. Please try again.'));
    return json.data;
  }
  function fileIcon(item){return `<span class="hx-media-file-icon"><i class="fa-regular ${kind(item)==='pdf'?'fa-file-pdf':'fa-file'}" aria-hidden="true"></i><small>${kind(item)==='pdf'?'PDF':t('فایل','FILE')}</small></span>`;}
  function preview(item){const url=fileURL(item);return kind(item)==='image'&&url?`<img src="${esc(url+'?v='+encodeURIComponent(item.updatedAt||item.createdAt||''))}" alt="${esc(item.fileName)}" loading="lazy">`:fileIcon(item);}
  function card(item){const id=esc(item.id),name=esc(item.fileName);return `<article class="hx-media-card"><button class="hx-media-preview" type="button" data-media-details="${id}" aria-label="${esc(t('جزئیات فایل: ','File details: ')+item.fileName)}">${preview(item)}</button><div class="hx-media-card-info"><h3 title="${name}">${name}</h3><div class="hx-media-card-meta"><span>${esc(String(item.contentType||'').split('/').pop().toUpperCase())}</span><span dir="ltr">${size(item.size)}</span></div><div class="hx-media-card-footer"><time datetime="${esc(item.createdAt||'')}">${date(item.createdAt)}</time><div><button type="button" class="hx-media-icon-button" data-media-copy="${id}" aria-label="${esc(t('کپی لینک فایل','Copy file link'))}" title="${esc(t('کپی لینک','Copy link'))}"><i class="fa-solid fa-link" aria-hidden="true"></i></button><button type="button" class="hx-media-icon-button" data-media-details="${id}" aria-label="${esc(t('جزئیات فایل','File details'))}" title="${esc(t('جزئیات','Details'))}"><i class="fa-solid fa-sliders" aria-hidden="true"></i></button></div></div></div></article>`;}
  function render(){
    $('mediaTotal').textContent=number(state.items.length);
    $('mediaImages').textContent=number(state.items.filter(item=>kind(item)==='image').length);
    $('mediaDocuments').textContent=number(state.items.filter(item=>kind(item)==='pdf').length);
    $('mediaStorage').textContent=size(state.items.reduce((total,item)=>total+Number(item.size||0),0));
    const items=filterItems(state.items,$('mediaSearch').value,$('mediaFilter').value,$('mediaSort').value);
    $('mediaResultCount').textContent=t(`${number(items.length)} فایل از ${number(state.items.length)} فایل`,`${number(items.length)} of ${number(state.items.length)} files`);
    $('mediaGrid').setAttribute('aria-busy',String(state.loading));
    $('mediaLoadMore').hidden=state.loading||state.failed||items.length<=state.limit;
    if(state.loading&&state.items.length===0){$('mediaGrid').innerHTML=Array.from({length:6},()=>'<div class="hx-media-skeleton" aria-hidden="true"></div>').join('');return;}
    if(state.failed&&state.items.length===0){$('mediaGrid').innerHTML=`<div class="hx-media-empty"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i><h3>${t('کتابخانه بارگذاری نشد.','The library could not be loaded.')}</h3><p>${t('اتصال را بررسی کنید و دوباره تلاش کنید.','Check your connection and try again.')}</p><button type="button" class="hx-media-button" data-media-retry>${t('تلاش دوباره','Try again')}</button></div>`;return;}
    $('mediaGrid').innerHTML=items.length?items.slice(0,state.limit).map(card).join(''):`<div class="hx-media-empty"><i class="fa-regular ${state.items.length?'fa-folder-open':'fa-images'}" aria-hidden="true"></i><h3>${state.items.length?t('فایلی با این جست‌وجو پیدا نشد.','No matching files.'):t('کتابخانهٔ شما آمادهٔ اولین فایل است.','Your library is ready for its first file.')}</h3><p>${state.items.length?t('نام یا نوع فایل را تغییر دهید.','Try a different name or file type.'):t('تصاویر و اسناد خود را از بخش بالا اضافه کنید.','Add your images and documents using the upload area above.')}</p>${state.items.length?`<button class="hx-media-button" type="button" data-media-reset>${t('پاک کردن فیلترها','Clear filters')}</button>`:''}</div>`;
    controls();
  }
  async function load(){
    if(state.loading)return;
    state.loading=true;state.failed=false;render();controls();
    try{const items=await request('/api/media');state.items=Array.isArray(items)?items:[];}
    catch(error){state.failed=true;status(errorText(error),errorText(error),true);}
    finally{state.loading=false;render();controls();}
  }
  function renderQueue(){
    $('mediaQueuePanel').hidden=state.queue.length===0;
    const pending=state.queue.filter(entry=>entry.status!=='done');
    $('mediaQueueSummary').textContent=t(`${number(pending.length)} فایل برای آپلود · ${size(pending.reduce((sum,entry)=>sum+entry.file.size,0))}`,`${number(pending.length)} files to upload · ${size(pending.reduce((sum,entry)=>sum+entry.file.size,0))}`);
    const labels={pending:t('آماده','Ready'),uploading:t('در حال آپلود…','Uploading…'),done:t('آپلود شد','Uploaded'),error:t('ناموفق؛ قابل تلاش دوباره','Failed; ready to retry')};
    $('mediaQueue').innerHTML=state.queue.map(entry=>`<li><i class="fa-regular ${entry.file.type==='application/pdf'||/\.pdf$/i.test(entry.file.name)?'fa-file-pdf':'fa-image'}" aria-hidden="true"></i><span class="hx-media-queue-file"><b title="${esc(entry.file.name)}">${esc(entry.file.name)}</b><small dir="ltr">${size(entry.file.size)}</small></span><span class="hx-media-queue-state ${entry.status==='done'?'is-done':entry.status==='error'?'is-error':''}" title="${esc(entry.error||'')}">${labels[entry.status]}</span><button type="button" class="hx-media-icon-button" data-queue-remove="${entry.id}" aria-label="${esc(t('حذف از صف','Remove from queue'))}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></li>`).join('');
    controls();
  }
  function addFiles(files){
    if(state.busy||state.loading||!state.authorized)return;
    const errors=[];
    for(const file of Array.from(files||[])){
      const invalid=validate(file);if(invalid){errors.push(file.name+': '+invalid);continue;}
      const key=file.name+':'+file.size+':'+file.lastModified;
      if(state.queue.some(entry=>entry.key===key))continue;
      state.queue.push({id:++state.sequence,key,file,status:'pending',error:''});
    }
    if(errors.length)status(errors.join(' · '),errors.join(' · '),true);
    else if(state.queue.length)status('فایل‌ها آماده‌اند؛ برای ذخیره در کتابخانه، آپلود را بزنید.','Files are ready. Click Upload to save them in your library.');
    renderQueue();$('mediaFileInput').value='';
  }
  async function upload(){
    if(state.busy||state.loading||!state.authorized)return;
    const pending=state.queue.filter(entry=>entry.status!=='done');if(!pending.length)return;
    state.busy=true;controls();let done=0;
    for(const entry of pending){
      entry.status='uploading';entry.error='';renderQueue();
      const body=new FormData();body.append('file',entry.file,entry.file.name);body.append('type',entry.file.type==='application/pdf'||/\.pdf$/i.test(entry.file.name)?'DOCUMENT':'IMAGE');
      try{await request('/api/media/upload',{method:'POST',body});entry.status='done';done++;}
      catch(error){entry.status='error';entry.error=errorText(error);}
      renderQueue();
      if(!state.authorized)break;
    }
    if(done&&state.authorized)await load();
    state.busy=false;renderQueue();controls();
    status(`${number(done)} فایل آپلود شد${done<pending.length?'؛ فایل‌های ناموفق را دوباره آپلود کنید.':'.'}`,`${number(done)} files uploaded${done<pending.length?'; retry the failed files.':'.'}`,done<pending.length);
  }
  function details(item){
    const url=fileURL(item),absolute=url?new URL(url,location.origin).href:'';
    $('mediaDetailContent').innerHTML=`<header class="hx-media-detail-heading"><h2 id="mediaDetailTitle">${esc(item.fileName)}</h2><button type="button" class="hx-media-icon-button" data-media-close aria-label="${esc(t('بستن','Close'))}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="hx-media-detail-body"><div class="hx-media-detail-preview">${preview(item)}</div><div class="hx-media-detail-info"><dl><div><dt>${t('نوع فایل','File type')}</dt><dd dir="ltr">${esc(item.contentType)}</dd></div><div><dt>${t('حجم فایل','File size')}</dt><dd dir="ltr">${size(item.size)}</dd></div><div><dt>${t('تاریخ آپلود','Uploaded')}</dt><dd>${date(item.createdAt)}</dd></div><div><dt>${t('شناسه رسانه','Media ID')}</dt><dd>${number(item.id)}</dd></div></dl><code class="hx-media-link">${esc(absolute)}</code><div class="hx-media-detail-actions"><button class="hx-media-button hx-media-primary" type="button" data-media-copy="${esc(item.id)}"><i class="fa-solid fa-link" aria-hidden="true"></i>${t('کپی لینک','Copy link')}</button><a class="hx-media-button" href="${esc(url)}" download="${esc(item.fileName)}"><i class="fa-solid fa-arrow-down" aria-hidden="true"></i>${t('دانلود','Download')}</a><button class="hx-media-button" type="button" data-media-replace="${esc(item.id)}">${t('جایگزینی فایل','Replace file')}</button><button class="hx-media-button hx-media-danger" type="button" data-media-delete="${esc(item.id)}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i>${t('حذف','Delete')}</button></div><p class="hx-media-detail-note">${t('جایگزینی، لینک فعلی را حفظ می‌کند. حذف فایل می‌تواند تصاویر استفاده‌شده در سایت را از دسترس خارج کند.','Replacing keeps the current link. Deleting a file can break images already used on your site.')}</p></div></div>`;
    controls();
  }
  async function copy(item){
    try{await navigator.clipboard.writeText(new URL(fileURL(item),location.origin).href);status('لینک فایل کپی شد.','File link copied.');}
    catch{state.selected=item.id;details(item);if(!$('mediaDetails').open)$('mediaDetails').showModal();status('کپی خودکار ممکن نبود؛ لینک را از جزئیات فایل کپی کنید.','Automatic copying failed. Copy the link from file details.',true);}
  }
  async function remove(item){
    if(!confirm(t(`«${item.fileName}» حذف شود؟ این فایل ممکن است در سایت استفاده شده باشد.`,`Delete “${item.fileName}”? This file may already be used on your site.`)))return;
    state.busy=true;controls();
    try{await request('/api/media/'+item.id,{method:'DELETE'});state.items=state.items.filter(value=>value.id!==item.id);$('mediaDetails').close();state.selected=null;status('فایل حذف شد.','File deleted.');render();}
    catch(error){status(errorText(error),errorText(error),true);}
    finally{state.busy=false;controls();}
  }
  async function replace(file){
    const item=state.items.find(value=>value.id===state.replace);if(!item||state.busy||state.loading||!state.authorized)return;
    const invalid=validate(file,item);if(invalid){status(invalid,invalid,true);return;}
    state.busy=true;controls();status('در حال جایگزینی فایل…','Replacing file…');
    try{const body=new FormData();body.append('file',file,file.name);await request('/api/media/'+item.id,{method:'PUT',body});await load();const updated=state.items.find(value=>value.id===item.id);if(updated&&$('mediaDetails').open)details(updated);status('فایل جایگزین شد؛ لینک قبلی حفظ شد.','File replaced. The original link was preserved.');}
    catch(error){status(errorText(error),errorText(error),true);}
    finally{state.busy=false;state.replace=null;$('mediaReplaceInput').value='';controls();}
  }
  function language(){
    $('mediaTitle').textContent=t('رسانه‌ها','Media');
    $('mediaSubtitle').textContent=t('کتابخانهٔ تصاویر و فایل‌های سایت','Your website’s image and file library');
    render();renderQueue();if(state.message)$('mediaStatus').textContent=t(state.message.fa,state.message.english);
    const item=state.items.find(value=>value.id===state.selected);if(item&&$('mediaDetails').open)details(item);
  }
  function setView(value){const view=value==='list'?'list':'grid';$('mediaGrid').dataset.view=view;document.querySelectorAll('[data-media-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mediaView===view)));localStorage.setItem('hexora-media-view',view);}
  function wire(){
    $('mediaLanguage').onclick=()=>{const value=en()?'fa':'en';localStorage.setItem('hexora-lang',value);document.documentElement.dir=value==='fa'?'rtl':'ltr';document.documentElement.lang=value;};
    $('mediaRefresh').onclick=load;$('mediaSearch').oninput=()=>{state.limit=24;render();};$('mediaFilter').onchange=$('mediaSort').onchange=()=>{state.limit=24;render();};
    $('mediaLoadMore').onclick=()=>{state.limit+=24;render();};$('mediaUpload').onclick=upload;
    $('mediaClearQueue').onclick=()=>{if(!state.busy&&!state.loading){state.queue=[];renderQueue();}};
    $('mediaFileInput').onchange=event=>addFiles(event.target.files);
    $('mediaReplaceInput').onchange=event=>{if(event.target.files?.[0])replace(event.target.files[0]);};
    const zone=$('mediaDropzone');zone.onclick=()=>{if(!state.busy&&!state.loading&&state.authorized)$('mediaFileInput').click();};
    zone.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();zone.click();}};
    let depth=0;
    zone.ondragenter=event=>{event.preventDefault();depth++;if(state.authorized&&!state.busy&&!state.loading)zone.classList.add('is-dragging');};
    zone.ondragover=event=>{event.preventDefault();event.dataTransfer.dropEffect=state.authorized&&!state.busy&&!state.loading?'copy':'none';};
    zone.ondragleave=event=>{event.preventDefault();if(--depth<=0){depth=0;zone.classList.remove('is-dragging');}};
    zone.ondrop=event=>{event.preventDefault();depth=0;zone.classList.remove('is-dragging');addFiles(event.dataTransfer.files);};
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-media-details],[data-media-copy],[data-media-delete],[data-media-replace],[data-media-close],[data-media-view],[data-queue-remove],[data-media-retry],[data-media-reset]');if(!button)return;
      const data=button.dataset;
      if('mediaClose' in data){$('mediaDetails').close();return;}
      if(data.mediaView){setView(data.mediaView);return;}
      if('mediaReset' in data){$('mediaSearch').value='';$('mediaFilter').value='all';state.limit=24;render();return;}
      if(state.busy||state.loading)return;
      if('mediaRetry' in data){state.authorized?load():authorize();return;}
      if(!state.authorized)return;
      if(data.queueRemove){state.queue=state.queue.filter(entry=>entry.id!==Number(data.queueRemove));renderQueue();return;}
      const item=state.items.find(value=>String(value.id)===(data.mediaDetails||data.mediaCopy||data.mediaDelete||data.mediaReplace));if(!item)return;
      if(data.mediaDetails){state.selected=item.id;details(item);if(!$('mediaDetails').open)$('mediaDetails').showModal();}
      else if(data.mediaCopy)copy(item);
      else if(data.mediaDelete)remove(item);
      else if(data.mediaReplace){state.replace=item.id;$('mediaReplaceInput').accept=item.type==='IMAGE'?'image/png,image/jpeg,image/gif,image/webp':'image/png,image/jpeg,image/gif,image/webp,application/pdf,.pdf';$('mediaReplaceInput').value='';$('mediaReplaceInput').click();}
    });
    $('mediaDetails').addEventListener('close',()=>{state.selected=null;state.replace=null;});
    $('mediaDetails').addEventListener('click',event=>{if(event.target!==$('mediaDetails'))return;const box=event.target.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.target.close();});
    document.addEventListener('error',event=>{if(event.target.matches?.('.hx-media-preview img,.hx-media-detail-preview img')){event.target.parentElement.innerHTML=`<span class="hx-media-file-icon"><i class="fa-regular fa-image" aria-hidden="true"></i><small>${t('پیش‌نمایش در دسترس نیست','Preview unavailable')}</small></span>`;}},true);
    $('logoutBtn').onclick=async()=>{try{await fetch('/api/auth/logout',{method:'POST'});}finally{localStorage.removeItem('accessToken');localStorage.removeItem('user');location.href='/login';}};
    setView(localStorage.getItem('hexora-media-view'));
    new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  async function authorize(){
    state.loading=true;render();controls();
    const lang=localStorage.getItem('hexora-lang')==='en'?'en':'fa';document.documentElement.dir=lang==='en'?'ltr':'rtl';document.documentElement.lang=lang;
    try{const user=await window.loadSession();if(!user?.roles?.includes('ADMIN')){location.href='/login';return;}state.authorized=true;state.loading=false;await load();}
    catch(error){state.loading=false;state.failed=true;render();status(errorText(error),errorText(error),true);}
    finally{controls();}
  }
  function start(){wire();authorize();}
  start();
})();
