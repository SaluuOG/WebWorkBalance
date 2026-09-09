import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { interactions } from "../../../db/schema";
import { routeErrorMessage } from "../../../lib/route-error";

export async function GET() {
  try {
    const rows = await getDb().select().from(interactions);
    return Response.json({ interactions: rows });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { businessId?: string; action?: string };
    if (!payload.businessId || !payload.action) {
      return Response.json({ error: "Interaktion ist unvollständig." }, { status: 400 });
    }
    const record = {
      businessId: payload.businessId,
      action: payload.action.slice(0, 40),
      createdAt: new Date().toISOString(),
    };
    await getDb()
      .insert(interactions)
      .values(record)
      .onConflictDoUpdate({ target: interactions.businessId, set: record });
    return Response.json({ interaction: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const businessId = new URL(request.url).searchParams.get("businessId");
    if (!businessId) return Response.json({ error: "Unternehmens-ID fehlt." }, { status: 400 });
    await getDb().delete(interactions).where(eq(interactions.businessId, businessId));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
