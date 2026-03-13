/**
 * selfassess.js – Itsearviointi-näkymä
 * 360°-kaavio, historia, uusi arviointi, reflektio
 */
const SelfAssessView = {
  _data: { ratings:{}, reflection:'' },

  render() {
    const all    = CDApp.getSelfAssessments();
    const sorted = [...all].sort((a,b)=>b.date.localeCompare(a.date));
    const latest = sorted[0];
    return `
<div class="page-header">
  <div class="page-header-title">Itsearviointi</div>
  <div class="page-header-subtitle">${all.length} arviointia tehty</div>
</div>
<div class="content-wrap">
  ${latest ? this._render360(latest) : `
  <div class="card mb-16" style="text-align:center;padding:32px">
    <div style="font-size:2.5rem;margin-bottom:8px">🎯</div>
    <div style="font-weight:700;font-size:1rem;margin-bottom:6px">Aloita ensimmäinen itsearviointi</div>
    <div style="font-size:0.85rem;color:var(--text-light);margin-bottom:16px">Arvioi omaa osaamistasi ja seuraa kehittymistäsi</div>
    <button class="btn-primary" onclick="SelfAssessView.openNew()">+ Uusi itsearviointi</button>
  </div>`}
  ${sorted.length>1 ? this._renderTrend(sorted) : ''}
  ${sorted.length ? `
  <div class="section-title">Arvioinnit (${sorted.length})</div>
  ${sorted.map((s,i) => {
    const vals = Object.values(s.ratings||{});
    const avg  = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
    return `
    <div class="card mb-12">
      <div class="card-header">
        <div>
          <div class="card-title">${i===0?'Viimeisin arviointi':'Arviointi'}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">${CDApp.formatDate(s.date)}</div>
        </div>
        ${avg?`<div style="text-align:center;background:var(--bg-app);border-radius:var(--radius);padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:var(--sjl-blue)">${avg}</div><div style="font-size:0.65rem;color:var(--text-light)">/ 5</div></div>`:''}
      </div>
      <div class="card-body">
        ${Object.entries(s.ratings||{}).map(([id,val])=>{
          const cr = CDApp.getCriterion(id);
          return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span style="flex:1;font-size:0.85rem;color:var(--text-secondary)">${cr?.name||id}</span>
            <div style="display:flex;gap:2px">${[1,2,3,4,5].map(n=>`<span style="color:${n<=val?'#f6c90e':'#e2e8f0'};font-size:1rem">★</span>`).join('')}</div>
            <span style="font-weight:700;color:var(--sjl-blue);min-width:28px;text-align:right">${val}/5</span>
          </div>`;
        }).join('')}
        ${s.reflection?`<div style="margin-top:12px;padding:12px;background:var(--bg-app);border-radius:var(--radius);font-size:0.85rem;line-height:1.6;color:var(--text-secondary);border-left:3px solid var(--sjl-ice)">"${s.reflection}"</div>`:''}
        ${i===0?`<div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-secondary btn-sm" onclick="SelfAssessView.compare()">Vertaa</button>
          <button class="btn-danger btn-sm" onclick="SelfAssessView.delete('${s.id}')">Poista</button>
        </div>`:''}
      </div>
    </div>`;
  }).join('')}` : ''}
  <button class="btn-primary w-full mt-8" onclick="SelfAssessView.openNew()">+ Uusi itsearviointi</button>
</div>
<button class="fab" onclick="SelfAssessView.openNew()">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</button>`;
  },

  afterRender() {
    // Render 360 chart
    const all = CDApp.getSelfAssessments();
    if (!all.length) return;
    const sorted = [...all].sort((a,b)=>b.date.localeCompare(a.date));
    const latest = sorted[0];
    const coaches = CDApp.getCoaches();
    const coach = coaches[0];
    const avgObs = coach ? CDApp.avgRatings(coach.id) : {};
    const criteria = CDApp.getCriteria().filter(cr =>
      latest.ratings[cr.id]!==undefined || avgObs[cr.id]!==undefined
    );
    if (criteria.length < 3) return;
    const labels   = criteria.map(cr=>cr.name.length>15?cr.name.slice(0,14)+'…':cr.name);
    const selfData = criteria.map(cr=>latest.ratings[cr.id]||0);
    const obsData  = criteria.map(cr=>avgObs[cr.id]||0);
    CDChart.radar('chart-360', labels, [
      {label:'Itsearviointi',data:selfData,borderColor:'#002E6D',backgroundColor:'rgba(0,46,109,0.12)',borderWidth:2,pointBackgroundColor:'#002E6D',pointRadius:4},
      {label:'Havainnoinnit',data:obsData, borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.12)',borderWidth:2,pointBackgroundColor:'#00ACD7',pointRadius:4}
    ]);
    // Trend chart
    if (sorted.length >= 2) {
      const trendLabels = [...sorted].reverse().map(s=>CDApp.formatDate(s.date).slice(0,5));
      const trendData   = [...sorted].reverse().map(s=>{
        const vals = Object.values(s.ratings||{});
        return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : 0;
      });
      CDChart.line('chart-trend', trendLabels, [{
        label:'Kokonaisarvo',data:trendData,
        borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.1)',fill:true
      }]);
    }
  },

  _render360(latest) {
    const coaches = CDApp.getCoaches();
    const score   = CDApp.overallScore(coaches[0]?.id);
    const vals    = Object.values(latest.ratings||{});
    const selfAvg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
    return `
    <div class="card mb-16">
      <div class="card-header">
        <div class="card-title">360° Osaamisprofiili</div>
        <span class="badge badge-ice">Viimeisin</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div style="background:var(--bg-app);border-radius:var(--radius);padding:14px;text-align:center">
            <div style="font-size:1.8rem;font-weight:700;color:var(--sjl-blue)">${selfAvg||'–'}</div>
            <div style="font-size:0.72rem;color:var(--text-light);text-transform:uppercase">Itsearviointi</div>
          </div>
          <div style="background:var(--bg-app);border-radius:var(--radius);padding:14px;text-align:center">
            <div style="font-size:1.8rem;font-weight:700;color:var(--sjl-ice)">${score||'–'}</div>
            <div style="font-size:0.72rem;color:var(--text-light);text-transform:uppercase">Havainnoinnit</div>
          </div>
        </div>
        <div style="max-width:280px;margin:0 auto"><canvas id="chart-360" height="260"></canvas></div>
      </div>
    </div>`;
  },

  _renderTrend(sorted) {
    if (sorted.length < 2) return '';
    return `
    <div class="card mb-16">
      <div class="card-header"><div class="card-title">Kehittyminen ajan myötä</div></div>
      <div class="card-body" style="height:180px"><canvas id="chart-trend" height="160"></canvas></div>
    </div>`;
  },

  openNew() {
    const criteria = CDApp.getCriteria();
    const byCat = {};
    criteria.forEach(cr=>{ (byCat[cr.category]=byCat[cr.category]||[]).push(cr); });
    this._data = { ratings:{} };
    const body = `
      <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px;padding:10px 12px;background:rgba(0,172,215,0.08);border-radius:var(--radius);border-left:3px solid var(--sjl-ice)">
        Ole rehellinen itsellesi – tämä on henkilökohtainen kehitysväline, ei arvostelu.
      </div>
      ${Object.entries(byCat).map(([cat,crs])=>`
        <div style="margin-bottom:14px">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:${cat==='lajitaidot'?'var(--sjl-blue)':cat==='vuorovaikutus'?'var(--sjl-ice)':'var(--sjl-gold)'};margin-bottom:8px">${CDApp.categoryEmojis[cat]||''} ${CDApp.categoryLabels[cat]||cat}</div>
          ${crs.map(cr=>`
            <div class="rating-group">
              <div class="rating-label"><div style="font-weight:600;font-size:0.85rem">${cr.name}</div>${cr.desc?`<div style="font-size:0.7rem;color:var(--text-light)">${cr.desc}</div>`:''}</div>
              <div class="rating-stars" id="rs-${cr.id}">
                ${[1,2,3,4,5].map(n=>`<button class="star-btn" onclick="SelfAssessView._setRating('${cr.id}',${n},this)">★</button>`).join('')}
              </div>
            </div>`).join('')}
        </div>`).join('')}
      <div class="form-group">
        <label>Reflektio & huomiot</label>
        <textarea id="sa-ref" rows="4" placeholder="Missä onnistuit? Mitä kehität? Mikä vaatii lisää harjoittelua?"></textarea>
      </div>
    `;
    Modal.open('Uusi itsearviointi', body,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="SelfAssessView._save()">Tallenna arviointi</button>`);
  },

  _setRating(crId, val, btn) {
    this._data.ratings[crId] = val;
    btn.closest('.rating-stars').querySelectorAll('.star-btn').forEach((s,i)=>s.classList.toggle('filled',i<val));
  },

  _save() {
    if (!Object.keys(this._data.ratings).length) { Toast.show('Anna vähintään yksi arviointi', 'error'); return; }
    const reflection = document.getElementById('sa-ref')?.value?.trim();
    CDApp.addSelfAssessment({
      coachId: CDApp.getCoaches()[0]?.id||'c1',
      date: new Date().toISOString().split('T')[0],
      ratings: { ...this._data.ratings },
      reflection
    });
    Modal.close();
    Toast.show('Itsearviointi tallennettu! 🎯', 'success');
    App.navigate('selfassess');
  },

  compare() {
    const all = [...CDApp.getSelfAssessments()].sort((a,b)=>b.date.localeCompare(a.date));
    if (all.length < 2) { Toast.show('Tarvitset vähintään 2 arviointia vertailuun', 'info'); return; }
    const [latest, prev] = all;
    const criteria = CDApp.getCriteria();
    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="text-align:center;font-size:0.78rem;font-weight:700;color:var(--sjl-blue)">${CDApp.formatDate(latest.date)}<br><span style="color:var(--sjl-ice)">Uusin</span></div>
        <div style="text-align:center;font-size:0.78rem;font-weight:700;color:var(--text-secondary)">${CDApp.formatDate(prev.date)}<br><span>Edellinen</span></div>
      </div>
      ${criteria.filter(cr=>latest.ratings[cr.id]!==undefined||prev.ratings[cr.id]!==undefined).map(cr=>{
        const n=latest.ratings[cr.id]||0;const p=prev.ratings[cr.id]||0;const diff=n-p;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1;font-size:0.85rem">${cr.name}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-weight:700;color:var(--sjl-blue)">${n}/5</span>
            <span style="font-size:1rem;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--text-light)'}">${diff>0?'↑':diff<0?'↓':'→'}</span>
            <span style="font-size:0.78rem;color:var(--text-light)">${p}/5</span>
          </div>
        </div>`;
      }).join('')}
    `;
    Modal.open('Vertailu', body, `<button class="btn-primary btn-sm" onclick="Modal.close()">Sulje</button>`);
  },

  delete(id) {
    if (!confirm('Poistetaanko tämä arviointi?')) return;
    CDApp.save('selfassessments', CDApp.getSelfAssessments().filter(s=>s.id!==id));
    Toast.show('Arviointi poistettu', 'info');
    App.navigate('selfassess');
  }
};
