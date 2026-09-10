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
- Professionelle Erstkontakt-Vorlagen für Telefon, E-Mail und WhatsApp mit WWB-Team-Abschluss
- Team-Pinnwand, Start-Hinweis für ungelesene Notizen, separater Live-Chat und Arbeitsboard
- Preisliste, Angebotskalkulator, Tagescockpit, Schnellmenü und installierbare mobile PWA

## Radar-Ausfallschutz

Der Radar nutzt ausschließlich öffentliche OpenStreetMap-Daten. Er prüft zuerst den gemeinsamen D1-Teamcache und startet danach einen zeitlich begrenzten Anbieter-Wettlauf zwischen:

- `overpass.private.coffee`
- `maps.mail.ru`
- `overpass-api.de`

Wenn der Server keine Verbindung erhält, übernimmt der Browser-Direktmodus. Als letzte Stufe bleiben ältere Cache-Ergebnisse oder echte, bereits im Team gespeicherte OSM-Leads verfügbar. Öffentliche Overpass-Instanzen geben keine Verfügbarkeitsgarantie; ein späterer Geoapify-Schlüssel kann als optionaler Anbieter ergänzt werden.

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
