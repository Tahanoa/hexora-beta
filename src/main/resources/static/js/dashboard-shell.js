(() => {
  async function refreshSidebarAvatar(){
    const img=document.getElementById('sidebarAvatar'),initial=document.getElementById('userInitial');if(!img)return;
    try{const response=await fetch('/api/profile/public');if(!response.ok)return;const json=await response.json(),profile=json.data||{};const value=profile.avatarUrl||profile.profileImage||(profile.avatarId?`/api/media/public/${profile.avatarId}`:'');if(!value){img.hidden=true;if(initial)initial.hidden=false;return;}
      const url=new URL(value,location.origin);if(!['http:','https:'].includes(url.protocol))return;
      img.onload=()=>{img.hidden=false;if(initial)initial.hidden=true;};img.onerror=()=>{img.hidden=true;if(initial)initial.hidden=false;};img.src=url.href;
    }catch{}
  }
  window.addEventListener('profile-avatar-updated',refreshSidebarAvatar);
  const close = () => { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sidebarOverlay')?.classList.remove('show'); document.body.classList.remove('sidebar-open'); };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#sidebar a[href]').forEach(link => { const active=link.pathname===location.pathname; link.classList.toggle('active',active); if(active)link.setAttribute('aria-current','page'); });
    const user=JSON.parse(localStorage.getItem('user')||'null');
    if(user){const name=document.getElementById('userName'),initial=document.getElementById('userInitial');if(name)name.textContent=user.username;if(initial)initial.textContent=(user.username||'H')[0];}
    refreshSidebarAvatar();
    document.addEventListener('keydown', e=>{if(e.key==='Escape')close();});
    window.addEventListener('resize',()=>{if(window.innerWidth>1024)close();});
  });
})();
