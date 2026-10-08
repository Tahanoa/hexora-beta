(() => {
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function api(path,method='GET',body){const form=body instanceof FormData;const response=await fetch('/api/products'+path,{method,cache:'no-store',headers:body&&!form?{'Content-Type':'application/json'}:{},body:body?(form?body:JSON.stringify(body)):undefined});let result;try{result=await response.json();}catch{throw Error(t('پاسخ سرور معتبر نیست.','Invalid server response.'));}if(!response.ok||!result.success)throw Error(result.message||t('عملیات ناموفق بود.','Operation failed.'));return result.data;}
 const price=n=>n===0?t('رایگان','Free'):Number(n).toLocaleString(document.documentElement.lang==='en'?'en-US':'fa-IR')+' '+t('تومان','toman');
 async function download(productId,releaseId,filename){const response=await fetch(`/api/products/${Number(productId)}/releases/${Number(releaseId)}/download`,{cache:'no-store'});if(!response.ok){let result={};try{result=await response.json();}catch{}throw Error(result.message||t('دانلود مجاز نیست.','Download is not allowed.'));}const blob=await response.blob();const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=/^[a-zA-Z0-9._-]+\.zip$/.test(filename)?filename:'product.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
 window.HexoraProducts={t,esc,api,price,download};
})();
