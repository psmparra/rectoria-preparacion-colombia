(() => {
  function icon(name) {
    const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
    for(const [key,value] of Object.entries({width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':1.7,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) svg.setAttribute(key,value);
    for(const [tag,attrs] of window.RECTORIA_ICONS[name]||[]){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);svg.append(el);}
    return svg;
  }
  const navIcons=['layout-dashboard','notebook-pen','library','chart-no-axes-combined','rotate-ccw-clock'];
  document.querySelectorAll('nav a').forEach((a,i)=>a.replaceChild(icon(navIcons[i]),a.firstChild));
  // Mismos controles accesibles en escritorio y móvil, sin duplicar identificadores.
  const controls=document.createElement('details');controls.className='mobile-settings';
  const summary=document.createElement('summary');summary.textContent='Ajustes';controls.append(summary);
  const content=document.createElement('div');content.className='mobile-settings-content';
  document.querySelectorAll('.sidebar-bottom .quiet').forEach(el=>content.append(el));controls.append(content);
  document.querySelector('.topbar').append(controls);
  const desktop=document.createElement('div');desktop.className='desktop-tools';
  // Mantiene los controles en el lateral ancho y los mueve al menú en pantallas pequeñas.
  document.querySelector('.sidebar-bottom').append(desktop);
  const media=matchMedia('(max-width:720px)');
  function relocate(){const target=media.matches?content:desktop;document.querySelectorAll('#theme,#export,.file-label:has(#restore)').forEach(el=>target.append(el));}
  media.addEventListener('change',relocate);relocate();
  function enhance(){
    document.querySelectorAll('.symbol').forEach((el,i)=>el.replaceChildren(icon(['notebook-pen','sparkles','rotate-ccw'][i%3])));
    document.querySelectorAll('.hero button span').forEach(el=>el.replaceChildren(icon('arrow-up-right')));
    let s=null;try{s=JSON.parse(localStorage.getItem('rectoria.v1')||'null');}catch{}
    if(location.hash==='#historial' && s?.attempts.length && !document.getElementById('competency-evolution')){
      const section=document.createElement('section');section.id='competency-evolution';section.className='panel';section.style.marginTop='24px';
      section.innerHTML='<h2>Evolución por competencia</h2><p class="muted">Porcentaje de aciertos de cada competencia en cada sesión que la incluyó.</p>';
      const names=[...new Set(s.attempts.flatMap(a=>Object.keys(a.result.competencies)))];
      names.forEach(name=>{const h=document.createElement('h3');h.textContent=name;section.append(h);const row=document.createElement('div');row.className='row';row.style.marginBottom='24px';s.attempts.forEach((a,i)=>{const c=a.result.competencies[name];if(!c)return;const button=document.createElement('button');button.dataset.result=a.id;button.textContent=`#${i+1} · ${Math.round(c.correct/c.total*100)}%`;button.title=new Date(a.finished).toLocaleString('es-CO');row.append(button);});section.append(row);});document.getElementById('app').append(section);
    }
    document.querySelectorAll('.premise').forEach(el=>{if(el.querySelector('h3'))return;const id=el.querySelector('.overline').textContent.split(' · ').at(-1), situation=window.RECTORIA_BANK.situations.find(v=>v.id===id);if(situation){const h=document.createElement('h3');h.textContent=situation.title;el.querySelector('.overline').after(h);}});
    document.querySelectorAll('.review-item').forEach(el=>{
      if(el.dataset.enhanced)return;el.dataset.enhanced='true';
      const id=Number(el.querySelector('b')?.textContent.match(/Pregunta (\d+)/)?.[1]);
      const q=window.RECTORIA_BANK.questions.find(q=>q.id===id);if(!q)return;
      const count=(s?.attempts||[]).filter(a=>a.ids.includes(id)&&a.answers[id]!==undefined&&a.answers[id]!==q.correct).length;
      if(count){const small=document.createElement('p');small.className='muted';small.textContent=`Respuestas incorrectas registradas: ${count}`;el.append(small);}
      if(location.hash.startsWith('#resultados')){
        const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Releer situación y alternativas';detail.append(summary);
        const situation=window.RECTORIA_BANK.situations.find(v=>v.id===q.situationId);
        if(situation){const p=document.createElement('p');p.textContent=situation.title+' — '+situation.text;detail.append(p);}
        q.options.forEach((o,i)=>{const p=document.createElement('p');p.textContent='ABC'[i]+'. '+o;detail.append(p);});el.append(detail);
      }
    });
  }
  // El observador atiende las vistas que la aplicación reemplaza al navegar.
  const observer=new MutationObserver(()=>{observer.disconnect();try{enhance();}catch{}observer.observe(document.getElementById('app'),{childList:true});});
  enhance();observer.observe(document.getElementById('app'),{childList:true});
})();
