# WebWorkBalance

![WebWorkBalance App-Icon](public/wwb-icon-v10-192.png)

**WebWorkBalance** ist die private Lead-, Recherche- und Produktionszentrale von Salu & Sula für professionelles Webdesign. Die App verbindet lokale Firmensuche, Lead-Pipeline, Team-Abstimmung, Website-Qualitätsprüfung und individuelle High-End-Masterprompts in einem mobilen Workflow.

Live-App: [webworkbalance.jj6ng7vwzq.chatgpt.site](https://webworkbalance.jj6ng7vwzq.chatgpt.site)

## Wichtigste Funktionen

- Live-Radar für Firmen aus OpenStreetMap mit Radius, Branchenfiltern und Passport-Modus
- Drei freie Overpass-Anbieter mit schnellem Failover, kleinen Suchfeldern sowie Team- und Gerätecache
- Regional-Liste für Nürnberg, Fürth, Erlangen, Schwabach und umliegende Landkreise
- Tinder-artiger Entscheidungsstapel mit Lead-Score, Priorisierung und Rückgängig-Funktion
- Lead-Pipeline mit Status, Wiedervorlage, Aufgaben, Aktivitäten, CSV-Export und Zuständigkeiten
- Verifizierter Scanner für offizielle Firmenwebsites mit Qualitätswert, Befunden und Handlungsempfehlungen
- Recherche-Kompass für Firma, Ansprechpartner, Markt, Wettbewerb, Bewertungen, Bilder und Bildrechte
- Express-Recherchelauf mit offizieller Website, wichtigen Unterseiten und Wikimedia-Commons-Material
- Individuelles MasterPrompt-Studio mit Branchenlogik, Creative DNA, Bildregie, Animationen und Produktionsplan
- Express-Build-Modus für fokussierte High-End-Websites in einer festen Zeitbox
- Manuelle Regler für Komplexität, Animation, Scroll-Erlebnis, 3D, Bildstrategie, Tonalität und weitere Parameter
- Sieben zusätzliche Video-Stilwelten mit eigenen Seitenfolgen und dokumentierter Referenzanalyse
- Verbindliche Szenenpläne mit Triggern, Timelines, Asset-Bedarf, Mobilvarianten und Abnahmekriterien in Master- und Express-Prompts
- Gemeinsames Designgedächtnis, das Firmenentwürfe anhand ihres Aufbaus vergleicht und identische Stil-Kombinationen für andere Firmen sperrt
- Optionales individuelles Website-Spiel als Quiz, Memory oder kleine Challenge im Produktionsprompt
- Professionelle Erstkontakt-Vorlagen für Telefon, E-Mail und WhatsApp mit WWB-Team-Abschluss
- Team-Pinnwand, Start-Hinweis für ungelesene Notizen, separater Live-Chat und Arbeitsboard
- Schwebende Chat-Bubble mit ungelesenen Nachrichten, direktem Schreiben und erhaltenem Entwurf beim Schließen
- Preisliste, Angebotskalkulator, Tagescockpit, Schnellmenü und installierbare mobile PWA

## Radar-Ausfallschutz

Der Radar nutzt ausschließlich öffentliche OpenStreetMap-Daten. Er prüft zuerst den gemeinsamen D1-Teamcache und startet danach einen zeitlich begrenzten Anbieter-Wettlauf zwischen:

- `overpass.private.coffee`
- `maps.mail.ru`
- `overpass-api.de`

Wenn der Server keine Verbindung erhält, übernimmt der Browser-Direktmodus. Als letzte Stufe bleiben ältere Cache-Ergebnisse oder echte, bereits im Team gespeicherte OSM-Leads verfügbar. Öffentliche Overpass-Instanzen geben keine Verfügbarkeitsgarantie; ein späterer Geoapify-Schlüssel kann als optionaler Anbieter ergänzt werden.

## Masterprompt-Qualitätsstandard

Im Firmenprofil das MasterPrompt-Studio öffnen, die recherchierten Fakten prüfen und unter **Kreative Richtung** eine Referenz-Stilwelt wählen. **Bewegung & Erlebnis** steuert Animationen, Scroll und 3D; unter **Bilder & Umsetzung** lässt sich ein Website-Spiel aktivieren. Die Presets **Cinematic & 3D** und **Editorial & Motion** setzen zusammenpassende Produktionsregler. Anschließend die Einstellungen anwenden und den Abschnitt **Seitenaufbau & verbindlicher Szenenplan** prüfen. Mit einer kreativen Alternative lässt sich eine andere Richtung erzeugen; der Text bleibt manuell bearbeitbar und im Lead speicherbar.

Die Engine baut auf 27 vorhandenen Gestaltungsmethoden auf und ergänzt sieben jetzt visuell analysierte Videoreferenzen. Beobachtungen, vorgeschlagene Umsetzung und Grenzen sind in [den Videostudien](docs/references/video-studies-2026-09-14.md) getrennt dokumentiert. Den [Qualitätsstandard und die Funktionsgrenzen](docs/references/masterprompt-quality-standard.md) beschreibt die ergänzende Dokumentation. Die Videos wurden nicht zum Training eines Modells verwendet; ihre analysierten Prinzipien liegen versioniert im Quellcode und in den Referenznotizen.

## Technik

- React 19, TypeScript und Next.js-kompatible App-Struktur
- Vinext/Vite auf Cloudflare Workers
- Cloudflare D1 mit Drizzle ORM für Teamdaten
- Tailwind CSS 4 und barrierearme UI-Primitives
- PWA-Metadaten, Safe-Area-Unterstützung und stabile mobile Viewports
- Serverseitige URL-/SSRF-Prüfung für offizielle Website-Scans
- Größen- und Zeitlimits für externe Rechercheantworten

## Lokal starten

Voraussetzungen: Node.js `>=22.13.0`, npm und Linux.

```bash
npm ci
npm run dev
```

Die lokale Vorschau läuft anschließend über die von Vite ausgegebene Adresse. Für persistente Teamdaten muss die in `.openai/hosting.json` deklarierte D1-Bindung `DB` verfügbar sein.

## Qualität prüfen

```bash
npx tsc --noEmit --incremental false
npm run lint
npm test
```

`npm test` erstellt zuerst den Produktions-Build und führt danach die automatisierten Funktions-, Sicherheits-, PWA-, Radar-, Team- und MasterPrompt-Tests aus.

## Daten und Verantwortung

- Ein fehlender Website-Link in OpenStreetMap ist ein Recherchehinweis, kein Beweis dafür, dass keine Website existiert.
- Vor einer Ansprache müssen Betrieb, Kontaktdaten und offizielle Domain manuell bestätigt werden.
- Bilder dürfen nur mit geklärten Nutzungsrechten verwendet werden; die App kennzeichnet Suchtreffer entsprechend.
- Kartendaten: © OpenStreetMap-Mitwirkende, ODbL.

## Branding

WebWorkBalance - made by Salu & Sula.
