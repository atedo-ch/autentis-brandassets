# IT-Risiko-Check Tool

Interaktives Diagnose-Tool für IT-Sicherheit bei Umbauten im laufenden Betrieb.

## Überblick

Das Tool ermöglicht Bauleitern und Projektverantwortlichen eine strukturierte Selbstdiagnose von Risiken für aktive ICT-Systeme während Baumassnahmen.

## Struktur

### Dateien

- `index.html` - Hauptseite mit HTML-Struktur
- `app.js` - Vollständige Anwendungslogik
- `styles.css` - Styling und mobile Responsiveness
- `questions.json` - Fragenkatalog mit 18 Fragen in 5 Sektionen

### Funktionsweise

1. **Fragenfluss**: 18 binäre Ja/Nein-Fragen in 5 Sektionen
   - Thermik & Lüftung (4 Fragen)
   - Physische Barrieren & Staubarten (3 Fragen)
   - Etagenverteiler & dezentrale Technik (4 Fragen)
   - ESD & Reinigung (3 Fragen)
   - Notfall & Dokumentation (4 Fragen)

2. **Scoring-Logik**:
   - Jede "Nein"-Antwort = 1 Risikopunkt
   - Jede "Ja"-Antwort = 0 Risikopunkte
   - Keine Gewichtung

3. **Ampel-System**:
   - 0-2 Nein-Antworten → GRÜN (Geringes Risiko)
   - 3-5 Nein-Antworten → GELB (Erhöhtes Risiko)
   - 6+ Nein-Antworten → ROT (Hohes Risiko)

4. **User Flow**:
   - Start → Fragen → Ergebnis → Lead-Form → Success Page
   - Lineare Navigation ohne Rücksprung
   - Fortschrittsanzeige während Fragenfluss

## Technische Features

- Mobile-optimiert (responsive Design)
- Kein Framework-Abhängigkeiten (Vanilla JavaScript)
- Client-seitige Zustandsverwaltung
- Deterministisches Scoring
- Kontextualisierte Lead-Abfrage basierend auf Ampel-Status

## Deployment

Das Tool ist vollständig client-seitig und kann auf jedem Webserver gehostet werden.

### Voraussetzungen

- Webserver mit statischem Hosting
- Alle 4 Dateien im selben Verzeichnis:
  - index.html
  - app.js
  - styles.css
  - questions.json

### Lokales Testen

```bash
# Mit Python 3
python -m http.server 8000

# Mit PHP
php -S localhost:8000

# Mit Node.js (http-server)
npx http-server
```

Dann Browser öffnen: `http://localhost:8000`

## Backend-Integration

Die aktuelle Implementierung ist client-seitig. Für Produktivbetrieb:

1. **Lead-Daten senden**: `handleLeadSubmit()` in app.js:271
   - Aktuell: Console-Log
   - Produktiv: POST zu Backend-API

2. **Foto-Upload**: `handlePhotoUpload()` in app.js:289
   - Aktuell: Console-Log
   - Produktiv: Multipart-Upload zu Backend-API

## Anpassungen

### Fragen ändern

Bearbeiten Sie `questions.json`:
- Fragen hinzufügen/entfernen in den Sektionen
- Scoring-Schwellenwerte ändern (nicht empfohlen gemäss Spezifikation)
- Info-Texte anpassen

### Styling ändern

Bearbeiten Sie `styles.css`:
- Farben
- Schriftarten
- Layout
- Responsive Breakpoints

### Logik ändern

Bearbeiten Sie `app.js`:
- Scoring-Algorithmus (Achtung: Spec erfordert deterministisches Scoring)
- Screen-Flows
- Validierung

## Validierung

Die Implementierung erfüllt alle Spezifikations-Anforderungen:

- ✓ Kein Formular vor Diagnose
- ✓ Lineare Nutzerführung
- ✓ Nur Ja/Nein-Antworten
- ✓ Deterministisches Scoring (Nein = +1 Punkt)
- ✓ Fix definierte Ampel-Schwellenwerte
- ✓ Ergebnis vor Lead-Abfrage
- ✓ Kontextualisierte Lead-Abfrage
- ✓ Success Page mit Eskalationsoptionen
- ✓ Mobile-fähig
- ✓ Fortschrittsanzeige
- ✓ Kein Zurückspringen
- ✓ Info-Icons für Fachbegriffe
- ✓ Sachliche, haftungsbewusste Sprache

## Support

Für technische Fragen oder Anpassungen kontaktieren Sie das Entwicklungsteam.
