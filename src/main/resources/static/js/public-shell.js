(() => {
  const header = document.querySelector('.public-header');
  if (!header) return;
  const menu = document.getElementById('mobileNav');
  const toggle = document.getElementById('menuBtn');
  const tablet = matchMedia('(max-width: 1199px)');
  const english = () => document.documentElement.lang === 'en';
  const account = document.getElementById('accountLink');
  const langButton = document.getElementById('langBtn');
  function setOpen(open, restoreFocus = false) {
    open = !!open && tablet.matches;
    menu.classList.toggle('open', open);
    menu.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', english() ? (open ? 'Close menu' : 'Open menu') : (open ? 'بستن منو' : 'نمایش منو'));
    if (restoreFocus) toggle.focus({preventScroll: true});
  }
  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) setOpen(false, true);
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
  header.addEventListener('focusout', event => { if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false); });
  tablet.addEventListener('change', () => setOpen(false));
  const path = location.pathname.replace(/\/$/, '') || '/';
  header.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const active = href === path || (href !== '/' && path.startsWith(href + '/'));
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById('year').textContent = new Date().getFullYear();
  function language() {
    const en = english();
    localStorage.setItem('hexora-lang', en ? 'en' : 'fa');
    localStorage.setItem('hexora-showcase-language', en ? 'en' : 'fa');
    document.querySelectorAll('.public-header [data-fa],.public-footer [data-fa],#chatSocials [data-fa]').forEach(el => { el.textContent = en ? el.dataset.en : el.dataset.fa; });
    document.querySelectorAll('[data-nav-label]').forEach(el => el.setAttribute('aria-label', en ? 'Main navigation' : 'منوی اصلی'));
    document.querySelectorAll('[data-footer-label]').forEach(el => el.setAttribute('aria-label', en ? 'Footer links' : 'پیوندهای پایین صفحه'));
    document.querySelectorAll('[data-contact-label-fa]').forEach(el => el.setAttribute('aria-label', en ? el.dataset.contactLabelEn : el.dataset.contactLabelFa));
    langButton.textContent = en ? 'FA' : 'EN';
    langButton.setAttribute('aria-label', en ? 'Switch to Persian' : 'تغییر زبان به انگلیسی');
    setOpen(menu.classList.contains('open'));
  }
  new MutationObserver(language).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  // The shared header owns the language switch on every public page.
  langButton.addEventListener('click', () => {
    const lang = english() ? 'fa' : 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    language();
  });
  language();
  function contactLink(item, compact) {
    const link = document.createElement('a');
    link.href = item.href;
    link.dataset.contactLabelFa = item.fa || item.label;
    link.dataset.contactLabelEn = item.label;
    link.setAttribute('aria-label', item.fa && !english() ? item.fa : item.label);
    if (item.external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const icon = document.createElement('i');
    icon.className = item.icon;
    icon.setAttribute('aria-hidden', 'true');
    link.append(icon);
    if (!compact) {
      const text = document.createElement('span');
      text.dataset.fa = item.fa || item.label;
      text.dataset.en = item.label;
      text.textContent = english() ? item.label : item.fa || item.label;
      link.append(text);
    }
    return link;
  }
  window.HexoraPublicProfile.load().then(profile => {
    if (profile?.brandName) document.querySelectorAll('#brandName,#footerBrand,[data-brand-name]').forEach(el => el.textContent = profile.brandName);
    const links = window.HexoraPublicProfile.links(profile);
    const footer = document.getElementById('footerSocials');
    const chat = document.getElementById('chatSocials');
    if (footer) footer.replaceChildren(...links.map(item => contactLink(item, true)));
    if (chat) chat.replaceChildren(...links.map(item => contactLink(item, false)));
  }).catch(() => {});
  if (localStorage.getItem('accessToken') && window.loadSession) {
    window.loadSession().then(user => {
      if (!user) return;
      const admin = user.roles?.includes('ADMIN');
      account.href = admin ? '/dashboard' : '/account';
      account.dataset.fa = admin ? 'داشبورد' : 'حساب کاربری';
      account.dataset.en = admin ? 'Dashboard' : 'My account';
      language();
    }).catch(() => {});
  }
})();
