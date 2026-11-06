// v1.0 - Detailed line-by-line reconciliation against independently verified reference CSV.
(function(){
 const section=document.getElementById('audit');if(!section)return;
 const panel=document.createElement('div');panel.className='panel';
 panel.innerHTML=`<h2>Einzelpositionen-Abgleich · verificare pe cameră</h2><p class="note">Importă un CSV cu poziții verificate din Excel (Data;Camera;Serviciu;SumaEUR). Nu importă formule și nu certifică automat corectitudinea. Pozițiile din aplicație provin din jurnalul fixat (Prüfprotokoll).</p><div class="toolbar"><label class="btn">Importă referințe CSV <input type="file" id="detailImport" accept=".csv,text/csv" style="display:none"></label><button id="detailTemplate">Model CSV</button><button id="detailExport">Export diferențe CSV</button><button id="detailClear">Șterge referințele</button></div><div id="detailStatus" class="note"></div><div class="tablewrap" id="detailTable"></div>`;
 section.appendChild(panel);
 if(!state.detailReferences||typeof state.detailReferences!=='object'||Array.isArray(state.detailReferences))state.detailReferences={};
 const el=id=>document.getElementById(id), q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
 const money=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
 const key=(date,room,service)=>[date,String(room).trim(),String(service).trim().toLowerCase()].join('|');
 function parseCSV(input){
  const text=input.replace(/^\uFEFF/,'');let rows=[],row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){let c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c}else if(c==='"')quoted=true;else if(c===';'){row.push(cell);cell=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=''}else cell+=c}
  if(quoted)throw Error('CSV: ghilimele neînchise');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
 }
 function validate(input){
  const rows=parseCSV(input);if(rows.length<2)throw Error('CSV fără poziții');
  const header=rows.shift().map(x=>x.trim().toLowerCase());
  const required=['data','camera','serviciu','sumaeur'];if(header.length!==4||required.some((x,i)=>header[i]!==x))throw Error('Antet obligatoriu: Data;Camera;Serviciu;SumaEUR');
  const parsed={};for(let i=0;i<rows.length;i++){
   const r=rows[i].map(x=>x.trim());if(r.length!==4)throw Error('Linia '+(i+2)+': patru coloane obligatorii');
   const [date,room,service,raw]=r;
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Data invalidă la linia '+(i+2));
   if(!/^\d{3,4}$/.test(room)||!['Checkout','Stayover','Extra'].includes(service))throw Error('Camera sau serviciul invalid la linia '+(i+2));
   if(!/^-?\d+(?:[.,]\d{1,2})?$/.test(raw))throw Error('Sumă invalidă la linia '+(i+2));
   const amount=Number(raw.replace(',','.'));if(!Number.isFinite(amount)||amount<0)throw Error('Sumă negativă/invalidă la linia '+(i+2));
   const k=key(date,room,service);if(parsed[k])throw Error('Poziție duplicată la linia '+(i+2)+': '+k);
   parsed[k]={date,room,service,amount};
  }return parsed;
 }
 function compare(){
  const reference=state.detailReferences||{},app={};
  for(const [date,s] of Object.entries(state.auditSnapshots||{})){if(!s||!Array.isArray(s.lines))continue;for(const line of s.lines){const k=key(date,line.room,line.service);app[k]={date,room:String(line.room),service:line.service,amount:Number(line.price)};}}
  return [...new Set([...Object.keys(reference),...Object.keys(app)])].sort().map(k=>{
   const a=app[k],r=reference[k],v=a||r;return {...v,app:a?.amount??null,reference:r?.amount??null,status:!a?'Lipsește în aplicație':!r?'Lipsește în referință':Math.abs(a.amount-r.amount)<0.005?'Identic':'Diferență'};
  });
 }
 function render(){
  const rows=compare(),checked=rows.filter(x=>x.app!==null&&x.reference!==null),ok=checked.filter(x=>x.status==='Identic').length;
  el('detailStatus').textContent=`Referințe importate: ${Object.keys(state.detailReferences).length} · Poziții comparate: ${checked.length} · Identice: ${ok} · Diferențe: ${checked.length-ok} · Fără pereche: ${rows.length-checked.length}. Importul nu înlocuiește jurnalul fixat.`;
  el('detailTable').innerHTML=rows.length?'<table><thead><tr><th>Data</th><th>Camera</th><th>Serviciu</th><th>Aplicație €</th><th>Excel €</th><th>Diferență €</th><th>Stare</th></tr></thead><tbody>'+rows.slice(0,1000).map(x=>'<tr>'+[x.date,x.room,x.service,x.app===null?'—':money(x.app),x.reference===null?'—':money(x.reference),x.app===null||x.reference===null?'—':money(x.app-x.reference),x.status].map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p class="note">Importă un CSV de referință și fixează cel puțin o zi în Prüfprotokoll.</p>';
 }
 el('detailImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2000000)throw Error('Fișier prea mare (max. 2 MB)');const parsed=validate(await file.text());if(!confirm('Înlocuiești referințele de verificare existente cu '+Object.keys(parsed).length+' poziții?'))return;state.detailReferences=parsed;save();render()}catch(err){alert('Import refuzat: '+err.message)}finally{e.target.value=''}};
 el('detailTemplate').onclick=()=>download('alfa-referinte-model.csv','\ufeffData;Camera;Serviciu;SumaEUR\n2026-11-01;201;Checkout;11,00\n2026-11-01;202;Stayover;10,00\n','text/csv;charset=utf-8');
 el('detailExport').onclick=()=>{const rows=compare();download('alfa-pozitii-abgleich.csv','\ufeff'+['Data','Camera','Serviciu','AplicatieEUR','ExcelEUR','DiferentaEUR','Status'].map(q).join(';')+'\n'+rows.map(x=>[x.date,x.room,x.service,x.app??'',x.reference??'',x.app!==null&&x.reference!==null?(x.app-x.reference).toFixed(2):'',x.status].map(q).join(';')).join('\n'),'text/csv;charset=utf-8')};
 el('detailClear').onclick=()=>{if(!confirm('Ștergi toate referințele detaliate?'))return;state.detailReferences={};save();render()};
 const auditButton=document.querySelector('[data-tab="audit"]');const old=auditButton.onclick;auditButton.onclick=()=>{old?.();render()};render();
})();
