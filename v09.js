// v0.9: immutable-at-capture comparison snapshots; manual reference remains authoritative.
(function(){
 const tab=document.querySelector('[data-tab="audit"]');
 const panel=document.createElement('div');panel.className='panel';
 panel.innerHTML=`<h2>Prüfprotokoll · comparație fixată</h2><p class="note">Salvează o copie a calculelor și tarifelor din momentul verificării. Istoricul rămâne neschimbat când modifici ulterior tarifele. Nu certifică echivalența cu formulele originale.</p><div class="toolbar"><button class="primary" id="snapCapture">Fixează calculul pentru ziua selectată</button><button id="snapExport">Export jurnal CSV</button></div><div id="snapSummary"></div><div id="snapTable" class="tablewrap"></div>`;
 document.getElementById('audit').appendChild(panel);
 if(!state.auditSnapshots||typeof state.auditSnapshots!=='object'||Array.isArray(state.auditSnapshots))state.auditSnapshots={};
 const ratesKey='hk_alfa_service_rates_v05';
 const rateMatrix=()=>{try{return JSON.parse(localStorage.getItem(ratesKey))||{}}catch(_){return {}}};
 const fmt=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
 const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 function capture(date){
  const matrix=rateMatrix(),entries=state.days?.[date]||{};let roomTotal=0;
  const lines=[];
  for(const room of state.rooms){const r=entries[room.number];if(!r||r.status!=='Finalizată'||!r.cleaner||!['Checkout','Stayover','Extra'].includes(r.service))continue;
   const kind=r.checker?'checked':'unchecked';let price=matrix[r.service]?.[kind];
   if(price===undefined||price===null||price==='')price=kind==='checked'?rates.checked:rates.unchecked;
   price=Number(price);if(!Number.isFinite(price)||price<0)throw Error('Tarif invalid: '+r.service);
   lines.push({room:room.number,service:r.service,cleaner:r.cleaner,checker:r.checker||'',price});roomTotal+=price;
  }
  const hours=Number(state.housemanHours?.[date]||0),houseRate=Number(rates.houseman);
  if(!Number.isFinite(hours)||hours<0||!Number.isFinite(houseRate)||houseRate<0)throw Error('Ore sau tarif Houseman invalid');
  const reference=state.excelAudit?.[date];
  return {date,capturedAt:new Date().toISOString(),lines,roomTotal,hours,houseRate,houseTotal:hours*houseRate,total:roomTotal+hours*houseRate,excelTotal:reference&&Number.isFinite(Number(reference.total))?Number(reference.total):null,excelNote:reference?.note||''};
 }
 function render(){
  const snapshots=Object.values(state.auditSnapshots).filter(s=>s&&Array.isArray(s.lines)).sort((a,b)=>a.date.localeCompare(b.date));
  const matched=snapshots.filter(s=>s.excelTotal!==null&&Math.abs(s.total-s.excelTotal)<0.005).length;
  document.getElementById('snapSummary').textContent=`Zile fixate: ${snapshots.length} · Totaluri identice cu referința introdusă: ${matched} · Fără referință: ${snapshots.filter(s=>s.excelTotal===null).length}`;
  document.getElementById('snapTable').innerHTML=snapshots.length?'<table><thead><tr><th>Zi</th><th>Camere</th><th>Calcul fixat</th><th>Excel introdus</th><th>Diferență</th><th>Fixat la</th><th></th></tr></thead><tbody>'+snapshots.map(s=>'<tr><td>'+esc(s.date)+'</td><td>'+s.lines.length+'</td><td>'+fmt(s.total)+' €</td><td>'+(s.excelTotal===null?'—':fmt(s.excelTotal)+' €')+'</td><td>'+(s.excelTotal===null?'—':fmt(s.total-s.excelTotal)+' €')+'</td><td>'+esc(s.capturedAt.slice(0,16).replace('T',' '))+'</td><td><button data-snap-delete="'+esc(s.date)+'">Șterge</button></td></tr>').join('')+'</tbody></table>':'<p class="note">Nu există calcule fixate.</p>';
 }
 document.getElementById('snapCapture').onclick=()=>{
  const date=document.getElementById('auditDate').value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return alert('Selectează o dată validă');
  if(state.auditSnapshots[date]&&!confirm('Există deja un calcul fixat. Îl înlocuiești?'))return;
  try{const snap=capture(date);state.auditSnapshots[date]=snap;save();render();alert('Calcul fixat: '+fmt(snap.total)+' €. Compară-l cu Excel înainte de utilizare oficială.')}catch(e){alert(e.message)}
 };
 document.getElementById('snapTable').onclick=e=>{const date=e.target.dataset.snapDelete;if(!date)return;if(confirm('Ștergi calculul fixat pentru '+date+'?')){delete state.auditSnapshots[date];save();render()}};
 document.getElementById('snapExport').onclick=()=>{
  const rows=Object.values(state.auditSnapshots).filter(s=>s&&Array.isArray(s.lines)).sort((a,b)=>a.date.localeCompare(b.date));
  const header=['Data','Fixat la','Camere','Camere EUR','Houseman ore','Houseman tarif','Houseman EUR','Total aplicatie EUR','Total Excel EUR','Diferenta EUR','Observatii Excel'];
  download('alfa-pruefprotokoll-v09.csv','\ufeff'+header.map(csv).join(';')+'\n'+rows.map(s=>[s.date,s.capturedAt,s.lines.length,s.roomTotal.toFixed(2),s.hours,s.houseRate.toFixed(2),s.houseTotal.toFixed(2),s.total.toFixed(2),s.excelTotal===null?'':s.excelTotal.toFixed(2),s.excelTotal===null?'':(s.total-s.excelTotal).toFixed(2),s.excelNote].map(csv).join(';')).join('\n'),'text/csv;charset=utf-8');
 };
 const previous=tab.onclick;tab.onclick=()=>{previous();render()};
 render();
})();
