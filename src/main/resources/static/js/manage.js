(() => {
  const section = window.HEXORA_SECTION;
  const endpoint = {projects:'/api/projects', skills:'/api/skills', services:'/api/services', statistics:'/api/statistics', experience:'/api/experience', contact:'/api/contact', media:'/api/media', profile:'/api/profile'}[section];
  const meta = {
    projects:{title:'پروژه‌ها',fields:[['title','عنوان'],['slug','شناسه انگلیسی'],['shortDescription','خلاصه'],['description','توضیحات','textarea'],['demoUrl','لینک دمو'],['githubUrl','لینک گیت‌هاب'],['clientName','نام مشتری'],['status','وضعیت','select:PLANNING,IN_PROGRESS,COMPLETED']],columns:['title','status']},
    skills:{title:'مهارت‌ها',fields:[['name','نام مهارت'],['category','دسته‌بندی','select:FRONTEND,BACKEND,DATABASE,DEVOPS,TOOLS,OTHER'],['level','سطح','number'],['icon','آیکون'],['description','توضیحات','textarea']],columns:['name','category','level']},
    services:{title:'خدمات',fields:[['title','عنوان'],['description','توضیحات','textarea'],['icon','آیکون'],['features','ویژگی‌ها','textarea'],['order','ترتیب','number']],columns:['title','order']},
    statistics:{title:'آمارها',fields:[['title','عنوان'],['value','مقدار'],['icon','آیکون'],['order','ترتیب','number']],columns:['title','value']},
    experience:{title:'سوابق کاری',fields:[['company','شرکت'],['position','سمت'],['description','توضیحات','textarea'],['startDate','تاریخ شروع','date'],['endDate','تاریخ پایان','date'],['isCurrent','همچنان فعال است','checkbox']],columns:['company','position','startDate']},
    contact:{title:'پیام‌ها',fields:[],columns:['name','email','message','isRead']},
    media:{title:'رسانه‌ها',fields:[],columns:['fileName','contentType','size']},
    profile:{title:'پروفایل',fields:[['fullName','نام کامل'],['brandName','نام برند'],['title','عنوان'],['shortDescription','معرفی کوتاه'],['bio','زندگی‌نامه','textarea'],['aboutText','درباره من','textarea'],['location','موقعیت'],['githubUrl','گیت‌هاب'],['linkedinUrl','لینکدین'],['instagramUrl','اینستاگرام']],columns:['fullName','title','location']}
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
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let editing = null;

  function setStatus(message, error = false) { $('#status').textContent = message; $('#status').className = `status ${error ? 'error' : 'ok'}`; }
  function iconPickerHtml(value = '') {
    const current = String(value || '');
    return `<div class="field full icon-picker"><label>آیکون انتخاب‌شده</label><div class="icon-picker-row"><input name="icon" value="${esc(current)}" placeholder="آیکون را از فهرست انتخاب کنید" autocomplete="off"><span class="icon-preview" aria-label="پیش‌نمایش آیکون"><i class="${esc(current || 'fa-solid fa-code')}"></i></span></div><div class="icon-picker-row"><input class="icon-search" type="search" placeholder="جست‌وجو: نام، برند یا کلمه مرتبط مانند user، java، heart" aria-label="جست‌وجوی آیکون"><select class="icon-style" aria-label="نوع آیکون"><option value="">همه انواع</option value="solid">Solid</option><option value="regular">Regular</option><option value="brands">Brands</option></select></div><span class="icon-help" role="status">در حال دریافت فهرست کامل آیکون‌ها...</span><div class="icon-options"></div><div class="icon-pagination"><button class="btn icon-prev" type="button">قبلی</button><span class="icon-page"></span><button class="btn icon-next" type="button">بعدی</button></div></div>`;
  }

  function fieldHtml([name,label,type='text'], value='') {
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
  async function load() {
    setStatus('در حال دریافت اطلاعات...');
    try { const response = await fetch(endpoint); if (!response.ok) throw Error(response.status === 403 ? 'دسترسی مدیریت ندارید' : 'دریافت اطلاعات ناموفق بود'); let data = unwrap(await response.json()); if (data?.content) data = data.content; renderRows(Array.isArray(data) ? data : []); setStatus(`${Array.isArray(data) ? data.length : 0} مورد بارگذاری شد`); }
    catch (error) { setStatus(error.message, true); $('#rows').innerHTML = `<tr><td colspan="5" class="empty">${esc(error.message)}</td></tr>`; }
  }
  function renderRows(items) {
    $('#tableHead').innerHTML = meta.columns.map(column => `<th>${esc(column)}</th>`).join('') + '<th>عملیات</th>';
    $('#rows').innerHTML = items.length ? items.map(item => `<tr>${meta.columns.map(column => `<td>${column === 'message' ? `<span title="${esc(item[column])}">${esc(String(item[column] || '').slice(0, 70))}</span>` : column === 'isRead' ? `<span class="badge">${item[column] ? 'خوانده شده' : 'جدید'}</span>` : column === 'icon' ? `<i class="${esc(item[column] || 'fa-solid fa-code')}"></i>` : esc(item[column])}</td>`).join('')}<td class="actions">${section === 'contact' && !item.isRead ? `<button class="btn" data-read="${item.id}">خوانده شد</button>` : ''}<button class="btn" data-edit='${esc(JSON.stringify(item))}'>ویرایش</button><button class="btn danger" data-delete="${item.id}">حذف</button></td></tr>`).join('') : '<tr><td class="empty" colspan="5">موردی ثبت نشده است</td></tr>';
  }
  async function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData($('#editorForm')));
    meta.fields.filter(field => field[2] === 'checkbox').forEach(field => data[field[0]] = $(`[name="${field[0]}"]`).checked);
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
  $('#editorForm').addEventListener('submit', save);
  $('#cancelBtn').onclick = () => { editing = null; renderForm(); bindIconPicker(); setStatus('فرم پاک شد'); };
  $('#refreshBtn').onclick = load;
  $('#logoutBtn').onclick = async () => { await fetch('/api/auth/logout', {method:'POST'}); localStorage.clear(); location = '/login'; };
  (async () => { const user = await loadSession(); if (!user || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) { location = '/login'; return; } $('#heading').textContent = meta.title; $('#subheading').textContent = `مدیریت امن ${meta.title} با JWT`; renderForm(); bindIconPicker(); if (section === 'contact' || section === 'media') $('#editorPanel').style.display = 'none'; load(); })();
})();
