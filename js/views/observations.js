/**
 * observations.js – Havainnoinnit-näkymä
 */
const ObservationsView = {
  _activeTab: 'list',
  _newObs: {},

  render() {
    const observations = CDApp.getObservations();
    const sorted = [...observations].sort((a,b) => b.date.localeCompare(a.date));

    return `
<div class="page-header">
  <div class="page-header-title">Havainnoinnit</div>
  <div class="page-header-subtitle">${observations.length} havainnointi kirjattu</div>
</div>

<div class="tabs" id="obs-tabs">
  <button class="tab-btn ${this._activeTab==='list'?'active':''}" data-tab="list">Lista</button>
  <button class="tab-btn ${this._activeTab==='by-coach'?'active':''}" data-tab="by-coach">Valmentajittain</button>
</div>

<div class="content-wrap" id="obs-content">
  ${this._activeTab === 'list' ? this.renderList(sorted) : this.renderByCoach()}
</div>

<button class="fab" onclick="ObservationsView.openNew()" title="Uusi havainnointi">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
</button>
    `;
  },

  afterRender() {
    document.querySelectorAll('#obs-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        document.querySelectorAll('#obs-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('obs-content').innerHTML = this._activeTab === 'list'
          ? this.renderList([...CDApp.getObservations()].sort((a,b)=>b.date.localeCompare(a.date)))
          : this.renderByCoach();
      });
    });
  },

  renderList(observations) {
    if (!observations.length) return `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <h3>Ei havainnointeja</h3>
        <p>Aloita tekemällä uusi havainnointi.</p>
      </div>`;

    return observations.map(o => {
      const coach = CDApp.getCoach(o.coachId);
      const form = CDApp.getForm(o.formId);
      const avgRatings = Object.values(o.ratings || {});
      const avg = avgRatings.length ? (avgRatings.reduce((a,b)=>a+b,0)/avgRatings.length).toFixed(1) : null;
      return `
      <div class="card mb-12" style="cursor:pointer" onclick="ObservationsView.viewDetail('${o.id}')">
        <div class="card-header">
          <div class="flex items-center gap-8">
            <div class="list-item-icon" style="background:var(--sjl-blue);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.82rem;flex-shrink:0">${coach?.avatar||'?'}</div>
            <div>
              <div class="card-title">${coach?.name||'Valmentaja'}</div>
              <div style="font-size:0.75rem;color:var(--text-light)">${coach?.team||''}</div>
            </div>
          </div>
          <div style="text-align:right">
            ${avg ? `<div style="font-size:1.1rem;font-weight:700;color:var(--sjl-blue)">${avg}/5</div>` : ''}
            <div style="font-size:0.72rem;color:var(--text-light)">${CDApp.formatDate(o.date)}</div>
          </div>
        </div>
        <div class="card-body" style="padding:12px 18px">
          <div class="flex items-center gap-8" style="flex-wrap:wrap">
            <span class="badge badge-blue">${form?.name||'Lomake'}</span>
            <span class="badge badge-gray">${o.location||''}</span>
          </div>
          ${o.notes ? `<div style="font-size:0.82rem;color:var(--text-secondary);margin-top:8px;line-height:1.5">${o.notes}</div>` : ''}
          ${this.renderRatingBars(o.ratings||{})}
        </div>
      </div>`;
    }).join('');
  },

  renderRatingBars(ratings) {
    const entries = Object.entries(ratings);
    if (!entries.length) return '';
    return `<div style="margin-top:10px;display:grid;gap:4px">
      ${entries.map(([crId, val]) => {
        const cr = CDApp.getCriterion(crId);
        return `<div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:0.72rem;color:var(--text-light);min-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cr?.name||crId}</span>
          <div class="progress-bar" style="flex:1;margin:0"><div class="progress-fill ice" style="width:${(val/5)*100}%"></div></div>
          <span style="font-size:0.72rem;font-weight:700;color:var(--sjl-blue);min-width:20px">${val}</span>
        </div>`;
      }).join('')}
    </div>`;
  },

  renderByCoach() {
    const coaches = CDApp.getCoaches();
    return coaches.map(c => {
      const obs = CDApp.getObservationsFor(c.id);
      const score = CDApp.overallScore(c.id);
      return `
      <div class="card mb-12">
        <div class="card-header">
          <div class="flex items-center gap-8">
            <div style="width:42px;height:42px;border-radius:50%;background:${CDApp.levelColors[c.level]||'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-weight:700">${c.avatar}</div>
            <div>
              <div class="card-title">${c.name}</div>
              <div style="font-size:0.75rem;color:var(--text-light)">${c.team} · ${c.club}</div>
            </div>
          </div>
          <span class="badge badge-blue">${c.level}-taso</span>
        </div>
        <div class="card-body">
          <div class="flex items-center justify-between mb-8">
            <span style="font-size:0.82rem;color:var(--text-secondary)">${obs.length} havainnointi${obs.length !== 1 ? 'a':''}</span>
            ${score ? `<span style="font-weight:700;color:var(--sjl-blue)">${score}/5 keskiarvo</span>` : '<span style="color:var(--text-light);font-size:0.82rem">Ei arviointeja</span>'}
          </div>
          ${obs.length ? `
            <div style="background:var(--bg-app);border-radius:var(--radius);padding:8px">
              ${[...obs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2).map(o => {
                const form = CDApp.getForm(o.formId);
                return `<div style="font-size:0.8rem;padding:4px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between">
                  <span>${form?.name||''}</span>
                  <span style="color:var(--text-light)">${CDApp.formatDate(o.date)}</span>
                </div>`;
              }).join('')}
            </div>
          ` : ''}
          <button class="btn-primary btn-sm mt-8 w-full" onclick="ObservationsView.openNewFor('${c.id}')">+ Uusi havainnointi</button>
        </div>
      </div>`;
    }).join('');
  },

  viewDetail(obsId) {
    const o = CDApp.getObservations().find(x => x.id === obsId);
    if (!o) return;
    const coach = CDApp.getCoach(o.coachId);
    const form = CDApp.getForm(o.formId);
    const criteria = CDApp.getCriteria();

    const body = `
      <div style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--sjl-blue);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem">${coach?.avatar||'?'}</div>
          <div>
            <div style="font-weight:700;font-size:1.05rem">${coach?.name||'Valmentaja'}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${coach?.team||''} · ${CDApp.formatDate(o.date)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          <span class="badge badge-blue">${form?.name||''}</span>
          ${o.location ? `<span class="badge badge-gray">${o.location}</span>` : ''}
          <span class="badge badge-gray">Havainnoija: ${o.observer||''}</span>
        </div>
        ${o.notes ? `<div style="background:var(--bg-app);border-radius:var(--radius);padding:12px;font-size:0.88rem;line-height:1.6;color:var(--text-secondary);margin-bottom:12px">${o.notes}</div>` : ''}
      </div>
      <div class="obs-section">
        <div class="obs-section-title">Arvioinnit</div>
        ${Object.entries(o.ratings||{}).map(([crId, val]) => {
          const cr = CDApp.getCriterion(crId);
          return `<div class="rating-group">
            <span class="rating-label">${cr?.name||crId}</span>
            <div style="display:flex;gap:4px">
              ${[1,2,3,4,5].map(n => `<span style="color:${n<=val?'#f6c90e':'var(--border-strong)'};font-size:1.1rem">★</span>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      ${Object.keys(o.counters||{}).length ? `
      <div class="obs-section">
        <div class="obs-section-title">Laskurit</div>
        ${Object.entries(o.counters).map(([k,v]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:0.88rem;text-transform:capitalize">${k}</span>
            <strong>${v}</strong>
          </div>`).join('')}
      </div>` : ''}
    `;
    Modal.open('Havainnoinnin tiedot', body, `<button class="btn-secondary btn-sm" onclick="Modal.close()">Sulje</button>`);
  },

  openNew() { this.openNewFor(null); },

  openNewFor(preselectedCoachId) {
    const coaches = CDApp.getCoaches();
    const forms = CDApp.getForms().filter(f => f.active);
    const criteria = CDApp.getCriteria();

    this._newObs = { ratings: {}, counters: {}, coachId: preselectedCoachId || '' };

    const body = `
      <div class="form-group">
        <label>Valmentaja</label>
        <select id="nobs-coach">
          <option value="">Valitse valmentaja...</option>
          ${coaches.map(c => `<option value="${c.id}" ${preselectedCoachId===c.id?'selected':''}>${c.name} – ${c.team}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Lomake</label>
        <select id="nobs-form" onchange="ObservationsView.loadFormCriteria()">
          <option value="">Valitse lomake...</option>
          ${forms.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Päivämäärä</label>
        <input type="date" id="nobs-date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Paikka</label>
        <input type="text" id="nobs-location" placeholder="esim. Jyväskylä, jäähalli">
      </div>

      <!-- Dynamic criteria section -->
      <div id="nobs-criteria-section"></div>

      <div class="form-group">
        <label>Muistiinpanot</label>
        <textarea id="nobs-notes" placeholder="Vapaat huomiot havainnoinnista..."></textarea>
      </div>
    `;

    const footer = `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
      <button class="btn-primary btn-sm" onclick="ObservationsView.saveNew()">Tallenna</button>
    `;
    Modal.open('Uusi havainnointi', body, footer);
  },

  loadFormCriteria() {
    const formId = document.getElementById('nobs-form').value;
    const form = CDApp.getForm(formId);
    const section = document.getElementById('nobs-criteria-section');
    if (!form || !section) return;

    const criteria = form.criteriaIds.map(id => CDApp.getCriterion(id)).filter(Boolean);
    // Group by category
    const byCategory = {};
    criteria.forEach(cr => {
      if (!byCategory[cr.category]) byCategory[cr.category] = [];
      byCategory[cr.category].push(cr);
    });

    section.innerHTML = `
      <div class="obs-section">
        <div class="obs-section-title">Arvioinnit</div>
        ${Object.entries(byCategory).map(([cat, crs]) => `
          <div style="margin-bottom:14px">
            <div style="font-size:0.75rem;font-weight:700;color:var(--sjl-ice);text-transform:uppercase;margin-bottom:6px">${CDApp.categoryLabels[cat]||cat}</div>
            ${crs.map(cr => `
              <div class="rating-group">
                <div class="rating-label">
                  <div style="font-weight:600">${cr.name}</div>
                  ${cr.desc ? `<div style="font-size:0.72rem;color:var(--text-light)">${cr.desc}</div>` : ''}
                </div>
                <div class="rating-stars" data-cr="${cr.id}">
                  ${[1,2,3,4,5].map(n => `<button class="star-btn" data-val="${n}" onclick="ObservationsView.setRating('${cr.id}',${n},this)">★</button>`).join('')}
                </div>
              </div>`).join('')}
          </div>`).join('')}
      </div>

      <!-- Counters for vuorovaikutus -->
      ${byCategory['vuorovaikutus'] ? `
      <div class="obs-section">
        <div class="obs-section-title">Laskurit – Palautetyyppi</div>
        ${['puhe','kysyminen','kerro'].map(type => `
          <div class="counter-row">
            <div class="counter-info">
              <div class="counter-name">${type.charAt(0).toUpperCase()+type.slice(1)}</div>
            </div>
            <div class="counter-controls">
              <button class="counter-btn" onclick="ObservationsView.changeCounter('${type}',-1)">−</button>
              <span class="counter-value" id="cnt-${type}">0</span>
              <button class="counter-btn" onclick="ObservationsView.changeCounter('${type}',1)">+</button>
            </div>
          </div>`).join('')}
      </div>` : ''}
    `;
  },

  setRating(crId, val, btn) {
    this._newObs.ratings[crId] = val;
    const stars = btn.closest('.rating-stars').querySelectorAll('.star-btn');
    stars.forEach((s, i) => {
      s.classList.toggle('filled', i < val);
    });
  },

  changeCounter(type, delta) {
    this._newObs.counters[type] = Math.max(0, (this._newObs.counters[type] || 0) + delta);
    const el = document.getElementById('cnt-' + type);
    if (el) el.textContent = this._newObs.counters[type];
  },

  saveNew() {
    const coachId = document.getElementById('nobs-coach')?.value;
    const formId  = document.getElementById('nobs-form')?.value;
    const date    = document.getElementById('nobs-date')?.value;
    const location= document.getElementById('nobs-location')?.value;
    const notes   = document.getElementById('nobs-notes')?.value;

    if (!coachId || !formId || !date) {
      Toast.show('Täytä pakolliset kentät (valmentaja, lomake, päivämäärä)', 'error');
      return;
    }
    if (!Object.keys(this._newObs.ratings).length) {
      Toast.show('Anna vähintään yksi arviointi', 'error');
      return;
    }

    const obs = {
      coachId, formId, date, location, notes,
      observer: CDApp.state.user?.name || 'Havainnoija',
      ratings: this._newObs.ratings,
      counters: this._newObs.counters
    };
    CDApp.addObservation(obs);
    Modal.close();
    Toast.show('Havainnointi tallennettu!', 'success');
    App.navigate('observations');
  }
};
