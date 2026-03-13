/**
 * Coach Developer Tool – SJL
 * data.js – Sovelluksen tietorakenne ja mock-data
 * Kaikki data tallennetaan localStorage:iin
 */

const CDApp = {

  /* ---------- STATE ---------- */
  state: {
    user: null,
    currentView: 'dashboard',
    role: 'liitto' // 'liitto' | 'seura' | 'valmentaja'
  },

  /* ---------- STORAGE HELPERS ---------- */
  load(key, fallback = null) {
    try {
      const v = localStorage.getItem('cdt_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  save(key, value) {
    try { localStorage.setItem('cdt_' + key, JSON.stringify(value)); } catch {}
  },

  /* ---------- INITIAL SEED DATA ---------- */
  seed() {
    if (this.load('seeded')) return;

    this.save('coaches', [
      { id: 'c1', name: 'Kari Laamanen',   team: 'JYP U20',       level: 'C',  club: 'JYP',        email: 'kari@jyp.fi',    avatar: 'KL' },
      { id: 'c2', name: 'Sanna Virtanen',  team: 'HIFK U16 naiset',level: 'B',  club: 'HIFK',       email: 'sanna@hifk.fi',  avatar: 'SV' },
      { id: 'c3', name: 'Matti Korhonen',  team: 'TPS U18',        level: 'B',  club: 'TPS',        email: 'matti@tps.fi',   avatar: 'MK' },
      { id: 'c4', name: 'Liisa Nieminen',  team: 'Ässät U16',      level: 'C',  club: 'Ässät',      email: 'liisa@assat.fi', avatar: 'LN' },
      { id: 'c5', name: 'Juhani Hakala',   team: 'Ilves U20',      level: 'A',  club: 'Ilves',      email: 'juha@ilves.fi',  avatar: 'JH' },
      { id: 'c6', name: 'Päivi Rautanen',  team: 'KalPa U14',      level: 'D',  club: 'KalPa',      email: 'paivi@kalpa.fi', avatar: 'PR' },
    ]);

    this.save('criteria', [
      { id: 'cr1', category: 'lajitaidot',    name: 'Jääajan hyödyntäminen',  desc: 'Käytetty jääaika vs. jonottaminen.', source: 'liitto' },
      { id: 'cr2', category: 'lajitaidot',    name: 'Pallokosketusten määrä', desc: 'Kosketusten määrä harjoituksessa.', source: 'liitto' },
      { id: 'cr3', category: 'lajitaidot',    name: 'Pelitilanteiden laatu',  desc: 'Tilanteiden autenttisuus harjoituksessa.', source: 'liitto' },
      { id: 'cr4', category: 'vuorovaikutus', name: 'Puhe vs. kysyminen',     desc: 'Valmentajan tapa käydä asioita läpi.', source: 'liitto' },
      { id: 'cr5', category: 'vuorovaikutus', name: 'Palautteen laatu',       desc: 'Spesifi / Kerro / Kysy / Vahvista.', source: 'liitto' },
      { id: 'cr6', category: 'vuorovaikutus', name: 'Yritys/Keskittyminen',   desc: 'Pelaajien motivaatio ja sitoutuminen.', source: 'liitto' },
      { id: 'cr7', category: 'suunnittelu',   name: 'Harjoitussuunnitelma',   desc: 'Harjoitussuunnitelman laatu ja selkeys.', source: 'seura' },
      { id: 'cr8', category: 'suunnittelu',   name: 'Reflektion laatu',       desc: 'Harjoituksen jälkeinen reflektio.', source: 'seura' },
    ]);

    this.save('forms', [
      { id: 'f1', name: 'Perushavainnointi',         criteriaIds: ['cr1','cr2','cr4','cr5'], createdBy: 'liitto', active: true },
      { id: 'f2', name: 'Vuorovaikutusarviointi',    criteriaIds: ['cr4','cr5','cr6'],       createdBy: 'liitto', active: true },
      { id: 'f3', name: 'Lajitaito-arviointi',       criteriaIds: ['cr1','cr2','cr3'],       createdBy: 'seura',  active: true },
      { id: 'f4', name: 'Kokonaishavainnointi',      criteriaIds: ['cr1','cr2','cr3','cr4','cr5','cr6'], createdBy: 'liitto', active: false },
    ]);

    this.save('observations', [
      { id: 'o1', coachId: 'c1', formId: 'f1', date: '2024-02-10', observer: 'Kari Esimerkki', location: 'Jyväskylä jäähalli', notes: 'Hyvä harjoitusrakenne, palautteen laatu parantunut.', ratings: { cr1: 4, cr2: 3, cr4: 5, cr5: 4 }, counters: { puhe: 12, kysyminen: 8 } },
      { id: 'o2', coachId: 'c2', formId: 'f2', date: '2024-02-08', observer: 'Kari Esimerkki', location: 'Helsinki, Nordis',   notes: 'Positiivinen ilmapiiri, lisää kysymistä.', ratings: { cr4: 3, cr5: 3, cr6: 4 }, counters: { puhe: 18, kysyminen: 5 } },
      { id: 'o3', coachId: 'c3', formId: 'f1', date: '2024-01-28', observer: 'Kari Esimerkki', location: 'Turkuhalli',         notes: 'Jääaikaa käytetään tehokkaasti.', ratings: { cr1: 5, cr2: 4, cr4: 4, cr5: 4 }, counters: { puhe: 10, kysyminen: 12 } },
      { id: 'o4', coachId: 'c1', formId: 'f2', date: '2024-01-15', observer: 'Kari Esimerkki', location: 'Jyväskylä jäähalli', notes: 'Kehitystä nähtävissä edellisestä.', ratings: { cr4: 4, cr5: 3, cr6: 4 }, counters: { puhe: 14, kysyminen: 9 } },
      { id: 'o5', coachId: 'c4', formId: 'f3', date: '2024-02-01', observer: 'Kari Esimerkki', location: 'Pori, Isomäki',      notes: 'Kehitettävää lajitaitoharjoittelussa.', ratings: { cr1: 3, cr2: 2, cr3: 3 }, counters: {} },
    ]);

    this.save('selfassessments', [
      { id: 's1', coachId: 'c1', date: '2024-02-12', ratings: { cr1: 4, cr2: 3, cr4: 4, cr5: 3, cr6: 4 }, reflection: 'Palautteen antaminen kehittyy, mutta tarvitsen lisää harjoittelua kysymistekniikassa.' },
    ]);

    this.save('goals', [
      { id: 'g1', coachId: 'c1', title: 'Enemmän energiaa treeneissä', desc: 'Käytän enemmän vaihtelua ja energiaa harjoitusten rakentamisessa.', deadline: '2024-04-30', progress: 60, done: false },
      { id: 'g2', coachId: 'c1', title: 'Kaikkien pelaajien huomiointi ja tasaarvoinen palaute', desc: 'Seuraan palautteen jakautumista eri pelaajille.', deadline: '2024-03-31', progress: 35, done: false },
      { id: 'g3', coachId: 'c2', title: 'Kysymistekniikan kehittäminen', desc: 'Tavoite: vähintään 40% palautteesta kysymysmuodossa.', deadline: '2024-05-31', progress: 25, done: false },
      { id: 'g4', coachId: 'c3', title: 'Harjoitussuunnitelman etukäteen tekeminen', desc: 'Jokainen harjoitus suunniteltu vähintään 24h etukäteen.', deadline: '2024-02-28', progress: 100, done: true },
    ]);

    this.save('notifications', [
      { id: 'n1', text: 'Täytä havainnointilomake: 11.10.2023, Viikkotreenit', date: '2024-02-13', read: false, type: 'urgent' },
      { id: 'n2', text: 'Koulutustaphutuma 30.10.2023', date: '2024-02-13', read: false, type: 'info' },
      { id: 'n3', text: 'Uusi itsearviointi – Muista vastata', date: '2024-02-11', read: true, type: 'info' },
    ]);

    this.save('seeded', true);
  },

  /* ---------- DATA ACCESSORS ---------- */
  getCoaches() { return this.load('coaches', []); },
  getCoach(id) { return this.getCoaches().find(c => c.id === id); },

  getCriteria() { return this.load('criteria', []); },
  getCriterion(id) { return this.getCriteria().find(c => c.id === id); },

  getForms() { return this.load('forms', []); },
  getForm(id) { return this.getForms().find(f => f.id === id); },

  getObservations() { return this.load('observations', []); },
  getObservationsFor(coachId) { return this.getObservations().filter(o => o.coachId === coachId); },

  getSelfAssessments() { return this.load('selfassessments', []); },

  getGoals() { return this.load('goals', []); },
  getGoalsFor(coachId) { return this.getGoals().filter(g => g.coachId === coachId); },

  getNotifications() { return this.load('notifications', []); },
  getUnreadCount() { return this.getNotifications().filter(n => !n.read).length; },

  /* ---------- DATA MUTATORS ---------- */
  addObservation(obs) {
    const observations = this.getObservations();
    obs.id = 'o' + Date.now();
    observations.push(obs);
    this.save('observations', observations);
    return obs;
  },

  addGoal(goal) {
    const goals = this.getGoals();
    goal.id = 'g' + Date.now();
    goals.push(goal);
    this.save('goals', goals);
    return goal;
  },

  updateGoal(id, updates) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) { goals[idx] = { ...goals[idx], ...updates }; this.save('goals', goals); }
  },

  addSelfAssessment(sa) {
    const sas = this.getSelfAssessments();
    sa.id = 's' + Date.now();
    sas.push(sa);
    this.save('selfassessments', sas);
    return sa;
  },

  addCriterion(cr) {
    const criteria = this.getCriteria();
    cr.id = 'cr' + Date.now();
    criteria.push(cr);
    this.save('criteria', criteria);
    return cr;
  },

  addForm(form) {
    const forms = this.getForms();
    form.id = 'f' + Date.now();
    forms.push(form);
    this.save('forms', forms);
    return form;
  },

  markNotificationsRead() {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    this.save('notifications', notifs);
  },

  /* ---------- HELPERS ---------- */
  categoryLabels: {
    lajitaidot:   'Lajitaidot',
    vuorovaikutus:'Vuorovaikutus',
    suunnittelu:  'Suunnittelu',
  },

  levelColors: {
    A: '#002E6D',
    B: '#00ACD7',
    C: '#8B6F4E',
    D: '#CFCFCD',
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
  },

  /* Average rating for a coach across all observations */
  avgRatings(coachId) {
    const obs = this.getObservationsFor(coachId);
    const totals = {};
    const counts = {};
    obs.forEach(o => {
      Object.entries(o.ratings || {}).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + v;
        counts[k] = (counts[k] || 0) + 1;
      });
    });
    const avgs = {};
    Object.keys(totals).forEach(k => { avgs[k] = +(totals[k] / counts[k]).toFixed(1); });
    return avgs;
  },

  /* Overall score 1-5 for a coach */
  overallScore(coachId) {
    const avgs = this.avgRatings(coachId);
    const vals = Object.values(avgs);
    if (!vals.length) return null;
    return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  },
};

// Init seed data on load
CDApp.seed();
