import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads, masterPrompts } from "../../../db/schema";
import {
  MASTER_PROMPT_MODES,
  MAX_MASTER_PROMPT_LENGTH,
  fingerprintStyleKey,
  MASTER_PROMPT_OPTIONS,
  type DesignFingerprint,
  type MasterPromptMode,
  type MasterPromptSettings,
  type SavedMasterPrompt,
} from "../../../lib/masterprompt-engine";
import { routeErrorMessage } from "../../../lib/route-error";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";

const settingKeys = Object.keys(MASTER_PROMPT_OPTIONS) as Array<Exclude<keyof MasterPromptSettings, "customInstructions">>;

function validMode(value: unknown): value is MasterPromptMode {
  return typeof value === "string" && MASTER_PROMPT_MODES.some((item) => item.value === value);
}

function validSettings(value: unknown): value is MasterPromptSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  if (typeof settings.customInstructions !== "string" || settings.customInstructions.length > 4000) return false;
  return settingKeys.every((key) =>
    typeof settings[key] === "string" && MASTER_PROMPT_OPTIONS[key].some((option) => option.value === settings[key]),
  );
}

function validFingerprint(value: unknown): value is DesignFingerprint {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const keys = ["id", "theme", "concept", "composition", "hero", "palette", "typography", "imagery", "motion", "rhythm"];
  return Number.isSafeInteger(item.seed)
    && keys.every((key) => typeof item[key] === "string" && item[key].length > 0 && item[key].length <= 1600)
    && /^WWB-[A-Z0-9]+$/.test(String(item.id))
    && (item.structure === undefined || (typeof item.structure === "string" && item.structure.length <= 200));
}

function serialize(row: typeof masterPrompts.$inferSelect): SavedMasterPrompt {
  return {
    id: row.id,
    leadId: row.leadId,
    businessName: row.businessName,
    authorId: row.authorId,
    authorName: row.authorName,
    mode: row.mode as MasterPromptMode,
    variant: row.variant,
    settings: JSON.parse(row.settings) as MasterPromptSettings,
    fingerprint: JSON.parse(row.fingerprint) as DesignFingerprint,
    prompt: row.prompt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const leadId = new URL(request.url).searchParams.get("leadId")?.trim();
    if (!leadId) return Response.json({ error: "Lead-ID fehlt." }, { status: 400 });
    const rows = await getDb()
      .select()
      .from(masterPrompts)
      .where(eq(masterPrompts.leadId, leadId.slice(0, 240)))
      .orderBy(desc(masterPrompts.createdAt))
      .limit(30);
    return Response.json({ prompts: rows.map(serialize) });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const payload = (await request.json()) as {
      leadId?: string;
      mode?: unknown;
      variant?: number;
      settings?: unknown;
      fingerprint?: unknown;
      prompt?: string;
    };
    const leadId = payload.leadId?.trim().slice(0, 240) ?? "";
    const prompt = payload.prompt?.trim() ?? "";
    if (!leadId) return Response.json({ error: "Lead-ID fehlt." }, { status: 400 });
    if (!validMode(payload.mode)) return Response.json({ error: "Ungültige Prompt-Art." }, { status: 400 });
    if (!validSettings(payload.settings)) return Response.json({ error: "Ungültige Prompt-Einstellungen." }, { status: 400 });
    if (!validFingerprint(payload.fingerprint)) return Response.json({ error: "Ungültiger Design-Fingerabdruck." }, { status: 400 });
    if (prompt.length < 200 || prompt.length > MAX_MASTER_PROMPT_LENGTH) return Response.json({ error: "Der Masterprompt hat eine ungültige Länge." }, { status: 400 });

    const db = getDb();
    const [lead] = await db.select({ id: leads.id, sourceId: leads.sourceId, name: leads.name, claimedById: leads.claimedById, claimedByName: leads.claimedByName }).from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead) return Response.json({ error: "Speichere die Firma zuerst als Lead." }, { status: 404 });
    if (lead.claimedById && lead.claimedById !== user.id) {
      return Response.json({ error: `${lead.claimedByName ?? "Ein Teammitglied"} arbeitet an diesem Lead.` }, { status: 409 });
    }

    const styleKey = fingerprintStyleKey(payload.fingerprint);
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO design_memory (style_key, business_id, fingerprint, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(style_key) DO NOTHING")
      .bind(styleKey, lead.sourceId || lead.id, JSON.stringify(payload.fingerprint), now).run();
    const direction = await env.DB.prepare("SELECT business_id FROM design_memory WHERE style_key = ?").bind(styleKey).first<{ business_id: string }>();
    if (direction && direction.business_id !== lead.sourceId && direction.business_id !== lead.id) return Response.json({ error: "Diese Designrichtung wird schon für eine andere Firma verwendet. Erzeuge eine Alternative." }, { status: 409 });
    const [row] = await db.insert(masterPrompts).values({
      id: crypto.randomUUID(),
      leadId: lead.id,
      businessName: lead.name,
      authorId: user.id,
      authorName: user.name.slice(0, 120),
      mode: payload.mode,
      variant: Math.max(0, Math.min(1_000_000, Math.trunc(payload.variant ?? 0))),
      settings: JSON.stringify(payload.settings),
      fingerprint: JSON.stringify(payload.fingerprint),
      prompt,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return Response.json({ prompt: serialize(row) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error: "Prompt-ID fehlt." }, { status: 400 });
    const rows = await getDb().delete(masterPrompts).where(and(eq(masterPrompts.id, id), eq(masterPrompts.authorId, user.id))).returning({ id: masterPrompts.id });
    if (!rows.length) return Response.json({ error: "Du kannst nur deine eigenen Masterprompts löschen." }, { status: 403 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
