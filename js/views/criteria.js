/**
 * criteria.js – Havainnointikriteerien hallinta
 */
const CriteriaView = {
  render() {
    const criteria = CDApp.getCriteria();
    const byCat = {};
    criteria.forEach(cr=>{ (byCat[cr.category]=byCat[cr.category]||[]).push(cr); });
    return `
<div class="page-header">
  <div class="page-header-title">Kriteerit</div>
  <div class="page-header-subtitle">${criteria.length} kriteeriä · ${Object.keys(byCat).length} kategoriaa</div>
</div>
<div class="content-wrap">
  ${Object.entries(byCat).map(([cat,crs])=>`
    <div class="mb-16">
      <div class="section-title">${CDApp.categoryEmojis[cat]||'•'} ${CDApp.categoryLabels[cat]||cat}</div>
      <div class="card">
        ${crs.map((cr,i)=>`
          <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;${i<crs.length-1?'border-bottom:1px solid var(--border)':''}">
            <div style="width:36px;height:36px;border-radius:10px;background:${{lajitaidot:'var(--sjl-blue)',vuorovaikutus:'var(--sjl-ice)',suunnittelu:'var(--sjl-gold)'}[cat]||'var(--sjl-blue)'};color:white;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">${CDApp.categoryEmojis[cat]||'•'}</div>
            <div style="flex:1">
              <div style="font-size:0.92rem;font-weight:700;color:var(--text-primary)">${cr.name}</div>
              ${cr.desc?`<div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;line-height:1.4">${cr.desc}</div>`:''}
              <div style="display:flex;gap:6px;margin-top:6px">
                <span class="badge ${cr.source==='liitto'?'badge-blue':'badge-ice'}">${cr.source==='liitto'?'🏒 Liitto':'🏟️ Seura'}</span>
                <span class="badge badge-gray">${CDApp.getObservations().filter(o=>o.ratings&&o.ratings[cr.id]!==undefined).length} arvioitu</span>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button style="background:none;border:none;cursor:pointer;color:var(--text-light);padding:4px" onclick="CriteriaView.edit('${cr.id}')" title="Muokkaa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button style="background:none;border:none;cursor:pointer;color:var(--red);padding:4px" onclick="CriteriaView.delete('${cr.id}')" title="Poista">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('')}
  <button class="btn-primary w-full mt-8" onclick="CriteriaView.openNew()">+ Lisää kriteeri</button>
</div>
<button class="fab" onclick="CriteriaView.openNew()">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</button>`;
  },

  openNew() { this._openEditor(null); },
  edit(id)  { this._openEditor(id); },

  _openEditor(id) {
    const ex = id ? CDApp.getCriteria().find(c=>c.id===id) : null;
    const body = `
      <div class="form-group"><label>Kriteerin nimi *</label>
        <input type="text" id="ncr-name" value="${ex?.name||''}" placeholder="esim. Pelaajan yksilöllinen huomiointi">
      </div>
      <div class="form-group"><label>Kategoria</label>
        <select id="ncr-cat">
          <option value="lajitaidot"  ${ex?.category==='lajitaidot'?'selected':''}>🏒 Lajitaidot</option>
          <option value="vuorovaikutus" ${ex?.category==='vuorovaikutus'?'selected':''}>💬 Vuorovaikutus</option>
          <option value="suunnittelu" ${ex?.category==='suunnittelu'?'selected':''}>📋 Suunnittelu</option>
        </select>
      </div>
      <div class="form-group"><label>Kuvaus</label>
        <textarea id="ncr-desc" placeholder="Miten tätä kriteeriä havainnoidaan käytännössä?">${ex?.desc||''}</textarea>
      </div>
      <div class="form-group"><label>Lähde</label>
        <select id="ncr-src">
          <option value="liitto" ${ex?.source==='liitto'?'selected':''}>Liitto</option>
          <option value="seura"  ${ex?.source==='seura'?'selected':''}>Seura</option>
        </select>
      </div>
    `;
    Modal.open(ex?'Muokkaa kriteeriä':'Uusi kriteeri', body,
      `<button class="btn-secondary btn-sm" onclick="Modal.close()">Peruuta</button>
       <button class="btn-primary btn-sm" onclick="CriteriaView._save('${id||''}')">Tallenna</button>`);
  },

  _save(id) {
    const name     = document.getElementById('ncr-name')?.value?.trim();
    const category = document.getElementById('ncr-cat')?.value;
    const desc     = document.getElementById('ncr-desc')?.value?.trim();
    const source   = document.getElementById('ncr-src')?.value;
    if (!name) { Toast.show('Anna kriteerille nimi', 'error'); return; }
    if (id) {
      const criteria = CDApp.getCriteria().map(c=>c.id===id?{...c,name,category,desc,source}:c);
      CDApp.save('criteria', criteria);
      Toast.show('Kriteeri päivitetty!', 'success');
    } else {
      CDApp.addCriterion({ name, category, desc, source });
      Toast.show('Kriteeri lisätty!', 'success');
    }
    Modal.close();
    App.navigate('criteria');
  },

  delete(id) {
    const cr = CDApp.getCriteria().find(c=>c.id===id);
    if (!confirm(`Poistetaanko kriteeri "${cr?.name}"?`)) return;
    CDApp.save('criteria', CDApp.getCriteria().filter(c=>c.id!==id));
    Toast.show('Kriteeri poistettu', 'info');
    App.navigate('criteria');
  }
};
