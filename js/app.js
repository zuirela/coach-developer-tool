/**
 * app.js – Coach Developer Tool pääkontrolleri
 * SPA-navigointi, login, sidebar
 */

const App = {

  /* ---------- VIEW REGISTRY ---------- */
  views: {
    dashboard:   DashboardView,
    observations:ObservationsView,
    forms:       FormsView,
    criteria:    CriteriaView,
    selfassess:  SelfAssessView,
    goals:       GoalsView,
    reports:     ReportsView,
  },

  /* ---------- INIT ---------- */
  init() {
    Modal.init();
    this.bindLogin();
    this.bindNavigation();
    this.bindSidebar();
    this.updateNotifBadge();

    // If user was already logged in (session persistence)
    const savedUser = CDApp.load('session');
    if (savedUser) {
      CDApp.state.user = savedUser.user;
      CDApp.state.role = savedUser.role;
      this.showApp(savedUser.user, savedUser.role);
    }
  },

  /* ---------- LOGIN ---------- */
  bindLogin() {
    // Role selector
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('login-btn').addEventListener('click', () => this.doLogin());

    // Allow Enter key
    ['login-email','login-password'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') this.doLogin();
      });
    });
  },

  doLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const roleBtn  = document.querySelector('.role-btn.active');
    const role     = roleBtn?.dataset.role || 'liitto';

    if (!email || !password) {
      Toast.show('Syötä sähköposti ja salasana', 'error');
      return;
    }

    // Demo login – accept any credentials
    const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Käyttäjä';
    const user = { name, email, role };
    CDApp.state.user = user;
    CDApp.state.role = role;
    CDApp.save('session', { user, role });

    this.showApp(user, role);
  },

  showApp(user, role) {
    // Setup user info in UI
    const initials = user.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
    document.getElementById('avatar-initials').textContent = initials;
    document.getElementById('sidebar-initials').textContent = initials;
    document.getElementById('sidebar-username').textContent = user.name;

    const roleLabels = { liitto: 'Liitto / Coach Developer', seura: 'Valmennuspäällikkö', valmentaja: 'Valmentaja' };
    document.getElementById('sidebar-role').textContent = roleLabels[role] || role;

    // Switch screens
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    document.body.classList.remove('login-page');

    this.navigate('dashboard');
  },

  /* ---------- NAVIGATION ---------- */
  bindNavigation() {
    document.addEventListener('click', e => {
      const navItem = e.target.closest('[data-view]');
      if (!navItem) return;
      e.preventDefault();
      const view = navItem.dataset.view;
      if (view) this.navigate(view);
    });

    document.getElementById('logout-btn').addEventListener('click', e => {
      e.preventDefault();
      CDApp.save('session', null);
      CDApp.state.user = null;
      document.getElementById('app-screen').classList.remove('active');
      document.getElementById('login-screen').classList.add('active');
      document.body.classList.add('login-page');
      this.closeSidebar();
    });

    document.getElementById('notif-btn').addEventListener('click', () => {
      this.showNotifications();
    });

    document.getElementById('profile-btn').addEventListener('click', () => {
      this.showProfile();
    });
  },

  navigate(viewName) {
    CDApp.state.currentView = viewName;

    // Update active state
    document.querySelectorAll('[data-view]').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Render view
    const viewObj = this.views[viewName];
    const content = document.getElementById('main-content');
    if (!viewObj) { content.innerHTML = '<div class="content-wrap"><p>Näkymää ei löydy.</p></div>'; return; }

    // Remove any previous injected scripts
    document.querySelectorAll('.view-script').forEach(s => s.remove());
    CDChart && Object.keys(CDChart._instances).forEach(id => CDChart.destroyIfExists(id));

    content.innerHTML = viewObj.render();

    // Execute any inline scripts from render output
    content.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.className = 'view-script';
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      oldScript.remove();
    });

    // Call afterRender if defined
    if (viewObj.afterRender) viewObj.afterRender();

    // Scroll to top
    content.scrollTop = 0;
    window.scrollTo(0, 0);

    this.closeSidebar();
  },

  /* ---------- SIDEBAR ---------- */
  bindSidebar() {
    document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
  },

  toggleSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const isOpen   = sidebar.classList.contains('open');
    sidebar.classList.toggle('open', !isOpen);
    overlay.classList.toggle('active', !isOpen);
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  },

  /* ---------- NOTIFICATIONS ---------- */
  updateNotifBadge() {
    const count = CDApp.getUnreadCount();
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  },

  showNotifications() {
    const notifs = CDApp.getNotifications();
    const body = notifs.map(n => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start">
        <div style="width:32px;height:32px;border-radius:50%;background:${n.type==='urgent'?'var(--red)':'var(--sjl-ice)'};color:white;display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0">${n.type==='urgent'?'!':'ℹ'}</div>
        <div style="flex:1">
          <div style="font-size:0.88rem;font-weight:600;${n.read?'opacity:0.6':''}">${n.text}</div>
          <div style="font-size:0.72rem;color:var(--text-light);margin-top:2px">${CDApp.formatDate(n.date)}</div>
        </div>
        ${!n.read ? `<span class="badge badge-ice">Uusi</span>` : ''}
      </div>`).join('') || '<div style="text-align:center;padding:20px;color:var(--text-light)">Ei ilmoituksia</div>';

    Modal.open('Ilmoitukset', body, `
      <button class="btn-secondary btn-sm" onclick="CDApp.markNotificationsRead();App.updateNotifBadge();Modal.close()">Merkitse luetuksi</button>
      <button class="btn-primary btn-sm" onclick="Modal.close()">Sulje</button>
    `);
  },

  showProfile() {
    const user = CDApp.state.user;
    const role = CDApp.state.role;
    const roleLabels = { liitto: 'Liitto / Coach Developer', seura: 'Valmennuspäällikkö', valmentaja: 'Valmentaja' };
    const initials = user?.name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() || '??';
    const body = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--sjl-blue);color:white;font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${initials}</div>
        <div style="font-size:1.1rem;font-weight:700">${user?.name||'Käyttäjä'}</div>
        <div style="font-size:0.82rem;color:var(--text-light)">${user?.email||''}</div>
        <span class="badge badge-blue" style="margin-top:8px">${roleLabels[role]||role}</span>
      </div>
      <div style="background:var(--bg-app);border-radius:var(--radius);padding:14px">
        <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.8">
          <div><strong>Havainnointeja:</strong> ${CDApp.getObservations().length}</div>
          <div><strong>Tavoitteita:</strong> ${CDApp.getGoals().length}</div>
          <div><strong>Lomakkeita:</strong> ${CDApp.getForms().length}</div>
          <div><strong>Kriteerejä:</strong> ${CDApp.getCriteria().length}</div>
        </div>
      </div>
    `;
    Modal.open('Profiili', body, `
      <button class="btn-secondary btn-sm" onclick="Modal.close()">Sulje</button>
    `);
  }
};

/* ---------- START ---------- */
document.addEventListener('DOMContentLoaded', () => App.init());
