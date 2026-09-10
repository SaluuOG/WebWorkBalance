import assert from "node:assert/strict";
import test from "node:test";
import {
  assessExpressReadiness,
  assessFingerprintOriginality,
  compareDesignFingerprints,
  createDesignFingerprint,
  generateDistinctMasterPrompt,
  generateMasterPrompt,
  normalizeMasterPromptSettings,
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

test("creates a timeboxed express build brief with a focused high-end scope", () => {
  const result = generateMasterPrompt({
    business: business({ website: "https://atelier.example", websiteStatus: "exists", phone: "+49 911 123456", email: "hallo@atelier.example" }),
    prices,
    settings: { productionTrack: "express", expressTimebox: "120" },
  });
  assert.equal(result.settings.productionTrack, "express");
  assert.equal(result.settings.expressTimebox, "120");
  assert.match(result.prompt, /# WebWorkBalance Express Build · 2 Stunden/);
  assert.match(result.prompt, /Zeitbox: 120 Minuten/);
  assert.match(result.prompt, /Keine drei Konzepte ausarbeiten/);
  assert.match(result.prompt, /Build ausführen/);
  assert.match(result.prompt, /offene Platzhalter/);
  assert.ok(result.prompt.length > 4_000);
  assert.ok(result.prompt.length < 15_000);
  assert.ok(result.warnings.some((warning) => warning.includes("Express-Zeitbox")));
});

test("scores express readiness from missing facts and verified research", () => {
  const sparse = generateMasterPrompt({ business: business(), prices, settings: { productionTrack: "express" } });
  const ready = generateMasterPrompt({
    business: business({ website: "https://atelier.example", websiteStatus: "exists", phone: "+49 911 123456", email: "hallo@atelier.example", openingHours: "Mo–Fr 09:00–17:00", imageUrl: "https://images.example/atelier.jpg" }),
    prices,
    settings: { productionTrack: "express" },
    research: { services: ["Architekturplanung"], targetAudiences: ["Bauherren"], differentiators: ["Persönliche Projektbegleitung"], contactPerson: "Alex Nord" },
  });
  const sparseScore = assessExpressReadiness(sparse, sparse);
  const readyScore = assessExpressReadiness(ready, ready);
  assert.ok(sparseScore.score < readyScore.score);
  assert.ok(["Mit Platzhaltern", "Vorbereitung nötig"].includes(sparseScore.label));
  assert.equal(readyScore.label, "Express-bereit");
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

test("translates the reference studies into an original company-specific creative blueprint", () => {
  const result = generateMasterPrompt({ business: business(), prices });
  assert.equal(result.creativeBlueprint.referenceStudyCount, 21);
  assert.ok(result.creativeBlueprint.techniques.length >= 4);
  assert.match(result.creativeBlueprint.visualMetaphor, /(Linie|Blick|Grundriss)/);
  assert.match(result.prompt, /## Kreativ-DNA DNA-/);
  assert.match(result.prompt, /### Gewählte Kreativtechniken/);
  assert.match(result.prompt, /Mobile-Fallback/);
  assert.match(result.prompt, /Keine Referenzseite/);
  assert.doesNotMatch(result.prompt, /\bORO\b|Claude/);
});

test("keeps the reference DNA realistic for a small, motion-free website", () => {
  const result = generateMasterPrompt({
    business: business({ name: "Praxis am Park", category: "Zahnarztpraxis", categoryKey: "health" }),
    prices,
    settings: { complexity: "simple", animation: "none", scrollMotion: "off", spatialEffects: "off", technology: "standard", budget: "small", mobilePriority: "speed" },
  });
  assert.equal(result.creativeBlueprint.techniques.length, 3);
  assert.ok(result.creativeBlueprint.techniques.every((item) => !["volumetric-particle-morph", "spatial-world-portals"].includes(item.id)));
  assert.match(result.creativeBlueprint.signatureMoment, /statische visuelle Klammer/);
  assert.match(result.creativeBlueprint.technicalDirection, /semantisches HTML/);
});

test("mutates the reference DNA when a creative alternative is requested", () => {
  const first = generateMasterPrompt({ business: business(), prices, variant: 0 });
  const second = generateMasterPrompt({ business: business(), prices, variant: 1 });
  assert.notEqual(first.creativeBlueprint.id, second.creativeBlueprint.id);
  assert.notDeepEqual(first.creativeBlueprint.techniques.map((item) => item.id), second.creativeBlueprint.techniques.map((item) => item.id));
});

test("supports high-end manual creative controls and emits a production-grade build brief", () => {
  const result = generateMasterPrompt({
    business: business(),
    prices,
    settings: {
      experienceArchetype: "spatial",
      storyStructure: "journey",
      interactionDensity: "rich",
      typographyMotion: "kinetic",
      assetDirection: "three-dimensional",
      brandTone: "future-forward",
    },
  });
  assert.equal(result.settings.experienceArchetype, "spatial");
  assert.equal(result.settings.storyStructure, "journey");
  assert.equal(result.settings.assetDirection, "three-dimensional");
  assert.ok(result.prompt.length > 12_000);
  assert.match(result.prompt, /## High-End-Produktions- und Build-Spezifikation/);
  assert.match(result.prompt, /Komponentenverträge/);
  assert.match(result.prompt, /LCP-Ziel unter 2,5 s/);
  assert.match(result.prompt, /Manuelle Kreativsteuerung/);
});

test("fills new controls when an older saved prompt has no reference DNA settings", () => {
  const normalized = normalizeMasterPromptSettings(business(), { animation: "subtle", customInstructions: "  Nur echte Bilder.  " });
  assert.equal(normalized.animation, "subtle");
  assert.equal(normalized.customInstructions, "Nur echte Bilder.");
  assert.equal(normalized.experienceArchetype, "automatic");
  assert.equal(normalized.storyStructure, "automatic");
  assert.equal(normalized.assetDirection, "hybrid");
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
