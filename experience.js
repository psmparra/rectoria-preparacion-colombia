/* Presentación personalizada; los datos académicos y la persistencia siguen en app.js. */
(() => {
 const app=document.getElementById('app');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state=()=>window.RECTORIA_ACTIVE_STATE;
 const active=()=>document.getElementById('profile-select')?.value||'Mao';
 const stats=s=>{
   const used=new Set(s.cycleUsed||s.attempts.filter(a=>a.mode!=='reinforce').flatMap(a=>a.ids));
   const practiced=new Set(s.attempts.flatMap(a=>a.ids));
   const latest=new Map();s.attempts.forEach(a=>a.ids.forEach(id=>latest.set(id,a.answers[id]===window.RECTORIA_BANK.questions.find(q=>q.id===id)?.correct)));
   const days=new Set(s.attempts.map(a=>new Date(a.finished).toLocaleDateString('en-CA')));
   let streak=0;const cursor=new Date();if(!days.has(cursor.toLocaleDateString('en-CA')))cursor.setDate(cursor.getDate()-1);
   while(days.has(cursor.toLocaleDateString('en-CA'))){streak++;cursor.setDate(cursor.getDate()-1);}
   return {used,practiced,streak,errors:[...latest.values()].filter(v=>!v).length};
 };
 function profileDialog(){
   let saved={};try{saved=JSON.parse(localStorage.getItem('rectoria.v1'))?.profiles||{};}catch{}
   const dialog=document.createElement('dialog');dialog.className='profile-dialog';
   dialog.innerHTML=`<form method="dialog"><div class="row spread"><div class="overline">TU ESPACIO PERSONAL</div><button aria-label="Cerrar selector de perfil">✕</button></div><h2>¿Quién va a estudiar hoy?</h2><p class="muted">Elige tu perfil para continuar tu propio camino.</p></form><div class="profile-options">${['Mao','Nata'].map(name=>{const p=saved[name]||(active()===name?state():{attempts:[]});const last=p.attempts.at(-1);return `<button data-person="${name}" class="person-card ${name===active()?'is-active':''}"><span class="avatar">${name[0]}</span><span><strong>${name}</strong><small>${p.attempts.length} sesiones · Último resultado: ${last?last.result.percent.toFixed(1)+'%':'por comenzar'}</small></span><span>${name===active()?'✓':'→'}</span></button>`;}).join('')}</div><p class="muted fine">Los perfiles se guardan en este navegador. Puedes exportar un respaldo desde Ajustes.</p>`;
   document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('click',e=>{const button=e.target.closest('[data-person]');if(!button)return;const picker=document.getElementById('profile-select');picker.value=button.dataset.person;picker.dispatchEvent(new Event('change',{bubbles:true}));dialog.close();});dialog.showModal();
 }
 function enhance(){
   const s=state();if(!s)return;const name=active(),info=stats(s),total=window.RECTORIA_BANK.questions.length;
   const page=(location.hash.slice(1)||'inicio').split('/')[0];
   if(page==='practicar'){
     const count=document.getElementById('count'),form=document.getElementById('start-form');
     const note=form?.querySelector('p');
     const update=()=>{if(note){const ms=window.RectoriaCore.timeLimitMs(Number(count.value)),sec=Math.round(ms/1000);note.textContent=`Límite: ${Math.floor(sec/3600)} h ${Math.floor(sec%3600/60)} min ${sec%60} s. Proporcional a 4 horas para 140 preguntas. Se aplica a todas las modalidades y sigue corriendo al cerrar la app. En refuerzo se ajusta a la cantidad real de preguntas.`;}};
     if(count){count.addEventListener('change',update);update();}
   }
   if(page==='resultados'){
     const id=location.hash.split('/')[1],a=id?s.attempts.find(a=>a.id===id):s.attempts.at(-1);
     if(a?.timedOut){const notice=document.createElement('p');notice.className='notice';notice.textContent='Sesión finalizada automáticamente por tiempo agotado. Las preguntas pendientes se incluyen como no acertadas.';app.querySelector('.heading').append(notice);}
   }
   document.body.classList.toggle('focus-study',page==='examen');
   const picker=document.querySelector('.profile-picker');if(picker&&!picker.parentElement.querySelector('.profile-trigger')){picker.classList.add('accessible-picker');const button=document.createElement('button');button.className='profile-trigger';button.innerHTML=`<span class="avatar small">${name[0]}</span><span>${name}<small>Cambiar perfil</small></span><span>⌄</span>`;button.setAttribute('aria-label',`Perfil ${name}. Cambiar perfil`);button.onclick=profileDialog;picker.before(button);}
   if(page==='inicio'){
     const title=app.querySelector('h1');title.textContent=`${name}, tu próximo paso empieza hoy.`;
     const hero=app.querySelector('.hero');
     const last=s.attempts.at(-1),remaining=total-info.used.size,progress=Math.round(info.used.size/total*100);
     hero.innerHTML=`<div class="hero-copy"><div class="overline">${s.session?'TU SESIÓN TE ESTÁ ESPERANDO':'UNA SESIÓN CON PROPÓSITO'}</div><h2>${s.session?'Retoma donde lo dejaste.':'20 preguntas. Un paso más cerca.'}</h2><p>${s.session?`Tus respuestas están guardadas. Continúa la pregunta ${s.session.cursor+1} de ${s.session.ids.length}.`:`${name}, dedica un momento a practicar con preguntas nuevas de todo el banco.`}</p><div class="row"><button class="daily-start">${s.session?'Continuar mi sesión':'Comenzar 20 preguntas'} <span>→</span></button><a href="#practicar" class="hero-secondary">Elegir otra sesión</a></div><div class="hero-footnote">${s.session?'Sesión recuperable en este navegador':'Selección aleatoria · Sin repetir en tu ciclo'}</div></div><div class="cycle-progress"><div class="cycle-ring" style="--progress:${progress}%"><strong>${progress}%</strong><span>DEL CICLO</span></div><strong>${remaining} preguntas nuevas</strong><small>${info.used.size} de ${total} utilizadas</small></div>`;
     hero.querySelector('.daily-start').onclick=()=>{if(s.session){location.hash='examen';return;}const quick=app.querySelector('[data-mode="exam"]');quick.click();setTimeout(()=>{const count=document.getElementById('count');if(count){count.value='20';document.getElementById('start-form').requestSubmit();}},0);};
     const cards=app.querySelectorAll('.stat');
     cards[0].innerHTML=`<span class="label">Tu último resultado</span><strong>${last?last.result.percent.toFixed(1)+'%':'—'}</strong><small>${last?(last.result.percent>=s.goal?'Meta alcanzada':`A ${Math.max(0,s.goal-last.result.percent).toFixed(1)} puntos de tu meta`):'Tu primera sesión marcará el inicio'}</small>`;
     cards[1].innerHTML=`<span class="label">Preguntas practicadas</span><strong>${info.practiced.size}<em> / ${total}</em></strong><small>Preguntas únicas de sesiones finalizadas</small>`;
     cards[2].innerHTML=`<span class="label">Tu constancia</span><strong>${info.streak}<em> ${info.streak===1?'día':'días'}</em></strong><small>Racha actual de sesiones completadas</small>`;
     const week=s.attempts.filter(a=>a.finished>=Date.now()-7*86400000);const achievements=[];if(s.attempts.length)achievements.push('Primer paso completado');if(s.attempts.some(a=>a.result.percent>=s.goal))achievements.push('Meta personal alcanzada');if(info.practiced.size>=total)achievements.push('Banco completo recorrido');
     const weekly=document.createElement('section');weekly.className='weekly-strip';weekly.innerHTML=`<div><span class="overline">TUS ÚLTIMOS 7 DÍAS</span><h3>${week.length?`${week.length} sesiones · ${week.reduce((n,a)=>n+a.result.answered,0)} respuestas`:'Tu próximo logro empieza con una sesión'}</h3></div><div class="achievement-list">${achievements.length?achievements.map(a=>`<span class="achievement">✧ ${a}</span>`).join(''):'<span class="muted">Un paso a tu ritmo, cada día.</span>'}</div>`;app.querySelector('.stats').after(weekly);
   }
   if(page==='examen'){
     const aside=app.querySelector('.question-layout>aside');
     if(aside&&!aside.parentElement.querySelector('.journey-toggle')){
       const wrapper=document.createElement('details');wrapper.className='journey-panel';const summary=document.createElement('summary');summary.className='journey-toggle';summary.textContent='Ver recorrido y finalizar sesión';aside.before(wrapper);wrapper.append(summary,aside);
     }
     const subtitle=app.querySelector('.heading p');if(subtitle)subtitle.textContent='Tu sesión se guarda automáticamente · Responde a tu ritmo';
   }
   app.querySelectorAll('.feedback').forEach(el=>{if(el.dataset.organized)return;el.dataset.organized='1';const p=el.querySelector('p');if(p){const h=document.createElement('h3');h.textContent='Por qué esta es la respuesta';p.before(h);}const parent=el.closest('.question-layout');if(parent){const q=s.session?.ids[s.session.cursor];if(q&&!s.marks.includes(q)&&!el.querySelector('[data-mark]')){const button=document.createElement('button');button.dataset.mark=q;button.textContent='☆ Añadir a mi repaso';el.append(button);}}});
   if(page==='resultados'){
     const id=location.hash.split('/')[1],a=id?s.attempts.find(a=>a.id===id):s.attempts.at(-1);if(a){const previous=s.attempts[s.attempts.indexOf(a)-1],met=a.result.percent>=s.goal;const summary=document.createElement('section');summary.className='result-summary '+(met?'goal-met':'');summary.innerHTML=`<div class="overline">${met?'UN LOGRO QUE CUENTA':'CADA SESIÓN TE ENSEÑA ALGO'}</div><h2>${name}, obtuviste ${a.result.correct} de ${a.result.total} aciertos.</h2><p>${met?`Alcanzaste tu meta del ${s.goal} %.`:`Tu siguiente paso: revisar ${a.result.total-a.result.correct} errores o pendientes.`}</p><div class="row result-facts"><span>${a.result.answered-a.result.correct} errores</span><span>${a.result.total-a.result.answered} pendientes</span><span>${Math.max(0,Math.floor((a.finished-a.started)/60000))} min de sesión</span><span>${previous?`${(a.result.percent-previous.result.percent).toFixed(1)} puntos frente al intento anterior`:'Tu primer punto de referencia'}</span></div><small>La comparación es orientativa: las preguntas y extensiones pueden ser diferentes.</small>`;app.querySelector('.heading').after(summary);}
   }
   if(page==='biblioteca'){
     const tabs=app.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-unseen]')){const unseen=window.RECTORIA_BANK.questions.filter(q=>!info.practiced.has(q.id)&&!s.session?.ids.includes(q.id));const button=document.createElement('button');button.dataset.unseen='1';button.textContent=`Sin practicar · ${unseen.length}`;tabs.append(button);button.onclick=()=>{tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const panel=tabs.nextElementSibling;panel.innerHTML=`<h2>Tu próximo descubrimiento</h2><p class="muted">${unseen.length} preguntas aún no están en tus sesiones completadas ni en tu sesión actual. La vista previa no las consume del ciclo.</p><button data-mode="exam" class="primary">Practicar preguntas nuevas →</button>`;for(const q of unseen){const item=document.createElement('details');item.className='unseen-item';item.innerHTML=`<summary>Pregunta ${q.id} · Ver enunciado</summary><p>${escape(q.text)}</p>`;panel.append(item);}};}
   }
 }
 const observer=new MutationObserver(()=>{observer.disconnect();enhance();observer.observe(app,{childList:true});});
 enhance();observer.observe(app,{childList:true});
})();
