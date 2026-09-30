(() => {
 const nativeFetch = window.fetch.bind(window);
 let csrfPromise;
 const csrf = () => csrfPromise ||= nativeFetch('/api/auth/csrf', {credentials: 'same-origin'}).then(async response => {
  if (!response.ok) throw new Error('Cannot load security token'); return response.json();
 });
 window.fetch = async (input, options = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  const method = (options.method || input.method || 'GET').toUpperCase();
  if (url.origin !== location.origin) return nativeFetch(input, options);
  const headers = new Headers(options.headers || input.headers);
  if (!['GET','HEAD','OPTIONS'].includes(method)) {
   const token = await csrf(); headers.set(token.headerName, token.token);
  }
  const response = await nativeFetch(input, {...options, headers, credentials: 'same-origin'});
  if (url.pathname === '/api/auth/login' || url.pathname === '/api/auth/logout' || url.pathname === '/api/auth/change-password') csrfPromise = null;
  return response;
 };
 window.loadSession = async () => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) { localStorage.removeItem('user'); return null; }
  const result = await response.json(); localStorage.setItem('user',JSON.stringify(result.data)); return result.data;
 };
})();
