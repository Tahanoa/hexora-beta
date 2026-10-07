(() => {
  const formatter=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
  const dayMs=86400000;
  const fa=()=>document.documentElement.lang!=='en';
  const t=(persian,english)=>fa()?persian:english;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function parts(iso){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;
    const date=new Date(iso+'T00:00:00Z');if(Number.isNaN(+date)||date.toISOString().slice(0,10)!==iso)return null;
    const values={};formatter.formatToParts(date).forEach(p=>values[p.type]=Number(p.value));
    return {year:values.year,month:values.month,day:values.day};
  }
  function toISO(year,month,day){
    if(!Number.isInteger(year)||year<1200||year>1600||!Number.isInteger(month)||month<1||month>12||!Number.isInteger(day)||day<1||day>31)return '';
    const target=year*10000+month*100+day;
    let lo=Date.UTC(year+621,0,1)/dayMs,hi=Date.UTC(year+623,0,1)/dayMs;
    while(lo<=hi){const mid=Math.floor((lo+hi)/2),iso=new Date(mid*dayMs).toISOString().slice(0,10),p=parts(iso),key=p.year*10000+p.month*100+p.day;if(key===target)return iso;if(key<target)lo=mid+1;else hi=mid-1;}
    return '';
  }
  function monthLength(year,month){for(let d=31;d>=28;d--)if(toISO(year,month,d))return d;return 0;}
  function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  function display(iso){if(!parts(iso))return '';return new Intl.DateTimeFormat(fa()?'fa-IR-u-ca-persian':'en-u-ca-persian',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(iso+'T00:00:00Z'));}
  function number(n){return n.toLocaleString(fa()?'fa-IR':'en-US',{useGrouping:false});}
  const monthsFA=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  const monthsEN=['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'];
  function html(name,label,value=''){
    const p=parts(value)||parts(today());
    return `<div class="field hx-jalali-field"><label>${esc(label)} <small>${t('(شمسی)','(Solar Hijri)')}</small></label><input type="hidden" name="${esc(name)}" value="${esc(parts(value)?value:'')}"><details class="hx-jalali" data-jyear="${p.year}" data-jmonth="${p.month}"><summary aria-label="${esc(label+' '+t('شمسی','Solar Hijri'))}"><span data-jlabel>${esc(display(value)||t('انتخاب تاریخ شمسی','Choose a Solar Hijri date'))}</span><i class="fa-regular fa-calendar" aria-hidden="true"></i></summary><div class="hx-jalali-panel"><div class="hx-jalali-nav"><button type="button" data-jmove="-1" aria-label="${t('ماه قبل','Previous month')}">‹</button><select data-jmonth-select aria-label="${t('ماه','Month')}"></select><select data-jyear-select aria-label="${t('سال','Year')}"></select><button type="button" data-jmove="1" aria-label="${t('ماه بعد','Next month')}">›</button></div><div class="hx-jalali-week" aria-hidden="true">${(fa()?['ش','ی','د','س','چ','پ','ج']:['Sa','Su','Mo','Tu','We','Th','Fr']).map(x=>`<span>${x}</span>`).join('')}</div><div class="hx-jalali-days" role="group" aria-label="${t('روزهای ماه','Days of the month')}"></div><div class="hx-jalali-actions"><button type="button" data-jtoday>${t('امروز','Today')}</button><button type="button" data-jclear>${t('پاک کردن','Clear')}</button></div></div></details></div>`;
  }
  function paint(picker){
    const y=Number(picker.dataset.jyear),m=Number(picker.dataset.jmonth),value=picker.parentElement.querySelector('input').value;
    picker.querySelector('[data-jmonth-select]').innerHTML=(fa()?monthsFA:monthsEN).map((name,i)=>`<option value="${i+1}" ${i+1===m?'selected':''}>${name}</option>`).join('');
    picker.querySelector('[data-jyear-select]').innerHTML=Array.from({length:401},(_,i)=>1200+i).map(year=>`<option value="${year}" ${year===y?'selected':''}>${number(year)}</option>`).join('');
    const first=toISO(y,m,1),offset=(new Date(first+'T00:00:00Z').getUTCDay()+1)%7;
    picker.querySelector('.hx-jalali-days').innerHTML=Array.from({length:offset},()=>'<span aria-hidden="true"></span>').join('')+Array.from({length:monthLength(y,m)},(_,i)=>{const iso=toISO(y,m,i+1);return `<button type="button" data-jday="${iso}" aria-label="${esc(display(iso))}" aria-pressed="${value===iso}" ${iso===today()?'aria-current="date"':''}>${number(i+1)}</button>`;}).join('');
    picker.querySelector('[data-jmove="-1"]').disabled=y===1200&&m===1;
    picker.querySelector('[data-jmove="1"]').disabled=y===1600&&m===12;
  }
  function choose(picker,iso){const input=picker.parentElement.querySelector('input');input.value=iso;input.dispatchEvent(new Event('change',{bubbles:true}));picker.querySelector('[data-jlabel]').textContent=display(iso)||t('انتخاب تاریخ شمسی','Choose a Solar Hijri date');picker.open=false;picker.querySelector('summary').focus();}
  function enhance(root){root.querySelectorAll('.hx-jalali').forEach(picker=>{paint(picker);picker.addEventListener('toggle',()=>{if(picker.open)document.querySelectorAll('.hx-jalali[open]').forEach(other=>{if(other!==picker)other.open=false;});});});}
  document.addEventListener('click',event=>{
    const picker=event.target.closest('.hx-jalali');
    if(!picker){document.querySelectorAll('.hx-jalali[open]').forEach(p=>p.open=false);return;}
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.jday)choose(picker,button.dataset.jday);
    else if('jtoday' in button.dataset)choose(picker,today());
    else if('jclear' in button.dataset)choose(picker,'');
    else if(button.dataset.jmove){let y=Number(picker.dataset.jyear),m=Number(picker.dataset.jmonth)+Number(button.dataset.jmove);if(m<1){m=12;y--;}if(m>12){m=1;y++;}if(y<1200||y>1600)return;picker.dataset.jyear=y;picker.dataset.jmonth=m;paint(picker);}
  });
  document.addEventListener('change',event=>{if(!event.target.matches('[data-jmonth-select],[data-jyear-select]'))return;const picker=event.target.closest('.hx-jalali');picker.dataset.jyear=picker.querySelector('[data-jyear-select]').value;picker.dataset.jmonth=picker.querySelector('[data-jmonth-select]').value;paint(picker);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const picker=event.target.closest('.hx-jalali[open]');if(picker){picker.open=false;picker.querySelector('summary').focus();}}});
  window.HexoraJalali={parts,toISO,monthLength,display,html,enhance};
})();
