import type { Business, WebsiteStatus } from "./webworkbalance";

const WEBSITE_STATUSES = new Set<WebsiteStatus>([
  "not_found",
  "likely_missing",
  "needs_check",
  "exists",
  "unreachable",
  "outdated",
]);

function text(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : null;
}

function safeUrl(value: unknown, allowedHosts?: string[]) {
  const candidate = text(value, 1200);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (allowedHosts && !allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    return url.toString().slice(0, 1200);
  } catch {
    return null;
  }
}

export function sanitizeOsmBusinesses(value: unknown, limit = 200): Business[] {
  if (!Array.isArray(value)) return [];
  const businesses: Business[] = [];
  const seen = new Set<string>();
  for (const candidate of value.slice(0, limit)) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Partial<Business>;
    const id = text(item.id, 80);
    const sourceId = text(item.sourceId, 80);
    const name = text(item.name, 240);
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!id || !/^osm-(node|way|relation)-\d+$/.test(id) || !sourceId || !/^(node|way|relation)\/\d+$/.test(sourceId) || !name || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || seen.has(sourceId)) continue;
    seen.add(sourceId);
    const website = safeUrl(item.website);
    const websiteStatus = WEBSITE_STATUSES.has(item.websiteStatus as WebsiteStatus)
      ? (item.websiteStatus as WebsiteStatus)
      : website
        ? "exists"
        : "likely_missing";
    const imageUrl = safeUrl(item.imageUrl, ["upload.wikimedia.org"]);
    businesses.push({
      id,
      sourceId,
      source: "OpenStreetMap",
      sourceUrl: safeUrl(item.sourceUrl, ["openstreetmap.org"]) ?? `https://www.openstreetmap.org/${sourceId}`,
      name,
      category: text(item.category, 160) ?? "Unternehmen",
      categoryKey: text(item.categoryKey, 80) ?? "retail",
      lat,
      lon,
      address: text(item.address, 500) ?? "Adresse im Karteneintrag prüfen",
      phone: text(item.phone, 160),
      email: text(item.email, 320),
      website,
      websiteStatus,
      openingHours: text(item.openingHours, 500),
      socialUrl: safeUrl(item.socialUrl),
      imageUrl,
      imageAttribution: imageUrl ? text(item.imageAttribution, 500) : null,
      distanceKm: Math.max(0, Math.min(500, Number(item.distanceKm) || 0)),
      fetchedAt: text(item.fetchedAt, 80) ?? new Date().toISOString(),
    });
  }
  return businesses;
}
