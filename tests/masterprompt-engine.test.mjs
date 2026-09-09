import assert from "node:assert/strict";
import test from "node:test";
import {
  assessFingerprintOriginality,
  compareDesignFingerprints,
  createDesignFingerprint,
  generateDistinctMasterPrompt,
  generateMasterPrompt,
  recommendMasterPromptMode,
  recommendMasterPromptSettings,
} from "../lib/masterprompt-engine.ts";

const prices = { landing: 1900, business: 3900, premium: 6900, shop: 9900, portal: 14900, webapp: 24900, hourly: 110, maintenance: 199 };

function business(overrides = {}) {
  return {
    id: "osm-100", sourceId: "node-100", source: "OpenStreetMap", sourceUrl: "https://www.openstreetmap.org/node/100",
    name: "Atelier Nord Architektur", category: "Architekturbüro", categoryKey: "professional", lat: 49.4521, lon: 11.0767,
    address: "Königstraße 1, Nürnberg", phone: null, email: null, website: null, websiteStatus: "not_found",
    openingHours: null, socialUrl: null, imageUrl: null, imageAttribution: null, distanceKm: 1.2, fetchedAt: "2026-09-09T12:00:00.000Z",
    ...overrides,
  };
}

test("chooses new build or redesign from the website status", () => {
  assert.equal(recommendMasterPromptMode(business()), "new-website");
  assert.equal(recommendMasterPromptMode(business({ website: "https://atelier.example", websiteStatus: "exists" })), "redesign");
});

test("keeps a company fingerprint stable while intentional variants differ", () => {
  const input = { business: business(), mode: "new-website", variant: 0 };
  const first = createDesignFingerprint(input);
  assert.deepEqual(first, createDesignFingerprint(input));
  assert.notEqual(first.id, createDesignFingerprint({ ...input, variant: 1 }).id);
  assert.notEqual(first.id, createDesignFingerprint({ ...input, business: business({ sourceId: "node-200", name: "Studio Süd" }) }).id);
});

test("matches animation intensity to the company and accepts manual overrides", () => {
  assert.equal(recommendMasterPromptSettings(business()).settings.animation, "cinematic");
  assert.equal(recommendMasterPromptSettings(business({ name: "Praxis am Park", category: "Zahnarztpraxis", categoryKey: "health" })).settings.animation, "subtle");
  const result = generateMasterPrompt({ business: business(), prices, settings: { animation: "none", scrollMotion: "off" } });
  assert.equal(result.settings.animation, "none");
  assert.match(result.prompt, /Bewegungsregel: keine dekorative Bewegung/);
});

test("creates all modes from real facts and marks unknown information", () => {
  for (const mode of ["new-website", "redesign", "acquisition", "complete"]) {
    const result = generateMasterPrompt({ business: business(), prices, mode, settings: { customInstructions: "Keine verspielten Farben." } });
    assert.equal(result.mode, mode);
    assert.match(result.prompt, /Atelier Nord Architektur/);
    assert.match(result.prompt, /\[TELEFON PRÜFEN\]/);
    assert.match(result.prompt, /Erfinde niemals Leistungen/);
    assert.match(result.prompt, /Keine verspielten Farben/);
    assert.ok(result.prompt.length > 3_000);
  }
});

test("builds a source-aware image plan and never presents search hits as verified company media", () => {
  const result = generateMasterPrompt({
    business: business(),
    prices,
    research: {
      evidence: [{
        label: "Treffer der Firmensuche",
        value: "Architecture reference.jpg",
        sourceLabel: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Architecture_reference.jpg",
        confidence: "unverified",
        usage: "inspiration",
        license: "CC BY-SA 4.0",
      }],
    },
  });
  assert.equal(result.imagePlan.requiredAssets.length, 4);
  assert.equal(result.imagePlan.searchQueries.length, 3);
  assert.match(result.prompt, /## Individuelles Bildkonzept/);
  assert.match(result.prompt, /unverified \| inspiration/);
  assert.match(result.prompt, /Suchtreffer-Zuordnung niemals als bestätigt/);
});

test("creates scene-by-scene motion direction with mobile and reduced-motion fallbacks", () => {
  const cinematic = generateMasterPrompt({ business: business(), prices });
  assert.equal(cinematic.motionPlan.scenes.length, 4);
  assert.match(cinematic.prompt, /## Animationsregie/);
  assert.match(cinematic.prompt, /Reduced Motion:/);
  assert.match(cinematic.prompt, /Performance-Budget:/);

  const still = generateMasterPrompt({ business: business(), prices, settings: { animation: "none", scrollMotion: "off" } });
  assert.equal(still.motionPlan.signature, "Ruhige Präzision ohne dekorative Bewegung");
  assert.match(still.motionPlan.scenes[0].choreography, /sofort anzeigen/);
});

test("measures similarity and searches for a meaningfully different creative alternative", () => {
  const first = generateMasterPrompt({ business: business(), prices, variant: 0 });
  assert.equal(compareDesignFingerprints(first.fingerprint, first.fingerprint), 1);
  assert.equal(assessFingerprintOriginality(first.fingerprint, [first.fingerprint]).score, 0);

  const distinct = generateDistinctMasterPrompt({ business: business(), prices, variant: 1 }, [first.fingerprint]);
  assert.notEqual(distinct.result.fingerprint.id, first.fingerprint.id);
  assert.ok(distinct.originality.score >= 45);
  assert.ok(distinct.originality.distinctDimensions.length >= 1);
});
