import { and, desc, eq, isNull, lt, ne, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { calculateLeadScore, type Business, type LeadActivity, type LeadStatus, type WebsiteAudit, type WebsiteQualityReport } from "../../../lib/webworkbalance";
import { routeErrorMessage } from "../../../lib/route-error";
import { getAuthenticatedSiteUser } from "../../../lib/site-user";

function serializeLead(row: typeof leads.$inferSelect) {
  const business = JSON.parse(row.snapshot) as Business;
  return {
    ...business,
    id: row.id,
    sourceId: row.sourceId,
    name: row.name,
    category: row.category,
    score: row.score,
    status: row.status as LeadStatus,
    priority: row.priority,
    notes: row.notes,
    nextAction: row.nextAction,
    followUpAt: row.followUpAt,
    claimedById: row.claimedById,
    claimedByName: row.claimedByName,
    claimedAt: row.claimedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(leads).orderBy(desc(leads.updatedAt));
    return Response.json({ leads: rows.map(serializeLead) });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { business?: Business; priority?: boolean };
    const business = payload.business;
    if (!business?.id || !business.name || !business.sourceId) {
      return Response.json({ error: "Unvollständiger Unternehmenseintrag." }, { status: 400 });
    }
    const [duplicate] = await getDb()
      .select()
      .from(leads)
      .where(and(sql`lower(${leads.name}) = ${business.name.trim().toLowerCase()}`, ne(leads.id, business.id)))
      .limit(1);
    if (duplicate) {
      return Response.json({ error: `${duplicate.name} ist bereits als Lead gespeichert.` }, { status: 409 });
    }
    const now = new Date().toISOString();
    const record: typeof leads.$inferInsert = {
      id: business.id,
      sourceId: business.sourceId,
      name: business.name.slice(0, 240),
      category: business.category.slice(0, 160),
      status: payload.priority ? "Interessant" : "Neu",
      score: calculateLeadScore(business),
      priority: Boolean(payload.priority),
      snapshot: JSON.stringify(business),
      notes: "",
      nextAction: "Erstkontakt vorbereiten",
      followUpAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const [row] = await getDb()
      .insert(leads)
      .values(record)
      .onConflictDoUpdate({
        target: leads.id,
        set: {
          snapshot: record.snapshot,
          priority: record.priority,
          score: record.score,
          updatedAt: now,
        },
      })
      .returning();
    return Response.json({ lead: serializeLead(row) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      status?: LeadStatus;
      priority?: boolean;
      notes?: string;
      nextAction?: string;
      followUpAt?: string | null;
      websiteStatus?: Business["websiteStatus"];
      audit?: WebsiteAudit;
      websiteReport?: WebsiteQualityReport;
      activities?: LeadActivity[];
      claim?: "claim" | "release";
    };
    if (!payload.id) return Response.json({ error: "Lead-ID fehlt." }, { status: 400 });
    if (payload.websiteReport) {
      const reportSize = JSON.stringify(payload.websiteReport).length;
      if (reportSize > 120_000) return Response.json({ error: "Der Website-Prüfbericht ist zu groß." }, { status: 413 });
      if (payload.websiteReport.version !== 1 || !payload.websiteReport.official?.verified || !Number.isFinite(payload.websiteReport.overallScore) || payload.websiteReport.overallScore < 0 || payload.websiteReport.overallScore > 100) {
        return Response.json({ error: "Der Website-Prüfbericht ist ungültig." }, { status: 400 });
      }
    }

    const db = getDb();
    const [existing] = await db.select().from(leads).where(eq(leads.id, payload.id)).limit(1);
    if (!existing) return Response.json({ error: "Lead nicht gefunden." }, { status: 404 });

    if (payload.claim) {
      const user = getAuthenticatedSiteUser(request.headers);
      if (!user) return Response.json({ error: "Deine Anmeldung konnte nicht erkannt werden." }, { status: 401 });
      const now = new Date().toISOString();
      if (payload.claim === "release") {
        if (existing.claimedById && existing.claimedById !== user.id) {
          return Response.json({ error: `${existing.claimedByName ?? "Ein Teammitglied"} bearbeitet diesen Lead.` }, { status: 409 });
        }
        const [row] = await db.update(leads).set({ claimedById: null, claimedByName: null, claimedAt: null, updatedAt: now }).where(eq(leads.id, payload.id)).returning();
        return Response.json({ lead: serializeLead(row) });
      }
      const staleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [row] = await db.update(leads).set({
        claimedById: user.id,
        claimedByName: user.name.slice(0, 120),
        claimedAt: now,
        updatedAt: now,
      }).where(and(
        eq(leads.id, payload.id),
        or(isNull(leads.claimedById), eq(leads.claimedById, user.id), lt(leads.claimedAt, staleBefore)),
      )).returning();
      if (!row) {
        const [current] = await db.select().from(leads).where(eq(leads.id, payload.id)).limit(1);
        return Response.json({ error: `${current?.claimedByName ?? "Ein Teammitglied"} bearbeitet diesen Lead bereits.` }, { status: 409 });
      }
      return Response.json({ lead: serializeLead(row) });
    }

    const editor = getAuthenticatedSiteUser(request.headers);
    if (existing.claimedById && existing.claimedById !== editor?.id) {
      return Response.json({ error: `${existing.claimedByName ?? "Ein Teammitglied"} bearbeitet diesen Lead bereits.` }, { status: 409 });
    }

    let snapshot = existing.snapshot;
    let score = existing.score;
    if (payload.websiteStatus || payload.audit || payload.websiteReport || payload.activities) {
      const business = JSON.parse(existing.snapshot) as Business;
      if (payload.websiteStatus) business.websiteStatus = payload.websiteStatus;
      if (payload.audit) business.audit = payload.audit;
      if (payload.websiteReport) business.websiteReport = payload.websiteReport;
      if (payload.activities) business.activities = payload.activities.slice(0, 100);
      snapshot = JSON.stringify(business);
      score = calculateLeadScore(business);
    }

    const update: Partial<typeof leads.$inferInsert> = {
      updatedAt: new Date().toISOString(),
      snapshot,
      score,
    };
    if (payload.status) update.status = payload.status;
    if (typeof payload.priority === "boolean") update.priority = payload.priority;
    if (typeof payload.notes === "string") update.notes = payload.notes.slice(0, 8000);
    if (typeof payload.nextAction === "string") update.nextAction = payload.nextAction.slice(0, 500);
    if (payload.followUpAt !== undefined) update.followUpAt = payload.followUpAt;

    const [row] = await db.update(leads).set(update).where(eq(leads.id, payload.id)).returning();
    return Response.json({ lead: serializeLead(row) });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Lead-ID fehlt." }, { status: 400 });
    await getDb().delete(leads).where(eq(leads.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: routeErrorMessage(error) }, { status: 503 });
  }
}
