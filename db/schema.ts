import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("Neu"),
    score: integer("score").notNull().default(0),
    priority: integer("priority", { mode: "boolean" }).notNull().default(false),
    snapshot: text("snapshot").notNull(),
    notes: text("notes").notNull().default(""),
    nextAction: text("next_action").notNull().default("Erstkontakt vorbereiten"),
    followUpAt: text("follow_up_at"),
    claimedById: text("claimed_by_id"),
    claimedByName: text("claimed_by_name"),
    claimedAt: text("claimed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_leads_status_updated").on(table.status, table.updatedAt),
    index("idx_leads_source_id").on(table.sourceId),
    index("idx_leads_claimed_by").on(table.claimedById, table.claimedAt),
  ],
);

export const interactions = sqliteTable(
  "interactions",
  {
    businessId: text("business_id").primaryKey(),
    action: text("action").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_interactions_action").on(table.action)],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    leadId: text("lead_id"),
    title: text("title").notNull(),
    dueAt: text("due_at"),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_tasks_completed_due").on(table.completed, table.dueAt),
    index("idx_tasks_lead_id").on(table.leadId),
  ],
);

export const teamNotes = sqliteTable(
  "team_notes",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    kind: text("kind").notNull().default("Notiz"),
    leadId: text("lead_id"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_team_notes_pinned_updated").on(table.pinned, table.updatedAt),
    index("idx_team_notes_lead_id").on(table.leadId),
  ],
);

export const teamChatMessages = sqliteTable(
  "team_chat_messages",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_team_chat_created_at").on(table.createdAt)],
);

export const masterPrompts = sqliteTable(
  "master_prompts",
  {
    id: text("id").primaryKey(),
    leadId: text("lead_id").notNull(),
    businessName: text("business_name").notNull(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    mode: text("mode").notNull(),
    variant: integer("variant").notNull().default(0),
    settings: text("settings").notNull(),
    fingerprint: text("fingerprint").notNull(),
    prompt: text("prompt").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_master_prompts_lead_created").on(table.leadId, table.createdAt),
    index("idx_master_prompts_author_id").on(table.authorId),
  ],
);

export const radarCache = sqliteTable(
  "radar_cache",
  {
    cacheKey: text("cache_key").primaryKey(),
    payload: text("payload").notNull(),
    fetchedAt: text("fetched_at").notNull(),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [index("idx_radar_cache_expires_at").on(table.expiresAt)],
);
