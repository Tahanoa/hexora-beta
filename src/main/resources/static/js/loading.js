(() => {
  const create = () => {
    let el = document.getElementById('loadingOverlay') || document.getElementById('hexoraPageLoader');
    if (el) return el;
    el = document.createElement('div'); el.id = 'loadingOverlay'; el.className = 'cssload-wrap';
    el.setAttribute('role','status'); el.setAttribute('aria-label','در حال بارگذاری');
    el.innerHTML = '<div class="cssload-cssload-spinner" aria-hidden="true"></div>';
    document.body.prepend(el); return el;
  };
  const hide = () => { const el = create(); el.classList.add('hidden'); el.classList.add('is-hidden'); };
  window.showPageLoader = () => { const el = create(); el.classList.remove('hidden','is-hidden'); };
  window.hidePageLoader = hide;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(hide, 120)); else setTimeout(hide, 120);
  window.addEventListener('pageshow', hide);
})();
