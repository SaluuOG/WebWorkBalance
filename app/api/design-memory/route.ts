import { env } from "cloudflare:workers";
import { fingerprintStyleKey, type DesignFingerprint } from "../../../lib/masterprompt-engine";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";
import { routeErrorMessage } from "../../../lib/route-error";

function validFingerprint(value: unknown): value is DesignFingerprint {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const keys = ["id", "theme", "concept", "composition", "hero", "palette", "typography", "imagery", "motion", "rhythm"];
  return Number.isSafeInteger(item.seed) && keys.every((key) => typeof item[key] === "string" && item[key].length > 0 && item[key].length <= 1600)
    && (item.structure === undefined || (typeof item.structure === "string" && item.structure.length <= 200));
}

export async function GET() {
  try {
    const [recent, saved] = await env.DB.batch([
      env.DB.prepare("SELECT fingerprint FROM design_memory ORDER BY created_at DESC LIMIT 120"),
      env.DB.prepare("SELECT fingerprint FROM master_prompts ORDER BY created_at DESC LIMIT 80"),
    ]);
    const fingerprints: DesignFingerprint[] = [];
    for (const row of [...recent.results, ...saved.results]) {
      try { const item: unknown = JSON.parse(String(row.fingerprint)); if (validFingerprint(item)) fingerprints.push(item); } catch { /* Skip a damaged historical record. */ }
    }
    return Response.json({ fingerprints: [...new Map(fingerprints.map((item) => [item.id, item])).values()] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!getAuthenticatedSiteUser(request.headers)) return Response.json({ error: "Teamkennung fehlt." }, { status: 401 });
    const payload = await request.json() as { businessId?: unknown; fingerprint?: unknown };
    if (typeof payload.businessId !== "string" || !payload.businessId.trim() || payload.businessId.length > 240 || !validFingerprint(payload.fingerprint)) {
      return Response.json({ error: "Ungültiger Design-Fingerabdruck." }, { status: 400 });
    }
    const styleKey = fingerprintStyleKey(payload.fingerprint);
    await env.DB.prepare("INSERT INTO design_memory (style_key, business_id, fingerprint, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(style_key) DO NOTHING")
      .bind(styleKey, payload.businessId, JSON.stringify(payload.fingerprint), new Date().toISOString()).run();
    const row = await env.DB.prepare("SELECT business_id, fingerprint FROM design_memory WHERE style_key = ?").bind(styleKey).first<{ business_id: string; fingerprint: string }>();
    if (row && row.business_id !== payload.businessId) {
      return Response.json({ error: "Diese Stil-Kombination wurde bereits für eine andere Firma verwendet. Bitte eine Alternative erzeugen.", fingerprint: JSON.parse(row.fingerprint) }, { status: 409 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
