/* Standalone /projects presentation; does not mount the shared homepage carousel. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const u = new URL(value, location.origin); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
  };
  const texts = {
    fa: {count:'پروژه',of:'از',empty:'پروژه‌ای با این جست‌وجو یا فیلتر پیدا نشد.',noProjects:'هنوز پروژه‌ای منتشر نشده است.',error:'دریافت پروژه‌ها ناموفق بود. دوباره تلاش کنید.',loading:'در حال دریافت پروژه‌ها…',details:'بررسی پروژه',demo:'مشاهده دمو',image:'نمایش تصویر',client:'کارفرما',year:'سال',retry:'تلاش دوباره',search:'جست‌وجوی پروژه...',close:'بستن تصویر'},
    en: {count:'projects',of:'of',empty:'No projects match your search or filter.',noProjects:'No projects have been published yet.',error:'Could not load projects. Please try again.',loading:'Loading projects…',details:'Explore project',demo:'Live demo',image:'View image',client:'Client',year:'Year',retry:'Try again',search:'Search projects...',close:'Close image'}
  };
  const statuses = {
    COMPLETED:['تکمیل‌شده','Completed'],IN_PROGRESS:['در حال انجام','In progress'],PLANNING:['برنامه‌ریزی','Planning'],ON_HOLD:['متوقف‌شده','On hold'],CANCELLED:['لغوشده','Cancelled']
  };
  let projects = [], activeFilter = 'ALL', loading = false, failed = false;
  const english = () => document.documentElement.lang === 'en';
  const t = () => texts[english() ? 'en' : 'fa'];
  const number = n => Number(n).toLocaleString(english() ? 'en-US' : 'fa-IR');
  const placeholder = () => '<div class="hx-cases-placeholder"><img src="/images/logo.png" alt=""></div>';
  const filters = [...document.querySelectorAll('[data-case-filter]')];
  function message(text, retry = false) {
    $('caseMessage').hidden = !text;
    $('caseMessageText').hidden=true;HexoraNotify.feedback(text,retry,{key:'project-catalog'});
    $('caseRetry').hidden = !retry;
    $('caseRetry').textContent = t().retry;
  }
  function card(project) {
    const image = safeUrl(project.image), demo = safeUrl(project.demoUrl), github = safeUrl(project.githubUrl);
    const details = '/projects/' + encodeURIComponent(project.slug || project.id);
    const title = esc(project.title);
    const status = statuses[project.status]?.[english() ? 1 : 0] || project.status || '';
    const description = String(project.shortDescription || project.description || '').trim();
    const excerpt = project.shortDescription ? description : description.slice(0, 360) + (description.length > 360 ? '…' : '');
    const date = project.projectDate ? new Date(project.projectDate) : null;
    const year = date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(english() ? 'en-US' : 'fa-IR', {year:'numeric'}).format(date) : '';
    return `<article class="hx-cases-row" aria-labelledby="case-title-${project.index}">
      <figure class="hx-cases-visual">${image ? `<button type="button" class="hx-cases-preview" data-case-image="${project.index}" aria-label="${esc(t().image + ': ' + project.title)}"><img src="${esc(image)}" alt="${title}" loading="${project.index === 0 ? 'eager' : 'lazy'}" decoding="async"><span class="hx-cases-zoom"><i class="fa-solid fa-expand" aria-hidden="true"></i>${t().image}</span></button>` : placeholder()}</figure>
      <div class="hx-cases-copy">
        <div class="hx-cases-meta"><span class="hx-cases-number" aria-hidden="true">${String(project.index + 1).padStart(2,'0')} /</span><span class="hx-cases-status" data-status="${esc(project.status)}">${esc(status)}</span></div>
        <h2 id="case-title-${project.index}"><a class="hx-cases-title" href="${details}">${title}</a></h2>
        ${excerpt ? `<p class="hx-cases-description">${esc(excerpt)}</p>` : ''}
        ${project.clientName || year ? `<dl class="hx-cases-facts">${project.clientName ? `<div><dt>${t().client}</dt><dd>${esc(project.clientName)}</dd></div>` : ''}${year ? `<div><dt>${t().year}</dt><dd>${esc(year)}</dd></div>` : ''}</dl>` : ''}
        <div class="hx-cases-actions"><a href="${details}">${t().details}<i class="fa-solid fa-arrow-left" aria-hidden="true"></i></a>${demo ? `<a href="${esc(demo)}" target="_blank" rel="noopener noreferrer">${t().demo}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}${github ? `<a href="${esc(github)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub</a>` : ''}</div>
      </div>
    </article>`;
  }
  function render() {
    if (loading) { $('caseCount').textContent = t().loading; return; }
    if (failed) { $('caseList').innerHTML = ''; $('caseCount').textContent = ''; message(t().error, true); return; }
    const query = $('caseSearch').value.trim().toLocaleLowerCase();
    const visible = projects.filter(p => (activeFilter === 'ALL' || p.status === activeFilter) && (!query || [p.title,p.shortDescription,p.description,p.clientName].join(' ').toLocaleLowerCase().includes(query)));
    $('caseList').innerHTML = visible.map(card).join('');
    $('caseCount').textContent = `${number(visible.length)} ${t().of} ${number(projects.length)} ${t().count}`;
    message(visible.length ? '' : projects.length ? t().empty : t().noProjects);
    $('caseList').querySelectorAll('.hx-cases-preview img').forEach(img => img.addEventListener('error', () => {
      img.closest('.hx-cases-visual').innerHTML = placeholder();
    }, {once:true}));
  }
  async function loadProjects() {
    if (loading) return;
    loading = true; failed = false; message('');
    $('caseList').setAttribute('aria-busy','true'); $('caseRetry').disabled = true; render();
    const release = window.holdPageLoader?.() || (() => {});
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/projects/public', {signal:controller.signal});
      if (!response.ok) throw new Error('Projects request failed');
      const json = await response.json(), data = json.data ?? json;
      const list = Array.isArray(data) ? data : data?.content;
      if (!Array.isArray(list)) throw new Error('Unexpected projects response');
      projects = list.filter(p => p && (p.slug || p.id != null)).map((p,index) => ({...p,index}));
    } catch { failed = true; }
    finally { clearTimeout(timeout); loading = false; $('caseList').setAttribute('aria-busy','false'); $('caseRetry').disabled = false; render(); release(); }
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.caseFilter;
    filters.forEach(item => { const active = item === button; item.classList.toggle('is-active',active); item.setAttribute('aria-pressed',String(active)); });
    render();
  }));
  $('caseSearch').addEventListener('input',render);
  $('caseRetry').addEventListener('click',loadProjects);
  const preview = $('casePreview');
  $('caseList').addEventListener('click',event => {
    const button = event.target.closest('[data-case-image]');
    if (!button) return;
    const project = projects.find(p => p.index === Number(button.dataset.caseImage));
    const image = safeUrl(project?.image); if (!image) return;
    $('casePreviewTitle').textContent = project.title || '';
    $('casePreviewImage').src = image; $('casePreviewImage').alt = project.title || '';
    preview.showModal();
  });
  $('casePreviewClose').addEventListener('click',() => preview.close());
  preview.addEventListener('click',event => { if (event.target === preview) { const rect = preview.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) preview.close(); } });
  preview.addEventListener('close',() => $('casePreviewImage').removeAttribute('src'));
  new MutationObserver(() => {
    const en = english();
    document.querySelectorAll('[data-en]').forEach(el => { el.dataset.fa ??= el.textContent; el.textContent = en ? el.dataset.en : el.dataset.fa; });
    $('caseSearch').placeholder = t().search; $('casePreviewClose').setAttribute('aria-label',t().close);
    document.title = en ? 'Work | Hexora' : 'نمونه‌کارها | Hexora'; render();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  loadProjects();

})();
