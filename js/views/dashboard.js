/**
 * dashboard.js – Kojelauta-näkymä
 */
const DashboardView = {
  render() {
    const user = CDApp.state.user;
    const role = CDApp.state.role;
    const observations = CDApp.getObservations();
    const goals = CDApp.getGoals();
    const coaches = CDApp.getCoaches();

    // Stats
    const totalObs = observations.length;
    const activeGoals = goals.filter(g => !g.done).length;
    const recentObs = [...observations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

    return `
<div class="page-header">
  <div class="page-header-title">Kojelauta</div>
  <div class="page-header-subtitle">${CDApp.formatDate(new Date().toISOString().split('T')[0])}</div>
</div>

<div class="content-wrap">

  <!-- Welcome Card -->
  <div class="welcome-card mb-16">
    <div class="welcome-name">Hei, ${user?.name?.split(' ')[0] || 'Valmentaja'}! 👋</div>
    <div class="welcome-role">${role === 'liitto' ? 'Coach Developer – Liitto' : role === 'seura' ? 'Valmennuspäällikkö – Seura' : 'Valmentaja'}</div>
    <div class="welcome-stats">
      <div>
        <div class="welcome-stat-val">${totalObs}</div>
        <div class="welcome-stat-lbl">Havainnointia</div>
      </div>
      <div>
        <div class="welcome-stat-val">${coaches.length}</div>
        <div class="welcome-stat-lbl">Valmentajaa</div>
      </div>
      <div>
        <div class="welcome-stat-val">${activeGoals}</div>
        <div class="welcome-stat-lbl">Tavoitetta</div>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="section-title">Pikavalikko</div>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;">
    <button class="quick-action-btn" onclick="App.navigate('observations');setTimeout(()=>ObservationsView.openNew(),300)">
      <span class="qa-icon" style="background:var(--sjl-blue)">👁</span>
      <span>Uusi havainnointi</span>
    </button>
    <button class="quick-action-btn" onclick="App.navigate('selfassess');setTimeout(()=>SelfAssessView.openNew(),300)">
      <span class="qa-icon" style="background:var(--sjl-ice)">♥</span>
      <span>Itsearviointi</span>
    </button>
    <button class="quick-action-btn" onclick="App.navigate('goals')">
      <span class="qa-icon" style="background:var(--green)">🎯</span>
      <span>Uusi tavoite</span>
    </button>
    <button class="quick-action-btn" onclick="App.navigate('reports')">
      <span class="qa-icon" style="background:var(--sjl-gold)">📊</span>
      <span>Raportit</span>
    </button>
  </div>

  <!-- Notifications -->
  <div class="section-title">Ajankohtaista</div>
  <div class="card mb-16">
    <div class="card-body" style="padding:0">
      ${this.renderNotifications()}
    </div>
  </div>

  <!-- Recent observations -->
  <div class="section-title">Viimeisimmät havainnoinnit</div>
  <div class="card mb-16">
    <div class="card-body" style="padding:0 18px">
      ${recentObs.map(o => {
        const coach = CDApp.getCoach(o.coachId);
        const form = CDApp.getForm(o.formId);
        return `
        <div class="list-item" onclick="App.navigate('observations')">
          <div class="list-item-icon" style="background:var(--sjl-blue)">${coach?.avatar || '?'}</div>
          <div class="list-item-content">
            <div class="list-item-title">${coach?.name || 'Valmentaja'}</div>
            <div class="list-item-subtitle">${form?.name || ''} • ${coach?.team || ''}</div>
          </div>
          <div class="list-item-meta">${CDApp.formatDate(o.date)}</div>
        </div>`;
      }).join('') || '<div class="empty-state" style="padding:20px"><p>Ei havainnointeja vielä.</p></div>'}
    </div>
  </div>

  <!-- Coach overview -->
  ${role !== 'valmentaja' ? `
  <div class="section-title">Valmentajat – tilanne</div>
  <div class="card">
    <div class="card-body" style="padding:0 18px">
      ${coaches.map(c => {
        const score = CDApp.overallScore(c.id);
        const obsCount = CDApp.getObservationsFor(c.id).length;
        return `
        <div class="list-item" onclick="App.navigate('reports')">
          <div class="list-item-icon" style="background:${CDApp.levelColors[c.level] || 'var(--sjl-blue)'}">${c.avatar}</div>
          <div class="list-item-content">
            <div class="list-item-title">${c.name}</div>
            <div class="list-item-subtitle">${c.team} • <span class="badge badge-blue">${c.level}-taso</span></div>
            ${score ? `<div class="progress-bar mt-4"><div class="progress-fill" style="width:${(score/5)*100}%;background:var(--sjl-ice)"></div></div>` : ''}
          </div>
          <div class="list-item-meta">
            ${score ? `<strong>${score}</strong>/5` : '–'}<br>
            <span style="font-size:0.7rem;color:var(--text-light)">${obsCount} hav.</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

</div>

<style>
.quick-action-btn {
  background:white;
  border:none;
  border-radius:var(--radius-lg);
  padding:16px 14px;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:8px;
  font-size:0.85rem;
  font-weight:600;
  color:var(--text-primary);
  box-shadow:var(--shadow-sm);
  cursor:pointer;
  transition:all var(--transition);
  text-align:left;
}
.quick-action-btn:hover{box-shadow:var(--shadow);transform:translateY(-1px);}
.qa-icon {
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:1.1rem;
}
</style>
    `;
  },

  renderNotifications() {
    const notifs = CDApp.getNotifications().filter(n => !n.read);
    if (!notifs.length) return `<div style="padding:16px;font-size:0.85rem;color:var(--text-light);text-align:center">Ei uusia ilmoituksia</div>`;
    return notifs.map(n => `
      <div class="list-item" style="padding:12px 18px;border-bottom:1px solid var(--border)">
        <div class="list-item-icon ${n.type === 'urgent' ? '' : 'ice'}" style="font-size:0.8rem;${n.type==='urgent'?'background:var(--red)':''}">${n.type === 'urgent' ? '!' : 'i'}</div>
        <div class="list-item-content">
          <div class="list-item-title" style="font-size:0.85rem;white-space:normal">${n.text}</div>
        </div>
      </div>
    `).join('');
  }
};
