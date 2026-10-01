(() => {
  let pending = 0, loaded = document.readyState === 'complete', timer;
  const started = performance.now(), minimum = 3000;
  const overlay = () => document.getElementById('loadingOverlay');
  function finish() {
    clearTimeout(timer);
    if (!loaded || pending) return;
    timer = setTimeout(() => {
      if (loaded && !pending) overlay()?.classList.add('hidden','is-hidden');
    }, Math.max(0, minimum - (performance.now() - started)));
  }
  window.holdPageLoader = () => {
    pending++; clearTimeout(timer); overlay()?.classList.remove('hidden','is-hidden');
    let released = false;
    return () => { if (!released) { released = true; pending--; finish(); } };
  };
  window.showPageLoader = () => overlay()?.classList.remove('hidden','is-hidden');
  window.hidePageLoader = finish;
  window.addEventListener('load', () => { loaded = true; finish(); }, {once:true});
  window.addEventListener('pageshow', event => { if (event.persisted) { loaded = true; finish(); } });
  finish();
})();
