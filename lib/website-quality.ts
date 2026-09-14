import type {
  Business,
  OfficialWebsiteVerification,
  WebsiteAudit,
  WebsiteQualityCategory,
  WebsiteQualityCategoryKey,
  WebsiteQualityFinding,
  WebsiteQualityFindingStatus,
  WebsiteQualityGrade,
  WebsiteQualityReport,
  WebsiteResearchDossier,
  WebsiteResearchImage,
  WebsiteResearchPage,
} from "./webworkbalance";

const BLOCKED_OFFICIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "x.com",
  "twitter.com",
  "google.com",
  "google.de",
  "maps.google.com",
  "maps.apple.com",
  "gelbeseiten.de",
  "11880.com",
  "yelp.com",
  "yelp.de",
  "tripadvisor.com",
  "tripadvisor.de",
  "booking.com",
  "lieferando.de",
  "jameda.de",
  "doctolib.de",
  "meinestadt.de",
  "werkenntdenbesten.de",
  "wikipedia.org",
  "example.com",
] as const;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.home$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?(::1|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|fe80:)/i,
] as const;

const COMPANY_STOP_WORDS = new Set([
  "und", "der", "die", "das", "von", "vom", "für", "the", "and", "gmbh", "ug", "ag", "kg", "ohg", "gbr", "mbh",
  "e", "v", "nürnberg", "nuernberg", "fürth", "fuerth", "company", "unternehmen", "betrieb", "praxis", "studio",
]);

const SOCIAL_HOSTS = ["instagram.com", "facebook.com", "linkedin.com", "tiktok.com", "youtube.com", "x.com", "twitter.com"];

export interface WebsiteDocumentInput {
  business: Pick<Business, "name" | "address" | "phone" | "email" | "source" | "sourceUrl" | "website">;
  requestedUrl: string;
  finalUrl: string;
  html: string;
  responseMs: number;
  status: number;
  headers?: {
    cacheControl?: string | null;
    contentType?: string | null;
  };
}

export interface WebsiteDocumentAnalysis {
  verification: OfficialWebsiteVerification;
  report: WebsiteQualityReport | null;
}

function decodeHtml(value: string) {
  const codePoint = (raw: string, radix: number) => {
    const parsed = Number.parseInt(raw, radix);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 0x10ffff ? String.fromCodePoint(parsed) : " ";
  };
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => codePoint(code, 10))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => codePoint(code, 16));
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function plainText(value: string) {
  return decodeHtml(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").replace(/\s+/g, " ").trim();
}

function compactText(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function companyTokens(value: string) {
  return unique(normalizeText(value).split(" ").filter((token) => token.length >= 3 && !COMPANY_STOP_WORDS.has(token)));
}

function tags(html: string, tagName: string) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function attribute(tag: string, name: string) {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  if (quoted) return decodeHtml(quoted[2]).trim();
  const unquoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i"));
  return unquoted ? decodeHtml(unquoted[1]).trim() : null;
}

function tagContents(html: string, tagName: string) {
  const matches = [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))];
  return matches.map((match) => plainText(match[1])).filter(Boolean);
}

function metaContent(html: string, key: string) {
  const normalizedKey = key.toLowerCase();
  for (const tag of tags(html, "meta")) {
    const name = (attribute(tag, "name") ?? attribute(tag, "property") ?? "").toLowerCase();
    if (name === normalizedKey) return attribute(tag, "content");
  }
  return null;
}

function linkHrefByRel(html: string, relName: string) {
  for (const tag of tags(html, "link")) {
    const rel = (attribute(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    if (rel.includes(relName)) return attribute(tag, "href");
  }
  return null;
}

function absoluteUrl(value: string | null, base: string) {
  if (!value || /^(data|blob|javascript):/i.test(value)) return null;
  try {
    const result = new URL(value, base);
    if (!/^https?:$/.test(result.protocol)) return null;
    result.hash = "";
    return result.toString();
  } catch {
    return null;
  }
}

function hostMatches(hostname: string, domain: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const candidate = domain.toLowerCase().replace(/^www\./, "");
  return host === candidate || host.endsWith(`.${candidate}`);
}

export function normalizeOfficialWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function websiteHostSafety(url: URL) {
  const hostname = url.hostname.toLowerCase();
  if (!hostname || !hostname.includes(".")) return { safe: false, reason: "Die Website-Adresse besitzt keine öffentliche Domain." };
  if (url.port && !["80", "443"].includes(url.port)) return { safe: false, reason: "Die Website verwendet einen nicht unterstützten Netzwerk-Port." };
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) return { safe: false, reason: "Private oder lokale Netzwerkadressen werden nicht geprüft." };
  const blocked = BLOCKED_OFFICIAL_HOSTS.find((domain) => hostMatches(hostname, domain));
  if (blocked) return { safe: false, reason: `${blocked} ist keine eigenständige offizielle Firmen-Website.` };
  return { safe: true, reason: null };
}

function statusFor(condition: boolean, warningCondition = false): WebsiteQualityFindingStatus {
  return condition ? "good" : warningCondition ? "warning" : "critical";
}

function finding(id: string, label: string, status: WebsiteQualityFindingStatus, value: string, recommendation: string): WebsiteQualityFinding {
  return { id, label, status, finding: value, recommendation };
}

function category(key: WebsiteQualityCategoryKey, label: string, weight: number, findings: WebsiteQualityFinding[]): WebsiteQualityCategory {
  const points = { good: 100, warning: 55, critical: 15 } as const;
  const score = Math.round(findings.reduce((sum, item) => sum + points[item.status], 0) / Math.max(1, findings.length));
  const summary = score >= 85 ? "Sehr solide umgesetzt" : score >= 70 ? "Gute Basis mit Reserven" : score >= 50 ? "Mehrere klare Verbesserungsmöglichkeiten" : "Deutlicher Handlungsbedarf";
  return { key, label, weight, score, summary, findings };
}

function imageDimensions(tag: string) {
  const width = Number.parseInt(attribute(tag, "width") ?? "", 10);
  const height = Number.parseInt(attribute(tag, "height") ?? "", 10);
  return { width: Number.isFinite(width) ? width : null, height: Number.isFinite(height) ? height : null };
}

function pageType(label: string, url: string): WebsiteResearchPage["type"] {
  const value = normalizeText(`${label} ${url}`);
  if (/impressum|datenschutz|privacy|legal|agb/.test(value)) return "legal";
  if (/kontakt|contact|anfahrt/.test(value)) return "contact";
  if (/uber uns|ueber uns|about|team|unternehmen/.test(value)) return "about";
  if (/leistung|service|angebot|produkt|behandlung|sortiment|menu|speisekarte/.test(value)) return "services";
  if (/preis|tarif|paket|kosten/.test(value)) return "pricing";
  if (/termin|buch|reserv|appointment/.test(value)) return "booking";
  if (/galerie|gallery|referenz|projekt|portfolio/.test(value)) return "gallery";
  return "other";
}

export function extractWebsiteResearchDossier(html: string, finalUrl: string): WebsiteResearchDossier {
  const pageTitle = tagContents(html, "title")[0] ?? null;
  const description = metaContent(html, "description") ?? metaContent(html, "og:description");
  const headings = unique(["h1", "h2", "h3"].flatMap((tagName) => tagContents(html, tagName)))
    .filter((value) => value.length >= 3 && value.length <= 180 && !/cookie|datenschutz einstellungen/i.test(value))
    .slice(0, 18);
  const serviceHints = headings.filter((value) => /leistung|service|angebot|produkt|behandlung|sortiment|menu|speisekarte|kompetenz|lösung|loesung|was wir/i.test(value)).slice(0, 10);

  const linkMatches = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const linkRecords = linkMatches.flatMap((match) => {
    const url = absoluteUrl(attribute(`<a ${match[1]}>`, "href"), finalUrl);
    if (!url) return [];
    return [{ url, label: plainText(match[2]).slice(0, 120) || new URL(url).pathname }];
  });
  const baseHost = new URL(finalUrl).hostname.replace(/^www\./, "");
  const importantPages: WebsiteResearchPage[] = [];
  const seenPages = new Set<string>();
  for (const link of linkRecords) {
    const url = new URL(link.url);
    if (!hostMatches(url.hostname, baseHost)) continue;
    const type = pageType(link.label, link.url);
    if (type === "other" || seenPages.has(link.url)) continue;
    seenPages.add(link.url);
    importantPages.push({ label: link.label || type, url: link.url, type });
    if (importantPages.length >= 12) break;
  }

  const socialLinks = unique(linkRecords.map((link) => link.url).filter((url) => SOCIAL_HOSTS.some((host) => hostMatches(new URL(url).hostname, host)))).slice(0, 8);
  const contactHints = unique([
    ...linkRecords.filter((link) => /^mailto:|^tel:/i.test(attribute(`<a href="${link.url}">`, "href") ?? "")).map((link) => link.url),
    ...[...html.matchAll(/(?:mailto:)([^"'\s<>]+)/gi)].map((match) => `E-Mail: ${safeDecodeURIComponent(match[1]).split("?")[0]}`),
    ...[...html.matchAll(/(?:tel:)([^"'\s<>]+)/gi)].map((match) => `Telefon: ${safeDecodeURIComponent(match[1])}`),
  ]).slice(0, 10);

  const images: WebsiteResearchImage[] = [];
  const seenImages = new Set<string>();
  const addImage = (urlValue: string | null, alt: string, kind: WebsiteResearchImage["kind"]) => {
    const url = absoluteUrl(urlValue, finalUrl);
    if (!url || seenImages.has(url) || /(?:pixel|tracking|spacer|favicon|sprite)/i.test(url)) return;
    seenImages.add(url);
    images.push({
      url,
      sourceUrl: finalUrl,
      alt: alt.trim().slice(0, 180) || "Bild ohne Alternativtext",
      kind,
      rightsNote: "Quelle ist die offizielle Website; Nutzungsrecht vor Wiederverwendung bestätigen.",
    });
  };
  addImage(metaContent(html, "og:image") ?? metaContent(html, "twitter:image"), "Social-Preview der offiziellen Website", "social-preview");
  for (const tag of tags(html, "img")) {
    const { width, height } = imageDimensions(tag);
    if ((width != null && width < 96) || (height != null && height < 64)) continue;
    const src = attribute(tag, "src") ?? attribute(tag, "data-src") ?? attribute(tag, "data-lazy-src");
    const alt = attribute(tag, "alt") ?? "";
    addImage(src, alt, /logo|brand|marke/i.test(`${src ?? ""} ${alt}`) ? "logo" : "content");
    if (images.length >= 10) break;
  }

  const colorMatches = html.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) ?? [];
  const colorCounts = new Map<string, number>();
  for (const value of colorMatches) {
    const normalized = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase() : value.toLowerCase();
    colorCounts.set(normalized, (colorCounts.get(normalized) ?? 0) + 1);
  }
  const themeColor = metaContent(html, "theme-color")?.match(/^#[0-9a-f]{3,8}$/i)?.[0]?.toLowerCase();
  const brandColors = unique([themeColor ?? "", ...[...colorCounts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value)]).filter(Boolean).slice(0, 6);

  const technologyPatterns: Array<[RegExp, string]> = [
    [/wp-content|wp-includes/i, "WordPress"],
    [/elementor/i, "Elementor"],
    [/cdn\.shopify|shopify\.com/i, "Shopify"],
    [/wixstatic|wix-code/i, "Wix"],
    [/squarespace/i, "Squarespace"],
    [/_next\/static|__NEXT_DATA__/i, "Next.js"],
    [/webflow/i, "Webflow"],
    [/typo3/i, "TYPO3"],
    [/joomla/i, "Joomla"],
    [/bootstrap(?:\.min)?\.css|class=["'][^"']*\bcontainer\b/i, "Bootstrap-Hinweis"],
    [/googletagmanager|gtag\(/i, "Google Tag Manager / Analytics"],
  ];
  const technologyHints = technologyPatterns.flatMap(([pattern, label]) => (pattern.test(html) ? [label] : []));

  return {
    pageTitle,
    description: description?.slice(0, 500) ?? null,
    headings,
    serviceHints,
    contactHints,
    socialLinks,
    importantPages,
    images,
    brandColors,
    technologyHints,
  };
}

function verifyOfficialWebsite(input: WebsiteDocumentInput, research: WebsiteResearchDossier, visibleText: string): OfficialWebsiteVerification {
  const final = new URL(input.finalUrl);
  const businessNameTokens = companyTokens(input.business.name);
  const hostnameText = compactText(final.hostname.replace(/^www\./, ""));
  const pageIdentity = normalizeText(`${research.pageTitle ?? ""} ${tagContents(input.html, "h1").join(" ")} ${metaContent(input.html, "og:site_name") ?? ""}`);
  const visibleIdentity = normalizeText(visibleText.slice(0, 160_000));
  const evidence: string[] = [];
  let confidence = 0;

  let osmSource = false;
  try {
    const source = new URL(input.business.sourceUrl);
    osmSource = input.business.source === "OpenStreetMap" && hostMatches(source.hostname, "openstreetmap.org") && /^\/(node|way|relation)\//.test(source.pathname);
  } catch {
    osmSource = false;
  }
  if (osmSource) {
    confidence += 30;
    evidence.push("Website ist im zugehörigen OpenStreetMap-Firmeneintrag hinterlegt.");
  }

  const domainMatch = businessNameTokens.some((token) => hostnameText.includes(compactText(token)));
  if (domainMatch) {
    confidence += 25;
    evidence.push("Firmenname und Domain stimmen erkennbar überein.");
  }

  const pageNameMatch = businessNameTokens.some((token) => pageIdentity.includes(normalizeText(token)));
  if (pageNameMatch) {
    confidence += 25;
    evidence.push("Seitentitel oder Hauptüberschrift nennt die Firma beziehungsweise Marke.");
  }

  const phoneDigits = input.business.phone?.replace(/\D/g, "").slice(-7);
  if (phoneDigits && visibleText.replace(/\D/g, "").includes(phoneDigits)) {
    confidence += 10;
    evidence.push("Die bekannte Telefonnummer ist auf der Website vorhanden.");
  }

  const businessMailDomain = input.business.email?.split("@")[1]?.toLowerCase();
  if (businessMailDomain && hostMatches(final.hostname, businessMailDomain)) {
    confidence += 12;
    evidence.push("Die bekannte geschäftliche E-Mail verwendet dieselbe Domain.");
  }

  const addressTokens = companyTokens(input.business.address).filter((token) => !/^\d+$/.test(token));
  if (addressTokens.some((token) => visibleIdentity.includes(token))) {
    confidence += 8;
    evidence.push("Ein bekannter Standortbestandteil ist auf der Website auffindbar.");
  }

  const hasOrganizationSchema = /"@type"\s*:\s*(?:\[[^\]]*)?["'](?:organization|localbusiness|restaurant|medicalbusiness|store|professionalservice|hotel)/i.test(input.html);
  if (hasOrganizationSchema) {
    confidence += 10;
    evidence.push("Strukturierte Unternehmensdaten wurden gefunden.");
  }

  if (research.importantPages.some((page) => page.type === "contact" || page.type === "legal")) {
    confidence += 5;
    evidence.push("Kontakt- oder Anbieterinformationen sind auf der Domain verlinkt.");
  }

  confidence = Math.min(100, confidence);
  const verified = (osmSource && confidence >= 40) || confidence >= 50;
  return {
    verified,
    confidence,
    domain: final.hostname.replace(/^www\./, ""),
    finalUrl: final.toString(),
    reason: verified
      ? "Die Domain lässt sich mit mehreren Signalen dem Unternehmen zuordnen."
      : "Die Domain konnte nicht eindeutig genug mit dem Unternehmen verbunden werden; deshalb wurde kein Qualitäts-Score erstellt.",
    evidence,
  };
}

function gradeFor(score: number): WebsiteQualityGrade {
  if (score >= 90) return "Ausgezeichnet";
  if (score >= 80) return "Sehr gut";
  if (score >= 70) return "Gut";
  if (score >= 55) return "Ausbaufähig";
  return "Schwach";
}

export function analyzeWebsiteDocument(input: WebsiteDocumentInput): WebsiteDocumentAnalysis {
  const html = input.html.slice(0, 1_500_000);
  const visibleText = plainText(html);
  const normalizedVisible = normalizeText(visibleText);
  const research = extractWebsiteResearchDossier(html, input.finalUrl);
  const verification = verifyOfficialWebsite({ ...input, html }, research, visibleText);
  if (!verification.verified) return { verification, report: null };

  const title = research.pageTitle ?? "";
  const description = research.description ?? "";
  const h1s = tagContents(html, "h1");
  const h2s = tagContents(html, "h2");
  const imageTags = tags(html, "img");
  const scriptTags = tags(html, "script");
  const formTags = tags(html, "form");
  const inputTags = tags(html, "input").filter((tag) => (attribute(tag, "type") ?? "text").toLowerCase() !== "hidden");
  const labelCount = tags(html, "label").length;
  const imgWithAlt = imageTags.filter((tag) => attribute(tag, "alt")?.trim()).length;
  const lazyImages = imageTags.filter((tag) => /^(lazy|async)$/i.test(attribute(tag, "loading") ?? "")).length;
  const wordCount = visibleText.split(/\s+/).filter((word) => word.length >= 2).length;
  const htmlKb = Math.round(new TextEncoder().encode(html).byteLength / 1024);
  const viewport = metaContent(html, "viewport") ?? "";
  const canonical = absoluteUrl(linkHrefByRel(html, "canonical"), input.finalUrl);
  const robots = (metaContent(html, "robots") ?? "").toLowerCase();
  const structuredData = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
  const responsiveSignals = /@media\b|max-width\s*:|min-width\s*:|clamp\(|srcset=|sizes=/i.test(html);
  const fixedDesktopWidth = /(?:width|max-width)\s*:\s*(?:1[2-9]\d{2}|[2-9]\d{3,})px/i.test(html);
  const ctaMatches = normalizedVisible.match(/kontakt|anfragen|termin|reservieren|buchen|angebot|jetzt starten|mehr erfahren|anrufen|bestellen/g) ?? [];
  const hasPhoneLink = /href=["']tel:/i.test(html);
  const hasMailLink = /href=["']mailto:/i.test(html);
  const hasBooking = /termin|reserv|booking|appointment|calendly|buchung/i.test(`${normalizedVisible} ${research.importantPages.map((page) => page.url).join(" ")}`);
  const hasAbout = research.importantPages.some((page) => page.type === "about") || /uber uns|ueber uns|unser team|unsere geschichte/i.test(normalizedVisible);
  const hasTrustProof = /bewertung|rezension|referenz|kundenstimme|testimonial|zertifikat|auszeichnung|meisterbetrieb|partner/i.test(normalizedVisible);
  const hasImprint = research.importantPages.some((page) => page.type === "legal" && /impressum|anbieter/i.test(`${page.label} ${page.url}`));
  const hasPrivacy = research.importantPages.some((page) => page.type === "legal" && /datenschutz|privacy/i.test(`${page.label} ${page.url}`));
  const trackingDetected = /googletagmanager|google-analytics|gtag\(|facebook\.net\/.*fbevents|hotjar|matomo/i.test(html);
  const consentDetected = /cookiebot|cookie consent|consent manager|usercentrics|borlabs|complianz|klaro|cookiebanner/i.test(html);
  const lang = attribute(tags(html, "html")[0] ?? "", "lang");
  const hasLandmarks = /<(main|nav|header|footer)\b/i.test(html);
  const hasSkipLink = /href=["']#(?:main|content|hauptinhalt)/i.test(html);
  const hasContactInformation = hasPhoneLink || hasMailLink || research.importantPages.some((page) => page.type === "contact");
  const cacheControl = input.headers?.cacheControl ?? "";

  const categories: WebsiteQualityCategory[] = [
    category("technical", "Technik & Geschwindigkeit", 18, [
      finding("https", "HTTPS", input.finalUrl.startsWith("https://") ? "good" : "critical", input.finalUrl.startsWith("https://") ? "Verbindung ist verschlüsselt." : "Die Seite wird unverschlüsselt ausgeliefert.", "HTTPS vollständig aktivieren und alle Inhalte sicher laden."),
      finding("response", "Server-Reaktionszeit", statusFor(input.responseMs <= 1_500, input.responseMs <= 3_000), `${input.responseMs} ms bis zur HTML-Antwort.`, "Server, Caching und Weiterleitungen optimieren; anschließend mit echten Core Web Vitals messen."),
      finding("html-size", "HTML-Größe", statusFor(htmlKb <= 450, htmlKb <= 900), `${htmlKb} KB HTML wurden analysiert.`, "Unnötiges Markup und eingebettete Daten reduzieren."),
      finding("scripts", "Script-Last", statusFor(scriptTags.length <= 15, scriptTags.length <= 30), `${scriptTags.length} Script-Elemente auf der Startseite.`, "Drittanbieter-Scripte prüfen, bündeln und nur bei Bedarf laden."),
      finding("cache", "Caching-Hinweis", cacheControl ? "good" : "warning", cacheControl ? "Ein Cache-Control-Header ist vorhanden." : "Kein eindeutiger Cache-Control-Hinweis in der Antwort.", "Statische Inhalte mit sinnvoller Cache-Strategie ausliefern."),
    ]),
    category("mobile", "Mobilfreundlichkeit", 12, [
      finding("viewport", "Mobile Viewport", /width\s*=\s*device-width/i.test(viewport) ? "good" : "critical", viewport ? `Viewport: ${viewport}` : "Kein mobiler Viewport gefunden.", "width=device-width und eine passende initial-scale setzen."),
      finding("responsive", "Responsive Signale", statusFor(responsiveSignals, !fixedDesktopWidth), responsiveSignals ? "Responsive CSS- oder Bildsignale sind vorhanden." : "Im gelieferten HTML wurden kaum responsive Signale erkannt.", "Layouts auf 375, 768, 1024 und 1440 px testen und flexibel aufbauen."),
      finding("fixed-width", "Starre Desktop-Breiten", fixedDesktopWidth ? "warning" : "good", fixedDesktopWidth ? "Sehr große feste Pixelbreiten wurden gefunden." : "Keine auffällige starre Desktop-Mindestbreite gefunden.", "Feste Breiten durch flexible Container, min(), max() oder clamp() ersetzen."),
      finding("responsive-images", "Flexible Bilder", imageTags.length === 0 || /srcset=|sizes=/i.test(html) ? "good" : "warning", imageTags.length ? `${imageTags.length} Bilder; responsive Varianten ${/srcset=|sizes=/i.test(html) ? "erkennbar" : "nicht eindeutig"}.` : "Keine Inhaltsbilder auf der Startseite.", "Für große Motive srcset/sizes und mobile Ausschnitte bereitstellen."),
    ]),
    category("seo", "SEO & Auffindbarkeit", 18, [
      finding("title", "Seitentitel", statusFor(title.length >= 25 && title.length <= 65, title.length >= 10 && title.length <= 80), title ? `${title.length} Zeichen: ${title.slice(0, 100)}` : "Kein Seitentitel gefunden.", "Einen eindeutigen Titel aus Leistung, Marke und relevantem Standort formulieren."),
      finding("description", "Meta-Beschreibung", statusFor(description.length >= 80 && description.length <= 180, description.length >= 40), description ? `${description.length} Zeichen vorhanden.` : "Keine Meta-Beschreibung gefunden.", "Eine konkrete, klickstarke Beschreibung mit echtem Nutzen ergänzen."),
      finding("h1", "H1-Struktur", h1s.length === 1 ? "good" : h1s.length > 0 ? "warning" : "critical", `${h1s.length} H1-Überschrift${h1s.length === 1 ? "" : "en"} gefunden.`, "Genau eine klare Hauptüberschrift pro Seite verwenden."),
      finding("canonical", "Canonical URL", canonical ? "good" : "warning", canonical ? "Eine Canonical URL ist definiert." : "Keine Canonical URL erkannt.", "Die bevorzugte URL der Seite eindeutig auszeichnen."),
      finding("indexing", "Indexierbarkeit", /noindex/.test(robots) ? "critical" : "good", /noindex/.test(robots) ? "Die Seite weist Suchmaschinen auf noindex hin." : "Kein noindex-Signal in der Startseite.", "Noindex nur verwenden, wenn die öffentliche Seite bewusst nicht gefunden werden soll."),
      finding("schema", "Strukturierte Daten", structuredData ? "good" : "warning", structuredData ? "JSON-LD ist vorhanden." : "Keine JSON-LD-Daten erkannt.", "LocalBusiness/Organization mit echten Unternehmensdaten ergänzen."),
    ]),
    category("content", "Inhalte & Klarheit", 14, [
      finding("word-count", "Inhaltstiefe", statusFor(wordCount >= 300, wordCount >= 140), `${wordCount} sichtbare Wörter auf der Startseite.`, "Leistungen, Nutzen, Ablauf und lokale Relevanz konkreter erklären."),
      finding("headings", "Informationsstruktur", statusFor(h2s.length >= 2 && h2s.length <= 12, h2s.length >= 1), `${h2s.length} H2-Abschnitte gefunden.`, "Inhalte in klare, scanbare Themenabschnitte gliedern."),
      finding("services", "Leistungen erkennbar", research.serviceHints.length >= 2 ? "good" : research.serviceHints.length === 1 ? "warning" : "critical", research.serviceHints.length ? `${research.serviceHints.length} Leistungs- oder Angebotshinweise extrahiert.` : "Leistungen sind aus Überschriften nicht klar erkennbar.", "Die wichtigsten Leistungen mit Ergebnis, Zielgruppe und Beleg benennen."),
      finding("contact-content", "Kontaktdaten", hasContactInformation ? "good" : "warning", hasContactInformation ? "Kontaktweg oder Kontaktseite ist vorhanden." : "Kein eindeutiger Kontaktweg erkannt.", "Telefon, E-Mail oder Anfrageweg sichtbar und aktuell platzieren."),
    ]),
    category("conversion", "Anfragen & Verkaufswirkung", 14, [
      finding("cta", "Handlungsaufforderungen", statusFor(ctaMatches.length >= 3, ctaMatches.length >= 1), `${ctaMatches.length} mögliche CTA-Signale im Seitentext.`, "Pro Hauptabschnitt einen passenden nächsten Schritt mit konkretem Nutzen anbieten."),
      finding("direct-contact", "Direkter Kontakt", hasPhoneLink || hasMailLink ? "good" : "warning", hasPhoneLink || hasMailLink ? "Telefon- oder E-Mail-Link ist direkt nutzbar." : "Telefon und E-Mail sind nicht als direkte Aktionen erkennbar.", "Auf Mobilgeräten klickbare Telefon- und E-Mail-Aktionen anbieten."),
      finding("form-booking", "Anfrage oder Buchung", formTags.length > 0 || hasBooking ? "good" : "warning", formTags.length > 0 ? `${formTags.length} Formular${formTags.length === 1 ? "" : "e"} erkannt.` : hasBooking ? "Ein Termin- oder Buchungsweg ist verlinkt." : "Kein Formular oder Buchungsweg erkannt.", "Den zur Branche passenden Anfrage-, Termin- oder Reservierungsweg verkürzen."),
      finding("offer-clarity", "Angebotsklarheit", research.serviceHints.length >= 2 ? "good" : "warning", research.serviceHints.length >= 2 ? "Mehrere Angebotsbereiche sind erkennbar." : "Das Angebot wirkt auf der Startseite noch wenig greifbar.", "Leistung, Ergebnis, Zielgruppe und nächsten Schritt gemeinsam darstellen."),
    ]),
    category("trust", "Vertrauen & Seriosität", 12, [
      finding("identity", "Unternehmensidentität", verification.confidence >= 70 ? "good" : "warning", `Offiziellkeits-Vertrauen: ${verification.confidence}/100.`, "Firmenname, Adresse und Kontaktdaten konsistent in Website und Verzeichnissen pflegen."),
      finding("about", "Unternehmen & Team", hasAbout ? "good" : "warning", hasAbout ? "Über-uns-, Team- oder Unternehmensinhalt ist vorhanden." : "Kein eindeutiger Unternehmens- oder Teambereich erkannt.", "Menschen, Arbeitsweise und echte Erfahrung sichtbar machen."),
      finding("proof", "Belege & Referenzen", hasTrustProof ? "good" : "warning", hasTrustProof ? "Vertrauens- oder Referenzsignale wurden gefunden." : "Keine klaren Kunden-, Referenz- oder Qualitätssignale erkannt.", "Nur belegbare Bewertungen, Projekte, Zertifikate oder Partner integrieren."),
      finding("provider", "Anbieterinformationen", hasImprint ? "good" : "critical", hasImprint ? "Ein Impressumslink wurde gefunden." : "Kein eindeutiger Impressumslink erkannt.", "Anbieterinformationen leicht auffindbar und vollständig bereitstellen."),
    ]),
    category("accessibility", "Barrierefreiheit", 7, [
      finding("language", "Seitensprache", lang ? "good" : "warning", lang ? `Dokumentsprache: ${lang}.` : "Keine Dokumentsprache erkannt.", "Das lang-Attribut passend zur Seitensprache setzen."),
      finding("alt", "Bildbeschreibungen", imageTags.length === 0 || imgWithAlt / imageTags.length >= 0.85 ? "good" : imgWithAlt / Math.max(1, imageTags.length) >= 0.55 ? "warning" : "critical", imageTags.length ? `${imgWithAlt} von ${imageTags.length} Bildern besitzen einen nicht leeren Alternativtext.` : "Keine Inhaltsbilder zu prüfen.", "Informative Bilder sinnvoll beschreiben; dekorative Bilder korrekt ausblenden."),
      finding("forms", "Formular-Beschriftung", inputTags.length === 0 || labelCount >= inputTags.length ? "good" : labelCount > 0 ? "warning" : "critical", inputTags.length ? `${labelCount} Labels für ${inputTags.length} sichtbare Eingabefelder erkannt.` : "Keine sichtbaren Eingabefelder.", "Jedes Feld programmatisch und sichtbar beschriften sowie Fehler verständlich erklären."),
      finding("landmarks", "Seitenbereiche", hasLandmarks ? "good" : "warning", hasLandmarks ? "Semantische Hauptbereiche sind vorhanden." : "Keine eindeutigen semantischen Seitenbereiche erkannt.", "header, nav, main und footer semantisch einsetzen."),
      finding("skip-link", "Direkt zum Inhalt", hasSkipLink ? "good" : "warning", hasSkipLink ? "Ein Sprunglink zum Hauptinhalt ist vorhanden." : "Kein Sprunglink zum Hauptinhalt erkannt.", "Für Tastaturnutzung einen sichtbaren Fokus-Sprunglink ergänzen."),
    ]),
    category("legal", "Pflichtseiten & Datenschutzsignale", 5, [
      finding("imprint", "Impressum", hasImprint ? "good" : "critical", hasImprint ? "Impressumslink erkannt." : "Kein Impressumslink erkannt.", "Impressum sichtbar verlinken und fachlich prüfen lassen."),
      finding("privacy", "Datenschutz", hasPrivacy ? "good" : "critical", hasPrivacy ? "Datenschutzlink erkannt." : "Kein Datenschutzlink erkannt.", "Datenschutzerklärung sichtbar verlinken und an eingesetzte Dienste anpassen."),
      finding("consent", "Consent-Signal", !trackingDetected || consentDetected ? "good" : "warning", !trackingDetected ? "Keine typischen Tracking-Signaturen erkannt." : consentDetected ? "Tracking und ein Consent-Manager-Hinweis wurden erkannt." : "Tracking-Signale ohne eindeutigen Consent-Manager-Hinweis erkannt.", "Tracking, Einwilligungslogik und tatsächliche Datenflüsse fachlich prüfen."),
    ]),
  ];

  const overallScore = Math.round(categories.reduce((sum, item) => sum + item.score * item.weight, 0) / categories.reduce((sum, item) => sum + item.weight, 0));
  const ranked = categories.flatMap((item) => item.findings.map((entry) => ({ ...entry, category: item.label })));
  const severity = { critical: 0, warning: 1, good: 2 } as const;
  const topIssues = ranked.filter((entry) => entry.status !== "good").sort((a, b) => severity[a.status] - severity[b.status]).slice(0, 6);
  const positives = ranked.filter((entry) => entry.status === "good").slice(0, 6);

  return {
    verification,
    report: {
      version: 1,
      websiteUrl: input.requestedUrl,
      finalUrl: input.finalUrl,
      domain: verification.domain,
      scannedAt: new Date().toISOString(),
      official: verification,
      overallScore,
      grade: gradeFor(overallScore),
      opportunity: overallScore < 60 ? "hoch" : overallScore < 78 ? "mittel" : "niedrig",
      categories,
      topIssues,
      positives,
      metrics: { responseMs: Math.round(input.responseMs), htmlKb, wordCount, imageCount: imageTags.length, scriptCount: scriptTags.length },
      research,
      limitations: [
        "Der Scan bewertet öffentlich ausgeliefertes HTML und technische Signale, nicht das interne System oder geschützte Seiten.",
        "Mobilansicht, Bedienbarkeit und Core Web Vitals sollten für ein verbindliches Angebot zusätzlich im echten Browser geprüft werden.",
        "Pflichtseiten- und Datenschutzsignale sind keine Rechtsberatung; Inhalte und tatsächliche Datenflüsse müssen fachlich geprüft werden.",
        imageTags.length > 0 && lazyImages === 0 ? "Lazy Loading wurde im HTML nicht erkannt; dynamisch gesetzte Eigenschaften können vom Scan abweichen." : "Dynamisch nachgeladene Inhalte können vom HTML-Scan abweichen.",
      ],
    },
  };
}

export function quickAuditFromWebsiteReport(report: WebsiteQualityReport, current?: WebsiteAudit): WebsiteAudit {
  const baseline = current ?? {
    checks: { mobile: "open", speed: "open", cta: "open", seo: "open", trust: "open", content: "open", legal: "open" },
    notes: "",
    updatedAt: null,
  };
  const scores = Object.fromEntries(report.categories.map((item) => [item.key, item.score])) as Partial<Record<WebsiteQualityCategoryKey, number>>;
  const toStatus = (score = 0): "good" | "issue" => (score >= 70 ? "good" : "issue");
  const manualNotes = baseline.notes.split("[Automatischer Website-Scan]")[0].trim();
  const scanNotes = `[Automatischer Website-Scan]\n${report.overallScore}/100 (${report.grade}), geprüft am ${new Date(report.scannedAt).toLocaleDateString("de-DE")}.\nPrioritäten: ${report.topIssues.slice(0, 4).map((item) => `${item.label}: ${item.recommendation}`).join(" | ") || "Keine akuten Probleme erkannt."}`;
  return {
    checks: {
      mobile: toStatus(scores.mobile),
      speed: toStatus(scores.technical),
      cta: toStatus(scores.conversion),
      seo: toStatus(scores.seo),
      trust: toStatus(scores.trust),
      content: toStatus(scores.content),
      legal: toStatus(scores.legal),
    },
    notes: [manualNotes, scanNotes].filter(Boolean).join("\n\n").slice(0, 8_000),
    updatedAt: report.scannedAt,
  };
}

export function websiteResearchBrief(business: Pick<Business, "name" | "category" | "address">, report: WebsiteQualityReport) {
  const categories = report.categories.map((item) => `- ${item.label}: ${item.score}/100 · ${item.summary}`).join("\n");
  const issues = report.topIssues.map((item) => `- ${item.category} / ${item.label}: ${item.finding} Empfehlung: ${item.recommendation}`).join("\n") || "- Keine priorisierten Probleme erkannt.";
  const pages = report.research.importantPages.map((item) => `- ${item.label}: ${item.url}`).join("\n") || "- Keine eindeutigen Unterseiten extrahiert.";
  const images = report.research.images.map((item) => `- ${item.kind}: ${item.url} · ${item.rightsNote}`).join("\n") || "- Keine geeigneten Bildkandidaten extrahiert.";
  return `RECHERCHE-DOSSIER · ${business.name}\nBranche: ${business.category}\nStandort: ${business.address}\nOffizielle Website: ${report.finalUrl}\nQualitäts-Score: ${report.overallScore}/100 (${report.grade})\nVertrauen in Zuordnung: ${report.official.confidence}/100\n\nKATEGORIEN\n${categories}\n\nSEITENBESCHREIBUNG\n${report.research.description || "Keine Beschreibung gefunden."}\n\nERKANNTE ANGEBOTS- UND INHALTSHINWEISE\n${report.research.serviceHints.map((item) => `- ${item}`).join("\n") || "- Noch manuell prüfen."}\n\nWICHTIGE UNTERSEITEN\n${pages}\n\nPRIORITÄTEN FÜR EINEN RELAUNCH\n${issues}\n\nBILDKANDIDATEN\n${images}\n\nHinweis: Unternehmenszuordnung, Aussagen und Nutzungsrechte vor Veröffentlichung nochmals manuell bestätigen.`;
}
