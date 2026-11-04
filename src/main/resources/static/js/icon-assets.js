(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isCustom=value=>/^\/api\/media\/public\/[1-9][0-9]*$/.test(String(value||''));
 const render=(value,fallback='fa-solid fa-code')=>isCustom(value)?`<img class="hx-custom-icon" src="${value}" alt="" aria-hidden="true">`:`<i class="${esc(/^fa-(solid|regular|brands)\s+fa-[a-z0-9-]+$/i.test(value||'')?value:fallback)}" aria-hidden="true"></i>`;
 window.HexoraIcons={isCustom,render};
})();
