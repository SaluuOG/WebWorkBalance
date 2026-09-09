import { haversineKm, type Business, type SearchCenter } from "./webworkbalance";

export type RadarSearchRequest = {
  lat: number;
  lon: number;
  radiusKm: number;
  category: string;
};

export type RadarSearchField = {
  lat: number;
  lon: number;
  radiusKm: number;
  label: string;
};

export type RadarDirectResult = {
  businesses: Business[];
  provider: string;
  fieldsSearched: number;
  fieldsPlanned: number;
  partial: boolean;
  sampled: boolean;
  diagnostics: string[];
};

export type RadarCacheEntry = {
  result: RadarDirectResult;
  createdAt: string;
  stale: boolean;
};

type OsmElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type StoredRadarCache = Record<string, Omit<RadarCacheEntry, "stale">>;

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
] as const;

const RADAR_CACHE_STORAGE_KEY = "wwb-radar-direct-cache-v2";
const REGIONAL_CACHE_STORAGE_KEY = "wwb-regional-direct-cache-v2";
const PREFERRED_ENDPOINT_STORAGE_KEY = "wwb-overpass-preferred-endpoint-v1";
const FRESH_CACHE_MS = 30 * 60 * 1000;
const STALE_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5_500;
const MAX_RESULTS = 160;

const categorySelectors: Record<string, string[]> = {
  all: [
    `["name"]["shop"]`,
    `["name"]["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream|doctors|dentist|pharmacy|clinic|veterinary|bank|car_repair"]`,
    `["name"]["craft"]`,
    `["name"]["office"]`,
    `["name"]["healthcare"]`,
    `["name"]["leisure"~"fitness_centre|sports_centre"]`,
    `["name"]["tourism"~"hotel|guest_house|hostel|apartment"]`,
  ],
  retail: [`["name"]["shop"]`],
  gastro: [
    `["name"]["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"]`,
    `["name"]["shop"~"bakery|confectionery|deli"]`,
  ],
  beauty: [`["name"]["shop"~"hairdresser|beauty|cosmetics|massage|tattoo"]`],
  craft: [`["name"]["craft"]`],
  health: [
    `["name"]["amenity"~"doctors|dentist|pharmacy|clinic|veterinary"]`,
    `["name"]["healthcare"]`,
  ],
  professional: [`["name"]["office"]`],
  fitness: [
    `["name"]["leisure"~"fitness_centre|sports_centre"]`,
    `["name"]["sport"]`,
  ],
  auto: [
    `["name"]["shop"~"car|car_repair|tyres|motorcycle"]`,
    `["name"]["amenity"="car_repair"]`,
  ],
  hotel: [`["name"]["tourism"~"hotel|guest_house|hostel|apartment"]`],
};

export class RadarDirectError extends Error {
  diagnostics: string[];

  constructor(message: string, diagnostics: string[]) {
    super(message);
    this.name = "RadarDirectError";
    this.diagnostics = diagnostics;
  }
}

function clean(value?: string) {
  const result = value?.trim();
  return result ? result.slice(0, 500) : null;
}

function normalizeWebsite(value?: string) {
  const result = clean(value);
  if (!result) return null;
  if (/^https?:\/\//i.test(result)) return result;
  return `https://${result}`;
}

function labelFromTags(tags: Record<string, string>) {
  const raw = tags.shop ?? tags.amenity ?? tags.craft ?? tags.office ?? tags.healthcare ?? tags.leisure ?? tags.tourism ?? "Unternehmen";
  const translations: Record<string, string> = {
    hairdresser: "Friseursalon",
    beauty: "Kosmetikstudio",
    restaurant: "Restaurant",
    cafe: "Café",
    fast_food: "Gastronomie",
    dentist: "Zahnarztpraxis",
    doctors: "Arztpraxis",
    pharmacy: "Apotheke",
    fitness_centre: "Fitnessstudio",
    car_repair: "Kfz-Werkstatt",
    hotel: "Hotel",
    bakery: "Bäckerei",
    lawyer: "Kanzlei",
    accountant: "Steuerberatung",
    estate_agent: "Immobilienbüro",
  };
  return translations[raw] ?? raw.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

function categoryKeyFromTags(tags: Record<string, string>) {
  if (tags.craft) return "craft";
  if (["restaurant", "cafe", "fast_food", "bar", "pub", "ice_cream"].includes(tags.amenity ?? "") || ["bakery", "confectionery", "deli"].includes(tags.shop ?? "")) return "gastro";
  if (["hairdresser", "beauty", "cosmetics", "massage", "tattoo"].includes(tags.shop ?? "")) return "beauty";
  if (tags.healthcare || ["doctors", "dentist", "pharmacy", "clinic", "veterinary"].includes(tags.amenity ?? "")) return "health";
  if (tags.office) return "professional";
  if (tags.leisure || tags.sport) return "fitness";
  if (["car", "car_repair", "tyres", "motorcycle"].includes(tags.shop ?? "") || tags.amenity === "car_repair") return "auto";
  if (tags.tourism) return "hotel";
  return "retail";
}

function addressFromTags(tags: Record<string, string>) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  return [street, city].filter(Boolean).join(", ") || "Adresse im Karteneintrag prüfen";
}

function offsetPoint(lat: number, lon: number, distanceKm: number, bearingDegrees: number) {
  const earthRadiusKm = 6371;
  const angularDistance = distanceKm / earthRadiusKm;
  const bearing = (bearingDegrees * Math.PI) / 180;
  const latitude = (lat * Math.PI) / 180;
  const longitude = (lon * Math.PI) / 180;
  const nextLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance) +
      Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const nextLongitude = longitude + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
    Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(nextLatitude),
  );
  return { lat: (nextLatitude * 180) / Math.PI, lon: (nextLongitude * 180) / Math.PI };
}

export function createRadarSearchFields(request: RadarSearchRequest): RadarSearchField[] {
  const category = categorySelectors[request.category] ? request.category : "all";
  const requestedRadius = Math.min(50, Math.max(2, request.radiusKm));
  const fieldRadius = Math.min(requestedRadius, category === "all" ? 5 : 6);
  const fields: RadarSearchField[] = [{ lat: request.lat, lon: request.lon, radiusKm: fieldRadius, label: "Zentrum" }];
  if (requestedRadius <= fieldRadius) return fields;

  const count = requestedRadius >= 30 ? 7 : requestedRadius >= 13 ? 5 : 3;
  const bearings = [0, 90, 180, 270, 45, 225];
  const offsetKm = Math.max(fieldRadius * 0.75, Math.min(requestedRadius - fieldRadius * 0.25, requestedRadius * 0.58));
  for (let index = 0; index < count - 1; index += 1) {
    const point = offsetPoint(request.lat, request.lon, offsetKm, bearings[index]);
    fields.push({ ...point, radiusKm: fieldRadius, label: `Teilgebiet ${index + 2}` });
  }
  return fields;
}

export function buildRadarOverpassQuery(field: RadarSearchField, category: string) {
  const selectors = categorySelectors[category] ?? categorySelectors.all;
  const around = `(around:${Math.round(field.radiusKm * 1000)},${field.lat.toFixed(5)},${field.lon.toFixed(5)})`;
  const clauses = selectors.map((selector) => `node${around}${selector};`).join("");
  return `[out:json][timeout:7];(${clauses});out body 140;`;
}

export function mapOsmElements(elements: OsmElement[], request: RadarSearchRequest) {
  const fetchedAt = new Date().toISOString();
  const seen = new Set<string>();
  const businesses: Business[] = [];
  for (const element of elements) {
    const tags = element.tags ?? {};
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    const name = clean(tags.name);
    if (!name || lat == null || lon == null) continue;
    const sourceId = `${element.type}/${element.id}`;
    if (seen.has(sourceId)) continue;
    seen.add(sourceId);
    const distanceKm = haversineKm(request.lat, request.lon, lat, lon);
    if (distanceKm > request.radiusKm + 0.5) continue;
    const website = normalizeWebsite(tags.website ?? tags["contact:website"] ?? tags.url);
    const imageCandidate = clean(tags.image);
    const imageUrl = imageCandidate && /^https:\/\/upload\.wikimedia\.org\//i.test(imageCandidate) ? imageCandidate : null;
    businesses.push({
      id: `osm-${element.type}-${element.id}`,
      sourceId,
      source: "OpenStreetMap",
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      name,
      category: labelFromTags(tags),
      categoryKey: categoryKeyFromTags(tags),
      lat,
      lon,
      address: addressFromTags(tags),
      phone: clean(tags.phone ?? tags["contact:phone"] ?? tags.mobile ?? tags["contact:mobile"]),
      email: clean(tags.email ?? tags["contact:email"]),
      website,
      websiteStatus: website ? "exists" : "likely_missing",
      openingHours: clean(tags.opening_hours),
      socialUrl: clean(tags["contact:instagram"] ?? tags["contact:facebook"] ?? tags.facebook ?? tags.instagram),
      imageUrl,
      imageAttribution: imageUrl ? "Quelle im OpenStreetMap-Eintrag prüfen" : null,
      distanceKm: Number(distanceKm.toFixed(1)),
      fetchedAt,
    });
  }
  return businesses;
}

export function mergeRadarBusinesses(...groups: Business[][]) {
  const merged = new Map<string, Business>();
  for (const business of groups.flat()) {
    const existing = merged.get(business.sourceId);
    if (!existing || Number(Boolean(business.phone)) + Number(Boolean(business.email)) + Number(Boolean(business.website)) > Number(Boolean(existing.phone)) + Number(Boolean(existing.email)) + Number(Boolean(existing.website))) {
      merged.set(business.sourceId, business);
    }
  }
  return [...merged.values()];
}

async function postOverpass(endpoint: string, query: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ data: query }).toString(),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { elements?: OsmElement[] };
    return data.elements ?? [];
  } finally {
    window.clearTimeout(timer);
  }
}

function errorLabel(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "Zeitlimit";
  if (error instanceof Error && error.name === "AbortError") return "Zeitlimit";
  if (error instanceof Error && /Failed to fetch|NetworkError|Load failed/i.test(error.message)) return "CORS/Netzwerk";
  return error instanceof Error ? error.message.slice(0, 80) : "Unbekannter Fehler";
}

function preferredEndpointIndex() {
  try {
    const savedEndpoint = window.localStorage.getItem(PREFERRED_ENDPOINT_STORAGE_KEY);
    const savedIndex = OVERPASS_ENDPOINTS.findIndex((endpoint) => endpoint === savedEndpoint);
    return savedIndex >= 0 ? savedIndex : 0;
  } catch {
    return 0;
  }
}

function rememberEndpoint(endpoint: string) {
  try {
    window.localStorage.setItem(PREFERRED_ENDPOINT_STORAGE_KEY, endpoint);
  } catch {
    // Die Suche funktioniert auch dann, wenn der Browser Speicher blockiert.
  }
}

export async function searchOpenStreetMapDirect(
  request: RadarSearchRequest,
  onProgress?: (message: string) => void,
): Promise<RadarDirectResult> {
  const normalized: RadarSearchRequest = {
    lat: Number(request.lat),
    lon: Number(request.lon),
    radiusKm: Math.min(50, Math.max(2, Number(request.radiusKm) || 5)),
    category: categorySelectors[request.category] ? request.category : "all",
  };
  const fields = createRadarSearchFields(normalized);
  const diagnostics: string[] = [];
  let businesses: Business[] = [];
  let successfulFields = 0;
  let provider = "OpenStreetMap Direktmodus";
  let preferredIndex = preferredEndpointIndex();

  for (const [fieldIndex, field] of fields.entries()) {
    onProgress?.(`Suchfeld ${fieldIndex + 1}/${fields.length}: ${field.label} wird direkt abgefragt …`);
    const query = buildRadarOverpassQuery(field, normalized.category);
    let fieldElements: OsmElement[] | null = null;
    // Erst der zuletzt erfolgreiche Anbieter, dann alle Alternativen. Falls alle
    // scheitern, bekommt der bevorzugte Anbieter nach einer kurzen Pause genau
    // einen automatischen Wiederholungsversuch.
    for (let endpointOffset = 0; endpointOffset <= OVERPASS_ENDPOINTS.length; endpointOffset += 1) {
      const endpointIndex = (preferredIndex + (endpointOffset % OVERPASS_ENDPOINTS.length)) % OVERPASS_ENDPOINTS.length;
      const endpoint = OVERPASS_ENDPOINTS[endpointIndex];
      const hostname = new URL(endpoint).hostname;
      if (endpointOffset === OVERPASS_ENDPOINTS.length) {
        onProgress?.(`${field.label}: letzter automatischer Wiederholungsversuch über ${hostname} …`);
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
      try {
        fieldElements = await postOverpass(endpoint, query);
        preferredIndex = endpointIndex;
        rememberEndpoint(endpoint);
        provider = hostname;
        break;
      } catch (error) {
        diagnostics.push(`${hostname}: ${errorLabel(error)}`);
      }
    }

    if (!fieldElements) {
      if (!successfulFields) break;
      continue;
    }
    successfulFields += 1;
    businesses = mergeRadarBusinesses(businesses, mapOsmElements(fieldElements, normalized));
    onProgress?.(`${businesses.length} Einträge gefunden · Suchfeld ${fieldIndex + 1}/${fields.length}`);
    if (businesses.length >= MAX_RESULTS) break;
  }

  if (!successfulFields) {
    throw new RadarDirectError(
      "Alle freien OpenStreetMap-Endpunkte waren von diesem Gerät aus gerade nicht erreichbar.",
      diagnostics,
    );
  }

  businesses = businesses
    .sort((first, second) => first.distanceKm - second.distanceKm || first.name.localeCompare(second.name, "de"))
    .slice(0, MAX_RESULTS);
  return {
    businesses,
    provider,
    fieldsSearched: successfulFields,
    fieldsPlanned: fields.length,
    partial: successfulFields < fields.length,
    sampled: normalized.radiusKm > fields[0].radiusKm,
    diagnostics: diagnostics.slice(0, 8),
  };
}

function requestCacheKey(request: RadarSearchRequest) {
  return `${request.lat.toFixed(4)}:${request.lon.toFixed(4)}:${Math.round(request.radiusKm * 10) / 10}:${request.category}`;
}

function readCacheStore(storageKey: string): StoredRadarCache {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as StoredRadarCache;
  } catch {
    return {};
  }
}

function writeCacheStore(storageKey: string, store: StoredRadarCache) {
  try {
    const newest = Object.entries(store)
      .sort(([, first], [, second]) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .slice(0, 18);
    window.localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(newest)));
  } catch {
    // Der Radar bleibt ohne Geräte-Cache voll nutzbar.
  }
}

export function readRadarClientCache(request: RadarSearchRequest, allowStale = false): RadarCacheEntry | null {
  const entry = readCacheStore(RADAR_CACHE_STORAGE_KEY)[requestCacheKey(request)];
  if (!entry) return null;
  const age = Date.now() - new Date(entry.createdAt).getTime();
  if (!Number.isFinite(age) || age > STALE_CACHE_MS || (!allowStale && age > FRESH_CACHE_MS)) return null;
  return { ...entry, stale: age > FRESH_CACHE_MS };
}

export function writeRadarClientCache(request: RadarSearchRequest, result: RadarDirectResult) {
  const store = readCacheStore(RADAR_CACHE_STORAGE_KEY);
  store[requestCacheKey(request)] = { result, createdAt: new Date().toISOString() };
  writeCacheStore(RADAR_CACHE_STORAGE_KEY, store);
}

export function readRegionalClientCache(allowStale = false): RadarCacheEntry | null {
  const entry = readCacheStore(REGIONAL_CACHE_STORAGE_KEY).regional;
  if (!entry) return null;
  const age = Date.now() - new Date(entry.createdAt).getTime();
  if (!Number.isFinite(age) || age > STALE_CACHE_MS || (!allowStale && age > FRESH_CACHE_MS)) return null;
  return { ...entry, stale: age > FRESH_CACHE_MS };
}

export function writeRegionalClientCache(result: RadarDirectResult) {
  writeCacheStore(REGIONAL_CACHE_STORAGE_KEY, { regional: { result, createdAt: new Date().toISOString() } });
}

export const REGIONAL_SEARCH_CENTERS: SearchCenter[] = [
  { name: "Nürnberg", lat: 49.4521, lon: 11.0767, passport: true },
  { name: "Fürth", lat: 49.4771, lon: 10.9887, passport: true },
  { name: "Erlangen", lat: 49.5897, lon: 11.0119, passport: true },
  { name: "Schwabach", lat: 49.3295, lon: 11.0209, passport: true },
  { name: "Zirndorf & Stein", lat: 49.4272, lon: 10.9626, passport: true },
  { name: "Lauf & Hersbruck", lat: 49.5135, lon: 11.282, passport: true },
];
