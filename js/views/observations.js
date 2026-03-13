/**
 * observations.js – Havainnoinnit-näkymä
 * Täysi toiminnallisuus: lista, valmentajittain, uusi havainnointi, tarkastelu, poisto
 */
const ObservationsView = {
  _tab: 'list',
  _obs: { ratings:{}, counters:{} },

  render() {
    const all = CDApp.getObservations();
    const sorted = [...all].sort((a,b)=>b.date.localeCompare(a.date));
    return `
<div class="page-header">
  <div class="page-header-title">Havainnoinnit</div>
  <div class="page-header-subtitle">${all.length} kirjattua havainnointia</div>
</div>
<div class="tabs" id="obs-tabs">
  <button class="tab-btn ${this._tab==='list'?'active':''}" data-tab="list">Kaikki</button>
  <button class="tab-btn ${this._tab==='coach'?'active':''}" data-tab="coach">Valmentajittain</button>
</div>
<div id="obs-content" class="content-wrap">
  ${this._tab==='list' ? this._renderList(sorted) : this._renderByCoach()}
</div>
<button class="fab" onclick="ObservationsView.openNew()" title="Uusi havainnointi">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</button>`;
  },

  afterRender() {
    document.querySelectorAll('#obs-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        document.querySelectorAll('#obs-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const sorted = [...CDApp.getObservations()].sort((a,b)=>b.date.localeCompare(a.date));
        document.getElementById('obs-content').innerHTML =
          this._tab==='list' ? this._renderList(sorted) : this._renderByCoach();
      });
    });
  },

  _renderList(list) {
    if (!list.length) return `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><h3>Ei havainnointeja</h3><p>Aloita tekemällä ensimmäinen havainnointi.</p></div>`;
    return list.map(o => {
      const coach = CDApp.getCoach(o.coachId);
      const form  = CDApp.getForm(o.formId);
      const vals  = Object.values(o.ratings||{});
      const avg   = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
      const stars = avg ? Math.round(parseFloat(avg)) : 0;
      return `
      <div class="obs-card" onclick="ObservationsView.viewDetail('${o.id}')">
        <div class="obs-card-top">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
            <div class="coach-avatar" style="background:${CDApp.levelColors[coach?.level]||'var(--sjl-blue)'}">${coach?.avatar||'?'}</div>
            <div style="flex:1;min-width:0">
              <div class="obs-coach-name">${coach?.name||'Valmentaja'}</div>
              <div class="obs-meta">${coach?.team||''}</div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            ${avg?`<div style="font-size:1.1rem;font-weight:700;color:var(--sjl-blue)">${avg}</div><div style="font-size:0.62rem;color:var(--text-light)">/ 5</div>`:''}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0">
          <span class="badge badge-blue">${form?.name||'Lomake'}</span>
          ${o.location?`<span class="badge badge-gray">${o.location}</span>`:''}
          <span class="badge badge-gray">${CDApp.formatDate(o.date)}</span>
        </div>
        ${avg?`<div class="stars-row">${[1,2,3,4,5].map(n=>`<span style="color:${n<=stars?'#f6c90e':'#e2e8f0'};font-size:1rem">★</span>`).join('')}</div>`:''}
        ${o.notes?`<div class="obs-notes">${o.notes}</div>`:''}
        ${this._renderMiniRatings(o.ratings||{})}
      </div>`;
    }).join('');
  },

  _renderMiniRatings(ratings) {
    const entries = Object.entries(ratings);
    if (!entries.length) return '';
    return `<div class="mini-ratings">${entries.map(([id,val])=>{
      const cr=CDApp.getCriterion(id);
      return `<div class="mini-rating-row">
        <span class="mini-rating-label">${cr?.name||id}</span>
        <div class="mini-bar"><div class="mini-fill" style="width:${(val/5)*100}%"></div></div>
        <span class="mini-val">${val}</span>
      </div>`;
    }).join('')}</div>`;
  },

  _renderByCoach() {
    const coaches = CDApp.getCoaches();
    return coaches.map(c => {
      const obs   = CDApp.getObservationsFor(c.id);
      const score = CDApp.overallScore(c.id);
      const sorted = [...obs].sort((a,b)=>b.date.localeCompare(a.date));
      return `
      <div class="card mb-12">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div class="coach-avatar" style="background:${CDApp.levelColors[c.level]||'var(--sjl-blue)'}">${c.avatar}</div>
            <div><div class="card-title">${c.name}</div><div style="font-size:0.75rem;color:var(--text-light)">${c.team} · ${c.club}</div></div>
          </div>
          <span class="badge badge-blue">${c.level}-taso</span>
        </div>
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:0.82rem;color:var(--text-secondary)">${obs.length} havainnoint${obs.length!==1?'ia':'i'}</span>
            ${score!==null?`<div style="font-weight:700;color:var(--sjl-blue);font-size:1rem">${score}/5</div>`:'<span style="font-size:0.82rem;color:var(--text-light)">Ei arviointeja</span>'}
          </div>
          ${score!==null?`<div class="progress-bar mb-12"><div class="progress-fill ice" style="width:${(score/5)*100}%"></div></div>`:''}
          ${sorted.slice(0,3).map(o=>{
            const form=CDApp.getForm(o.formId);
            const vals=Object.values(o.ratings||{});
            const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):null;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:0.82rem" onclick="ObservationsView.viewDetail('${o.id}')">
              <span style="color:var(--text-secondary)">${form?.name||''}</span>
              <div style="display:flex;align-items:center;gap:8px">
                ${avg?`<span style="font-weight:700;color:var(--sjl-blue)">${avg}/5</span>`:''}
                <span style="color:var(--text-light)">${CDApp.formatDate(o.date)}</span>
              </div>
            </div>`;
          }).join('')}
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn-primary btn-sm" style="flex:1" onclick="ObservationsView.openNewFor('${c.id}')">+ Uusi havainnointi</button>
            <button class="btn-secondary btn-sm" onclick="ReportsView.selectCoach('${c.id}');App.navigate('reports')">Raportti</button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  viewDetail(id) {
    const o = CDApp.getObservations().find(x=>x.id===id);
    if (!o) return;
    const coach = CDApp.getCoach(o.coachId);
    const form  = CDApp.getForm(o.formId);
    const vals  = Object.values(o.ratings||{});
    const avg   = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
    const body = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div class="coach-avatar" style="width:52px;height:52px;font-size:1.1rem;background:${CDApp.levelColors[coach?.level]||'var(--sjl-blue)'}">${coach?.avatar||'?'}</div>
        <div>
          <div style="font-size:1.05rem;font-weight:700">${coach?.name||'Valmentaja'}</div>
          <div style="font-size:0.8rem;color:var(--text-light)">${coach?.team||''}</div>
          <div style="font-size:0.75rem;color:var(--text-light);margin-top:2px">${CDApp.formatDate(o.date)} · ${o.location||''}</div>
        </div>
        ${avg?`<div style="margin-left:auto;text-align:center;background:var(--bg-app);border-radius:var(--radius);padding:10px 14px"><div style="font-size:1.6rem;font-weight:700;color:var(--sjl-blue);line-height:1">${avg}</div><div style="font-size:0.65rem;color:var(--text-light)">/ 5</div></div>`:''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
        <span class="badge badge-blue">${form?.name||''}</span>
        <span class="badge badge-gray">Havainnoija: ${o.observer||''}</span>
      </div>
      ${o.notes?`<div style="background:var(--bg-app);border-radius:var(--radius);padding:12px;font-size:0.88rem;line-height:1.6;color:var(--text-secondary);margin-bottom:14px;border-left:3px solid var(--sjl-ice)">${o.notes}</div>`:''}
      <div class="obs-section-title" style="margin-bottom:10px">Arvioinnit</div>
      ${Object.entries(o.ratings||{}).map(([id,val])=>{
        const cr=CDApp.getCriterion(id);
        return `<div class="rating-group">
          <div class="rating-label" style="flex:1"><div style="font-weight:600;font-size:0.88rem">${cr?.name||id}</div><div style="font-size:0.72rem;color:var(--sjl-ice);text-transform:uppercase">${CDApp.categoryLabels[cr?.category]||''}</div></div>
          <div style="display:flex;gap:2px;align-items:center">
            ${[1,2,3,4,5].map(n=>`<span style="color:${n<=val?'#f6c90e':'#e2e8f0'};font-size:1.2rem">★</span>`).join('')}
            <span style="font-weight:700;color:var(--sjl-blue);margin-left:6px;font-size:0.9rem">${val}/5</span>
          </div>
        </div>`;
      }).join('')}
      ${Object.keys(o.counters||{}).length?`
      <div class="obs-section-title" style="margin:14px 0 10px">Laskurit</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${Object.entries(o.counters).map(([k,v])=>`<div style="background:var(--bg-app);border-radius:var(--radius);padding:10px;text-align:center"><div style="font-size:1.5rem;font-weight:700;color:var(--sjl-blue)">${v}</div><div style="font-size:0.72rem;color:var(--text-light);text-transform:capitalize">${k}</div></div>`).join('')}
      </div>`:''}
    `;
    Modal.open('Havainnoinnin tiedot', body,
      `<button class="btn-danger btn-sm" onclick="ObservationsView.deleteObs('${id}')">Poista</button>
       <button class="btn-primary btn-sm" onclick="Modal.close()">Sulje</button>`);
  },

  deleteObs(id) {
    if (!confirm('Poistetaanko havainnointi?')) return;
    const all = CDApp.getObservations().filter(o=>o.id!==id);
    CDApp.save('observations', all);
    Modal.close();
    Toast.show('Havainnointi poistettu', 'info');
    App.navigate('observations');
  },

  openNew() { this.openNewFor(null); },

  openNewFor(preCoachId) {
    const coaches = CDApp.getCoaches();
    const forms   = CDApp.getForms().filter(f=>f.active);
    this._obs = { ratings:{}, counters:{} };
    const body = `
      <div class="form-group"><label>Valmentaja *</label>
        <select id="no-coach"><option value="">Valitse valmentaja...</option>
          ${coaches.map(c=>`<option value="${c.id}" ${preCoachId===c.id?'selected':''}>${c.name} – ${c.team}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Lomake *</label>
        <select id="no-form" onchange="ObservationsView._loadCriteria()"><option value="">Valitse lomake...</option>
          ${forms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group"><label>Päivämäärä *</label><input type="date" id="no-date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label>Paikka</label><input type="text" id="no-loc" placeholder="esim. Helsinki, Nordis"></div>
      </div>
      <div id="no-criteria"></div>
      <div class="form-group"><label>Muistiinpanot</label><textarea id="no-notes" placeholder="Vapaat huomiot, kehittämisehdotukset..."></textarea></div>
    `;
    Modal.open('Uusi havainnointi', body,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="ObservationsView._save()">Tallenna</button>`);
  },

  _loadCriteria() {
    const formId = document.getElementById('no-form')?.value;
    const form   = CDApp.getForm(formId);
    const sec    = document.getElementById('no-criteria');
    if (!form || !sec) return;
    this._obs.ratings = {};
    this._obs.counters = {};
    const crs = form.criteriaIds.map(id=>CDApp.getCriterion(id)).filter(Boolean);
    const byCat = {};
    crs.forEach(cr=>{ (byCat[cr.category]=byCat[cr.category]||[]).push(cr); });
    const hasVuoro = !!byCat['vuorovaikutus'];
    sec.innerHTML = `
      <div style="border:2px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-bottom:14px">
        <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--sjl-blue);margin-bottom:12px">Arvioinnit (1–5 ★)</div>
        ${Object.entries(byCat).map(([cat,crs])=>`
          <div style="margin-bottom:14px">
            <div style="font-size:0.72rem;font-weight:700;color:var(--sjl-ice);text-transform:uppercase;margin-bottom:8px">${CDApp.categoryLabels[cat]||cat}</div>
            ${crs.map(cr=>`
              <div class="rating-group">
                <div class="rating-label"><div style="font-weight:600;font-size:0.85rem">${cr.name}</div>${cr.desc?`<div style="font-size:0.7rem;color:var(--text-light)">${cr.desc}</div>`:''}</div>
                <div class="rating-stars" id="rs-${cr.id}">
                  ${[1,2,3,4,5].map(n=>`<button class="star-btn" onclick="ObservationsView._setRating('${cr.id}',${n},this)">★</button>`).join('')}
                </div>
              </div>`).join('')}
          </div>`).join('')}
      </div>
      ${hasVuoro?`
      <div style="border:2px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-bottom:14px">
        <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--sjl-blue);margin-bottom:12px">Palautelaskurit</div>
        <div style="font-size:0.78rem;color:var(--text-light);margin-bottom:12px">Laske valmentajan käyttämät palautetyypit harjoituksen aikana</div>
        ${['puhe','kysyminen','kerro','vahvista'].map(t=>`
          <div class="counter-row">
            <div class="counter-info"><div class="counter-name">${t.charAt(0).toUpperCase()+t.slice(1)}</div><div class="counter-sub">${{puhe:'Suora ohje / komento',kysyminen:'Kysymys pelaajalle',kerro:'Kerro mitä tapahtui',vahvista:'Positiivinen vahvistus'}[t]}</div></div>
            <div class="counter-controls">
              <button class="counter-btn" onclick="ObservationsView._counter('${t}',-1)">−</button>
              <span class="counter-value" id="cnt-${t}">0</span>
              <button class="counter-btn" onclick="ObservationsView._counter('${t}',1)">+</button>
            </div>
          </div>`).join('')}
      </div>`:''} `;
  },

  _setRating(crId, val, btn) {
    this._obs.ratings[crId] = val;
    btn.closest('.rating-stars').querySelectorAll('.star-btn').forEach((s,i)=>s.classList.toggle('filled',i<val));
  },

  _counter(type, delta) {
    this._obs.counters[type] = Math.max(0,(this._obs.counters[type]||0)+delta);
    const el = document.getElementById('cnt-'+type);
    if (el) el.textContent = this._obs.counters[type];
  },

  _save() {
    const coachId  = document.getElementById('no-coach')?.value;
    const formId   = document.getElementById('no-form')?.value;
    const date     = document.getElementById('no-date')?.value;
    const location = document.getElementById('no-loc')?.value;
    const notes    = document.getElementById('no-notes')?.value;
    if (!coachId||!formId||!date) { Toast.show('Täytä pakolliset kentät (*)', 'error'); return; }
    if (!Object.keys(this._obs.ratings).length) { Toast.show('Anna vähintään yksi arviointi', 'error'); return; }
    CDApp.addObservation({ coachId, formId, date, location, notes,
      observer: CDApp.state.user?.name||'Havainnoija',
      ratings: { ...this._obs.ratings },
      counters: { ...this._obs.counters }
    });
    Modal.close();
    Toast.show('Havainnointi tallennettu!', 'success');
    App.navigate('observations');
  }
};
