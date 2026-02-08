let lookup = {};

fetch("lookup.json")
  .then(r => r.json())
  .then(data => lookup = data);

// After lookup is loaded, fill the datalist for street autocomplete
fetch("lookup.json")
  .then(r => r.json())
  .then(data => {
    const dl = document.getElementById('streets');
    if (!dl) return;
    Object.keys(data).sort((a,b) => a.localeCompare(b, 'de')).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      dl.appendChild(opt);
    });
  })
  .catch(() => {});

function findCalendar() {
  const streetInput = document.getElementById("street").value.trim();
  const year = document.getElementById("year").value.trim();
  const out = document.getElementById("output");

  out.innerHTML = "";

  if (!streetInput || !year) {
    out.innerHTML = `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg fade-in">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-red-700 font-medium">Bitte Straße und Jahr eingeben.</span>
        </div>
      </div>
    `;
    return;
  }

  // case-insensitive lookup
  const streetKey = Object.keys(lookup)
    .find(k => k.toLowerCase() === streetInput.toLowerCase());

  if (!streetKey) {
    out.innerHTML = `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg fade-in">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-red-700 font-medium">Straße nicht gefunden.</span>
        </div>
      </div>
    `;
    return;
  }

  const bezirk = lookup[streetKey];
  const freq = document.getElementById('frequencySelect')?.value || '2w';

  // Naming convention: Entsorgungskalender_Pfullingen_<Bezirk>_<Jahr>_<freq>.ics
  // where <freq> is '2w' or '4w' (2-wöchig bzw. 4-wöchig)
  const filename = `Entsorgungskalender_Pfullingen_${bezirk}_${year}_${freq}.ics`;
  const url = `kalender/${filename}`;

  // Zeige Lade-Animation
  out.innerHTML = `
    <div class="flex items-center justify-center p-6">
      <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-3 text-gray-600">Prüfe Kalender...</span>
    </div>
  `;

  // Prüfe, ob die Datei existiert
  fetch(url, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // Datei existiert - Erfolgsmeldung anzeigen
        out.innerHTML = `
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 fade-in shadow-md">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-green-800 font-bold text-lg">Kalender gefunden!</span>
                </div>
                <div class="space-y-2 text-gray-700">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">Bezirk:</span>
                    <span class="px-3 py-1 bg-white rounded-full text-indigo-700 font-bold shadow-sm">${bezirk}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">Abholart:</span>
                    <span class="px-3 py-1 bg-white rounded-full text-blue-700 font-medium shadow-sm">${freq === '2w' ? '2-wöchig' : '4-wöchig'}</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="${url}" download 
               class="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-md hover:shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Kalender herunterladen
            </a>
          </div>
        `;
      } else {
        // Datei existiert nicht - Fehlermeldung anzeigen
        out.innerHTML = `
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg fade-in">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <span class="text-red-700 font-medium block mb-1">Kalender nicht gefunden</span>
                <span class="text-red-600 text-sm">Die Datei <code class="bg-red-100 px-2 py-0.5 rounded font-mono text-xs">${filename}</code> wurde nicht gefunden.</span>
                <p class="text-red-600 text-sm mt-2">Bitte überprüfen Sie Ihre Eingaben oder kontaktieren Sie den Support.</p>
              </div>
            </div>
          </div>
        `;
      }
    })
    .catch(error => {
      // Netzwerkfehler oder andere Fehler
      out.innerHTML = `
        <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg fade-in">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-orange-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <span class="text-orange-700 font-medium block mb-1">Fehler beim Prüfen</span>
              <span class="text-orange-600 text-sm">Die Kalenderdatei konnte nicht überprüft werden. Bitte versuchen Sie es erneut.</span>
            </div>
          </div>
        </div>
      `;
    });
}