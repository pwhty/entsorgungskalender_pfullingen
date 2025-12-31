TL;DR: Wer schnell an die .ics-Dateien kommen will: https://pwhty.github.io/entsorgungskalender_pfullingen/

# Entsorgungskalender Pfullingen

Diese kleine Web-App ermöglicht es, den passenden **Entsorgungskalender (ICS)** für eine Straße in Pfullingen auszuwählen und direkt herunterzuladen.

👉 Die Anwendung läuft vollständig im Browser und benötigt **keine Installation**.

---

## 🔍 Funktionsweise

1. Straße eingeben  
2. Jahr auswählen  
3. Die App ermittelt anhand einer Lookup-Tabelle den zuständigen **Bezirk**
4. Der passende **Kalender (.ics)** wird zum Download angeboten

Die Kalenderdatei kann anschließend z. B. in:
- Apple Kalender
- Google Kalender
- Outlook  
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

## Kalender-Generator

Es gibt eine zusätzliche Seite `generator.html`, mit der du eigene Kalender interaktiv erzeugen kannst (Kalender anlegen, Kategorien definieren, Sondertermine pflegen und als `.ics` herunterladen): https://pwhty.github.io/entsorgungskalender_pfullingen/generator.html

Zum lokalen Testen:
```bash
python3 -m http.server 8000
# dann http://localhost:8000/generator.html
```

## 🗂️ Projektstruktur

/
├─ index.html        # Web-Oberfläche
├─ app.js            # Logik
├─ lookup.json       # Straße → Bezirk
├─ kalender/         # .ics-Dateien
└─ README.md

## 🚫 Haftungsausschluss

Die Nutzung erfolgt **auf eigene Verantwortung**.
Für verpasste oder falsch angezeigte Abholtermine wird keine Haftung übernommen.

## 📄 Lizenz

Dieses Projekt steht unter einer freien Lizenz (s. LICENSE).
Die Kalenderdateien dürfen **privat genutzt und weitergegeben**, jedoch **nicht als offizielle Quelle ausgegeben** werden.