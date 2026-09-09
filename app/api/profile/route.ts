import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads, masterPrompts, teamChatMessages, teamNotes } from "../../../db/schema";
import { routeErrorMessage } from "../../../lib/route-error";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";

export async function PATCH(request: Request) {
  try {
    const user = getAuthenticatedSiteUser(request.headers);
    if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });

    const payload = (await request.json()) as { name?: string };
    const name = payload.name?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 40) ?? "";
    if (name.length < 2) return Response.json({ error: "Der Team-Name braucht mindestens 2 Zeichen." }, { status: 400 });

    const db = getDb();
    const claimedLeads = await db.update(leads).set({ claimedByName: name }).where(eq(leads.claimedById, user.id)).returning({ id: leads.id });
    const authoredNotes = await db.update(teamNotes).set({ authorName: name }).where(eq(teamNotes.authorId, user.id)).returning({ id: teamNotes.id });
    const authoredMessages = await db.update(teamChatMessages).set({ authorName: name }).where(eq(teamChatMessages.authorId, user.id)).returning({ id: teamChatMessages.id });
    const authoredPrompts = await db.update(masterPrompts).set({ authorName: name }).where(eq(masterPrompts.authorId, user.id)).returning({ id: masterPrompts.id });

    return Response.json({ user: { ...user, name }, updatedLeads: claimedLeads.length, updatedNotes: authoredNotes.length, updatedMessages: authoredMessages.length, updatedPrompts: authoredPrompts.length });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
