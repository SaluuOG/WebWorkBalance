import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_MASTER_PROMPT_LENGTH,
  VIDEO_STYLE_STANDARDS,
  REFERENCE_METHOD_VERSION,
  countStyleDifferences,
  fingerprintStyleKey,
  getReferenceMethodCatalog,
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
  assert.ok(result.prompt.length < MAX_MASTER_PROMPT_LENGTH);
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
  assert.equal(result.creativeBlueprint.referenceStudyCount, 16);
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

test("research facts shape the concept while research bookkeeping never becomes the subject", () => {
  const plain = generateMasterPrompt({ business: business(), prices, research: { summary: "7 Recherchequellen eingebunden; Bildrechte prüfen." } });
  assert.doesNotMatch(plain.implementationPlan.companyFocus, /Recherchequellen|Bildrechte/);
  const timber = generateMasterPrompt({ business: business(), prices, research: { services: ["Holzbau"], differentiators: ["regionale Wiederverwendung"], targetAudiences: ["Bauherren"] } });
  const museum = generateMasterPrompt({ business: business(), prices, research: { services: ["Museumsarchitektur"], differentiators: ["barrierefreie Ausstellungen"], targetAudiences: ["Museen"] } });
  assert.notEqual(timber.fingerprint.id, museum.fingerprint.id);
  assert.match(timber.implementationPlan.companyFocus, /Holzbau.*Wiederverwendung/);
  assert.match(museum.implementationPlan.scenes[0].subject, /Museumsarchitektur/);
});

test("every chosen method has a concrete contract in master and express", () => {
  for (const productionTrack of ["master", "express"]) {
    const result = generateMasterPrompt({ business: business(), prices, settings: { productionTrack, expressTimebox: "60", websiteGame: "memory" } });
    for (const method of result.creativeBlueprint.techniques) assert.ok(result.implementationPlan.scenes.some((scene) => scene.techniqueId === method.id));
    for (const scene of result.implementationPlan.scenes) {
      for (const field of ["timeline", "trigger", "implementation", "assets", "mobile", "reducedMotion", "acceptance"]) assert.ok(scene[field]?.length > 15, `${scene.id} ${field}`);
      assert.match(result.prompt, new RegExp(scene.id));
    }
    assert.match(result.prompt, /CompanyMiniGame/);
    assert.ok(result.prompt.length < MAX_MASTER_PROMPT_LENGTH);
    assert.notEqual(result.creativeBlueprint.techniques[0].id, "motion-token-grammar");
  }
});

test("motion, 3D, text and budget switches constrain actual scene contracts", () => {
  for (const settings of [
    { animation: "none", spatialEffects: "hero", typographyMotion: "still" },
    { spatialEffects: "off", technology: "three", typographyMotion: "still" },
    { spatialEffects: "hero", technology: "standard" },
    { spatialEffects: "hero", complexity: "simple", budget: "small" },
  ]) {
    const result = generateMasterPrompt({ business: business(), prices, settings });
    assert.ok(result.implementationPlan.scenes.every((scene) => scene.renderer !== "webgl"));
    if (settings.animation === "none") assert.ok(result.implementationPlan.scenes.every((scene) => scene.renderer === "static"));
    if (settings.typographyMotion === "still") assert.ok(result.creativeBlueprint.techniques.every((method) => method.family !== "Typography"));
  }
  const hero = generateMasterPrompt({ business: business(), prices, settings: { spatialEffects: "hero" } });
  assert.equal(hero.implementationPlan.scenes.filter((scene) => scene.renderer === "webgl").length, 1);
  assert.equal(hero.implementationPlan.scenes.find((scene) => scene.renderer === "webgl").component, "CompanyHeroScene");
});

test("user-controlled selections are never driven by scroll and subtle tracks stay subtle", () => {
  for (let variant = 0; variant < 12; variant++) {
    const result = generateMasterPrompt({ business: business(), prices, variant, settings: { referenceStyle: "showroom", scrollMotion: "immersive", animation: "subtle", spatialEffects: "off" } });
    for (const scene of result.implementationPlan.scenes) {
      if (["proof-comparison-wipe", "guided-focus-lens", "motion-catalog-counter", "material-world-variants", "product-runway-configurator"].includes(scene.techniqueId) && scene.renderer !== "static") assert.match(scene.trigger, /Ausschließlich durch direkte/);
      if (scene.renderer === "dom" && scene.trigger.includes("IntersectionObserver")) assert.doesNotMatch(scene.timeline, /circle\(18%|Kamera von/);
    }
  }
});

test("all documented style worlds produce their own section ordering and production method", () => {
  const structures = new Set();
  for (const style of VIDEO_STYLE_STANDARDS) {
    const result = generateMasterPrompt({ business: business(), prices, settings: { referenceStyle: style.id } });
    assert.ok(result.implementationPlan.pageStructure.name.startsWith(style.name));
    assert.ok(result.prompt.includes(style.file));
    structures.add(result.implementationPlan.pageStructure.sections.join("|"));
    assert.ok(result.implementationPlan.pageStructure.workflow[0].length > 40);
  }
  assert.equal(structures.size, 16);
  assert.equal(getReferenceMethodCatalog().length, 36);
});

test("new companies differ in at least three visual dimensions across a small team portfolio", () => {
  const portfolio = [];
  for (let i = 0; i < 10; i++) {
    const next = generateDistinctMasterPrompt({ business: business({ sourceId: `firm-${i}`, name: `Atelier ${i}` }), prices }, portfolio);
    for (const previous of portfolio) assert.ok(countStyleDifferences(next.result.fingerprint, previous) >= 3);
    portfolio.push(next.result.fingerprint);
  }
  const first = portfolio[0];
  assert.equal(fingerprintStyleKey(first), fingerprintStyleKey({ ...first, id: "WWB-OTHER", concept: "Anderer Firmenname" }));
});

test("games are opt-in and retain company-specific playable rules in both tracks", () => {
  assert.equal(generateMasterPrompt({ business: business(), prices }).implementationPlan.game, null);
  for (const websiteGame of ["automatic", "quiz", "memory", "challenge"]) {
    const result = generateMasterPrompt({ business: business(), prices, settings: { websiteGame, animation: "none" }, research: { services: ["Holzbau"] } });
    assert.ok(result.implementationPlan.game);
    assert.match(result.implementationPlan.game.brief, /Holzbau/);
    assert.match(result.implementationPlan.game.implementation, /ready → playing → feedback → completed/);
    assert.match(result.implementationPlan.game.acceptance, /Neustart/);
  }
});


test("reuploaded reference signatures produce executable contracts in both production tracks", () => {
  const additions = VIDEO_STYLE_STANDARDS.filter((style) => style.signatureMethod);
  assert.equal(additions.length, 9);
  for (const style of additions) {
    assert.equal(normalizeMasterPromptSettings(business(), { referenceStyle: style.id }).referenceStyle, style.id);
    for (const productionTrack of ["master", "express"]) {
      const result = generateMasterPrompt({ business: business(), prices, settings: { referenceStyle: style.id, productionTrack, animation: "cinematic", complexity: "high-end", budget: "open", spatialEffects: "hero" }, research: { services: ["Individuelle Holzbauplanung"], targetAudiences: ["Bauherren"], differentiators: ["Wiederverwendete Bauteile"] } });
      const scene = result.implementationPlan.scenes.find((item) => item.techniqueId === style.signatureMethod);
      assert.ok(scene, style.id);
      assert.match(scene.subject, /Holzbauplanung/);
      assert.ok(scene.timeline?.length > 30);
      assert.ok(result.prompt.includes(style.file));
      assert.ok(result.prompt.includes(style.assetPlan[0]));
      assert.ok(result.prompt.includes(style.checkpoints[0]));
      assert.ok(result.prompt.includes(REFERENCE_METHOD_VERSION));
      assert.doesNotMatch(result.prompt, /undefined|NaN/);
      assert.ok(result.prompt.length < MAX_MASTER_PROMPT_LENGTH);
    }
  }
});

test("each reuploaded style offers multiple compositions while manual dramaturgy wins", () => {
  for (const style of VIDEO_STYLE_STANDARDS.filter((item) => item.signatureMethod)) {
    const layouts = new Set();
    for (let variant = 0; variant < 20; variant++) {
      const result = generateMasterPrompt({ business: business(), prices, variant, settings: { referenceStyle: style.id } });
      layouts.add(result.implementationPlan.pageStructure.sections.join("|"));
      assert.equal(result.fingerprint.structure, result.implementationPlan.pageStructure.name);
    }
    assert.equal(layouts.size, 2, style.id);
    const direct = generateMasterPrompt({ business: business(), prices, settings: { referenceStyle: style.id, storyStructure: "direct" } });
    assert.equal(direct.implementationPlan.pageStructure.name, "Klarer Beratungsweg");
  }
});

test("new signatures respect disabled effects and retain product or booking controls", () => {
  const interactive = ["return-stage-worlds", "occlusion-to-ensemble", "ingredient-carousel-continuity", "threshold-to-booking"];
  for (const style of VIDEO_STYLE_STANDARDS.filter((item) => item.signatureMethod)) {
    const still = generateMasterPrompt({ business: business(), prices, settings: { referenceStyle: style.id, animation: "none", spatialEffects: "hero", scrollMotion: "off" } });
    assert.ok(still.implementationPlan.scenes.every((scene) => scene.renderer === "static"));
    const scene = still.implementationPlan.scenes.find((item) => item.techniqueId === style.signatureMethod);
    assert.ok(scene);
    if (interactive.includes(scene.techniqueId)) assert.match(scene.implementation, /Funktionsvertrag:/);
    const constrained = generateMasterPrompt({ business: business(), prices, settings: { referenceStyle: style.id, technology: "standard", budget: "small", spatialEffects: "hero", animation: "subtle" } });
    assert.ok(constrained.implementationPlan.scenes.every((item) => item.renderer !== "webgl"));
    for (const item of constrained.implementationPlan.scenes.filter((item) => item.renderer === "dom")) assert.doesNotMatch(item.timeline, /180°|650 ms|700 ms|25°/);
  }
});
