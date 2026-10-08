(() => {
  async function refreshSidebarAvatar(){
    const img=document.getElementById('sidebarAvatar'),initial=document.getElementById('userInitial');if(!img)return;
    try{const response=await fetch('/api/profile/public');if(!response.ok)return;const json=await response.json(),profile=json.data||{};const value=profile.avatarUrl||profile.profileImage||(profile.avatarId?`/api/media/public/${profile.avatarId}`:'');if(!value){img.hidden=true;if(initial)initial.hidden=false;return;}
      const url=new URL(value,location.origin);if(!['http:','https:'].includes(url.protocol))return;
      img.onload=()=>{img.hidden=false;if(initial)initial.hidden=true;};img.onerror=()=>{img.hidden=true;if(initial)initial.hidden=false;};img.src=url.href;
    }catch{}
  }
  window.addEventListener('profile-avatar-updated',refreshSidebarAvatar);
  const setOpen = requested => {
    const open=Boolean(requested)&&window.innerWidth<1024;
    document.getElementById('sidebar')?.classList.toggle('open',open);
    document.getElementById('sidebarOverlay')?.classList.toggle('show',open);
    document.body.classList.toggle('sidebar-open',open);
    const fa=document.documentElement.lang!=='en';
    document.querySelectorAll('.sidebar-toggle').forEach(button=>{
      button.setAttribute('aria-expanded',String(open));
      button.setAttribute('aria-label',fa?(open?'بستن منو':'باز کردن منو'):(open?'Close menu':'Open menu'));
    });
  };
  const toggle = () => setOpen(!document.getElementById('sidebar')?.classList.contains('open'));
  window.HexoraAdminShell={setOpen,toggle};
  window.toggleSidebar=toggle;
  const close=()=>setOpen(false);
  const routes={payments:['درگاه و فروش','Payments & sales'],dashboard:['داشبورد','Dashboard'],profile:['پروفایل','Profile'],projects:['پروژه‌ها','Projects'],demos:['دموساز','Demo studio'],skills:['مهارت‌ها','Skills'],experience:['سوابق کاری','Experience'],services:['خدمات','Services'],statistics:['آمارها','Statistics'],media:['رسانه‌ها','Media'],testimonials:['نظرات کارفرمایان','Testimonials'],contact:['پیام‌ها','Messages']};
  function language(){
    const fa=document.documentElement.lang!=='en';
    const page=routes[location.pathname.split('/').pop()];if(page)document.title=page[fa?0:1]+' | Hexora';
    document.querySelectorAll('[data-admin-language]').forEach(el=>el.textContent=fa?'فارسی':'English');
    document.querySelectorAll('[data-admin-refresh]').forEach(el=>el.setAttribute('aria-label',fa?'تازه‌سازی':'Refresh'));
    document.querySelectorAll('#sidebar a[href]').forEach(link=>{
      const pair=routes[link.pathname.split('/').pop()],label=link.querySelector('span');
      if(pair&&label)label.textContent=pair[fa?0:1];
    });
    for(const [id,pair] of Object.entries({navMainMenu:['منوی اصلی','Main menu'],userRole:['ادمین','Admin'],navLogout:['خروج','Logout'],chatPageTitle:['گفتگوهای کاربران','User conversations'],chatPageSubtitle:['پاسخ‌گویی مستقیم به کاربران ثبت‌نام‌شده','Reply directly to registered users'],dmPageTitle:routes.demos,dmPageSubtitle:['مدیریت، پیش‌نمایش و انتشار دموها','Manage, preview and publish demos']})){
      const el=document.getElementById(id);if(el)el.textContent=pair[fa?0:1];
    }
    setOpen(document.getElementById('sidebar')?.classList.contains('open'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#sidebar a[href]').forEach(link => { const active=link.pathname===location.pathname; link.classList.toggle('active',active); if(active)link.setAttribute('aria-current','page'); });
    let user;try{user=JSON.parse(localStorage.getItem('user')||'null');}catch{}
    if(user){const name=document.getElementById('userName'),initial=document.getElementById('userInitial');if(name)name.textContent=user.username;if(initial)initial.textContent=(user.username||'H')[0];}
    // Bind fixed functions in JavaScript. Thymeleaf rejects string variables
    // in event attributes such as th:onclick, even for fragment parameters.
    for(const id of ['dashboardLanguage','profileLanguage']){
      document.getElementById(id)?.addEventListener('click',()=>window.toggleLanguage());
    }
    document.getElementById('dashboardRefresh')?.addEventListener('click',()=>window.refreshData());
    refreshSidebarAvatar();
    const lang=localStorage.getItem('hexora-lang')==='en'?'en':'fa';
    document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';
    language();
    new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('click',event=>{if(window.innerWidth<1024&&!event.target.closest('#sidebar, .sidebar-toggle'))close();});
    document.addEventListener('keydown', e=>{if(e.key==='Escape')close();});
    window.addEventListener('resize',()=>{if(window.innerWidth>=1024)close();});
  });
})();
