(() => {
  let pending = 0;
  let ready = document.readyState !== 'loading';
  let frame = 0;
  const overlay = () => document.getElementById('loadingOverlay');
  function show() {
    const node = overlay();
    node?.classList.remove('hidden', 'is-hidden');
    node?.setAttribute('aria-hidden', 'false');
  }
  function finish() {
    cancelAnimationFrame(frame);
    if (!ready || pending) return;
    frame = requestAnimationFrame(() => {
      if (!ready || pending) return;
      const node = overlay();
      node?.classList.add('hidden', 'is-hidden');
      node?.setAttribute('aria-hidden', 'true');
    });
  }
  // Data sections use their own skeletons; only explicit essential work blocks the shell.
  window.holdPageLoader = ({ blocking = true } = {}) => {
    if (!blocking) return () => {};
    pending++;
    cancelAnimationFrame(frame);
    show();
    let released = false;
    return () => { if (!released) { released = true; pending--; finish(); } };
  };
  window.showPageLoader = show;
  window.hidePageLoader = finish;
  document.addEventListener('DOMContentLoaded', () => { ready = true; finish(); }, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) { ready = true; finish(); } });
  finish();
})();
