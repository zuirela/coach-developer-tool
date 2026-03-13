/**
 * goals.js – Tavoitteet-näkymä
 * Valmentajakohtaiset tavoitteet, edistyminen, kommentointi
 */
const GoalsView = {
  _filterCoach: 'all',

  render() {
    const coaches = CDApp.getCoaches();
    const all     = CDApp.getGoals();
    const filtered = this._filterCoach==='all' ? all : all.filter(g=>g.coachId===this._filterCoach);
    const active  = filtered.filter(g=>!g.done);
    const done    = filtered.filter(g=>g.done);
    return `
<div class="page-header">
  <div class="page-header-title">Tavoitteet</div>
  <div class="page-header-subtitle">${active.length} aktiivista · ${done.length} saavutettua</div>
</div>
<!-- Suodatin -->
<div style="padding:10px 16px;background:white;border-bottom:1px solid var(--border);overflow-x:auto;white-space:nowrap;display:flex;gap:8px">
  <button class="chip ${this._filterCoach==='all'?'selected':''}" onclick="GoalsView._filterCoach='all';App.navigate('goals')">Kaikki</button>
  ${coaches.map(c=>`<button class="chip ${this._filterCoach===c.id?'selected':''}" onclick="GoalsView._filterCoach='${c.id}';App.navigate('goals')">${c.avatar} ${c.name.split(' ')[0]}</button>`).join('')}
</div>
<div class="content-wrap">
  <!-- Yhteenveto -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
    <div class="stat-card" style="--accent:var(--sjl-blue)"><div class="stat-value">${active.length}</div><div class="stat-label">Aktiivisia</div></div>
    <div class="stat-card" style="--accent:var(--green)"><div class="stat-value">${done.length}</div><div class="stat-label">Saavutettu</div></div>
    <div class="stat-card" style="--accent:var(--sjl-ice)">
      <div class="stat-value">${active.length?Math.round(active.reduce((s,g)=>s+g.progress,0)/active.length)+'%':'–'}</div>
      <div class="stat-label">Edistyminen</div>
    </div>
  </div>

  <!-- Aktiiviset -->
  ${active.length ? `
  <div class="section-title">Aktiiviset tavoitteet</div>
  ${active.map(g=>this._renderCard(g, coaches)).join('')}` : ''}

  <!-- Saavutetut -->
  ${done.length ? `
  <div class="section-title mt-16">Saavutetut tavoitteet 🎉</div>
  ${done.map(g=>this._renderCard(g, coaches)).join('')}` : ''}

  ${!filtered.length ? `<div class="empty-state"><h3>Ei tavoitteita</h3><p>Lisää valmentajalle kehitystavoite.</p></div>` : ''}

  <button class="btn-primary w-full mt-16" onclick="GoalsView.openNew()">+ Lisää tavoite</button>
</div>
<button class="fab" onclick="GoalsView.openNew()">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</button>`;
  },

  _renderCard(g, coaches) {
    const coach    = CDApp.getCoach(g.coachId);
    const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline)-new Date())/(1000*60*60*24)) : null;
    const isLate   = daysLeft !== null && daysLeft < 0 && !g.done;
    return `
    <div class="card mb-10" style="border-left:4px solid ${g.done?'var(--green)':isLate?'var(--red)':'var(--sjl-blue)'}">
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary)">${g.title}</div>
            ${coach?`<div style="font-size:0.75rem;color:var(--text-light);margin-top:2px">${coach.name} · ${coach.team}</div>`:''}
          </div>
          ${g.done?`<span class="badge badge-green">✓ Valmis</span>`:
            isLate?`<span class="badge badge-red">Myöhässä</span>`:
            daysLeft!==null?`<span class="badge badge-gray">${daysLeft}pv jäljellä</span>`:''}
        </div>
        ${g.desc?`<div style="font-size:0.83rem;color:var(--text-secondary);line-height:1.5;margin-bottom:10px">${g.desc}</div>`:''}
        <!-- Edistyminen -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${g.progress}%;background:${g.done?'var(--green)':isLate?'var(--red)':'var(--sjl-blue)'};border-radius:4px;transition:width 0.6s ease"></div>
          </div>
          <span style="font-weight:700;color:${g.done?'var(--green)':'var(--sjl-blue)'};min-width:36px">${g.progress}%</span>
        </div>
        ${g.deadline?`<div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">⏰ Deadline: ${CDApp.formatDate(g.deadline)}</div>`:''}
        ${g.comments?.length?`<div style="background:var(--bg-app);border-radius:var(--radius);padding:8px;margin-bottom:10px">${g.comments.slice(-1).map(c=>`<div style="font-size:0.78rem;font-style:italic;color:var(--text-secondary)">"${c.text}"<span style="color:var(--text-light);margin-left:6px">${CDApp.formatDate(c.date)}</span></div>`).join('')}</div>`:''}
        ${!g.done?`
        <div style="display:flex;gap:6px">
          <button class="btn-ice btn-sm" style="flex:1" onclick="GoalsView.updateProgress('${g.id}')">Päivitä %</button>
          <button class="btn-secondary btn-sm" onclick="GoalsView.addComment('${g.id}')">Kommentti</button>
          <button class="btn-primary btn-sm" onclick="GoalsView.markDone('${g.id}')">✓</button>
          <button style="background:none;border:none;cursor:pointer;color:var(--red);padding:6px" onclick="GoalsView.delete('${g.id}')" title="Poista">✕</button>
        </div>`:
        `<button class="btn-secondary btn-sm" onclick="GoalsView.delete('${g.id}')">Poista</button>`}
      </div>
    </div>`;
  },

  openNew() {
    const coaches = CDApp.getCoaches();
    const body = `
      <div class="form-group"><label>Valmentaja *</label>
        <select id="ng-coach">
          <option value="">Valitse valmentaja...</option>
          ${coaches.map(c=>`<option value="${c.id}">${c.name} – ${c.team}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Tavoite *</label>
        <input type="text" id="ng-title" placeholder="esim. Kysymistekniikan kehittäminen">
      </div>
      <div class="form-group"><label>Kuvaus & mittarit</label>
        <textarea id="ng-desc" rows="3" placeholder="Miten tavoite mitataan tai todetaan saavutetuksi?"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group"><label>Deadline</label><input type="date" id="ng-dl"></div>
        <div class="form-group"><label>Alkuedistyminen</label>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <input type="range" id="ng-prog" min="0" max="100" step="5" value="0" style="flex:1;accent-color:var(--sjl-blue)" oninput="document.getElementById('ng-pv').textContent=this.value+'%'">
            <span id="ng-pv" style="font-weight:700;min-width:36px">0%</span>
          </div>
        </div>
      </div>
    `;
    Modal.open('Uusi tavoite', body,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="GoalsView._save()">Tallenna</button>`);
  },

  _save() {
    const coachId  = document.getElementById('ng-coach')?.value;
    const title    = document.getElementById('ng-title')?.value?.trim();
    const desc     = document.getElementById('ng-desc')?.value?.trim();
    const deadline = document.getElementById('ng-dl')?.value;
    const progress = parseInt(document.getElementById('ng-prog')?.value||0);
    if (!coachId||!title) { Toast.show('Täytä pakolliset kentät', 'error'); return; }
    CDApp.addGoal({ coachId, title, desc, deadline, progress, done: progress===100, comments:[] });
    Modal.close();
    Toast.show('Tavoite lisätty!', 'success');
    App.navigate('goals');
  },

  updateProgress(id) {
    const g = CDApp.getGoals().find(x=>x.id===id);
    if (!g) return;
    Modal.open('Päivitä edistyminen', `
      <div style="text-align:center">
        <div style="font-size:0.95rem;font-weight:700;margin-bottom:16px">${g.title}</div>
        <div style="font-size:3rem;font-weight:700;color:var(--sjl-blue)" id="prog-disp">${g.progress}%</div>
        <input type="range" id="prog-sl" min="0" max="100" step="5" value="${g.progress}"
          style="width:100%;margin:16px 0;accent-color:var(--sjl-blue)"
          oninput="document.getElementById('prog-disp').textContent=this.value+'%'">
        <div style="font-size:0.82rem;color:var(--text-light)">Siirrä liukua päivittääksesi edistyminen</div>
      </div>`,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="GoalsView._saveProg('${id}')">Tallenna</button>`);
  },

  _saveProg(id) {
    const val = parseInt(document.getElementById('prog-sl')?.value||0);
    CDApp.updateGoal(id, { progress:val, done:val===100 });
    Modal.close();
    Toast.show(`Edistyminen päivitetty: ${val}%`, 'success');
    App.navigate('goals');
  },

  addComment(id) {
    Modal.open('Lisää kommentti', `
      <div class="form-group"><label>Kommentti / huomio</label>
        <textarea id="goal-comment" rows="3" placeholder="esim. Harjoittelimme tätä tänään..."></textarea>
      </div>`,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="GoalsView._saveComment('${id}')">Lisää</button>`);
  },

  _saveComment(id) {
    const text = document.getElementById('goal-comment')?.value?.trim();
    if (!text) { Toast.show('Kirjoita kommentti', 'error'); return; }
    const goals = CDApp.getGoals();
    const idx   = goals.findIndex(g=>g.id===id);
    if (idx===-1) return;
    if (!goals[idx].comments) goals[idx].comments = [];
    goals[idx].comments.push({ text, date:new Date().toISOString().split('T')[0] });
    CDApp.save('goals', goals);
    Modal.close();
    Toast.show('Kommentti lisätty!', 'success');
    App.navigate('goals');
  },

  markDone(id) {
    CDApp.updateGoal(id, { progress:100, done:true });
    Toast.show('Tavoite saavutettu! 🎉', 'success');
    App.navigate('goals');
  },

  delete(id) {
    if (!confirm('Poistetaanko tavoite?')) return;
    CDApp.save('goals', CDApp.getGoals().filter(g=>g.id!==id));
    Toast.show('Tavoite poistettu', 'info');
    App.navigate('goals');
  }
};
