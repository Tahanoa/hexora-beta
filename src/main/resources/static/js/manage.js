window.toggleSidebar = window.toggleSidebar || function(){ const sidebar=document.getElementById('sidebar'), overlay=document.getElementById('sidebarOverlay'); if(!sidebar)return; const open=!sidebar.classList.contains('open'); sidebar.classList.toggle('open',open); overlay?.classList.toggle('show',open); document.body.classList.toggle('sidebar-open',open&&window.innerWidth<1024); document.querySelectorAll('.sidebar-toggle').forEach(btn=>btn.setAttribute('aria-expanded',String(open))); };
(() => {
  const releaseLoader=window.holdPageLoader?.()||(()=>{});
  const section = window.HEXORA_SECTION;
  let currentLang = localStorage.getItem('hexora-lang') || 'fa';
  const titles = {projects:['پروژه‌ها','Projects'],skills:['مهارت‌ها','Skills'],services:['خدمات','Services'],statistics:['آمارها','Statistics'],experience:['سوابق کاری','Experience'],contact:['پیام‌ها','Messages'],media:['رسانه‌ها','Media'],profile:['پروفایل','Profile']};
  const t = (fa,en) => currentLang === 'fa' ? fa : en;
  function applyLanguage(){ document.documentElement.lang=currentLang; document.documentElement.dir=currentLang==='fa'?'rtl':'ltr'; const pair=titles[section]||['مدیریت محتوا','Content management']; $('#heading').textContent=pair[currentLang==='fa'?0:1]; $('#subheading').textContent=t('مدیریت یکپارچه محتوا','Unified content management'); $('#refreshBtn').textContent=t('تازه‌سازی','Refresh'); $('#languageBtn').textContent=currentLang==='fa'?'English':'فارسی'; }
  document.addEventListener('DOMContentLoaded',()=>{ $('#languageBtn')?.addEventListener('click',()=>{localStorage.setItem('hexora-lang',currentLang==='fa'?'en':'fa');location.reload();}); });
  const endpoint = {projects:'/api/projects', skills:'/api/skills', services:'/api/services', statistics:'/api/statistics', experience:'/api/experience', contact:'/api/contact', media:'/api/media', profile:'/api/profile'}[section];
  const meta = {
    projects:{title:'پروژه‌ها',fields:[['title','عنوان'],['slug','شناسه انگلیسی'],['shortDescription','خلاصه'],['description','توضیحات','textarea'],['demoUrl','لینک دمو'],['githubUrl','لینک گیت‌هاب'],['clientName','نام مشتری'],['image','تصویر پروژه / URL رسانه'],['projectDate','تاریخ پروژه','datetime-local'],['status','وضعیت','select:PLANNING,IN_PROGRESS,COMPLETED']],columns:['title','status']},
    skills:{title:'مهارت‌ها',fields:[['name','نام مهارت'],['category','دسته‌بندی','select:FRONTEND,BACKEND,DATABASE,DEVOPS,TOOLS,OTHER'],['level','سطح','number'],['icon','آیکون'],['description','توضیحات','textarea']],columns:['name','category','level']},
    services:{title:'خدمات',fields:[['title','عنوان'],['description','توضیحات','textarea'],['icon','آیکون'],['features','ویژگی‌ها','textarea'],['order','ترتیب','number']],columns:['title','order']},
    statistics:{title:'آمارها',fields:[['title','عنوان'],['value','مقدار'],['icon','آیکون'],['order','ترتیب','number']],columns:['title','value']},
    experience:{title:'سوابق کاری',fields:[['company','شرکت'],['position','سمت'],['description','توضیحات','textarea'],['startDate','تاریخ شروع','date'],['endDate','تاریخ پایان','date'],['isCurrent','همچنان فعال است','checkbox']],columns:['company','position','startDate']},
    contact:{title:'پیام‌ها',fields:[],columns:['name','email','message','isRead']},
    media:{title:'رسانه‌ها',fields:[],columns:['fileName','contentType','size']},
    profile:{title:'پروفایل',fields:[['fullName','نام کامل'],['brandName','نام برند'],['title','عنوان'],['shortDescription','معرفی کوتاه'],['email','ایمیل'],['phone','تلفن'],['workingStatus','وضعیت همکاری','select:AVAILABLE,BUSY,NOT_AVAILABLE,REMOTE'],['bio','زندگی‌نامه','textarea'],['aboutText','درباره من','textarea'],['journeyText','مسیر حرفه‌ای','textarea'],['location','موقعیت'],['githubUrl','گیت‌هاب'],['linkedinUrl','لینکدین'],['instagramUrl','اینستاگرام'],['profileImage','URL تصویر'],['avatarId','شناسه رسانه تصویر','number']],columns:['fullName','title','email','location']}
  }[section];
  let iconCatalog;
  function loadIcons() {
    if (!iconCatalog) iconCatalog = fetch('/data/fontawesome-icons.json').then(response => {
      if (!response.ok) throw Error('دریافت فهرست آیکون‌ها ناموفق بود');
      return response.json();
    }).then(data => data.icons).catch(error => { iconCatalog = null; throw error; });
    return iconCatalog;
  }
  const $ = selector => document.querySelector(selector);
  applyLanguage();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let editing = null;

  function setStatus(message, error = false) { $('#status').textContent = message; $('#status').className = `status ${error ? 'error' : 'ok'}`; }
  function iconPickerHtml(value = '') {
    const current = String(value || '');
    return `<div class="field full icon-picker"><label>آیکون انتخاب‌شده</label><div class="icon-picker-row"><input name="icon" value="${esc(current)}" placeholder="آیکون را از فهرست انتخاب کنید" autocomplete="off"><span class="icon-preview" aria-label="پیش‌نمایش آیکون"><i class="${esc(current || 'fa-solid fa-code')}"></i></span></div><div class="icon-picker-row"><input class="icon-search" type="search" placeholder="جست‌وجو: نام، برند یا کلمه مرتبط مانند user، java، heart" aria-label="جست‌وجوی آیکون"><select class="icon-style" aria-label="نوع آیکون"><option value="">همه انواع</option value="solid">Solid</option><option value="regular">Regular</option><option value="brands">Brands</option></select></div><span class="icon-help" role="status">در حال دریافت فهرست کامل آیکون‌ها...</span><div class="icon-options"></div><div class="icon-pagination"><button class="btn icon-prev" type="button">قبلی</button><span class="icon-page"></span><button class="btn icon-next" type="button">بعدی</button></div></div>`;
  }

  const optionalProjectFields = new Set(['shortDescription','description','image','demoUrl','githubUrl','clientName','projectDate']);
  function fieldHtml([name,label,type='text'], value='') {
    if(section==='projects'&&optionalProjectFields.has(name))label+=' '+t('(اختیاری)','(optional)');
    if (name === 'icon') return iconPickerHtml(value);
    if (type === 'checkbox') return `<label class="switch"><input name="${name}" type="checkbox" ${value ? 'checked' : ''}> ${label}</label>`;
    if (type.startsWith('select:')) return `<div class="field"><label>${label}</label><select name="${name}">${type.slice(7).split(',').map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select></div>`;
    return `<div class="field ${type === 'textarea' ? 'full' : ''}"><label>${label}</label><${type === 'textarea' ? 'textarea' : 'input'} name="${name}" type="${type === 'textarea' ? 'text' : type}" value="${type === 'textarea' ? '' : esc(value)}" ${type === 'number' ? 'min="0"' : ''}>${type === 'textarea' ? esc(value) : ''}</${type === 'textarea' ? 'textarea' : 'input'}></div>`;
  }
  function renderForm(item = {}) { $('#editorForm').innerHTML = meta.fields.map(field => fieldHtml(field, item[field[0]])).join(''); $('#saveBtn').textContent = editing ? 'ویرایش' : 'ذخیره'; }
  async function bindIconPicker() {
    const picker = $('.icon-picker'); if (!picker) return;
    const input = picker.querySelector('[name="icon"]'), preview = picker.querySelector('.icon-preview i');
    const search = picker.querySelector('.icon-search'), style = picker.querySelector('.icon-style');
    const options = picker.querySelector('.icon-options'), help = picker.querySelector('.icon-help');
    const prev = picker.querySelector('.icon-prev'), next = picker.querySelector('.icon-next');
    let all = [], page = 0;
    const pageSize = 80;
    function render() {
      const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const results = all.filter(icon => (!style.value || icon.style === style.value) && words.every(word =>
        [icon.name, icon.label, ...icon.terms].join(' ').toLowerCase().includes(word)));
      const pages = Math.max(1, Math.ceil(results.length / pageSize));
      page = Math.min(page, pages - 1);
      help.textContent = `${results.length.toLocaleString('fa-IR')} نتیجه از ${all.length.toLocaleString('fa-IR')} آیکون`;
      options.innerHTML = results.slice(page * pageSize, (page + 1) * pageSize).map(icon => {
        const name = `fa-${icon.style} fa-${icon.name}`;
        return `<button type="button" class="icon-option ${name === input.value ? 'selected' : ''}" data-icon="${esc(name)}" title="${esc(icon.label)} (${icon.style})" aria-label="${esc(icon.label)} (${icon.style})" aria-pressed="${name === input.value}"><i class="${esc(name)}" aria-hidden="true"></i><small>${esc(icon.name)}</small></button>`;
      }).join('') || '<span class="icon-empty">آیکونی یافت نشد.</span>';
      prev.disabled = page === 0; next.disabled = page === pages - 1;
      picker.querySelector('.icon-page').textContent = `${page + 1} / ${pages}`;
    }
    options.addEventListener('click', event => {
      const button = event.target.closest('[data-icon]'); if (!button) return;
      input.value = button.dataset.icon; preview.className = input.value; render();
    });
    input.addEventListener('input', () => { preview.className = input.value || 'fa-solid fa-code'; render(); });
    search.addEventListener('input', () => { page = 0; render(); });
    style.addEventListener('change', () => { page = 0; render(); });
    prev.onclick = () => { page--; render(); options.scrollTop = 0; };
    next.onclick = () => { page++; render(); options.scrollTop = 0; };
    prev.disabled = next.disabled = true;
    try { all = await loadIcons(); if (picker.isConnected) render(); }
    catch (error) { if (picker.isConnected) help.textContent = error.message; }
  }
  function unwrap(json) { return json?.data ?? []; }
  async function load(path = endpoint) {
    setStatus(t('در حال دریافت اطلاعات...','Loading data...'));
    if(path===endpoint) $('#rows').innerHTML=Array.from({length:5},()=>'<tr class="skeleton-row"><td colspan="5"><div class="skeleton-block"></div></td></tr>').join('');
    try { const response = await fetch(typeof path==='string'?path:endpoint); if (!response.ok) throw Error(response.status === 403 ? 'دسترسی مدیریت ندارید' : 'دریافت اطلاعات ناموفق بود'); let data = unwrap(await response.json()); if (data?.content) data = data.content; renderRows(Array.isArray(data) ? data : []); setStatus(t(`${Array.isArray(data) ? data.length : 0} مورد بارگذاری شد`, `${Array.isArray(data) ? data.length : 0} items loaded`)); }
    catch (error) { setStatus(error.message, true); $('#rows').innerHTML = `<tr><td colspan="5" class="empty">${esc(error.message)}</td></tr>`; }
  }
  function renderRows(items) {
    $('#tableHead').innerHTML = meta.columns.map(column => `<th>${esc(column)}</th>`).join('') + '<th>عملیات</th>';
    $('#rows').innerHTML = items.length ? items.map(item => `<tr>${meta.columns.map(column => `<td>${column === 'message' ? `<span title="${esc(item[column])}">${esc(String(item[column] || '').slice(0, 70))}</span>` : column === 'isRead' ? `<span class="badge">${item[column] ? 'خوانده شده' : 'جدید'}</span>` : column === 'icon' ? `<i class="${esc(item[column] || 'fa-solid fa-code')}"></i>` : esc(item[column])}</td>`).join('')}<td class="actions">${section === 'contact' && !item.isRead ? `<button class="btn" data-read="${item.id}">خوانده شد</button>` : ''}${section==='contact'?`<button class="btn" data-detail='${esc(JSON.stringify(item))}'>مشاهده کامل</button>`:section==='media'?`<a class="btn" target="_blank" rel="noreferrer" href="${esc(item.url)}">مشاهده</a><button class="btn" data-replace="${item.id}">جایگزینی فایل</button><button class="btn" data-copy="${esc(item.url)}">کپی URL</button>`:`<button class="btn" data-edit='${esc(JSON.stringify(item))}'>ویرایش</button>`}<button class="btn danger" data-delete="${item.id}">حذف</button></td></tr>`).join('') : '<tr><td class="empty" colspan="5">موردی ثبت نشده است</td></tr>';
  }
  async function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData($('#editorForm')));
    if(section==='projects')optionalProjectFields.forEach(name=>{if(typeof data[name]==='string')data[name]=data[name].trim()||null;});
    if(section==='profile'&&editing){data.avatarId=data.avatarId===''?editing.avatarId:data.avatarId;}
    meta.fields.filter(field => field[2] === 'checkbox').forEach(field => data[field[0]] = $(`[name="${field[0]}"]`).checked);
    meta.fields.forEach(([name,label,type])=>{if(type==='number')data[name]=data[name]===''?null:Number(data[name]);if((type==='date'||type==='datetime-local')&&!data[name])data[name]=null;});
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
    try { const response = await fetch(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'} }); const json = await response.json().catch(() => ({})); if (!response.ok) throw Error(json.message || 'ذخیره انجام نشد'); setStatus('با موفقیت ذخیره شد'); editing = null; renderForm(); bindIconPicker(); await load(); }
    catch (error) { setStatus(error.message, true); }
  }
  document.addEventListener('click', async event => {
    const edit = event.target.closest('[data-edit]'), del = event.target.closest('[data-delete]'), read = event.target.closest('[data-read]');
    if (edit) { editing = JSON.parse(edit.dataset.edit); renderForm(editing); bindIconPicker(); scrollTo({top:0, behavior:'smooth'}); }
    if (del && confirm('این مورد حذف شود؟')) { const response = await fetch(`${endpoint}/${del.dataset.delete}`, {method:'DELETE'}); if (response.ok) { setStatus('حذف شد'); load(); } else setStatus('حذف انجام نشد', true); }
    if (read) { const response = await fetch(`${endpoint}/${read.dataset.read}/read`, {method:'PATCH'}); if (response.ok) load(); }
  });
  const queries = {
    projects:[['همه',''],['جست‌وجو','/public/search',['keyword']],['وضعیت','/public/status/{status}',['status']],['تکمیل‌شده','/public/completed'],['آخرین پروژه‌ها','/public/recent',['limit']],['بازه تاریخ','/public/date-range',['start','end']],['آمار','/public/stats']],
    skills:[['همه',''],['جست‌وجو','/public/search',['keyword']],['دسته‌بندی','/public/category/{category}',['category']],['مهارت‌های برتر','/public/top',['minLevel']],['دسته‌ها','/public/categories'],['آمار دسته‌ها','/public/categories/stats']],
    services:[['همه',''],['فعال','/public/active'],['عنوان','/public/title/{title}',['title']]],
    statistics:[['همه',''],['عنوان','/public/title/{title}',['title']],['مقادیر عددی','/public/numeric'],['جمع','/public/sum']],
    experience:[['همه',''],['سابقه فعلی','/public/current'],['سوابق گذشته','/public/past'],['شرکت','/public/company/{company}',['company']],['بازه تاریخ','/public/date-range',['start','end']],['سال‌های تجربه','/public/years']],
    profile:[['همه',''],['جست‌وجو','/public/search',['keyword']],['ایمیل','/public/email/{email}',['email']],['برند','/public/brand/{brand}',['brand']]],
    contact:[['همه',''],['خوانده‌نشده','/unread'],['جست‌وجو','/search',['keyword','page','size']],['صفحه‌بندی','/paged',['page','size']],['ایمیل','/email/{email}',['email']],['آمار','/stats']],
    media:[['همه',''],['نوع فایل','/type/{type}',['type']],['آخرین فایل‌ها','/recent',['limit']],['آمار','/stats'],['نام فایل','/public/name/{fileName}',['fileName']],['اطلاعات فایل','/public/info/{id}',['id']],['Base64','/public/base64/{id}',['id']]]
  };
  function setupQueries(){
    const list=queries[section], panel=document.createElement('section');panel.className='panel';
    panel.innerHTML='<h2>جست‌وجو و گزارش</h2><form id="queryForm" class="form-grid"><div class="field"><label>نمایش</label><select id="queryMode">'+list.map((q,i)=>`<option value="${i}">${q[0]}</option>`).join('')+'</select></div><div id="queryFields" class="form-grid"></div><button class="btn primary" type="submit">اعمال</button></form><pre id="queryResult" style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto"></pre>';
    $('#editorPanel').before(panel);
    const fields=()=>{$('#queryFields').innerHTML=(list[Number($('#queryMode').value)][2]||[]).map(name=>`<div class="field"><label>${esc(name)}</label><input name="${name}" required placeholder="${esc(name)}"></div>`).join('');};
    $('#queryMode').onchange=fields;fields();
    $('#queryForm').onsubmit=async event=>{event.preventDefault();const q=list[Number($('#queryMode').value)],values=Object.fromEntries(new FormData(event.currentTarget));let path=q[1];const params=new URLSearchParams();Object.entries(values).forEach(([key,value])=>{if(path.includes('{'+key+'}'))path=path.replace('{'+key+'}',encodeURIComponent(value));else params.set(key,value);});
      try{const r=await fetch(endpoint+path+(params.size?'?'+params:''));const j=await r.json();if(!r.ok)throw Error(j.message||'دریافت اطلاعات ناموفق بود');const data=j.data;$('#queryResult').textContent='';if(Array.isArray(data)&&data.every(x=>typeof x==='object'))renderRows(data);else if(Array.isArray(data?.content))renderRows(data.content);else if(data&&typeof data==='object'&&data.id)renderRows([data]);else $('#queryResult').textContent=JSON.stringify(data,null,2);}
      catch(error){setStatus(error.message,true);}
    };
    if(section==='contact'){
      const button=document.createElement('button');button.className='btn';button.textContent='علامت‌گذاری همه به‌عنوان خوانده‌شده';button.onclick=async()=>{try{const r=await fetch(endpoint+'/mark-all-read',{method:'PATCH'});if(!r.ok)throw Error('عملیات انجام نشد');await load();}catch(e){setStatus(e.message,true);}};panel.append(button);
      const cleanup=document.createElement('button');cleanup.className='btn danger';cleanup.textContent='پاک‌سازی پیام‌های قدیمی';cleanup.onclick=async()=>{const days=prompt('پیام‌های قدیمی‌تر از چند روز حذف شوند؟','90');if(!days||!Number.isInteger(Number(days))||Number(days)<1)return;if(!confirm('حذف پیام‌های قدیمی قابل بازگشت نیست. ادامه دهید؟'))return;try{const r=await fetch(endpoint+'/cleanup/'+days,{method:'DELETE'});if(!r.ok)throw Error('پاک‌سازی انجام نشد');await load();}catch(e){setStatus(e.message,true);}};panel.append(cleanup);
    }
  }
  document.addEventListener('click',async event=>{
    const copy=event.target.closest('[data-copy]'),replace=event.target.closest('[data-replace]'),detail=event.target.closest('[data-detail]');
    if(detail){const item=JSON.parse(detail.dataset.detail);const dialog=document.createElement('dialog');dialog.innerHTML='<pre style="white-space:pre-wrap"></pre><button type="button">بستن</button>';dialog.querySelector('pre').textContent=Object.entries(item).map(([k,v])=>k+': '+v).join('\n');dialog.querySelector('button').onclick=()=>dialog.remove();document.body.append(dialog);dialog.showModal();}
    if(copy){try{await navigator.clipboard.writeText(new URL(copy.dataset.copy,location.origin).href);setStatus('URL کپی شد');}catch(e){setStatus('کپی URL انجام نشد',true);}}
    if(replace){const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/gif,image/webp,.pdf';input.onchange=async()=>{if(!input.files[0])return;const body=new FormData();body.append('file',input.files[0]);try{const r=await fetch(endpoint+'/'+replace.dataset.replace,{method:'PUT',body});if(!r.ok)throw Error('جایگزینی انجام نشد');await load();}catch(e){setStatus(e.message,true);}};input.click();}
  });

  $('#editorForm').addEventListener('submit', save);
  $('#mediaUploadForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget, file = $('#mediaFile').files[0], status = $('#mediaUploadStatus');
    if (!file) return; status.textContent = 'در حال آپلود...';
    const body = new FormData(); body.append('file', file, file.name); body.append('type', $('#mediaType').value);
    try { const response = await fetch('/api/media/upload', {method:'POST', body}); const json = await response.json().catch(() => ({})); if (!response.ok) throw Error(json.message || 'آپلود انجام نشد'); const media = json.data || {}; status.innerHTML = `آپلود شد: <a href="${esc(media.url)}" target="_blank" rel="noreferrer">مشاهده فایل</a>`; status.className = 'status ok'; form.reset(); await load(); }
    catch (error) { status.textContent = error.message; status.className = 'status error'; }
  });
  $('#cancelBtn').onclick = () => { editing = null; renderForm(); bindIconPicker(); setStatus('فرم پاک شد'); };
  $('#refreshBtn').onclick = load;
  $('#logoutBtn').onclick = async () => { await fetch('/api/auth/logout', {method:'POST'}); localStorage.clear(); location = '/login'; };
  (async () => { const user = await loadSession(); if (!user || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) { location = '/login'; return; } $('#heading').textContent = meta.title; $('#subheading').textContent = `مدیریت امن ${meta.title} با JWT`; renderForm(); bindIconPicker(); setupQueries(); if (section === 'contact') $('#editorPanel').style.display = 'none'; if (section === 'media') { $('#editorPanel').style.display = 'none'; $('#mediaUploadPanel').style.display = 'block'; } await load(); releaseLoader(); })().catch(error=>{setStatus(error.message,true);releaseLoader();});
})();
