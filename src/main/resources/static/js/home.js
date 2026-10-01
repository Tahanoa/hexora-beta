// Lightweight landing interactions; content is intentionally static and backend-independent.
document.addEventListener('DOMContentLoaded', async () => {
  const toggle=document.querySelector('.menu-toggle');
  const mobile=document.querySelector('.mobile-nav');
  toggle?.addEventListener('click',()=>{mobile?.classList.toggle('open');toggle.setAttribute('aria-expanded',String(mobile?.classList.contains('open')));});
  mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>mobile.classList.remove('open')));
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
  const form=document.querySelector('.contact-form');
  form?.querySelector('button')?.addEventListener('click',()=>{const toast=document.createElement('div');toast.className='toast toast-success';toast.textContent='درخواست شما آماده ارسال است؛ به‌زودی با شما تماس می‌گیریم.';document.querySelector('#toastContainer')?.append(toast);setTimeout(()=>toast.remove(),4000);});
});
