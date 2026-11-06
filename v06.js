// v0.6: manual OPERA reconciliation; does not claim to reproduce workbook's Data Diskrepanz formulas.
(function(){
 const nav=document.querySelector('nav');
 const btn=document.createElement('button');btn.dataset.tab='discrepancy';btn.textContent='Diskrepanz';nav.insertBefore(btn,nav.querySelector('[data-tab="settings"]'));
 const sec=document.createElement('section');sec.id='discrepancy';sec.className='hidden';sec.innerHTML=`<div class="panel"><h2>OPERA / Data Diskrepanz</h2><p class="note">Introdu cifrele de referință din OPERA pentru ziua selectată. Compararea este o verificare nouă, simplificată; NU este o reproducere a formulelor din foaia originală.</p><div class="toolbar"><label>OPERA Checkout <input id="operaCheckout" type="number" min="0" step="1"></label><label>OPERA Stayover <input id="operaStayover" type="number" min="0" step="1"></label><label>OPERA Out of Order <input id="operaOoo" type="number" min="0" step="1"></label><button id="operaSave" class="primary">Salvează referința</button></div><div id="operaComparison"></div><button id="operaCsv">Export comparație CSV</button></div><div class="panel"><h2>Diferențe în luna selectată</h2><div id="operaMonthly"></div><button id="operaMonthlyCsv">Export lunar CSV</button></div>`;
 document.querySelector('main').appendChild(sec);
 if(!state.operaReference||typeof state.operaReference!=='object')state.operaReference={};
 const fields=[['checkout','operaCheckout','Checkout'],['stayover','operaStayover','Stayover'],['ooo','operaOoo','Out of Order']];
 const count=(date)=>{const entries=Object.values(state.days[date]||{});return {checkout:entries.filter(x=>x.service==='Checkout'&&x.status==='Finalizată').length,stayover:entries.filter(x=>x.service==='Stayover'&&x.status==='Finalizată').length,ooo:entries.filter(x=>x.status==='Out of Order').length}};
 const comparison=(date)=>{const ref=state.operaReference[date],actual=count(date);return fields.map(([k,,label])=>({date,label,opera:ref?.[k]??null,app:actual[k],difference:ref?.[k]==null?null:actual[k]-ref[k]}))};
 const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const csv=(rows)=>'\ufeffData;Categorie;OPERA;Aplicație;Diferență\n'+rows.map(r=>[r.date,r.label,r.opera,r.app,r.difference].map(csvCell).join(';')).join('\n');
 const show=()=>{const date=$('date').value,ref=state.operaReference[date]||{};for(const [k,id] of fields)$(id).value=ref[k]??'';
 const rows=comparison(date);$('operaComparison').innerHTML='<div class="tablewrap"><table><tr><th>Tip</th><th>OPERA</th><th>Aplicație</th><th>Diferență</th></tr>'+rows.map(r=>`<tr><td>${r.label}</td><td>${r.opera??'—'}</td><td>${r.app}</td><td><b>${r.difference??'—'}</b></td></tr>`).join('')+'</table></div>';
 const dates=Object.keys(state.operaReference).filter(d=>d.startsWith($('month').value)).sort();$('operaMonthly').innerHTML=dates.length?'<div class="tablewrap"><table><tr><th>Data</th><th>Diferențe</th><th>Fără diferențe</th></tr>'+dates.map(d=>{let rs=comparison(d);return `<tr><td>${d}</td><td>${rs.filter(r=>r.difference!==null&&r.difference!==0).length}</td><td>${rs.filter(r=>r.difference===0).length}</td></tr>`}).join('')+'</table></div>':'<p class="note">Nu există încă date OPERA introduse pentru luna selectată.</p>'};
 $('operaSave').onclick=()=>{const vals={};for(const [k,id] of fields){const raw=$(id).value.trim();if(raw===''){alert('Completează toate cele trei câmpuri OPERA.');return}const n=Number(raw);if(!Number.isSafeInteger(n)||n<0||n>10000){alert('Introdu un număr întreg valid (0–10000).');return}vals[k]=n}state.operaReference[$('date').value]=vals;save();show()};
 $('operaCsv').onclick=()=>download('opera-diskrepanz-'+$('date').value+'.csv',csv(comparison($('date').value)),'text/csv;charset=utf-8');
 $('operaMonthlyCsv').onclick=()=>download('opera-diskrepanz-'+$('month').value+'.csv',csv(Object.keys(state.operaReference).filter(d=>d.startsWith($('month').value)).sort().flatMap(comparison)),'text/csv;charset=utf-8');
 btn.onclick=()=>{document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('main section').forEach(s=>s.classList.toggle('hidden',s!==sec));show()};
 $('date').addEventListener('change',show);$('month').addEventListener('change',show);$('rooms').addEventListener('change',()=>{if(!sec.classList.contains('hidden'))show()});
 const limitations=$('settings').querySelectorAll('.panel')[1];limitations.querySelector('.note').textContent+=' Modulul Diskrepanz v0.6 compară doar trei indicatori introduși manual din OPERA; nu reprezintă logica originală.';
 show();
})();
