(() => {
  const create = () => {
    if (document.getElementById('hexoraPageLoader')) return document.getElementById('hexoraPageLoader');
    const el=document.createElement('div'); el.id='hexoraPageLoader'; el.setAttribute('role','status'); el.setAttribute('aria-label','در حال بارگذاری');
    el.innerHTML='<div class="hexora-loader-ring" aria-hidden="true"></div><span class="hexora-loader-label">در حال بارگذاری...</span>';
    document.body.prepend(el); return el;
  };
  window.showPageLoader=()=>create().classList.remove('is-hidden');
  window.hidePageLoader=()=>create().classList.add('is-hidden');
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(window.hidePageLoader,120)); else setTimeout(window.hidePageLoader,120);
  window.addEventListener('pageshow',window.hidePageLoader);
})();
