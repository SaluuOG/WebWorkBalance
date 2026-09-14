# WebWorkBalance — Masterprompt-Qualitätsstandard

Stand: 14. September 2026. Engine-Kennung: `wwb-motion-3`.

## Was dauerhaft hinterlegt ist

Die vorhandenen 27 Gestaltungsmethoden bleiben in `lib/masterprompt-engine.ts` erhalten. Sieben neue, tatsächlich lokal gesichtete MP4-Dateien ergänzen eigene Stilwelten: technisches Fashion-Dossier, surreale Kapitelreise, monumentaler Hero, Villa-Editorial, Fahrzeug-Showroom, Sorten-Inszenierung und Campaign-Commerce. Die beobachteten Sequenzen und Zeitbereiche stehen in `video-studies-2026-09-14.md` und in der zugehörigen JSON-Datei. Die Originalvideos werden nicht im öffentlichen Repository weitergegeben.

Die früher hinterlegten Referenzprinzipien wurden übernommen. Ältere Originalvideos lagen bei dieser Überarbeitung nicht erneut vor; eine lückenlose neue Einzelanalyse aller früher gesendeten Clips wird daher nicht behauptet. Beobachtete Bildwirkung belegt weder den ursprünglichen Software-Stack noch WebGL, Mobilverhalten oder ein funktionierendes Backend. Wo daraus technische Verfahren abgeleitet werden, sind sie Umsetzungsvorschläge.

## Individuelle Firmenkonzepte

Firmenkennung, Branche, echte Leistungen, Zielgruppen, Besonderheiten, Beschreibung, Recherche und manuelle Einstellungen beeinflussen die kreative Auswahl. Reine Recherche-Statusmeldungen werden nicht als Unternehmensinhalt verwendet. Hero, Bildführung, Typografie, Komposition, Rhythmus und Seitenfolge werden für den Stilvergleich getrennt betrachtet; allein ein anderer Firmenname zählt nicht als neue Gestaltung.

Die App lädt bis zu 120 zuletzt registrierte Entwürfe und 80 gespeicherte Prompts zum Vergleich. Die Alternativensuche prüft bis zu 64 Varianten und zielt auf mindestens drei unterschiedliche Gestaltungsdimensionen. Falls der Abstand mit den gewählten Einschränkungen nicht erreicht wird, erscheint ein Hinweis. Der angezeigte Konzept-Abstand ist eine Heuristik der Briefings und keine Messung der Qualität oder Ähnlichkeit fertig gebauter Websites.

Die D1-Tabelle `design_memory` reserviert eine Stil-Kombination atomar für eine Firma. Andere Firmen bekommen beim gleichen Stil einen Konflikt und sollen eine Alternative erzeugen. Sowohl die Registrierung als auch das Speichern eines Prompts prüfen die Reservierung. Bei fehlender Verbindung wird ein lokales Briefing weiter ermöglicht, aber kein erfolgreicher Teamvergleich vorgetäuscht. Sehr alte, nie registrierte historische Prompts außerhalb des geladenen Vergleichsfensters sind nicht vollständig erfasst.

## Verbindliche Produktionsvorgaben

Jede ausgewählte Methode erhält einen Szenenvertrag mit Kennung, Firmenbezug, Auslöser, Start-/Endzuständen, Timing, benötigten Medien, Mobilvariante, Reduced-Motion-Verhalten und prüfbaren Abnahmekriterien. Diese Verträge stehen auch im Express-Prompt. 3D-Szenen benennen Geometrie bzw. Modellbedarf, Kamera, Licht, Ressourcen, Pixelratio, Poster und Aufräumen beim Verlassen. Echte Nutzerentscheidungen wie Variantenwechsel werden durch Eingaben ausgelöst, nicht versehentlich durch Scrollen.

Die Regler wirken auf die Verträge: ausgeschaltete Bewegung ergibt statische Inszenierungen, ausgeschaltetes 3D erzeugt keine verpflichtende WebGL-Szene, ruhige Typografie bleibt ruhig. Kleine Budgets, einfache Komplexität oder Standardtechnik begrenzen räumliche Effekte. Express-Zeitboxen sind Planungshilfen; umfangreiche Pflichtszenen müssen ausdrücklich als noch offen ausgewiesen werden, wenn sie nicht in die Zeit passen.

Der Szenenplan ist ein Auftrag an die ausführende Entwicklung bzw. KI. Die App kontrolliert nicht automatisch den später extern generierten Quellcode und garantiert keine pixelgenaue Nachbildung der Videos. Fertige Seiten müssen gegen die Szenenverträge geprüft werden; fehlende Effekte dürfen nicht als fertig gelten. Aus Referenzen werden eigenständige Firmenkonzepte entwickelt, keine identischen Markenauftritte kopiert.

## Optionale Website-Spiele

Standardmäßig ist das Spiel ausgeschaltet. Die Auswahl bietet automatische Eignung, Quiz, Memory und Challenge. Aktivierung ergänzt einen firmenspezifischen `CompanyMiniGame`-Vertrag mit Inhalt, Regeln, Zuständen, Feedback, Abschluss, Neustart und Tastatur-/Touch-Bedienung. Dies beauftragt ein Spiel auf der zu erstellenden Kundenwebsite; es startet kein Spiel in WebWorkBalance und stellt kein ungefragtes Tracking oder Backend bereit.

## Qualität und technische Referenzen

- Echte Firmenfakten und belegte Aussagen verwenden; fehlende Informationen als offen markieren.
- Medien müssen zur Firma passen. Suchtreffer sind keine automatisch verifizierten Firmenbilder; Nutzungsrechte prüfen.
- Unterschiedliche Seitenfolgen, Bildgrößen und Lesepausen statt wiederholter identischer Kartenreihen.
- Die zentrale Handlung bleibt trotz inszenierter Übergänge erreichbar.
- Mobilbedienung, reduzierte Bewegung und statische Ersatzdarstellungen sind Bestandteil jedes passenden Vertrags.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/): responsive Animationen, Reduced Motion und Cleanup.
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): Rendergröße, Pixelratio und Ressourcenverwaltung.
- [Three.js Material.dispose](https://threejs.org/docs/pages/Material.html#dispose): nicht mehr benötigte Materialien freigeben.
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): Betriebssystempräferenz berücksichtigen.
