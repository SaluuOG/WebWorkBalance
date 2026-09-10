import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeWebsiteDocument,
  normalizeOfficialWebsiteUrl,
  quickAuditFromWebsiteReport,
  websiteHostSafety,
  websiteResearchBrief,
} from "../lib/website-quality.ts";

const business = {
  name: "Müller Elektrotechnik GmbH",
  address: "Königstraße 12, 90402 Nürnberg",
  phone: "+49 911 1234567",
  email: "info@mueller-elektrotechnik.de",
  source: "OpenStreetMap",
  sourceUrl: "https://www.openstreetmap.org/node/12345",
  website: "https://mueller-elektrotechnik.de",
};

const officialHtml = `<!doctype html>
<html lang="de">
<head>
  <title>Müller Elektrotechnik Nürnberg | Planung und Installation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Müller Elektrotechnik plant und installiert sichere Elektrotechnik für Unternehmen und Privatkunden in Nürnberg und der Region.">
  <meta name="theme-color" content="#16324f">
  <meta property="og:image" content="/assets/werkstatt-hero.jpg">
  <link rel="canonical" href="https://mueller-elektrotechnik.de/">
  <style>@media (max-width: 700px) { .grid { width: 100%; } } .brand { color: #f4b942; }</style>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Müller Elektrotechnik GmbH","telephone":"+499111234567"}</script>
</head>
<body>
  <a href="#main">Direkt zum Inhalt</a>
  <header><nav><a href="/leistungen">Leistungen</a><a href="/team">Über uns</a><a href="/kontakt">Kontakt</a></nav></header>
  <main id="main">
    <h1>Müller Elektrotechnik in Nürnberg</h1>
    <p>Seit vielen Jahren begleiten wir private und gewerbliche Projekte von der Beratung bis zur fachgerechten Umsetzung. Unser Team plant verständlich, arbeitet zuverlässig und dokumentiert jeden Schritt.</p>
    <h2>Unsere Leistungen für sichere Gebäude</h2>
    <p>Elektroinstallation, Beleuchtung, Netzwerktechnik, Smart Home, Wartung und persönliche Beratung. Fordern Sie jetzt ein Angebot an und besprechen Sie Ihr Projekt mit unserem Team.</p>
    <h2>Referenzen und Kundenstimmen</h2>
    <p>Ausgewählte Projekte zeigen unsere Arbeitsweise, Materialqualität und saubere Ausführung. Kontaktieren Sie uns für weitere Informationen und eine individuelle Anfrage.</p>
    <img src="/assets/logo.svg" width="180" height="100" alt="Logo Müller Elektrotechnik">
    <img src="/assets/team.jpg" width="1200" height="800" loading="lazy" alt="Team von Müller Elektrotechnik">
    <form><label for="mail">E-Mail</label><input id="mail" type="email"><button>Angebot anfragen</button></form>
  </main>
  <footer>
    <a href="tel:+499111234567">0911 1234567</a><a href="mailto:info@mueller-elektrotechnik.de">E-Mail</a>
    <a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a>
    <a href="https://instagram.com/mueller-elektrotechnik">Instagram</a>
  </footer>
</body>
</html>`;

test("normalizes domains and rejects directories as official company websites", () => {
  assert.equal(normalizeOfficialWebsiteUrl("mueller-elektrotechnik.de")?.toString(), "https://mueller-elektrotechnik.de/");
  assert.equal(websiteHostSafety(new URL("https://mueller-elektrotechnik.de")).safe, true);
  assert.equal(websiteHostSafety(new URL("https://instagram.com/mueller-elektrotechnik")).safe, false);
  assert.equal(websiteHostSafety(new URL("http://127.0.0.1/admin")).safe, false);
});

test("verifies an official business website before creating a quality report", () => {
  const analysis = analyzeWebsiteDocument({
    business,
    requestedUrl: business.website,
    finalUrl: "https://mueller-elektrotechnik.de/",
    html: officialHtml,
    responseMs: 620,
    status: 200,
    headers: { cacheControl: "public, max-age=300", contentType: "text/html; charset=utf-8" },
  });

  assert.equal(analysis.verification.verified, true);
  assert.ok(analysis.verification.confidence >= 70);
  assert.ok(analysis.report);
  assert.equal(analysis.report.categories.length, 8);
  assert.ok(analysis.report.overallScore >= 60);
  assert.equal(analysis.report.research.images.length, 3);
  assert.ok(analysis.report.research.importantPages.some((page) => page.type === "legal"));
  assert.ok(analysis.report.research.socialLinks.some((url) => url.includes("instagram.com")));
  assert.ok(analysis.report.research.brandColors.includes("#16324f"));
});

test("withholds the score when a website cannot be linked to the company", () => {
  const analysis = analyzeWebsiteDocument({
    business: { ...business, source: "Manuell", sourceUrl: "", phone: null, email: null },
    requestedUrl: "https://random-domain.de/",
    finalUrl: "https://random-domain.de/",
    html: "<!doctype html><html><head><title>Willkommen</title></head><body><h1>Eine andere Seite</h1></body></html>",
    responseMs: 300,
    status: 200,
  });

  assert.equal(analysis.verification.verified, false);
  assert.equal(analysis.report, null);
  assert.match(analysis.verification.reason, /kein Qualitäts-Score/);
});

test("translates the automatic report into the existing editable quick audit", () => {
  const { report } = analyzeWebsiteDocument({
    business,
    requestedUrl: business.website,
    finalUrl: business.website,
    html: officialHtml,
    responseMs: 620,
    status: 200,
  });
  assert.ok(report);
  const audit = quickAuditFromWebsiteReport(report, { checks: { mobile: "open", speed: "open", cta: "open", seo: "open", trust: "open", content: "open", legal: "open" }, notes: "Eigene Beobachtung", updatedAt: null });
  assert.match(audit.notes, /Eigene Beobachtung/);
  assert.match(audit.notes, /Automatischer Website-Scan/);
  assert.equal(audit.updatedAt, report.scannedAt);
  assert.ok(Object.values(audit.checks).every((value) => value === "good" || value === "issue"));
  assert.match(websiteResearchBrief({ name: business.name, category: "Elektrotechnik", address: business.address }, report), /RECHERCHE-DOSSIER/);
});
