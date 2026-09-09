import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { teamChatMessages } from "../../../db/schema";
import { routeErrorMessage } from "../../../lib/route-error";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";

function cleanMessage(value: string | undefined) {
  return value
    ?.replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 2000) ?? "";
}

export async function GET() {
  try {
    const rows = await getDb().select().from(teamChatMessages).orderBy(desc(teamChatMessages.createdAt)).limit(150);
    return Response.json({ messages: rows.reverse() });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const payload = (await request.json()) as { body?: string };
    const body = cleanMessage(payload.body);
    if (!body) return Response.json({ error: "Die Nachricht ist leer." }, { status: 400 });
    const now = new Date().toISOString();
    const [message] = await getDb().insert(teamChatMessages).values({
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: user.name.slice(0, 120),
      body,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return Response.json({ message }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Nachrichten-ID fehlt." }, { status: 400 });
    const removed = await getDb().delete(teamChatMessages).where(and(eq(teamChatMessages.id, id), eq(teamChatMessages.authorId, user.id))).returning();
    if (!removed.length) return Response.json({ error: "Du kannst nur deine eigenen Nachrichten löschen." }, { status: 403 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
