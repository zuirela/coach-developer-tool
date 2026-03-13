/**
 * forms.js – Lomakkeet-näkymä
 */
const FormsView = {
  render() {
    const forms = CDApp.getForms();
    const criteria = CDApp.getCriteria();

    return `
<div class="page-header">
  <div class="page-header-title">Lomakkeet</div>
  <div class="page-header-subtitle">${forms.length} lomaketta</div>
</div>
<div class="content-wrap">
  ${forms.map(f => {
    const fCriteria = f.criteriaIds.map(id => CDApp.getCriterion(id)).filter(Boolean);
    return `
    <div class="card mb-12">
      <div class="card-header">
        <div>
          <div class="card-title">${f.name}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">Lähde: ${f.createdBy}</div>
        </div>
        <span class="badge ${f.active?'badge-green':'badge-gray'}">${f.active?'Aktiivinen':'Ei käytössä'}</span>
      </div>
      <div class="card-body">
        <div class="section-title" style="margin-bottom:8px">Kriteerit (${fCriteria.length})</div>
        ${fCriteria.map(cr => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:0.75rem;color:var(--sjl-ice);font-weight:600;text-transform:uppercase;min-width:90px">${CDApp.categoryLabels[cr.category]||cr.category}</span>
            <span style="font-size:0.85rem;color:var(--text-primary)">${cr.name}</span>
          </div>`).join('')}
        <button class="btn-primary btn-sm w-full mt-12" onclick="ObservationsView.openNew();setTimeout(()=>{const sel=document.getElementById('nobs-form');if(sel){sel.value='${f.id}';ObservationsView.loadFormCriteria();}},400)">
          Käytä lomaketta
        </button>
      </div>
    </div>`;
  }).join('')}
  <button class="btn-secondary w-full mt-8" onclick="FormsView.openNewForm()">+ Luo uusi lomake</button>
</div>
<button class="fab" onclick="FormsView.openNewForm()" title="Uusi lomake">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
</button>
    `;
  },

  openNewForm() {
    const criteria = CDApp.getCriteria();
    const body = `
      <div class="form-group">
        <label>Lomakkeen nimi</label>
        <input type="text" id="nf-name" placeholder="esim. Harjoitushavainnointi kevät 2024">
      </div>
      <div style="margin-bottom:16px">
        <label class="form-group" style="margin-bottom:8px"><strong style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary)">Valitse kriteerit</strong></label>
        ${criteria.map(cr => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
            <input type="checkbox" id="cr-${cr.id}" value="${cr.id}" style="width:18px;height:18px;cursor:pointer">
            <label for="cr-${cr.id}" style="cursor:pointer;flex:1">
              <div style="font-size:0.88rem;font-weight:600">${cr.name}</div>
              <div style="font-size:0.72rem;color:var(--text-light)">${CDApp.categoryLabels[cr.category]||cr.category}</div>
            </label>
          </div>`).join('')}
      </div>
    `;
    Modal.open('Uusi lomake', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="FormsView.saveForm()">Tallenna</button>
    `);
  },

  saveForm() {
    const name = document.getElementById('nf-name')?.value?.trim();
    const checked = [...document.querySelectorAll('#modal-body input[type=checkbox]:checked')].map(c => c.value);
    if (!name) { Toast.show('Anna lomakkeelle nimi', 'error'); return; }
    if (!checked.length) { Toast.show('Valitse vähintään yksi kriteeri', 'error'); return; }
    CDApp.addForm({ name, criteriaIds: checked, createdBy: CDApp.state.role, active: true });
    Modal.close();
    Toast.show('Lomake luotu!', 'success');
    App.navigate('forms');
  }
};

/**
 * criteria.js – Kriteerit-näkymä
 */
const CriteriaView = {
  render() {
    const criteria = CDApp.getCriteria();
    const byCategory = {};
    criteria.forEach(cr => {
      if (!byCategory[cr.category]) byCategory[cr.category] = [];
      byCategory[cr.category].push(cr);
    });

    return `
<div class="page-header">
  <div class="page-header-title">Kriteerit</div>
  <div class="page-header-subtitle">${criteria.length} kriteeriä</div>
</div>
<div class="content-wrap">
  ${Object.entries(byCategory).map(([cat, crs]) => `
    <div class="mb-16">
      <div class="section-title">${CDApp.categoryLabels[cat]||cat}</div>
      <div class="card">
        <div class="card-body" style="padding:0 18px">
          ${crs.map(cr => `
            <div class="list-item">
              <div class="list-item-icon ${cat==='vuorovaikutus'?'ice':cat==='suunnittelu'?'gold':''}"
                style="${cat==='lajitaidot'?'background:var(--sjl-blue)':''};font-size:0.7rem;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;width:38px;height:38px;border-radius:10px">
                ${cat==='lajitaidot'?'🏒':cat==='vuorovaikutus'?'💬':'📋'}
              </div>
              <div class="list-item-content">
                <div class="list-item-title">${cr.name}</div>
                <div class="list-item-subtitle">${cr.desc||''}</div>
                <span class="badge ${cr.source==='liitto'?'badge-blue':'badge-ice'}" style="margin-top:4px">${cr.source==='liitto'?'Liitto':'Seura'}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`).join('')}
  <button class="btn-secondary w-full" onclick="CriteriaView.openNew()">+ Lisää kriteeri</button>
</div>
<button class="fab" onclick="CriteriaView.openNew()" title="Uusi kriteeri">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
</button>
    `;
  },

  openNew() {
    const body = `
      <div class="form-group">
        <label>Kriteerin nimi</label>
        <input type="text" id="ncr-name" placeholder="esim. Positiivinen palaute">
      </div>
      <div class="form-group">
        <label>Kategoria</label>
        <select id="ncr-cat">
          <option value="lajitaidot">Lajitaidot</option>
          <option value="vuorovaikutus">Vuorovaikutus</option>
          <option value="suunnittelu">Suunnittelu</option>
        </select>
      </div>
      <div class="form-group">
        <label>Kuvaus</label>
        <textarea id="ncr-desc" placeholder="Lyhyt kuvaus kriteeristä..."></textarea>
      </div>
    `;
    Modal.open('Uusi kriteeri', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="CriteriaView.save()">Tallenna</button>
    `);
  },

  save() {
    const name = document.getElementById('ncr-name')?.value?.trim();
    const category = document.getElementById('ncr-cat')?.value;
    const desc = document.getElementById('ncr-desc')?.value?.trim();
    if (!name) { Toast.show('Anna kriteerille nimi', 'error'); return; }
    CDApp.addCriterion({ name, category, desc, source: CDApp.state.role });
    Modal.close();
    Toast.show('Kriteeri lisätty!', 'success');
    App.navigate('criteria');
  }
};

/**
 * selfassess.js – Itsearviointi-näkymä
 */
const SelfAssessView = {
  _data: {},

  render() {
    const assessments = CDApp.getSelfAssessments();
    const criteria = CDApp.getCriteria();
    const sorted = [...assessments].sort((a,b) => b.date.localeCompare(a.date));

    return `
<div class="page-header">
  <div class="page-header-title">Itsearviointi</div>
  <div class="page-header-subtitle">${assessments.length} arviointia</div>
</div>
<div class="content-wrap">
  <!-- 360 summary chart if we have data -->
  ${assessments.length ? this.render360Block(assessments[0]) : ''}

  <div class="section-title">Arvioinnit</div>
  ${sorted.map(s => {
    const avgVals = Object.values(s.ratings || {});
    const avg = avgVals.length ? (avgVals.reduce((a,b)=>a+b,0)/avgVals.length).toFixed(1) : null;
    return `
    <div class="card mb-12">
      <div class="card-header">
        <div>
          <div class="card-title">Itsearviointi</div>
          <div style="font-size:0.75rem;color:var(--text-light)">${CDApp.formatDate(s.date)}</div>
        </div>
        ${avg ? `<div style="font-size:1.2rem;font-weight:700;color:var(--sjl-blue)">${avg}/5</div>` : ''}
      </div>
      <div class="card-body">
        ${Object.entries(s.ratings||{}).map(([crId, val]) => {
          const cr = CDApp.getCriterion(crId);
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="flex:1;font-size:0.82rem;color:var(--text-secondary)">${cr?.name||crId}</span>
            <div style="display:flex;gap:2px">${[1,2,3,4,5].map(n=>`<span style="color:${n<=val?'#f6c90e':'var(--border-strong)'};font-size:0.9rem">★</span>`).join('')}</div>
          </div>`;
        }).join('')}
        ${s.reflection ? `<div style="margin-top:10px;padding:10px;background:var(--bg-app);border-radius:var(--radius);font-size:0.82rem;line-height:1.6;color:var(--text-secondary);border-left:3px solid var(--sjl-ice)">${s.reflection}</div>` : ''}
      </div>
    </div>`;
  }).join('')}

  ${!assessments.length ? `<div class="empty-state"><h3>Ei itsearviointeja vielä</h3><p>Aloita ensimmäinen itsearviointi alla.</p></div>` : ''}

  <button class="btn-primary w-full mt-8" onclick="SelfAssessView.openNew()">+ Uusi itsearviointi</button>
</div>
<button class="fab" onclick="SelfAssessView.openNew()" title="Uusi itsearviointi">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
</button>
    `;
  },

  render360Block(latestSA) {
    const coaches = CDApp.getCoaches();
    const coach = coaches[0]; // In real app: current user's coach record
    const observations = CDApp.getObservationsFor(coach.id);
    const avgObs = CDApp.avgRatings(coach.id);
    const criteria = CDApp.getCriteria().filter(cr => latestSA.ratings[cr.id] !== undefined || avgObs[cr.id] !== undefined);
    const labels = criteria.map(cr => cr.name.length > 16 ? cr.name.slice(0,15)+'…' : cr.name);
    const selfData = criteria.map(cr => latestSA.ratings[cr.id] || 0);
    const obsData  = criteria.map(cr => avgObs[cr.id] || 0);

    return `
    <div class="card mb-16">
      <div class="card-header">
        <div class="card-title">360° Yhteenveto</div>
        <span class="badge badge-ice">Viimeisin</span>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="max-width:280px;margin:0 auto">
          <canvas id="chart-360" width="280" height="280"></canvas>
        </div>
      </div>
    </div>
    <script>
    setTimeout(()=>{
      CDChart.radar('chart-360',
        ${JSON.stringify(labels)},
        [
          {label:'Itsearviointi',data:${JSON.stringify(selfData)},borderColor:'#002E6D',backgroundColor:'rgba(0,46,109,0.1)',borderWidth:2,pointBackgroundColor:'#002E6D'},
          {label:'Havainnoinnit',data:${JSON.stringify(obsData)},borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.1)',borderWidth:2,pointBackgroundColor:'#00ACD7'}
        ]
      );
    },100);
    </script>
    `;
  },

  openNew() {
    const criteria = CDApp.getCriteria();
    this._data = { ratings: {} };

    const byCategory = {};
    criteria.forEach(cr => {
      if (!byCategory[cr.category]) byCategory[cr.category] = [];
      byCategory[cr.category].push(cr);
    });

    const body = `
      ${Object.entries(byCategory).map(([cat, crs]) => `
        <div class="obs-section">
          <div class="obs-section-title">${CDApp.categoryLabels[cat]||cat}</div>
          ${crs.map(cr => `
            <div class="rating-group">
              <div class="rating-label">
                <div style="font-weight:600;font-size:0.88rem">${cr.name}</div>
                ${cr.desc?`<div style="font-size:0.72rem;color:var(--text-light)">${cr.desc}</div>`:''}
              </div>
              <div class="rating-stars" data-cr="${cr.id}">
                ${[1,2,3,4,5].map(n=>`<button class="star-btn" data-val="${n}" onclick="SelfAssessView.setRating('${cr.id}',${n},this)">★</button>`).join('')}
              </div>
            </div>`).join('')}
        </div>`).join('')}
      <div class="form-group">
        <label>Reflektio & huomiot</label>
        <textarea id="sa-reflection" placeholder="Mitä kehitit, missä onnistuit, mihin panostaa seuraavaksi?"></textarea>
      </div>
    `;
    Modal.open('Uusi itsearviointi', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="SelfAssessView.save()">Tallenna</button>
    `);
  },

  setRating(crId, val, btn) {
    this._data.ratings[crId] = val;
    const stars = btn.closest('.rating-stars').querySelectorAll('.star-btn');
    stars.forEach((s,i) => s.classList.toggle('filled', i < val));
  },

  save() {
    const reflection = document.getElementById('sa-reflection')?.value?.trim();
    if (!Object.keys(this._data.ratings).length) { Toast.show('Anna vähintään yksi arviointi', 'error'); return; }
    CDApp.addSelfAssessment({
      coachId: CDApp.getCoaches()[0]?.id || 'c1',
      date: new Date().toISOString().split('T')[0],
      ratings: this._data.ratings,
      reflection
    });
    Modal.close();
    Toast.show('Itsearviointi tallennettu!', 'success');
    App.navigate('selfassess');
  }
};

/**
 * goals.js – Tavoitteet-näkymä
 */
const GoalsView = {
  render() {
    const goals = CDApp.getGoals();
    const active = goals.filter(g => !g.done);
    const done   = goals.filter(g => g.done);

    return `
<div class="page-header">
  <div class="page-header-title">Tavoitteet</div>
  <div class="page-header-subtitle">${active.length} aktiivista · ${done.length} valmista</div>
</div>
<div class="content-wrap">
  <div class="section-title">Aktiiviset tavoitteet</div>
  ${active.map(g => this.renderGoalCard(g)).join('') || `<div class="empty-state"><h3>Ei aktiivisia tavoitteita</h3></div>`}

  ${done.length ? `
    <div class="section-title mt-16">Saavutetut tavoitteet</div>
    ${done.map(g => this.renderGoalCard(g)).join('')}
  ` : ''}
</div>
<button class="fab" onclick="GoalsView.openNew()" title="Uusi tavoite">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
</button>
    `;
  },

  renderGoalCard(g) {
    const coach = CDApp.getCoach(g.coachId);
    return `
    <div class="goal-card ${g.done?'done':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div class="goal-title">${g.title}</div>
          ${coach ? `<div style="font-size:0.75rem;color:var(--text-light);margin-top:2px">${coach.name} · ${coach.team}</div>` : ''}
          ${g.desc ? `<div style="font-size:0.82rem;color:var(--text-secondary);margin-top:6px;line-height:1.5">${g.desc}</div>` : ''}
        </div>
        ${g.done ? `<span class="badge badge-green" style="margin-left:8px;flex-shrink:0">✓ Valmis</span>` : ''}
      </div>
      <div class="goal-progress-row">
        <span class="goal-pct">${g.progress}%</span>
        <div class="goal-progress-bar"><div class="goal-progress-fill ${g.done?'done':''}" style="width:${g.progress}%;${g.done?'background:var(--green)':''}"></div></div>
      </div>
      ${g.deadline ? `<div class="goal-deadline">Deadline: ${CDApp.formatDate(g.deadline)}</div>` : ''}
      ${!g.done ? `
      <div style="display:flex;gap:6px;margin-top:10px">
        <button class="btn-ice btn-sm" style="flex:1" onclick="GoalsView.updateProgress('${g.id}')">Päivitä</button>
        <button class="btn-primary btn-sm" onclick="GoalsView.markDone('${g.id}')">Valmis ✓</button>
      </div>` : ''}
    </div>`;
  },

  openNew() {
    const coaches = CDApp.getCoaches();
    const body = `
      <div class="form-group">
        <label>Valmentaja</label>
        <select id="ng-coach">
          <option value="">Valitse valmentaja...</option>
          ${coaches.map(c=>`<option value="${c.id}">${c.name} – ${c.team}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Tavoite</label>
        <input type="text" id="ng-title" placeholder="esim. Kysymistekniikan kehittäminen">
      </div>
      <div class="form-group">
        <label>Kuvaus</label>
        <textarea id="ng-desc" placeholder="Miten tavoite mitataan tai saavutetaan?"></textarea>
      </div>
      <div class="form-group">
        <label>Deadline</label>
        <input type="date" id="ng-deadline">
      </div>
    `;
    Modal.open('Uusi tavoite', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="GoalsView.save()">Tallenna</button>
    `);
  },

  save() {
    const coachId  = document.getElementById('ng-coach')?.value;
    const title    = document.getElementById('ng-title')?.value?.trim();
    const desc     = document.getElementById('ng-desc')?.value?.trim();
    const deadline = document.getElementById('ng-deadline')?.value;
    if (!coachId || !title) { Toast.show('Täytä pakolliset kentät', 'error'); return; }
    CDApp.addGoal({ coachId, title, desc, deadline, progress: 0, done: false });
    Modal.close();
    Toast.show('Tavoite lisätty!', 'success');
    App.navigate('goals');
  },

  updateProgress(id) {
    const goal = CDApp.getGoals().find(g => g.id === id);
    if (!goal) return;
    const body = `
      <div style="text-align:center">
        <div style="font-size:1rem;font-weight:600;margin-bottom:16px">${goal.title}</div>
        <div style="font-size:3rem;font-weight:700;color:var(--sjl-blue)" id="prog-display">${goal.progress}%</div>
        <input type="range" id="prog-slider" min="0" max="100" step="5" value="${goal.progress}"
          style="width:100%;margin:16px 0;accent-color:var(--sjl-blue)"
          oninput="document.getElementById('prog-display').textContent=this.value+'%'">
      </div>
    `;
    Modal.open('Päivitä edistyminen', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="GoalsView.saveProg('${id}')">Tallenna</button>
    `);
  },

  saveProg(id) {
    const val = parseInt(document.getElementById('prog-slider')?.value || 0);
    CDApp.updateGoal(id, { progress: val, done: val === 100 });
    Modal.close();
    Toast.show('Edistyminen päivitetty!', 'success');
    App.navigate('goals');
  },

  markDone(id) {
    CDApp.updateGoal(id, { progress: 100, done: true });
    Toast.show('Tavoite merkitty valmiiksi! 🎉', 'success');
    App.navigate('goals');
  }
};

/**
 * reports.js – Raportit-näkymä
 */
const ReportsView = {
  _selectedCoach: null,

  render() {
    const coaches = CDApp.getCoaches();
    this._selectedCoach = this._selectedCoach || coaches[0]?.id;
    const coach = CDApp.getCoach(this._selectedCoach);
    const observations = CDApp.getObservationsFor(this._selectedCoach);
    const avgs = CDApp.avgRatings(this._selectedCoach);
    const score = CDApp.overallScore(this._selectedCoach);
    const criteria = CDApp.getCriteria();
    const goals = CDApp.getGoalsFor(this._selectedCoach);

    // Build radar data
    const radarCriteria = criteria.filter(cr => avgs[cr.id] !== undefined);
    const radarLabels = radarCriteria.map(cr => cr.name.length > 14 ? cr.name.slice(0,13)+'…' : cr.name);
    const radarData   = radarCriteria.map(cr => avgs[cr.id] || 0);

    // Build trend data (mock: last 4 obs)
    const sortedObs = [...observations].sort((a,b) => a.date.localeCompare(b.date));
    const trendLabels = sortedObs.map(o => CDApp.formatDate(o.date).slice(0,5));
    const trendData   = sortedObs.map(o => {
      const vals = Object.values(o.ratings||{});
      return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : 0;
    });

    return `
<div class="page-header">
  <div class="page-header-title">Raportit</div>
  <div class="page-header-subtitle">Valmennusosaamisen kehittyminen</div>
</div>

<!-- Coach selector -->
<div style="padding:12px 16px;background:white;border-bottom:1px solid var(--border);overflow-x:auto;white-space:nowrap;display:flex;gap:8px">
  ${coaches.map(c => `
    <button class="chip ${this._selectedCoach===c.id?'selected':''}" onclick="ReportsView._selectedCoach='${c.id}';App.navigate('reports')">
      ${c.avatar} ${c.name.split(' ')[0]}
    </button>`).join('')}
</div>

<div class="content-wrap">
  <!-- Coach card -->
  <div class="card mb-16">
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:60px;height:60px;border-radius:50%;background:${CDApp.levelColors[coach?.level]||'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700">${coach?.avatar}</div>
        <div style="flex:1">
          <div style="font-size:1.1rem;font-weight:700">${coach?.name}</div>
          <div style="font-size:0.82rem;color:var(--text-light)">${coach?.team} · ${coach?.club}</div>
          <span class="badge badge-blue" style="margin-top:4px">${coach?.level}-taso</span>
        </div>
        <div style="text-align:center;background:var(--bg-app);border-radius:var(--radius);padding:10px 16px">
          <div style="font-size:1.8rem;font-weight:700;color:var(--sjl-blue);line-height:1">${score || '–'}</div>
          <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase;letter-spacing:0.04em">Keskiarvo</div>
          <div style="font-size:0.72rem;color:var(--text-light)">${observations.length} hav.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Radar Chart -->
  ${radarData.length >= 3 ? `
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Osaamisprofiili</div><span class="badge badge-ice">Havainnoinnit</span></div>
    <div class="card-body">
      <div class="chart-wrap" style="max-width:280px;margin:0 auto;height:260px">
        <canvas id="chart-radar" height="260"></canvas>
      </div>
    </div>
  </div>` : ''}

  <!-- Trend line -->
  ${trendData.length >= 2 ? `
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Kehittyminen</div></div>
    <div class="card-body" style="height:180px">
      <canvas id="chart-trend" height="150"></canvas>
    </div>
  </div>` : ''}

  <!-- Criteria breakdown -->
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Kriteerit</div></div>
    <div class="card-body">
      ${radarCriteria.map(cr => `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
            <span style="font-weight:600">${cr.name}</span>
            <span style="font-weight:700;color:var(--sjl-blue)">${avgs[cr.id]||'–'}/5</span>
          </div>
          <div class="progress-bar"><div class="progress-fill ice" style="width:${((avgs[cr.id]||0)/5)*100}%"></div></div>
        </div>`).join('') || '<div style="color:var(--text-light);font-size:0.85rem">Ei arviointeja vielä.</div>'}
    </div>
  </div>

  <!-- Goals -->
  ${goals.length ? `
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Tavoitteet</div></div>
    <div class="card-body" style="padding:0 18px">
      ${goals.map(g => `
        <div class="list-item">
          <div class="list-item-icon ${g.done?'green':''}">
            ${g.done?'✓':'🎯'}
          </div>
          <div class="list-item-content">
            <div class="list-item-title">${g.title}</div>
            <div class="goal-progress-bar" style="height:4px;border-radius:2px;background:var(--border);overflow:hidden;margin-top:4px"><div style="height:100%;width:${g.progress}%;background:${g.done?'var(--green)':'var(--sjl-blue)'};border-radius:2px"></div></div>
          </div>
          <div class="list-item-meta">${g.progress}%</div>
        </div>`).join('')}
    </div>
  </div>` : ''}
</div>

<script>
setTimeout(()=>{
  ${radarData.length >= 3 ? `
  CDChart.radar('chart-radar',
    ${JSON.stringify(radarLabels)},
    [{label:'Arviointi',data:${JSON.stringify(radarData)},borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.15)',borderWidth:2,pointBackgroundColor:'#00ACD7'}]
  );` : ''}
  ${trendData.length >= 2 ? `
  CDChart.line('chart-trend',
    ${JSON.stringify(trendLabels)},
    [{label:'Kokonaisarvo',data:${JSON.stringify(trendData)},borderColor:'#002E6D',backgroundColor:'rgba(0,46,109,0.08)',fill:true}]
  );` : ''}
},150);
</script>
    `;
  }
};
