/**
 * dashboard.js – Kojelauta-näkymä
 */
const DashboardView = {
  render() {
    const user = CDApp.state.user;
    const role = CDApp.state.role;
    const obs = CDApp.getObservations();
    const goals = CDApp.getGoals();
    const coaches = CDApp.getCoaches();
    const notifs = CDApp.getNotifications().filter(n => !n.read);
    const recent = [...obs].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
    const activeGoals = goals.filter(g => !g.done).length;
    const thisMonth = new Date().toISOString().slice(0,7);
    const obsMonth = obs.filter(o => o.date.startsWith(thisMonth)).length;
    const roleLabel = {liitto:'Liitto / Coach Developer',seura:'Valmennuspäällikkö',valmentaja:'Valmentaja'}[role]||role;
    return `
<div class="page-header">
  <div class="page-header-title">Kojelauta</div>
  <div class="page-header-subtitle">${new Date().toLocaleDateString('fi-FI',{weekday:'long',day:'numeric',month:'long'})}</div>
</div>
<div class="content-wrap">
  <div class="welcome-card mb-16">
    <div class="welcome-name">Hei, ${(user?.name||'Käyttäjä').split(' ')[0]}! 👋</div>
    <div class="welcome-role">${roleLabel}</div>
    <div class="welcome-stats">
      <div><div class="welcome-stat-val">${obs.length}</div><div class="welcome-stat-lbl">Havainnointia</div></div>
      <div><div class="welcome-stat-val">${obsMonth}</div><div class="welcome-stat-lbl">Tässä kuussa</div></div>
      <div><div class="welcome-stat-val">${activeGoals}</div><div class="welcome-stat-lbl">Tavoitetta</div></div>
    </div>
  </div>
  <div class="stats-grid mb-16">
    <div class="stat-card" style="--accent:var(--sjl-blue)"><div class="stat-value">${coaches.length}</div><div class="stat-label">Valmentajaa</div></div>
    <div class="stat-card" style="--accent:var(--sjl-ice)"><div class="stat-value">${CDApp.getForms().filter(f=>f.active).length}</div><div class="stat-label">Lomaketta</div></div>
    <div class="stat-card" style="--accent:var(--green)"><div class="stat-value">${goals.filter(g=>g.done).length}</div><div class="stat-label">Saavutettu</div></div>
    <div class="stat-card" style="--accent:var(--sjl-gold)"><div class="stat-value">${CDApp.getCriteria().length}</div><div class="stat-label">Kriteeriä</div></div>
  </div>
  <div class="section-title">Pikavalikko</div>
  <div class="quick-grid mb-16">
    <button class="quick-btn" onclick="App.navigate('observations');setTimeout(()=>ObservationsView.openNew(),350)">
      <div class="quick-icon" style="background:var(--sjl-blue)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
      <span>Uusi havainnointi</span>
    </button>
    <button class="quick-btn" onclick="App.navigate('selfassess');setTimeout(()=>SelfAssessView.openNew(),350)">
      <div class="quick-icon" style="background:var(--sjl-ice)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
      <span>Itsearviointi</span>
    </button>
    <button class="quick-btn" onclick="App.navigate('goals');setTimeout(()=>GoalsView.openNew(),350)">
      <div class="quick-icon" style="background:var(--green)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
      <span>Uusi tavoite</span>
    </button>
    <button class="quick-btn" onclick="App.navigate('reports')">
      <div class="quick-icon" style="background:var(--sjl-gold)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
      <span>Raportit</span>
    </button>
  </div>
  ${notifs.length ? `
  <div class="section-title">Ajankohtaista <span class="badge badge-ice" style="vertical-align:middle">${notifs.length}</span></div>
  <div class="card mb-16">
    ${notifs.map(n=>`
    <div style="display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)">
      <div style="width:32px;height:32px;border-radius:50%;background:${n.type==='urgent'?'var(--red)':'var(--sjl-ice)'};color:white;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;font-weight:700">${n.type==='urgent'?'!':'i'}</div>
      <div style="flex:1"><div style="font-size:0.88rem;font-weight:600;line-height:1.4">${n.text}</div><div style="font-size:0.72rem;color:var(--text-light);margin-top:2px">${CDApp.formatDate(n.date)}</div></div>
    </div>`).join('')}
    <div style="padding:10px 16px;text-align:right"><button class="btn-secondary btn-sm" onclick="CDApp.markNotificationsRead();App.updateNotifBadge();App.navigate('dashboard')">Merkitse luetuksi</button></div>
  </div>` : ''}
  <div class="section-title">Viimeisimmät havainnoinnit</div>
  <div class="card mb-16">
    ${recent.length ? recent.map(o => {
      const coach=CDApp.getCoach(o.coachId);const form=CDApp.getForm(o.formId);
      const vals=Object.values(o.ratings||{});const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):null;
      return `<div class="list-item" style="padding:12px 16px;cursor:pointer" onclick="ObservationsView.viewDetail('${o.id}')">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--sjl-blue);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;flex-shrink:0">${coach?.avatar||'?'}</div>
        <div class="list-item-content"><div class="list-item-title">${coach?.name||'Valmentaja'}</div><div class="list-item-subtitle">${form?.name||''} · ${coach?.team||''}</div></div>
        <div style="text-align:right;flex-shrink:0">${avg?`<div style="font-weight:700;color:var(--sjl-blue)">${avg}/5</div>`:''}<div style="font-size:0.72rem;color:var(--text-light)">${CDApp.formatDate(o.date)}</div></div>
      </div>`;
    }).join('') : '<div style="padding:24px;text-align:center;color:var(--text-light);font-size:0.85rem">Ei havainnointeja vielä.</div>'}
    ${obs.length>5?`<div style="padding:10px 16px;text-align:center"><button class="btn-secondary btn-sm" onclick="App.navigate('observations')">Näytä kaikki (${obs.length})</button></div>`:''}
  </div>
  ${role!=='valmentaja'?`
  <div class="section-title">Valmentajien tilanne</div>
  <div class="card">
    ${coaches.map(c=>{
      const score=CDApp.overallScore(c.id);const nObs=CDApp.getObservationsFor(c.id).length;const nGoals=CDApp.getGoalsFor(c.id).filter(g=>!g.done).length;
      return `<div class="list-item" style="padding:12px 16px;cursor:pointer" onclick="ReportsView.selectCoach('${c.id}');App.navigate('reports')">
        <div style="width:40px;height:40px;border-radius:50%;background:${CDApp.levelColors[c.level]||'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${c.avatar}</div>
        <div class="list-item-content"><div class="list-item-title">${c.name}</div><div style="font-size:0.75rem;color:var(--text-light)">${c.team}</div>${score!==null?`<div class="progress-bar mt-4" style="max-width:120px"><div class="progress-fill ice" style="width:${(score/5)*100}%"></div></div>`:''}</div>
        <div style="text-align:right;flex-shrink:0"><span class="badge badge-blue">${c.level}</span><div style="font-size:0.72rem;color:var(--text-light);margin-top:4px">${nObs} hav.</div>${score!==null?`<div style="font-weight:700;color:var(--sjl-blue)">${score}/5</div>`:''}</div>
      </div>`;
    }).join('')}
  </div>`:''}
</div>
<style>
.quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.quick-btn{background:white;border:none;border-radius:var(--radius-lg);padding:16px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;font-size:0.85rem;font-weight:600;color:var(--text-primary);box-shadow:var(--shadow-sm);cursor:pointer;transition:all var(--transition);text-align:left;width:100%}
.quick-btn:hover{box-shadow:var(--shadow);transform:translateY(-2px)}
.quick-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}
</style>`;
  }
};
