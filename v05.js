// v0.5 — service-specific provisional tariffs, day-close checks, and reconciliations.
// No claim of parity with the source workbook.
(function(){
 const services=['Checkout','Stayover','Extra'];
 const key='hk_alfa_service_rates_v05';
 let matrix;try{matrix=JSON.parse(localStorage.getItem(key))||{}}catch(_){matrix={}}
 const ensure=()=>{for(const s of services){if(!matrix[s]||typeof matrix[s]!=='object')matrix[s]={checked:num(rates.checked),unchecked:num(rates.unchecked)};for(const t of ['checked','unchecked'])if(!Number.isFinite(+matrix[s][t])||+matrix[s][t]<0)matrix[s][t]=num(rates[t])}};
 ensure();
 const price=r=>num(matrix[r.service]?.[r.checker?'checked':'unchecked']);
 const eligible=(date)=>state.rooms.flatMap(r=>{const d=state.days[date]?.[r.number]||{};return d.status==='Finalizată'&&d.cleaner&&services.includes(d.service)?[{date,room:r.number,category:r.category,...d,price:price(d)}]:[]});
 billRows=function(){return eligible($('date').value).map(({date,category,...r})=>({...r,checked:!!r.checker}))};
 monthBillingRows=function(){return Object.keys(state.days).filter(d=>d.startsWith($('month').value)).sort().flatMap(eligible)};
 const section=$('billing').querySelector('.panel');
 const wrapper=document.createElement('div');wrapper.className='panel';wrapper.innerHTML='<h2>Tarife pe tip de serviciu (estimative)</h2><p class="note">Tarife independente pentru Checkout / Stayover / Extra. Valorile inițiale provin din setările provizorii, NU din formulele Alfa. Modificarea tarifelor recalculează inclusiv zilele anterioare.</p><div id="serviceRateGrid" class="tablewrap"></div><button id="serviceRateCsv">Export tarife CSV</button>';
 section.after(wrapper);
 const renderMatrix=()=>{$('serviceRateGrid').innerHTML='<table><tr><th>Serviciu</th><th>Cu checker (€)</th><th>Fără checker (€)</th></tr>'+services.map(s=>'<tr><td>'+esc(s)+'</td>'+['checked','unchecked'].map(t=>'<td><input type="number" min="0" step="0.01" style="width:100px" data-service="'+s+'" data-kind="'+t+'" value="'+matrix[s][t]+'"></td>').join('')+'</tr>').join('')+'</table>'};
 $('serviceRateGrid').addEventListener('change',e=>{const s=e.target.dataset.service,t=e.target.dataset.kind;if(!services.includes(s)||!['checked','unchecked'].includes(t))return;const v=Number(e.target.value);if(!Number.isFinite(v)||v<0){alert('Tarif invalid');renderMatrix();return}matrix[s][t]=v;localStorage.setItem(key,JSON.stringify(matrix));renderBilling();renderMonthlyBilling()});
 $('serviceRateCsv').onclick=()=>download('tarife-servicii-v05.csv','\ufeffServiciu;Cu checker EUR;Fara checker EUR\n'+services.map(s=>[s,matrix[s].checked,matrix[s].unchecked].join(';')).join('\n'),'text/csv;charset=utf-8');
 // Extend backup with tariff matrix, preserving existing format.
 $('backup').onclick=()=>download('housekeeping-backup-v05-'+$('date').value+'.json',JSON.stringify({...state,_billingRates:rates,_serviceRates:matrix,_backupVersion:5,_exportedAt:new Date().toISOString()},null,2),'application/json');
 const restore=$('restore').onchange;
 $('restore').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data._serviceRates){for(const s of services){const obj=data._serviceRates[s];if(obj&&['checked','unchecked'].every(t=>Number.isFinite(+obj[t])&&+obj[t]>=0))matrix[s]={checked:+obj.checked,unchecked:+obj.unchecked}}localStorage.setItem(key,JSON.stringify(matrix))}}catch(_){};await restore(e)};
 // Monthly reconciliation: distinguish planned, completed, billable and excluded.
 const report=$('report').querySelector('.panel');const reconciliation=document.createElement('div');reconciliation.className='panel';reconciliation.innerHTML='<h2>Control lunar înainte de facturare</h2><p class="note">Verifică diferența dintre camerele finalizate și cele incluse în estimare. Nu reprezintă validarea față de Excel.</p><div id="reconciliation"></div><button id="reconciliationCsv" class="primary">Export reconciliere CSV</button>';report.after(reconciliation);
 const reconRows=()=>Object.keys(state.days).filter(d=>d.startsWith($('month').value)).sort().map(date=>{let entries=Object.values(state.days[date]||{});let completed=entries.filter(x=>x.status==='Finalizată').length;let billed=eligible(date).length;let errors=issuesFor(date).length;return {date,completed,billed,excluded:completed-billed,errors}});
 const renderRecon=()=>{let rows=reconRows();$('reconciliation').innerHTML='<div class="tablewrap"><table><tr><th>Data</th><th>Finalizate</th><th>Facturabile</th><th>Excluse</th><th>Avertizări</th></tr>'+rows.map(r=>'<tr>'+Object.values(r).map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</table></div>'};
 $('reconciliationCsv').onclick=()=>download('reconciliere-'+$('month').value+'.csv','\ufeffData;Finalizate;Facturabile;Excluse;Avertizari\n'+reconRows().map(r=>Object.values(r).join(';')).join('\n'),'text/csv;charset=utf-8');
 const oldMonth=$('month').onchange;$('month').onchange=()=>{oldMonth();renderRecon()};
 const oldReport=document.querySelector('[data-tab="report"]').onclick;document.querySelector('[data-tab="report"]').onclick=()=>{oldReport();renderRecon()};
 // Refresh dashboard and billing when room assignments change.
 $('rooms').addEventListener('change',()=>{renderBilling();renderMonthlyBilling();renderRecon()});
 renderMatrix();renderRecon();renderBilling();renderMonthlyBilling();
})();
