// v1.1: auditable staff/day ledger. This is NOT an implementation of original Alfa formulas.
(function(){
 const host=document.getElementById('billing');if(!host)return;
 const p=document.createElement('div');p.className='panel';p.innerHTML='<h2>Personal × zi · Alfa Prüfmatrix (v1.1)</h2><p class="note">Registru verificabil pe angajat, zi și serviciu. Totalurile sunt ESTIMATIVE, pe baza tarifelor configurate; nu sunt echivalente cu formulele din Excel. Exportul include fiecare cameră și motivul excluderii.</p><div class="toolbar"><label>Luna <input id="ledgerMonth" type="month" value="2026-11"></label><button id="ledgerCsv" class="primary">Export poziții și excluderi CSV</button></div><div id="ledgerSummary"></div><div class="tablewrap" id="ledgerTable"></div><details><summary>Trasabilitate formule Excel originale</summary><p class="note">În foaia Alfa Abrechnung, D12 folosește IFERROR(VLOOKUP($C12,\'01\'!$EO$12:$ER$64,2,FALSE),""). Prin urmare, sursa calculelor originale este un sumar zilnic după numele cleanerului, nu doar lista camerelor finalizate. Acest registru permite compararea per cleaner, dar nu pretinde să reproducă formulele din EO:ER.</p></details>';
 host.appendChild(p);
 const $=id=>document.getElementById(id);
 const services=['Checkout','Stayover','Extra'];
 const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 const ratesKey='hk_alfa_service_rates_v05';
 function rates(){try{return JSON.parse(localStorage.getItem(ratesKey))||{}}catch(_){return {}}}
 function rows(){const month=$('ledgerMonth').value,tariffs=rates(),out=[];for(const [date,rec] of Object.entries(state.days||{})){if(!date.startsWith(month)||!rec||typeof rec!=='object')continue;for(const [room,d] of Object.entries(rec)){if(!d||typeof d!=='object')continue;if(!d.cleaner&&!d.service&&(!d.status||d.status==='Neplanificat'))continue;let reason='';if(d.status!=='Finalizată')reason='Nu este finalizată';else if(!d.cleaner)reason='Cleaner lipsă';else if(!services.includes(d.service))reason='Serviciu lipsă/invalid';const tariff=tariffs[d.service]?.[d.checker?'checked':'unchecked'];if(!reason&&(!Number.isFinite(Number(tariff))||Number(tariff)<0))reason='Tarif invalid';out.push({date,room,cleaner:d.cleaner||'',checker:d.checker||'',service:d.service||'',status:d.status||'',price:reason?'':Number(tariff),reason});}}return out.sort((a,b)=>a.date.localeCompare(b.date)||a.cleaner.localeCompare(b.cleaner)||a.room.localeCompare(b.room));}
 function render(){const r=rows(),eligible=r.filter(x=>!x.reason),excluded=r.filter(x=>x.reason),tot=eligible.reduce((s,x)=>s+x.price,0),group=new Map();for(const x of eligible){const k=x.date+'|'+x.cleaner;let a=group.get(k);if(!a){a={date:x.date,cleaner:x.cleaner,checkout:0,stayover:0,extra:0,count:0,total:0};group.set(k,a)}a.count++;a.total+=x.price;a[x.service.toLowerCase()]++}
 $('ledgerSummary').textContent=`Poziții facturabile: ${eligible.length} · Excluse: ${excluded.length} · Total camere estimativ: ${tot.toLocaleString('de-DE',{style:'currency',currency:'EUR'})}. Orele Houseman nu sunt incluse în acest registru.`;
 $('ledgerTable').innerHTML='<table><tr><th>Zi</th><th>Cleaner</th><th>Checkout</th><th>Stayover</th><th>Extra</th><th>Camere</th><th>Total € estimativ</th></tr>'+[...group.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.cleaner.localeCompare(b.cleaner)).map(x=>'<tr>'+[x.date,x.cleaner,x.checkout,x.stayover,x.extra,x.count,x.total.toFixed(2)].map(y=>'<td>'+esc(y)+'</td>').join('')+'</tr>').join('')+'</table>';
 }
 $('ledgerCsv').onclick=()=>{const header=['Data','Camera','Cleaner','Checker','Serviciu','Status','EUR estimativ','Motiv excludere'];download('alfa-registru-'+$('ledgerMonth').value+'.csv','\ufeff'+header.map(quote).join(';')+'\n'+rows().map(x=>[x.date,x.room,x.cleaner,x.checker,x.service,x.status,x.price,x.reason].map(quote).join(';')).join('\n'),'text/csv;charset=utf-8')};
 $('ledgerMonth').onchange=render;
 document.querySelector('[data-tab="billing"]').addEventListener('click',render);
 $('rooms').addEventListener('change',render);
 render();
})();
