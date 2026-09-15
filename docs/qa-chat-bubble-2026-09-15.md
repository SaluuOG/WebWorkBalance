# Chat-Bubble: Prüfung am 15. September 2026

Die schwebende Chat-Bubble nutzt dieselben Nachrichten und API-Aktionen wie der Team-Bereich. Die bestehende Aktualisierung im Abstand von etwa 4,5 Sekunden bleibt erhalten. Gelesen-Markierungen gelten pro Nutzer auf diesem Gerät; sie sind keine Lesebestätigung für andere Teammitglieder.

## Im lokalen Browser geprüft

- Öffnen fokussiert die Überschrift statt des Texteingabefelds.
- Ein ungesendeter Entwurf bleibt beim Schließen und erneuten Öffnen erhalten.
- Ein fehlgeschlagener Sendeversuch zeigt den vorhandenen Fehlerhinweis und behält den Entwurf.
- Erfolgreiches Senden leert die Eingabe und zeigt die Nachricht im Verlauf.
- Eine lokal simulierte Nachricht eines anderen Mitglieds erzeugt die Ungelesen-Anzeige. Öffnen des Chats entfernt sie nach Anzeige der Nachrichten.
- Der Team-Chat zeigt denselben Verlauf wie die Bubble.
- Bei 375 × 812 Pixeln passen Dialog und Eingabe in die schmale Ansicht; die Bubble überlappt die untere Navigation nicht. Das mobile Schnellmenü öffnet ohne Eingabefokus und navigiert zur Preisliste.
- Im Masterprompt Studio erzeugen „Cinematic & 3D“, „Surreale Kapitelreise“ und „Motiv-Memory“ einen geänderten Firmenprompt mit Szenenverträgen, WebGL-Vorgaben und `CompanyMiniGame`.

Alle Testnachrichten und Demo-Konzepte entstanden ausschließlich in der lokalen Vorschau-Datenbank. Die temporäre Ansicht zur Prüfung schmaler Bildschirmbreiten ist nicht Teil der Veröffentlichung.

## Grenzen

Die schmale Browseransicht ersetzt keinen Test der installierten PWA auf einem echten iPhone oder Android-Gerät. Die Bildschirmtastatur wurde nicht auf einem physischen Gerät geprüft. Externe OSM- und Bildquellen waren aus der Testumgebung nicht erreichbar; ihre tatsächliche Verfügbarkeit ist damit nicht bestätigt. Der Stand der älteren Videoreferenzen ist in `references/masterprompt-quality-standard.md` dokumentiert.
