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

(function bilingualLanding(){
  const button=document.querySelector('.lang-switch');
  const translations={
    'درباره ما':'About','خدمات':'Services','نمونه‌کارها':'Work','مهارت‌ها':'Skills','ارتباط با من':'Contact','ورود به داشبورد':'Dashboard','شروع همکاری':'Start a project','استودیو طراحی و توسعه دیجیتال':'Digital design & development studio','توانمندی‌ها':'Capabilities','نگاه ما':'Our approach','منتخب کارها':'Selected work','یک قدم تا شروع':'One step away','مهارت‌ها':'Skills','چرا من؟':'Why choose me?','ارسال درخواست':'Send request','نام شما':'Your name','کمی درباره ایده‌تان بنویسید':'Tell us about your idea','ایمیل':'Email'
  };
  const reverse=Object.fromEntries(Object.entries(translations).map(([fa,en])=>[en,fa]));
  function apply(lang){document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';const dict=lang==='en'?translations:reverse;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{const key=node.nodeValue.trim();if(dict[key])node.nodeValue=node.nodeValue.replace(key,dict[key]);});document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const key=el.placeholder;if(dict[key])el.placeholder=dict[key]});if(button)button.textContent=lang==='en'?'FA':'EN';localStorage.setItem('hexora-home-lang',lang)}
  const saved=localStorage.getItem('hexora-home-lang');if(saved==='en')apply('en');button?.addEventListener('click',()=>apply(document.documentElement.lang==='en'?'fa':'en'));
})();
