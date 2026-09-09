import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { radarCache } from "../../../db/schema";
import { sanitizeOsmBusinesses } from "../../../lib/radar-cache-validation";
import type { Business } from "../../../lib/webworkbalance";

type RegionalPayload = {
  businesses: Business[];
  limited: boolean;
  source: "OpenStreetMap";
  scope: string;
  tiles: number;
  provider?: string;
};

const REGION_CACHE_KEY = "regional:nuremberg-county:v2";
const CACHE_TTL_MS = 60 * 60 * 1000;
const REGION_SCOPE = "Nürnberg, Fürth, Erlangen, Schwabach & umliegende Landkreise";

async function readCached() {
  try {
    const [row] = await getDb().select().from(radarCache).where(eq(radarCache.cacheKey, REGION_CACHE_KEY)).limit(1);
    if (!row) return null;
    return { payload: JSON.parse(row.payload) as RegionalPayload, fresh: new Date(row.expiresAt).getTime() > Date.now() };
  } catch {
    return null;
  }
}

async function writeCached(payload: RegionalPayload) {
  const now = new Date();
  await getDb().insert(radarCache).values({
    cacheKey: REGION_CACHE_KEY,
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

export async function GET() {
  try {
    const cached = await readCached();
    if (cached?.fresh) return Response.json({ ...cached.payload, cached: true, cacheAge: "frisch", clientFallback: false });
    return Response.json({
      ...(cached?.payload ?? { businesses: [], limited: false, source: "OpenStreetMap", scope: REGION_SCOPE, tiles: 0 }),
      cached: Boolean(cached),
      stale: Boolean(cached),
      clientFallback: true,
      warning: cached
        ? "Der gespeicherte Regionalstand wird im Direktmodus aktualisiert."
        : "Die Regional-Liste wird jetzt direkt über dein Gerät aufgebaut.",
    });
  } catch {
    return Response.json({ businesses: [], limited: false, source: "OpenStreetMap", scope: REGION_SCOPE, tiles: 0, clientFallback: true, warning: "Der Team-Cache ist nicht erreichbar; der Direktmodus übernimmt." });
  }
}

export async function PUT(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 700_000) return Response.json({ error: "Der Regional-Cache ist zu groß." }, { status: 413 });
    const value = JSON.parse(raw) as { businesses?: unknown; tiles?: number; provider?: string };
    const businesses = sanitizeOsmBusinesses(value.businesses, 500);
    if (!businesses.length) return Response.json({ error: "Keine gültigen Regional-Einträge zum Speichern." }, { status: 400 });
    const payload: RegionalPayload = {
      businesses,
      limited: businesses.length >= 480,
      source: "OpenStreetMap",
      scope: REGION_SCOPE,
      tiles: Math.max(1, Math.min(12, Number(value.tiles) || 1)),
      provider: typeof value.provider === "string" ? value.provider.slice(0, 120) : "OpenStreetMap Direktmodus",
    };
    await writeCached(payload);
    return Response.json({ ok: true, count: businesses.length }, { status: 201 });
  } catch {
    return Response.json({ error: "Der Regional-Cache konnte nicht aktualisiert werden." }, { status: 503 });
  }
}
