import assert from "node:assert/strict";
import test from "node:test";
import { commonsImageCandidate, createExpressResearchResult, expressResearchLinks, mergeWebsiteResearchDossiers } from "../lib/express-research.ts";

const business = { name: "Atelier Nord", category: "Architekturbüro", address: "Nürnberg" };
const dossier = (overrides = {}) => ({
  pageTitle: "Atelier Nord", description: "Architektur mit Haltung", headings: ["Leistungen"],
  serviceHints: ["Planung"], contactHints: ["Telefon"], socialLinks: [],
  importantPages: [{ label: "Projekte", url: "https://atelier.example/projekte", type: "gallery" }],
  images: [{ url: "https://atelier.example/hero.jpg", sourceUrl: "https://atelier.example", alt: "Architekturprojekt", kind: "content", rightsNote: "Rechte prüfen" }],
  brandColors: ["#111111"], technologyHints: ["Next.js"], ...overrides,
});
test("creates safe manual Maps and web research links", () => {
  const result = expressResearchLinks(business);
  assert.match(result.mapUrl, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1/);
  assert.ok(result.links.some((link) => link.label === "Freie Bilder"));
  assert.ok(result.links.every((link) => link.url.startsWith("https://")));
});
test("normalizes Commons metadata with attribution and license", () => {
  const image = commonsImageCandidate({ pageid: 42, title: "File:City.jpg", imageinfo: [{ thumburl: "https://upload.wikimedia.org/thumb.jpg", descriptionurl: "https://commons.wikimedia.org/wiki/File:City.jpg", extmetadata: { Artist: { value: "<b>Jane Doe</b>" }, LicenseShortName: { value: "CC BY-SA 4.0" }, ImageDescription: { value: "City view" } } }] });
  assert.equal(image?.artist, "Jane Doe");
  assert.equal(image?.license, "CC BY-SA 4.0");
  assert.equal(image?.usageStatus, "open-license-candidate");
});
test("merges official pages without duplicate navigation or assets", () => {
  const merged = mergeWebsiteResearchDossiers([
    { url: "https://atelier.example", title: "Home", description: null, dossier: dossier() },
    { url: "https://atelier.example/about", title: "About", description: null, dossier: dossier({ serviceHints: ["Planung", "Bauleitung"] }) },
  ]);
  assert.deepEqual(merged.serviceHints, ["Planung", "Bauleitung"]);
  assert.equal(merged.importantPages.length, 1);
  assert.equal(merged.images.length, 1);
});
test("builds a copy-ready rights-aware research dossier for prompts", () => {
  const result = createExpressResearchResult({ business, depth: "deep", officialUrl: "https://atelier.example", pages: [{ url: "https://atelier.example", title: "Atelier Nord", description: "Architektur", dossier: dossier() }] });
  assert.equal(result.metrics.officialPages, 1);
  assert.ok(result.promptResearch.evidence?.length);
  assert.match(result.dossier, /Google-Maps-Fotos/);
  assert.match(result.dossier, /BILDKANDIDATEN UND RECHTE/);
});
