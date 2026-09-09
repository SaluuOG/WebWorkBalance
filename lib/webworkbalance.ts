export type WebsiteStatus =
  | "not_found"
  | "likely_missing"
  | "needs_check"
  | "exists"
  | "unreachable"
  | "outdated";

export type LeadStatus =
  | "Neu"
  | "Interessant"
  | "Recherche läuft"
  | "Kontakt vorbereitet"
  | "Kontaktiert"
  | "Rückmeldung erhalten"
  | "Demo-Website erstellt"
  | "Angebot gesendet"
  | "Auftrag gewonnen"
  | "Abgelehnt"
  | "Später kontaktieren";

export type BusinessSource = "OpenStreetMap" | "Demo" | "Manuell";

export type LeadActivityType = "Anruf" | "E-Mail" | "WhatsApp" | "Meeting" | "Notiz" | "Angebot";
export type AuditStatus = "open" | "good" | "issue";
export type AuditKey = "mobile" | "speed" | "cta" | "seo" | "trust" | "content" | "legal";

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  note: string;
  createdAt: string;
}

export interface WebsiteAudit {
  checks: Record<AuditKey, AuditStatus>;
  notes: string;
  updatedAt: string | null;
}

export interface SearchCenter {
  name: string;
  lat: number;
  lon: number;
  passport: boolean;
}

export interface Business {
  id: string;
  sourceId: string;
  source: BusinessSource;
  sourceUrl: string;
  name: string;
  category: string;
  categoryKey: string;
  lat: number;
  lon: number;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  websiteStatus: WebsiteStatus;
  openingHours: string | null;
  socialUrl: string | null;
  imageUrl: string | null;
  imageAttribution: string | null;
  distanceKm: number;
  fetchedAt: string;
  isDemo?: boolean;
  audit?: WebsiteAudit;
  activities?: LeadActivity[];
  claimedById?: string | null;
  claimedByName?: string | null;
  claimedAt?: string | null;
}

export interface StoredLead extends Business {
  score: number;
  status: LeadStatus;
  priority: boolean;
  notes: string;
  nextAction: string;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTask {
  id: number;
  leadId: string | null;
  title: string;
  dueAt: string | null;
  completed: boolean;
  createdAt: string;
  leadName?: string | null;
}

export type TeamNoteKind = "Notiz" | "Recherche" | "Idee" | "Blocker";

export interface TeamNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  kind: TeamNoteKind;
  leadId: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string | null;
}

export type AppView = "today" | "discover" | "regional" | "map" | "leads" | "tasks" | "team" | "pricing" | "settings";

export interface GeocodeResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
}

export type ProjectPriceKey = "landing" | "business" | "premium" | "shop" | "portal" | "webapp";

export interface PriceSettings {
  landing: number;
  business: number;
  premium: number;
  shop: number;
  portal: number;
  webapp: number;
  hourly: number;
  maintenance: number;
}

export interface MarketPriceItem {
  key: ProjectPriceKey;
  name: string;
  shortName: string;
  marketMin: number;
  marketMax: number;
  upperOpen?: boolean;
  description: string;
  typicalScope: string;
}

export const DEFAULT_PRICES: PriceSettings = {
  landing: 1900,
  business: 3900,
  premium: 6900,
  shop: 9900,
  portal: 14900,
  webapp: 24900,
  hourly: 110,
  maintenance: 199,
};

export const MARKET_PRICE_UPDATED_AT = "08.09.2026";

export const MARKET_PRICE_ITEMS: MarketPriceItem[] = [
  {
    key: "landing",
    name: "Landingpage / Onepager",
    shortName: "Landingpage",
    marketMin: 1500,
    marketMax: 4000,
    description: "Ein klares Ziel, starke Nutzerführung und ein hochwertiges individuelles Design.",
    typicalScope: "1 Seite · Conversion-Konzept · responsive · SEO-Basis",
  },
  {
    key: "business",
    name: "Business Website",
    shortName: "Business",
    marketMin: 3500,
    marketMax: 8000,
    description: "Professioneller Firmenauftritt für lokale Betriebe, Dienstleister und KMU.",
    typicalScope: "4–7 Seiten · individuelles Design · CMS · Local SEO",
  },
  {
    key: "premium",
    name: "Premium Corporate / Relaunch",
    shortName: "Premium",
    marketMin: 6000,
    marketMax: 18000,
    description: "Strategischer Markenauftritt mit anspruchsvoller UX, Inhalten und Integrationen.",
    typicalScope: "8–15 Seiten · UX/UI · CMS · Animationen · Migration",
  },
  {
    key: "shop",
    name: "E-Commerce / Onlineshop",
    shortName: "Onlineshop",
    marketMin: 8000,
    marketMax: 25000,
    description: "Verkaufsstarker Shop mit sauberem Checkout und wichtigen Geschäftsanbindungen.",
    typicalScope: "Shop-System · Zahlung · Versand · Produkte · Tracking",
  },
  {
    key: "portal",
    name: "Portal / Buchung / Mitgliederbereich",
    shortName: "Portal",
    marketMin: 12000,
    marketMax: 35000,
    description: "Individuelle Prozesse, Logins, Buchungen oder geschützte Kundenbereiche.",
    typicalScope: "Konten · Rollen · Buchung · E-Mail-Flows · Dashboard",
  },
  {
    key: "webapp",
    name: "Web-App / SaaS MVP",
    shortName: "Web-App",
    marketMin: 20000,
    marketMax: 60000,
    upperOpen: true,
    description: "Maßgeschneiderte digitale Produkte mit eigener Logik und Datenhaltung.",
    typicalScope: "Produkt-UX · Frontend · Backend · Datenbank · Deployment",
  },
];

export const AUDIT_ITEMS: Array<{ key: AuditKey; label: string; hint: string }> = [
  { key: "mobile", label: "Mobile Darstellung", hint: "Lesbar, klickbar und ohne horizontales Scrollen" },
  { key: "speed", label: "Geschwindigkeit", hint: "Schneller Seitenaufbau und optimierte Medien" },
  { key: "cta", label: "Klarer nächster Schritt", hint: "Anruf, Anfrage, Termin oder Kauf sofort erkennbar" },
  { key: "seo", label: "Local SEO", hint: "Titel, Inhalte, Standort und Suchintention passen" },
  { key: "trust", label: "Vertrauen", hint: "Referenzen, Team, Bewertungen oder Zertifikate" },
  { key: "content", label: "Inhalte", hint: "Aktuell, verständlich und verkaufsorientiert" },
  { key: "legal", label: "Pflichtangaben", hint: "Impressum, Datenschutz und Consent vorhanden" },
];

export function emptyWebsiteAudit(): WebsiteAudit {
  return {
    checks: { mobile: "open", speed: "open", cta: "open", seo: "open", trust: "open", content: "open", legal: "open" },
    notes: "",
    updatedAt: null,
  };
}

export function websiteAuditScore(audit?: WebsiteAudit) {
  if (!audit) return null;
  const checked = Object.values(audit.checks).filter((value) => value !== "open");
  if (!checked.length) return null;
  return Math.round((checked.filter((value) => value === "good").length / checked.length) * 100);
}

export function nextBestActionFor(lead: StoredLead) {
  const today = new Date().toISOString().slice(0, 10);
  if (lead.followUpAt && lead.followUpAt.slice(0, 10) <= today) {
    return { label: "Jetzt nachfassen", reason: "Wiedervorlage ist heute oder überfällig", urgency: 100 };
  }
  if (lead.status === "Angebot gesendet") return { label: "Angebot nachfassen", reason: "Offenes Angebot aktiv weiterführen", urgency: 92 };
  if (lead.status === "Rückmeldung erhalten") return { label: "Antwort vorbereiten", reason: "Der Lead hat bereits reagiert", urgency: 90 };
  if (lead.status === "Demo-Website erstellt") return { label: "Demo präsentieren", reason: "Deine Vorleistung ist bereit", urgency: 88 };
  if (["Neu", "Interessant", "Recherche läuft"].includes(lead.status)) {
    return { label: lead.phone ? "Erstkontakt anrufen" : lead.email ? "Erstkontakt schreiben" : "Kontaktdaten prüfen", reason: `Lead-Score ${lead.score}/100`, urgency: 55 + lead.score / 3 };
  }
  if (lead.status === "Kontaktiert") return { label: "Wiedervorlage setzen", reason: "Kontakt ohne nächsten Termin", urgency: 65 };
  return { label: lead.nextAction || "Nächsten Schritt festlegen", reason: lead.status, urgency: 40 };
}

export function outreachTemplatesFor(business: Business, prices: PriceSettings = DEFAULT_PRICES, audit?: WebsiteAudit) {
  const offer = packageForBusiness(business, prices);
  const issues = AUDIT_ITEMS.filter((item) => audit?.checks[item.key] === "issue").map((item) => item.label);
  const observation = issues.length
    ? `Dabei sind mir besonders ${issues.slice(0, 2).join(" und ")} als konkrete Verbesserungsmöglichkeiten aufgefallen.`
    : business.website
      ? "Dabei sind mir einige konkrete Möglichkeiten aufgefallen, den Auftritt moderner und anfrageorientierter zu gestalten."
      : "Dabei habe ich gesehen, dass aktuell keine eindeutige eigene Website zu finden ist.";
  const email = `Guten Tag,\n\nich bin professioneller Webentwickler aus der Region und bin bei meiner Recherche auf ${business.name} gestoßen. ${observation}\n\nIch kann Ihnen unverbindlich eine kurze Konzeptidee zeigen, wie ein moderner Auftritt für Ihr Unternehmen aussehen könnte. Eine passende Umsetzung startet bei etwa ${offer.price.toLocaleString("de-DE")} € netto – abhängig vom gewünschten Umfang.\n\nWäre ein kurzer, unverbindlicher Blick für Sie interessant?\n\nFreundliche Grüße\nSalu & Sula`;
  return {
    subject: `Kurze Website-Idee für ${business.name}`,
    email,
    whatsapp: `Guten Tag, ich bin professioneller Webentwickler aus der Region und habe ${business.name} entdeckt. ${observation} Darf ich Ihnen unverbindlich eine kurze Website-Idee schicken? Viele Grüße, Salu & Sula`,
    call: `Guten Tag, mein Name ist [Name]. Ich bin professioneller Webentwickler aus der Region. Ich habe ${business.name} bei meiner Recherche entdeckt. ${observation} Ich würde Ihnen gern unverbindlich in zwei Minuten erklären, welche Idee ich für Ihren Internetauftritt habe. Passt es gerade kurz?`,
    followUp: `Guten Tag, ich wollte mich kurz zu meiner Website-Idee für ${business.name} zurückmelden. Falls das Thema aktuell interessant ist, zeige ich Ihnen gern unverbindlich einen konkreten Vorschlag. Viele Grüße, Salu & Sula`,
  };
}

export const leadStatuses: LeadStatus[] = [
  "Neu",
  "Interessant",
  "Recherche läuft",
  "Kontakt vorbereitet",
  "Kontaktiert",
  "Rückmeldung erhalten",
  "Demo-Website erstellt",
  "Angebot gesendet",
  "Auftrag gewonnen",
  "Abgelehnt",
  "Später kontaktieren",
];

export const categories = [
  { value: "all", label: "Alle Branchen" },
  { value: "retail", label: "Einzelhandel" },
  { value: "gastro", label: "Gastronomie" },
  { value: "beauty", label: "Beauty & Friseur" },
  { value: "craft", label: "Handwerk" },
  { value: "health", label: "Gesundheit" },
  { value: "professional", label: "Büro & Beratung" },
  { value: "fitness", label: "Fitness & Sport" },
  { value: "auto", label: "Auto & Werkstatt" },
  { value: "hotel", label: "Hotel & Unterkunft" },
] as const;

export const websiteStatusLabel: Record<WebsiteStatus, string> = {
  not_found: "Keine Website gefunden",
  likely_missing: "Wahrscheinlich ohne Website",
  needs_check: "Prüfung erforderlich",
  exists: "Website vorhanden",
  unreachable: "Website nicht erreichbar",
  outdated: "Website wirkt veraltet",
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateLeadScore(business: Business) {
  let score = 18;
  if (business.websiteStatus === "not_found") score += 48;
  if (business.websiteStatus === "likely_missing") score += 42;
  if (business.websiteStatus === "needs_check") score += 28;
  if (business.websiteStatus === "unreachable") score += 35;
  if (business.websiteStatus === "outdated") score += 30;
  if (business.phone) score += 14;
  if (business.email) score += 10;
  if (business.socialUrl) score += 6;
  if (business.openingHours) score += 3;
  if (["health", "professional", "hotel", "auto"].includes(business.categoryKey)) score += 4;
  if (business.distanceKm <= 5) score += 4;
  return Math.max(12, Math.min(98, score));
}

export function packageForBusiness(business: Business, prices: PriceSettings = DEFAULT_PRICES) {
  const premiumLead = ["health", "professional", "hotel", "auto"].includes(business.categoryKey);
  const redesign = ["exists", "outdated", "unreachable"].includes(business.websiteStatus);
  if (premiumLead) {
    return {
      key: "premium" as const,
      name: redesign ? "Premium Website-Relaunch" : "Premium Business Website",
      price: prices.premium,
    };
  }
  return {
    key: "business" as const,
    name: redesign ? "Business Website-Relaunch" : "Business Website",
    price: prices.business,
  };
}

export function siteSectionsFor(business: Business) {
  const common = ["Startseite mit klarem Nutzen", "Leistungen oder Angebot", "Über das Unternehmen", "Kontakt mit Karte und Anruf-Button"];
  const additions: Record<string, string[]> = {
    gastro: ["Speisekarte", "Öffnungszeiten & Reservierung"],
    beauty: ["Behandlungen & Preise", "Terminbuchung", "Galerie"],
    craft: ["Leistungsgebiete", "Referenzen", "Angebotsanfrage"],
    health: ["Behandlungen", "Team", "Terminvereinbarung"],
    professional: ["Expertise", "Fallbeispiele", "Erstgespräch"],
    fitness: ["Kurse & Mitgliedschaften", "Probetraining", "Trainer-Team"],
    auto: ["Werkstattleistungen", "Termin & Rückruf", "Fahrzeugannahme"],
    hotel: ["Zimmer & Preise", "Ausstattung", "Buchungsanfrage"],
    retail: ["Sortiment", "Neuheiten", "Anfahrt & Öffnungszeiten"],
  };
  return [...common.slice(0, 2), ...(additions[business.categoryKey] ?? []), ...common.slice(2)].slice(0, 7);
}

export function pitchFor(business: Business) {
  const siteText = business.website
    ? "Ihren aktuellen Internetauftritt angesehen und dabei konkrete Möglichkeiten zur Verbesserung gefunden"
    : "bei meiner Recherche gesehen, dass aktuell keine eindeutige eigene Website zu finden ist";
  return `Guten Tag, ich bin Webdesigner aus der Region. Ich habe ${business.name} entdeckt und ${siteText}. Ich würde Ihnen gern unverbindlich eine kurze Idee zeigen, wie ein moderner Auftritt für Ihr Unternehmen aussehen könnte. Wenn Ihnen die Richtung gefällt, können wir über die Umsetzung sprechen. Wäre ein kurzer Blick für Sie interessant?`;
}

export function websitePromptFor(business: Business, prices: PriceSettings = DEFAULT_PRICES) {
  const offer = packageForBusiness(business, prices);
  return `Erstelle eine moderne, schnelle und mobiloptimierte Website für „${business.name}“, ein Unternehmen aus der Kategorie „${business.category}“ in ${business.address || "der Region"}. Die Website soll vertrauenswürdig, hochwertig und lokal wirken. Empfohlene Struktur: ${siteSectionsFor(business).join(", ")}. Verwende klare Handlungsaufforderungen für Anruf und Kontakt. Erfinde keine Unternehmensdaten, Preise, Bewertungen oder Referenzen. Fehlende Inhalte müssen als Platzhalter markiert werden. Das geplante Paket ist „${offer.name}“ zum Angebotspreis von ${offer.price.toLocaleString("de-DE")} €.`;
}

export function googleMapsUrl(business: Business) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address}`)}`;
}

export function appleMapsUrl(business: Business) {
  return `https://maps.apple.com/?q=${encodeURIComponent(business.name)}&ll=${business.lat},${business.lon}`;
}

export function demoBusinesses(center: SearchCenter): Business[] {
  const now = new Date().toISOString();
  const items = [
    { name: "Muster Café", category: "Café", categoryKey: "gastro", dx: 0.008, dy: 0.004, phone: "0911 000000", email: null, website: null },
    { name: "Beispiel Friseurstudio", category: "Friseursalon", categoryKey: "beauty", dx: -0.012, dy: 0.007, phone: null, email: "demo@beispiel.invalid", website: null },
    { name: "Demo Handwerksbetrieb", category: "Handwerk", categoryKey: "craft", dx: 0.006, dy: -0.011, phone: "0911 000001", email: null, website: null },
    { name: "Beispiel Beratung", category: "Unternehmensberatung", categoryKey: "professional", dx: -0.017, dy: -0.004, phone: "0911 000002", email: null, website: "https://example.com" },
  ];
  return items.map((item, index) => {
    const lat = center.lat + item.dy;
    const lon = center.lon + item.dx;
    return {
      id: `demo-${index + 1}`,
      sourceId: `demo-${index + 1}`,
      source: "Demo",
      sourceUrl: "https://www.openstreetmap.org/copyright",
      name: item.name,
      category: item.category,
      categoryKey: item.categoryKey,
      lat,
      lon,
      address: `Demo-Datensatz · ${center.name}`,
      phone: item.phone,
      email: item.email,
      website: item.website,
      websiteStatus: item.website ? "exists" : "likely_missing",
      openingHours: index % 2 === 0 ? "Mo–Fr 09:00–18:00" : null,
      socialUrl: null,
      imageUrl: null,
      imageAttribution: null,
      distanceKm: Number(haversineKm(center.lat, center.lon, lat, lon).toFixed(1)),
      fetchedAt: now,
      isDemo: true,
    };
  });
}
