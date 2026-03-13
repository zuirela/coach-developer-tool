/**
 * forms.js – Havainnointilomakkeiden hallinta
 */
const FormsView = {
  render() {
    const forms = CDApp.getForms();
    return `
<div class="page-header">
  <div class="page-header-title">Lomakkeet</div>
  <div class="page-header-subtitle">${forms.length} lomaketta · ${forms.filter(f=>f.active).length} aktiivista</div>
</div>
<div class="content-wrap">
  ${forms.length ? forms.map(f => {
    const fCrs = f.criteriaIds.map(id=>CDApp.getCriterion(id)).filter(Boolean);
    const usageCount = CDApp.getObservations().filter(o=>o.formId===f.id).length;
    const byCat = {};
    fCrs.forEach(cr=>{ (byCat[cr.category]=byCat[cr.category]||[]).push(cr); });
    return `
    <div class="card mb-12">
      <div class="card-header">
        <div style="flex:1">
          <div class="card-title">${f.name}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">Luonut: ${f.createdBy} · Käytetty ${usageCount} kertaa</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <span class="badge ${f.active?'badge-green':'badge-gray'}">${f.active?'✓ Aktiivinen':'Ei käytössä'}</span>
          <button class="badge badge-gray" style="cursor:pointer;border:none" onclick="FormsView.toggleActive('${f.id}','${f.active}')">${f.active?'Poista käytöstä':'Aktivoi'}</button>
        </div>
      </div>
      <div class="card-body">
        ${Object.entries(byCat).map(([cat,crs])=>`
          <div style="margin-bottom:10px">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--sjl-ice);margin-bottom:6px">${CDApp.categoryLabels[cat]||cat}</div>
            ${crs.map(cr=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.62rem;color:var(--text-light)">${CDApp.categoryEmojis[cr.category]||'•'}</span>
              <span style="font-size:0.85rem;color:var(--text-primary)">${cr.name}</span>
            </div>`).join('')}
          </div>`).join('')}
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-primary btn-sm" style="flex:1" onclick="ObservationsView.openNewForForm('${f.id}')">Käytä lomaketta</button>
          <button class="btn-secondary btn-sm" onclick="FormsView.editForm('${f.id}')">Muokkaa</button>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="empty-state"><h3>Ei lomakkeita</h3><p>Luo ensimmäinen havainnointilomake.</p></div>`}
  <button class="btn-primary w-full mt-8" onclick="FormsView.openNew()">+ Luo uusi lomake</button>
</div>
<button class="fab" onclick="FormsView.openNew()">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</button>`;
  },

  toggleActive(id, currentActive) {
    const forms = CDApp.getForms().map(f => f.id===id ? {...f,active:currentActive==='true'?false:true} : f);
    CDApp.save('forms', forms);
    Toast.show('Lomakkeen tila päivitetty', 'success');
    App.navigate('forms');
  },

  openNew() { this._openEditor(null); },
  editForm(id) { this._openEditor(id); },

  _openEditor(id) {
    const existing = id ? CDApp.getForm(id) : null;
    const criteria = CDApp.getCriteria();
    const byCat = {};
    criteria.forEach(cr=>{ (byCat[cr.category]=byCat[cr.category]||[]).push(cr); });
    const body = `
      <div class="form-group"><label>Lomakkeen nimi *</label>
        <input type="text" id="nf-name" value="${existing?.name||''}" placeholder="esim. Harjoitushavainnointi kevät 2024">
      </div>
      <div style="margin-bottom:4px;font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary)">Valitse kriteerit</div>
      ${Object.entries(byCat).map(([cat,crs])=>`
        <div style="margin-bottom:12px">
          <div style="font-size:0.72rem;font-weight:700;color:var(--sjl-ice);text-transform:uppercase;margin-bottom:6px">${CDApp.categoryLabels[cat]||cat}</div>
          ${crs.map(cr=>`
            <label style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer">
              <input type="checkbox" value="${cr.id}" ${existing?.criteriaIds.includes(cr.id)?'checked':''} style="width:18px;height:18px;accent-color:var(--sjl-blue);cursor:pointer">
              <div style="flex:1"><div style="font-size:0.88rem;font-weight:600">${cr.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${cr.desc||''}</div></div>
            </label>`).join('')}
        </div>`).join('')}
    `;
    Modal.open(existing?'Muokkaa lomaketta':'Uusi lomake', body,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="FormsView._save('${id||''}')">Tallenna</button>`);
  },

  _save(id) {
    const name    = document.getElementById('nf-name')?.value?.trim();
    const checked = [...document.querySelectorAll('#modal-body input[type=checkbox]:checked')].map(c=>c.value);
    if (!name) { Toast.show('Anna lomakkeelle nimi', 'error'); return; }
    if (!checked.length) { Toast.show('Valitse vähintään yksi kriteeri', 'error'); return; }
    if (id) {
      const forms = CDApp.getForms().map(f => f.id===id ? {...f,name,criteriaIds:checked} : f);
      CDApp.save('forms', forms);
      Toast.show('Lomake päivitetty!', 'success');
    } else {
      CDApp.addForm({ name, criteriaIds:checked, createdBy:CDApp.state.role, active:true });
      Toast.show('Lomake luotu!', 'success');
    }
    Modal.close();
    App.navigate('forms');
  }
};

// Lisätään ObservationsView:lle apufunktio lomaketta varten
ObservationsView.openNewForForm = function(formId) {
  this.openNew();
  setTimeout(() => {
    const sel = document.getElementById('no-form');
    if (sel) { sel.value = formId; this._loadCriteria(); }
  }, 400);
};
