(() => {
 const $=id=>document.getElementById(id),id=$('invoice').dataset.invoiceId;
 let payment=null,busy=false;
 async function api(action='',method='GET'){
  const response=await fetch('/api/payments/invoices/'+encodeURIComponent(id)+action,{method,cache:'no-store',referrerPolicy:'no-referrer'});
  const result=await response.json();if(!response.ok||!result.success)throw Error('دریافت اطلاعات فاکتور ناموفق بود؛ دوباره تلاش کنید.');return result.data;
 }
 function message(text,error=false){$('invoiceMessage').textContent=text;$('invoiceMessage').style.color=error?'#ff9a9a':'#4dffb8';}
 function render(){if(!payment)return;const paid=payment.status==='PAID';$('invoiceDescription').textContent=payment.description;$('invoiceAmount').textContent=Number(payment.amount).toLocaleString('fa-IR');$('invoiceNumber').textContent=payment.id;$('invoiceDate').textContent=new Date(payment.createdAt).toLocaleString('fa-IR',{timeZone:'Asia/Tehran'});$('invoiceStatus').textContent=paid?'پرداخت‌شده':payment.status==='PENDING'?'در انتظار تأیید':'پرداخت‌نشده';$('invoicePay').hidden=paid;$('invoiceVerify').hidden=paid||payment.status!=='PENDING';$('invoiceRef').hidden=$('invoiceRefLabel').hidden=!paid;$('invoiceRef').textContent=payment.refId||'';document.querySelectorAll('button').forEach(b=>b.disabled=busy);if(paid)message('پرداخت این فاکتور با موفقیت تأیید شده است.');}
 async function act(action){if(busy)return;busy=true;render();message('در حال ارتباط با درگاه…');try{payment=await api('/'+action,'POST');if(action==='checkout'&&payment.redirectUrl){const target=new URL(payment.redirectUrl);if(target.origin!=='https://payment.zarinpal.com'||!/^\/pg\/StartPay\/[A-Za-z0-9]{36}$/.test(target.pathname))throw Error('آدرس درگاه معتبر نیست.');location.assign(target.href);return;}if(payment.status!=='PAID')message(action==='verify'?'پرداخت هنوز تأیید نشده؛ کمی بعد دوباره پیگیری کنید.':'اتصال به درگاه انجام نشد؛ دوباره تلاش کنید.',true);}catch(e){message(e.message,true);}finally{busy=false;render();}}
 $('invoicePay').onclick=()=>act('checkout');$('invoiceVerify').onclick=()=>act('verify');
 (async()=>{try{payment=await api();message('');render();}catch(e){message(e.message,true);}})();
})();
