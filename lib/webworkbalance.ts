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
export type WebsiteQualityCategoryKey = "technical" | "mobile" | "seo" | "content" | "conversion" | "trust" | "accessibility" | "legal";
export type WebsiteQualityFindingStatus = "good" | "warning" | "critical";
export type WebsiteQualityGrade = "Ausgezeichnet" | "Sehr gut" | "Gut" | "Ausbaufähig" | "Schwach";

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

export interface OfficialWebsiteVerification {
  verified: boolean;
  confidence: number;
  domain: string;
  finalUrl: string;
  reason: string;
  evidence: string[];
}

export interface WebsiteQualityFinding {
  id: string;
  label: string;
  status: WebsiteQualityFindingStatus;
  finding: string;
  recommendation: string;
}

export interface WebsiteQualityCategory {
  key: WebsiteQualityCategoryKey;
  label: string;
  score: number;
  weight: number;
  summary: string;
  findings: WebsiteQualityFinding[];
}

export interface WebsiteResearchPage {
  label: string;
  url: string;
  type: "contact" | "about" | "services" | "pricing" | "booking" | "gallery" | "legal" | "other";
}

export interface WebsiteResearchImage {
  url: string;
  sourceUrl: string;
  alt: string;
  kind: "logo" | "social-preview" | "content";
  rightsNote: string;
}

export interface WebsiteResearchDossier {
  pageTitle: string | null;
  description: string | null;
  headings: string[];
  serviceHints: string[];
  contactHints: string[];
  socialLinks: string[];
  importantPages: WebsiteResearchPage[];
  images: WebsiteResearchImage[];
  brandColors: string[];
  technologyHints: string[];
}

export interface WebsiteQualityReport {
  version: 1;
  websiteUrl: string;
  finalUrl: string;
  domain: string;
  scannedAt: string;
  official: OfficialWebsiteVerification;
  overallScore: number;
  grade: WebsiteQualityGrade;
  opportunity: "niedrig" | "mittel" | "hoch";
  categories: WebsiteQualityCategory[];
  topIssues: Array<WebsiteQualityFinding & { category: string }>;
  positives: Array<WebsiteQualityFinding & { category: string }>;
  metrics: {
    responseMs: number;
    htmlKb: number;
    wordCount: number;
    imageCount: number;
    scriptCount: number;
  };
  research: WebsiteResearchDossier;
  limitations: string[];
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
  websiteReport?: WebsiteQualityReport;
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

export interface OutreachTemplates {
  subject: string;
  email: string;
  whatsapp: string;
  call: string;
  followUp: string;
  strategy: {
    signal: string;
    benefit: string;
    nextStep: string;
    internalOffer: string;
  };
  channelNotes: Record<"email" | "whatsapp" | "call" | "followUp", string>;
}

const WWB_OUTREACH_SIGN_OFF = "Beste Grüße vom WWB Team (WebWorkBalance)";

const CATEGORY_OUTREACH_BENEFITS: Record<string, string> = {
  retail: "Kundinnen und Kunden Sortiment, Standort und Besuchsgründe schneller erfassen und gezielter ins Geschäft kommen",
  gastro: "Gäste Speisekarte, Öffnungszeiten und Reservierungsweg sofort finden und häufiger direkt reservieren",
  beauty: "Interessierte Ihre Arbeiten überzeugend sehen und mit möglichst wenig Aufwand einen Termin anfragen",
  craft: "passende Anfragen besser vorqualifiziert werden und Referenzen früh Vertrauen in Ihre Arbeit schaffen",
  health: "Patientinnen und Patienten Leistungen, Vertrauen und den Terminweg schnell und verständlich erfassen",
  professional: "potenzielle Auftraggeber Ihre Kompetenz schneller einordnen und mit einer klaren Anfrage auf Sie zukommen",
  fitness: "Interessierte Angebote und Kurszeiten schneller verstehen und direkt ein Probetraining anfragen",
  auto: "Kundinnen und Kunden Leistungen, Vertrauenssignale und den Terminweg ohne Umwege finden",
  hotel: "Gäste die besonderen Vorteile Ihres Hauses schneller erkennen und möglichst direkt anfragen oder buchen",
};

function outreachLocation(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const location = parts.at(-1)?.replace(/^\d{5}\s+/, "").trim();
  return location || "der Region";
}

function outreachObservation(business: Business, audit?: WebsiteAudit) {
  const reportIssues = business.websiteReport?.official.verified
    ? business.websiteReport.topIssues
      .filter((item) => !/recht|datenschutz|impressum|consent/i.test(`${item.category} ${item.label}`))
      .map((item) => item.label)
    : [];
  const auditIssues = AUDIT_ITEMS
    .filter((item) => audit?.checks[item.key] === "issue")
    .map((item) => item.label);
  const issues = [...new Set([...reportIssues, ...auditIssues])].slice(0, 2);

  if (issues.length) {
    return `Bei der Analyse des bestehenden Auftritts sehen wir vor allem bei ${issues.join(" und ")} konkrete, nachvollziehbare Verbesserungsmöglichkeiten.`;
  }
  if (business.websiteStatus === "not_found" || business.websiteStatus === "likely_missing" || !business.website) {
    return "In den öffentlich auffindbaren Firmeneinträgen war aktuell keine eindeutig offizielle eigene Website verknüpft.";
  }
  if (business.websiteStatus === "unreachable") {
    return "Der verknüpfte Webauftritt war bei unserer Recherche zeitweise nicht zuverlässig erreichbar; dadurch können interessierte Personen früh abspringen.";
  }
  if (business.websiteStatus === "outdated") {
    return "Der bestehende Webauftritt bietet eine gute Grundlage, lässt sich aber bei Nutzerführung, Wirkung und Anfrageweg gezielt weiterentwickeln.";
  }
  if (business.websiteReport?.official.verified && business.websiteReport.overallScore >= 75) {
    return "Der bestehende Webauftritt wirkt bereits solide. Gerade deshalb sehen wir Potenzial, seine Stärken noch klarer in konkrete Anfragen zu übersetzen.";
  }
  return "Beim bestehenden digitalen Auftritt sehen wir einen konkreten Ansatz, Leistungen, Vertrauen und den nächsten Schritt für Interessierte klarer zu verbinden.";
}

export function outreachTemplatesFor(business: Business, prices: PriceSettings = DEFAULT_PRICES, audit?: WebsiteAudit): OutreachTemplates {
  const offer = packageForBusiness(business, prices);
  const observation = outreachObservation(business, audit);
  const benefit = CATEGORY_OUTREACH_BENEFITS[business.categoryKey]
    ?? "Interessierte Ihr Angebot schneller verstehen, Vertrauen aufbauen und ohne Umwege eine passende Anfrage stellen";
  const location = outreachLocation(business.address);
  const researchContext = `Bei unserer gezielten Recherche nach ${business.category || "Unternehmen"} in ${location} sind wir auf ${business.name} aufmerksam geworden.`;
  const benefitStatement = `Der Vorteil für Sie: ${benefit}.`;
  const email = `Guten Tag an das Team von ${business.name},\n\nmein Name ist [Vor- und Nachname]. Ich melde mich im Namen des WWB Teams (WebWorkBalance). Der Grund meiner Nachricht: ${researchContext}\n\n${observation}\n\n${benefitStatement}\n\nWenn das grundsätzlich interessant ist, bereiten wir Ihnen gern eine kompakte, unverbindliche 3-Punkte-Einschätzung vor. Sie können danach in Ruhe entscheiden, ob ein kurzes Gespräch sinnvoll ist.\n\nDarf ich Ihnen diese drei konkreten Ansätze zusenden?\n\n${WWB_OUTREACH_SIGN_OFF}\n[Vor- und Nachname]`;
  return {
    subject: business.website
      ? `Konkrete Website-Idee für ${business.name}`
      : `Idee zur digitalen Sichtbarkeit von ${business.name}`,
    email,
    whatsapp: `Guten Tag an das Team von ${business.name},\n\nhier ist [Vor- und Nachname] vom WWB Team (WebWorkBalance). Vielen Dank, dass ich Ihnen hier schreiben darf. ${researchContext}\n\n${observation}\n\n${benefitStatement}\n\nDarf ich Ihnen unsere drei konkreten, unverbindlichen Ansätze kurz hier zusenden?\n\n${WWB_OUTREACH_SIGN_OFF}`,
    call: `GESPRÄCHSZIEL (nicht vorlesen)\nInteresse an einer kompakten 3-Punkte-Einschätzung und einem kurzen Folgetermin wecken – nicht sofort die komplette Website verkaufen.\n\nEINSTIEG\n„Guten Tag, spreche ich mit der zuständigen Person für den Webauftritt von ${business.name}? Mein Name ist [Vor- und Nachname], ich rufe vom WWB Team, WebWorkBalance, an. Der Grund meines Anrufs: ${researchContext} Ich fasse mich kurz.“\n\nKONKRETER ANLASS\n„${observation}“\n\nKUNDENVORTEIL\n„${benefitStatement}“\n\nRELEVANZFRAGE\n„Wäre dieses Ergebnis für Ihr Unternehmen grundsätzlich interessant?“\n\nNÄCHSTER SCHRITT\n„Dann bereiten wir Ihnen gern drei konkrete Ansätze vor. Sie sehen sofort, was sinnvoll wäre, und entscheiden danach selbst, ob ein weiterer Austausch Mehrwert bietet. Passt für einen kurzen 10-Minuten-Termin eher [Tag/Uhrzeit A] oder [Tag/Uhrzeit B]?“\n\nEINWÄNDE\n• „Keine Zeit“ → „Verstanden. Dann halte ich Sie jetzt nicht auf. Soll ich einen konkreten 10-Minuten-Termin für einen ruhigeren Zeitpunkt vorschlagen oder das Thema schließen?“\n• „Kein Interesse“ → „Verstanden, danke für die klare Rückmeldung. Wir schließen das Thema und melden uns dazu nicht erneut.“\n• „Wir haben bereits jemanden“ → „Sehr gut, dann ist der Auftritt betreut. Unsere Einschätzung kann auf Wunsch nur als unabhängiger Zweitblick dienen – ohne jemanden ersetzen zu wollen.“\n• „Was kostet das?“ → „Das hängt vom tatsächlichen Umfang ab. Zuerst prüfen wir gemeinsam, ob überhaupt ein sinnvoller Mehrwert besteht; danach erhalten Sie einen transparenten, verbindlichen Rahmen.“\n\nVERABSCHIEDUNG\n„Vielen Dank für Ihre Zeit – beste Grüße vom WWB Team (WebWorkBalance).“`,
    followUp: `Guten Tag an das Team von ${business.name},\n\nich melde mich wie angekündigt noch einmal im Namen des WWB Teams (WebWorkBalance). Zu ${business.name} hatten wir folgenden Ansatz festgehalten: ${observation}\n\n${benefitStatement}\n\nWenn das Thema noch relevant ist, senden wir Ihnen gern unsere kompakte 3-Punkte-Einschätzung oder vereinbaren einen kurzen 10-Minuten-Termin. Falls aktuell kein Bedarf besteht, genügt ein kurzes Nein – dann schließen wir die Wiedervorlage.\n\n${WWB_OUTREACH_SIGN_OFF}\n[Vor- und Nachname]`,
    strategy: {
      signal: observation,
      benefit,
      nextStep: "Erst drei konkrete Ansätze anbieten, danach höchstens einen 10-Minuten-Termin vereinbaren.",
      internalOffer: `${offer.name} · interner Richtwert ${offer.price.toLocaleString("de-DE")} € netto. Im Erstkontakt nur nennen, wenn ausdrücklich nach dem Preis gefragt wird.`,
    },
    channelNotes: {
      email: "Nur mit vorheriger ausdrücklicher Einwilligung oder einer tatsächlich einschlägigen gesetzlichen Ausnahme senden.",
      whatsapp: "Nur nach ausdrücklicher Einwilligung schreiben; deshalb bestätigt die Vorlage die Erlaubnis zum WhatsApp-Kontakt.",
      call: "Nur anrufen, wenn der konkrete betriebliche Bezug eine mutmaßliche Einwilligung nachvollziehbar macht. Ein Nein sofort respektieren.",
      followUp: "Nur nach einem vorherigen Kontakt und ohne Widerspruch verwenden. Nach einem Nein keine weitere Wiedervorlage setzen.",
    },
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
  if (business.websiteReport?.overallScore != null) {
    if (business.websiteReport.overallScore < 45) score += 28;
    else if (business.websiteReport.overallScore < 60) score += 20;
    else if (business.websiteReport.overallScore < 75) score += 10;
  }
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
