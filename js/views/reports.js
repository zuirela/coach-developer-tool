/**
 * reports.js – Raportit & analytiikka
 * Valmentajakohtainen raportti: osaamisprofiili, kehittyminen, yhteenvedot
 */
const ReportsView = {
  _coachId: null,

  selectCoach(id) { this._coachId = id; },

  render() {
    const coaches = CDApp.getCoaches();
    if (!this._coachId) this._coachId = coaches[0]?.id;
    const coach = CDApp.getCoach(this._coachId);
    if (!coach) return '<div class="content-wrap"><div class="empty-state"><h3>Ei valmentajia</h3></div></div>';

    const obs      = CDApp.getObservationsFor(this._coachId);
    const avgs     = CDApp.avgRatings(this._coachId);
    const score    = CDApp.overallScore(this._coachId);
    const goals    = CDApp.getGoalsFor(this._coachId);
    const criteria = CDApp.getCriteria();
    const sas      = CDApp.getSelfAssessments().filter(s=>s.coachId===this._coachId);

    // Radar
    const radarCrs = criteria.filter(cr=>avgs[cr.id]!==undefined);
    const radarLabels = radarCrs.map(cr=>cr.name.length>14?cr.name.slice(0,13)+'…':cr.name);
    const radarData   = radarCrs.map(cr=>avgs[cr.id]||0);
    const selfData    = sas.length ? radarCrs.map(cr=>(sas[sas.length-1].ratings||{})[cr.id]||0) : null;

    // Trend
    const sortedObs    = [...obs].sort((a,b)=>a.date.localeCompare(b.date));
    const trendLabels  = sortedObs.map(o=>CDApp.formatDate(o.date).slice(0,5));
    const trendData    = sortedObs.map(o=>{const v=Object.values(o.ratings||{});return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2):0;});

    // Category averages
    const catAvgs = {};
    criteria.forEach(cr=>{if(avgs[cr.id]){(catAvgs[cr.category]=catAvgs[cr.category]||[]).push(avgs[cr.id]);}});
    const catScores = {};
    Object.entries(catAvgs).forEach(([cat,vals])=>{catScores[cat]=+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);});

    return `
<div class="page-header">
  <div class="page-header-title">Raportit</div>
  <div class="page-header-subtitle">Valmennusosaamisen kehittyminen</div>
</div>
<!-- Coach selector -->
<div style="padding:10px 16px;background:white;border-bottom:1px solid var(--border);overflow-x:auto;white-space:nowrap;display:flex;gap:8px">
  ${coaches.map(c=>`<button class="chip ${this._coachId===c.id?'selected':''}" onclick="ReportsView.selectCoach('${c.id}');App.navigate('reports')">${c.avatar} ${c.name.split(' ')[0]}</button>`).join('')}
</div>
<div class="content-wrap">
  <!-- Coach header -->
  <div class="card mb-16">
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:64px;height:64px;border-radius:50%;background:${CDApp.levelColors[coach.level]||'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;flex-shrink:0">${coach.avatar}</div>
        <div style="flex:1">
          <div style="font-size:1.1rem;font-weight:700">${coach.name}</div>
          <div style="font-size:0.82rem;color:var(--text-light)">${coach.team} · ${coach.club}</div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <span class="badge badge-blue">${coach.level}-taso</span>
            <span class="badge badge-gray">${obs.length} havainnoint${obs.length!==1?'ia':'i'}</span>
            <span class="badge badge-gray">${goals.filter(g=>!g.done).length} tavoitetta</span>
          </div>
        </div>
        ${score!==null?`<div style="text-align:center;background:var(--bg-app);border-radius:var(--radius);padding:12px 16px;flex-shrink:0">
          <div style="font-size:2rem;font-weight:700;color:var(--sjl-blue);line-height:1">${score}</div>
          <div style="font-size:0.65rem;color:var(--text-light);text-transform:uppercase;margin-top:2px">Kokonais&shy;arvo</div>
        </div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px">
        ${Object.entries(catScores).map(([cat,val])=>`<div style="background:var(--bg-app);border-radius:var(--radius);padding:10px;text-align:center">
          <div style="font-size:1.2rem;font-weight:700;color:${{lajitaidot:'var(--sjl-blue)',vuorovaikutus:'var(--sjl-ice)',suunnittelu:'var(--sjl-gold)'}[cat]||'var(--sjl-blue)'}">${val}</div>
          <div style="font-size:0.65rem;color:var(--text-light);text-transform:uppercase">${CDApp.categoryEmojis[cat]||''} ${CDApp.categoryLabels[cat]||cat}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Radar -->
  ${radarData.length>=3?`
  <div class="card mb-16">
    <div class="card-header">
      <div class="card-title">Osaamisprofiili</div>
      <span class="badge badge-ice">${sas.length?'360° vertailu':'Havainnoinnit'}</span>
    </div>
    <div class="card-body">
      <div style="max-width:290px;margin:0 auto"><canvas id="chart-radar" height="270"></canvas></div>
    </div>
  </div>`:''}

  <!-- Trend -->
  ${trendData.length>=2?`
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Kehittyminen</div><span class="badge badge-gray">${obs.length} havainnointia</span></div>
    <div class="card-body" style="height:200px"><canvas id="chart-trend" height="180"></canvas></div>
  </div>`:''}

  <!-- Kriteerit erittely -->
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Kriteerit</div></div>
    <div class="card-body">
      ${radarCrs.length?radarCrs.map(cr=>{
        const val=avgs[cr.id]||0;const selfVal=sas.length?(sas[sas.length-1].ratings||{})[cr.id]:null;
        return `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:0.85rem;font-weight:600">${cr.name}</span>
            <div style="display:flex;align-items:center;gap:8px">
              ${selfVal!==null?`<span style="font-size:0.75rem;color:var(--text-light)">Itse: ${selfVal}</span>`:''}
              <span style="font-weight:700;color:var(--sjl-blue)">${val}/5</span>
            </div>
          </div>
          <div class="progress-bar" style="height:8px;border-radius:4px">
            <div class="progress-fill ice" style="width:${(val/5)*100}%;height:100%;border-radius:4px"></div>
          </div>
          ${selfVal!==null?`<div style="display:flex;align-items:center;gap:4px;margin-top:3px"><div style="height:3px;width:${(selfVal/5)*100}%;background:var(--sjl-blue);border-radius:2px;opacity:0.4"></div></div>`:''}
        </div>`;
      }).join('') : '<div style="color:var(--text-light);font-size:0.85rem;text-align:center;padding:16px">Ei arviointeja vielä. Tee havainnointi aloittaaksesi.</div>'}
    </div>
  </div>

  <!-- Tavoitteet -->
  ${goals.length?`
  <div class="card mb-16">
    <div class="card-header"><div class="card-title">Kehitystavoitteet</div><span class="badge badge-gray">${goals.length}</span></div>
    <div class="card-body" style="padding:0 16px">
      ${goals.map(g=>`
        <div class="list-item" style="cursor:pointer" onclick="App.navigate('goals')">
          <div style="width:32px;height:32px;border-radius:50%;background:${g.done?'var(--green)':'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0">${g.done?'✓':'🎯'}</div>
          <div class="list-item-content">
            <div class="list-item-title">${g.title}</div>
            <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:4px"><div style="height:100%;width:${g.progress}%;background:${g.done?'var(--green)':'var(--sjl-blue)'};border-radius:2px"></div></div>
          </div>
          <div style="font-weight:700;color:${g.done?'var(--green)':'var(--sjl-blue)'};flex-shrink:0">${g.progress}%</div>
        </div>`).join('')}
    </div>
  </div>`:''}

  <!-- Viimeisimmät havainnoinnit -->
  <div class="card mb-16">
    <div class="card-header">
      <div class="card-title">Havainnointihistoria</div>
      <button class="btn-primary btn-sm" onclick="ObservationsView.openNewFor('${this._coachId}');App.navigate('observations');setTimeout(()=>ObservationsView.openNewFor('${this._coachId}'),300)">+ Uusi</button>
    </div>
    <div class="card-body" style="padding:0 16px">
      ${[...obs].sort((a,b)=>b.date.localeCompare(a.date)).map(o=>{
        const form=CDApp.getForm(o.formId);
        const vals=Object.values(o.ratings||{});
        const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):null;
        return `<div class="list-item" style="cursor:pointer" onclick="ObservationsView.viewDetail('${o.id}')">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--bg-app);display:flex;align-items:center;justify-content:center;font-size:1.2rem">📋</div>
          <div class="list-item-content"><div class="list-item-title">${form?.name||''}</div><div class="list-item-subtitle">${o.location||''} · ${o.observer||''}</div></div>
          <div style="text-align:right;flex-shrink:0">${avg?`<div style="font-weight:700;color:var(--sjl-blue)">${avg}/5</div>`:''}<div style="font-size:0.72rem;color:var(--text-light)">${CDApp.formatDate(o.date)}</div></div>
        </div>`;
      }).join('') || '<div style="padding:16px;text-align:center;color:var(--text-light);font-size:0.85rem">Ei havainnointeja vielä.</div>'}
    </div>
  </div>

</div>

<script id="report-charts">
(function(){
  setTimeout(function(){
    ${radarData.length>=3?`
    var datasets = [{label:'Havainnoinnit',data:${JSON.stringify(radarData)},borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.12)',borderWidth:2,pointBackgroundColor:'#00ACD7',pointRadius:4}];
    ${selfData?`datasets.push({label:'Itsearviointi',data:${JSON.stringify(selfData)},borderColor:'#002E6D',backgroundColor:'rgba(0,46,109,0.08)',borderWidth:2,pointBackgroundColor:'#002E6D',pointRadius:4});`:''}
    CDChart.radar('chart-radar',${JSON.stringify(radarLabels)},datasets);`:''}
    ${trendData.length>=2?`
    CDChart.line('chart-trend',${JSON.stringify(trendLabels)},[{label:'Kokonaisarvo',data:${JSON.stringify(trendData)},borderColor:'#00ACD7',backgroundColor:'rgba(0,172,215,0.08)',fill:true}]);`:''}
  }, 150);
})();
</script>`;
  }
};
