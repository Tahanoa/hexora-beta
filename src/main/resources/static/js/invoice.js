(() => {
 const $=id=>document.getElementById(id),id=$('invoice').dataset.invoiceId,product=$('invoice').dataset.productInvoice==='true';
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 let payment=null,busy=false,notice=['در حال دریافت فاکتور…','Loading invoice…'],noticeError=false;
 async function api(action='',method='GET',body){
  const base=product?'/api/products/orders/':'/api/payments/invoices/';
  const response=await fetch(base+encodeURIComponent(id)+action,{method,cache:'no-store',referrerPolicy:'no-referrer',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const result=await response.json();if(!response.ok||!result.success)throw Error('invoice');const data=result.data;if(data.invoiceType!==(product?'PRODUCT_PRIVATE':'DIRECT_LINK')||data.shareable!==!product)throw Error('invoice type');return data;
 }
 function message(fa,en,error=false){notice=[fa,en];noticeError=error;paintMessage();}
 function paintMessage(){$('invoiceMessage').textContent=t(...notice);$('invoiceMessage').style.color=noticeError?'#ff9a9a':'#4dffb8';}
 function render(){
  paintMessage();if(!payment)return;
  const paid=payment.status==='PAID',locale=document.documentElement.lang==='en'?'en-US':'fa-IR';
  $('invoiceKind').hidden=$('invoiceAccessNote').hidden=false;
  $('invoiceKind').textContent=product?t('فاکتور خصوصی خرید محصول','Private product invoice'):t('فاکتور قابل ارسال','Shareable invoice');
  $('invoiceAccessNote').textContent=product?t('این فاکتور فقط برای حساب خریدار قابل مشاهده و پرداخت است.','Only the buyer’s account can view and pay this invoice.'):t('این فاکتور توسط مدیریت صادر شده است؛ هر دریافت‌کننده لینک می‌تواند بدون ورود آن را مشاهده و پرداخت کند.','Issued by the administrator. Anyone with its link can view and pay it without signing in.');
  $('invoiceDescription').textContent=payment.description;
  $('invoiceAmount').textContent=Number(payment.amount).toLocaleString(locale);
  $('invoiceNumber').textContent=payment.id;
  $('invoiceDate').textContent=new Date(payment.createdAt).toLocaleString(locale,{timeZone:'Asia/Tehran'});
  $('invoiceStatus').textContent=paid?t('پرداخت‌شده','Paid'):payment.status==='PENDING'?t('در انتظار تأیید','Awaiting verification'):t('پرداخت‌نشده','Unpaid');
  $('invoicePay').hidden=paid;$('invoiceVerify').hidden=paid||payment.status!=='PENDING';
  $('invoiceTerms').hidden=paid;$('invoiceAccept').disabled=busy;
  $('invoicePay').disabled=busy||!$('invoiceAccept').checked;
  $('invoicePay').textContent=product&&payment.amount===0?t('تأیید و دریافت رایگان','Confirm & get for free'):t('تأیید و پرداخت با زرین‌پال','Confirm & pay with Zarinpal');
  $('invoiceVerify').disabled=busy;
  $('invoiceRef').hidden=$('invoiceRefLabel').hidden=!paid;$('invoiceRef').textContent=payment.refId||'';
  $('invoiceDownload').hidden=!product||!paid;
  if(paid)message('پرداخت این فاکتور با موفقیت تأیید شده است.','This invoice payment has been verified.');
 }
 async function act(action){
  if(busy||!payment)return;if(action==='checkout'&&!$('invoiceAccept').checked){message('ابتدا شرایط خرید، حریم خصوصی و امنیت را مطالعه و تأیید کنید.','Read and accept the purchase, privacy and security terms first.',true);return;}
  busy=true;render();message('در حال پردازش…','Processing…');
  try{
   payment=await api('/'+action,'POST',action==='checkout'?{accepted:true,termsVersion:payment.termsVersion}:undefined);
   if(action==='checkout'&&payment.redirectUrl){
    const target=new URL(payment.redirectUrl);
    if(target.origin!=='https://payment.zarinpal.com'||!/^\/pg\/StartPay\/[A-Za-z0-9]{36}$/.test(target.pathname))throw Error('redirect');
    location.assign(target.href);return;
   }
   if(payment.status!=='PAID')message(action==='verify'?'پرداخت هنوز تأیید نشده؛ کمی بعد دوباره پیگیری کنید.':'اتصال به درگاه انجام نشد؛ دوباره تلاش کنید.',action==='verify'?'Payment is not verified yet; try again shortly.':'Unable to connect to the gateway; try again.',true);
  }catch{message('عملیات ناموفق بود؛ اطلاعات فاکتور یا دسترسی به درگاه را بررسی و دوباره تلاش کنید.','Unable to complete the request; check your invoice or gateway access and try again.',true);}
  finally{busy=false;render();}
 }
 $('invoicePay').onclick=()=>act('checkout');$('invoiceVerify').onclick=()=>act('verify');$('invoiceAccept').onchange=render;
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 (async()=>{try{if(product){const user=await loadSession();if(!user){sessionStorage.setItem('hexora-product-return',location.pathname);location.href='/login';return;}}payment=await api();message('','');render();}catch{message('دریافت اطلاعات فاکتور ناموفق بود؛ فاکتور در دسترس حساب شما نیست یا سرور پاسخ نمی‌دهد.','Unable to retrieve this invoice; it may not belong to your account or the server is unavailable.',true);}})();
})();
