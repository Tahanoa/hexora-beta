(() => {
  const close = () => { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sidebarOverlay')?.classList.remove('show'); document.body.classList.remove('sidebar-open'); };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#sidebar a[href]').forEach(link => { const active=link.pathname===location.pathname; link.classList.toggle('active',active); if(active)link.setAttribute('aria-current','page'); });
    const user=JSON.parse(localStorage.getItem('user')||'null');
    if(user){const name=document.getElementById('userName'),initial=document.getElementById('userInitial');if(name)name.textContent=user.username;if(initial)initial.textContent=(user.username||'H')[0];}
    document.addEventListener('keydown', e=>{if(e.key==='Escape')close();});
    window.addEventListener('resize',()=>{if(window.innerWidth>1024)close();});
  });
})();
