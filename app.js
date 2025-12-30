let lookup = {};

fetch("lookup.json")
  .then(r => r.json())
  .then(data => lookup = data);

function findCalendar() {
  const streetInput = document.getElementById("street").value.trim();
  const year = document.getElementById("year").value.trim();
  const out = document.getElementById("output");

  out.innerHTML = "";

  if (!streetInput || !year) {
    out.innerHTML = `<div class="error">Bitte Straße und Jahr eingeben.</div>`;
    return;
  }

  // case-insensitive lookup
  const streetKey = Object.keys(lookup)
    .find(k => k.toLowerCase() === streetInput.toLowerCase());

  if (!streetKey) {
    out.innerHTML = `<div class="error">Straße nicht gefunden.</div>`;
    return;
  }

  const bezirk = lookup[streetKey];
  const freq = document.getElementById('frequencySelect')?.value || '2w';

  // Naming convention: Entsorgungskalender_Pfullingen_<Bezirk>_<Jahr>_<freq>.ics
  // where <freq> is '2w' or '4w' (2-wöchig bzw. 4-wöchig)
  const filename = `Entsorgungskalender_Pfullingen_${bezirk}_${year}_${freq}.ics`;
  const url = `kalender/${filename}`;

  out.innerHTML = `
    <div class="result">
      Bezirk: <strong>${bezirk}</strong><br>
      Abholart: <strong>${freq === '2w' ? '2-wöchig' : '4-wöchig'}</strong><br><br>
      <a href="${url}" download>📅 Kalender herunterladen</a>
    </div>
  `;
}