/* Shared presentation/accessibility helpers. Never stores credentials or attachments. */
(() => {
  'use strict';
  const root = document.documentElement;
  const en = () => root.lang === 'en';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const text = pair => `<span data-ux-fa="${esc(pair[0])}" data-ux-en="${esc(pair[1])}">${esc(pair[en() ? 1 : 0])}</span>`;
  const state = ({ title, message, href, action, retry = false, error = false }) => `<section class="ux-state${error ? ' ux-state-error' : ''}" role="${error ? 'alert' : 'status'}"><h2>${text(title)}</h2>${message ? `<p>${text(message)}</p>` : ''}<div class="ux-state-actions">${href && /^\/(?!\/)|^#[A-Za-z]/.test(href) ? `<a class="ux-button" href="${esc(href)}">${text(action || ['ادامه','Continue'])}</a>` : ''}${retry ? `<button type="button" class="ux-button" data-ux-retry${retry === 'reload' ? ' data-ux-reload' : ''}>${text(['تلاش دوباره','Try again'])}</button>` : ''}</div></section>`;
  function skeleton(target, count = 3) {
    if (!target) return;
    target.setAttribute('aria-busy', 'true');
    target.innerHTML = `<div class="ux-skeleton-grid" role="status" aria-label="${en() ? 'Loading content' : 'در حال دریافت محتوا'}">${Array.from({ length: count }, () => '<div class="ux-skeleton" aria-hidden="true"><i></i><i></i><i></i></div>').join('')}</div>`;
  }
  const prefix = 'hexora-draft-v1:';
  const bindings = new WeakMap();
  const user = () => { try { const value = JSON.parse(localStorage.getItem('user') || 'null'); return value?.id ?? value?.username ?? null; } catch { return null; } };
  const key = (scope, owner) => owner == null ? null : prefix + encodeURIComponent(String(owner)) + ':' + encodeURIComponent(scope);
  function read(scope, owner = user()) {
    try {
      const k = key(scope, owner); if (!k) return null;
      const value = JSON.parse(sessionStorage.getItem(k) || 'null');
      if (!value || typeof value.time !== 'number' || Date.now() - value.time > 86400000) { sessionStorage.removeItem(k); return null; }
      return value.value;
    } catch { return null; }
  }
  function write(scope, owner, value) {
    try { const k = key(scope, owner); if (!k) return false; sessionStorage.setItem(k, JSON.stringify({ time: Date.now(), value })); return true; } catch { return false; }
  }
  function remove(scope, owner = user()) { try { const k = key(scope, owner); if (k) sessionStorage.removeItem(k); } catch {} }
  function save(field) {
    const binding = bindings.get(field); if (!binding) return;
    if (binding.last === field.value) return;
    binding.last = field.value;
    if (field.value) write(binding.scope, binding.owner, field.value); else remove(binding.scope, binding.owner);
  }
  function bind(field, { scope, owner = user() }) {
    if (!field || owner == null || !['TEXTAREA','INPUT'].includes(field.tagName) || field.type === 'password' || field.type === 'file') return;
    const previous = bindings.get(field);
    if (previous?.scope === scope && previous.owner === owner) return;
    if (previous) save(field);
    const restored = read(scope, owner);
    if (typeof restored === 'string') field.value = restored.slice(0, field.maxLength > 0 ? field.maxLength : 10000);
    else if (previous) field.value = '';
    bindings.set(field, { scope, owner, last: field.value });
    if (!previous) {
      field.addEventListener('input', () => save(field));
      field.addEventListener('change', () => save(field));
      const note = document.createElement('small'); note.className = 'ux-draft-note';
      note.innerHTML = text(['پیش‌نویس در همین تب نگه داشته می‌شود.','Your draft is kept in this tab.']);
      const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'ux-draft-clear';
      clear.innerHTML = text(['حذف پیش‌نویس','Discard draft']);
      clear.addEventListener('click', () => { field.value = ''; save(field); field.dispatchEvent(new Event('input', { bubbles: true })); field.focus(); });
      note.append(clear); field.insertAdjacentElement('afterend', note);
    }
  }
  function clear(field) { const value = bindings.get(field); if (value) { remove(value.scope, value.owner); value.last = ''; } }
  function clearAll() {
    try { Object.keys(sessionStorage).filter(k => k.startsWith(prefix)).forEach(k => sessionStorage.removeItem(k)); } catch {}
  }
  window.HexoraUX = { state, skeleton, drafts: { user, read, write, remove, bind, save, clear, clearAll } };
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = preference.matches;
  try { reduced ||= localStorage.getItem('hexora-reduce-motion') === 'true'; } catch {}
  root.dataset.uxMotion = reduced ? 'off' : 'on';
  function localize() { document.querySelectorAll('[data-ux-fa][data-ux-en]').forEach(e => { const value = en() ? e.dataset.uxEn : e.dataset.uxFa; if (e.textContent !== value) e.textContent = value; }); }
  function ready() {
    document.body.classList.add('ux-ready');
    document.addEventListener('click', event => { if (event.target.closest('[data-ux-reload]')) location.reload(); });
    const main = document.querySelector('main,[role="main"]');
    if (main) {
      if (!main.id) main.id = 'ux-main';
      if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
      const skip = document.createElement('a'); skip.className = 'ux-skip'; skip.href = '#' + main.id;
      skip.innerHTML = text(['رفتن به محتوای اصلی','Skip to main content']);
      skip.addEventListener('click', () => main.focus({ preventScroll: true }));
      document.body.prepend(skip);
    }
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'ux-motion-toggle';
    function sync() {
      root.dataset.uxMotion = reduced ? 'off' : 'on';
      toggle.setAttribute('aria-pressed', String(reduced));
      toggle.innerHTML = text(reduced ? ['حرکت کمتر: روشن','Reduced motion: on'] : ['کاهش حرکت‌ها','Reduce motion']);
      // Keep the existing hero control in sync with the site-wide preference.
      document.dispatchEvent(new CustomEvent('hexora:motion', { detail: { reduced } }));
    }
    toggle.addEventListener('click', () => { reduced = preference.matches || !reduced; try { localStorage.setItem('hexora-reduce-motion', String(reduced)); } catch {} sync(); });
    preference.addEventListener('change', () => { reduced = preference.matches; try { reduced ||= localStorage.getItem('hexora-reduce-motion') === 'true'; } catch {} sync(); });
    document.body.append(toggle); sync();
    new MutationObserver(localize).observe(root, { attributes: true, attributeFilter: ['lang'] });
    localize();
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || !event.target.matches('[role="tab"]')) return;
      const group = event.target.closest('[role="tablist"]'); if (!group) return;
      const tabs = [...group.querySelectorAll('[role="tab"]')].filter(t => !t.disabled && !t.hidden);
      let index = tabs.indexOf(event.target); const rtl = root.dir === 'rtl';
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else if (event.key === 'ArrowLeft') index = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
      else if (event.key === 'ArrowRight') index = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
      else return;
      if (tabs[index]) { event.preventDefault(); tabs[index].focus(); tabs[index].click(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true }); else ready();
})();
