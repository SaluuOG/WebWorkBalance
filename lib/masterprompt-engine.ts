import type { Business, PriceSettings, StoredLead } from "./webworkbalance";

export type MasterPromptMode = "new-website" | "redesign" | "acquisition" | "complete";
export type CreativityLevel = "safe" | "individual" | "extraordinary" | "experimental";
export type ComplexityLevel = "simple" | "professional" | "complex" | "high-end";
export type AnimationLevel = "none" | "subtle" | "dynamic" | "cinematic";
export type ScrollMotionLevel = "off" | "light" | "storytelling" | "immersive";
export type SpatialEffectLevel = "off" | "accent" | "hero" | "experience";
export type TransitionStyle = "classic" | "soft" | "dynamic" | "experimental";
export type LayoutStyle = "automatic" | "minimal" | "editorial" | "asymmetric" | "luxury" | "technical";
export type ImageryStrategy = "company" | "licensed-stock" | "ai" | "mixed";
export type MobilePriority = "speed" | "balanced" | "full-effects";
export type ConversionGoal = "information" | "contact" | "booking" | "sales";
export type PromptDepth = "compact" | "detailed" | "production";
export type TechnologyPreference = "automatic" | "standard" | "next" | "gsap" | "three";
export type BudgetTier = "small" | "medium" | "premium" | "open";
export type ExperienceArchetype = "automatic" | "editorial" | "cinematic" | "spatial" | "product" | "technical" | "experimental";
export type StoryStructure = "automatic" | "direct" | "chaptered" | "journey" | "reveal" | "catalog";
export type InteractionDensity = "restrained" | "balanced" | "rich" | "exper�m��G!j�-���jם������w�+z��j)_���Z.���t- oder Standbildvarianten für schwere Szenen`,
    ],
    searchQueries: [
      `${business.name} ${location} offizielle Bilder`,
      `${business.category} ${location} Arbeitsprozess Referenz`,
      `${business.category} ${fingerprint.concept} Bildsprache`,
    ],
  };
}

function motionPlanFor(business: Business, fingerprint: DesignFingerprint, item: IndustryProfile, settings: MasterPromptSettings, blueprint: MasterPromptCreativeBlueprint): MasterPromptMotionPlan {
  const still = settings.animation === "none";
  const light = settings.animation === "subtle";
  const technique = (index: number) => blueprint.techniques[index % blueprint.techniques.length];
  const scrollTrigger = settings.storyStructure === "direct" || settings.scrollMotion === "off" ? "beim sichtbaren Laden, nicht an Scrollposition koppeln" : settings.scrollMotion === "light" ? "einmalig bei 20 % Sichtbarkeit" : settings.storyStructure === "catalog" ? "beim Wechsel des fokussierten Eintrags" : "progressiv zwischen 10 % und 75 % Abschnittssichtbarkeit";
  const mobile = settings.mobilePriority === "speed" ? "statisches Schlüsselbild, keine Blur- oder WebGL-Layer" : settings.mobilePriority === "balanced" ? "halbe Bewegungsdistanz, reduzierte Partikel und Standbild-Fallback" : "gleiche Dramaturgie mit Touch- und Akkuschutz";
  const reduced = "sofort den lesbaren Endzustand zeigen; keine parallaxen oder automatischen Kamerafahrten";
  const interaction = settings.interactionDensity === "restrained" ? "maximal ein klarer Interaktionsimpuls" : settings.interactionDensity === "balanced" ? "eine fokussierte Kerninteraktion" : "mehrere sichtbare, aber pausierbare Interaktionszustände";
  const scenes: MasterPromptMotionScene[] = [
    {
      name: "Hero-Auftakt",
      trigger: "nach geladenem Hauptmotiv und sichtbarer H1",
      choreography: still ? "H1, Nutzen und CTA ohne Inszenierung sofort anzeigen" : `${fingerprint.hero}; mit „${technique(0).name}“ umsetzen: ${technique(0).direction} ${light ? "Bewegung auf 8–16 px und 360–520 ms begrenzen." : "In drei klaren Akten mit ruhiger Kamerakurve choreografieren."}`,
      purpose: `Die Leitidee „${fingerprint.concept}“ innerhalb weniger Sekunden verständlich machen; ${interaction}`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Leistung verstehen",
      trigger: scrollTrigger,
      choreography: still ? `Inhalte in stabiler Reihenfolge und ohne versetzte Reveals darstellen; ${technique(1).fallback}` : `${pick(item.motions, fingerprint.seed, "service-motion")} verbindet Problem, Leistung und Ergebnis. „${technique(1).name}“ technisch so einsetzen: ${technique(1).implementation}`,
      purpose: `Den Arbeitsprozess von ${business.name} nachvollziehbar statt nur dekorativ zeigen; Storystruktur ${settings.storyStructure}`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Vertrauensbeweis",
      trigger: settings.scrollMotion === "immersive" ? "wenn der vorherige Erzählabschnitt zu 80 % abgeschlossen ist" : "beim Eintritt des Belegabschnitts",
      choreography: still ? "Belege direkt und vergleichbar anzeigen" : `Bild, Kennzahl und Beleg nacheinander in ${fingerprint.rhythm} aufbauen; „${technique(2).name}“ nur nutzen, wenn dadurch Herkunft und Aussage des Belegs klarer werden`,
      purpose: `Nur überprüfbare Signale wie ${item.trust.join(", ")} hervorheben; Typografiebewegung ${settings.typographyMotion}`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Handlungsabschluss",
      trigger: "nach dem letzten glaubwürdigen Beleg, nicht als störendes Overlay",
      choreography: still ? "CTA klar fokussierbar und ohne Bewegung zeigen" : `Das Signaturmotiv aus dem Hero über „${technique(3).name}“ ruhig zum CTA zurückführen; Übergang ${settings.transitions}, Fokus und Leseposition bleiben stabil`,
      purpose: `Das Ziel „${settings.conversionGoal}“ als logischen nächsten Schritt abschließen`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
  ];
  return {
    signature: still ? "Ruhige Präzision ohne dekorative Bewegung" : `${fingerprint.motion}; Kreativ-DNA „${blueprint.title}“, ${settings.interactionDensity} inszeniert und choreografiert nach „${fingerprint.concept}“`,
    scenes,
    performanceBudget: settings.spatialEffects === "off" ? "Animation-Code unter 35 kB komprimiert; nur transform und opacity; 60 FPS anstreben." : "Räumliche Assets separat laden; Initial-JS unter 180 kB; LCP-Medium priorisieren; WebGL bei schwacher Hardware abschalten.",
  };
}

export function generateMasterPrompt(input: MasterPromptInput): MasterPromptResult {
  const recommendation = recommendMasterPromptSettings(input.business);
  const recommendedMode = recommendMasterPromptMode(input.business);
  const mode = input.mode ?? recommendedMode;
  const settings = normalizeMasterPromptSettings(input.business, input.settings);
  const { available, missing } = collectFacts({ ...input, mode, settings });
  const fingerprint = createDesignFingerprint({ business: input.business, mode, settings, variant: input.variant });
  const item = PROFILES[industryKey(input.business)] ?? PROFILES.generic;
  const imagePlan = imagePlanFor(input.business, fingerprint, item, settings);
  const creativeBlueprint = createCreativeBlueprint({ business: input.business, mode, settings, fingerprint });
  const motionPlan = motionPlanFor(input.business, fingerprint, item, settings, creativeBlueprint);
  const offer = offerFor(input.business, input.prices);
  const evidence = input.research?.evidence?.length ? input.research.evidence.map((entry) => `- ${entry.label}: ${entry.value} | ${entry.sourceLabel} | ${entry.confidence} | ${entry.usage}${entry.sourceUrl ? ` | Quelle: ${entry.sourceUrl}` : ""}${entry.license ? ` | Lizenz: ${entry.license}` : ""}`).join("\n") : "- Noch keine zusätzlichen Quellen hinterlegt.";
  const webTasks = ["Drei deutlich unterschiedliche Leitideen entwickeln, bewerten und eine begründet auswählen.", "Informationsarchitektur mit Ziel, Botschaft, Beleg und Nutzeraktion je Abschnitt ausarbeiten.", "Hero und Schlüsselabschnitte mit Layout, Bildregie, Typografie, Interaktion und responsive Verhalten beschreiben.", "Die gewählte Kreativ-DNA in ein szenengenaues Desktop- und Mobile-Storyboard übersetzen.", "Animationen mit Trigger, Ausgangszustand, Bewegung, Zweck und Reduced-Motion-Alternative definieren.", "Assetliste mit Format, Perspektive, Herkunft, Rechten, Produktionsweg und performanter Alternative erstellen.", "Technik, Komponenten, Formulare, SEO, Barrierefreiheit, Performance-Budgets und Tests festlegen.", "Zum Abschluss eine Abnahme-Checkliste mit Breakpoints, Geräten, Ladezuständen, Fehlerfällen und Inhaltsfreigaben liefern."];
  const salesTasks = ["Einen beobachtungsbasierten Gesprächseinstieg ohne erfundene Schwächen formulieren.", "E-Mail, WhatsApp, Telefonleitfaden und respektvolles Follow-up erstellen.", "Demo-Idee, Nutzenargumente, Einwände und transparenten Preisrahmen ausarbeiten."];
  let tasks = mode === "acquisition" ? salesTasks : mode === "complete" ? [...webTasks, ...salesTasks] : webTasks;
  if (settings.promptDepth === "compact") tasks = tasks.slice(0, 3);
  if (settings.promptDepth === "detailed") tasks = tasks.slice(0, 6);
  const standardPrompt = `# Individueller WebWorkBalance-Masterprompt\n\nDu bist Creative Director, UX-Stratege, Conversion-Texter und Senior-Webentwickler. Erstelle kein austauschbares Branchen-Template. Leite jede Entscheidung aus diesem Unternehmen, seiner Arbeit, Zielgruppe und dem Geschäftsziel ab.\n\n## Auftrag\n${mission(mode)}\n\n## Verfügbare Daten\n${available.map((fact) => `- ${fact.label}: ${fact.value} (Quelle: ${fact.source})`).join("\n")}\n\n## Fehlende oder unbelegte Angaben\n${missing.map((fact) => `- ${fact.placeholder}: ${fact.label}; benötigt für ${fact.reason}`).join("\n") || "- Keine erwarteten Pflichtangaben fehlen."}\n\nErfinde niemals Leistungen, Preise, Personen, Bewertungen, Referenzen, Zertifikate, Öffnungszeiten oder Unternehmensgeschichte. Nutze Platzhalter und formuliere konkrete Recherchefragen.\n\n## Quellen und Referenzen\n${evidence}\nReferenzen nur analysieren, nicht kopieren. Bilder, Texte, Logos und Designs nur mit belegten Rechten verwenden.\n\n## Individuelles Bildkonzept\n- Richtung: ${imagePlan.direction}\n${imagePlan.requiredAssets.map((asset) => `- ${asset}`).join("\n")}\n- Recherchebegriffe: ${imagePlan.searchQueries.join(" | ")}\nKennzeichne jedes Bild als firmeneigen, lizenziert, KI-generiert oder reine Inspiration. Eine Suchtreffer-Zuordnung niemals als bestätigt behandeln.\n\n## Design-Fingerabdruck ${fingerprint.id}\n- Thema: ${fingerprint.theme}\n- Leitidee: ${fingerprint.concept}\n- Komposition: ${fingerprint.composition}\n- Hero: ${fingerprint.hero}\n- Farbwelt: ${fingerprint.palette}\n- Typografie: ${fingerprint.typography}\n- Bildregie: ${fingerprint.imagery}\n- Bewegung: ${fingerprint.motion}\n- Rhythmus: ${fingerprint.rhythm}\n\nDer Fingerabdruck ist Ausgangspunkt, kein Template. Vermeide generische SaaS-Heros, zufällige Verläufe, austauschbare Kartenraster und Effekte ohne Funktion.\n\n## Kreativ-DNA ${creativeBlueprint.id}\nDie folgenden Prinzipien wurden aus ${creativeBlueprint.referenceStudyCount} hochwertigen Webdesign-Studien abstrahiert. Sie sind ein Werkzeugkasten, keine Vorlage.\n- Kombination: ${creativeBlueprint.title}\n- Unternehmensspezifische Metapher: ${creativeBlueprint.visualMetaphor}\n- Signature Moment: ${creativeBlueprint.signatureMoment}\n\n### Dramaturgie\n${creativeBlueprint.storyArc.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n### Gewählte Kreativtechniken\n${creativeBlueprint.techniques.map((technique, index) => `${index + 1}. ${technique.name} · ${technique.family}\n   - Idee: ${technique.direction}\n   - Umsetzung: ${technique.implementation}\n   - Fallback: ${technique.fallback}`).join("\n")}\n\n### Technischer Rahmen\n${creativeBlueprint.technicalDirection}\n\n### Eigenständigkeitsregeln\n${creativeBlueprint.originalityRules.map((rule) => `- ${rule}`).join("\n")}\n\n## Animationsregie\n- Signatur: ${motionPlan.signature}\n${motionPlan.scenes.map((scene, index) => `${index + 1}. ${scene.name}\n   - Trigger: ${scene.trigger}\n   - Choreografie: ${scene.choreography}\n   - Zweck: ${scene.purpose}\n   - Mobile: ${scene.mobileFallback}\n   - Reduced Motion: ${scene.reducedMotion}`).join("\n")}\n- Performance-Budget: ${motionPlan.performanceBudget}\n\n## Konfiguration\nKreativität ${settings.creativity}; Komplexität ${settings.complexity}; Animation ${settings.animation}; Scroll ${settings.scrollMotion}; 3D ${settings.spatialEffects}; Übergänge ${settings.transitions}; Layout ${settings.layout}; Bilder ${settings.imagery}; Mobile ${settings.mobilePriority}; Ziel ${settings.conversionGoal}; Tiefe ${settings.promptDepth}; Technik ${settings.technology}; Budget ${settings.budget}.\nBewegungsregel: ${movementRules(settings)}. Jede Animation muss Inhalt erklären, Marke spürbar machen oder Bedienung verbessern. prefers-reduced-motion, Touch, Tastatur und mobile Fallbacks einplanen.\n${settings.customInstructions ? `\n## Eigene Wünsche\n${settings.customInstructions}\nDiese Wünsche dürfen Fakten-, Rechte-, Performance- und Barrierefreiheitsregeln nicht verletzen.\n` : ""}\n## Branchenbasis\n- Zielgruppe: ${item.audience}\n- Vertrauenssignale: ${item.trust.join(", ")}\n- Ausgangsstruktur: ${["Nutzenversprechen", "Leistungen", ...item.sections, "Vertrauen", "Kontakt"].join(" → ")}\n- Preisannahme: ${offer.name}, etwa ${offer.price.toLocaleString("de-DE")} € netto; Umfang vor Angebot klären.\n\n## Ergebnis\n${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}\n\n## Qualitätskontrolle\nIst die Leitidee nur für dieses Unternehmen plausibel? Sind mindestens drei Gestaltungsdimensionen gegenüber bisherigen Varianten neu? Unterscheidet sich die Umsetzung in Aufbau, Bildregie und Bewegung klar von den Referenzstudien und üblichen Templates? Ist jede Aussage belegt oder markiert? Ist die mobile Version vollständig nutzbar? Passen Aufwand und Technik zum Budget? Bei einem Nein das Konzept überarbeiten.`;
  const productionDirective = highEndBuildDirective(settings, creativeBlueprint, imagePlan, item);
  const enrichedPrompt = settings.productionTrack === "express"
    ? expressBuildDirective({ business: input.business, mode, settings, item, available, missing, evidence, fingerprint, imagePlan, blueprint: creativeBlueprint, motionPlan, offer })
    : `${standardPrompt}\n\n${productionDirective}`;
  const warnings = missing.map((fact) => `${fact.label}: ${fact.reason}`);
  if (settings.productionTrack === "express") warnings.push(`Express-Zeitbox: ${expressProfileFor(settings.expressTimebox).label}; Umfang ${EXPRESS_SCOPE_PROFILES[settings.expressScope].routes}. Bei großen Websites ist die Zeitbox ein Produktionssprint, keine Fertiggarantie; offene Angaben bleiben Platzhalter.`);
  if (settings.spatialEffects !== "off" && settings.mobilePriority === "speed") warnings.push("3D ist aktiv, obwohl mobile Geschwindigkeit Vorrang hat; ein statischer Fallback ist Pflicht.");
  return { mode, recommendedMode, settings, recommendationReasons: recommendation.reasons, facts: available, missingFacts: missing, fingerprint, imagePlan, creativeBlueprint, motionPlan, prompt: enrichedPrompt, warnings };
}
