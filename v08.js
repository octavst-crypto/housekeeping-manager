// v0.8 — audit trail for daily comparison against manually confirmed Excel totals.
// This is NOT a formula port or proof of parity.
(function(){
 const nav=document.querySelector('nav'), button=document.createElement('button');
 button.dataset.tab='audit';button.textContent='Excel-Abgleich';nav.insertBefore(button,nav.querySelector('[data-tab="settings"]'));
 const section=document.createElement('section');section.id='audit';section.className='hidden';
 section.innerHTML=`<div class="panel"><h2>Abgleich mit Excel · control de facturare</h2><p class="note">Introdu suma verificată din Excel-ul original pentru aceeași zi. Aplicația compară cu estimarea curentă. Această comparație NU confirmă reproducerea formulelor Alfa.</p><div class="toolbar"><label>Data <input id="auditDate" type="date"></label><label>Total Excel (€) <input id="auditExcel" type="number" min="0" step="0.01" placeholder="Total confirmat"></label><label>Observații <input id="auditNote" placeholder="Sursă / explicație"></label></div><div class="toolbar"><button class="primary" id="auditSave">Salvează referința</button><button id="auditDelete">Șterge referința</button><button id="auditExport">Export CSV</button></div><div id="auditResult"></div></div><div class="panel"><h2>Comparații înregistrate</h2><div id="auditHistory" class="tablewrap"></div><p class="note">Estimarea este recalculată cu tarifele actuale. Modificările tarifelor sau camerelor pot schimba diferențele istorice.</p></div>`;
 document.querySelector('main').appendChild(section);
 if(!state.excelAudit||typeof state.excelAudit!=='object'||Array.isArray(state.excelAudit))state.excelAudit={};
 const euroValue=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
 const estimate=date=>{
   const entries=state.days?.[date]||{};
   let count=0,roomSum=0;
   const matrix=(()=>{try{return JSON.parse(localStorage.getItem('hk_alfa_service_rates_v05'))||{}}catch(_){return {}}})();
   const defaultChecked=Number(rates.checked),defaultUnchecked=Number(rates.unchecked);
   for(const room of state.rooms){const d=entries[room.number];if(!d||d.status!=='Finalizată'||!d.cleaner||!['Checkout','Stayover','Extra'].includes(d.service))continue;
     const fallback=d.checker?defaultChecked:defaultUnchecked;
     const candidate=matrix[d.service]?.[d.checker?'checked':'unchecked'];
     const tariff=candidate===undefined?fallback:Number(candidate);
     if(!Number.isFinite(tariff)||tariff<0)continue;
     count++;roomSum+=tariff;
   }
   const hours=Number(state.housemanHours?.[date]||0),house=hours*Number(rates.houseman);
   return {count,roomSum,house,total:roomSum+house};
 };
 const dateInput=$('auditDate'),excelInput=$('auditExcel'),noteInput=$('auditNote');
 dateInput.value=$('date').value;
 const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 function render(){
   const date=dateInput.value,ref=state.excelAudit[date],e=estimate(date);
   excelInput.value=ref?.total??'';noteInput.value=ref?.note??'';
   $('auditResult').innerHTML=`<div class="stats" style="margin-top:14px"><div class="stat"><strong>${e.count}</strong><span>Camere eligibile</span></div><div class="stat"><strong>${euroValue(e.total)} €</strong><span>Estimare aplicație</span></div><div class="stat"><strong>${ref?euroValue(ref.total)+' €':'—'}</strong><span>Referință Excel</span></div><div class="stat"><strong>${ref?euroValue(e.total-ref.total)+' €':'—'}</strong><span>Diferență aplicație − Excel</span></div></div>`;
   const all=Object.entries(state.excelAudit).filter(([d,r])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&r&&Number.isFinite(r.total)).sort(([a],[b])=>a.localeCompare(b));
   $('auditHistory').innerHTML=all.length?'<table><thead><tr><th>Data</th><th>Camere</th><th>Estimare €</th><th>Excel €</th><th>Diferență €</th><th>Observații</th></tr></thead><tbody>'+all.map(([d,r])=>{const v=estimate(d);return '<tr>'+[d,v.count,euroValue(v.total),euroValue(r.total),euroValue(v.total-r.total),r.note||''].map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>'}).join('')+'</tbody></table>':'<p class="note">Nu există încă referințe Excel introduse.</p>';
 }
 dateInput.onchange=render;
 $('auditSave').onclick=()=>{const date=dateInput.value,raw=excelInput.value.trim(),total=Number(raw);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||raw===''||!Number.isFinite(total)||total<0){alert('Introdu o dată și o sumă Excel validă.');return}state.excelAudit[date]={total,note:noteInput.value.trim()};try{save();render()}catch(e){alert('Salvarea a eșuat. Exportă un backup.')}};
 $('auditDelete').onclick=()=>{const date=dateInput.value;if(state.excelAudit[date]&&confirm('Ștergi referința Excel pentru '+date+'?')){delete state.excelAudit[date];save();render()}};
 $('auditExport').onclick=()=>{const rows=Object.entries(state.excelAudit).sort(([a],[b])=>a.localeCompare(b)).map(([d,r])=>{const v=estimate(d);return [d,v.count,v.total.toFixed(2),r.total.toFixed(2),(v.total-r.total).toFixed(2),r.note||''].map(csvCell).join(';')});download('alfa-excel-abgleich.csv','\ufeffData;Camere;Estimare EUR;Excel EUR;Diferenta EUR;Observatii\n'+rows.join('\n'),'text/csv;charset=utf-8')};
 button.onclick=()=>{document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b===button));document.querySelectorAll('main section').forEach(s=>s.classList.toggle('hidden',s!==section));dateInput.value=$('date').value;render()};
 const limits=$('settings').querySelectorAll('.panel')[1];limits.querySelector('.note').textContent+=' v0.8: compararea Excel este manuală și nu certifică facturarea.';
 render();
})();
