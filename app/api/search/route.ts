import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { radarCache } from "../../../db/schema";
import { sanitizeOsmBusinesses } from "../../../lib/radar-cache-validation";
import type { Business } from "../../../lib/webworkbalance";

type RadarPayload = {
  businesses: Business[];
  limited: boolean;
  source: "OpenStreetMap";
  segments: number;
  provider?: string;
  sampled?: boolean;
};

const VALID_CATEGORIES = new Set(["all", "retail", "gastro", "beauty", "craft", "health", "professional", "fitness", "auto", "hotel"]);
const CACHE_TTL_MS = 45 * 60 * 1000;

function cacheKey(lat: number, lon: number, radiusKm: number, category: string) {
  return `${lat.toFixed(4)}:${lon.toFixed(4)}:${Math.round(radiusKm * 10) / 10}:${category}`;
}

function normalizeRequest(payload: { lat?: number; lon?: number; radiusKm?: number; category?: string }) {
  const lat = Number(payload.lat);
  const lon = Number(payload.lon);
  const radiusKm = Math.min(50, Math.max(2, Number(payload.radiusKm) || 5));
  const category = VALID_CATEGORIES.has(payload.category ?? "all") ? payload.category ?? "all" : "all";
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, radiusKm, category };
}

async function readCached(key: string) {
  try {
    const [row] = await getDb().select().from(radarCache).where(eq(radarCache.cacheKey, key)).limit(1);
    if (!row) return null;
    return {
      payload: JSON.parse(row.payload) as RadarPayload,
      fresh: new Date(row.expiresAt).getTime() > Date.now(),
    };
  } catch {
    return null;
  }
}

async function writeCached(key: string, payload: RadarPayload) {
  const now = new Date();
  await getDb().insert(radarCache).values({
    cacheKey: key,
    payload: JSON.stringify(payload),
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  }).onConflictDoUpdate({
    target: radarCache.cacheKey,
    set: {
      payload: JSON.stringify(payload),
      fetchedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const normalized = normalizeRequest(await request.json());
    if (!normalized) return Response.json({ error: "Der Suchort ist ungültig.", code: "INVALID_LOCATION" }, { status: 400 });
    const cached = await readCached(cacheKey(normalized.lat, normalized.lon, normalized.radiusKm, normalized.category));
    if (cached?.fresh) return Response.json({ ...cached.payload, cached: true, cacheAge: "frisch", clientFallback: false });
    return Response.json({
      ...(cached?.payload ?? { businesses: [], limited: false, source: "OpenStreetMap", segments: 0 }),
      cached: Boolean(cached),
      stale: Boolean(cached),
      clientFallback: true,
      warning: cached
        ? "Der Team-Cache ist älter. Der Radar aktualisiert ihn jetzt direkt über dein Gerät."
        : "Kein Team-Cache vorhanden. Die Suche startet ohne Server-Wartezeit direkt über dein Gerät.",
    });
  } catch {
    return Response.json({ businesses: [], limited: false, source: "OpenStreetMap", segments: 0, clientFallback: true, warning: "Der Team-Cache ist nicht erreichbar; der Direktmodus übernimmt." });
  }
}

export async function PUT(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 450_000) return Response.json({ error: "Der Cache-Datensatz ist zu groß." }, { status: 413 });
    const payload = JSON.parse(raw) as { lat?: number; lon?: number; radiusKm?: number; category?: string; businesses?: unknown; provider?: string; segments?: number; sampled?: boolean };
    const normalized = normalizeRequest(payload);
    if (!normalized) return Response.json({ error: "Der Suchort ist ungültig." }, { status: 400 });
    const businesses = sanitizeOsmBusinesses(payload.businesses, 180);
    if (!businesses.length) return Response.json({ error: "Keine gültigen OpenStreetMap-Einträge zum Speichern." }, { status: 400 });
    const cachedPayload: RadarPayload = {
      businesses,
      limited: businesses.length >= 160,
      source: "OpenStreetMap",
      segments: Math.max(1, Math.min(10, Number(payload.segments) || 1)),
      provider: typeof payload.provider === "string" ? payload.provider.slice(0, 120) : "OpenStreetMap Direktmodus",
      sampled: Boolean(payload.sampled),
    };
    await writeCached(cacheKey(normalized.lat, normalized.lon, normalized.radiusKm, normalized.category), cachedPayload);
    return Response.json({ ok: true, count: businesses.length }, { status: 201 });
  } catch {
    return Response.json({ error: "Der Team-Cache konnte nicht aktualisiert werden." }, { status: 503 });
  }
}
