// Generator logic (moved out of app.js)
const STORAGE_KEY = 'esg_kalender_v1';
let calendars = loadCals();
let editingId = null;
let editingCatIndex = null;
// ensure series exist for loaded calendars
calendars.forEach(cal=>{ (cal.categories||[]).forEach(cat=>{ if(!cat.series) cat.series = computeSeries(cat); }) });

function loadCals(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch(e){return []}
}

function saveCals(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars)); }

function renderCalList(){
  const container = document.getElementById('calItems');
  container.innerHTML = '';
  // import/export controls
  const ioRow = document.getElementById('calIoControls');
  if(ioRow){
    ioRow.innerHTML = '';
    const expBtn = document.createElement('button'); expBtn.textContent='Exportiere Daten';
    expBtn.onclick = ()=> exportAllData();
    const impBtn = document.createElement('button'); impBtn.textContent='Importiere Daten';
    impBtn.onclick = ()=> {
      const inp = document.createElement('input'); inp.type='file'; inp.accept='application/json';
      inp.onchange = (e)=>{ const f = e.target.files[0]; if(f) importAllData(f); };
      inp.click();
    };
    ioRow.appendChild(expBtn); ioRow.appendChild(impBtn);
  }
  calendars.forEach((c, idx) =>{
    const div = document.createElement('div');
    div.className = 'cal-item';
    div.textContent = c.name || `Kalender ${idx+1}`;
    div.onclick = ()=> openEditor(idx);
    container.appendChild(div);
    const dl = document.createElement('a');
    dl.href = '#';
    dl.textContent = ' ⬇';
    dl.style.marginLeft='8px';
    dl.onclick = (e)=>{ e.stopPropagation(); downloadCalendarAsICS(c); };
    div.appendChild(dl);
    const dup = document.createElement('a');
    dup.href = '#';
    dup.textContent = ' ⧉';
    dup.title = 'Duplizieren';
    dup.style.marginLeft='6px';
    dup.onclick = (e)=>{ 
      e.stopPropagation();
      // deep clone calendar
      const newCal = JSON.parse(JSON.stringify(c));
      const baseName = c.name || `Kalender${idx+1}`;
      newCal.name = `${baseName}_Kopie`;
      calendars.push(newCal);
      saveCals();
      renderCalList();
      // open editor for the newly created copy
      openEditor(calendars.length-1);
    };
    div.appendChild(dup);
  });
}

function exportAllData(){
  const data = { exportedAt: new Date().toISOString(), payload: calendars };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'esg_kalender_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importAllData(file){
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const parsed = JSON.parse(ev.target.result);
      const incoming = parsed && parsed.payload ? parsed.payload : parsed;
      if(!Array.isArray(incoming)) return alert('Fehler: JSON hat kein gültiges Kalender-Array');
      const mode = confirm('OK = Überschreiben aller Daten; Abbrechen = Anhängen der importierten Kalender') ? 'replace' : 'append';
      if(mode==='replace'){
        calendars = JSON.parse(JSON.stringify(incoming));
      }else{
        calendars = calendars.concat(JSON.parse(JSON.stringify(incoming)));
      }
      // ensure series exists
      calendars.forEach(cal=>{ (cal.categories||[]).forEach(cat=>{ if(!cat.series) cat.series = computeSeries(cat); }) });
      saveCals(); renderCalList(); alert('Import abgeschlossen');
    }catch(e){ alert('Import fehlgeschlagen: ' + e.message); }
  };
  reader.readAsText(file);
}

function openEditor(idx){
  editingId = idx;
  const c = calendars[idx];
  document.getElementById('editEmpty').style.display='none';
  document.getElementById('editArea').style.display='block';
  document.getElementById('calName').value = c.name || '';
  renderCategories();
  // bind download button to this calendar
  const downloadBtn = document.getElementById('downloadCalBtn');
  if(downloadBtn){ downloadBtn.onclick = ()=> downloadCalendarAsICS(calendars[editingId]); }
}

function backToList(){
  editingId = null;
  document.getElementById('editEmpty').style.display='block';
  document.getElementById('editArea').style.display='none';
}

function renderCategories(){
  const list = document.getElementById('categories');
  list.innerHTML = '';
  const c = calendars[editingId];
  // calendar summary
  const calSummary = document.getElementById('calSummary');
  if(calSummary){
    const total = (c.categories||[]).reduce((sum,cat)=> sum + countEffectiveEvents(cat), 0);
    calSummary.innerText = `insgesamt ${total} Termine`;
  }
  (c.categories||[]).forEach((cat, ci) =>{
    const wrapper = document.createElement('div');
    wrapper.className = 'category';
    wrapper.style.borderTop='1px solid #eee';
    const header = document.createElement('div');
    header.innerHTML = `<strong>${cat.name}</strong> — Start: ${cat.startDate} — Repeat: ${cat.repeatWeeks||'einmalig'} Woche(n)`;
    wrapper.appendChild(header);

    const specialDiv = document.createElement('div');
    specialDiv.innerHTML = `<em>Sondertermine:</em> <span style="margin-left:8px;color:#666">insgesamt ${ (cat.specials||[]).length } Sondertermine</span> <span style="margin-left:12px;color:#666">Serie: ${ (cat.series||[]).length } Termine</span>`;
    const pillContainer = document.createElement('div');
    pillContainer.id = `pill-${editingId}-${ci}`;
    (cat.specials||[]).forEach((sd)=>{
      const p = makePill(sd.date, sd.replaced);
      const btn = p.querySelector('button');
      btn.onclick = ()=>{
        // if this special replaced a series date, unmark it
        if(sd.replaced){
          cat.series = (cat.series||[]).map(ent=> (ent.date===sd.replaced) ? { date:ent.date, replacedBy: null } : ent );
        }
        cat.specials = (cat.specials||[]).filter(s=>s.date!==sd.date);
        saveCals(); renderCategories(); updateCalendarSummary();
      };
      pillContainer.appendChild(p);
    });
    specialDiv.appendChild(pillContainer);
    wrapper.appendChild(specialDiv);

    // add special input row
    const controls = document.createElement('div');
    controls.className = 'controls';
    const dateInput = document.createElement('input'); dateInput.type='date'; dateInput.id = `specialDate-${ci}`;
    const replaceChk = document.createElement('input'); replaceChk.type='checkbox'; replaceChk.id = `replaceChk-${ci}`;
    const replaceLabel = document.createElement('label'); replaceLabel.innerText='Nachbartermin ersetzen'; replaceLabel.htmlFor = replaceChk.id;
    const addBtn = document.createElement('button'); addBtn.textContent='Anlegen';
    addBtn.onclick = ()=>{
      const d = dateInput.value; const r = replaceChk.checked;
      if(!d) return alert('Datum auswählen');
      addSpecialToCategory(ci, d, r);
      dateInput.value=''; replaceChk.checked=false;
    };
    controls.appendChild(dateInput);
    controls.appendChild(addBtn);
    controls.appendChild(replaceChk);
    controls.appendChild(replaceLabel);
    wrapper.appendChild(controls);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Bearbeite';
    editBtn.onclick = ()=> { editingCatIndex = ci; renderCategories(); };
    wrapper.appendChild(editBtn);

    const delCatBtn = document.createElement('button');
    delCatBtn.textContent = 'Löschen';
    delCatBtn.style.marginLeft = '8px';
    delCatBtn.onclick = (e) => {
      e.stopPropagation();
      if(!confirm('Kategorie löschen?')) return;
      const cal = calendars[editingId];
      if(!cal || !cal.categories) return;
      cal.categories.splice(ci, 1);
      // if we deleted the category that was being edited, reset edit index
      if(editingCatIndex === ci) editingCatIndex = null;
      saveCals();
      renderCategories();
      updateCalendarSummary();
    };
    wrapper.appendChild(delCatBtn);
    const showBtn = document.createElement('button');
    showBtn.textContent = 'Termine anzeigen';
    showBtn.style.marginLeft = '8px';
    showBtn.onclick = (e) => { e.stopPropagation(); showDatesForCategory(ci); };
    wrapper.appendChild(showBtn);

    // if this category is in edit mode, render edit form
    if(editingCatIndex === ci){
      const form = document.createElement('div');
      form.style.borderTop = '1px dashed #ccc';
      form.style.paddingTop = '8px';
      form.innerHTML = `
        <label>Name: <input id="edit_name_${ci}" type="text" value="${escapeHtml(cat.name)}"></label>
        <label>Startdatum: <input id="edit_start_${ci}" type="date" value="${cat.startDate}"></label>
        <label>Wiederholrhythmus (Wochen, leer = einmalig): <input id="edit_repeat_${ci}" type="number" min="1" value="${cat.repeatWeeks||''}"></label>
        <label>Enddatum: <input id="edit_end_${ci}" type="date" value="${cat.endDate}"></label>
      `;
      const saveBtn = document.createElement('button'); saveBtn.textContent='Speichern';
      saveBtn.onclick = ()=> saveCategoryEdit(ci);
      const cancelBtn = document.createElement('button'); cancelBtn.textContent='Abbrechen'; cancelBtn.style.marginLeft='8px';
      cancelBtn.onclick = ()=> { editingCatIndex = null; renderCategories(); };
      form.appendChild(saveBtn); form.appendChild(cancelBtn);
      wrapper.appendChild(form);
    }

    list.appendChild(wrapper);
  });
}

function makePill(dateStr, replaced){
  const span = document.createElement('span');
  span.className='pill';
  span.innerText = formatDateHuman(dateStr) + (replaced ? ` (ersetzt ${formatDateHuman(replaced)})` : '');
  const btn = document.createElement('button'); btn.textContent='X'; span.appendChild(btn);
  return span;
}

function getEffectiveDates(cat){
  const series = cat.series || computeSeries(cat);
  const effective = new Set();
  series.forEach(ent => { const d = (typeof ent==='string')? ent : ent.date; const replacedBy = ent.replacedBy || null; if(!replacedBy) effective.add(d); });
  (cat.specials||[]).forEach(s=>{ if(s && s.date) effective.add(s.date); });
  const arr = Array.from(effective).map(s=> parseYMD(s));
  arr.sort((a,b)=> a-b);
  return arr.map(d=> formatDateHuman(formatYMD(d))).map(x=> x);
}

function showDatesForCategory(ci){
  if(editingId==null) return;
  const cal = calendars[editingId];
  const cat = cal.categories[ci];
  if(!cat) return alert('Kategorie nicht gefunden');
  const dates = getEffectiveDates(cat);
  if(!dates || dates.length===0) return alert('Keine Termine vorhanden');
  alert(dates.join(', '));
}

function formatDateHuman(d){
  if(!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('de-DE');
}

function newCalendar(){
  const cal = { name: 'Neuer Kalender', categories: [] };
  calendars.push(cal); saveCals(); renderCalList(); openEditor(calendars.length-1);
}

function deleteCalendar(){
  if(editingId==null) return;
  if(!confirm('Kalender löschen?')) return;
  calendars.splice(editingId,1); saveCals(); backToList(); renderCalList();
  // update summary (nothing to show)
  const calSummary = document.getElementById('calSummary'); if(calSummary) calSummary.innerText='';
}

function saveCalendar(){
  if(editingId==null) return;
  const c = calendars[editingId];
  c.name = document.getElementById('calName').value || c.name;
  saveCals(); renderCalList(); alert('Gespeichert');
}

function recomputeCalendar(){
  if(editingId==null) return alert('Kein Kalender ausgewählt');
  const cal = calendars[editingId];
  if(!cal || !cal.categories) return alert('Keine Kategorien vorhanden');
  // For each category, recompute series and reapply specials
  cal.categories.forEach(cat => {
    // recompute base series
    const newSeries = computeSeries(cat);
    // build map of specials by date
    const specials = (cat.specials||[]).slice();
    // reset replacedBy markers
    newSeries.forEach(e=> e.replacedBy = null);
    // for each special that had previously replaced a series date, try to find the nearest date in newSeries and mark it
    specials.forEach(s => {
      if(s.replaced){
        const nearest = findNearestInSeries(newSeries, s.replaced);
        if(nearest){
          // mark replaced entry
          newSeries.forEach(ent=>{ if(ent.date===nearest) ent.replacedBy = s.date; });
          // update special.replaced to the new matched date
          s.replaced = nearest;
        } else {
          // if no nearest, keep replaced null
          s.replaced = null;
        }
      } else if(s.replaced==null && s.date){
        // if special exists without replaced marker, optionally match a nearest series date that equals same day - leave as-is
      }
    });
    cat.series = newSeries;
    cat.specials = specials;
  });
  saveCals(); renderCategories(); updateCalendarSummary(); alert('Neu berechnet');
}

function addCategory(){
  if(editingId==null) return alert('Kein Kalender ausgewählt');
  const name = document.getElementById('newCatName').value.trim();
  const start = document.getElementById('newCatStart').value;
  const repeat = document.getElementById('newCatRepeat').value;
  let end = document.getElementById('newCatEnd').value;
  if(!name || !start) return alert('Name und Startdatum benötigt');
  if(!end){
    const y = new Date(start).getFullYear();
    end = `${y}-12-31`;
  }
  const cat = { name, startDate: start, repeatWeeks: repeat?parseInt(repeat,10):null, endDate: end, specials: [], series: [] };
  // precompute series
  cat.series = computeSeries(cat);
  calendars[editingId].categories.push(cat); saveCals(); renderCategories();
  updateCalendarSummary();
}

function editCategory(idx){
  // legacy fallback (not used when inline edit available)
  const c = calendars[editingId].categories[idx];
  const name = prompt('Name', c.name) || c.name;
  const start = prompt('Startdatum (YYYY-MM-DD)', c.startDate) || c.startDate;
  const repeat = prompt('Wiederholrhythmus (Wochen), leer = einmalig', c.repeatWeeks||'') || c.repeatWeeks;
  const end = prompt('Enddatum (YYYY-MM-DD)', c.endDate) || c.endDate;
  c.name = name; c.startDate = start; c.repeatWeeks = repeat?parseInt(repeat,10):null; c.endDate = end;
  saveCals(); renderCategories();
}

function saveCategoryEdit(ci){
  const name = document.getElementById(`edit_name_${ci}`).value.trim();
  const start = document.getElementById(`edit_start_${ci}`).value;
  const repeat = document.getElementById(`edit_repeat_${ci}`).value;
  const end = document.getElementById(`edit_end_${ci}`).value;
  if(!name || !start) return alert('Name und Startdatum erforderlich');
  const cat = calendars[editingId].categories[ci];
  cat.name = name;
  cat.startDate = start;
  cat.repeatWeeks = repeat?parseInt(repeat,10):null;
  cat.endDate = end || (new Date(start).getFullYear() + '-12-31');
  // recompute series
  cat.series = computeSeries(cat);
  saveCals(); editingCatIndex = null; renderCategories();
  updateCalendarSummary();
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function addSpecialToCategory(catIdx, dateStr, replaceNeighbor){
  const cat = calendars[editingId].categories[catIdx];
  if(!cat) return;
  const specials = cat.specials||[];
  // compute replacement if requested: find nearest from precomputed series
  let replaced = null;
  if(replaceNeighbor){
    const neighbor = findNearestInSeries(cat.series, dateStr);
    if(neighbor) replaced = neighbor;
  }
  const special = { date: dateStr, replaced }; specials.push(special); cat.specials = specials;
  // mark replaced in series: set entry.replacedBy = dateStr
  if(replaced){
    cat.series = (cat.series||[]).map(entry=>{
      const d = (typeof entry === 'string')? entry : entry.date;
      if(d === replaced){ return { date:d, replacedBy: dateStr }; }
      return (typeof entry === 'string')? { date:entry, replacedBy: entry.replacedBy||null } : entry;
    });
  }
  saveCals(); renderCategories(); updateCalendarSummary();
}

function findNearestScheduledDate(cat, dateStr){
  // kept for compatibility, but main code uses precomputed series
  const series = cat.series || computeSeries(cat);
  const nearest = findNearestInSeries(series, dateStr);
  return nearest;
}

function computeSeries(cat){
  const entries = [];
  const start = parseYMD(cat.startDate);
  const end = parseYMD(cat.endDate);
  if(!cat.repeatWeeks){ entries.push({date: formatYMD(start), replacedBy: null}); }
  else{
    let cur = new Date(start.getTime());
    const step = (cat.repeatWeeks||0) * 7;
    while(cur <= end){ entries.push({date: formatYMD(cur), replacedBy: null}); cur.setDate(cur.getDate() + step); }
  }
  return entries; // array of {date, replacedBy}
}

function findNearestInSeries(series, dateStr){
  if(!series || series.length===0) return null;
  const target = parseYMD(dateStr);
  let best = null; let bestDiff = Infinity;
  for(const entry of series){
    const dstr = (typeof entry === 'string') ? entry : entry.date;
    const d = parseYMD(dstr);
    const diff = Math.abs(d - target);
    if(diff < bestDiff){ bestDiff = diff; best = dstr; }
  }
  return best;
}

function countEffectiveEvents(cat){
  const series = cat.series || computeSeries(cat); // array of {date, replacedBy}
  const effectiveDates = new Set();
  // add series dates that are not replaced
  series.forEach(ent => {
    const d = (typeof ent === 'string') ? ent : ent.date;
    const replacedBy = (typeof ent === 'object') ? ent.replacedBy : null;
    if(!replacedBy) effectiveDates.add(d);
  });
  // add all special dates (they replace or add)
  (cat.specials||[]).forEach(s => { if(s && s.date) effectiveDates.add(s.date); });
  return effectiveDates.size;
}

function updateCalendarSummary(){
  if(editingId==null) return;
  const c = calendars[editingId];
  const calSummary = document.getElementById('calSummary');
  if(!calSummary) return;
  const total = (c.categories||[]).reduce((sum,cat)=> sum + countEffectiveEvents(cat), 0);
  calSummary.innerText = `insgesamt ${total} Termine`;
}

function parseYMD(s){ // YYYY-MM-DD -> Date (local)
  const [y,m,d] = s.split('-').map(x=>parseInt(x,10));
  return new Date(y,m-1,d);
}

function formatYMD(dt){
  const y = dt.getFullYear(); const m = String(dt.getMonth()+1).padStart(2,'0'); const d = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function downloadCalendarAsICS(cal){
  // build simple ICS from calendar object
  let lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Entsorgungskalender//DE');
  let uidCtr=1;
  (cal.categories||[]).forEach(cat=>{
    // use precomputed series, respect replacements
    const series = cat.series || computeSeries(cat);
    const replacedMap = {};
    (cat.specials||[]).forEach(s=>{ if(s.replaced) replacedMap[s.replaced]=s.date; });
    const specialDates = (cat.specials||[]).map(s=>s.date);
    const events = [];
    // add series entries unless replaced (series entries are objects {date,replacedBy})
    series.forEach(entry=>{
      const d = (typeof entry === 'string') ? entry : entry.date;
      if(!replacedMap[d]) events.push({date:d, summary:cat.name});
    });
    // add replacements (specials)
    specialDates.forEach(d=> events.push({date:d, summary:cat.name + ' (Sondertermin)'}));
    // sort and emit
    events.sort((a,b)=> new Date(a.date)-new Date(b.date));
    events.forEach(ev=>{
      const dt = ev.date.replace(/-/g,'') + 'T000000';
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${cal.name.replace(/\s+/g,'')}-${uidCtr++}`);
      lines.push(`DTSTAMP:${dt}`);
      lines.push(`DTSTART;VALUE=DATE:${dt.slice(0,8)}`);
      lines.push(`SUMMARY:${ev.summary}`);
      lines.push('END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (cal.name||'kalender') + '.ics';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('newCalBtn').onclick = newCalendar;
  document.getElementById('backToList').onclick = backToList;
  document.getElementById('saveCalBtn').onclick = saveCalendar;
  const recomputeBtn = document.getElementById('recomputeCalBtn'); if(recomputeBtn) recomputeBtn.onclick = recomputeCalendar;
  document.getElementById('deleteCalBtn').onclick = deleteCalendar;
  document.getElementById('addCategoryBtn').onclick = addCategory;
  renderCalList();
});
