TL;DR: Wer schnell an die .ics-Dateien kommen will: https://pwhty.github.io/entsorgungskalender_pfullingen/

# Entsorgungskalender Pfullingen

Diese Web-App ermöglicht es, den passenden **Entsorgungskalender (ICS)** für eine Straße in Pfullingen auszuwählen und direkt herunterzuladen. Zusätzlich gibt es einen interaktiven Generator zum Erstellen eigener Kalender.

✨ **Modernes Design** mit Tailwind CSS  
🚀 **Vollständig im Browser** – keine Installation nötig  
📱 **Responsive** – funktioniert auf Desktop, Tablet und Smartphone

---

## 🔍 Funktionsweise

### Straßensuche (index.html)

1. **Straße eingeben** – mit Autocomplete-Unterstützung
2. **Jahr auswählen** – Standard ist das aktuelle Jahr
3. **Abholfrequenz wählen** – 2-wöchig oder 4-wöchig
4. Die App ermittelt anhand einer Lookup-Tabelle den zuständigen **Bezirk**
5. **Automatische Validierung** – prüft, ob die Kalenderdatei existiert
6. Der passende **Kalender (.ics)** wird zum Download angeboten

Die Kalenderdatei kann anschließend z. B. in:
- Apple Kalender
- Google Kalender
- Outlook  
- Home Assistant

importiert werden.

---

## 📅 Herkunft der Kalenderdaten (wichtig)

⚠️ **Wichtiger Hinweis:**

Die bereitgestellten `.ics`-Dateien sind **nicht offiziell von der Stadt Pfullingen**.

- Die Termine wurden **manuell bzw. per KI aus öffentlich zugänglichen Informationen** übertragen
- Es gibt **keine Garantie auf Vollständigkeit oder Richtigkeit**
- Maßgeblich bleiben immer die **offiziellen Veröffentlichungen der Stadt**

Diese Anwendung ist ein **privates Hilfsprojekt**, gedacht zur persönlichen Nutzung in Home Assistant.

---

## 🤝 Mitmachen / Beiträge

Pull Requests sind **ausdrücklich willkommen**, insbesondere für:

- neue Jahre (z. B. `2027`, `2028`, …)
- Korrekturen an bestehenden Kalendern
- Änderungen an Bezirke
- Verbesserungen an der Lookup-Datei (Straße → Bezirk)

### Namenskonvention für Kalenderdateien
Die App unterstützt unterschiedliche Dateien für 2‑wöchige und 4‑wöchige Restmüll‑Abholung. Lege beim Generieren beider Varianten jeweils getrennte `.ics`‑Dateien an.

Format:
```text
Entsorgungskalender_Pfullingen_<BEZIRK>_<JAHR>_<FREQ>.ics
```

- `<FREQ>` ist `2w` für 2‑wöchig oder `4w` für 4‑wöchig.

Beispiele:
- Entsorgungskalender_Pfullingen_IVa_2025_2w.ics  (2‑wöchiger Restmüll)
- Entsorgungskalender_Pfullingen_IVa_2025_4w.ics  (4‑wöchiger Restmüll)

## 🎨 Kalender-Generator

Zusätzlich zur Straßensuche gibt es einen **interaktiven Kalender-Generator** unter `generator.html`, mit dem du:

- ✨ Eigene Kalender von Grund auf erstellen kannst
- 📋 Mehrere Kategorien verwalten kannst (z.B. Restmüll, Gelber Sack, Papier)
- 🔄 Wiederholende Termine definieren kannst (wöchentlich, 2-wöchig, 4-wöchig, etc.)
- 📅 Sondertermine hinzufügen kannst (z.B. für verschobene Abholungen an Feiertagen)
- 💾 Kalender als .ics exportieren und importieren kannst
- 🔁 Automatisch Termine berechnen lässt

**Live-Demo**: https://pwhty.github.io/entsorgungskalender_pfullingen/generator.html

### Features des Generators
- **Modern & Responsive**: Modernes UI mit Tailwind CSS
- **LocalStorage**: Daten bleiben im Browser gespeichert
- **Duplizieren**: Kalender als Vorlage kopieren
- **Sondertermine mit Ersetzung**: Feiertags-Verschiebungen automatisch handhaben
- **Export/Import**: JSON-Export für Backup und Weitergabe

### Lokales Testen
```bash
# Python 3
python3 -m http.server 8000

# Dann im Browser öffnen:
# http://localhost:8000/index.html
# http://localhost:8000/generator.html
```

## 🗂️ Projektstruktur
```text
/
├─ index.html        # Hauptseite: Straßensuche & Kalenderfinder
├─ app.js            # JavaScript für index.html
├─ generator.html    # Kalender-Generator (interaktive Erstellung)
├─ generator.js      # JavaScript für generator.html
├─ lookup.json       # Straße → Bezirk Mapping
├─ kalender/         # Verzeichnis mit .ics-Dateien
├─ LICENSE
└─ README.md
```

### Technologie-Stack
- **Frontend**: Vanilla JavaScript + Tailwind CSS (via CDN)
- **Datenhaltung**: LocalStorage (Generator), JSON
- **Kalenderformat**: iCalendar (.ics)
- **Hosting**: GitHub Pages

## 🚫 Haftungsausschluss

Die Nutzung erfolgt **auf eigene Verantwortung**.
Für verpasste oder falsch angezeigte Abholtermine wird keine Haftung übernommen.

## 📄 Lizenz

Dieses Projekt steht unter einer freien Lizenz (s. LICENSE).
Die Kalenderdateien dürfen **privat genutzt und weitergegeben**, jedoch **nicht als offizielle Quelle ausgegeben** werden.