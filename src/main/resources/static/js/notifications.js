(() => {
 if(window.HexoraNotify)return;
 const entries=new Map(),recent=new Map();let host,activeAsk=null,serial=0;
 const t=(fa,en)=>document.documentElement.lang==='en'?en:fa;
 const tr=v=>window.HexoraI18n?.tr(String(v??''))??String(v??'');
 const titles={success:['انجام شد','Success'],error:['خطا','Error'],warning:['توجه','Warning'],info:['اطلاع‌رسانی','Information']};
 const paths={success:'M5 12l4 4L19 6',error:'M6 6l12 12M18 6L6 18',warning:'M12 8v5m0 3h.01M12 3L2 21h20L12 3Z',info:'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
 function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
 function place(){if(!document.body)return;if(!host){host=el('div','hx-notifications');host.setAttribute('aria-label',t('اعلان‌ها','Notifications'));}const dialogs=[...document.querySelectorAll('dialog[open]')];const parent=dialogs.at(-1)||document.body;if(host.parentNode!==parent)parent.append(host);}
 function dismiss(key){const item=entries.get(key);if(!item)return;clearTimeout(item.timer);entries.delete(key);item.node.classList.add('hx-notice-leave');setTimeout(()=>item.node.remove(),200);}
 function arm(item){clearTimeout(item.timer);if(item.remaining>0){item.started=Date.now();item.timer=setTimeout(()=>dismiss(item.key),item.remaining);}}
 function show(type='info',message='',options={}){
  type=titles[type]?type:'info';message=tr(message);if(!message&&!options.title)return;
  if(!document.body){document.addEventListener('DOMContentLoaded',()=>show(type,message,options),{once:true});return;}
  place();const key=options.key||'notice-'+(++serial),title=options.title?tr(options.title):t(...titles[type]),signature=type+'|'+title+'|'+message;
  let item=entries.get(key);if(item?.signature===signature)return item.node;
  if(!item&&recent.get(key)?.signature===signature&&Date.now()-recent.get(key).at<2500)return;
  recent.set(key,{signature,at:Date.now()});if(recent.size>80)recent.delete(recent.keys().next().value);
  if(!item){if(entries.size>=4)dismiss(entries.keys().next().value);const node=el('section','hx-notice'),icon=el('span','hx-notice-icon'),copy=el('div','hx-notice-copy'),heading=el('strong'),text=el('p'),close=el('button','hx-notice-close','×');close.type='button';copy.append(heading,text);node.append(icon,copy,close);item={key,node,icon,heading,text,close};entries.set(key,item);host.append(node);close.onclick=()=>dismiss(key);node.addEventListener('mouseenter',()=>{if(item.timer){clearTimeout(item.timer);item.timer=null;item.remaining=Math.max(1,item.remaining-(Date.now()-item.started));}});node.addEventListener('mouseleave',()=>{if(!node.contains(document.activeElement))arm(item);});node.addEventListener('focusin',()=>{if(item.timer){clearTimeout(item.timer);item.timer=null;item.remaining=Math.max(1,item.remaining-(Date.now()-item.started));}});node.addEventListener('focusout',()=>{if(!node.matches(':hover'))arm(item);});}
  item.signature=signature;item.node.className='hx-notice hx-notice-'+type;item.node.setAttribute('role',type==='error'||type==='warning'?'alert':'status');item.node.setAttribute('aria-atomic','true');item.icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[type]+'"/></svg>';item.heading.textContent=title;item.text.textContent=message;item.text.hidden=!message;item.close.setAttribute('aria-label',t('بستن اعلان','Close notification'));item.remaining=options.duration??(type==='error'?9000:type==='warning'?7000:4500);arm(item);return item.node;
 }
 function feedback(message,error=false,options={}){
  const key=options.key||options.source||'feedback';const source=options.source&&document.getElementById(options.source);if(source){source.hidden=true;source.classList.add('hx-feedback-source');source.removeAttribute('aria-live');source.removeAttribute('role');}
  if(!message){if(entries.get(key)?.busy)dismiss(key);return;}
  const busy=!error&&/^(در حال|Working|Loading|Sending|Uploading|Processing|Connecting)/i.test(message);
  const warning=/^(ابتدا|پیش از|لطفا|لطفاً|حداکثر|فقط فایل|کپی خودکار|First |Please |Save your|Only |Select |Choose )|هنوز تأیید|not verified yet/i.test(message);
  const info=/نشده است|به‌زودی|به زودی|No .*yet|coming soon|not available/i.test(message);
  const type=options.type||(warning?'warning':error?'error':busy||info?'info':'success');show(type,message,{...options,key,duration:busy?0:options.duration});const item=entries.get(key);if(item)item.busy=busy;
 }
 function ask(message,options={}){
  if(activeAsk)return Promise.resolve(options.input?null:false);
  return new Promise(resolve=>{
   const previous=document.activeElement,dialog=el('dialog','hx-notify-dialog'),form=el('form'),heading=el('h2',null,t('تأیید عملیات','Confirm action')),copy=el('p',null,tr(message)),actions=el('div','hx-notify-actions'),cancel=el('button',null,t('انصراف','Cancel')),accept=el('button','hx-notify-accept',t('تأیید و ادامه','Confirm & continue'));let input,result=options.input?null:false;form.method='dialog';cancel.type='button';accept.type='submit';form.append(heading,copy);heading.id='hx-confirm-title';dialog.setAttribute('aria-labelledby',heading.id);if(options.input){input=el('input');input.type=options.type||'text';input.required=true;input.value=options.value??'';if(options.min!==undefined)input.min=options.min;if(options.step!==undefined)input.step=options.step;input.setAttribute('aria-label',tr(message));form.append(input);}actions.append(cancel,accept);form.append(actions);dialog.append(form);document.body.append(dialog);activeAsk=dialog;
   cancel.onclick=()=>dialog.close();form.onsubmit=e=>{e.preventDefault();if(input&&!input.checkValidity())return;result=input?input.value:true;dialog.close();};dialog.addEventListener('close',()=>{activeAsk=null;dialog.remove();place();previous?.focus({preventScroll:true});resolve(result);},{once:true});dialog.showModal();place();(input||cancel).focus();
  });
 }
 window.HexoraNotify={show,feedback,dismiss,confirm:message=>ask(message),prompt:(message,value,options={})=>ask(message,{...options,input:true,value})};
 window.showToast=(type,title,message,duration)=>show(type,message,{title,duration});
 document.addEventListener('close',()=>queueMicrotask(place),true);
 document.addEventListener('DOMContentLoaded',()=>{place();new MutationObserver(place).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});});
 let validationAt=0;document.addEventListener('invalid',e=>{if(!e.target.closest('form'))return;e.preventDefault();e.target.classList.add('hx-invalid');e.target.setAttribute('aria-invalid','true');if(Date.now()-validationAt<100)return;validationAt=Date.now();show('warning',e.target.validationMessage||t('ورودی‌های فرم را بررسی کنید.','Check the form fields.'),{key:'form-validation'});e.target.focus({preventScroll:true});},true);
 document.addEventListener('input',e=>{if(e.target.classList.contains('hx-invalid')&&e.target.validity.valid){e.target.classList.remove('hx-invalid');e.target.removeAttribute('aria-invalid');}});
})();
