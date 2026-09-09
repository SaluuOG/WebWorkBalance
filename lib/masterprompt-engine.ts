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

export interface FingerprintOriginality {
  score: number;
  highestSimilarity: number;
  comparedWith: string | null;
  distinctDimensions: string[];
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
  motionPlan: MasterPromptMotionPlan;
  prompt: string;
  warnings: string[];
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

export const MASTER_PROMPT_MODES: Array<Option & { value: MasterPromptMode; hint: string }> = [
  { value: "new-website", label: "Neue Website", hint: "Kompletter neuer Auftritt" },
  { value: "redesign", label: "Redesign", hint: "Bestehenden Auftritt verbessern" },
  { value: "acquisition", label: "Akquise", hint: "Kontakt und Angebot vorbereiten" },
  { value: "complete", label: "Komplettpaket", hint: "Recherche bis Umsetzung" },
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
};

export const DEFAULT_MASTER_PROMPT_SETTINGS: MasterPromptSettings = {
  creativity: "individual", complexity: "professional", animation: "subtle", scrollMotion: "light",
  spatialEffects: "off", transitions: "soft", layout: "automatic", imagery: "mixed",
  mobilePriority: "balanced", conversionGoal: "contact", promptDepth: "production",
  technology: "automatic", budget: "medium", customInstructions: "",
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

export function createDesignFingerprint(input: Pick<MasterPromptInput, "business" | "mode" | "settings" | "variant">): DesignFingerprint {
  const recommended = recommendMasterPromptSettings(input.business).settings;
  const settings = { ...recommended, ...input.settings };
  const mode = input.mode ?? recommendMasterPromptMode(input.business);
  const item = PROFILES[industryKey(input.business)] ?? PROFILES.generic;
  const seed = hash([input.business.sourceId, input.business.name, input.business.address, mode, input.variant ?? 0, settings.creativity, settings.complexity, settings.animation, settings.layout].join("|"));
  return { id: `WWB-${seed.toString(36).toUpperCase().padStart(7, "0")}`, seed, theme: item.theme, concept: pick(item.concepts, seed, "concept"), composition: settings.layout === "automatic" ? pick(COMPOSITIONS, seed, "composition") : `${settings.layout}: ${pick(COMPOSITIONS, seed, "composition")}`, hero: pick(HEROS, seed, "hero"), palette: pick(item.palettes, seed, "palette"), typography: pick(TYPOGRAPHY, seed, "type"), imagery: pick(IMAGERY, seed, "image"), motion: settings.animation === "none" ? "nur unmittelbares Bedienfeedback" : `${pick(item.motions, seed, "motion")} (${settings.animation}, ${settings.scrollMotion})`, rhythm: pick(RHYTHMS, seed, "rhythm") };
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
  for (let attempt = 1; attempt <= 16 && bestOriginality.score < minimumOriginality; attempt += 1) {
    const candidateVariant = startVariant + attempt;
    const candidateResult = generateMasterPrompt({ ...input, variant: candidateVariant });
    const candidateOriginality = assessFingerprintOriginality(candidateResult.fingerprint, existing);
    if (candidateOriginality.score > bestOriginality.score) {
      bestResult = candidateResult;
      bestVariant = candidateVariant;
      bestOriginality = candidateOriginality;
    }
  }
  return { result: bestResult, variant: bestVariant, originality: bestOriginality };
}

function mission(mode: MasterPromptMode) {
  return { "new-website": "Entwickle einen vollständigen neuen Webauftritt von Positionierung bis Produktionsplan.", redesign: "Entwickle einen belegbaren Relaunch, der reale Schwächen löst und funktionierende Bestandteile bewahrt.", acquisition: "Entwickle ehrliche Akquise, Demo-Idee, Kontakttexte und Preisargumentation, ohne fertige Arbeit vorzutäuschen.", complete: "Verbinde Recherche, Positionierung, Website-Konzept, Produktionsbriefing, Akquise und Angebot." }[mode];
}

function movementRules(settings: MasterPromptSettings) {
  const animation = { none: "keine dekorative Bewegung", subtle: "dezente Mikrointeraktionen", dynamic: "deutliche, inhaltlich begründete Bewegung", cinematic: "choreografierte cinematische Szenen" }[settings.animation];
  const scroll = { off: "kein scrollgebundenes Storytelling", light: "leichte Scroll-Reveals", storytelling: "Scrollen führt durch eine Geschichte", immersive: "Scrollen steuert Szenen und Kamerawirkung" }[settings.scrollMotion];
  const spatial = { off: "keine 3D-Pflicht", accent: "höchstens ein räumlicher Akzent", hero: "eine räumliche Hero-Szene", experience: "räumliches Gesamterlebnis mit Fallback" }[settings.spatialEffects];
  const mobile = { speed: "schwere Effekte mobil ersetzen", balanced: "Wirkung und Geschwindigkeit ausbalancieren", "full-effects": "Effekte mobil erhalten und Speicher, Touch sowie Wärme absichern" }[settings.mobilePriority];
  return `${animation}; ${scroll}; ${spatial}; ${mobile}`;
}

function offerFor(business: Business, prices: PriceSettings) {
  const premium = ["health", "professional", "hotel", "auto"].includes(industryKey(business));
  return { name: premium ? "Premium Business Website" : "Business Website", price: premium ? prices.premium : prices.business };
}

function imagePlanFor(business: Business, fingerprint: DesignFingerprint, item: IndustryProfile, settings: MasterPromptSettings): MasterPromptImagePlan {
  const location = business.address || "Region des Unternehmens";
  return {
    direction: `${fingerprint.imagery}; die Motive erzählen „${fingerprint.concept}“ und folgen der Strategie ${settings.imagery}.`,
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

function motionPlanFor(business: Business, fingerprint: DesignFingerprint, item: IndustryProfile, settings: MasterPromptSettings): MasterPromptMotionPlan {
  const still = settings.animation === "none";
  const light = settings.animation === "subtle";
  const scrollTrigger = settings.scrollMotion === "off" ? "beim sichtbaren Laden, nicht an Scrollposition koppeln" : settings.scrollMotion === "light" ? "einmalig bei 20 % Sichtbarkeit" : "progressiv zwischen 10 % und 75 % Abschnittssichtbarkeit";
  const mobile = settings.mobilePriority === "speed" ? "statisches Schlüsselbild, keine Blur- oder WebGL-Layer" : settings.mobilePriority === "balanced" ? "halbe Bewegungsdistanz, reduzierte Partikel und Standbild-Fallback" : "gleiche Dramaturgie mit Touch- und Akkuschutz";
  const reduced = "sofort den lesbaren Endzustand zeigen; keine parallaxen oder automatischen Kamerafahrten";
  const scenes: MasterPromptMotionScene[] = [
    {
      name: "Hero-Auftakt",
      trigger: "nach geladenem Hauptmotiv und sichtbarer H1",
      choreography: still ? "H1, Nutzen und CTA ohne Inszenierung sofort anzeigen" : `${fingerprint.hero}; ${light ? "8–16 px Bewegung in 360–520 ms" : "in drei klaren Akten mit ruhiger Kamerakurve"}`,
      purpose: `Die Leitidee „${fingerprint.concept}“ innerhalb weniger Sekunden verständlich machen`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Leistung verstehen",
      trigger: scrollTrigger,
      choreography: still ? "Inhalte in stabiler Reihenfolge und ohne versetzte Reveals darstellen" : `${pick(item.motions, fingerprint.seed, "service-motion")} verbindet Problem, Leistung und Ergebnis; keine Bewegung ohne Aussage`,
      purpose: `Den Arbeitsprozess von ${business.name} nachvollziehbar statt nur dekorativ zeigen`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Vertrauensbeweis",
      trigger: settings.scrollMotion === "immersive" ? "wenn der vorherige Erzählabschnitt zu 80 % abgeschlossen ist" : "beim Eintritt des Belegabschnitts",
      choreography: still ? "Belege direkt und vergleichbar anzeigen" : `Bild, Kennzahl und Beleg nacheinander in ${fingerprint.rhythm} aufbauen`,
      purpose: `Nur überprüfbare Signale wie ${item.trust.join(", ")} hervorheben`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
    {
      name: "Handlungsabschluss",
      trigger: "nach dem letzten glaubwürdigen Beleg, nicht als störendes Overlay",
      choreography: still ? "CTA klar fokussierbar und ohne Bewegung zeigen" : `visuelle Motive aus dem Hero ruhig zum CTA zurückführen; Übergang ${settings.transitions}`,
      purpose: `Das Ziel „${settings.conversionGoal}“ als logischen nächsten Schritt abschließen`,
      mobileFallback: mobile,
      reducedMotion: reduced,
    },
  ];
  return {
    signature: still ? "Ruhige Präzision ohne dekorative Bewegung" : `${fingerprint.motion}; choreografiert nach „${fingerprint.concept}“`,
    scenes,
    performanceBudget: settings.spatialEffects === "off" ? "Animation-Code unter 35 kB komprimiert; nur transform und opacity; 60 FPS anstreben." : "Räumliche Assets separat laden; Initial-JS unter 180 kB; LCP-Medium priorisieren; WebGL bei schwacher Hardware abschalten.",
  };
}

export function generateMasterPrompt(input: MasterPromptInput): MasterPromptResult {
  const recommendation = recommendMasterPromptSettings(input.business);
  const recommendedMode = recommendMasterPromptMode(input.business);
  const mode = input.mode ?? recommendedMode;
  const settings: MasterPromptSettings = { ...recommendation.settings, ...input.settings, customInstructions: input.settings?.customInstructions?.trim().slice(0, 4000) ?? "" };
  const { available, missing } = collectFacts({ ...input, mode, settings });
  const fingerprint = createDesignFingerprint({ business: input.business, mode, settings, variant: input.variant });
  const item = PROFILES[industryKey(input.business)] ?? PROFILES.generic;
  const imagePlan = imagePlanFor(input.business, fingerprint, item, settings);
  const motionPlan = motionPlanFor(input.business, fingerprint, item, settings);
  const offer = offerFor(input.business, input.prices);
  const evidence = input.research?.evidence?.length ? input.research.evidence.map((entry) => `- ${entry.label}: ${entry.value} | ${entry.sourceLabel} | ${entry.confidence} | ${entry.usage}${entry.sourceUrl ? ` | Quelle: ${entry.sourceUrl}` : ""}${entry.license ? ` | Lizenz: ${entry.license}` : ""}`).join("\n") : "- Noch keine zusätzlichen Quellen hinterlegt.";
  const webTasks = ["Drei deutlich unterschiedliche Leitideen entwickeln, bewerten und eine begründet auswählen.", "Informationsarchitektur mit Ziel, Botschaft, Beleg und Nutzeraktion je Abschnitt ausarbeiten.", "Hero und Schlüsselabschnitte mit Layout, Bildregie, Typografie, Interaktion und responsive Verhalten beschreiben.", "Animationen mit Trigger, Ausgangszustand, Bewegung, Zweck und Reduced-Motion-Alternative definieren.", "Assetliste mit Herkunft, Rechten und Alternativen erstellen.", "Technik, Komponenten, Formulare, SEO, Barrierefreiheit, Performance-Budgets und Tests festlegen."];
  const salesTasks = ["Einen beobachtungsbasierten Gesprächseinstieg ohne erfundene Schwächen formulieren.", "E-Mail, WhatsApp, Telefonleitfaden und respektvolles Follow-up erstellen.", "Demo-Idee, Nutzenargumente, Einwände und transparenten Preisrahmen ausarbeiten."];
  let tasks = mode === "acquisition" ? salesTasks : mode === "complete" ? [...webTasks, ...salesTasks] : webTasks;
  if (settings.promptDepth === "compact") tasks = tasks.slice(0, 3);
  if (settings.promptDepth === "detailed") tasks = tasks.slice(0, 6);
  const prompt = `# Individueller WebWorkBalance-Masterprompt\n\nDu bist Creative Director, UX-Stratege, Conversion-Texter und Senior-Webentwickler. Erstelle kein austauschbares Branchen-Template. Leite jede Entscheidung aus diesem Unternehmen, seiner Arbeit, Zielgruppe und dem Geschäftsziel ab.\n\n## Auftrag\n${mission(mode)}\n\n## Verfügbare Daten\n${available.map((fact) => `- ${fact.label}: ${fact.value} (Quelle: ${fact.source})`).join("\n")}\n\n## Fehlende oder unbelegte Angaben\n${missing.map((fact) => `- ${fact.placeholder}: ${fact.label}; benötigt für ${fact.reason}`).join("\n") || "- Keine erwarteten Pflichtangaben fehlen."}\n\nErfinde niemals Leistungen, Preise, Personen, Bewertungen, Referenzen, Zertifikate, Öffnungszeiten oder Unternehmensgeschichte. Nutze Platzhalter und formuliere konkrete Recherchefragen.\n\n## Quellen und Referenzen\n${evidence}\nReferenzen nur analysieren, nicht kopieren. Bilder, Texte, Logos und Designs nur mit belegten Rechten verwenden.\n\n## Individuelles Bildkonzept\n- Richtung: ${imagePlan.direction}\n${imagePlan.requiredAssets.map((asset) => `- ${asset}`).join("\n")}\n- Recherchebegriffe: ${imagePlan.searchQueries.join(" | ")}\nKennzeichne jedes Bild als firmeneigen, lizenziert, KI-generiert oder reine Inspiration. Eine Suchtreffer-Zuordnung niemals als bestätigt behandeln.\n\n## Design-Fingerabdruck ${fingerprint.id}\n- Thema: ${fingerprint.theme}\n- Leitidee: ${fingerprint.concept}\n- Komposition: ${fingerprint.composition}\n- Hero: ${fingerprint.hero}\n- Farbwelt: ${fingerprint.palette}\n- Typografie: ${fingerprint.typography}\n- Bildregie: ${fingerprint.imagery}\n- Bewegung: ${fingerprint.motion}\n- Rhythmus: ${fingerprint.rhythm}\n\nDer Fingerabdruck ist Ausgangspunkt, kein Template. Vermeide generische SaaS-Heros, zufällige Verläufe, austauschbare Kartenraster und Effekte ohne Funktion.\n\n## Animationsregie\n- Signatur: ${motionPlan.signature}\n${motionPlan.scenes.map((scene, index) => `${index + 1}. ${scene.name}\n   - Trigger: ${scene.trigger}\n   - Choreografie: ${scene.choreography}\n   - Zweck: ${scene.purpose}\n   - Mobile: ${scene.mobileFallback}\n   - Reduced Motion: ${scene.reducedMotion}`).join("\n")}\n- Performance-Budget: ${motionPlan.performanceBudget}\n\n## Konfiguration\nKreativität ${settings.creativity}; Komplexität ${settings.complexity}; Animation ${settings.animation}; Scroll ${settings.scrollMotion}; 3D ${settings.spatialEffects}; Übergänge ${settings.transitions}; Layout ${settings.layout}; Bilder ${settings.imagery}; Mobile ${settings.mobilePriority}; Ziel ${settings.conversionGoal}; Tiefe ${settings.promptDepth}; Technik ${settings.technology}; Budget ${settings.budget}.\nBewegungsregel: ${movementRules(settings)}. Jede Animation muss Inhalt erklären, Marke spürbar machen oder Bedienung verbessern. prefers-reduced-motion, Touch, Tastatur und mobile Fallbacks einplanen.\n${settings.customInstructions ? `\n## Eigene Wünsche\n${settings.customInstructions}\nDiese Wünsche dürfen Fakten-, Rechte-, Performance- und Barrierefreiheitsregeln nicht verletzen.\n` : ""}\n## Branchenbasis\n- Zielgruppe: ${item.audience}\n- Vertrauenssignale: ${item.trust.join(", ")}\n- Ausgangsstruktur: ${["Nutzenversprechen", "Leistungen", ...item.sections, "Vertrauen", "Kontakt"].join(" → ")}\n- Preisannahme: ${offer.name}, etwa ${offer.price.toLocaleString("de-DE")} € netto; Umfang vor Angebot klären.\n\n## Ergebnis\n${tasks.map((task, index) => `${index + 1}. ${task}`).join("\n")}\n\n## Qualitätskontrolle\nIst die Leitidee nur für dieses Unternehmen plausibel? Unterscheidet sie sich in Aufbau, Bildregie und Bewegung klar von üblichen Templates? Ist jede Aussage belegt oder markiert? Ist die mobile Version vollständig nutzbar? Passen Aufwand und Technik zum Budget? Bei einem Nein das Konzept überarbeiten.`;
  const warnings = missing.map((fact) => `${fact.label}: ${fact.reason}`);
  if (settings.spatialEffects !== "off" && settings.mobilePriority === "speed") warnings.push("3D ist aktiv, obwohl mobile Geschwindigkeit Vorrang hat; ein statischer Fallback ist Pflicht.");
  return { mode, recommendedMode, settings, recommendationReasons: recommendation.reasons, facts: available, missingFacts: missing, fingerprint, imagePlan, motionPlan, prompt, warnings };
}
