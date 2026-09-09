import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { teamNotes } from "../../../db/schema";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";
import { routeErrorMessage } from "../../../lib/route-error";
import type { TeamNoteKind } from "../../../lib/webworkbalance";

const noteKinds: TeamNoteKind[] = ["Notiz", "Recherche", "Idee", "Blocker"];

export async function GET() {
  try {
    const rows = await getDb().select().from(teamNotes).orderBy(desc(teamNotes.pinned), desc(teamNotes.updatedAt));
    return Response.json({ notes: rows });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const payload = (await request.json()) as { body?: string; kind?: TeamNoteKind; leadId?: string | null };
    const body = payload.body?.trim();
    if (!body) return Response.json({ error: "Die Notiz ist leer." }, { status: 400 });
    const now = new Date().toISOString();
    const [note] = await getDb().insert(teamNotes).values({
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: user.name.slice(0, 120),
      body: body.slice(0, 6000),
      kind: noteKinds.includes(payload.kind ?? "Notiz") ? payload.kind ?? "Notiz" : "Notiz",
      leadId: payload.leadId?.slice(0, 240) || null,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const payload = (await request.json()) as { id?: string; pinned?: boolean; body?: string };
    if (!payload.id) return Response.json({ error: "Notiz-ID fehlt." }, { status: 400 });
    const update: Partial<typeof teamNotes.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (typeof payload.pinned === "boolean") update.pinned = payload.pinned;
    if (typeof payload.body === "string") update.body = payload.body.trim().slice(0, 6000);
    const [note] = await getDb().update(teamNotes).set(update).where(eq(teamNotes.id, payload.id)).returning();
    if (!note) return Response.json({ error: "Notiz nicht gefunden." }, { status: 404 });
    return Response.json({ note });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Notiz-ID fehlt." }, { status: 400 });
    const removed = await getDb().delete(teamNotes).where(and(eq(teamNotes.id, id), eq(teamNotes.authorId, user.id))).returning();
    if (!removed.length) return Response.json({ error: "Du kannst nur deine eigenen Notizen löschen." }, { status: 403 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
