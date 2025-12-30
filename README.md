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
```text
Entsorgungskalender_Pfullingen_BEZIRK_JAHR.ics
```

**Beispiel**: Entsorgungskalender_Pfullingen_IVa_2025.ics
