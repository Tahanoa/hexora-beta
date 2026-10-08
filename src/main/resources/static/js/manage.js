(() => {
  const tr=value=>window.HexoraI18n.tr(value);
  const releaseLoader=window.holdPageLoader?.()||(()=>{});
  const section = window.HEXORA_SECTION;
  let currentLang = localStorage.getItem('hexora-lang') || 'fa';
  const titles = {testimonials:['نظرات کارفرمایان','Testimonials'],projects:['پروژه‌ها','Projects'],skills:['مهارت‌ها','Skills'],services:['خدمات','Services'],statistics:['آمارها','Statistics'],experience:['سوابق کاری','Experience'],contact:['پیام‌ها','Messages'],media:['رسانه‌ها','Media'],profile:['پروفایل','Profile']};
  const t = (fa,en) => currentLang === 'fa' ? fa : en;
  function applyLanguage(){ document.documentElement.lang=currentLang; document.documentElement.dir=currentLang==='fa'?'rtl':'ltr'; const pair=titles[section]||['مدیریت محتوا','Content management']; $('#heading').textContent=pair[currentLang==='fa'?0:1]; $('#subheading').textContent=t('مدیریت یکپارچه محتوا','Unified content management'); $('#refreshBtn').setAttribute('aria-label',t('تازه‌سازی','Refresh')); $('#manageLangText').textContent=currentLang==='fa'?'فارسی':'English'; }
  document.addEventListener('DOMContentLoaded',()=>{ $('#languageBtn')?.addEventListener('click',()=>{localStorage.setItem('hexora-lang',currentLang==='fa'?'en':'fa');location.reload();}); });
  const endpoint = {testimonials:'/api/testimonials',projects:'/api/projects', skills:'/api/skills', services:'/api/services', statistics:'/api/statistics', experience:'/api/experience', contact:'/api/contact', media:'/api/media', profile:'/api/profile'}[section];
  const meta = {
    testimonials:{title:t('نظرات کارفرمایان','Testimonials'),fields:[['authorName',t('نام کارفرما','Client name')],['role',t('سمت (اختیاری)','Role (optional)')],['company',t('شرکت (اختیاری)','Company (optional)')],['projectTitle',t('نام پروژه (اختیاری)','Project name (optional)')],['quote',t('متن بازخورد واقعی','Actual feedback'),'textarea'],['avatar',t('URL تصویر (اختیاری)','Image URL (optional)')],['sourceUrl',t('لینک منبع بازخورد (اختیاری)','Feedback source URL (optional)')],['rating',t('امتیاز ۱ تا ۵ (اختیاری)','Rating 1–5 (optional)'),'number'],['order',t('ترتیب نمایش','Display order'),'number'],['published',t('انتشار با اجازه کارفرما','Publish with client permission'),'checkbox']],columns:['authorName','company','published']},
    projects:{title:tr('پروژه‌ها'),fields:[['title',tr('عنوان')],['slug',tr('شناسه انگلیسی')],['shortDescription',tr('خلاصه')],['description',tr('توضیحات'),'textarea'],['demoUrl',tr('لینک دمو')],['githubUrl',tr('لینک گیت‌هاب')],['clientName',tr('نام مشتری')],['image',tr('تصویر پروژه / URL رسانه')],['projectDate',tr('تاریخ پروژه'),'datetime-local'],['status',tr('وضعیت'),'select:PLANNING,IN_PROGRESS,COMPLETED']],columns:['title','status']},
    skills:{title:tr('مهارت‌ها'),fields:[['name',tr('نام مهارت')],['category',tr('دسته‌بندی'),'select:FRONTEND,BACKEND,DATABASE,DEVOPS,TOOLS,OTHER'],['level',tr('سطح'),'number'],['icon',tr('آیکون')],['description',tr('توضیحات'),'textarea']],columns:['name','category','level']},
    services:{title:t('خدمات','Services'),fields:[['title',t('عنوان خدمت *','Service title *')],['slug',t('شناسه انگلیسی (اختیاری؛ خودکار)','English slug (optional; automatic)')],['shortDescription',t('معرفی کوتاه *','Short introduction *'),'textarea'],['description',t('توضیح کامل','Full description'),'textarea'],['cover',t('کاور خدمت','Service cover')],['icon',tr('آیکون')],['audience',t('مناسب چه کسانی است؟','Who is it for?'),'textarea'],['features',t('ویژگی‌ها','Features'),'list'],['deliverables',t('خروجی‌های قابل تحویل *','Deliverables *'),'list'],['scope',t('محدوده کار','Included scope'),'textarea'],['exclusions',t('موارد خارج از محدوده','Exclusions'),'textarea'],['duration',t('زمان تقریبی اجرا','Estimated duration')],['pricingMode',t('شیوه قیمت‌گذاری','Pricing mode'),'select:QUOTE,FROM,RANGE'],['priceLabel',t('مبلغ یا بازه هزینه (اختیاری)','Price or range (optional)')],['support',t('شرایط پشتیبانی','Support terms'),'textarea'],['revisions',t('تعداد و شرایط اصلاحات','Revision terms'),'textarea'],['relatedProjectIds',t('نمونه‌کارهای مرتبط','Related projects'),'projects'],['faqs',t('پرسش‌های متداول این خدمت','Service FAQs'),'faq'],['published',t('منتشر شود','Published'),'checkbox'],['featured',t('خدمت ویژه صفحه اصلی','Featured on homepage'),'checkbox'],['order',t('ترتیب نمایش','Display order'),'number']],columns:['title','published','featured','order']},
    statistics:{title:tr('آمارها'),fields:[['title',tr('عنوان')],['value',tr('مقدار')],['icon',tr('آیکون')],['order',tr('ترتیب'),'number']],columns:['title','value']},
    experience:{title:tr('سوابق کاری'),fields:[['company',tr('شرکت')],['position',tr('سمت')],['description',tr('توضیحات'),'textarea'],['startDate',tr('تاریخ شروع'),'date'],['endDate',tr('تاریخ پایان'),'date'],['isCurrent',tr('همچنان فعال است'),'checkbox']],columns:['company','position','startDate']},
    contact:{title:tr('پیام‌ها'),fields:[],columns:['name','email','message','isRead']},
    media:{title:tr('رسانه‌ها'),fields:[],columns:['fileName','contentType','size']},
    profile:{title:tr('پروفایل'),fields:[['fullName',tr('نام کامل')],['brandName',tr('نام برند')],['title',tr('عنوان')],['shortDescription',tr('معرفی کوتاه')],['email',tr('ایمیل')],['phone',tr('تلفن')],['workingStatus',tr('وضعیت همکاری'),'select:AVAILABLE,BUSY,NOT_AVAILABLE,REMOTE'],['bio',tr('زندگی‌نامه'),'textarea'],['aboutText',tr('درباره من'),'textarea'],['journeyText',tr('مسیر حرفه‌ای'),'textarea'],['location',tr('موقعیت')],['githubUrl',tr('گیت‌هاب')],['linkedinUrl',tr('لینکدین')],['instagramUrl',tr('اینستاگرام')],['profileImage',tr('URL تصویر')],['avatarId',tr('شناسه رسانه تصویر'),'number']],columns:['fullName','title','email','location']}
  }[section];
  let iconCatalog;
  function loadIcons() {
    if (!iconCatalog) iconCatalog = fetch('/data/fontawesome-icons.json').then(response => {
      if (!response.ok) throw Error(tr('دریافت فهرست آیکون‌ها ناموفق بود'));
      return response.json();
    }).then(data => data.icons).catch(error => { iconCatalog = null; throw error; });
    return iconCatalog;
  }
  const $ = selector => document.querySelector(selector);
  applyLanguage();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let editing = null;

  function setStatus(message,error=false){HexoraNotify.feedback(tr(message),error,{source:'status'});}
  function iconPickerHtml(value = '') {
    const current = String(value || '');
    return `<div class="field full icon-picker"><label>${esc(tr("آیکون انتخاب‌شده"))}</label><div class="icon-picker-row"><input name="icon" value="${esc(current)}" placeholder="${esc(tr("آیکون را از فهرست انتخاب کنید"))}" autocomplete="off"><span class="icon-preview" aria-label="${esc(tr("پیش‌نمایش آیکون"))}"><i class="${esc(current || 'fa-solid fa-code')}"></i></span></div><div class="icon-picker-row"><input class="icon-search" type="search" placeholder="${esc(tr("جست‌وجو: نام، برند یا کلمه مرتبط مانند user، java، heart"))}" aria-label="${esc(tr("جست‌وجوی آیکون"))}"><select class="icon-style" aria-label="${esc(tr("نوع آیکون"))}"><option value="">${esc(tr("همه انواع"))}</option value="solid">Solid</option><option value="regular">Regular</option><option value="brands">Brands</option></select></div><span class="icon-help" role="status">${esc(tr("در حال دریافت فهرست کامل آیکون‌ها..."))}</span><div class="icon-options"></div><div class="icon-pagination"><button class="btn icon-prev" type="button">${esc(tr("قبلی"))}</button><span class="icon-page"></span><button class="btn icon-next" type="button">${esc(tr("بعدی"))}</button></div></div>`;
  }

  const optionalProjectFields = new Set(['shortDescription','description','image','demoUrl','githubUrl','clientName','projectDate']);
  function fieldHtml([name,label,type='text'], value='') {
    label=tr(label);
    if(section==='projects'&&optionalProjectFields.has(name))label+=' '+t('(اختیاری)','(optional)');
    if(section==='testimonials'&&['authorName','quote'].includes(name))label+=' *';
    if(section==='services'&&type==='list')return `<div class="field full svc-editor-list" data-list="${name}"><label>${esc(label)}</label><div class="svc-editor-items">${serviceList(value).map(v=>serviceListRow(v)).join('')}</div><button class="btn" type="button" data-list-add>${t('افزودن مورد','Add item')}</button></div>`;
    if(section==='services'&&type==='faq')return `<div class="field full svc-editor-faq"><label>${esc(label)}</label><div class="svc-faq-items">${(Array.isArray(value)?value:[]).map(v=>serviceFaqRow(v)).join('')}</div><button class="btn" type="button" data-faq-add>${t('افزودن پرسش','Add question')}</button></div>`;
    if(section==='services'&&type==='projects')return `<div class="field full"><label>${esc(label)}</label><div id="serviceProjects" data-selected="${esc(JSON.stringify(value||[]))}" aria-live="polite">${t('در حال دریافت پروژه‌ها…','Loading projects…')}</div></div>`;
    if(section==='experience'&&type==='date')return window.HexoraJalali.html(name,label,value);
    if (name === 'icon') return iconPickerHtml(value);
    if((section==='projects'&&name==='image')||(section==='services'&&name==='cover'))return `<div class="field full project-image-field"><label>${label}</label><input name="${name}" value="${esc(value)}" placeholder="${t('URL تصویر یا انتخاب از رسانه‌ها','Image URL or choose from media')}"><div class="project-image-tools"><label class="btn" for="projectImageUpload">${t('آپلود تصویر','Upload image')}</label><input id="projectImageUpload" type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden><button type="button" class="btn" data-media-picker>${t('انتخاب از رسانه‌ها','Choose from media')}</button><button type="button" class="btn" data-clear-project-image>${t('حذف انتخاب','Clear selection')}</button></div><small>${t('PNG، JPEG، GIF یا WebP؛ حداکثر ۵ مگابایت','PNG, JPEG, GIF or WebP; max 5 MB')}</small><img class="project-image-preview" alt="${t('پیش‌نمایش کاور','Cover preview')}" hidden><span class="project-image-status" role="status"></span></div>`;
    if (type === 'checkbox') return `<label class="switch"><input name="${name}" type="checkbox" ${value ? 'checked' : ''}> ${label}</label>`;
    if (type.startsWith('select:')) return `<div class="field"><label>${label}</label><select name="${name}">${type.slice(7).split(',').map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${section==='services'?({QUOTE:t('پس از بررسی نیاز','After reviewing requirements'),FROM:t('شروع از','Starting from'),RANGE:t('بازه تقریبی','Estimated range')}[option]||option):tr(option)}</option>`).join('')}</select></div>`;
    return `<div class="field ${type === 'textarea' ? 'full' : ''}"><label>${label}</label><${type === 'textarea' ? 'textarea' : 'input'} name="${name}" type="${type === 'textarea' ? 'text' : type}" value="${type === 'textarea' ? '' : esc(value)}" ${(section==='testimonials'&&['authorName','quote'].includes(name))||(section==='services'&&name==='title')?'required':''} ${type === 'number' ? (name==='rating'?'min="1" max="5" step="1"':'min="0"') : ''}>${type === 'textarea' ? esc(value) : ''}</${type === 'textarea' ? 'textarea' : 'input'}></div>`;
  }
  function serviceList(value){if(Array.isArray(value))return value;try{const parsed=JSON.parse(value);if(Array.isArray(parsed))return parsed;}catch{}return String(value||'').split(/[,،\n]/).map(v=>v.trim()).filter(Boolean);}
  function serviceListRow(value=''){return `<div class="svc-editor-row"><input aria-label="${t('متن مورد','Item text')}" value="${esc(value)}" maxlength="1000"><button class="btn danger" type="button" data-remove-row aria-label="${t('حذف مورد','Remove item')}">×</button></div>`;}
  function serviceFaqRow(value={}){return `<div class="svc-editor-row svc-faq-row"><input data-question aria-label="${t('پرسش','Question')}" placeholder="${t('پرسش','Question')}" value="${esc(value.question)}" maxlength="500"><textarea data-answer aria-label="${t('پاسخ','Answer')}" placeholder="${t('پاسخ','Answer')}" maxlength="5000">${esc(value.answer)}</textarea><button class="btn danger" type="button" data-remove-row aria-label="${t('حذف پرسش','Remove question')}">×</button></div>`;}
  document.addEventListener('click',event=>{if(section!=='services')return;const add=event.target.closest('[data-list-add]'),faq=event.target.closest('[data-faq-add]'),remove=event.target.closest('[data-remove-row]');if(add){add.previousElementSibling.insertAdjacentHTML('beforeend',serviceListRow());add.previousElementSibling.lastElementChild.querySelector('input').focus();}if(faq){faq.previousElementSibling.insertAdjacentHTML('beforeend',serviceFaqRow());faq.previousElementSibling.lastElementChild.querySelector('input').focus();}if(remove)remove.closest('.svc-editor-row').remove();});
  async function serviceProjects(){const area=$('#serviceProjects');if(!area)return;try{const response=await fetch('/api/projects');const json=await response.json();if(!response.ok)throw Error(t('دریافت نمونه‌کارها ناموفق بود؛ دوباره تلاش کنید.','Unable to load projects. Please retry.'));if(!area.isConnected)return;const selected=JSON.parse(area.dataset.selected);area.innerHTML=(json.data||[]).map(x=>`<label class="svc-project-option"><input type="checkbox" data-related-project value="${x.id}" ${selected.includes(x.id)?'checked':''}>${esc(x.title)}</label>`).join('')||t('هنوز پروژه‌ای ثبت نشده است.','No projects yet.');area.dataset.ready='true';}catch(error){area.textContent='';HexoraNotify.feedback(error.message,true,{key:'service-projects'});const retry=document.createElement('button');retry.type='button';retry.className='btn';retry.textContent=t('تلاش دوباره','Retry');retry.onclick=serviceProjects;area.append(retry);}}
  function renderForm(item = {}) {
    const form=$('#editorForm');
    if(section==='services'){
      const groups=[[t('معرفی خدمت','Service introduction'),['title','slug','shortDescription','description','cover','icon','audience','features']],[t('تحویل و شرایط همکاری','Delivery and terms'),['deliverables','scope','exclusions','duration','pricingMode','priceLabel','support','revisions']],[t('نمونه‌کارها و پرسش‌ها','Projects and questions'),['relatedProjectIds','faqs']],[t('انتشار','Publishing'),['published','featured','order']]];
      form.innerHTML=groups.map(([title,names])=>`<fieldset class="svc-editor-group"><legend>${title}</legend>${names.map(name=>fieldHtml(meta.fields.find(f=>f[0]===name),item[name]??'')).join('')}</fieldset>`).join('');serviceProjects();
    }else form.innerHTML=meta.fields.map(field=>fieldHtml(field,item[field[0]])).join('');
    if(section==='experience')window.HexoraJalali.enhance(form);
    $('#saveBtn').textContent=editing?t('ویرایش','Update'):t('ذخیره','Save');updateProjectImagePreview();
  }
  function imageUrl(value){if(!value?.trim())return '';try{const url=new URL(value,location.origin);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}}
  function updateProjectImagePreview(){const field=$('.project-image-field');if(!field)return;const img=field.querySelector('img'),url=imageUrl(field.querySelector('[name="image"],[name="cover"]').value);img.hidden=!url;img.onerror=()=>{img.hidden=true;};if(url)img.src=url;else img.removeAttribute('src');}
  function selectProjectImage(url){const input=$('.project-image-field input[name]');if(input){input.value=url;updateProjectImagePreview();}}
  async function openMediaPicker(){
    const dialog=document.createElement('dialog');dialog.className='project-media-dialog';
    dialog.innerHTML=`<div class="media-picker-header"><h2>${t('انتخاب تصویر کاور','Choose cover image')}</h2><button type="button" class="btn" data-close>${t('بستن','Close')}</button></div><input type="search" class="media-picker-search" placeholder="${t('جست‌وجوی نام فایل','Search file name')}" aria-label="${t('جست‌وجوی رسانه','Search media')}"><div class="media-picker-grid" aria-live="polite">${t('در حال دریافت رسانه‌ها…','Loading media…')}</div>`;
    document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.showModal();
    const grid=dialog.querySelector('.media-picker-grid');
    try{const response=await fetch('/api/media/type/IMAGE');const json=await response.json();if(!response.ok)throw Error(json.message||t('دریافت رسانه‌ها ناموفق بود','Unable to load media'));const items=Array.isArray(json.data)?json.data:[];
      const render=()=>{const query=dialog.querySelector('input').value.trim().toLowerCase();grid.innerHTML=items.filter(x=>imageUrl(x.url)&&String(x.fileName).toLowerCase().includes(query)).map(x=>`<button type="button" class="media-picker-item" data-url="${esc(imageUrl(x.url))}" title="${esc(x.fileName)}"><img src="${esc(imageUrl(x.url))}" alt="" loading="lazy"><span>${esc(x.fileName)}</span></button>`).join('')||`<p>${t('تصویری یافت نشد. می‌توانید از فرم پروژه آپلود کنید.','No images found. Upload one from the project form.')}</p>`;};render();dialog.querySelector('input').oninput=render;grid.onclick=event=>{const button=event.target.closest('[data-url]');if(button){selectProjectImage(button.dataset.url);dialog.close();}};
    }catch(error){grid.textContent='';HexoraNotify.feedback(error.message,true,{key:'media-picker'});}
  }
  document.addEventListener('input',event=>{if(event.target.matches('.project-image-field input[name]'))updateProjectImagePreview();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-media-picker]'))openMediaPicker();if(event.target.closest('[data-clear-project-image]'))selectProjectImage('');});
  document.addEventListener('change',async event=>{
    if(event.target.id!=='projectImageUpload')return;const input=event.target,file=input.files?.[0];if(!file)return;
    const field=input.closest('.project-image-field'),status=field.querySelector('.project-image-status'),save=$('#saveBtn');
    if(!['image/png','image/jpeg','image/gif','image/webp'].includes(file.type)||file.size>5*1024*1024){status.hidden=true;HexoraNotify.feedback(t('تصویر معتبر تا ۵ مگابایت انتخاب کنید.','Choose a supported image up to 5 MB.'),false,{key:'project-cover',type:'warning'});input.value='';return;}
    const controls=[...field.querySelectorAll('input,button')];controls.forEach(el=>el.disabled=true);save.disabled=true;status.hidden=true;HexoraNotify.feedback(t('در حال آپلود…','Uploading…'),false,{key:'project-cover'});
    try{const body=new FormData();body.append('file',file,file.name);const response=await fetch('/api/media/upload/image',{method:'POST',body});const json=await response.json();if(!response.ok||!imageUrl(json.data?.url))throw Error(json.message||t('آپلود ناموفق بود','Upload failed'));if(!field.isConnected)return;field.querySelector('[name="image"],[name="cover"]').value=json.data.url;updateProjectImagePreview();HexoraNotify.feedback(t('تصویر آپلود شد؛ برای اتصال کاور، ذخیره را بزنید.','Image uploaded. Save to attach the cover.'),false,{key:'project-cover'});}
    catch(error){status.hidden=true;HexoraNotify.feedback(error.message,true,{key:'project-cover'});}finally{controls.forEach(el=>el.disabled=false);save.disabled=false;input.value='';}
  });
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
      help.textContent = t(`${results.length.toLocaleString('fa-IR')} نتیجه از ${all.length.toLocaleString('fa-IR')} آیکون`,`${results.length.toLocaleString('en-US')} results from ${all.length.toLocaleString('en-US')} icons`);
      options.innerHTML = results.slice(page * pageSize, (page + 1) * pageSize).map(icon => {
        const name = `fa-${icon.style} fa-${icon.name}`;
        return `<button type="button" class="icon-option ${name === input.value ? 'selected' : ''}" data-icon="${esc(name)}" title="${esc(icon.label)} (${icon.style})" aria-label="${esc(icon.label)} (${icon.style})" aria-pressed="${name === input.value}"><i class="${esc(name)}" aria-hidden="true"></i><small>${esc(icon.name)}</small></button>`;
      }).join('') || `<span class="icon-empty">${esc(tr("آیکونی یافت نشد."))}</span>`;
      prev.disabled = page === 0; next.disabled = page === pages - 1;
      picker.querySelector('.icon-page').textContent = `${(page + 1).toLocaleString(currentLang==='fa'?'fa-IR':'en-US')} / ${pages.toLocaleString(currentLang==='fa'?'fa-IR':'en-US')}`;
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
    catch (error) { if(picker.isConnected){help.hidden=true;HexoraNotify.feedback(error.message,true,{key:'icon-picker'});} }
  }
  function unwrap(json) { return json?.data ?? []; }
  async function load(path = endpoint) {
    setStatus(t('در حال دریافت اطلاعات...','Loading data...'));
    if(path===endpoint) $('#rows').innerHTML=Array.from({length:5},()=>'<tr class="skeleton-row"><td colspan="5"><div class="skeleton-block"></div></td></tr>').join('');
    try { const response = await fetch(typeof path==='string'?path:endpoint); if (!response.ok) throw Error(response.status === 403 ? tr('دسترسی مدیریت ندارید') : tr('دریافت اطلاعات ناموفق بود')); let data = unwrap(await response.json()); if (data?.content) data = data.content; renderRows(Array.isArray(data) ? data : []); setStatus(t(`${Array.isArray(data) ? data.length : 0} مورد بارگذاری شد`, `${Array.isArray(data) ? data.length : 0} items loaded`)); }
    catch (error) { setStatus(error.message, true); $('#rows').innerHTML = `<tr><td colspan="5" class="empty">${esc(error.message)}</td></tr>`; }
  }
  function renderRows(items) {
    $('#tableHead').innerHTML = meta.columns.map(column => `<th>${esc(tr(column))}</th>`).join('') + `<th>${esc(tr("عملیات"))}</th>`;
    $('#rows').innerHTML = items.length ? items.map(item => `<tr>${meta.columns.map(column => `<td>${column === 'message' ? `<span title="${esc(item[column])}">${esc(String(item[column] || '').slice(0, 70))}</span>` : column === 'published' ? `<span class="badge">${item.published?t('منتشرشده','Published'):t('پیش‌نویس','Draft')}</span>` : column === 'isRead' ? `<span class="badge">${item[column] ? tr('خوانده شده') : tr('جدید')}</span>` : column === 'icon' ? `<i class="${esc(item[column] || 'fa-solid fa-code')}"></i>` : section==='experience'&&column==='startDate'?esc(window.HexoraJalali.display(item[column])):column==='featured'?(item.featured?t('ویژه','Featured'):'—'):typeof item[column]==='boolean'?t(item[column]?'بله':'خیر',item[column]?'Yes':'No'):esc(['status','category'].includes(column)?tr(item[column]):item[column])}</td>`).join('')}<td class="actions">${section === 'contact' && !item.isRead ? `<button class="btn" data-read="${item.id}">${esc(tr("خوانده شد"))}</button>` : ''}${section==='contact'?`<button class="btn" data-detail='${esc(JSON.stringify(item))}'>${esc(tr("مشاهده کامل"))}</button>`:section==='media'?`<a class="btn" target="_blank" rel="noreferrer" href="${esc(item.url)}">${esc(tr("مشاهده"))}</a><button class="btn" data-replace="${item.id}">${esc(tr("جایگزینی فایل"))}</button><button class="btn" data-copy="${esc(item.url)}">${esc(tr("کپی URL"))}</button>`:`<button class="btn" data-edit='${esc(JSON.stringify(item))}'>${esc(tr("ویرایش"))}</button>`}<button class="btn danger" data-delete="${item.id}">${esc(tr("حذف"))}</button></td></tr>`).join('') : `<tr><td class="empty" colspan="5">${esc(tr("موردی ثبت نشده است"))}</td></tr>`;
  }
  async function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData($('#editorForm')));
    if(section==='services'){
      data.features=JSON.stringify([...document.querySelectorAll('[data-list="features"] .svc-editor-items input')].map(x=>x.value.trim()).filter(Boolean));
      data.deliverables=[...document.querySelectorAll('[data-list="deliverables"] .svc-editor-items input')].map(x=>x.value.trim()).filter(Boolean);
      data.faqs=[...document.querySelectorAll('.svc-faq-row')].map(row=>({question:row.querySelector('[data-question]').value.trim(),answer:row.querySelector('[data-answer]').value.trim()})).filter(x=>x.question||x.answer);
      if(data.faqs.some(x=>!x.question||!x.answer)){setStatus(t('هر پرسش باید پاسخ داشته باشد.','Each question needs an answer.'),true);return;}
      const projects=$('#serviceProjects');if(projects?.dataset.ready!=='true'){setStatus(t('ابتدا دریافت نمونه‌کارها را دوباره امتحان کنید.','Retry loading projects before saving.'),true);return;}
      data.relatedProjectIds=[...document.querySelectorAll('[data-related-project]:checked')].map(x=>Number(x.value));
      ['slug','cover','shortDescription','description','audience','scope','exclusions','duration','priceLabel','support','revisions'].forEach(name=>data[name]=data[name]?.trim()||null);
      if($('#editorForm [name="published"]').checked&&(!data.shortDescription||!data.deliverables.length)){setStatus(t('برای انتشار، معرفی کوتاه و حداقل یک خروجی تحویل وارد کنید.','Publishing requires an introduction and at least one deliverable.'),true);return;}
      if(data.cover){try{const coverUrl=new URL(data.cover,location.origin);if(coverUrl.origin===location.origin&&/^\/api\/media\/public\/[0-9]+$/.test(coverUrl.pathname))data.cover=coverUrl.pathname;}catch{}}
    }
    if(section==='testimonials')['role','company','projectTitle','avatar','sourceUrl'].forEach(name=>{data[name]=data[name]?.trim()||null;});
    if(section==='projects')optionalProjectFields.forEach(name=>{if(typeof data[name]==='string')data[name]=data[name].trim()||null;});
    if(section==='profile'&&editing){data.avatarId=data.avatarId===''?editing.avatarId:data.avatarId;}
    meta.fields.filter(field => field[2] === 'checkbox').forEach(field => data[field[0]] = $(`[name="${field[0]}"]`).checked);
    meta.fields.forEach(([name,label,type])=>{if(type==='number')data[name]=data[name]===''?null:Number(data[name]);if((type==='date'||type==='datetime-local')&&!data[name])data[name]=null;});
    if(section==='experience'&&data.startDate&&data.endDate&&data.endDate<data.startDate){setStatus(t('تاریخ پایان نباید پیش از شروع باشد.','End date cannot be before start date.'),true);return;}
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
    if($('#saveBtn').disabled)return;$('#saveBtn').disabled=true;
    try { const response = await fetch(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'} }); const json = await response.json().catch(() => ({})); if (!response.ok) throw Error(section==='services'&&json.errors&&typeof json.errors==='object'?Object.entries(json.errors).map(([key,value])=>`${key}: ${value}`).join(' · '):json.message||tr('ذخیره انجام نشد')); editing = null; renderForm(); bindIconPicker(); await load();setStatus(tr('با موفقیت ذخیره شد')); }
    catch (error) { setStatus(error.message, true); }
    finally{$('#saveBtn').disabled=false;}
  }
  document.addEventListener('click', async event => {
    try {
    const edit = event.target.closest('[data-edit]'), del = event.target.closest('[data-delete]'), read = event.target.closest('[data-read]');
    if (edit) { editing = JSON.parse(edit.dataset.edit); renderForm(editing); bindIconPicker(); scrollTo({top:0, behavior:'smooth'}); }
    if (del && await HexoraNotify.confirm(tr('این مورد حذف شود؟'))) { const response = await fetch(`${endpoint}/${del.dataset.delete}`, {method:'DELETE'}); if (response.ok) { await load();setStatus(tr('حذف شد')); } else setStatus(tr('حذف انجام نشد'), true); }
    if (read) { const response = await fetch(`${endpoint}/${read.dataset.read}/read`, {method:'PATCH'}); if(response.ok){await load();setStatus(tr('خوانده شد'));}else setStatus(tr('عملیات ناموفق بود'),true); }
    }catch(error){setStatus(error.message||tr('عملیات ناموفق بود'),true);}
  });
  const queries = {
    testimonials:[[t('همه','All'),''],[t('منتشرشده','Published'),'/public']],
    projects:[[tr('همه'),''],[tr('جست‌وجو'),'/public/search',['keyword']],[tr('وضعیت'),'/public/status/{status}',['status']],[tr('تکمیل‌شده'),'/public/completed'],[tr('آخرین پروژه‌ها'),'/public/recent',['limit']],[tr('بازه تاریخ'),'/public/date-range',['start','end']],[tr('آمار'),'/public/stats']],
    skills:[[tr('همه'),''],[tr('جست‌وجو'),'/public/search',['keyword']],[tr('دسته‌بندی'),'/public/category/{category}',['category']],[tr('مهارت‌های برتر'),'/public/top',['minLevel']],[tr('دسته‌ها'),'/public/categories'],[tr('آمار دسته‌ها'),'/public/categories/stats']],
    services:[[t('همه (شامل پیش‌نویس)','All including drafts'),''],[t('منتشرشده','Published'),'/public/active']],
    statistics:[[tr('همه'),''],[tr('عنوان'),'/public/title/{title}',['title']],[tr('مقادیر عددی'),'/public/numeric'],[tr('جمع'),'/public/sum']],
    experience:[[tr('همه'),''],[tr('سابقه فعلی'),'/public/current'],[tr('سوابق گذشته'),'/public/past'],[tr('شرکت'),'/public/company/{company}',['company']],[tr('بازه تاریخ'),'/public/date-range',['start','end']],[tr('سال‌های تجربه'),'/public/years']],
    profile:[[tr('همه'),''],[tr('جست‌وجو'),'/public/search',['keyword']],[tr('ایمیل'),'/public/email/{email}',['email']],[tr('برند'),'/public/brand/{brand}',['brand']]],
    contact:[[tr('همه'),''],[tr('خوانده‌نشده'),'/unread'],[tr('جست‌وجو'),'/search',['keyword','page','size']],[tr('صفحه‌بندی'),'/paged',['page','size']],[tr('ایمیل'),'/email/{email}',['email']],[tr('آمار'),'/stats']],
    media:[[tr('همه'),''],[tr('نوع فایل'),'/type/{type}',['type']],[tr('آخرین فایل‌ها'),'/recent',['limit']],[tr('آمار'),'/stats'],[tr('نام فایل'),'/public/name/{fileName}',['fileName']],[tr('اطلاعات فایل'),'/public/info/{id}',['id']],['Base64','/public/base64/{id}',['id']]]
  };
  function setupQueries(){
    const list=queries[section], panel=document.createElement('section');panel.className='panel';
    panel.innerHTML=`<h2>${esc(tr("جست‌وجو و گزارش"))}</h2><form id="queryForm" class="form-grid"><div class="field"><label>${esc(tr("نمایش"))}</label><select id="queryMode">`+list.map((q,i)=>`<option value="${i}">${q[0]}</option>`).join('')+`</select></div><div id="queryFields" class="form-grid"></div><button class="btn primary" type="submit">${esc(tr("اعمال"))}</button></form><pre id="queryResult" style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto"></pre>`;
    $('#editorPanel').before(panel);
    const fields=()=>{$('#queryFields').innerHTML=(list[Number($('#queryMode').value)][2]||[]).map(name=>section==='experience'&&['start','end'].includes(name)?window.HexoraJalali.html(name,tr(name)):`<div class="field"><label>${esc(tr(name))}</label><input name="${name}" required placeholder="${esc(tr(name))}"></div>`).join('');if(section==='experience')window.HexoraJalali.enhance($('#queryFields'));};
    $('#queryMode').onchange=fields;fields();
    $('#queryForm').onsubmit=async event=>{event.preventDefault();const q=list[Number($('#queryMode').value)],values=Object.fromEntries(new FormData(event.currentTarget));if(section==='experience'&&q[1].includes('date-range')&&(!values.start||!values.end||values.start>values.end)){setStatus(t('بازه تاریخ شمسی معتبر انتخاب کنید.','Choose a valid Solar Hijri date range.'),true);return;}let path=q[1];const params=new URLSearchParams();Object.entries(values).forEach(([key,value])=>{if(path.includes('{'+key+'}'))path=path.replace('{'+key+'}',encodeURIComponent(value));else params.set(key,value);});
      try{const r=await fetch(endpoint+path+(params.size?'?'+params:''));const j=await r.json();if(!r.ok)throw Error(j.message||tr('دریافت اطلاعات ناموفق بود'));const data=j.data;$('#queryResult').textContent='';if(Array.isArray(data)&&data.every(x=>typeof x==='object'))renderRows(data);else if(Array.isArray(data?.content))renderRows(data.content);else if(data&&typeof data==='object'&&data.id)renderRows([data]);else $('#queryResult').textContent=JSON.stringify(data,null,2);}
      catch(error){setStatus(error.message,true);}
    };
    if(section==='contact'){
      const button=document.createElement('button');button.className='btn';button.textContent=tr('علامت‌گذاری همه به‌عنوان خوانده‌شده');button.onclick=async()=>{try{const r=await fetch(endpoint+'/mark-all-read',{method:'PATCH'});if(!r.ok)throw Error(tr('عملیات انجام نشد'));await load();}catch(e){setStatus(e.message,true);}};panel.append(button);
      const cleanup=document.createElement('button');cleanup.className='btn danger';cleanup.textContent=tr('پاک‌سازی پیام‌های قدیمی');cleanup.onclick=async()=>{const days=await HexoraNotify.prompt(t('پیام‌های قدیمی‌تر از چند روز حذف شوند؟','Delete messages older than how many days?'),'90',{type:'number',min:1,step:1});if(!days||!Number.isInteger(Number(days))||Number(days)<1)return;if(!await HexoraNotify.confirm(tr('حذف پیام‌های قدیمی قابل بازگشت نیست. ادامه دهید؟')))return;try{const r=await fetch(endpoint+'/cleanup/'+days,{method:'DELETE'});if(!r.ok)throw Error(tr('پاک‌سازی انجام نشد'));await load();setStatus(t('پیام‌های قدیمی پاک شدند.','Old messages removed.'));}catch(e){setStatus(e.message,true);}};panel.append(cleanup);
    }
  }
  document.addEventListener('click',async event=>{
    const copy=event.target.closest('[data-copy]'),replace=event.target.closest('[data-replace]'),detail=event.target.closest('[data-detail]');
    if(detail){const item=JSON.parse(detail.dataset.detail);const dialog=document.createElement('dialog');dialog.innerHTML=`<pre style="white-space:pre-wrap"></pre><button type="button">${esc(tr("بستن"))}</button>`;dialog.querySelector('pre').textContent=Object.entries(item).map(([k,v])=>tr(k)+': '+v).join('\n');dialog.querySelector('button').onclick=()=>dialog.remove();document.body.append(dialog);dialog.showModal();}
    if(copy){try{await navigator.clipboard.writeText(new URL(copy.dataset.copy,location.origin).href);setStatus(tr('URL کپی شد'));}catch(e){setStatus(tr('کپی URL انجام نشد'),true);}}
    if(replace){const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/gif,image/webp,.pdf';input.onchange=async()=>{if(!input.files[0])return;const body=new FormData();body.append('file',input.files[0]);try{const r=await fetch(endpoint+'/'+replace.dataset.replace,{method:'PUT',body});if(!r.ok)throw Error(tr('جایگزینی انجام نشد'));await load();}catch(e){setStatus(e.message,true);}};input.click();}
  });

  $('#editorForm').addEventListener('submit', save);
  $('#mediaUploadForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget, file = $('#mediaFile').files[0], status = $('#mediaUploadStatus');
    if (!file) return; HexoraNotify.feedback(tr('در حال آپلود...'),false,{source:'mediaUploadStatus'});
    const body = new FormData(); body.append('file', file, file.name); body.append('type', $('#mediaType').value);
    try { const response = await fetch('/api/media/upload', {method:'POST', body}); const json = await response.json().catch(() => ({})); if (!response.ok) throw Error(json.message || tr('آپلود انجام نشد')); const media = json.data || {}; HexoraNotify.feedback(tr('آپلود شد'),false,{source:'mediaUploadStatus'}); form.reset(); await load(); }
    catch (error) { HexoraNotify.feedback(error.message,true,{source:'mediaUploadStatus'}); }
  });
  $('#cancelBtn').onclick = () => { editing = null; renderForm(); bindIconPicker(); setStatus(tr('فرم پاک شد')); };
  $('#refreshBtn').onclick = load;
  $('#logoutBtn').onclick = async () => { await fetch('/api/auth/logout', {method:'POST'}); localStorage.clear(); location = '/login'; };
  (async () => { const user = await loadSession(); if (!user || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) { location = '/login'; return; } applyLanguage(); renderForm(); bindIconPicker(); setupQueries(); if (section === 'contact') $('#editorPanel').style.display = 'none'; if (section === 'media') { $('#editorPanel').style.display = 'none'; $('#mediaUploadPanel').style.display = 'block'; } await load(); releaseLoader(); })().catch(error=>{setStatus(error.message,true);releaseLoader();});
})();
