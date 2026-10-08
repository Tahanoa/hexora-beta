(() => {
 const $=id=>document.getElementById(id),id=$('invoice').dataset.invoiceId;
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 let payment=null,busy=false,notice=['در حال دریافت فاکتور…','Loading invoice…'],noticeError=false;
 async function api(action='',method='GET'){
  const response=await fetch('/api/payments/invoices/'+encodeURIComponent(id)+action,{method,cache:'no-store',referrerPolicy:'no-referrer'});
  const result=await response.json();if(!response.ok||!result.success)throw Error('invoice');return result.data;
 }
 function message(fa,en,error=false){notice=[fa,en];noticeError=error;paintMessage();}
 function paintMessage(){$('invoiceMessage').textContent=t(...notice);$('invoiceMessage').style.color=noticeError?'#ff9a9a':'#4dffb8';}
 function render(){
  paintMessage();if(!payment)return;
  const paid=payment.status==='PAID',locale=document.documentElement.lang==='en'?'en-US':'fa-IR';
  $('invoiceDescription').textContent=payment.description;
  $('invoiceAmount').textContent=Number(payment.amount).toLocaleString(locale);
  $('invoiceNumber').textContent=payment.id;
  $('invoiceDate').textContent=new Date(payment.createdAt).toLocaleString(locale,{timeZone:'Asia/Tehran'});
  $('invoiceStatus').textContent=paid?t('پرداخت‌شده','Paid'):payment.status==='PENDING'?t('در انتظار تأیید','Awaiting verification'):t('پرداخت‌نشده','Unpaid');
  $('invoicePay').hidden=paid;$('invoiceVerify').hidden=paid||payment.status!=='PENDING';
  $('invoiceRef').hidden=$('invoiceRefLabel').hidden=!paid;$('invoiceRef').textContent=payment.refId||'';
  document.querySelectorAll('#invoice button').forEach(b=>b.disabled=busy);
  if(paid)message('پرداخت این فاکتور با موفقیت تأیید شده است.','This invoice payment has been verified.');
 }
 async function act(action){
  if(busy)return;busy=true;render();message('در حال ارتباط با درگاه…','Connecting to the gateway…');
  try{
   payment=await api('/'+action,'POST');
   if(action==='checkout'&&payment.redirectUrl){
    const target=new URL(payment.redirectUrl);
    if(target.origin!=='https://payment.zarinpal.com'||!/^\/pg\/StartPay\/[A-Za-z0-9]{36}$/.test(target.pathname))throw Error('redirect');
    location.assign(target.href);return;
   }
   if(payment.status!=='PAID'){
    if(action==='verify')message('پرداخت هنوز تأیید نشده؛ کمی بعد دوباره پیگیری کنید.','Payment is not verified yet; try again shortly.',true);
    else message('اتصال به درگاه انجام نشد؛ دوباره تلاش کنید.','Unable to connect to the gateway; try again.',true);
   }
  }catch{message('دریافت اطلاعات فاکتور ناموفق بود؛ دوباره تلاش کنید.','Unable to retrieve invoice details; please try again.',true);}
  finally{busy=false;render();}
 }
 $('invoicePay').onclick=()=>act('checkout');$('invoiceVerify').onclick=()=>act('verify');
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 (async()=>{try{payment=await api();message('','');render();}catch{message('دریافت اطلاعات فاکتور ناموفق بود؛ دوباره تلاش کنید.','Unable to retrieve invoice details; please try again.',true);}})();
})();
