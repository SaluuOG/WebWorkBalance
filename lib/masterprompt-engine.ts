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
export type InteractionDensity = "restrained" | "balanced" | "rich" | "experimental";
export type TypographyMotion = "still" | "responsive" | "kinetic" | "transformative";
export type AssetDirection = "existing-first" | "art-direction" | "three-dimensional" | "ai-concept" | "hybrid";
export type BrandTone = "automatic" | "quiet-luxury" | "bold-editorial" | "warm-human" | "technical-precise" | "future-forward";
export type ProductionTrack = "master" | "express";
export type ExpressTimebox = "60" | "120" | "180";
export type ExpressScope = "focused" | "large" | "signature";
export type ResearchDepth = "quick" | "standard" | "deep" | "maximum";
export type AutonomyLevel = "assist" | "guided" | "autopilot";
export type ReferenceStyle = "automatic" | "fashion-dossier" | "surreal-journey" | "monumental-hero" | "villa-editorial" | "showroom" | "flavor-selector" | "campaign-commerce" | "experience-specification" | "cargo-relay" | "return-stage" | "ensemble-catalog" | "documentary-blueprint" | "ritual-booking" | "painterly-chapters" | "ingredient-orbit" | "isometric-network";
export type WebsiteGame = "off" | "automatic" | "quiz" | "memory" | "challenge";

export interface MasterPromptSettings {
  creativity: CreativityLevel;
  complexity: ComplexityLevel;
  animation: AnimationLevel;
  scrollMotion: ScrollMotionLevel;
  spatialEffects: SpatialEffectLevel;
  transitions: TransitionStyle;
  layout: LayoutStyle;
  imagery: ImageryStrategy;
  mobilePriority: MobilePriority;
  conversionGoal: ConversionGoal;
  promptDepth: PromptDepth;
  technology: TechnologyPreference;
  budget: BudgetTier;
  experienceArchetype: ExperienceArchetype;
  storyStructure: StoryStructure;
  interactionDensity: InteractionDensity;
  typographyMotion: TypographyMotion;
  assetDirection: AssetDirection;
  brandTone: BrandTone;
  productionTrack: ProductionTrack;
  expressTimebox: ExpressTimebox;
  expressScope: ExpressScope;
  researchDepth: ResearchDepth;
  autonomyLevel: AutonomyLevel;
  referenceStyle: ReferenceStyle;
  websiteGame: WebsiteGame;
  customInstructions: string;
}

export interface MasterPromptEvidence {
  label: string;
  value: string;
  sourceLabel: string;
  sourceUrl?: string | null;
  confidence: "verified" | "source-reported" | "unverified";
  usage: "fact" | "visual-reference" | "inspiration";
  license?: string | null;
}

export interface MasterPromptResearch {
  summary?: string | null;
  businessDescription?: string | null;
  services?: string[];
  targetAudiences?: string[];
  differentiators?: string[];
  contactPerson?: string | null;
  evidence?: MasterPromptEvidence[];
}

export interface MasterPromptInput {
  business: Business | StoredLead;
  prices: PriceSettings;
  mode?: MasterPromptMode;
  settings?: Partial<MasterPromptSettings>;
  research?: MasterPromptResearch;
  variant?: number;
}

export interface MasterPromptFact {
  key: string;
  label: string;
  value: string;
  source: string;
}

export interface MissingMasterPromptFact {
  key: string;
  label: string;
  placeholder: string;
  reason: string;
}

export interface DesignFingerprint {
  id: string;
  seed: number;
  theme: string;
  concept: string;
  composition: string;
  hero: string;
  palette: string;
  typography: string;
  imagery: string;
  motion: string;
  rhythm: string;
  structure?: string;
}

export interface MasterPromptImagePlan {
  direction: string;
  requiredAssets: string[];
  searchQueries: string[];
}

export interface MasterPromptMotionScene {
  name: string;
  trigger: string;
  choreography: string;
  purpose: string;
  mobileFallback: string;
  reducedMotion: string;
}

export interface MasterPromptMotionPlan {
  signature: string;
  scenes: MasterPromptMotionScene[];
  performanceBudget: string;
}

export interface MasterPromptCreativeTechnique {
  id: string;
  name: string;
  family: string;
  direction: string;
  implementation: string;
  fallback: string;
}

export interface MasterPromptCreativeBlueprint {
  id: string;
  title: string;
  referenceStudyCount: number;
  visualMetaphor: string;
  storyArc: string[];
  techniques: MasterPromptCreativeTechnique[];
  signatureMoment: string;
  technicalDirection: string;
  originalityRules: string[];
}

export interface FingerprintOriginality {
  score: number;
  highestSimilarity: number;
  comparedWith: string | null;
  distinctDimensions: string[];
}

export interface ExpressReadiness {
  score: number;
  label: "Express-bereit" | "Mit Platzhaltern" | "Vorbereitung nötig";
  tone: "ready" | "warning" | "blocked";
  openItems: string[];
}

export interface MasterPromptResult {
  mode: MasterPromptMode;
  recommendedMode: MasterPromptMode;
  settings: MasterPromptSettings;
  recommendationReasons: string[];
  facts: MasterPromptFact[];
  missingFacts: MissingMasterPromptFact[];
  fingerprint: DesignFingerprint;
  imagePlan: MasterPromptImagePlan;
  creativeBlueprint: MasterPromptCreativeBlueprint;
  motionPlan: MasterPromptMotionPlan;
  implementationPlan: MasterPromptImplementationPlan;
  prompt: string;
  warnings: string[];
}

export interface MasterPromptSceneContract {
  id: string;
  techniqueId: string;
  name: string;
  component: string;
  renderer: "static" | "dom" | "webgl";
  subject: string;
  trigger: string;
  timeline: string;
  implementation: string;
  assets: string;
  mobile: string;
  reducedMotion: string;
  acceptance: string;
}

export interface MasterPromptImplementationPlan {
  version: string;
  methodCount: number;
  companyFocus: string;
  evidenceStatus: string;
  pageStructure: { name: string; rationale: string; sections: string[]; workflow: string[] };
  referenceStandards: string[];
  game: { name: string; brief: string; rules: string; implementation: string; acceptance: string } | null;
  constraints: string[];
  scenes: MasterPromptSceneContract[];
  qualityGates: string[];
}

export interface SavedMasterPrompt {
  id: string;
  leadId: string;
  businessName: string;
  authorId: string;
  authorName: string;
  mode: MasterPromptMode;
  variant: number;
  settings: MasterPromptSettings;
  fingerprint: DesignFingerprint;
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

type Option = { value: string; label: string };
type IndustryProfile = {
  theme: string;
  audience: string;
  goal: ConversionGoal;
  sections: string[];
  trust: string[];
  concepts: string[];
  palettes: string[];
  motions: string[];
  defaults: Partial<MasterPromptSettings>;
};

type CreativeTechniqueDefinition = MasterPromptCreativeTechnique & {
  industries: string[];
  layouts: LayoutStyle[];
  minimumAnimation: 0 | 1 | 2 | 3;
  minimumComplexity: 0 | 1 | 2 | 3;
  minimumBudget: 0 | 1 | 2;
  spatial: "none" | "optional" | "required";
};

export const MASTER_PROMPT_MODES: Array<Option & { value: MasterPromptMode; hint: string }> = [
  { value: "new-website", label: "Neue Website", hint: "Kompletter neuer Auftritt" },
  { value: "redesign", label: "Redesign", hint: "Bestehenden Auftritt verbessern" },
  { value: "acquisition", label: "Akquise", hint: "Kontakt und Angebot vorbereiten" },
  { value: "complete", label: "Komplettpaket", hint: "Recherche bis Umsetzung" },
];

export const EXPRESS_TIMEBOX_OPTIONS: Array<Option & { value: ExpressTimebox; hint: string; capacity: string }> = [
  { value: "60", label: "1 Stunde", hint: "High-End-Onepage als überzeugende Demo", capacity: "bis zu 4–5 fokussierte Demos pro Tag" },
  { value: "120", label: "2 Stunden", hint: "Polierte Business-Website mit stärkeren Interaktionen", capacity: "etwa 2–3 Produktionen pro Tag" },
  { value: "180", label: "3 Stunden", hint: "Signature-Auftritt mit zusätzlicher Tiefe", capacity: "etwa 1–2 Signature-Produktionen pro Tag" },
];

export const EXPRESS_SCOPE_OPTIONS: Array<Option & { value: ExpressScope; hint: string }> = [
  { value: "focused", label: "Fokussiert", hint: "Onepage oder höchstens 2 Routen" },
  { value: "large", label: "Große Website", hint: "5–8 Routen mit wiederverwendbarem System" },
  { value: "signature", label: "High-End Signature", hint: "8–14 Routen, Premium-Dramaturgie und skalierbare Komponenten" },
];
export const RESEARCH_DEPTH_OPTIONS: Array<Option & { value: ResearchDepth; hint: string }> = [
  { value: "quick", label: "Schnell", hint: "Startseite, Firmeneintrag und freie Bildquellen" },
  { value: "standard", label: "Standard", hint: "Wichtige Unterseiten, Kontakt, Leistungen und Bildquellen" },
  { value: "deep", label: "Tief", hint: "Mehrseitige Bestands-, Marken- und Wettbewerbsrecherche" },
  { value: "maximum", label: "Maximum", hint: "Maximaler Recherchelauf mit Quellen- und Rechte-Dossier" },
];
export const AUTONOMY_LEVEL_OPTIONS: Array<Option & { value: AutonomyLevel; hint: string }> = [
  { value: "assist", label: "Assistiert", hint: "Du bestätigst Recherche und Entscheidungen" },
  { value: "guided", label: "Geführt", hint: "Automatik bereitet vor, du steuerst kritische Punkte" },
  { value: "autopilot", label: "Autopilot", hint: "Recherche und Prompt werden automatisch ausgeführt" },
];
export const MASTER_PROMPT_OPTIONS: Record<Exclude<keyof MasterPromptSettings, "customInstructions">, Option[]> = {
  creativity: [{ value: "safe", label: "Sicher" }, { value: "individual", label: "Individuell" }, { value: "extraordinary", label: "Außergewöhnlich" }, { value: "experimental", label: "Experimentell" }],
  complexity: [{ value: "simple", label: "Einfach" }, { value: "professional", label: "Professionell" }, { value: "complex", label: "Komplex" }, { value: "high-end", label: "High-End" }],
  animation: [{ value: "none", label: "Keine" }, { value: "subtle", label: "Dezent" }, { value: "dynamic", label: "Dynamisch" }, { value: "cinematic", label: "Cinematic" }],
  scrollMotion: [{ value: "off", label: "Aus" }, { value: "light", label: "Leicht" }, { value: "storytelling", label: "Storytelling" }, { value: "immersive", label: "Immersiv" }],
  spatialEffects: [{ value: "off", label: "Aus" }, { value: "accent", label: "Ein Akzent" }, { value: "hero", label: "3D-Hero" }, { value: "experience", label: "Gesamterlebnis" }],
  transitions: [{ value: "classic", label: "Klassisch" }, { value: "soft", label: "Weich" }, { value: "dynamic", label: "Dynamisch" }, { value: "experimental", label: "Experimentell" }],
  layout: [{ value: "automatic", label: "Automatisch" }, { value: "minimal", label: "Minimal" }, { value: "editorial", label: "Editorial" }, { value: "asymmetric", label: "Asymmetrisch" }, { value: "luxury", label: "Luxuriös" }, { value: "technical", label: "Technisch" }],
  imagery: [{ value: "company", label: "Firmenbilder" }, { value: "licensed-stock", label: "Lizenzierte Bilder" }, { value: "ai", label: "KI-Bilder" }, { value: "mixed", label: "Mischung" }],
  mobilePriority: [{ value: "speed", label: "Geschwindigkeit" }, { value: "balanced", label: "Ausgewogen" }, { value: "full-effects", label: "Volle Effekte" }],
  conversionGoal: [{ value: "information", label: "Information" }, { value: "contact", label: "Anfragen" }, { value: "booking", label: "Buchungen" }, { value: "sales", label: "Verkauf" }],
  promptDepth: [{ value: "compact", label: "Kompakt" }, { value: "detailed", label: "Detailliert" }, { value: "production", label: "Produktionsfertig" }],
  technology: [{ value: "automatic", label: "Automatisch" }, { value: "standard", label: "HTML/CSS/JS" }, { value: "next", label: "Next.js" }, { value: "gsap", label: "GSAP" }, { value: "three", label: "Three.js/WebGL" }],
  budget: [{ value: "small", label: "Klein" }, { value: "medium", label: "Mittel" }, { value: "premium", label: "Premium" }, { value: "open", label: "Offen" }],
  experienceArchetype: [{ value: "automatic", label: "Branchenlogik" }, { value: "editorial", label: "Editorial" }, { value: "cinematic", label: "Cinematic" }, { value: "spatial", label: "Räumlich" }, { value: "product", label: "Produkt / Katalog" }, { value: "technical", label: "Technisch" }, { value: "experimental", label: "Experimentell" }],
  storyStructure: [{ value: "automatic", label: "Automatisch" }, { value: "direct", label: "Direkt" }, { value: "chaptered", label: "Kapitel" }, { value: "journey", label: "Reise" }, { value: "reveal", label: "Reveal" }, { value: "catalog", label: "Katalog" }],
  interactionDensity: [{ value: "restrained", label: "Zurückhaltend" }, { value: "balanced", label: "Ausgewogen" }, { value: "rich", label: "Reichhaltig" }, { value: "experimental", label: "Experimentell" }],
  typographyMotion: [{ value: "still", label: "Statisch" }, { value: "responsive", label: "Reaktiv" }, { value: "kinetic", label: "Kinetisch" }, { value: "transformative", label: "Transformativ" }],
  assetDirection: [{ value: "existing-first", label: "Vorhandene Assets" }, { value: "art-direction", label: "Art Direction" }, { value: "three-dimensional", label: "3D-Assets" }, { value: "ai-concept", label: "KI-Konzeptbilder" }, { value: "hybrid", label: "Hybrid" }],
  brandTone: [{ value: "automatic", label: "Branchenpassend" }, { value: "quiet-luxury", label: "Quiet Luxury" }, { value: "bold-editorial", label: "Bold Editorial" }, { value: "warm-human", label: "Warm & menschlich" }, { value: "technical-precise", label: "Technisch präzise" }, { value: "future-forward", label: "Future Forward" }],
  productionTrack: [{ value: "master", label: "Masterprompt" }, { value: "express", label: "Express Build" }],
  expressTimebox: EXPRESS_TIMEBOX_OPTIONS,
  expressScope: EXPRESS_SCOPE_OPTIONS,
  researchDepth: RESEARCH_DEPTH_OPTIONS,
  autonomyLevel: AUTONOMY_LEVEL_OPTIONS,
  referenceStyle: [
    { value: "automatic", label: "Passend zur Firma variieren" },
    { value: "fashion-dossier", label: "Material & Editorial-Dossier" },
    { value: "surreal-journey", label: "Surreale Kapitelreise" },
    { value: "monumental-hero", label: "Monumentaler Hero" },
    { value: "villa-editorial", label: "Ankommen & Räume erleben" },
    { value: "showroom", label: "Showroom & Auswahl" },
    { value: "flavor-selector", label: "Produktwelt & Varianten" },
    { value: "campaign-commerce", label: "Kampagne & Sortiment" },
    {"value": "experience-specification", "label": "Erlebnis → Detail → Fakten"},
    {"value": "cargo-relay", "label": "Prozess & Übergaben"},
    {"value": "return-stage", "label": "Produktwelten & Rückkehr"},
    {"value": "ensemble-catalog", "label": "Einzelmotiv & Gesamtauswahl"},
    {"value": "documentary-blueprint", "label": "Reportage & technische Erklärung"},
    {"value": "ritual-booking", "label": "Markenerlebnis & Buchung"},
    {"value": "painterly-chapters", "label": "Malerische Erzählung"},
    {"value": "ingredient-orbit", "label": "Produktdetails & Merkmalsfokus"},
    {"value": "isometric-network", "label": "Isometrische Arbeitswelt"},
  ],
  websiteGame: [{ value: "off", label: "Kein Spiel" }, { value: "automatic", label: "Passendes Spiel vorschlagen" }, { value: "quiz", label: "Wissens- / Entdeckerquiz" }, { value: "memory", label: "Motiv-Memory" }, { value: "challenge", label: "Spielerische Aufgabe" }],
};

export const DEFAULT_MASTER_PROMPT_SETTINGS: MasterPromptSettings = {
  creativity: "individual", complexity: "professional", animation: "subtle", scrollMotion: "light",
  spatialEffects: "off", transitions: "soft", layout: "automatic", imagery: "mixed",
  mobilePriority: "balanced", conversionGoal: "contact", promptDepth: "production",
  technology: "automatic", budget: "medium", experienceArchetype: "automatic", storyStructure: "automatic",
  interactionDensity: "balanced", typographyMotion: "responsive", assetDirection: "hybrid", brandTone: "automatic",
  productionTrack: "master", expressTimebox: "120", expressScope: "focused", researchDepth: "standard",
  autonomyLevel: "guided", referenceStyle: "automatic", websiteGame: "off", customInstructions: "",
};

const PROFILES: Record<string, IndustryProfile> = {
  gastro: profile("Genuss, Atmosphäre und lokaler Charakter", "Gäste mit Besuchs-, Reservierungs- oder Bestellabsicht", "booking", ["Speisekarte", "Atmosphäre", "Reservierung"], ["echte Gerichte", "Gastgeber", "Öffnungszeiten"], ["Vom ersten Duft bis zum gedeckten Tisch", "Eine Reise durch Geschmack und Herkunft", "Der Abend als Folge besonderer Momente"], ["Bordeaux, Elfenbein und Messing", "Kohle, Terrakotta und Creme", "Waldgrün, Sand und Gold"], ["Enthüllungen wie beim Anrichten", "Licht- und Dampfbewegungen", "scrollgesteuerte Menüsequenzen"], { creativity: "extraordinary", animation: "dynamic", scrollMotion: "storytelling", layout: "editorial" }),
  beauty: profile("Transformation, Persönlichkeit und Handwerksqualität", "Menschen auf der Suche nach Stil, Vertrauen und Terminen", "booking", ["Behandlungen und Preise", "Ergebnisse", "Terminbuchung"], ["echte Ergebnisse", "Team", "Hygiene"], ["Die Verwandlung als elegante Dramaturgie", "Ein digitales Atelier für individuellen Stil", "Textur und Persönlichkeit im Mittelpunkt"], ["Schwarz, Champagner und Nude", "Creme, Espresso und Roségold", "Graphit, Eisgrau und Neon"], ["präzise Schnittlinien", "Vorher-nachher-Masken", "editoriale Bildwechsel"], { creativity: "extraordinary", animation: "dynamic", layout: "editorial" }),
  craft: profile("Material, Präzision und sichtbare Ergebnisse", "Kunden mit konkretem Projekt oder Problem", "contact", ["Leistungsgebiete", "Referenzen", "Angebotsanfrage"], ["Projekte", "Qualifikationen", "Ablauf"], ["Vom Rohzustand zum Ergebnis", "Arbeitsschritte als Qualitätsgeschichte", "Material und Maß als visuelles System"], ["Anthrazit, Grau und Orange", "Nachtblau, Weiß und Kupfer", "Graphit, Beton und Gelb"], ["zeichnende Konturen", "Vorher-nachher-Übergänge", "modulare Aufbauanimationen"], { layout: "technical" }),
  health: profile("Ruhe, Orientierung und verantwortungsvolles Vertrauen", "Patienten mit hohem Informations- und Sicherheitsbedarf", "booking", ["Behandlungen", "Team und Qualifikation", "Termin"], ["Qualifikation", "Ablauf", "Datenschutz"], ["Von Unsicherheit zu klarer Orientierung", "Kompetenz ohne Distanz", "Behandlungsschritte als ruhige Führung"], ["Tiefblau, Weiß und Aqua", "Graphit, Grau und Salbei", "Petrol, Elfenbein und warmes Gold"], ["ruhige Fokuswechsel", "sanfte Inhaltsenthüllungen", "dezente Weganimationen"], { animation: "subtle", spatialEffects: "off", layout: "minimal", mobilePriority: "speed" }),
  professional: profile("Klarheit, Autorität und nachvollziehbare Expertise", "Entscheider, die Kompetenz und Verlässlichkeit prüfen", "contact", ["Expertise", "Fallbeispiele", "Erstgespräch"], ["Erfahrung", "Arbeitsweise", "Ansprechpartner"], ["Komplexität in klare Entscheidungen verwandeln", "Expertise als Navigationssystem", "Vom Problem zur belastbaren Lösung"], ["Mitternachtsblau, Stein und Gold", "Graphit, Weiß und Blau", "Petrol, Nebelgrau und Messing"], ["typografische Enthüllungen", "Verbindungslinien", "strukturierte Ebenenwechsel"], { complexity: "complex", layout: "asymmetric", budget: "premium" }),
  fitness: profile("Energie, Fortschritt und Gemeinschaft", "Interessenten, die Angebot und Einstieg vergleichen", "booking", ["Kurse", "Trainer", "Probetraining"], ["Trainer", "Ausstattung", "Ergebnisse"], ["Fortschritt als sichtbare Bewegung", "Der erste Schritt in eine stärkere Version", "Training als messbare Entwicklung"], ["Schwarz, Titan und Limette", "Nachtblau, Weiß und Cyan", "Graphit, Sand und Rot"], ["kinetische Typografie", "Fortschrittslinien", "Trainingssequenzen"], { creativity: "extraordinary", complexity: "complex", animation: "dynamic", scrollMotion: "storytelling", layout: "asymmetric" }),
  auto: profile("Präzision, Leistung und technische Sicherheit", "Fahrzeughalter mit akutem oder planbarem Servicebedarf", "booking", ["Werkstattleistungen", "Kompetenzen", "Termin"], ["Qualifikation", "Markenkompetenz", "Bewertungen"], ["Diagnose und Lösung als Systemreise", "Technik sichtbar und Service einfach machen", "Von Leistung zu Sicherheit"], ["Schwarz, Aluminium und Rot", "Nachtblau, Stahl und Cyan", "Graphit, Weiß und Gelb"], ["instrumentenartige Anzeigen", "technische Linien", "Beschleunigungsbewegungen"], { creativity: "extraordinary", complexity: "complex", animation: "dynamic", scrollMotion: "storytelling", spatialEffects: "accent", layout: "technical" }),
  hotel: profile("Ankommen, Atmosphäre und Vorfreude", "Reisende, die Lage, Erlebnis und Buchbarkeit abwägen", "booking", ["Zimmer", "Ausstattung", "Umgebung", "Buchung"], ["echte Räume", "Lage", "Verfügbarkeit"], ["Die Reise beginnt auf der Website", "Vom Ort zum Rückzugsraum", "Ein Rundgang durch Licht und Raum"], ["Mitternachtsblau, Weiß und Gold", "Waldgrün, Naturstein und Messing", "Graphit, Leinen und Kupfer"], ["cinematische Raumfahrten", "Tiefenparallaxe", "Lichtwechsel"], { creativity: "extraordinary", complexity: "high-end", animation: "cinematic", scrollMotion: "immersive", spatialEffects: "hero", layout: "luxury", budget: "premium" }),
  retail: profile("Entdecken, auswählen und lokal einkaufen", "Kunden mit Produktinteresse und Beratungsbedarf", "sales", ["Sortiment", "Neuheiten", "Beratung", "Anfahrt"], ["Sortiment", "Verfügbarkeit", "Öffnungszeiten"], ["Das Sortiment als Entdeckungsreise", "Vom Schaufenster zum Lieblingsstück", "Produkte als lebendige Kollektion"], ["Schwarz, Grau und Markenfarbe", "Creme, Espresso und Kobaltblau", "Graphit, Weiß und Orange"], ["Karten- und Maskenwechsel", "Katalogbewegungen", "Detailenthüllungen"], { animation: "dynamic", layout: "editorial" }),
  generic: profile("Lokaler Charakter, klare Leistung und persönliches Vertrauen", "Menschen aus der Region mit konkretem Bedarf", "contact", [], ["Leistungen", "Team", "Erreichbarkeit"], ["Vom Bedarf zur Lösung", "Lokale Nähe als digitales Erlebnis", "Die tägliche Arbeit als Markengeschichte"], ["Graphit, Weiß und Gold", "Nachtblau, Stein und Grün", "Schwarz, Grau und Blau"], ["subtile Tiefenstaffelung", "präzise Enthüllungen", "ortsbezogene Linien"], {}),
};

function profile(theme: string, audience: string, goal: ConversionGoal, sections: string[], trust: string[], concepts: string[], palettes: string[], motions: string[], defaults: Partial<MasterPromptSettings>): IndustryProfile {
  return { theme, audience, goal, sections, trust, concepts, palettes, motions, defaults: { ...defaults, conversionGoal: goal } };
}

const COMPOSITIONS = ["editorialer Split-Screen", "vollflächige Szenen mit Ruheflächen", "modulares Raster mit Größenwechseln", "asymmetrischer Seitenfluss", "gerahmte Viewports", "geschichtete Tiefenkomposition"];
const HEROS = ["vom Standort zur konkreten Leistung zoomen", "Typografie in echte Arbeitsbilder auflösen", "Vorher und Nachher interaktiv enthüllen", "von der Nahaufnahme zum Zusammenhang fahren", "vom Kundenproblem zum Ergebnis führen", "Medienmosaik zum Hauptmotiv ordnen"];
const TYPOGRAPHY = ["Editorial-Serif plus ruhige Grotesk", "geometrische Grotesk plus schmale Display-Schrift", "humanistische Sans plus kontrastreiche Serif", "Display-Typografie plus neutrale Systemschrift", "technische Grotesk plus warme Serif"];
const IMAGERY = ["authentische Großmotive mit Detailausschnitten", "filmische Totale und Nahaufnahmen", "Masken und bewusste Negativflächen", "dokumentarische Bildfolge mit Hero-Momenten", "Materialdetails als visuelle Klammer"];
const RHYTHMS = ["ruhiger Einstieg, dichter Beweis, klarer Abschluss", "immersive und kompakte Abschnitte im Wechsel", "Information zwischen starken Bildmomenten", "kontinuierliche Story mit Interaktionspausen", "Nutzen, Beweis, Detail, Handlung"];

// Übernommene Gestaltungsprinzipien plus dokumentierte, erneut gesichtete Video-Studien.
// Bewusst ohne Marken, Texte oder konkrete Kompositionen der Vorlagen: Die Engine darf
// Muster kombinieren, muss daraus aber für jedes Unternehmen eine neue visuelle Logik bilden.
const CREATIVE_TECHNIQUES: CreativeTechniqueDefinition[] = [
  {
    id: "editorial-anchor-object",
    name: "Editorialer Leitgegenstand",
    family: "Editorial",
    direction: "Ein reales, branchentypisches Detail wandert als visuelle Klammer durch wechselnde Bildwelten und verbindet Leistung, Herkunft und Ergebnis.",
    implementation: "Den Gegenstand pro Kapitel neu kadrieren, freistellen oder in eine Collage einbetten; Größen-, Blickwinkel- und Materialwechsel statt identischer Wiederholung.",
    fallback: "Das Motiv als wiederkehrendes statisches Detail mit variierenden Ausschnitten einsetzen.",
    industries: ["gastro", "beauty", "retail", "hotel", "generic"], layouts: ["editorial", "asymmetric", "luxury", "automatic"],
    minimumAnimation: 0, minimumComplexity: 0, minimumBudget: 0, spatial: "none",
  },
  {
    id: "cinematic-tonal-chapters",
    name: "Cinematische Farbkapitel",
    family: "Story",
    direction: "Helle, dunkle und markenfarbene Kapitel wechseln wie Szenen eines Films; jeder Tonwechsel signalisiert einen neuen inhaltlichen Zweck.",
    implementation: "Kapitel mit eigenem Licht, Bildmaßstab und Typografie-Rhythmus planen; Übergänge über gemeinsame Kante, Form oder Bewegungsrichtung verbinden.",
    fallback: "Kapitel durch starke, barrierefreie Farbflächen und klare Abschnittswechsel trennen.",
    industries: ["auto", "hotel", "professional", "fitness", "craft", "generic"], layouts: ["automatic", "editorial", "luxury", "asymmetric", "technical"],
    minimumAnimation: 0, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "masked-media-reveal",
    name: "Bedeutungsvolle Bildmasken",
    family: "Composition",
    direction: "Bildflächen öffnen sich entlang einer fachlich passenden Kontur und machen aus dem Reveal eine Aussage statt eines Dekoeffekts.",
    implementation: "CSS clip-path oder SVG-Maske aus Werkzeug, Material, Route oder Produktform ableiten; Text und Bild nie gleichzeitig in Bewegung setzen.",
    fallback: "Die individuelle Kontur als statischen Bildrahmen mit sauberem Fokuspunkt nutzen.",
    industries: ["craft", "beauty", "auto", "gastro", "retail", "generic"], layouts: ["editorial", "asymmetric", "technical", "automatic"],
    minimumAnimation: 0, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "modular-strip-transition",
    name: "Modulare Streifenbühne",
    family: "Composition",
    direction: "Vertikale oder horizontale Module zerlegen ein großes Motiv in lesbare Teilaspekte und setzen es anschließend wieder zum Gesamtbild zusammen.",
    implementation: "Ein semantisches Grid mit unterschiedlich getakteten transform-Reveals verwenden; Module zeigen echte Prozessschritte statt zufälliger Ausschnitte.",
    fallback: "Module als stabiles, horizontal scrollbar zugängliches Raster darstellen.",
    industries: ["craft", "auto", "professional", "retail", "fitness", "generic"], layouts: ["technical", "asymmetric", "editorial", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "route-orbit-narrative",
    name: "Route als Erzählachse",
    family: "Journey",
    direction: "Eine Linie, Umlaufbahn oder Wegmarke verbindet Standort, Prozess, Belege und Kontakt zu einer nachvollziehbaren Reise.",
    implementation: "SVG-Pfad oder CSS-Motion-Path progressiv zeichnen; an wenigen Wegpunkten Inhalte andocken und die Linie nie als einzige Navigation verwenden.",
    fallback: "Eine statische nummerierte Route mit klaren Sprungmarken und Fortschrittsanzeige zeigen.",
    industries: ["auto", "craft", "hotel", "professional", "fitness", "generic"], layouts: ["technical", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "optional",
  },
  {
    id: "kinetic-type-performance",
    name: "Typografie als Handlung",
    family: "Typography",
    direction: "Schlüsselwörter verändern Maßstab, Laufweite oder Zeilenbruch passend zur Aussage und tragen die Dramaturgie auch ohne Bild.",
    implementation: "Variable-Font-Achsen oder transform-basierte Wortgruppen sparsam choreografieren; Lesereihenfolge und DOM-Struktur unverändert verständlich halten.",
    fallback: "Ausdrucksstarke statische Typografie mit denselben Hierarchien und Zeilenbrüchen verwenden.",
    industries: ["fitness", "beauty", "retail", "professional", "gastro", "generic"], layouts: ["editorial", "asymmetric", "minimal", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "product-orbit-selector",
    name: "Produkt-Orbit",
    family: "Product",
    direction: "Varianten oder Leistungen ordnen sich um ein fokussiertes Zentrum und reagieren als räumlich lesbarer, bedienbarer Katalog.",
    implementation: "Orbit als zugängliche Liste mit synchronisiertem Fokus bauen; Rotation nur bei direkter Eingabe und mit begrenzter Geschwindigkeit auslösen.",
    fallback: "Varianten als Swipe-Karussell mit sichtbarer Beschriftung und Positionsanzeige anbieten.",
    industries: ["retail", "gastro", "beauty", "auto"], layouts: ["asymmetric", "editorial", "luxury", "automatic"],
    minimumAnimation: 2, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "product-assembly-story",
    name: "Produkt- oder Leistungsaufbau",
    family: "Product",
    direction: "Bestandteile trennen sich kontrolliert, erklären Qualität oder Auswahl und fügen sich zum fertigen Ergebnis zusammen.",
    implementation: "Ebenen aus echten freigestellten Assets oder illustrativen Komponenten aufbauen; jede Stufe mit Nutzen, Herkunft oder Auswahl verknüpfen.",
    fallback: "Komponenten als nummerierte Explosionsgrafik oder gestapelte Vergleichskarten zeigen.",
    industries: ["gastro", "retail", "craft", "auto", "beauty"], layouts: ["technical", "editorial", "asymmetric", "automatic"],
    minimumAnimation: 2, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "material-to-result-morph",
    name: "Material-zum-Ergebnis-Morph",
    family: "Transformation",
    direction: "Kontur, Rohmaterial oder Ausgangslage verwandelt sich schrittweise in das sichtbare Ergebnis der Arbeit.",
    implementation: "Morph über kompatible SVG-Pfade, Crossfades oder aufeinander abgestimmte Bildmasken lösen; jede Zwischenstufe benennt einen echten Arbeitsschritt.",
    fallback: "Ausgang, Prozess und Ergebnis als dreiteilige, direkt vergleichbare Sequenz zeigen.",
    industries: ["beauty", "craft", "professional", "auto", "fitness", "retail"], layouts: ["minimal", "editorial", "luxury", "technical", "automatic"],
    minimumAnimation: 1, minimumComplexity: 2, minimumBudget: 1, spatial: "none",
  },
  {
    id: "architectural-camera-portal",
    name: "Räumlicher Szenenportal",
    family: "Spatial",
    direction: "Ein Bilddetail wird zum Portal in den nächsten Raum, Leistungsbereich oder Blickwinkel und erzeugt eine kontinuierliche Entdeckungsbewegung.",
    implementation: "Mit abgestimmten Perspektiven, View-Transitions oder einer sehr kurzen 3D-Kamerafahrt arbeiten; Navigation und CTA außerhalb der Szene zugänglich halten.",
    fallback: "Perspektivisch passende Standbilder mit harten, schnellen Schnitten und klarer Kapitelanzeige verwenden.",
    industries: ["hotel", "professional", "retail", "auto", "generic"], layouts: ["luxury", "asymmetric", "editorial", "automatic"],
    minimumAnimation: 2, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "volumetric-particle-morph",
    name: "Volumetrischer Partikel-Morph",
    family: "Spatial",
    direction: "Punkte oder Lichtpartikel verdichten sich aus einer abstrakten Energie zu einer fachlich relevanten Form und lösen sich kontrolliert wieder auf.",
    implementation: "WebGL-Szene lazy laden, Partikelzahl und DPR dynamisch begrenzen, Interaktion nur als Akzent einsetzen und den Endzustand als HTML erklären.",
    fallback: "Vorgerendertes AVIF/WebM oder eine statische Punktillustration mit leichtem CSS-Schimmer einsetzen.",
    industries: ["professional", "fitness", "auto", "health", "generic"], layouts: ["technical", "minimal", "asymmetric", "automatic"],
    minimumAnimation: 3, minimumComplexity: 3, minimumBudget: 2, spatial: "required",
  },
  {
    id: "spatial-world-portals",
    name: "Räumliche Themenportale",
    family: "Spatial",
    direction: "Eine zusammenhängende Welt enthält mehrere Leistungsportale; der Wechsel zoomt vom Überblick präzise zum ausgewählten Detail.",
    implementation: "Nur für wenige hochwertige Bereiche nutzen, Assets vorladen sobald sinnvoll und jeden Portalzustand mit URL, Fokusmanagement und HTML-Inhalt abbilden.",
    fallback: "Themen als hochwertige Full-Bleed-Kapitel mit identischer Reihenfolge und direkter Navigation zeigen.",
    industries: ["hotel", "professional", "retail", "auto"], layouts: ["luxury", "asymmetric", "automatic"],
    minimumAnimation: 3, minimumComplexity: 3, minimumBudget: 2, spatial: "required",
  },
  {
    id: "motion-catalog-counter",
    name: "Choreografierter Katalog",
    family: "Product",
    direction: "Ein Objekt, Projekt oder Leistungsbeispiel steht frei auf einer ruhigen Bühne; Zähler, Randtypografie und Fakten wechseln synchron dazu.",
    implementation: "Native Scroll-Snap- oder fokussierbare Slider-Struktur als Basis nutzen und Objektbewegung nur an den aktiven Index koppeln.",
    fallback: "Eine klare Liste mit großen Einzelmotiven, Index und sichtbaren Vor-/Zurück-Aktionen anzeigen.",
    industries: ["retail", "professional", "beauty", "gastro", "craft"], layouts: ["minimal", "editorial", "luxury", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "responsive-organic-field",
    name: "Reaktives Markenfeld",
    family: "Interaction",
    direction: "Linien, Fasern oder Formen reagieren dezent auf Nähe und Richtung des Cursors und übersetzen eine Markeneigenschaft in Verhalten.",
    implementation: "Canvas oder SVG mit klarer Interaktionsgrenze, gedrosseltem Pointer-Handling und automatisch ruhendem Zustand bauen; keine Pflichtinteraktion verstecken.",
    fallback: "Ein starkes generatives Standmotiv oder eine kurze, nicht interaktive Loop-Sequenz verwenden.",
    industries: ["professional", "beauty", "fitness", "generic"], layouts: ["asymmetric", "minimal", "editorial", "automatic"],
    minimumAnimation: 2, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "proof-comparison-wipe",
    name: "Beweisender Vergleich",
    family: "Proof",
    direction: "Vorher/Nachher, Problem/Lösung oder Entwurf/Ergebnis werden auf derselben Fläche unmittelbar vergleichbar.",
    implementation: "Zugänglichen Range-Regler oder zwei synchron kadrierte Bilder einsetzen; Aussage, Zeitraum und Herkunft des Belegs daneben nennen.",
    fallback: "Beide Zustände vollständig nebeneinander mit identischer Skalierung darstellen.",
    industries: ["beauty", "craft", "auto", "fitness", "professional", "generic"], layouts: ["technical", "editorial", "minimal", "automatic"],
    minimumAnimation: 0, minimumComplexity: 0, minimumBudget: 0, spatial: "none",
  },
  {
    id: "process-assembly-system",
    name: "Systematischer Aufbau",
    family: "Process",
    direction: "Linien, Module oder Bauteile entstehen in der Reihenfolge des realen Prozesses und machen Qualität Schritt für Schritt sichtbar.",
    implementation: "CSS Grid, SVG-Linien und kleine Zustandswechsel aus einer semantischen Prozessliste ableiten; keine künstlichen Schritte erfinden.",
    fallback: "Den Ablauf als klar nummerierte Prozessgrafik mit verbundenen Modulen zeigen.",
    industries: ["craft", "auto", "professional", "health", "generic"], layouts: ["technical", "minimal", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "guided-focus-lens",
    name: "Geführter Fokus",
    family: "Clarity",
    direction: "Der Blick wird über Ruhe, Fokusflächen und präzise Kontraste vom Bedarf zur passenden Information geführt.",
    implementation: "Progressive Offenlegung, großzügige Abstände und klar markierte Sprungpunkte nutzen; Bewegung auf Fokuswechsel und Bedienfeedback begrenzen.",
    fallback: "Die Informationshierarchie vollständig statisch und ohne versteckte Inhalte abbilden.",
    industries: ["health", "professional", "generic", "hotel"], layouts: ["minimal", "technical", "luxury", "automatic"],
    minimumAnimation: 0, minimumComplexity: 0, minimumBudget: 0, spatial: "none",
  },
  {
    id: "layered-depth-stacks",
    name: "Gestaffelte Tiefenebenen",
    family: "Composition",
    direction: "Vordergrunddetail, Hauptmotiv und Kontext bewegen sich in unterschiedlicher Tiefe und verbinden Atmosphäre mit Information.",
    implementation: "Zwei bis drei kompositorische Ebenen mit kleinen transform-Distanzen einsetzen; Text bleibt in einer stabilen, kontrastreichen Ebene.",
    fallback: "Die Ebenen als fertige Collage ohne Parallaxen darstellen.",
    industries: ["hotel", "gastro", "beauty", "retail", "professional", "generic"], layouts: ["editorial", "luxury", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "optional",
  },
  {
    id: "aperture-portal-journey",
    name: "Apertur-Portal",
    family: "Journey",
    direction: "Eine reale Öffnung, Kontur oder Schwelle wird zum Übergang in den nächsten Inhalt und macht den Perspektivwechsel thematisch lesbar.",
    implementation: "Fenster, Tür, Werkzeugöffnung oder Produktkontur als CSS-/SVG-Maske verwenden; der Zielzustand muss vor dem Übergang als Text und Fokusziel existieren.",
    fallback: "Die Schwelle als klar beschrifteten Kapiteltrenner mit passendem Standbild zeigen.",
    industries: ["hotel", "professional", "retail", "auto", "generic"], layouts: ["editorial", "luxury", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "gesture-framed-editorial",
    name: "Gestenrahmen",
    family: "Editorial",
    direction: "Hände, Blickrichtungen oder Körperhaltungen rahmen einen Inhalt und führen den Fokus wie eine lebendige, branchenspezifische Bildkante.",
    implementation: "Nur mit echten, freigegebenen Motiven arbeiten; Blick- und Gestenachsen in der Bildkomposition dokumentieren und niemals wichtige Informationen überdecken.",
    fallback: "Die Gestenachse als statische Bildausrichtung und klaren Fokusrahmen beibehalten.",
    industries: ["beauty", "gastro", "retail", "fitness", "hotel"], layouts: ["editorial", "asymmetric", "luxury", "automatic"],
    minimumAnimation: 0, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "interactive-process-diorama",
    name: "Interaktives Prozess-Diorama",
    family: "Spatial",
    direction: "Ein isometrisches Miniaturbild oder eine abstrahierte Prozesswelt zeigt Ort, Stationen und Ergebnis in einer gemeinsamen räumlichen Übersicht.",
    implementation: "SVG oder leichtes 2.5D statt unnötigem Voll-WebGL bevorzugen; Hotspots als echte Buttons mit synchronem Text, URL-Zustand und Tastaturfokus bauen.",
    fallback: "Eine statische Prozesskarte mit nummerierten Stationen und direkt anwählbaren Details verwenden.",
    industries: ["craft", "auto", "professional", "hotel", "generic"], layouts: ["technical", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "motion-token-grammar",
    name: "Einheitliche Motion-Grammatik",
    family: "Motion System",
    direction: "Alle Bewegungen folgen einer kleinen gemeinsamen Sprache aus Dauer, Easing, Distanz, Fokus und Ruhepausen, damit die Website wie ein System wirkt.",
    implementation: "Motion-Tokens zentral definieren, pro Szene nur wenige erlaubte Varianten verwenden und Trigger, Abbruch, Hover, Touch sowie Reduced Motion dokumentieren.",
    fallback: "Dieselbe visuelle Hierarchie ohne automatische Bewegung über Zustände, Kontrast und klare Abstände ausdrücken.",
    industries: ["health", "professional", "craft", "beauty", "fitness", "auto", "gastro", "retail", "hotel", "generic"], layouts: ["minimal", "editorial", "technical", "asymmetric", "luxury", "automatic"],
    minimumAnimation: 0, minimumComplexity: 0, minimumBudget: 0, spatial: "none",
  },
  {
    id: "character-pose-chapters",
    name: "Figuren- und Posenkapitel",
    family: "Character",
    direction: "Eine Person, Figur oder Silhouette wechselt Haltung, Blick und Nähe je Kapitel und trägt damit Stimmung und Produkt-/Leistungsstory.",
    implementation: "Nur mit beauftragten oder lizenzierten Fotos, Illustrationen oder 3D-Modellen; Posewechsel über abgestimmte Frames und nicht über unlesbare Dauerrotation erzählen.",
    fallback: "Eine sequenzielle Galerie mit identischer Kadrierung und sichtbarem Kapitelstatus ausgeben.",
    industries: ["beauty", "fitness", "retail", "hotel", "professional"], layouts: ["editorial", "luxury", "asymmetric", "automatic"],
    minimumAnimation: 2, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "material-world-variants",
    name: "Materialwelt mit Varianten",
    family: "Product",
    direction: "Ein Produkt oder Ergebnis bleibt zentral, während Umgebung, Licht, Farbe und Material passend zu Varianten oder Eigenschaften wechseln.",
    implementation: "Varianten als echte Auswahlzustände mit Preload, Alt-Text und sichtbarer Bezeichnung bauen; Farbwechsel nie als alleinige Information verwenden.",
    fallback: "Varianten in einer stabilen Galerie mit Farb-/Materialchips und vollständigen Labels präsentieren.",
    industries: ["retail", "gastro", "beauty", "auto", "craft"], layouts: ["luxury", "editorial", "minimal", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "product-runway-configurator",
    name: "Produktbühne mit Konfigurator",
    family: "Configurator",
    direction: "Produkte, Looks oder Leistungsvarianten erscheinen auf einer ruhigen virtuellen Bühne; Auswahl verändert den Auftritt, nicht die Bedienlogik.",
    implementation: "Eine zugängliche Variantenauswahl mit synchronisiertem Motiv, Faktenpanel und bewusstem Übergang bauen; Favoriten- und Vergleichszustand anbieten.",
    fallback: "Ein klassischer Produktvergleich mit großen Bildern, Spezifikationen und eindeutigen Auswahlaktionen verwenden.",
    industries: ["retail", "beauty", "auto", "gastro"], layouts: ["editorial", "luxury", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },
  {
    id: "object-interface-match-cut",
    name: "Objekt-zu-Interface-Match-Cut",
    family: "Transformation",
    direction: "Ein reales Objekt oder Detail übernimmt im nächsten Kapitel die Form eines Rahmens, Charts, Buttons oder Inhaltscontainers.",
    implementation: "Gemeinsame Kanten, Proportionen und Blickachsen zwischen Medienobjekt und UI definieren; der semantische Inhalt bleibt unabhängig vom Übergang erreichbar.",
    fallback: "Das Objekt als statisches Icon, Bilddetail oder Kapitelmarker neben der entsprechenden Information platzieren.",
    industries: ["professional", "retail", "gastro", "craft", "auto", "beauty", "generic"], layouts: ["editorial", "technical", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 1, minimumBudget: 0, spatial: "none",
  },
  {
    id: "technical-anatomy-explode",
    name: "Technische Explosionsansicht",
    family: "Explainer",
    direction: "Ein komplexes Objekt wird in wenige benannte Ebenen zerlegt, damit Aufbau, Auswahl oder Qualitätsmerkmal verständlich werden.",
    implementation: "Explosionsabstände und Labels aus echten Bauteilen oder bestätigten Leistungsstufen ableiten; nicht mehr als fünf Ebenen gleichzeitig zeigen.",
    fallback: "Eine statische, nummerierte Schnitt- oder Ebenengrafik mit sichtbarer Legende und Zoomfunktion liefern.",
    industries: ["auto", "craft", "professional", "health", "retail", "gastro"], layouts: ["technical", "minimal", "asymmetric", "automatic"],
    minimumAnimation: 1, minimumComplexity: 2, minimumBudget: 1, spatial: "optional",
  },  {
    "name": "Vom Erlebnis zur Spezifikation",
    "family": "Journey",
    "direction": "Derselbe reale Leistungsgegenstand führt vom Zugang über eine anschauliche Totale zur präzisen Detail- und Faktenansicht. Perspektivwechsel erklären Maßstab und Funktion.",
    "implementation": "Zugang, Totale, Detail und Planansicht in einem gemeinsamen Koordinatensystem vorbereiten. Kapitelzustand und sichtbares HTML-Faktenpanel getrennt halten; Ansichtswechsel unterbrechbar machen. Beim Wechsel in die Planansicht Position und Silhouette des Hauptmotivs halten, Fakten erst nach der Ruhephase ergänzen.",
    "fallback": "Zugang, Hauptmotiv und beschriftete Planansicht als drei unterschiedlich große statische Bildflächen mit vollständigen Fakten zeigen.",
    "industries": [
      "hotel",
      "professional",
      "auto"
    ],
    "spatial": "optional",
    "id": "experience-to-specification",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Frachtstaffel durch Perspektivwechsel",
    "family": "Process",
    "direction": "Ein realer Auftrag oder Werkstoff bleibt als visueller Anker erkennbar, während bestätigte Stationen und verantwortliche Werkzeuge wechseln. Die Staffel erklärt Übergaben statt bloß Fahrzeuge zu zeigen.",
    "implementation": "Den belegten Prozess zunächst als semantische Schrittliste modellieren. Einen persistenten Kern und austauschbare Stationsgruppen verwenden; Übergabepunkt pro Gruppe festlegen. Weltposition beim Wechsel über gemeinsame Anker erhalten. Trägerwechsel und Kameraperspektive nacheinander bewegen, nicht gleichzeitig.",
    "fallback": "Eine ruhige Prozessstaffel mit identisch markiertem Auftrag und drei bis fünf belegten Übergaben zeigen.",
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "spatial": "optional",
    "id": "cargo-handoff-continuity",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Produktwelten mit Rückkehrbühne",
    "family": "Configurator",
    "direction": "Eine gemeinsame Auswahlbühne öffnet je Angebot eine eigene Material-, Licht- und Detailwelt. Zurückkehren stellt die vorherige Auswahlposition wieder her.",
    "implementation": "Zustände overview → entering(itemId) → detail(itemId) → returning → overview modellieren. Index, Fokus und Scrollposition der Ausgangsbühne sichern. Pro Angebot ein eigenständiges Detailarrangement aus freigegebenen Medien definieren; Fakten und Anfrage erhalten die gewählte ID.",
    "fallback": "Zugängliche Angebotsübersicht mit einzelnen Detailabschnitten und eindeutigen Zurück-Links; Wechsel ohne Übergang.",
    "industries": [
      "retail",
      "beauty",
      "auto"
    ],
    "spatial": "optional",
    "id": "return-stage-worlds",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Vom Einzelmotiv zum Ensemble",
    "family": "Product",
    "direction": "Ein nahes fachliches Motiv verdeckt kurz den Szenenwechsel und öffnet danach den nächsten Eintrag; am Ende werden die Angebote als gemeinsam vergleichbare Gesamtauswahl sichtbar.",
    "implementation": "Produktindex und Galerie atomar führen. Eine isolierte Medienebene als Verdeckungsmaske verwenden, Überschrift und Navigation bleiben außerhalb. Vor dem Wechsel Zielmotiv laden; Endansicht zeigt alle tatsächlich verfügbaren Optionen und führt zur Auswahl zurück.",
    "fallback": "Einzelansichten mit festen Abmessungen und direkt sichtbarer Gesamtauswahl; Motive ohne Kamerafahrt oder Maskenwechsel nebeneinander vergleichen.",
    "industries": [
      "gastro",
      "retail",
      "beauty"
    ],
    "spatial": "optional",
    "id": "occlusion-to-ensemble",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Vom Betriebsbild zum Datenbild",
    "family": "Explainer",
    "direction": "Ein echter Arbeitsschauplatz wird einer bewusst abstrahierten technischen Erklärung gegenübergestellt. Dunkle Reportage, präzise Liniengrafik und helle Lesefläche wechseln ihren Informationszweck.",
    "implementation": "Dokumentarisches Bild, abstrahierte Linienfassung und HTML-Erklärung getrennt aufbauen. Motivkontur und Blickachse am Übergang abstimmen; Textkontrast beim Flächenwechsel absichern. Navigation verankert lassen, aktive Sektion aus dem sichtbaren Inhalt ableiten.",
    "fallback": "Reales Bild und gekennzeichnete Schemazeichnung als ruhige Vergleichsfläche, gefolgt von einer hellen Erklärung.",
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "spatial": "none",
    "id": "documentary-wireframe-rhythm",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Von der Schwelle zur Buchung",
    "family": "Story",
    "direction": "Ein kurzer markenspezifischer Auftakt öffnet die Arbeitswelt; danach führen echte Ergebnisse, Leistungen und eine klare Buchung aus der Inszenierung in eine konkrete Handlung.",
    "implementation": "Den Auftakt als optionale Mediensequenz mit sofort erreichbarem Überspringen und CTA bauen. Zustände intro → content → booking getrennt führen; Buchungsdialog erhält Leistungswahl, Fokusfalle, Escape und Rückkehrfokus. Eine beeindruckende Szene darf den Besuch niemals aussperren.",
    "fallback": "Ein charakteristisches Standbild vor direkt sichtbaren Leistungen und einer funktionierenden Terminanfrage.",
    "industries": [
      "beauty",
      "hotel",
      "health",
      "generic"
    ],
    "spatial": "none",
    "id": "threshold-to-booking",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Malerische Kapitel mit Motivbrücke",
    "family": "Editorial",
    "direction": "Ein eigenes Leitobjekt trägt mindestens drei fachlich sinnvolle Handlungen: etwa teilen, verbinden, prüfen oder einsetzen. Eine Oberfläche des Objekts übernimmt den Bildraum und wird zum Träger der nächsten Erklärung.",
    "implementation": "Ein Leitmotiv über fotografische, gemalte und reduzierte Darstellungen hinweg wiedererkennbar halten. Gemeinsame Formkante für den Medienwechsel definieren; semantischen Text außerhalb dekorativer Masken halten. Papierstruktur als leichte Hintergrunddatei statt schwerer Canvas-Simulation verwenden. Vor dem Bildbau drei aus echten Leistungen abgeleitete Verben und die Aussage jedes Kapitels festlegen. Ein Arbeitsdokument oder Materialdetail wird flächenfüllend und öffnet danach eine gerahmte Übersicht; keine beliebigen fliegenden Dekorationen.",
    "fallback": "Malerische Kapitel als statische, abwechslungsreiche Doppelseiten mit wiederkehrendem Detail und lesbaren Fakten.",
    "industries": [
      "gastro",
      "hotel",
      "retail",
      "craft"
    ],
    "spatial": "none",
    "id": "painterly-medium-bridge",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Produkt als Merkmal-Beleg",
    "family": "Configurator",
    "direction": "Ein ausgewähltes Produkt bleibt der räumliche Anker. Für jede belegbare Eigenschaft dreht oder kadriert sich genau die passende Detailansicht in den Blick; das Objekt selbst trägt die Erklärung.",
    "implementation": "selectedProductId und activeFeatureId getrennt führen. Je bestätigtem Merkmal eine passende Ansicht, Detailmarkierung und HTML-Aussage hinterlegen; keine Eigenschaften erfinden. Produktform, Material und Identität bleiben beim Wechsel konstant. Die Auswahl und die Detailansichten sind über beschriftete Buttons bedienbar; keine automatische Merkmalswahl.",
    "fallback": "Produktübersicht und auswählbare statische Detailausschnitte mit passenden Beschriftungen; Merkmalliste und Anfrage vollständig zugänglich halten.",
    "industries": [
      "gastro",
      "retail",
      "fitness",
      "beauty"
    ],
    "spatial": "optional",
    "id": "ingredient-carousel-continuity",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
  {
    "name": "Von der Arbeitsstation zum Netzwerk",
    "family": "Spatial",
    "direction": "Eine klar lesbare Miniaturwelt wechselt vom Gesamtzusammenhang zu einer Arbeitsstation und wieder zum Netzwerk. Der Maßstabswechsel erklärt Zuständigkeiten und Verbindungen.",
    "implementation": "Belegte Stationen als getrennte, beschriftete Gruppen anlegen. Übersicht und Stationsansichten mit festem Kameraziel definieren; nur eine Szene gleichzeitig aktiv rendern. Hotspots haben zugängliche HTML-Pendants. Detailtexte und anschließender normaler Seiteninhalt liegen außerhalb der 3D-Fläche.",
    "fallback": "Isometrische Standgrafik mit nummerierten Stationen und direkt erreichbaren HTML-Abschnitten; ohne 3D oder Kamera vollständig verständlich.",
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "spatial": "optional",
    "id": "isometric-network-scale",
    "layouts": [
      "automatic",
      "editorial",
      "asymmetric",
      "technical",
      "luxury"
    ],
    "minimumAnimation": 0,
    "minimumComplexity": 1,
    "minimumBudget": 0
  },
];

function normalize(value: string) { return value.toLocaleLowerCase("de-DE").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function hash(value: string) { let result = 2166136261; for (let i = 0; i < value.length; i += 1) { result ^= value.charCodeAt(i); result = Math.imul(result, 16777619); } return result >>> 0; }
function pick<T>(items: T[], seed: number, salt: string) { return items[hash(`${seed}:${salt}`) % items.length]; }
function unique(values: Array<string | null | undefined>) { return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]; }

function industryKey(business: Business) {
  if (PROFILES[business.categoryKey]) return business.categoryKey;
  const value = normalize(`${business.categoryKey} ${business.category}`);
  if (/(restaurant|cafe|bar|imbiss|backer|gastro)/.test(value)) return "gastro";
  if (/(friseur|barber|beauty|kosmetik|tattoo|spa)/.test(value)) return "beauty";
  if (/(handwerk|bau|elektr|sanitar|maler|schreiner|dach)/.test(value)) return "craft";
  if (/(arzt|praxis|gesund|therap|physio|zahn|pflege)/.test(value)) return "health";
  if (/(fitness|sport|gym|yoga)/.test(value)) return "fitness";
  if (/(auto|kfz|werkstatt|reifen)/.test(value)) return "auto";
  if (/(hotel|pension|unterkunft|ferien)/.test(value)) return "hotel";
  if (/(shop|handel|laden|mode|boutique)/.test(value)) return "retail";
  if (/(beratung|anwalt|steuer|immobil|architekt|agentur|finanz|buro)/.test(value)) return "professional";
  return "generic";
}

function cinematicTopic(business: Business) { return /(architekt|immobil|luxus|interior|design|kunst|museum|event|film|hotel)/.test(normalize(`${business.category} ${business.name}`)); }
function redesignStatus(business: Business) { return ["exists", "outdated", "unreachable"].includes(business.websiteStatus); }
export function recommendMasterPromptMode(business: Business): MasterPromptMode { return redesignStatus(business) ? "redesign" : "new-website"; }

export function recommendMasterPromptSettings(business: Business) {
  const item = PROFILES[industryKey(business)] ?? PROFILES.generic;
  const settings: MasterPromptSettings = { ...DEFAULT_MASTER_PROMPT_SETTINGS, ...item.defaults, imagery: business.imageUrl ? "company" : "mixed" };
  const reasons = [`Die Branche profitiert von ${item.theme.toLocaleLowerCase("de-DE")}.`, redesignStatus(business) ? "Der vorhandene Auftritt sollte gezielt verbessert werden." : "Ein vollständiger digitaler Auftritt ist die passende Grundlage."];
  if (cinematicTopic(business)) {
    Object.assign(settings, { creativity: "extraordinary", complexity: "high-end", animation: "cinematic", scrollMotion: "immersive", spatialEffects: "hero", transitions: "dynamic", budget: "premium" });
    reasons.push("Das Thema eignet sich für eine hochwertige cinematische Inszenierung.");
  }
  if (!business.imageUrl) reasons.push("Die Bildstrategie benötigt noch rechtssichere Quellen.");
  return { settings, reasons };
}

export function normalizeMasterPromptSettings(business: Business, overrides: Partial<MasterPromptSettings> = {}): MasterPromptSettings {
  const recommended = recommendMasterPromptSettings(business).settings;
  return {
    ...DEFAULT_MASTER_PROMPT_SETTINGS,
    ...recommended,
    ...overrides,
    customInstructions: overrides.customInstructions?.trim().slice(0, 4000) ?? "",
  };
}

function collectFacts(input: MasterPromptInput) {
  const { business, research } = input;
  const lead = business as Business & Partial<Pick<StoredLead, "notes" | "status">>;
  const facts: Array<MasterPromptFact | null> = [
    { key: "name", label: "Unternehmen", value: business.name, source: business.source },
    { key: "category", label: "Branche", value: business.category, source: business.source },
    business.address ? { key: "address", label: "Standort", value: business.address, source: business.source } : null,
    business.phone ? { key: "phone", label: "Telefon", value: business.phone, source: business.source } : null,
    business.email ? { key: "email", label: "E-Mail", value: business.email, source: business.source } : null,
    business.website ? { key: "website", label: "Website", value: business.website, source: business.source } : null,
    business.openingHours ? { key: "openingHours", label: "Öffnungszeiten", value: business.openingHours, source: business.source } : null,
    business.socialUrl ? { key: "social", label: "Social Media", value: business.socialUrl, source: business.source } : null,
    lead.status ? { key: "leadStatus", label: "Lead-Status", value: lead.status, source: "WebWorkBalance" } : null,
    lead.notes?.trim() ? { key: "leadNotes", label: "Lead-Notizen", value: lead.notes.trim(), source: "Team" } : null,
    research?.summary?.trim() ? { key: "summary", label: "Recherche", value: research.summary.trim(), source: "Recherche" } : null,
    research?.services?.length ? { key: "services", label: "Leistungen", value: unique(research.services).join(", "), source: "Recherche" } : null,
    research?.targetAudiences?.length ? { key: "audience", label: "Zielgruppen", value: unique(research.targetAudiences).join(", "), source: "Recherche" } : null,
    research?.differentiators?.length ? { key: "usp", label: "Besonderheiten", value: unique(research.differentiators).join(", "), source: "Recherche" } : null,
    research?.contactPerson?.trim() ? { key: "contact", label: "Ansprechpartner", value: research.contactPerson.trim(), source: "Recherche" } : null,
  ];
  const available = facts.filter((fact): fact is MasterPromptFact => Boolean(fact));
  const known = new Set(available.map((fact) => fact.key));
  const missing: MissingMasterPromptFact[] = [
    ["address", "Standort", "[STANDORT PRÜFEN]", "Local SEO und Anfahrt"], ["phone", "Telefon", "[TELEFON PRÜFEN]", "direkten Kontakt"],
    ["email", "E-Mail", "[E-MAIL PRÜFEN]", "Kontaktformulare"], ["openingHours", "Öffnungszeiten", "[ÖFFNUNGSZEITEN PRÜFEN]", "lokale Besucher"],
    ["services", "bestätigte Leistungen", "[LEISTUNGEN MIT KUNDEN KLÄREN]", "korrekte Inhalte"], ["audience", "bestätigte Zielgruppe", "[ZIELGRUPPE VALIDIEREN]", "Tonalität und Conversion"],
    ["usp", "echte Alleinstellungsmerkmale", "[USP IM ERSTGESPRÄCH ERHEBEN]", "ein glaubwürdiges Nutzenversprechen"], ["contact", "Ansprechpartner", "[ANSPRECHPARTNER RECHERCHIEREN]", "persönliche Akquise"],
  ].map(([key, label, placeholder, reason]) => ({ key, label, placeholder, reason })).filter((fact) => !known.has(fact.key));
  if (!business.imageUrl && !(research?.evidence ?? []).some((item) => item.usage === "visual-reference")) missing.push({ key: "images", label: "nutzbare Bildquellen", placeholder: "[BILDER UND RECHTE KLÄREN]", reason: "eine individuelle Bildsprache" });
  return { available, missing };
}

export function createDesignFingerprint(input: Pick<MasterPromptInput, "business" | "mode" | "settings" | "variant" | "research">): DesignFingerprint {
  const recommended = recommendMasterPromptSettings(input.business).settings;
  const settings = { ...recommended, ...input.settings };
  const context = companyDesignContext(input.business, input.research);
  const mode = input.mode ?? recommendMasterPromptMode(input.business);
  const item = PROFILES[industryKey(input.business)] ?? PROFILES.generic;
  const seed = hash([
    REFERENCE_METHOD_VERSION, input.business.sourceId, input.business.name, input.business.address, mode, input.variant ?? 0,
    settings.creativity, settings.complexity, settings.animation, settings.layout,
    settings.experienceArchetype, settings.storyStructure, settings.interactionDensity,
    settings.typographyMotion, settings.assetDirection, settings.brandTone,
    settings.spatialEffects, settings.scrollMotion, settings.technology, settings.mobilePriority,
    settings.conversionGoal, settings.budget, settings.customInstructions, settings.referenceStyle, settings.websiteGame, context.seedMaterial,
  ].join("|"));
  return { id: `WWB-${seed.toString(36).toUpperCase().padStart(7, "0")}`, seed, theme: item.theme, concept: `${pick(item.concepts, seed, "concept")} · ${context.focus}`, composition: settings.layout === "automatic" ? pick(COMPOSITIONS, seed, "composition") : `${settings.layout}: ${pick(COMPOSITIONS, seed, "composition")}`, hero: settings.animation === "none" ? `Statische Leitkomposition zu ${context.focus}` : `${pick(HEROS, seed, "hero")} – ${context.focus}`, palette: pick(item.palettes, seed, "palette"), typography: pick(TYPOGRAPHY, seed, "type"), imagery: `${pick(IMAGERY, seed, "image")} für ${context.focus}`, motion: settings.animation === "none" ? "nur unmittelbares Bedienfeedback" : `${pick(item.motions, seed, "motion")} (${settings.animation}, ${settings.scrollMotion})`, rhythm: pick(RHYTHMS, seed, "rhythm"), structure: pageStructureFor(input.business, settings, seed, context.focus).name };
}

export function fingerprintStyleValues(fingerprint: DesignFingerprint) {
  // Strip company suffixes: renamed firms must not make identical styles look different.
  return [fingerprint.composition, fingerprint.hero.split(" – ")[0].replace(/Statische Leitkomposition zu .*/, "Statische Leitkomposition"), fingerprint.typography, fingerprint.imagery.split(" für ")[0], fingerprint.rhythm, fingerprint.structure ?? ""];
}

export function fingerprintStyleKey(fingerprint: DesignFingerprint) {
  return `STYLE-${hash(fingerprintStyleValues(fingerprint).join("|" )).toString(36).toUpperCase()}`;
}

export function countStyleDifferences(left: DesignFingerprint, right: DesignFingerprint) {
  return fingerprintStyleValues(left).filter((value, index) => value !== fingerprintStyleValues(right)[index]).length;
}

const FINGERPRINT_DIMENSIONS: Array<keyof Pick<DesignFingerprint, "theme" | "concept" | "composition" | "hero" | "palette" | "typography" | "imagery" | "motion" | "rhythm">> = [
  "theme",
  "concept",
  "composition",
  "hero",
  "palette",
  "typography",
  "imagery",
  "motion",
  "rhythm",
];

function wordSet(value: string) {
  return new Set(normalize(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}

function textSimilarity(left: string, right: string) {
  if (left === right) return 1;
  const a = wordSet(left);
  const b = wordSet(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((word) => b.has(word)).length;
  return overlap / new Set([...a, ...b]).size;
}

export function compareDesignFingerprints(left: DesignFingerprint, right: DesignFingerprint) {
  const weights: Record<(typeof FINGERPRINT_DIMENSIONS)[number], number> = {
    theme: 0.06,
    concept: 0.19,
    composition: 0.16,
    hero: 0.16,
    palette: 0.1,
    typography: 0.08,
    imagery: 0.09,
    motion: 0.08,
    rhythm: 0.08,
  };
  const similarity = FINGERPRINT_DIMENSIONS.reduce((sum, key) => sum + textSimilarity(left[key], right[key]) * weights[key], 0);
  return Math.max(0, Math.min(1, Number(similarity.toFixed(6))));
}

export function assessFingerprintOriginality(fingerprint: DesignFingerprint, existing: DesignFingerprint[]): FingerprintOriginality {
  if (!existing.length) return { score: 100, highestSimilarity: 0, comparedWith: null, distinctDimensions: [...FINGERPRINT_DIMENSIONS] };
  const comparisons = existing.map((candidate) => ({ candidate, similarity: compareDesignFingerprints(fingerprint, candidate) }));
  comparisons.sort((a, b) => b.similarity - a.similarity);
  const closest = comparisons[0];
  return {
    score: Math.max(0, Math.round((1 - closest.similarity) * 100)),
    highestSimilarity: closest.similarity,
    comparedWith: closest.candidate.id,
    distinctDimensions: FINGERPRINT_DIMENSIONS.filter((key) => textSimilarity(fingerprint[key], closest.candidate[key]) < 0.5),
  };
}

export function generateDistinctMasterPrompt(
  input: MasterPromptInput,
  existing: DesignFingerprint[],
  minimumOriginality = 45,
): { result: MasterPromptResult; variant: number; originality: FingerprintOriginality } {
  const startVariant = Math.max(0, input.variant ?? 0);
  let bestResult = generateMasterPrompt({ ...input, variant: startVariant });
  let bestVariant = startVariant;
  let bestOriginality = assessFingerprintOriginality(bestResult.fingerprint, existing);
  const differences = (fingerprint: DesignFingerprint) => existing.length ? Math.min(...existing.map((other) => countStyleDifferences(fingerprint, other))) : 6;
  let bestDifferences = differences(bestResult.fingerprint);
  for (let attempt = 1; attempt <= 64 && (bestOriginality.score < minimumOriginality || bestDifferences < 3); attempt += 1) {
    const candidateVariant = startVariant + attempt;
    const candidateResult = generateMasterPrompt({ ...input, variant: candidateVariant });
    const candidateOriginality = assessFingerprintOriginality(candidateResult.fingerprint, existing);
    const candidateDifferences = differences(candidateResult.fingerprint);
    if (Math.min(candidateDifferences, 3) > Math.min(bestDifferences, 3) || (Math.min(candidateDifferences, 3) === Math.min(bestDifferences, 3) && candidateOriginality.score > bestOriginality.score)) {
      bestResult = candidateResult;
      bestVariant = candidateVariant;
      bestOriginality = candidateOriginality;
      bestDifferences = candidateDifferences;
    }
  }
  if (bestDifferences < 3) bestResult.warnings.unshift("Mit den gewählten Leitplanken wurden keine drei Stilunterschiede zu allen Vergleichsentwürfen erreicht. Layout oder Erlebnis-Archetyp ändern und erneut vergleichen.");
  return { result: bestResult, variant: bestVariant, originality: bestOriginality };
}

function mission(mode: MasterPromptMode) {
  return { "new-website": "Entwickle einen vollständigen neuen Webauftritt von Positionierung bis Produktionsplan.", redesign: "Entwickle einen belegbaren Relaunch, der reale Schwächen löst und funktionierende Bestandteile bewahrt.", acquisition: "Entwickle ehrliche Akquise, Demo-Idee, Kontakttexte und Preisargumentation, ohne fertige Arbeit vorzutäuschen.", complete: "Verbinde Recherche, Positionierung, Website-Konzept, Produktionsbriefing, Akquise und Angebot." }[mode];
}

function movementRules(settings: MasterPromptSettings) {
  const animation = { none: "keine dekorative Bewegung", subtle: "dezente Mikrointeraktionen", dynamic: "deutliche, inhaltlich begründete Bewegung", cinematic: "choreografierte cinematische Szenen" }[settings.animation];
  const scroll = { off: "kein scrollgebundenes Storytelling", light: "leichte Scroll-Reveals", storytelling: "Scrollen führt durch eine Geschichte", immersive: "Scrollen steuert Szenen und Kamerawirkung" }[settings.scrollMotion];
  const spatial = { off: "keine räumlichen Effekte, kein WebGL", accent: "höchstens ein räumlicher Akzent", hero: "eine räumliche Hero-Szene", experience: "räumliches Gesamterlebnis mit Fallback" }[settings.spatialEffects];
  const mobile = { speed: "schwere Effekte mobil ersetzen", balanced: "Wirkung und Geschwindigkeit ausbalancieren", "full-effects": "Effekte mobil erhalten und Speicher, Touch sowie Wärme absichern" }[settings.mobilePriority];
  return settings.animation === "none" ? "keine dekorative Bewegung; keine Scroll-Animation; statische Komposition; sofort lesbarer Endzustand" : `${animation}; ${scroll}; ${spatial}; ${mobile}`;
}

const ANIMATION_RANK: Record<AnimationLevel, number> = { none: 0, subtle: 1, dynamic: 2, cinematic: 3 };
const COMPLEXITY_RANK: Record<ComplexityLevel, number> = { simple: 0, professional: 1, complex: 2, "high-end": 3 };
const BUDGET_RANK: Record<BudgetTier, number> = { small: 0, medium: 1, premium: 2, open: 3 };

function creativeMetaphorFor(business: Business, seed: number) {
  const category = normalize(`${business.category} ${business.name}`);
  if (/(architekt|immobil|interior|raum|bauplanung)/.test(category)) {
    return pick([
      "Aus Linie, Licht und Perspektive entsteht Schritt für Schritt ein bewohnbarer Gedanke",
      "Der Blick reist vom Ort über den Entwurf bis in den erlebbaren Raum",
      "Ein Grundriss öffnet sich zur räumlichen Geschichte von Idee, Präzision und Nutzung",
    ], seed, "architecture-metaphor");
  }
  const metaphors: Record<string, string[]> = {
    gastro: ["Von Herkunft und Zutat führt die Geschichte bis zum fertigen Genussmoment", "Ein Signature-Detail wird zum roten Faden vom ersten Appetit bis zur Reservierung", "Textur, Hitze und Handgriff verdichten sich zu einem unverwechselbaren Gastgebermoment"],
    beauty: ["Aus Kontur, Textur und Handwerk entsteht sichtbar der persönliche Ausdruck", "Die Website führt von der individuellen Ausgangslage über Präzision zur selbstbewussten Wirkung", "Ein feines Materialmotiv verwandelt sich mit jedem Schritt in das gewünschte Ergebnis"],
    craft: ["Rohmaterial, Handgriff und Maß fügen sich sichtbar zum belastbaren Ergebnis", "Eine präzise Arbeitslinie führt vom Problem über den Prozess zum fertigen Projekt", "Die Konstruktion der Website folgt der Konstruktion echter Qualität"],
    health: ["Aus Unsicherheit wird über klare Schritte verständliche Orientierung", "Ein ruhiger Fokus führt vom Anliegen zu Vertrauen und einer sicheren nächsten Handlung", "Kompetenz wird nicht behauptet, sondern als nachvollziehbarer Behandlungsweg sichtbar"],
    professional: ["Komplexe Fragen ordnen sich zu einer klaren, belastbaren Entscheidung", "Ein unscharfes Problem gewinnt durch Methode Kontur und wird zur konkreten Lösung", "Expertise funktioniert wie ein Navigationssystem vom Risiko zur verlässlichen Handlung"],
    fitness: ["Energie verdichtet sich über messbare Etappen zu sichtbarem Fortschritt", "Jede Bewegung setzt eine neue Entwicklungsstufe frei und führt zum ersten Training", "Aus einem ersten Impuls entsteht ein klarer Rhythmus für nachhaltige Leistung"],
    auto: ["Vom ersten Signal führt eine technische Spur über Diagnose und Arbeit zurück zur sicheren Fahrt", "Bauteile, Daten und Handgriffe greifen wie ein präzises System ineinander", "Leistung wird zerlegt, verständlich gemacht und als Sicherheit wieder zusammengesetzt"],
    hotel: ["Die Anreise verwandelt sich vom ersten Blick auf den Ort in das Gefühl des Angekommenseins", "Licht, Landschaft und Raum öffnen nacheinander die Vorfreude auf den Aufenthalt", "Eine ruhige Kamerareise verbindet Umgebung, Atmosphäre und persönlichen Rückzugsraum"],
    retail: ["Aus dem ersten Entdecken wird über Detail und Beratung ein persönlicher Favorit", "Ein charakteristisches Produktdetail führt durch Auswahl, Qualität und lokale Nähe", "Die Kollektion entfaltet sich wie ein kuratierter Fund statt wie ein austauschbarer Katalog"],
    generic: ["Lokale Nähe wird über echte Arbeit, sichtbare Belege und einen klaren nächsten Schritt erlebbar", "Ein Detail aus dem Arbeitsalltag verbindet Bedarf, Lösung und persönliches Vertrauen", "Die tägliche Arbeit wird zur individuellen Geschichte vom ersten Problem bis zum Ergebnis"],
  };
  return pick(metaphors[industryKey(business)] ?? metaphors.generic, seed, "business-metaphor");
}

// Versioned, repository-backed methods survive chat context and device resets.
// Count only individually documented video studies; reuploads are not new originals.
export const REFERENCE_METHOD_VERSION = "wwb-motion-4";
export const MAX_MASTER_PROMPT_LENGTH = 80_000;
export interface VideoStyleStandard {
  id: Exclude<ReferenceStyle, "automatic">; name: string; file: string; observed: string; style: string;
  sections: string[]; methods: string[]; industries: string[]; workflow: string; limit: string;
  signatureMethod?: string;
  assetPlan?: string[];
  checkpoints?: string[];
  variants?: Array<{ name: string; sections: string[]; composition: string }>;
}
export const VIDEO_STYLE_STANDARDS: VideoStyleStandard[] = [
  {
    "id": "fashion-dossier",
    "name": "Material- und Identitätsdossier",
    "file": "0e8f1c933a044b998afe7e29367402f5.MP4",
    "observed": "0–4.8s Kollektion; 5.9–9.5s Material-Makro; 10.7–13.1s Portrait; 14.2–17.8s Spezifikation.",
    "style": "Kapitelziffern als Gerüst; Totale, Makro, Portrait und Einzelmotiv bewusst abwechseln. Keine gleichförmigen Kartenkapitel.",
    "sections": [
      "Arbeitswelt / Kollektion",
      "Material und Qualität im Detail",
      "Menschen / Identität",
      "Konkretes Angebot mit Spezifikation",
      "Anfrage"
    ],
    "methods": [
      "editorial-anchor-object",
      "material-to-result-morph",
      "character-pose-chapters",
      "technical-anatomy-explode"
    ],
    "industries": [
      "beauty",
      "retail",
      "craft",
      "professional"
    ],
    "workflow": "Ein reales Motiv in drei Maßstäben planen. Erst Satzspiegel und Bildkonsistenz sichern, dann Übergänge entlang der Kapitelkanten bauen.",
    "limit": "Live-3D oder Bildsequenz ist nicht belegbar."
  },
  {
    "id": "surreal-journey",
    "name": "Surreale Bedeutungsreise",
    "file": "5e0118a1974a4890bc962c8fe578b8fd.MP4",
    "observed": "0–3.5s Prämisse; 4.6–9.3s Hände und Landschaft; 10.4–13.9s roter Bruch; 15–17.4s Umdeutung.",
    "style": "Ein wiederkehrendes Symbol verbindet gegensätzliche Farb- und Raumwelten. Jedes Kapitel erklärt etwas Neues; die Hauptaktion bleibt erreichbar.",
    "sections": [
      "Kundenanliegen / Prämisse",
      "Begegnung mit der Leistung",
      "Problem sichtbar umdeuten",
      "Lösung im konkreten Kontext",
      "Einladung zur Handlung"
    ],
    "methods": [
      "gesture-framed-editorial",
      "cinematic-tonal-chapters",
      "aperture-portal-journey",
      "spatial-world-portals"
    ],
    "industries": [
      "professional",
      "fitness",
      "beauty",
      "generic"
    ],
    "workflow": "Je Kapitel Aussage, Symbol und Kontrast skizzieren. Erst drei Endbilder, dann passende Übergänge und einen stabilen CTA bauen.",
    "limit": "Exakte Scroll-Zuordnung und Renderer unbestätigt."
  },
  {
    "id": "monumental-hero",
    "name": "Monumentaler Markenauftakt",
    "file": "5e27ca8d06e94a2eb7fa9f8a13f4a2e4.MP4",
    "observed": "0–0.9s Emblem und Raum; 1.7–4.3s große Serifenschrift; 4.3–11.1s Annäherung an eine Skulptur.",
    "style": "Ein fachlich passendes Hauptmotiv, bewusstes Licht und Negativraum; wenige starke Textpositionen. Keine Standardstatue für jede Firma.",
    "sections": [
      "Leitmotiv und klare Leistung",
      "Annäherung an das fachliche Detail",
      "Belegbarer Kontext",
      "Leistung verständlich erklären",
      "Persönliche Anfrage"
    ],
    "methods": [
      "architectural-camera-portal",
      "editorial-anchor-object",
      "guided-focus-lens"
    ],
    "industries": [
      "hotel",
      "professional",
      "retail"
    ],
    "workflow": "Zuerst einen Hero-Keyframe mit Licht und freier Textzone ausarbeiten, dann eine kurze Annäherung prüfen. Die vollständige Inhaltsseite eigenständig ergänzen.",
    "limit": "Nur Hero beobachtet; spätere Abschnitte sind ein neuer Entwurf."
  },
  {
    "id": "villa-editorial",
    "name": "Ankunft und Raumreportage",
    "file": "9696926585cc494fb895cfdc86af7554.MP4",
    "observed": "0–9.4s Ankunft bis Interieur; 10.7–18.7s Bildreportage und Details; 20–21.4s Abschluss.",
    "style": "Identität des Ortes und Licht halten; nach dem immersiven Auftakt Ruheflächen und asymmetrische Bildgrößen.",
    "sections": [
      "Ankommen am echten Ort",
      "Raum / Arbeitswelt erleben",
      "Philosophie und Arbeitsweise",
      "Leistung und konkrete Details",
      "Einladung zum Besuch"
    ],
    "methods": [
      "architectural-camera-portal",
      "layered-depth-stacks",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "hotel",
      "professional",
      "gastro",
      "beauty"
    ],
    "workflow": "Außenraum, Innenraum und Nahaufnahme derselben Realität abstimmen. Den Übergang von Vollbild zu ruhiger Editorial-Fläche zuerst bauen.",
    "limit": "Keine Performance, Originaltechnik oder mobile Umsetzung bewiesen."
  },
  {
    "id": "showroom",
    "name": "Auswahl in einer gemeinsamen Bühne",
    "file": "cf9d4d523a34481c8b109e2a31912c4f.MP4",
    "observed": "2.6–10.4s Fahrzeugwechsel mit Namen und Daten; 11.3–12.5s Kalender und Reservierungsübersicht.",
    "style": "Auswahl statt gewöhnlicher Landingpage: Motiv, Titel und Fakten bilden einen gemeinsamen Zustand.",
    "sections": [
      "Angebote überblicken",
      "Variante auf der Bühne auswählen",
      "Fakten und Details",
      "Anfrage / Termin wählen",
      "Auswahl prüfen"
    ],
    "methods": [
      "product-runway-configurator",
      "motion-catalog-counter",
      "product-orbit-selector"
    ],
    "industries": [
      "auto",
      "retail",
      "hotel"
    ],
    "workflow": "Zuerst Auswahlzustand, Faktenpanel und Anfrageübergabe bauen. Danach Bühne ergänzen; Wechsel aktualisiert alle abhängigen Werte atomar.",
    "limit": "Die sichtbare Reservierungsmaske belegt keinen Buchungsbackend."
  },
  {
    "id": "flavor-selector",
    "name": "Synchronisierte Produktwelt",
    "file": "d750f231f48345299f29076b928fd2b2.MP4",
    "observed": "0–7.2s Sortenwechsel; 9–26.9s Figma-Layer und Varianten; 29.5s Smart animate / Gentle / 2400ms.",
    "style": "Produkt, Begleitobjekte, Text und Farbwelt wechseln aus einem Auswahlzustand; Ebenenrollen bleiben konstant.",
    "sections": [
      "Variante auswählen",
      "Produktwelt koordiniert enthüllen",
      "Zutaten / Eigenschaften prüfen",
      "Anfrage oder Kaufaktion"
    ],
    "methods": [
      "material-world-variants",
      "product-assembly-story",
      "product-runway-configurator"
    ],
    "industries": [
      "gastro",
      "retail",
      "beauty"
    ],
    "workflow": "Layerrollen benennen, einen vollständigen Zustand bauen, daraus Varianten mit echten Daten erzeugen. Zielassets vorladen, Übergänge unterbrechbar halten.",
    "limit": "2400ms ist ein Figma-Prototypwert, keine Pflichtdauer; kein fertiger Web-Build gezeigt."
  },
  {
    "id": "campaign-commerce",
    "name": "Kampagne, Sortiment und Geschichte",
    "file": "daa25dfdcd444b519fb918e585387609.MP4",
    "observed": "0–4.5s Aufzug und Person; 5.6–9s Produktcollage; 10.1–12.4s Sortiment; 13.5–16.9s Portrait und Abschluss.",
    "style": "Ein Anfangsereignis führt von Atmosphäre zu Sortiment, dann zur Geschichte. Mindestens drei unterschiedliche Abschnittskompositionen.",
    "sections": [
      "Markenereignis mit Nutzen",
      "Haltung über eine motivbezogene Collage",
      "Angebote konkret auswählen",
      "Menschen / Anwendungsgeschichte",
      "Schlussmotiv und Handlung"
    ],
    "methods": [
      "character-pose-chapters",
      "kinetic-type-performance",
      "editorial-anchor-object",
      "motion-catalog-counter"
    ],
    "industries": [
      "retail",
      "fitness",
      "beauty",
      "craft"
    ],
    "workflow": "Kampagnenmotiv und Produkte auf Konsistenz prüfen; Collage, nutzbares Raster und Story-Split einzeln gestalten, dann über Motivdetails verbinden.",
    "limit": "Ein hochkant gefilmter Desktop belegt keine mobile Website."
  },
  {
    "id": "experience-specification",
    "name": "Vom Erlebnis zur Spezifikation",
    "file": "-8919957103071095100(1).MP4",
    "observed": "0–2.5s Fensteröffnung und Portal; 4.25–7.5s Produktansicht wird zur technischen Übersicht; 7.75–10.83s Service und Reichweite.",
    "style": "Ein Gegenstand verbindet emotionale Annäherung, Proportion und belastbare Information; der Wechsel von Atmosphäre zu Spezifikation ist das eigentliche Signature-Detail.",
    "sections": [
      "Zugang zur konkreten Leistung",
      "Hauptmotiv im Zusammenhang",
      "Detail und Nutzen",
      "Beschriftete Planansicht / belegte Fakten",
      "Persönliche Beratung"
    ],
    "methods": [
      "experience-to-specification",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "hotel",
      "professional",
      "auto"
    ],
    "workflow": "Zugang, Totale, Detail und Planansicht in einem gemeinsamen Koordinatensystem vorbereiten. Kapitelzustand und sichtbares HTML-Faktenpanel getrennt halten; Ansichtswechsel unterbrechbar machen. Beim Wechsel in die Planansicht Position und Silhouette des Hauptmotivs halten, Fakten erst nach der Ruhephase ergänzen.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "experience-to-specification",
    "assetPlan": [
      "Dasselbe bestätigte Motiv als Totale, Detail und Planansicht vorbereiten; Perspektive, Maße und Licht nachvollziehbar halten.",
      "Zugangsrahmen und Motiv getrennt liefern; Flugzeug oder Luxuskabine nur bei echtem Branchenbezug verwenden."
    ],
    "checkpoints": [
      "Beim Übergang bleibt die Motividentität erhalten; das Faktenpanel ist unabhängig von Canvas lesbar.",
      "Kamera ist ohne Roll, Zurückscrollen stabil; keine aus dem Video übernommenen Produktdaten."
    ],
    "variants": [
      {
        "name": "Erlebnis zuerst",
        "sections": [
          "Zugang zur konkreten Leistung",
          "Hauptmotiv im Zusammenhang",
          "Detail und Nutzen",
          "Beschriftete Planansicht / belegte Fakten",
          "Persönliche Beratung"
        ],
        "composition": "Großes Zugangsbild, danach freigestelltes Hauptmotiv; Fakten als seitliches Dossier statt Kartenraster."
      },
      {
        "name": "Detail zuerst",
        "sections": [
          "Ein belegbares Qualitätsdetail",
          "Leistung im Überblick",
          "Arbeitswelt und Herkunft",
          "Direkter Vergleich wichtiger Fakten",
          "Gezielte Anfrage"
        ],
        "composition": "Asymmetrische Detail-Totale-Doppelseite; Faktenliste als ruhige Mitte, Raumbild erst vor der Anfrage."
      }
    ]
  },
  {
    "id": "cargo-relay",
    "name": "Frachtstaffel durch Perspektivwechsel",
    "file": "-7801457148905485753(1).MP4",
    "observed": "0–2.25s Leuchtring und Flächenwechsel; 3–5.5s Containerübergabe und Lkw; 5.5–9s Draufsichtstraße und Schiff; 9.5–10.6s Belege.",
    "style": "Objektkontinuität verbindet unterschiedliche Transport- oder Arbeitswelten. Hoher, seitlicher und naher Blick wechseln aus fachlichem Grund.",
    "sections": [
      "Auftrag oder Material vorstellen",
      "Erste bestätigte Station",
      "Übergaben im Zusammenhang",
      "Reichweite mit belegbaren Daten",
      "Projekt / Transport anfragen"
    ],
    "methods": [
      "cargo-handoff-continuity",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "workflow": "Den belegten Prozess zunächst als semantische Schrittliste modellieren. Einen persistenten Kern und austauschbare Stationsgruppen verwenden; Übergabepunkt pro Gruppe festlegen. Weltposition beim Wechsel über gemeinsame Anker erhalten. Trägerwechsel und Kameraperspektive nacheinander bewegen, nicht gleichzeitig.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "cargo-handoff-continuity",
    "assetPlan": [
      "Kernobjekt, Stationsgruppen und Übergabeanker mit konstanten Abmessungen und Materialkennung liefern.",
      "Nur tatsächlich angebotene Prozessschritte und Regionen verwenden; bei anderen Branchen Auftrag, Werkstück oder Akte statt Container wählen."
    ],
    "checkpoints": [
      "Bei Rückwärtsbewegung bleibt der Kern an derselben Übergabestelle; keine Teleport-Sprünge.",
      "Die Prozessliste funktioniert bei fehlenden Modellen und ausgeschalteter Bewegung vollständig."
    ],
    "variants": [
      {
        "name": "Auftrag auf Reise",
        "sections": [
          "Auftrag oder Material vorstellen",
          "Erste bestätigte Station",
          "Übergaben im Zusammenhang",
          "Reichweite mit belegbaren Daten",
          "Projekt / Transport anfragen"
        ],
        "composition": "Ein persistenter Kern auf wechselnden Bühnen; Prozessbeschriftung in stabiler Randspalte."
      },
      {
        "name": "Übergabe als Beweis",
        "sections": [
          "Kritische Kundenfrage an einer Übergabe",
          "Verantwortlichkeiten erklären",
          "Gesamtablauf als übersichtliche Route",
          "Ausgewählte Arbeitsstation im Detail",
          "Passenden Auftrag besprechen"
        ],
        "composition": "Zweiteilige Übergabegrafik als Einstieg, normale Prozessliste als Mitte, eine große Detailstation am Ende."
      }
    ]
  },
  {
    "id": "return-stage",
    "name": "Produktwelten mit Rückkehrbühne",
    "file": "-6215933416139985581(1).MP4",
    "observed": "0–4.5s Anwendungsswitches der Aufnahme; 6–8.5s gemeinsame Auswahl; 9.5–12s rote Produktwelt; 12.25–15.5s dunkle Welt; 16.25–19.7s helle Welt.",
    "style": "Gemeinsame Produktfamilie, aber verschiedene Einzelwelten statt drei identischer Detailkarten mit anderen Bildern.",
    "sections": [
      "Gemeinsame Auswahlbühne",
      "Eigenständige Detailwelt des Angebots",
      "Material / Anwendung prüfen",
      "Passende Anfrage",
      "Zur Auswahl zurück"
    ],
    "methods": [
      "return-stage-worlds",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "retail",
      "beauty",
      "auto"
    ],
    "workflow": "Zustände overview → entering(itemId) → detail(itemId) → returning → overview modellieren. Index, Fokus und Scrollposition der Ausgangsbühne sichern. Pro Angebot ein eigenständiges Detailarrangement aus freigegebenen Medien definieren; Fakten und Anfrage erhalten die gewählte ID.",
    "limit": "Die Aufnahme enthält harte Schnitte und Editorwechsel; ein funktionsfähiger Konfigurator oder Name-/Share-Editor wird nicht nachgewiesen.",
    "signatureMethod": "return-stage-worlds",
    "assetPlan": [
      "Je Angebot Totale, Materialdetail und Anwendung derselben Variante vorbereiten; stabile itemId und Faktenmodell führen.",
      "Jede Detailwelt erhält eigenen Zuschnitt, Lichtcharakter und Textposition; fremde Jacken oder Marken nicht als Firmenprodukte übernehmen."
    ],
    "checkpoints": [
      "Nach Auswahl und Rückkehr stimmen Index, Fokus und angefragtes Angebot überein.",
      "Drei Varianten unterscheiden sich auch in Komposition und Bildregie, nicht nur in Hintergrundfarbe."
    ],
    "variants": [
      {
        "name": "Auswahlbühne",
        "sections": [
          "Gemeinsame Auswahlbühne",
          "Eigenständige Detailwelt des Angebots",
          "Material / Anwendung prüfen",
          "Passende Anfrage",
          "Zur Auswahl zurück"
        ],
        "composition": "Drei Motive auf einer Bühne; Detailwelt wechselt zwischen Nahaufnahme, freier Fläche und technischer Randspalte."
      },
      {
        "name": "Material als Einstieg",
        "sections": [
          "Charakteristisches Materialdetail",
          "Dazu passende Angebote wählen",
          "Anwendung im persönlichen Kontext",
          "Unterschiede direkt vergleichen",
          "Beratung mit gespeicherter Auswahl"
        ],
        "composition": "Makro-Hero und vertikaler Angebotsindex; gemeinsame Vergleichstabelle ersetzt ein wiederholtes Kartenband."
      }
    ]
  },
  {
    "id": "ensemble-catalog",
    "name": "Vom Einzelmotiv zum Ensemble",
    "file": "-4186847397357342673(1).MP4",
    "observed": "0–2s erstes Fläschchen auf Eis; 2–7.5s Verdeckung und zweites Produkt; 7.5–13s zweiter Übergang und drittes Produkt; 13–18.5s Gesamtauslage; 18.5–21s hervorgehobene Katalogkacheln.",
    "style": "Einzelprodukte erhalten große, voneinander abweichende Bühnen; die gemeinsame Endauslage erklärt Auswahl und Zusammenhang.",
    "sections": [
      "Ein Angebot im charakteristischen Detail",
      "Weitere Angebote gezielt entdecken",
      "Alle Optionen gemeinsam sehen",
      "Eigenschaften vergleichen",
      "Auswahl anfragen"
    ],
    "methods": [
      "occlusion-to-ensemble",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "gastro",
      "retail",
      "beauty"
    ],
    "workflow": "Produktindex und Galerie atomar führen. Eine isolierte Medienebene als Verdeckungsmaske verwenden, Überschrift und Navigation bleiben außerhalb. Vor dem Wechsel Zielmotiv laden; Endansicht zeigt alle tatsächlich verfügbaren Optionen und führt zur Auswahl zurück.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "occlusion-to-ensemble",
    "assetPlan": [
      "Motive freistellen und ihre Größenverhältnisse bestimmen; Vordergrundmaske und vergleichbare Endauslage separat vorbereiten.",
      "Sortennamen, Zutaten und Verfügbarkeit aus echten Angaben übernehmen; keine Eiswelt für fachfremde Unternehmen."
    ],
    "checkpoints": [
      "Die Verdeckung betrifft nur Medien, niemals Pflichttexte oder Bedienung.",
      "Aktive Variante, Fakten und Anfrage bleiben synchron; kaputtes Zielbild lässt die bisherige Auswahl bedienbar."
    ],
    "variants": [
      {
        "name": "Entdecken und sammeln",
        "sections": [
          "Ein Angebot im charakteristischen Detail",
          "Weitere Angebote gezielt entdecken",
          "Alle Optionen gemeinsam sehen",
          "Eigenschaften vergleichen",
          "Auswahl anfragen"
        ],
        "composition": "Großes Einzelmotiv mit ruhigem Seitenetikett; Endauslage als frei kuratierte Motivgruppe."
      },
      {
        "name": "Gesamtauswahl zuerst",
        "sections": [
          "Alle verfügbaren Optionen überblicken",
          "Persönlichen Favoriten öffnen",
          "Herstellung / Qualität im Detail",
          "Ähnliche Optionen vergleichen",
          "Favoriten anfragen"
        ],
        "composition": "Ungleich große Gesamtcollage vor dem Detail; schmaler Auswahlindex bleibt erreichbar, kein Vollbild-Zwang."
      }
    ]
  },
  {
    "id": "documentary-blueprint",
    "name": "Vom Betriebsbild zum Datenbild",
    "file": "-2080693491323830558(1).MP4",
    "observed": "0–3.25s Lkw, Betriebsgelände und Drahtansicht; 3.25–6.75s helle Erklärung und Foto-zu-Linien-Bildwechsel; 6.75–7.75s Akronymkapitel; 7.75–11.5s Netzwerk und Belege.",
    "style": "Hoher Kontrast zwischen Betrieb, Schema und Erklärung; unterschiedliche Informationsdichte schafft Rhythmus ohne austauschbare Kartenreihen.",
    "sections": [
      "Realer Betrieb / belegbares Ergebnis",
      "Vorgang schematisch erklären",
      "Leistungen auf heller Lesefläche",
      "Nachweise und Verantwortliche",
      "Konkrete Anfrage"
    ],
    "methods": [
      "documentary-wireframe-rhythm",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "workflow": "Dokumentarisches Bild, abstrahierte Linienfassung und HTML-Erklärung getrennt aufbauen. Motivkontur und Blickachse am Übergang abstimmen; Textkontrast beim Flächenwechsel absichern. Navigation verankert lassen, aktive Sektion aus dem sichtbaren Inhalt ableiten.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "documentary-wireframe-rhythm",
    "assetPlan": [
      "Echtes Betriebsbild und klar als Schema bezeichnete Konturvariante mit gleichem Ausschnitt vorbereiten.",
      "Kennzahlen, Kartenpunkte und technische Labels brauchen Quellen; fehlende Daten als Rechercheauftrag führen."
    ],
    "checkpoints": [
      "Schema und Foto sind unterscheidbar; eine dekorative Drahtansicht gilt nicht als technischer Nachweis.",
      "Hell-/Dunkelwechsel hält Text und Navigation lesbar; Inhalte bleiben in logischer DOM-Reihenfolge."
    ],
    "variants": [
      {
        "name": "Reportage mit Erklärung",
        "sections": [
          "Realer Betrieb / belegbares Ergebnis",
          "Vorgang schematisch erklären",
          "Leistungen auf heller Lesefläche",
          "Nachweise und Verantwortliche",
          "Konkrete Anfrage"
        ],
        "composition": "Breites Reportagebild, schmale technische Randnotizen, anschließend großzügiger heller Satzspiegel."
      },
      {
        "name": "Frage und Nachweis",
        "sections": [
          "Fachliche Kundenfrage",
          "Antwort als nachvollziehbares Schema",
          "Echten Betrieb als Beleg zeigen",
          "Zuständigkeit und Leistungsumfang",
          "Anfrage mit Randbedingungen"
        ],
        "composition": "Kompakte Frage-Antwort-Fläche vor einer großen Schemazeichnung; dokumentarischer Split als später Beweis."
      }
    ]
  },
  {
    "id": "ritual-booking",
    "name": "Von der Schwelle zur Buchung",
    "file": "-1979294151548389942(2).MP4",
    "observed": "0–2.75s Tür öffnet zur Arbeitswelt; 2.75–8.25s Hero, Portrait und Handdetail; 8.25–11.25s Leistungen und Preisliste; 11.25–13.27s Buchungsaktion und Dialog.",
    "style": "Filmischer Markenmoment und funktionale Terminoberfläche erhalten bewusst unterschiedliche Dichte; Hände, Arbeit und Ergebnis stellen den fachlichen Zusammenhang her.",
    "sections": [
      "Kurzer Markenauftakt mit erreichbarer Hauptaktion",
      "Arbeitswelt und konkrete Ergebnisse",
      "Leistungen und bestätigte Preise",
      "Termin passend zur Leistung anfragen"
    ],
    "methods": [
      "threshold-to-booking",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "beauty",
      "hotel",
      "health",
      "generic"
    ],
    "workflow": "Den Auftakt als optionale Mediensequenz mit sofort erreichbarem Überspringen und CTA bauen. Zustände intro → content → booking getrennt führen; Buchungsdialog erhält Leistungswahl, Fokusfalle, Escape und Rückkehrfokus. Eine beeindruckende Szene darf den Besuch niemals aussperren.",
    "limit": "Der sichtbare Dialog belegt keine abgeschlossene Buchung und keinen funktionierenden Buchungsserver.",
    "signatureMethod": "threshold-to-booking",
    "assetPlan": [
      "Firmenbezogenes Schwellenmotiv oder Arbeitsdetail, echte Ergebnisfotos und Portraits mit Freigabe planen.",
      "Bei Gesundheitsbetrieben nur sachliche belegbare Inhalte und zurückhaltende Inszenierung; kein fremdes Model als tatsächliches Team ausgeben."
    ],
    "checkpoints": [
      "Intro jederzeit überspringbar; CTA, Leistungsdaten und Kontakt funktionieren schon vor Medienladung.",
      "Dialog auf Touch und Tastatur vollständig bedienbar, Fehler verständlich; sichtbare Maske allein ist kein Nachweis einer fertigen Buchungsintegration."
    ],
    "variants": [
      {
        "name": "Erlebnis mit direkter Buchung",
        "sections": [
          "Kurzer Markenauftakt mit erreichbarer Hauptaktion",
          "Arbeitswelt und konkrete Ergebnisse",
          "Leistungen und bestätigte Preise",
          "Termin passend zur Leistung anfragen"
        ],
        "composition": "Optionales Schwellenbild, große Arbeitsaufnahme, danach ruhige Leistungsliste mit ständig erreichbarer Buchungsaktion."
      },
      {
        "name": "Leistung zuerst",
        "sections": [
          "Gesuchte Leistung und Terminanfrage",
          "Echte Ergebnisse in variierenden Ausschnitten",
          "Menschen und Arbeitsweise",
          "Preis- und Ablaufklärung",
          "Buchung mit vorausgewählter Leistung"
        ],
        "composition": "Nutzbare Leistungsauswahl im ersten Bildschirm; filmische Identität erst als späterer Beleg, kein Pflichtprolog."
      }
    ]
  },
  {
    "id": "painterly-chapters",
    "name": "Malerische Kapitel mit Motivbrücke",
    "file": "-1360803790880632830(1).MP4",
    "observed": "1.75–4.75s Leitmotivteilung und blaue Flächenübernahme; 6.5–10.25s monumentale Arbeitswelt; 10.25–13.75s Papier wird zur gerahmten Studie; 15.25–18.13s FAQ und Schlussgeste.",
    "style": "Weißraum, gesättigte Bildwelt und papierartige Fläche wechseln in einer bewussten Dramaturgie; die Motivbrücke schafft Zusammenhang ohne kopierte Originalillustration.",
    "sections": [
      "Herkunft / Idee am echten Leitmotiv",
      "Arbeit als eigenständige Bildgeschichte",
      "Material- oder Qualitätsdetail",
      "Menschen und belegbarer Kontext",
      "Persönliche Einladung"
    ],
    "methods": [
      "painterly-medium-bridge",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "gastro",
      "hotel",
      "retail",
      "craft"
    ],
    "workflow": "Ein Leitmotiv über fotografische, gemalte und reduzierte Darstellungen hinweg wiedererkennbar halten. Gemeinsame Formkante für den Medienwechsel definieren; semantischen Text außerhalb dekorativer Masken halten. Papierstruktur als leichte Hintergrunddatei statt schwerer Canvas-Simulation verwenden.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "painterly-medium-bridge",
    "assetPlan": [
      "Eigenständiges Leitmotiv und zwei mediale Interpretationen desselben Motivs vorbereiten; als Illustration/Konzept klar kennzeichnen.",
      "Gemälde, Fotos und Papierstruktur brauchen jeweils Rechte; keine fremde Geschichte oder Herkunft auf die Firma übertragen."
    ],
    "checkpoints": [
      "Medienwechsel hält Form, Blickachse und Aussage zusammen; Materialmix dient einer verständlichen Aussage.",
      "Mindestens drei verschiedene Bild-/Text-Kompositionen; keine dauernde Parallaxe und keine gestreckten Papiertexturen."
    ],
    "variants": [
      {
        "name": "Herkunft als Bilderzählung",
        "sections": [
          "Herkunft / Idee am echten Leitmotiv",
          "Arbeit als eigenständige Bildgeschichte",
          "Material- oder Qualitätsdetail",
          "Menschen und belegbarer Kontext",
          "Persönliche Einladung"
        ],
        "composition": "Luftiger Editorial-Auftakt, tiefe gemalte Medienfläche, anschließend heller Materialbericht mit ungleichen Bildgrößen."
      },
      {
        "name": "Material wird Geschichte",
        "sections": [
          "Ein konkretes Material mit Herkunft",
          "Angebot und Anwendung",
          "Malerische Interpretation der Arbeitsweise",
          "Belegbare Menschen / Entstehung",
          "Anfrage zum gezeigten Angebot"
        ],
        "composition": "Detailspalte neben großer Typografie; gemalte Szene als Mitte, echte Arbeitsbilder in ruhigem Abschluss."
      }
    ]
  },
  {
    "id": "ingredient-orbit",
    "name": "Produkt als Merkmal-Beleg",
    "file": "-393015269072123485(1).MP4",
    "observed": "0–2.25s Dosenkarussell und gewählte Variante; 2.25–7.67s Produktdrehung mit passenden Etikett-/Merkmalsmarkierungen; 7.67–10.75s Claim und Sortimentspanorama; 10.75–14.9s FAQ, Newsletter und visuelle Rückkehr.",
    "style": "Ein gewähltes Produkt erklärt mehrere Eigenschaften über passende Blickwinkel und Detailmarkierungen. Aussage, sichtbare Produktseite und hervorgehobenes Merkmal gehören zusammen.",
    "sections": [
      "Passendes Produkt auswählen",
      "Merkmale direkt am Produkt erkunden",
      "Anwendung und echte Belege",
      "Sortiment als ruhige Gesamtansicht",
      "Fragen und gezielte Anfrage"
    ],
    "methods": [
      "ingredient-carousel-continuity",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "gastro",
      "retail",
      "fitness",
      "beauty"
    ],
    "workflow": "Zuerst Merkmal, bestätigte Aussage und passende Produktansicht als funktionierenden Zustand bauen. Danach Blickwinkel und Detailmarkierung ergänzen; die volle Merkmalliste bleibt stets als HTML erreichbar.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "ingredient-carousel-continuity",
    "assetPlan": [
      "Für jedes bestätigte Merkmal Detailausschnitt oder Modellansicht samt Markierungsposition anlegen; dieselbe Produkt-ID durchgehend erhalten.",
      "Keine Wirk- oder Zutatenbehauptungen aus dem Video übernehmen; unbekannte Eigenschaften als Rechercheauftrag behandeln."
    ],
    "checkpoints": [
      "Aktives Merkmal, sichtbare Produktansicht und Erklärung stimmen nach jeder Auswahl überein.",
      "Jede Aussage bleibt unabhängig von der 3D-Szene als Text lesbar; keine dauernde Produktrotation und keine zwangsweise Wiedergabe."
    ],
    "variants": [
      {
        "name": "Auswahl als Auftakt",
        "sections": [
          "Passendes Produkt auswählen",
          "Merkmale direkt am Produkt erkunden",
          "Anwendung und echte Belege",
          "Sortiment als ruhige Gesamtansicht",
          "Fragen und gezielte Anfrage"
        ],
        "composition": "Gewähltes Produkt auf einer Seite, ruhige Erklärung auf der anderen; Detailmarkierung wechselt mit der Auswahl, das Produkt bleibt als Anker stehen."
      },
      {
        "name": "Eigenschaft führt zur Auswahl",
        "sections": [
          "Eine konkrete Kundenfrage",
          "Passendes Produktmerkmal im Detail",
          "Weitere Eigenschaften direkt vergleichen",
          "Gesamtes Angebot überblicken",
          "Beratung mit gespeicherter Auswahl"
        ],
        "composition": "Vergleichender Textauftakt mit kleinen Produktbildern; nur die gewählte Variante erhält später eine große Bühne."
      }
    ]
  },
  {
    "id": "isometric-network",
    "name": "Von der Arbeitsstation zum Netzwerk",
    "file": "-388175669482362820(1).MP4",
    "observed": "0–2.25s Lagerübersicht; 2.25–3.75s Innenfunktion und Straßenweg; 3.75–5.75s Hafen, Flughafen, Schienen und Büro; 6.33–7.93s Übergang in normale Leistungsinhalte.",
    "style": "Heller Boden, kompakte Objekte und stabile Kameraneigung erzeugen eine lesbare Arbeitswelt. Ein klarer Übergang führt anschließend zurück zu normalem Webinhalt.",
    "sections": [
      "Arbeitswelt als übersichtliches Ganzes",
      "Eine Station nachvollziehbar öffnen",
      "Verbindungen und Zuständigkeiten",
      "Leistungsdetails außerhalb der Szene",
      "Auftrag konkret besprechen"
    ],
    "methods": [
      "isometric-network-scale",
      "editorial-anchor-object",
      "cinematic-tonal-chapters"
    ],
    "industries": [
      "craft",
      "auto",
      "professional",
      "generic"
    ],
    "workflow": "Belegte Stationen als getrennte, beschriftete Gruppen anlegen. Übersicht und Stationsansichten mit festem Kameraziel definieren; nur eine Szene gleichzeitig aktiv rendern. Hotspots haben zugängliche HTML-Pendants. Detailtexte und anschließender normaler Seiteninhalt liegen außerhalb der 3D-Fläche.",
    "limit": "Originaltechnik, genaue Eingabetrigger, Animationsdauer und mobiles Verhalten sind aus der Bildschirmaufnahme nicht nachgewiesen.",
    "signatureMethod": "isometric-network-scale",
    "assetPlan": [
      "Leichte Stationsmodelle oder eine freigegebene isometrische Illustration, einheitliche Bodenhöhe und Schattenrichtung vorbereiten.",
      "Nur echte Standorte und Wege bezeichnen; abstrakte Beispielszenen ausdrücklich als Konzept kennzeichnen."
    ],
    "checkpoints": [
      "Labels bleiben bei jedem Maßstab lesbar; Kamera schneidet keine aktive Station ab.",
      "Der Übergang zur normalen Seite löst keine Scrollsperre aus; Touch, Zurück und statische Ersatzansicht bleiben vollständig nutzbar."
    ],
    "variants": [
      {
        "name": "Welt vor Detail",
        "sections": [
          "Arbeitswelt als übersichtliches Ganzes",
          "Eine Station nachvollziehbar öffnen",
          "Verbindungen und Zuständigkeiten",
          "Leistungsdetails außerhalb der Szene",
          "Auftrag konkret besprechen"
        ],
        "composition": "Eine helle Gesamtbühne mit nummerierter HTML-Legende; Detailpanel seitlich, anschließend ruhige normale Inhaltsabschnitte."
      },
      {
        "name": "Station vor Netzwerk",
        "sections": [
          "Eine konkrete Kundenaufgabe",
          "Dazu passende Arbeitsstation",
          "Station im größeren Zusammenhang",
          "Leistungsumfang und Verantwortliche",
          "Nächsten Schritt vereinbaren"
        ],
        "composition": "Große einzelne Station neben einer Kundenfrage; Gesamtkarte erst als spätere Erklärung, klare Textfläche zum Abschluss."
      }
    ]
  }
];

function referenceStandardFor(business: Business, settings: MasterPromptSettings, seed: number) {
  const selected = VIDEO_STYLE_STANDARDS.find((study) => study.id === settings.referenceStyle);
  const eligible = VIDEO_STYLE_STANDARDS.filter((study) => study.industries.includes(industryKey(business)));
  return selected ?? pick(eligible.length ? eligible : VIDEO_STYLE_STANDARDS, seed, "video-standard");
}

function websiteGameFor(business: Business, settings: MasterPromptSettings, seed: number, focus: string): MasterPromptImplementationPlan["game"] {
  if (settings.websiteGame === "off") return null;
  const kind = settings.websiteGame === "automatic" ? pick(["quiz", "memory", "challenge"] as const, seed, "game-kind") : settings.websiteGame;
  const name = { quiz: "Entdeckerquiz", memory: "Motiv-Memory", challenge: "Prozess-Puzzle" }[kind];
  const rules = {
    quiz: "Drei belegbare Fragen mit je drei Optionen; Erklärung pro Antwort, Ergebnis 0–3 und Neustart. Unbestätigte Antwortinhalte erst recherchieren; keine erfundenen Fakten.",
    memory: "Sechs Paare freigegebener Firmen-/Materialmotive; maximal zwei Karten offen, Treffer bleiben sichtbar; Zugzähler, Gewinn nach sechs Paaren, Neustart mischt mit Fisher-Yates neu.",
    challenge: "Drei bis fünf bestätigte Arbeitsschritte oder Materialelemente passend ordnen. Auswahl und Platzierung über Buttons sowie optional Drag-and-drop; Fehler erklären, Abschluss und Neustart anbieten.",
  }[kind];
  return {
    name, rules,
    brief: `Ein ${name} für ${business.name} rund um „${focus}“. Motiv, Begriffe und Erfolgsmoment aus der echten Arbeit ableiten. Als freiwilligen Abschnitt nach einem passenden Kapitel einbauen; Hauptleistung und Kontakt bleiben direkt erreichbar.`,
    implementation: "Baue CompanyMiniGame mit Zuständen ready → playing → feedback → completed und reset. Daten getrennt von Spielregeln; lokaler Zustand für die aktuelle Partie. Touch und Tastatur gleichwertig, Status über aria-live, sichtbarer Fokus, kein Zeitdruck oder Tonzwang. Bei Reduced Motion oder Animation aus sofortige Zustandswechsel. Keine Anmeldung, kein Tracking, keine Rangliste oder Datenübertragung ohne Auftrag; keine erfundenen Rabatte, Gewinne oder Gesundheitsdiagnosen.",
    acceptance: "Start, korrekte/falsche Aktion, Abschluss, Neustart und mobile Bedienung testen. Keine bloße Illustration oder Schaltfläche ohne Spiellogik. Firmenbezug und funktionierenden Dateipfad im Build-Nachweis aufführen.",
  };
}

export function getReferenceMethodCatalog() {
  return CREATIVE_TECHNIQUES.map(({ id, name, family, direction, implementation, fallback }) =>
    ({ id, name, family, direction, implementation, fallback }));
}

function companyDesignContext(business: Business, research?: MasterPromptResearch) {
  const clean = (value?: string | null) => value?.replace(/\s+/g, " ").trim().slice(0, 180) ?? "";
  const services = unique(research?.services ?? []).map(clean).slice(0, 3);
  const audience = unique(research?.targetAudiences ?? []).map(clean).slice(0, 2).join(" / ");
  const difference = unique(research?.differentiators ?? []).map(clean).slice(0, 2).join(" / ");
  const description = clean(research?.businessDescription || business.websiteReport?.research.description);
  const focus = services.length ? `${services.join(" / ")}${difference ? ` mit Schwerpunkt ${difference}` : ""}`
    : description || `${business.category} am Standort ${business.address || "[STANDORT PRÜFEN]"}`;
  const facts = (research?.evidence ?? []).filter((entry) => entry.usage === "fact").map((entry) =>
    `${clean(entry.label)}:${clean(entry.value)}:${entry.confidence}`).sort();
  return {
    focus, audience, difference,
    status: services.length || description ? "Recherchebasierter Entwurf; Angaben nur gemäß Quellenstatus übernehmen, vor Kundeneinsatz bestätigen."
      : "Vorläufiges Branchenkonzept: Leistungen, Zielgruppe und Eigenheiten noch mit dem Unternehmen klären.",
    seedMaterial: JSON.stringify({ services: [...services].sort(), audience, difference, description, facts }),
  };
}

function pageStructureFor(business: Business, settings: MasterPromptSettings, seed: number, focus: string) {
  const reference = referenceStandardFor(business, settings, seed);
  const structures = {
    editorial: ["Editoriales Markenjournal", "Leitmotiv mit klarer Aussage", "Große Bildreportage zur Arbeit", "Vertiefende Leistungskapitel", "Belegtes Detail / Fallbeispiel", "Persönlicher Kontakt"],
    cinematic: ["Filmische Kapitelreise", "Atmosphärischer Auftakt mit sofortigem Nutzen", "Detail wird zum nächsten Kapitel", "Arbeitsprozess im Wechsel mit Ruheflächen", "Beleg und Herkunft", "Direkte Anfrage / Buchung"],
    spatial: ["Räumlicher Rundgang", "3D-Hero mit HTML-Orientierung", "Vom Überblick zum ausgewählten Detail", "Leistung mit offenem Faktenpanel", "Projektbeweis als ruhiges Bildkapitel", "Kontakt außerhalb der räumlichen Szene"],
    product: ["Kuratierte Produktbühne", "Zentrales Produkt-/Leistungsmotiv", "Beschriftete Auswahl oder Vergleich", "Material / Entstehung im Detail", "Belegbare Eigenschaften", "Beratung / Kaufanfrage"],
    technical: ["Beweisgeführte Prozessseite", "Konkretes Problem mit belegbarem Ergebnis", "Prozessschritte verständlich zerlegen", "Leistung im fachlichen Kontext", "Echte Referenz oder Qualifikation", "Projektanfrage"],
    direct: ["Klarer Beratungsweg", "Anliegen und Lösung direkt zeigen", "Leistungen übersichtlich vergleichen", "Menschen / nachgewiesene Kompetenz", "Ablauf und häufige Fragen", "Ein erreichbarer nächster Schritt"],
  };
  type StructureKey = keyof typeof structures;
  const industryChoices: Record<string, StructureKey[]> = {
    gastro: ["editorial", "cinematic", "product"], beauty: ["editorial", "product", "cinematic"],
    craft: ["technical", "editorial", "direct"], health: ["direct", "technical", "editorial"],
    professional: ["technical", "editorial", "direct"], fitness: ["cinematic", "technical", "editorial"],
    auto: ["technical", "product", "cinematic"], hotel: ["cinematic", "editorial", "spatial"],
    retail: ["product", "editorial", "cinematic"], generic: ["editorial", "technical", "direct"],
  };
  let key = pick(industryChoices[industryKey(business)] ?? industryChoices.generic, seed, "page-structure");
  if (settings.experienceArchetype !== "automatic" && settings.experienceArchetype !== "experimental") key = settings.experienceArchetype;
  if (settings.storyStructure === "direct") key = "direct";
  if (settings.storyStructure === "catalog") key = "product";
  if (settings.storyStructure === "chaptered") key = "editorial";
  if (settings.storyStructure === "journey") key = settings.spatialEffects !== "off" ? "spatial" : "cinematic";
  if (settings.storyStructure === "reveal") key = "technical";
  if (key === "spatial" && (settings.animation === "none" || settings.spatialEffects === "off" || settings.technology === "standard")) key = "editorial";
  const useReference = settings.storyStructure === "automatic" && (settings.referenceStyle !== "automatic" || settings.experienceArchetype === "automatic");
  const [baseName, ...baseSections] = structures[key];
  const variant = useReference && reference.variants?.length ? pick(reference.variants, seed, "reference-composition") : undefined;
  const name = useReference ? `${reference.name}${variant ? ` · ${variant.name}` : ""}` : baseName;
  const sections = useReference ? variant?.sections ?? reference.sections : baseSections;
  const productionStart = key === "spatial" ? "Zuerst das fachliche Motiv als kleine funktionsfähige 3D-Szene plus Poster prüfen; erst danach zur Seite ausbauen."
    : key === "product" ? "Zuerst ein echtes Produkt-/Leistungsdatum, ein Motiv und die Auswahlzustände zu einer funktionierenden Bühne verbinden."
    : key === "technical" ? "Zuerst den belegten Prozess als semantische Liste bauen; daraus Schrittfolge und visuelle Erklärung ableiten."
    : key === "cinematic" ? "Zuerst drei Schlüsselbilder mit Start, Übergang und Ruhepunkt als Storyboard festlegen; einen kompletten Übergang prototypisch umsetzen."
    : key === "editorial" ? "Zuerst Motiv, eigenständigen Satzspiegel und zwei gegensätzliche Abschnittskompositionen entwickeln; danach Bewegung ergänzen."
    : "Zuerst Besucherfrage, belastbare Antwort und Kontaktweg in eine ohne Effekte vollständig nutzbare Seite übersetzen.";
  return {
    name, rationale: `Die Dramaturgie erklärt ${focus}; Aufbau und Medien müssen aus dieser konkreten Arbeit entstehen. ${variant ? `Komposition: ${variant.composition} ` : ""}Fehlende Motive sind Rechercheaufträge.`,
    sections,
    workflow: [useReference ? reference.workflow : productionStart, "Ein Schlüsselabschnitt auf Desktop und Smartphone vollständig ausarbeiten; Qualität an diesem Abschnitt festlegen, bevor weitere Abschnitte entstehen.", "Die übrigen Kapitel aus den tatsächlichen Inhalten gestalten: mindestens drei verschiedene Kompositionen, bewusst wechselnde Bildgrößen, eigenständige Übergangslogik.", "Alle SC-Szenen integrieren, Geräte-Fallbacks und Zustandswechsel testen; erst danach Abnahmematrix und fertigen Build liefern."],
  };
}

// Concrete tracks for every reference method; coordinates are creative proposals,
// never measurements or claims about a referenced video or a real business.
const METHOD_TRACKS: Record<string, string> = {
  "editorial-anchor-object": "Leitmotiv: translateX(-6%) → 0, scale(1.06) → 1; nach Ruhephase dasselbe Detail anders kadrieren, H1 bleibt unbewegt.",
  "cinematic-tonal-chapters": "Kapitel A vollständig lesbar → Überlagerung B opacity 0 → 1; Hell-/Dunkelwechsel an einer inhaltlichen Kapitelgrenze, Textkontrast in beiden Zuständen prüfen.",
  "masked-media-reveal": "Medienmaske inset(0 100% 0 0) → inset(0); Motiv scale(1.08) → 1; anschließend 200 ms Ruhe, Text bleibt sichtbar.",
  "modular-strip-transition": "Vier Mediensegmente translateY(18%) → 0, zeitlich je 70 ms versetzt; Endzustand ist ein zusammenhängendes Motiv.",
  "route-orbit-narrative": "Pfadlänge auf 1 normieren: stroke-dashoffset 1 → 0; Marker bei 0 / 0.5 / 1; zugehörige Beschriftung dauerhaft außerhalb der Grafik.",
  "kinetic-type-performance": "Dekorative Textkopie translateY(0.6em) → 0, scale(0.96) → 1; aria-hidden Kopie und genau eine lesbare Textfassung im DOM.",
  "product-orbit-selector": "Aktiver Index i → i+1 nur per Button; Objekte um höchstens 30° neu ordnen, Fokusmotiv scale(0.9) → 1; keine Dauerrotation.",
  "product-assembly-story": "Drei belegte Bestandteile auf y=-0.3/0/0.3 → y=0 zusammensetzen; erst erklären, dann zusammenfügen; Labels bleiben getrennt lesbar.",
  "material-to-result-morph": "Ausgang / Prozess / Ergebnis bei 0 / 0.5 / 1; passende Masken/Crossfades statt erfundener Zwischenbilder, identischer Bildausschnitt.",
  "architectural-camera-portal": "Kamera von (0,0.4,5) nach (0,0.2,3.4), Blickziel (0,0,0); Portalrahmen → Zielraum; Kamerapfad ohne Roll, Exit über echte Navigation.",
  "volumetric-particle-morph": "Deterministische Startpunkte → abgetastete Zielkontur; morphProgress 0 → 1; höchstens 4000 Punkte Desktop / 1200 mobil, keine neue Geometrie pro Frame.",
  "spatial-world-portals": "Übersicht → gewähltes Portal → Detail; nur ein Portal aktiv, Kameraziel interpolieren; Zurück-Button stellt Kamera und vorherigen Fokus wieder her.",
  "motion-catalog-counter": "Indexwechsel: altes Motiv opacity 1 → 0, neues Motiv x=24px → 0; Zähler atomar aktualisieren, native fokussierbare Auswahl bleibt bedienbar.",
  "responsive-organic-field": "Pointer auf -1..1 normalisieren; Linien maximal 12px auslenken; nach Pointerleave in 400 ms zur Ruhe, auf Touch statisch.",
  "proof-comparison-wipe": "Range-Wert 0..100 steuert Maske; initial 50; Pfeiltasten ändern um 5; beide Zustände samt Herkunft lesbar beschriften.",
  "process-assembly-system": "Bestätigte Schritte bei 0 / 0.33 / 0.66 / 1 verbinden; Linienpfad fortschreiben, aktives Modul hervorheben, keine erfundenen Prozessschritte.",
  "guided-focus-lens": "Nutzer wählt Thema; zugehöriges Detail sofort öffnen, Fokusindikator stabil; übrige Informationen bleiben über sichtbare Steuerung erreichbar.",
  "layered-depth-stacks": "Hintergrund y=-8px → 0, Motiv y=12px → 0, Detail y=20px → 0; Text auf fixer Ebene, keine layoutverändernden Größenanimationen.",
  "aperture-portal-journey": "Maske circle(18% at 50% 50%) → circle(75%); Zielmotiv bereits geladen; bei Abschluss Maske entfernen und Fokusziel freigeben.",
  "gesture-framed-editorial": "Freigegebenes Detail translateX(12px) → 0; Blickachse endet am Nutzenbeleg, Hand-/Personenmotiv bleibt hinter dem Textbereich.",
  "interactive-process-diorama": "Drei belegte Stationen als Hotspots; Auswahl hebt genau eine Station an und öffnet HTML-Detail; Übersicht-Button setzt Zustand zurück.",
  "motion-token-grammar": "Gemeinsame Dauer-, Easing- und Distanzvariablen; jede Szene hält einen klaren Ruhe- und Endzustand ein.",
  "character-pose-chapters": "Freigegebene Pose A → B über 200-ms-Crossfade; Kamera und Augenlinie konstant, Körperteile niemals frei aus Zwischenframes erfinden.",
  "material-world-variants": "Variantenauswahl aktualisiert Material, Label und Bild atomar; Crossfade erst nach geladenem Zielmotiv, aktive Variante zusätzlich textlich benennen.",
  "product-runway-configurator": "Auswahl A → B: altes Objekt x=-0.4, opacity=0; neues x=0.4 → 0, opacity=1; zugängliches Faktenpanel unabhängig von der Bühne.",
  "object-interface-match-cut": "Medienkante und Zielrahmen vermessen; FLIP-Transform vom Detail zum Panel, Endzustand in normalem Layout; Text bleibt semantisch unabhängig.",
  "technical-anatomy-explode": "Bis zu fünf belegte Ebenen entlang y um je 0.15 auseinanderführen; Labels mit Leader-Lines; Auswahl setzt Ebene zurück, andere bleiben sichtbar.",
  "experience-to-specification": "Zugang 0–20% → freier Blick 20–45% → Hauptmotiv 45–70% → ruhige Planansicht 70–100%. Blickziel bleibt am identischen Motiv; vor dem Faktenpanel Bewegung beenden. Vorgeschlagene Objektrotation maximal 25°, bei Planansicht per Crossfade statt sprunghafter Projektionsumschaltung.",
  "cargo-handoff-continuity": "Station A hält den Kern → beide Übergabeanker decken sich → Träger B übernimmt → A verlässt die Bühne → Ruhe mit beschriftetem Schritt. Pro Übergabe 0/30/55/80/100%; nur aktive und nächste Stationsgruppe laden, Kern bleibt sichtbar.",
  "return-stage-worlds": "Auswahl A: Rahmen des gewählten Motivs messen → Motiv zum Detailrahmen überführen → eigene Licht-/Materialfläche einblenden → Text lesbar im Endzustand. Rückkehr invertiert den Rahmenwechsel und stellt Fokus auf A. Vorschlag 650 ms, neue Auswahl bricht vorige Transition sauber ab.",
  "occlusion-to-ensemble": "Nutzer wählt B → Vordergrundmotiv verschiebt sich über die Medienfläche → bei vollständiger Verdeckung wechselt nur die Zielmediengruppe → Maske verlässt die Fläche → B ruht. Übergangsvorschlag 700 ms, danach Übersichtsaktion mit allen Optionen; keine automatische Produktauswahl.",
  "documentary-wireframe-rhythm": "Reportage 0–35% → Kontur deckungsgleich einblenden 35–55% → Originalbild zurücknehmen 55–70% → ruhige Erklärung 70–100%. Maximal zwei Medienebenen, Linien sind bewusst konzeptionell und keine behaupteten technischen Messdaten.",
  "threshold-to-booking": "Schwellenmotiv geschlossen → Öffnung auf 60% → Arbeitswelt sichtbar → Medienebene verlassen und normale Inhaltsseite zeigen. Vorschlag einmalig 900 ms; keine Wiederholung bei Rückkehr. Buchung öffnet allein per Nutzeraktion und bleibt vollständig ohne Animation bedienbar.",
  "painterly-medium-bridge": "Leitobjekt mit fachlicher Handlung → eigene Oberfläche/Negativraum übernimmt den Medienraum → nächste Arbeitsszene → Dokumentdetail wird bildfüllend → dasselbe Werk in gerahmter Übersicht mit ruhigem Faktenblock. Übergabeanker in Position, Kontur und Materialfarbe abgleichen; 25% jeder Szene als lesbaren Endzustand halten.",
  "ingredient-carousel-continuity": "Produkt wählen → gewähltes Motiv bleibt bestehen → Merkmalsbutton wählt passende Ansicht → Detailmarkierung und HTML-Aussage synchron → ruhiger Endzustand. Rotationsziel je Merkmal aus dem Motivmanifest, maximal eine halbe Umdrehung; bei Rückseitenmerkmal etwa 0 → 180°. Vorschlag 650 ms, Abbruch setzt das aktuelle Ziel, keine Animationswarteschlange.",
  "isometric-network-scale": "Übersicht mit freier Textzone → ausgewählte Station auf 1.35-fachen Maßstab → ruhiger Detailzustand → Gesamtübersicht wiederherstellen → normale Inhaltsfläche. Kameraneigung konstant, Rotation maximal 15°; Zurück setzt Maßstab und Fokus zurück. Mehrere Orte nur zeigen, wenn ihre tatsächliche Verbindung belegt ist.",

};

// Functional behavior survives disabled motion or a static rendering fallback.
const METHOD_INTERACTIONS: Record<string, string> = {
  "return-stage-worlds": "Funktionsvertrag: overview → detail(selectedId) → overview. Gewählte ID, Ausgangsfokus und Scrollposition speichern; Rückkehr stellt sie wieder her. Fakten und Anfrage gehören immer zur aktiven ID; nur Klick/Enter navigiert, niemals Hover allein.",
  "occlusion-to-ensemble": "Funktionsvertrag: product(selectedId) ↔ overview. Beschriftete Vor-/Zurück- und Übersichtsbuttons; Gesamtauswahl vollständig per Tastatur erreichbar. Fehlendes Bild blockiert weder Fakten noch eine neue Auswahl.",
  "ingredient-carousel-continuity": "Funktionsvertrag: selectedProductId + activeFeatureId. Jede Merkmalsauswahl aktualisiert Erklärung, passende Ansicht und Detailmarkierung atomar. Für alle Merkmale existiert eine zugängliche Textliste; Produktwechsel setzt nur inkompatible Merkmale zurück.",
  "threshold-to-booking": "Funktionsvertrag: Inhalt und Kontakt sind sofort erreichbar. Leistungswahl wird in den Buchungs-/Anfragedialog übernommen; beschriftete Felder, Escape, Fokusfalle, Rückkehrfokus, verständliche Fehler und echtes Erfolgsfeedback. Ohne angebundenes Buchungssystem klar als Terminanfrage ausweisen.",
};

function createImplementationPlan(business: Business, settings: MasterPromptSettings, fingerprint: DesignFingerprint, blueprint: MasterPromptCreativeBlueprint, research?: MasterPromptResearch): MasterPromptImplementationPlan {
  const context = companyDesignContext(business, research);
  const still = settings.animation === "none";
  const spatial = !still && settings.spatialEffects !== "off" && settings.technology !== "standard" && settings.complexity !== "simple" && settings.budget !== "small";
  const allowedSpatialCount = settings.spatialEffects === "experience" ? 2 : 1;
  let spatialCount = 0;
  const timing = settings.animation === "subtle" ? "360 ms, maximal 12px, cubic-bezier(0.22,1,0.36,1)" : `${720 + (fingerprint.seed % 4) * 80} ms, cubic-bezier(0.22,1,0.36,1)`;
  const definitions = blueprint.techniques.map((method) => ({ ...method, spatial: CREATIVE_TECHNIQUES.find((entry) => entry.id === method.id)?.spatial ?? "none" }));
  // If a requested 3D Hero has no eligible method, provide a bounded original scene.
  if (spatial && !definitions.some((method) => method.spatial !== "none")) {
    definitions.unshift({ id: "company-spatial-signature", name: "Firmenspezifische 3D-Signatur", family: "Spatial", spatial: "required", direction: "Ein bestätigtes Leistungsdetail wird räumlich verständlich.", implementation: "Ein einzelnes leichtes Objekt inszenieren; fachliches Motiv vor Produktion bestätigen.", fallback: "Statisches freigegebenes Motiv mit gleicher Aussage." });
  }
  const scenes = definitions.map((method, index): MasterPromptSceneContract => {
    const webgl = spatial && method.spatial !== "none" && spatialCount < allowedSpatialCount;
    if (webgl) spatialCount += 1;
    const staticVariant = still || (method.spatial !== "none" && !webgl);
    const renderer = webgl ? "webgl" : staticVariant ? "static" : "dom";
    const directInput = ["proof-comparison-wipe", "guided-focus-lens", "product-orbit-selector", "motion-catalog-counter", "material-world-variants", "product-runway-configurator", "interactive-process-diorama", "responsive-organic-field", "return-stage-worlds", "occlusion-to-ensemble", "ingredient-carousel-continuity"].includes(method.id);
    const scroll = !directInput && renderer !== "static" && settings.scrollMotion !== "off" && settings.storyStructure !== "direct" && index > 0;
    const trigger = renderer === "static" ? "Sofort sichtbarer Endzustand; Nutzereingaben aktualisieren ohne Übergangsanimation."
      : directInput ? "Ausschließlich durch direkte Auswahl, Range-Regler oder Pointer-Eingabe; keine automatische oder scrollgesteuerte Zustandsänderung."
      : scroll && ["storytelling", "immersive"].includes(settings.scrollMotion) ? "Abschnitt top=80% Viewport bis bottom=20%; Fortschritt 0..1, linear gescrubbt; kein Scroll-Hijacking."
      : scroll ? "IntersectionObserver bei 20% Sichtbarkeit, einmalig; danach Endzustand halten."
      : "Nach geladenem Motiv und sichtbarer H1 einmalig; weitere Zustände nur über beschriftete Buttons. Keine Scroll-Kopplung.";
    const pose = fingerprint.seed % 2 ? "(0.4,0.25,4.5)" : "(-0.4,0.35,4.8)";
    const geometry = /partikel/i.test(method.name) ? "BufferGeometry + Points, wiederverwendete Attribute"
      : "ein freigegebenes GLB-Modell oder selbst erstelltes, ausdrücklich konzeptionelles Objekt";
    const renderSpec = webgl
      ? `${method.implementation} Three.js lazy laden; ${geometry}; Szene auf 2 Einheiten normieren. PerspectiveCamera FOV 35°, Start ${pose}, Ziel (0,0,0), near 0.1/far 50. Key-Light (3,4,4), sanftes Fill (-3,1,2); roughness 0.55, metalness 0.1 als Ausgangspunkt, an echtes Material anpassen. Keine wahllosen Metallkugeln. Renderer max. DPR 1.5; Offscreen pausieren, beim Unmount Geometrie/Material/Texturen/Renderer freigeben.`
      : staticVariant ? `${method.fallback} Keine Kamera, Partikel, Parallaxe oder automatische Bewegung.`
      : `${method.implementation} Umsetzung ${settings.technology === "gsap" ? "mit GSAP-Kontext und Cleanup" : "mit CSS/WAAPI und kleinem isoliertem Controller"}; Listener/Observer beim Unmount entfernen.`;
    const track = webgl ? `${METHOD_TRACKS[method.id] || "Objekt rotation.y -0.18 → 0.18 rad; Kamera und lesbarer Text bleiben stabil."} Die gleiche Szene muss als echtes Canvas sichtbar gerendert werden.`
      : staticVariant ? "Endzustand ohne Interpolation; Inhalte und Auswahl sofort bedienbar."
      : settings.animation === "subtle" ? `${directInput ? "Nur nach bewusster Auswahl: " : ""}Motiv opacity 0.9 → 1 und translateY(8px) → 0; keine große Maskenöffnung, Skalierung oder Kamerafahrt.` : METHOD_TRACKS[method.id];
    return {
      id: `SC-${index + 1}`, techniqueId: method.id, name: method.name,
      component: webgl && settings.spatialEffects === "hero" ? "CompanyHeroScene" : `CompanyScene${index + 1}`,
      renderer, subject: `${business.name}: ${context.focus}${context.audience ? `; für ${context.audience}` : ""}. ${method.direction}`,
      trigger,
      timeline: renderer === "static" || directInput ? track : `0% Vorbereitung → 25% Detail → 70% Aussage → 100% Ruhe. ${track} ${scroll && ["storytelling", "immersive"].includes(settings.scrollMotion) ? "Scroll-Fortschritt statt zeitlichem Easing; kein zusätzliches Zeit-Tween." : `Zeitbasis: ${timing}.`} Abbruch zeigt den Endzustand.`,
      implementation: `${renderSpec} ${METHOD_INTERACTIONS[method.id] ?? ""}`.trim(),
      assets: webgl ? "GLB/komprimierte Texturen insgesamt Ziel ≤2 MB je Szene, max. 60k Dreiecke; Mobile ≤20k; AVIF-Poster ≤180 KB. Quelle/Lizenz, Motivbezug und Freigabe erfassen."
        : "Passendes Firmenmotiv mit Quelle und Freigabe; AVIF/WebP srcset 480/960/1600, feste Abmessungen, Hero-Ziel ≤250 KB. Keine zufälligen Bilder.",
      mobile: settings.mobilePriority === "speed" || renderer === "static" ? "Unter 768px statisches Hochformatmotiv; keine WebGL-Initialisierung; gleicher Inhalt und CTA."
        : webgl ? "Unter 768px DPR 1, reduzierte Geometrie, keine Pointer-Pflicht; bei WebGL-Fehler, Kontextverlust oder schwacher Leistung statisches Poster + HTML."
        : "Unter 768px Distanzen halbieren, Pinning entfernen; Touch-Scroll frei, Auswahl per Button und Tastatur.",
      reducedMotion: "Bei prefers-reduced-motion sofort Endzustand/Poster; keine Kamera-/Scrollbewegung, keine Loop, keine versteckten Texte; Änderungen der Einstellung live beachten.",
      acceptance: `${webgl ? "Canvas enthält sichtbar das fachliche Objekt; ein unbenutzter Import oder 3D nur im Text erfüllt die Anforderung nicht." : "Beschriebener Start-/Endzustand ist sichtbar und die Nutzeraktion funktioniert."} Fehlerfall und Reduced Motion prüfen; Datei, Komponente und tatsächlichen Prüfnachweis dokumentieren.`,
    };
  });
  return {
    version: REFERENCE_METHOD_VERSION, methodCount: CREATIVE_TECHNIQUES.length,
    companyFocus: context.focus, evidenceStatus: context.status, scenes,
    game: websiteGameFor(business, settings, fingerprint.seed, context.focus),
    referenceStandards: (() => {
      const ref = referenceStandardFor(business, settings, fingerprint.seed);
      return [
        `Referenzprinzip: ${ref.name}. ${ref.style}`,
        `Beobachtet in ${ref.file}: ${ref.observed} ${ref.limit}`,
        `Übertragung für ${business.name}: Hauptmotiv aus „${context.focus}“ ableiten${context.audience ? `; Besucher: ${context.audience}` : ""}${context.difference ? `; belegbare Eigenheit: ${context.difference}` : ""}. Das Originalmotiv ist keine Vorgabe für diese Firma.`,
        "Beobachtung und Bauvorschlag trennen: Kamerawackeln, Perspektive des abgefilmten Monitors, Creator-Overlays und Videoschnitte sind keine Website-Effekte. Zeitstempel bezeichnen Belegstellen, keine verpflichtende Animationsdauer.",
        "Motivkontinuität, eigenständiger Satzspiegel, bewusste Ruhephasen, funktionierende Interaktionen und unterschiedliche Abschnittskompositionen sind Qualitätsanforderungen.",
        ...(ref.assetPlan ?? []).map((asset) => `Medienvorbereitung: ${asset}`),
        ...(ref.checkpoints ?? []).map((check) => `Referenz-Abnahme: ${check}`),
        "Pro Hauptmotiv ein Motivblatt mit Perspektive, Licht, Material, Zuschnitt und stabilen Layernamen erstellen. Herkunft, Rechte und Ersatzmotiv je Datei dokumentieren.",
        "Kein Austausch bloß von Firmenname und Farben. Wenn das Konzept unverändert für den zuletzt bearbeiteten Betrieb passt, Hauptmotiv, Abschnittsfolge und Interaktion neu ableiten.",
      ];
    })(),
    pageStructure: pageStructureFor(business, settings, fingerprint.seed, context.focus),
    constraints: [
      still ? "Animation aus hat Vorrang: keine dekorative Bewegung, Kamerafahrt, Scroll-Timeline oder Loop. Auch bewegte Referenzmethoden statisch umsetzen."
        : `Animation ${settings.animation}: alle unten als bewegt spezifizierten Szenen tatsächlich implementieren; CSS-Klassen ohne sichtbare Wirkung zählen nicht.`,
      settings.scrollMotion === "off" || still ? "Scroll aus: keine ScrollTrigger-, Pin-, Parallax- oder Scroll-Timeline-Effekte." : `Scroll ${settings.scrollMotion}: native Scrollbarkeit erhalten; maximal ein aktiver gepinnter Abschnitt, mobil ohne Pinning.`,
      !spatial ? "Räumliche Laufzeiteffekte aus: keine WebGL-Szene. Bei HTML/CSS/JS, Animation aus, einfacher Komplexität oder kleinem Budget wird die 3D-Auswahl statisch adaptiert."
        : `3D ${settings.spatialEffects}: ${settings.spatialEffects === "hero" ? "genau eine räumliche Hero-Szene" : settings.spatialEffects === "accent" ? "höchstens ein räumlicher Akzent" : "höchstens zwei kohärente räumliche Szenen"}; echter Renderer, motivbezogene Geometrie und überprüfbare Interaktion sind Pflicht.`,
      settings.typographyMotion === "still" || still ? "Typografie statisch: keine Wort-/Buchstaben-Reveals oder Texttransformation." : "H1, Kernnutzen und CTA bleiben während jeder Inszenierung lesbar.",
      "Manuell gewählte Dramaturgie hat Vorrang vor der Abschnittsfolge einer Stilwelt. Ihre Bild- und Bewegungsprinzipien an diesen Aufbau anpassen; keine zweite widersprüchliche Seitenstruktur bauen.",
      "Die nachfolgenden Szenenverträge haben Vorrang vor allgemeinen Referenzideen. Fallbacks nur für ausgeschaltete Effekte, Accessibility, fehlende freigegebene Assets oder nachgewiesene Geräte-/Performanceprobleme; Ersatz und Grund offen dokumentieren.",
    ],
    qualityGates: [
      `Identitätsprüfung: Motiv, Story und Interaktion aus „${context.focus}“ ableiten. Bei Austausch nur des Firmennamens darf das Konzept nicht unverändert passen. Unbekannte Prozesse als Vorschlag kennzeichnen.`,
      "Mindestens drei echte Unterschiede zur vorherigen Variante: Hauptmotiv, Hero-Mechanik, Abschnittsfolge, Bildregie oder Komposition; andere Farben allein reichen nicht.",
      "Pro SC-ID eine Abnahmematrix liefern: Datei/Komponente | umgesetzt oder Ersatz mit Grund | beobachteter Test. Nicht ausgeführte Prüfungen als ungeprüft markieren; keine erfundenen Testergebnisse.",
      "Desktop 1440px und Mobile 390px prüfen: Start, Mitte, Ende, Scroll zurück, Touch/Tastatur, Assetfehler, Reduced Motion und WebGL-Kontextverlust. H1/CTA bleiben vor Medienladung nutzbar; keine Scrollsperre.",
      "Build ausführen; LCP ≤2.5s, CLS ≤0.1 und INP ≤200ms als zu messende Ziele behandeln. Das Briefing allein bestätigt weder diese Werte noch die Qualität der fertigen Website.",
    ],
  };
}

function serializeImplementationPlan(plan: MasterPromptImplementationPlan) {
  return [
    "## Verbindlicher Animations- und 3D-Bauplan",
    `Methodenstand ${plan.version}: ${plan.methodCount} dauerhaft hinterlegte Methoden. Firmenfokus: ${plan.companyFocus}. ${plan.evidenceStatus}`,
    ...plan.constraints.map((rule) => `- ${rule}`),
    "\n### Qualitätsstandard aus den Video-Referenzen",
    ...plan.referenceStandards.map((rule) => `- ${rule}`),
    `\n### Eigener Seitenaufbau: ${plan.pageStructure.name}\n${plan.pageStructure.rationale}\n${plan.pageStructure.sections.map((step, index) => `${index + 1}. ${step}`).join("\n")}\nDieser Aufbau ersetzt die allgemeine Branchen-Ausgangsstruktur. Abschnittsfolge und Komposition nicht aus einer Referenz kopieren.`,
    `\n### Vorgehen für genau diesen Aufbau\n${plan.pageStructure.workflow.map((step, index) => `${index + 1}. ${step}`).join("\n")}`,
    ...plan.scenes.map((scene) => `\n### ${scene.id} · ${scene.name} [${scene.techniqueId}]\nPflichtkomponente: ${scene.component}; Darstellung: ${scene.renderer}.\nMotiv: ${scene.subject}\nTrigger: ${scene.trigger}\nAblauf: ${scene.timeline}\nUmsetzung: ${scene.implementation}\nAssets: ${scene.assets}\nMobile: ${scene.mobile}\nReduced Motion: ${scene.reducedMotion}\nAbnahme: ${scene.acceptance}`),
    ...(plan.game ? [`\n### Verbindliches Website-Spiel: ${plan.game.name}`, plan.game.brief, `Regeln: ${plan.game.rules}`, `Implementierung: ${plan.game.implementation}`, `Abnahme: ${plan.game.acceptance}`] : ["\nWebsite-Spiel ausgeschaltet: kein Minispiel ergänzen."]),
    "\n### Build-Nachweis und Eigenständigkeit",
    ...plan.qualityGates.map((gate) => `- ${gate}`),
    "Ein gespeicherter Prompt ist eine überprüfbare Spezifikation. Als fertig gilt die Website erst nach Umsetzung und tatsächlicher Prüfung dieser Kriterien.",
  ].join("\n");
}

function techniqueScore(definition: CreativeTechniqueDefinition, business: Business, settings: MasterPromptSettings, seed: number, research?: MasterPromptResearch) {
  const industry = industryKey(business);
  const category = normalize(`${business.category} ${business.name} ${research?.services?.join(" ") ?? ""} ${research?.differentiators?.join(" ") ?? ""}`);
  let score = hash(`${seed}:${definition.id}`) % 47;
  if (referenceStandardFor(business, settings, seed).methods.includes(definition.id)) score += 95;
  score += definition.industries.includes(industry) ? 82 : 8;
  score += settings.layout === "automatic" || definition.layouts.includes(settings.layout) ? 24 : 0;
  const archetypeFamilies: Record<Exclude<ExperienceArchetype, "automatic">, string[]> = {
    editorial: ["Editorial", "Composition", "Typography"],
    cinematic: ["Story", "Journey", "Transformation"],
    spatial: ["Spatial", "Journey"],
    product: ["Product", "Configurator", "Transformation"],
    technical: ["Process", "Explainer", "Clarity", "Proof"],
    experimental: ["Spatial", "Interaction", "Character", "Transformation"],
  };
  if (settings.experienceArchetype !== "automatic" && archetypeFamilies[settings.experienceArchetype].includes(definition.family)) score += 58;
  const storyFamilies: Record<Exclude<StoryStructure, "automatic">, string[]> = {
    direct: ["Clarity", "Proof"],
    chaptered: ["Story", "Composition", "Typography"],
    journey: ["Journey", "Spatial", "Process"],
    reveal: ["Transformation", "Composition", "Explainer"],
    catalog: ["Product", "Configurator", "Proof"],
  };
  if (settings.storyStructure !== "automatic" && storyFamilies[settings.storyStructure].includes(definition.family)) score += 36;
  if (settings.interactionDensity === "restrained" && definition.minimumAnimation > 1) score -= 38;
  if (settings.interactionDensity === "rich" && definition.minimumAnimation > 0) score += 20;
  if (settings.interactionDensity === "experimental" && ["Spatial", "Interaction", "Character", "Transformation"].includes(definition.family)) score += 32;
  if (settings.typographyMotion === "still" && definition.family === "Typography") score -= 35;
  if (settings.typographyMotion === "kinetic" && definition.family === "Typography") score += 36;
  if (settings.typographyMotion === "transformative" && ["Typography", "Transformation"].includes(definition.family)) score += 40;
  if (settings.assetDirection === "three-dimensional" && ["Spatial", "Product", "Configurator", "Explainer"].includes(definition.family)) score += 28;
  if (settings.assetDirection === "art-direction" && ["Editorial", "Story", "Composition"].includes(definition.family)) score += 24;
  if (settings.assetDirection === "existing-first" && definition.minimumBudget === 0) score += 20;
  if (["storytelling", "immersive"].includes(settings.scrollMotion) && ["Story", "Journey", "Transformation", "Spatial"].includes(definition.family)) score += 22;
  if (["hero", "experience"].includes(settings.spatialEffects) && definition.spatial !== "none") score += 24;
  if (["extraordinary", "experimental"].includes(settings.creativity) && ["Spatial", "Interaction", "Transformation"].includes(definition.family)) score += 18;
  if (definition.id === "motion-token-grammar") score += 20;
  if (settings.conversionGoal === "sales" && definition.family === "Product") score += 30;
  if (settings.conversionGoal === "booking" && ["Journey", "Story", "Clarity"].includes(definition.family)) score += 18;
  if (/(architekt|immobil|interior|raum)/.test(category) && ["architectural-camera-portal", "spatial-world-portals", "layered-depth-stacks"].includes(definition.id)) score += 50;
  if (/(restaurant|cafe|bar|imbiss|backer|food|gastro)/.test(category) && ["product-assembly-story", "editorial-anchor-object", "cinematic-tonal-chapters"].includes(definition.id)) score += 45;
  if (/(hotel|reise|flug|aviation|immobil|architekt|raum)/.test(category) && definition.id === "aperture-portal-journey") score += 42;
  if (/(beauty|friseur|kosmetik|mode|fashion|retail|gastro)/.test(category) && definition.id === "gesture-framed-editorial") score += 34;
  if (/(logistik|transport|liefer|werkstatt|auto|craft|handwerk|bau)/.test(category) && definition.id === "interactive-process-diorama") score += 48;
  if (/(mode|fashion|streetwear|beauty|friseur)/.test(category) && ["character-pose-chapters", "product-runway-configurator"].includes(definition.id)) score += 42;
  if (/(produkt|shop|handel|laden|mode|food|restaurant|beauty)/.test(category) && definition.id === "material-world-variants") score += 34;
  if (settings.transitions === "experimental" && ["aperture-portal-journey", "object-interface-match-cut", "material-to-result-morph"].includes(definition.id)) score += 22;
  return score;
}

function technicalDirectionFor(settings: MasterPromptSettings, techniques: CreativeTechniqueDefinition[]) {
  const containsSpatial = settings.spatialEffects !== "off" && settings.animation !== "none" && settings.technology !== "standard" && techniques.some((item) => item.spatial !== "none");
  const technology = {
    standard: "semantisches HTML, moderne CSS-Layouts, SVG und kleine progressive JavaScript-Module",
    next: "Next.js mit serverseitig gerendertem Inhalt und isolierten Client-Komponenten nur für Interaktionen",
    gsap: "Next.js oder semantisches HTML mit GSAP/ScrollTrigger ausschließlich für die choreografierten Schlüsselszenen",
    three: containsSpatial ? "Next.js mit lazy geladenem Three.js/WebGL-Modul und vollständig gleichwertiger HTML-Ebene" : "semantisches HTML ohne WebGL; die ausgeschalteten Effekte haben Vorrang vor der Technikpräferenz",
    automatic: containsSpatial
      ? "serverseitig gerenderte Inhaltsbasis plus lazy geladene GSAP- oder WebGL-Signaturszene"
      : "semantische, serverseitig lesbare Inhaltsbasis plus eine kleine progressive Motion-Schicht",
  }[settings.technology];
  const performance = settings.animation === "none" ? "statische, vollständig lesbare Inhalte ohne dekorative Animation ausliefern" : containsSpatial
    ? "3D-, Canvas- und Videolayer erst nach dem LCP laden; DPR und Partikelzahl deckeln; AVIF/WebP, poster, Pause außerhalb des Viewports und statischen Ersatz vorsehen"
    : "nur transform und opacity animieren, Layout-Shifts vermeiden, Motion-Code bündeln und Bilder responsive in AVIF/WebP ausliefern";
  const assetRule = {
    "existing-first": "zuerst vorhandene Unternehmensassets prüfen und nur belegte Lücken ergänzen",
    "art-direction": "eine konkrete Foto-/Film-Art-Direction mit Shotlist und Freigabeplan erstellen",
    "three-dimensional": containsSpatial ? "3D-Modelle, Materialvarianten und Fallback-Poster getrennt spezifizieren" : "statische Produktmotive und Materialansichten statt räumlicher Laufzeiteffekte spezifizieren",
    "ai-concept": "KI-Bilder nur als klar markierte Konzeptvisualisierung einsetzen und finale Rechte prüfen",
    hybrid: "Unternehmensbilder, lizenzierte Quellen und maßgeschneiderte 3D-/KI-Konzeptassets sauber trennen",
  }[settings.assetDirection];
  return `${technology}; ${performance}. Assetstrategie: ${assetRule}. Die Kernhandlung muss ohne JavaScript, Hover oder präzisen Pointer erreichbar bleiben.`;
}

function highEndBuildDirective(settings: MasterPromptSettings, blueprint: MasterPromptCreativeBlueprint, imagePlan: MasterPromptImagePlan, item: IndustryProfile) {
  const detail = settings.promptDepth === "compact" ? "kompakt, aber vollständig" : settings.promptDepth === "detailed" ? "detailliert mit nachvollziehbaren Zwischenentscheidungen" : "produktionsfertig mit umsetzbaren Artefakten und Abnahmekriterien";
  const interaction = {
    restrained: "Interaktion nur dort, wo sie Orientierung, Vertrauen oder Conversion verbessert",
    balanced: "eine klare Kerninteraktion pro Schlüsselabschnitt, ohne Bedienüberlastung",
    rich: "mehrschichtige Interaktionen mit sichtbaren Zuständen, Fokusführung und Fallbacks",
    experimental: "mutige, aber erklärbare Interaktionen mit Sicherheitsnetz, Exit und statischer Alternative",
  }[settings.interactionDensity];
  const typeRule = settings.animation === "none" ? "Typografie bleibt vollständig statisch" : {
    still: "Typografie bleibt statisch; Hierarchie, Zeilenbruch und Kontrast tragen die Wirkung",
    responsive: "Typografie reagiert nur auf Abschnitt, Fokus oder Eingabe und bleibt jederzeit lesbar",
    kinetic: "Typografie darf Rhythmus und Scrollgeschichte sichtbar tragen, aber niemals die Lesereihenfolge verlieren",
    transformative: "Wörter dürfen kontrolliert ihre Form oder Rolle wechseln; der semantische Text bleibt im DOM stabil",
  }[settings.typographyMotion];
  return [
    "## High-End-Produktions- und Build-Spezifikation",
    `Arbeite als Creative Director, Senior UX/UI-Designer, Content-Stratege, Accessibility-Spezialist und Staff Frontend Engineer in einer Person. Liefere ${detail} und baue eine echte, wartbare Website — keine lose Ideensammlung, kein generisches Template und keine bloße Designbeschreibung.`,
    `Manuelle Kreativsteuerung: Erlebnis ${settings.experienceArchetype}; Dramaturgie ${settings.storyStructure}; Interaktionsdichte ${settings.interactionDensity}; Typografiebewegung ${settings.typographyMotion}; Asset-Richtung ${settings.assetDirection}; Markenton ${settings.brandTone}. Diese Werte sind verbindliche Leitplanken und dürfen nur bei einem belegten Branchen- oder Performancekonflikt begründet angepasst werden.`,
    "",
    "### Verbindlicher Arbeitsablauf",
    "1. Fakten- und Annahmenregister anlegen: bestätigte Angaben, Rechercheaufträge und Platzhalter strikt trennen. Nichts erfinden.",
    "2. Positionierung und Nutzeraufgabe in einem Satz schärfen; danach drei eigenständige Konzepte mit unterschiedlichen Leitmotiven, Kompositionen und Interaktionslogiken bewerten.",
    `3. Die Kreativ-DNA „${blueprint.title}“ auf ${blueprint.storyArc.length} dramaturgische Schritte abbilden. Jede Szene braucht Ziel, Inhalt, visuelles Motiv, Zustände, Trigger, Exit, Mobile-Fallback und Reduced-Motion-Fassung.`,
    `4. Ein Designsystem mit Farbrollen, Typografie-Skala, Spacing, Grid, Radius, Schatten, Fokuszuständen und Motion-Tokens definieren. ${typeRule}.`,
    "5. Für jede Komponente Zweck, Datenmodell, Default-, Hover-, Focus-, Active-, Loading-, Empty-, Error- und Disabled-Zustand sowie Desktop-, Tablet- und Mobile-Verhalten dokumentieren.",
    `6. Bild- und Medienplan mit diesen Vorgaben erstellen: ${imagePlan.direction}; Suchbegriffe ${imagePlan.searchQueries.join(" | ")}. Jede Quelle, Lizenz, Alt-Beschreibung, Zuschnittvariante und performante Ersatzdarstellung angeben.`,
    "7. Semantisches HTML, Tastaturbedienung, sichtbare Fokusführung, WCAG-2.2-AA-Kontraste, Screenreader-Reihenfolge, Touch-Ziele und prefers-reduced-motion von Anfang an einplanen.",
    "8. Umsetzung mit klarer Komponentenstruktur, lokaler Zustandslogik, validierten Formularen, sicheren externen Links und ohne Geheimnisse im Client beschreiben. Keine Animation darf Layout-Shifts oder unzugängliche Inhalte verursachen.",
    "9. Performance als harte Akzeptanzkriterien behandeln: responsive Bilder, AVIF/WebP, lazy Medien, LCP-Ziel unter 2,5 s, CLS unter 0,1, INP-Ziel unter 200 ms auf einem mittleren Mobilgerät; schwere Szenen erst nach dem Kerninhalt laden.",
    "10. Eine QA-Matrix für mindestens 375, 768, 1024 und 1440 px sowie Tastatur, Touch, langsames Netz, Reduced Motion, leere Daten, fehlende Bilder und Formularfehler liefern. Erst nach dieser Prüfung als fertig markieren.",
    "",
    "### Interaktionsbudget",
    `${interaction}. Jede Interaktion muss eine verständliche Rückmeldung, einen erreichbaren Endzustand und eine statische Alternative besitzen.`,
    "",
    "### Branchen- und Vertrauenslogik",
    `Die Website muss ${item.audience.toLocaleLowerCase("de-DE")} führen und nur belegbare Signale wie ${item.trust.join(", ")} verwenden. Inhalte, Preise und Referenzen bleiben bis zur Bestätigung Platzhalter.`,
    "",
    "### Finales Ausgabeformat",
    "Liefere in dieser Reihenfolge: Konzeptentscheidung, Annahmenregister, Seiten-/Abschnittsmap, Designsystem, Content-Schema, Komponentenverträge, Bild-/Medienbriefing, Motion-Storyboard, technische Architektur, konkrete Build-Schritte, SEO-/Accessibility-Plan, Performance-Budget, QA-Matrix und offene Freigaben.",
  ].join("\n");
}

type ExpressProfile = {
  minutes: number;
  label: string;
  scope: string;
  sections: string;
  interactions: string;
  assets: string;
  research: string;
  phases: string[];
  technology: string;
};

const EXPRESS_SCOPE_PROFILES: Record<ExpressScope, { label: string; routes: string; architecture: string; delivery: string }> = {
  focused: { label: "Fokussierter Auftritt", routes: "1–2 Routen", architecture: "eine klare Story mit modularen Abschnitten und direktem Conversion-Pfad", delivery: "innerhalb der gewählten Zeitbox vollständig polieren" },
  large: { label: "Große Business-Website", routes: "5–8 Routen", architecture: "wiederverwendbares Designsystem, gemeinsame Inhaltsmodelle, klare Navigation und routenübergreifende Conversion", delivery: "zuerst System, Kernrouten und belastbare Templates fertigstellen" },
  signature: { label: "High-End Signature Website", routes: "8–14 Routen", architecture: "skalierbares Premium-Designsystem, dramaturgische Kernreise, modulare Unterseiten und kontrollierte Signature-Momente", delivery: "die Zeitbox als ersten autonomen Produktionssprint behandeln; Qualität, Rechte und Stabilität nie opfern" },
};
const RESEARCH_DEPTH_PROFILES: Record<ResearchDepth, { pages: number; brief: string }> = {
  quick: { pages: 1, brief: "offizielle Startseite, Basisdaten, Kartenlink und freie Bildquellen" },
  standard: { pages: 4, brief: "Startseite plus relevante Leistungs-, Über-uns-, Kontakt- und Rechtsseiten" },
  deep: { pages: 7, brief: "mehrseitiger Bestand, Markenmerkmale, Angebotsstruktur, Social- und Wettbewerbsrahmen" },
  maximum: { pages: 10, brief: "maximaler Quellenlauf mit Content-Inventar, Bildherkunft, Lizenzstatus und Widerspruchsliste" },
};
const AUTONOMY_PROFILES: Record<AutonomyLevel, string> = {
  assist: "Recherchevorschläge liefern und kritische Übernahmen bestätigen lassen.",
  guided: "Sichere Fakten und freie Quellen automatisch übernehmen; Unklares als Freigabepunkt markieren.",
  autopilot: "Recherche, Entscheidung, Build und QA selbstständig ausführen; nur echte Rechte-, Identitäts- oder Zugangshürden blockieren.",
};

const EXPRESS_PROFILES: Record<ExpressTimebox, ExpressProfile> = {
  "60": {
    minutes: 60,
    label: "1 Stunde",
    scope: "eine fokussierte Onepage mit 5–6 klaren Abschnitten",
    sections: "maximal 6 Abschnitte: Hero, Nutzen, Leistung, Beleg, Ablauf/FAQ und CTA",
    interactions: "genau eine Signaturinteraktion plus normale Bedien- und Fokuszustände",
    assets: "höchstens 3 Kernmotive und 1 mobile Ersatzvariante",
    research: "5–10 Minuten für offizielle Fakten, bestehende Bildquellen und Rechtehinweise",
    phases: ["0–10 Min · Fakten und Quellen sichern", "10–15 Min · eine Leitidee und Seitenstruktur festlegen", "15–50 Min · direkt bauen, responsive ausarbeiten und Inhalte einsetzen", "50–58 Min · QA auf Mobile, Desktop, Tastatur und Reduced Motion", "58–60 Min · Ergebnis, offene Freigaben und nächste Aktion dokumentieren"],
    technology: "Semantisches HTML/CSS, leichte progressive JavaScript-Interaktion; kein WebGL, kein Custom-Backend und keine zusätzliche Route.",
  },
  "120": {
    minutes: 120,
    label: "2 Stunden",
    scope: "eine polierte Business-Onepage oder ein sehr kleiner Auftritt mit einer Haupt- und einer Kontaktansicht",
    sections: "6–8 Abschnitte mit klarer Story: Hero, Positionierung, Leistungen, Prozess, Beweise, Team/Ort, FAQ und CTA",
    interactions: "höchstens zwei inhaltlich begründete Schlüsselinteraktionen plus solide Microinteractions",
    assets: "höchstens 4 Kernmotive, davon mindestens ein authentisches Unternehmens- oder Ortsmotiv",
    research: "10–15 Minuten für offizielle Fakten, Website-Signale, Bildquellen, Wettbewerbsrahmen und Rechtehinweise",
    phases: ["0–15 Min · Fakten-, Annahmen- und Quellenregister prüfen", "15–25 Min · eine Leitidee, Dramaturgie und Komponenten-Map entscheiden", "25–95 Min · direkt bauen, responsive States, CTA und Kerninteraktionen umsetzen", "95–115 Min · QA, Performance-Sanity-Check und Rechte-/Content-Lücken prüfen", "115–120 Min · Preview, Blocker und Handoff ausgeben"],
    technology: "Semantische Inhaltsbasis plus eine kleine progressive Motion-Schicht; schwere Libraries nur lazy und nur bei echtem Nutzen.",
  },
  "180": {
    minutes: 180,
    label: "3 Stunden",
    scope: "ein tiefer Signature-Onepager mit optionaler zweiter Kontakt-/Anfrageansicht",
    sections: "8–10 Abschnitte oder maximal 2 Routen; jede zusätzliche Ebene muss eine echte Nutzeraufgabe lösen",
    interactions: "bis zu drei choreografierte Schlüsselinteraktionen mit statischem, mobilem und Reduced-Motion-Fallback",
    assets: "höchstens 5 Kernmotive plus klar benannte Ersatzdarstellungen",
    research: "15–20 Minuten für offizielle Fakten, Bestandsanalyse, Wettbewerbs- und Bildrecherche sowie Rechteprüfung",
    phases: ["0–20 Min · Fakten, Bestand, Quellen und Freigaberisiken sichern", "20–35 Min · eine unverwechselbare Leitidee und ein umsetzbares Designsystem festlegen", "35–145 Min · direkt bauen, Signaturmoment, responsive Verhalten und Conversion-Pfad umsetzen", "145–170 Min · vollständige QA, Performance- und Accessibility-Prüfung", "170–180 Min · Preview, offene Freigaben, Übergabe und nächste Iteration dokumentieren"],
    technology: "Serverseitig lesbare Basis plus gezielte progressive Motion; ein leichter 2.5D-/Canvas-Akzent ist erlaubt, Voll-WebGL nur mit sofortigem Fallback.",
  },
};

function expressProfileFor(timebox: ExpressTimebox) {
  return EXPRESS_PROFILES[timebox] ?? EXPRESS_PROFILES["120"];
}

export function assessExpressReadiness(
  result: Pick<MasterPromptResult, "missingFacts" | "facts">,
  business?: Business | StoredLead,
): ExpressReadiness {
  const weights: Record<string, number> = {
    images: 12,
    services: 10,
    audience: 8,
    usp: 8,
    contact: 5,
    email: 5,
    openingHours: 4,
    phone: 4,
    address: 3,
  };
  let score = 100;
  for (const fact of result.missingFacts) score -= weights[fact.key] ?? 5;
  if (business?.website && !business.websiteReport) score -= 8;
  if (business?.websiteStatus === "unreachable") score -= 8;
  if (!result.facts.length) score -= 10;
  score = Math.max(20, Math.min(100, score));
  const label = score >= 78 ? "Express-bereit" : score >= 55 ? "Mit Platzhaltern" : "Vorbereitung nötig";
  const tone = score >= 78 ? "ready" : score >= 55 ? "warning" : "blocked";
  return { score, label, tone, openItems: result.missingFacts.slice(0, 5).map((fact) => fact.label) };
}

function expressBuildDirective({
  business,
  mode,
  settings,
  item,
  available,
  missing,
  evidence,
  fingerprint,
  imagePlan,
  blueprint,
  motionPlan,
  offer,
}: {
  business: Business | StoredLead;
  mode: MasterPromptMode;
  settings: MasterPromptSettings;
  item: IndustryProfile;
  available: MasterPromptFact[];
  missing: MissingMasterPromptFact[];
  evidence: string;
  fingerprint: DesignFingerprint;
  imagePlan: MasterPromptImagePlan;
  blueprint: MasterPromptCreativeBlueprint;
  motionPlan: MasterPromptMotionPlan;
  offer: { name: string; price: number };
}) {
  const profile = expressProfileFor(settings.expressTimebox);
  const scope = EXPRESS_SCOPE_PROFILES[settings.expressScope];
  const researchDepth = RESEARCH_DEPTH_PROFILES[settings.researchDepth];
  const confirmed = available.map((fact) => `- ${fact.label}: ${fact.value} (Quelle: ${fact.source})`).join("\n") || "- Noch keine bestätigten Zusatzdaten; mit sichtbaren Platzhaltern arbeiten.";
  const unresolved = missing.map((fact) => `- ${fact.placeholder}: ${fact.label}; ${fact.reason}`).join("\n") || "- Keine erwarteten Pflichtangaben fehlen.";
  const evidenceBlock = evidence || "- Keine zusätzlichen Quellen hinterlegt.";
  const sections = blueprint.storyArc.slice(0, settings.expressTimebox === "60" ? 4 : settings.expressTimebox === "120" ? 5 : 6).map((step, index) => `${index + 1}. ${step}`).join("\n");
  const motion = motionPlan.scenes.slice(0, settings.expressTimebox === "60" ? 2 : settings.expressTimebox === "120" ? 3 : 4).map((scene, index) => `${index + 1}. ${scene.name}: ${scene.choreography}; Zweck: ${scene.purpose}; Fallback: ${scene.mobileFallback}; Reduced Motion: ${scene.reducedMotion}`).join("\n");
  return [
    `# WebWorkBalance Express Build · ${profile.label}`,
    "",
    "Du bist ein autonomer Creative Director, UX/UI-Designer, Conversion-Texter und Senior Frontend Engineer. Baue jetzt eine echte, hochwertige und veröffentlichungsnahe Website. Antworte nicht mit einer losen Strategie und warte nicht auf eine weitere Konzeptauswahl: entscheide dich für die eine passende Leitidee und implementiere sie direkt im vorhandenen Projekt oder Website-Builder.",
    `Zeitbox: ${profile.minutes} Minuten. Projektklasse: ${scope.label} mit ${scope.routes}. Architektur: ${scope.architecture}. Lieferstrategie: ${scope.delivery}.`,
    `Autonomie: ${settings.autonomyLevel}. ${AUTONOMY_PROFILES[settings.autonomyLevel]}`,
    `Technischer Rahmen: ${blueprint.technicalDirection}`,
    "High-End entsteht hier durch eine eigene visuelle These, starke Typografie, präzise Abstände, glaubwürdige Inhalte, einen kontrollierten Signature-Moment und saubere Zustände — nicht durch möglichst viele Features.",
    "",
    "## Harte Scope-Regeln",
    `- Geplanter Umfang: ${scope.routes}. ${settings.expressScope === "focused" ? profile.sections : scope.architecture}. Keine Integrationen ohne bestätigten Nutzen und Zugang beginnen.`,
    "- Der gemeinsame SC-Szenenbauplan legt den Zielumfang fest; die Zeitbox ist bei mehreren Pflichtszenen nur ein Sprint. Offene Szenen ehrlich als Folgesprint ausweisen.",
    "- Assets nach dem SC-Szenenbauplan priorisieren. Quelle, Lizenz, Alt-Beschreibung und Herkunft dokumentieren.",
    "- Wenn Zeit knapp wird, optionale Varianten, Medien und Abschnitte verschieben. Die verbindlichen SC-Szenen umsetzen oder als offenen Folgesprint ausweisen; nie stillschweigend streichen. Niemals Faktenprüfung, mobile Nutzbarkeit, Tastaturbedienung, CTA oder Build-Stabilität schneiden.",
    "- Keine erfundenen Leistungen, Preise, Personen, Bewertungen, Referenzen, Zertifikate, Öffnungszeiten, Historie oder Bildrechte. Ungeklärtes bleibt als klarer Platzhalter im Ergebnis.",
    "",
    "## Zeitplan",
    ...profile.phases.map((phase) => `- ${phase}`),
    `- Recherchemodus: ${settings.researchDepth}; bis zu ${researchDepth.pages} offizielle Seiten auswerten. Fokus: ${researchDepth.brief}.`,
    `- Recherchebudget: ${profile.research}. Bei großem Umfang Recherche und Build parallelisieren, ohne die Quellenprüfung abzukürzen.`,
    "",
    "## Autonome Recherche",
    "1. Offizielle Website und relevante Unterseiten sicher öffnen; Titel, Beschreibung, Leistungen, Kontakt, Markenfarben, Technik und Navigation extrahieren.",
    "2. Google Maps nur als manuellen/autorisierten Firmeneintrag öffnen. Keine Maps-Fotos oder Bewertungen scrapen, herunterladen oder ohne Nutzungsrecht übernehmen.",
    "3. Öffentliche Suchpfade vorbereiten; Treffer bleiben unbestätigt, bis Identität und Quelle stimmen.",
    "4. Bilder aus freigegebenen Firmenassets oder offenen Quellen sammeln und Quelle, Urheber, Lizenz, Nutzungsstatus und Alt-Text dokumentieren.",
    "5. Widersprüche, fehlende Daten und unklare Rechte in eine Freigabeliste schreiben. Nichts erfinden oder Schutzmechanismen umgehen.",
    "6. Ein kopierfertiges Recherche-Dossier und Content-/Asset-Inventar erzeugen.",
    "",
    "## Auftrag und verifizierte Daten",
    `- Unternehmen: ${business.name}; Produktionsmodus: ${mode}; Hauptziel: ${settings.conversionGoal}; Branchenbasis: ${item.audience}.`,
    confirmed,
    "",
    "## Offene Angaben und Recherchefragen",
    unresolved,
    "Nutze offizielle Quellen zuerst. Markiere jede Aussage als bestätigt, aus Quelle übernommen, unbestätigt oder Platzhalter. Behandle Suchtreffer und Inspirationsbilder nie als Firmenfakten.",
    "",
    "## Quellen",
    evidenceBlock,
    "Referenzen nur als abstrakte Prinzipien analysieren, niemals kopieren. Fremde Bilder, Logos, Texte, Schriften und Designs nur mit dokumentierten Rechten nutzen.",
    "",
    "## Eine verbindliche Kreativentscheidung",
    `- Design-Fingerabdruck ${fingerprint.id}: ${fingerprint.concept}.`,
    `- Komposition: ${fingerprint.composition}; Hero: ${fingerprint.hero}; Farbwelt: ${fingerprint.palette}; Typografie: ${fingerprint.typography}.`,
    `- Bildregie: ${fingerprint.imagery}; Rhythmus: ${fingerprint.rhythm}.`,
    `- Kreativ-DNA: ${blueprint.title}; visuelle Metapher: ${blueprint.visualMetaphor}; Signature Moment: ${blueprint.signatureMoment}.`,
    `- Steuerung: Kreativität ${settings.creativity}; Komplexität ${settings.complexity}; Markenton ${settings.brandTone}; Asset-Richtung ${settings.assetDirection}; Mobile ${settings.mobilePriority}.`,
    "Keine drei Konzepte ausarbeiten. Diese eine Richtung begründen, in ein kleines Designsystem übersetzen und umsetzen.",
    ...(settings.customInstructions ? ["", "## Eigene Wünsche", settings.customInstructions, "Diese Wünsche dürfen Fakten-, Rechte-, Performance- und Barrierefreiheitsregeln nicht verletzen."] : []),
    "",
    "## Kompakte Seiten- und Build-Spezifikation",
    sections,
    `- Bildplan: ${imagePlan.direction}. Kernmotive: ${imagePlan.requiredAssets.slice(0, settings.expressTimebox === "60" ? 2 : settings.expressTimebox === "120" ? 3 : 4).join(" | ")}. Suchbegriffe: ${imagePlan.searchQueries.join(" | ")}.`,
    `- Motion-Storyboard: ${motion}`,
    `- Vertrauenslogik: nur belegbare Signale wie ${item.trust.join(", ")}; Zielhandlung „${settings.conversionGoal}“ als klarer, zugänglicher Abschluss.`,
    `- Angebotshinweis: ${offer.name}, ca. ${offer.price.toLocaleString("de-DE")} € netto als interne Orientierung; nicht ohne Freigabe veröffentlichen.`,
    "",
    "## Umsetzungs- und Qualitätsvertrag",
    "1. Erst die semantische, lesbare Inhaltsbasis und das responsive Layout bauen; danach nur die geplanten Signature-Effekte ergänzen.",
    "2. Jede Komponente erhält sichtbare Default-, Hover-, Focus-, Active-, Loading-, Empty-, Error- und Disabled-Zustände, soweit sie vorkommen. Formulare nur mit bestätigtem Ziel/Endpoint bauen; sonst Kontaktaktion als sichere Alternative.",
    "3. WCAG-2.2-AA-Kontraste, sichtbarer Tastaturfokus, logische Screenreader-Reihenfolge, Touch-Ziele und prefers-reduced-motion von Anfang an berücksichtigen.",
    "4. Responsive bei 375, 768, 1024 und 1440 px prüfen. Bilder optimieren, Layout-Shifts vermeiden, schwere Medien lazy laden, keine Secrets im Client.",
    "5. Vor Übergabe Build ausführen und mindestens Startseite, CTA, Navigation, externe Links, Formularfehler, langsames Netz und Reduced Motion testen. Nur als fertig melden, wenn keine blockierenden Fehler offen sind.",
    "",
    "## Handoff",
    "Liefere am Ende: Preview/URL, kurze Liste der tatsächlich gebauten Bereiche, bestätigte Fakten, offene Platzhalter/Rechte, QA-Ergebnis, verbleibende Blocker und genau eine empfohlene nächste Kundenfreigabe.",
  ].join("\n");
}

export function createCreativeBlueprint({
  business,
  mode,
  settings,
  fingerprint,
  research,
}: {
  business: Business;
  mode: MasterPromptMode;
  settings: MasterPromptSettings;
  fingerprint: DesignFingerprint;
  research?: MasterPromptResearch;
}): MasterPromptCreativeBlueprint {
  const animationRank = ANIMATION_RANK[settings.animation];
  const complexityRank = COMPLEXITY_RANK[settings.complexity];
  const budgetRank = BUDGET_RANK[settings.budget];
  const eligible = CREATIVE_TECHNIQUES
    .filter((item) => item.family !== "Typography" || settings.typographyMotion !== "still")
    .filter((item) => item.minimumAnimation <= animationRank)
    .filter((item) => item.minimumComplexity <= complexityRank)
    .filter((item) => item.minimumBudget <= budgetRank)
    .filter((item) => item.spatial !== "required" || (settings.spatialEffects !== "off" && settings.mobilePriority !== "speed" && settings.technology !== "standard"))
    .sort((left, right) => techniqueScore(right, business, settings, fingerprint.seed, research) - techniqueScore(left, business, settings, fingerprint.seed, research));
  const wanted = { simple: 3, professional: 4, complex: 5, "high-end": 6 }[settings.complexity];
  const selectedDefinitions: CreativeTechniqueDefinition[] = [];
  const referenceSignature = referenceStandardFor(business, settings, fingerprint.seed).signatureMethod;
  const signature = eligible.find((item) => item.id === referenceSignature);
  if (signature) selectedDefinitions.push(signature);
  const spatialSignature = settings.animation !== "none" && ["hero", "experience"].includes(settings.spatialEffects)
    ? eligible.find((item) => item.spatial !== "none") : undefined;
  if (spatialSignature && !selectedDefinitions.includes(spatialSignature)) selectedDefinitions.push(spatialSignature);
  for (const candidate of eligible) {
    if (candidate.id === "motion-token-grammar") continue;
    if (selectedDefinitions.length >= wanted) break;
    if (selectedDefinitions.some((item) => item.family === candidate.family)) continue;
    if (selectedDefinitions.includes(candidate)) continue;
    selectedDefinitions.push(candidate);
  }
  for (const candidate of eligible) {
    if (candidate.id === "motion-token-grammar") continue;
    if (selectedDefinitions.length >= wanted) break;
    if (selectedDefinitions.includes(candidate)) continue;
    selectedDefinitions.push(candidate);
  }
  const techniques = selectedDefinitions.map(({ id, name, family, direction, implementation, fallback, spatial }) => {
    const staticOnly = settings.animation === "none" || (spatial === "optional" && settings.spatialEffects === "off");
    const resolved = staticOnly ? `Statische Adaption: ${fallback} Keine automatische Bewegung oder räumliche Laufzeiteffekte.` : implementation;
    return { id, name, family, direction: staticOnly ? fallback : direction, implementation: resolved, fallback: settings.animation === "none" ? "Lesbaren Endzustand ohne Bewegung sofort zeigen." : fallback };
  });
  const primary = techniques[0] ?? CREATIVE_TECHNIQUES[0];
  const secondary = techniques[1] ?? CREATIVE_TECHNIQUES[1];
  const item = PROFILES[industryKey(business)] ?? PROFILES.generic;
  const visualMetaphor = `${creativeMetaphorFor(business, fingerprint.seed)}. Konkreter Fokus: ${companyDesignContext(business, research).focus}.`;
  const structureLabel = { automatic: "eine aus Branche und Ziel abgeleitete Dramaturgie", direct: "eine direkte Nutzen-zu-Handlung-Führung", chaptered: "klar getrennte visuelle Kapitel", journey: "eine fortlaufende Nutzerreise", reveal: "eine schrittweise Enthüllung", catalog: "einen fokussierten Katalogfluss" }[settings.storyStructure];
  const toneLabel = { automatic: "branchenpassender Ton", "quiet-luxury": "Quiet-Luxury-Ton", "bold-editorial": "Bold-Editorial-Ton", "warm-human": "warmen menschlichen Ton", "technical-precise": "technisch präzisen Ton", "future-forward": "zukunftsorientierten Ton" }[settings.brandTone];
  const storyArc = [
    `Sofortiger Auftakt: „${visualMetaphor}“ in ${structureLabel} und einem verständlichen Hero-Moment eröffnen.`,
    `Orientierung: Leistungen über ${primary.name.toLocaleLowerCase("de-DE")} ordnen, ohne Informationen hinter Effekten zu verstecken.`,
    `Vertiefung: Arbeitsweise oder Auswahl mit ${secondary.name.toLocaleLowerCase("de-DE")} konkret erlebbar machen.`,
    `Beweis: ${item.trust.join(", ")} mit Quelle, Kontext und ruhiger Vergleichbarkeit zeigen.`,
    `Handlung: Alle visuellen Motive im ${toneLabel} zum Ziel „${settings.conversionGoal}“ zurückführen und mit einem klaren nächsten Schritt abschließen.`,
  ];
  const signatureMoment = settings.animation === "none"
    ? `Ein unverwechselbares Detail aus der realen Arbeit von ${business.name} verbindet Hero, Leistungsübersicht und CTA als statische visuelle Klammer.`
    : `Beim Übergang von Leistung zu Beweis verwandelt sich ein echtes Detail von ${business.name} nach dem Prinzip „${primary.name}“ in den nächsten inhaltlichen Zustand; „${secondary.name}“ übernimmt anschließend die Orientierung, nie bloße Dekoration.`;
  const blueprintSeed = hash(`${fingerprint.seed}:${mode}:${techniques.map((item) => item.id).join("|")}:${REFERENCE_METHOD_VERSION}`);
  return {
    id: `DNA-${blueprintSeed.toString(36).toUpperCase().padStart(7, "0")}`,
    title: `${primary.name} × ${secondary.name}`,
    referenceStudyCount: VIDEO_STYLE_STANDARDS.length,
    visualMetaphor,
    storyArc,
    techniques,
    signatureMoment,
    technicalDirection: technicalDirectionFor(settings, selectedDefinitions),
    originalityRules: [
      "Keine Referenzseite, Marke, Produktdarstellung, Textzeile, Farbkombination oder Abschnittsfolge nachbauen.",
      "Nur abstrakte Prinzipien übernehmen und Motiv, Komposition, Typografieverhalten, Übergangslogik und Interaktion aus echten Unternehmensmerkmalen neu ableiten.",
      "Eine Alternative muss sich in mindestens drei Dimensionen unterscheiden: Leitmotiv, Hero-Mechanik, Komposition, Farbdramaturgie, Typografie, Szenenfolge oder Interaktionsmuster.",
      "Jeder Effekt benötigt eine fachliche Aussage, eine bedienbare statische Form, einen Mobile-Fallback und eine prefers-reduced-motion-Variante.",
      "Bilder, Videos, Modelle, Schriften und Audios nur mit dokumentierten Nutzungsrechten verwenden.",
    ],
  };
}

function offerFor(business: Business, prices: PriceSettings) {
  const premium = ["health", "professional", "hotel", "auto"].includes(industryKey(business));
  return { name: premium ? "Premium Business Website" : "Business Website", price: premium ? prices.premium : prices.business };
}

function imagePlanFor(business: Business, fingerprint: DesignFingerprint, item: IndustryProfile, settings: MasterPromptSettings): MasterPromptImagePlan {
  const location = business.address || "Region des Unternehmens";
  const assetDirection = {
    "existing-first": "Zuerst vorhandene Firmenbilder prüfen; fehlende Motive als Shotlist nachproduzieren.",
    "art-direction": "Eine konkrete Foto-/Film-Art-Direction mit Licht, Perspektive, Requisiten und Freigaben planen.",
    "three-dimensional": "3D-Modelle, Materialvarianten und Poster-Frames als getrennte Produktionsassets spezifizieren.",
    "ai-concept": "KI-Bilder nur als markierte Konzeptvisualisierung einsetzen; finale Rechte und echte Firmenmotive separat klären.",
    hybrid: "Firmenbilder, lizenzierte Quellen, KI-Konzeptbilder und 3D-Assets in einer transparenten Herkunftsmatrix trennen.",
  }[settings.assetDirection];
  return {
    direction: `${fingerprint.imagery}; die Motive erzählen „${fingerprint.concept}“ und folgen der Strategie ${settings.imagery}. ${assetDirection}`,
    requiredAssets: [
      `Hero-Motiv: authentischer Schlüsselmoment aus „${item.theme}“, mit Platz für die Hauptaussage`,
      `Prozessmotiv: echte Arbeit oder Leistung als nachvollziehbare Sequenz statt beliebigem Stockfoto`,
      `Vertrauensmotiv: Team, Ort, Ergebnis oder Detail, das einen belegbaren Vertrauenspunkt zeigt`,
      `Mobile Ersatzmotive: performante Hochformat- oder Standbildvarianten für schwere Szenen`,
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
  const scrollTrigger = settings.animation === "none" ? "sofort sichtbar, keine Bewegung" : settings.storyStructure === "direct" || settings.scrollMotion === "off" ? "beim sichtbaren Laden, nicht an Scrollposition koppeln" : settings.scrollMotion === "light" ? "einmalig bei 20 % Sichtbarkeit" : settings.storyStructure === "catalog" ? "beim Wechsel des fokussierten Eintrags" : "progressiv zwischen 10 % und 75 % Abschnittssichtbarkeit";
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
      trigger: settings.animation === "none" || settings.scrollMotion === "off" ? "sofort nach sichtbarem Laden, ohne Scroll-Kopplung" : settings.scrollMotion === "immersive" ? "wenn der vorherige Erzählabschnitt zu 80 % abgeschlossen ist" : "nach sichtbarem Laden des Belegabschnitts",
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
  const fingerprint = createDesignFingerprint({ business: input.business, mode, settings, variant: input.variant, research: input.research });
  const item = PROFILES[industryKey(input.business)] ?? PROFILES.generic;
  const imagePlan = imagePlanFor(input.business, fingerprint, item, settings);
  const creativeBlueprint = createCreativeBlueprint({ business: input.business, mode, settings, fingerprint, research: input.research });
  const motionPlan = motionPlanFor(input.business, fingerprint, item, settings, creativeBlueprint);
  const implementationPlan = createImplementationPlan(input.business, settings, fingerprint, creativeBlueprint, input.research);
  const offer = offerFor(input.business, input.prices);
  const evidence = input.research?.evidence?.length ? input.research.evidence.map((entry) => `- ${entry.label}: ${entry.value} | ${entry.sourceLabel} | ${entry.confidence} | ${entry.usage}${entry.sourceUrl ? ` | Quelle: ${entry.sourceUrl}` : ""}${entry.license ? ` | Lizenz: ${entry.license}` : ""}`).join("\n") : "- Noch keine zusätzlichen Quellen hinterlegt.";
  const webTasks = ["Drei deutlich unterschiedliche Leitideen entwickeln, bewerten und eine begründet auswählen.", "Informationsarchitektur mit Ziel, Botschaft, Beleg und Nutzeraktion je Abschnitt ausarbeiten.", "Hero und Schlüsselabschnitte mit Layout, Bildregie, Typografie, Interaktion und responsive Verhalten beschreiben.", "Die gewählte Kreativ-DNA in ein szenengenaues Desktop- und Mobile-Storyboard übersetzen.", "Animationen mit Trigger, Ausgangszustand, Bewegung, Zweck und Reduced-Motion-Alternative definieren.", "Assetliste mit Format, Perspektive, Herkunft, Rechten, Produktionsweg und performanter Alternative erstellen.", "Technik, Komponenten, Formulare, SEO, Barrierefreiheit, Performance-Budgets und Tests festlegen.", "Zum Abschluss eine Abnahme-Checkliste mit Breakpoints, Geräten, Ladezuständen, Fehlerfällen und Inhaltsfreigaben liefern."];
  const salesTasks = ["Einen beobachtungsbasierten Gesprächseinstieg ohne erfundene Schwächen formulieren.", "E-Mail, WhatsApp, Telefonleitfaden und respektvolles Follow-up erstellen.", "Demo-Idee, Nutzenargumente, Einwände und transparenten Preisrahmen ausarbeiten."];
  let tasks = mode === "acquisition" ? salesTasks : mode === "complete" ? [...webTasks, ...salesTasks] : webTasks;
  if (settings.promptDepth === "compact") tasks = tasks.slice(0, 3);
  if (settings.promptDepth === "detailed") tasks = tasks.slice(0, 6);
  const standardPrompt = `# Individueller WebWorkBalance-Masterprompt\n\nDu bist Creative Director, UX-Stratege, Conversion-Texter und Senior-Webentwickler. Erstelle kein austauschbares Branchen-Template. Leite jede Entscheidung aus diesem Unternehmen, seiner Arbeit, Zielgruppe und dem Geschäftsziel ab.\n\n## Auftrag\n${mission(mode)}\n\n## Verfügbare Daten\n${available.map((fact) => `- ${fact.label}: ${fact.value} (Quelle: ${fact.source})`).join("\n")}\n\n## Fehlende oder unbelegte Angaben\n${missing.map((fact) => `- ${fact.placeholder}: ${fact.label}; benötigt für ${fact.reason}`).join("\n") || "- Keine erwarteten Pflichtangaben fehlen."}\n\nErfinde niemals Leistungen, Preise, Personen, Bewertungen, Referenzen, Zertifikate, Öffnungszeiten oder Unternehmensgeschichte. Nutze Platzhalter und formuliere konkrete Recherchefragen.\n\n## Quellen und Referenzen\n${evidence}\nReferenzen nur analysieren, nicht kopieren. Bilder, Texte, Logos und Designs nur mit belegten Rechten verwenden.\n\n## Individuelles Bildkonzept\n- Richtung: ${imagePlan.direction}\n${imagePlan.requiredAssets.map((asset) => `- ${asset}`).join("\n")}\n- Recherchebegriffe: ${imagePlan.searchQueries.join(" | ")}\nKennzeichne jedes Bild als firmeneigen, lizenziert, KI-generiert oder reine Inspiration. Eine Suchtreffer-Zuordnung niemals als bestätigt behandeln.\n\n## Design-Fingerabdruck ${fingerprint.id}\n- Thema: ${fingerprint.theme}\n- Leitidee: ${fingerprint.concept}\n- Komposition: ${fingerprint.composition}\n- Hero: ${fingerprint.hero}\n- Farbwelt: ${fingerprint.palette}\n- Typografie: ${fingerprint.typography}\n- Bildregie: ${fingerprint.imagery}\n- Bewegung: ${fingerprint.motion}\n- Rhythmus: ${fingerprint.rhythm}\n\nDer Fingerabdruck ist Ausgangspunkt, kein Template. Vermeide generische SaaS-Heros, zufällige Verläufe, austauschbare Kartenraster und Effekte ohne Funktion.\n\n## Kreativ-DNA ${creativeBlueprint.id}\nDie Methodenbibliothek enthält übernommene Gestaltungsprinzipien und ${VIDEO_STYLE_STANDARDS.length} einzeln dokumentierte Video-Studien. Erneute Uploads werden nur einmal gezählt. Die Beobachtungen sind Qualitätsreferenzen; konkrete Technik, Laufzeitwerte und zusätzliche Abschnitte sind eigenständige Umsetzungsvorschläge.\n- Kombination: ${creativeBlueprint.title}\n- Unternehmensspezifische Metapher: ${creativeBlueprint.visualMetaphor}\n- Signature Moment: ${creativeBlueprint.signatureMoment}\n\n### Dramaturgie\n${creativeBlueprint.storyArc.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n### Gewählte Kreativtechniken\n${creativeBlueprint.techniques.map((technique, index) => `${index + 1}. ${technique.name} · ${technique.family}\n   - Idee: ${technique.direction}\n   - Umsetzung: ${technique.implementation}\n   - Fallback: ${technique.fallback}`).join("\n")}\n\n### Technischer Rahmen\n${creativeBlueprint.technicalDirection}\n\n### Eigenständigkeitsregeln\n${creativeBlueprint.originalityRules.map((rule) => `- ${rule}`).join("\n")}\n\n## Animationsregie\n- Signatur: ${motionPlan.signature}\n${motionPlan.scenes.map((scene, index) => `${index + 1}. ${scene.name}\n   - Trigger: ${scene.trigger}\n   - Choreografie: ${scene.choreography}\n   - Zweck: ${scene.purpose}\n   - Mobile: ${scene.mobileFallback}\n   - Reduced Motion: ${scene.reducedMotion}`).join("\n")}\n- Performance-Budget: ${motionPlan.performanceBudget}\n\n## Konfiguration\nKreativität ${settings.creativity}; Komplexität ${settings.complexity}; Animation ${settings.animation}; Scroll ${settings.scrollMotion}; 3D ${settings.spatialEffects}; Übergänge ${settings.transitions}; Layout ${settings.layout}; Bilder ${settings.imagery}; Mobile ${settings.mobilePriority}; Ziel ${settings.conversionGoal}; Tiefe ${settings.promptDepth}; Technik ${settings.technology}; Budget ${settings.budget}.\nBewegungsregel: ${movementRules(settings)}. Jede Animation muss Inhalt erklären, Marke spürbar machen oder Bedienung verbessern. prefers-reduced-motion, Touch, Tastatur und mobile Fallbacks einplanen.\n${settings.customInstructions ? `\n## Eigene Wünsche\n${settings.customInstructions}\nDiese Wünsche dürfen Fakten-, Rechte-, Performance- und Barrierefreiheitsregeln nicht verletzen.\n` : ""}\n## Branchenbasis\n- Zielgruppe: ${item.audience}\n- Vertrauenssignale: ${item.trust.join(", ")}\n- Ausgangsstruktur: ${["Nutzenversprechen", "Leistungen", ...item.sections, "Vertrauen", "Kontakt"].join(" → ")}\n- Preisannahme: ${offer.name}, etwa ${offer.price.toLocaleString("de-DE")} € netto; Umfang vor Angebot klären.\n\n## Ergebnis\n${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}\n\n## Qualitätskontrolle\nIst die Leitidee nur für dieses Unternehmen plausibel? Sind mindestens drei Gestaltungsdimensionen gegenüber bisherigen Varianten neu? Unterscheidet sich die Umsetzung in Aufbau, Bildregie und Bewegung klar von den Referenzstudien und üblichen Templates? Ist jede Aussage belegt oder markiert? Ist die mobile Version vollständig nutzbar? Passen Aufwand und Technik zum Budget? Bei einem Nein das Konzept überarbeiten.`;
  const productionDirective = highEndBuildDirective(settings, creativeBlueprint, imagePlan, item);
  const basePrompt = settings.productionTrack === "express"
    ? expressBuildDirective({ business: input.business, mode, settings, item, available, missing, evidence, fingerprint, imagePlan, blueprint: creativeBlueprint, motionPlan, offer })
    : `${standardPrompt}\n\n${productionDirective}`;
  const enrichedPrompt = `${basePrompt}\n\n${serializeImplementationPlan(implementationPlan)}`;
  const warnings = missing.map((fact) => `${fact.label}: ${fact.reason}`);
  if (settings.productionTrack === "express") warnings.push(`Express-Zeitbox: ${expressProfileFor(settings.expressTimebox).label}; Umfang ${EXPRESS_SCOPE_PROFILES[settings.expressScope].routes}. Bei großen Websites ist die Zeitbox ein Produktionssprint, keine Fertiggarantie; offene Angaben bleiben Platzhalter.`);
  if (settings.spatialEffects !== "off" && settings.mobilePriority === "speed") warnings.push("3D ist aktiv, obwohl mobile Geschwindigkeit Vorrang hat; ein statischer Fallback ist Pflicht.");
  return { mode, recommendedMode, settings, recommendationReasons: recommendation.reasons, facts: available, missingFacts: missing, fingerprint, imagePlan, creativeBlueprint, motionPlan, implementationPlan, prompt: enrichedPrompt, warnings };
}
