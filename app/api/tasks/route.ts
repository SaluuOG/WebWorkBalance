import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { tasks } from "../../../db/schema";
import { routeErrorMessage } from "../../../lib/route-error";

export async function GET() {
  try {
    const rows = await getDb().select().from(tasks).orderBy(asc(tasks.completed), asc(tasks.dueAt));
    return Response.json({ tasks: rows });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { title?: string; leadId?: string | null; dueAt?: string | null };
    const title = payload.title?.trim();
    if (!title) return Response.json({ error: "Aufgabentitel fehlt." }, { status: 400 });
    const [task] = await getDb()
      .insert(tasks)
      .values({
        leadId: payload.leadId ?? null,
        title: title.slice(0, 500),
        dueAt: payload.dueAt ?? null,
        completed: false,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { id?: number; completed?: boolean; title?: string; dueAt?: string | null };
    if (!payload.id) return Response.json({ error: "Aufgaben-ID fehlt." }, { status: 400 });
    const update: Partial<typeof tasks.$inferInsert> = {};
    if (typeof payload.completed === "boolean") update.completed = payload.completed;
    if (typeof payload.title === "string") update.title = payload.title.slice(0, 500);
    if (payload.dueAt !== undefined) update.dueAt = payload.dueAt;
    const [task] = await getDb().update(tasks).set(update).where(eq(tasks.id, payload.id)).returning();
    return Response.json({ task });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Aufgaben-ID fehlt." }, { status: 400 });
    await getDb().delete(tasks).where(eq(tasks.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
