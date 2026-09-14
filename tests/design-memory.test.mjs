import assert from "node:assert/strict";
import test, { after, beforeEach } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "vite";
import { generateMasterPrompt, fingerprintStyleKey } from "../lib/masterprompt-engine.ts";

const sqlite = new DatabaseSync(":memory:");
const migrationsDirectory = new URL("../drizzle/", import.meta.url);
for (const filename of (await readdir(migrationsDirectory)).filter((name) => name.endsWith(".sql")).sort()) {
  sqlite.exec(await readFile(new URL(filename, migrationsDirectory), "utf8"));
}
function prepare(query) {
  let args = [];
  return {
    bind(...values) { args = values; return this; },
    async run() { return sqlite.prepare(query).run(...args); },
    async first() { return sqlite.prepare(query).get(...args) ?? null; },
    async all() { return { results: sqlite.prepare(query).all(...args) }; },
    async raw() {
      const statement = sqlite.prepare(query);
      statement.setReturnArrays(true);
      return statement.all(...args);
    },
  };
}
globalThis.__wwbDesignTestEnv = { DB: { prepare, batch: async (statements) => Promise.all(statements.map((item) => item.all())) } };
const vite = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false }, plugins: [{
  name: "design-memory-worker-env", resolveId(id) { if (id === "cloudflare:workers") return "\0design-test-env"; },
  load(id) { if (id === "\0design-test-env") return "export const env = globalThis.__wwbDesignTestEnv;"; },
}] });
after(async () => { await vite.close(); sqlite.close(); delete globalThis.__wwbDesignTestEnv; });
beforeEach(() => {
  sqlite.exec("DELETE FROM master_prompts; DELETE FROM design_memory; DELETE FROM leads;");
});
const route = await vite.ssrLoadModule("/app/api/design-memory/route.ts");
const masterPromptsRoute = await vite.ssrLoadModule("/app/api/master-prompts/route.ts");
const generated = generateMasterPrompt({ business: { sourceId: "test-1", name: "Atelier Test", category: "Architekturbüro", categoryKey: "professional", address: "Nürnberg", websiteStatus: "not_found" }, prices: { premium: 6900, business: 3900 } });
const { fingerprint } = generated;
function request(body, authenticated = true, path = "/api/design-memory") {
  return new Request(`https://wwb.test${path}`, { method: "POST", headers: { "content-type": "application/json", ...(authenticated ? { "x-wwb-device-id": "device-test-123456789012", "x-wwb-device-name": "QA" } : {}) }, body: JSON.stringify(body) });
}
function addLead(id) {
  const sourceId = `source-${id}`;
  const now = "2026-09-14T12:00:00.000Z";
  sqlite.prepare("INSERT INTO leads (id, source_id, name, category, snapshot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, sourceId, `Atelier ${id}`, "Architekturbüro", "{}", now, now);
  return { id, sourceId };
}
function masterPromptRequest(leadId, savedFingerprint = fingerprint) {
  return request({ leadId, mode: generated.mode, variant: 1100, settings: generated.settings, fingerprint: savedFingerprint, prompt: generated.prompt }, true, "/api/master-prompts");
}

test("shared style memory persists once, rejects cross-company duplicates and is readable", async () => {
  assert.equal((await route.POST(request({ businessId: "one", fingerprint }, false))).status, 401);
  assert.equal((await route.POST(request({ businessId: "one", fingerprint: {} }))).status, 400);
  assert.equal((await route.POST(request({ businessId: "one", fingerprint }))).status, 200);
  assert.equal((await route.POST(request({ businessId: "one", fingerprint }))).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM design_memory").get().n, 1);
  assert.equal((await route.POST(request({ businessId: "two", fingerprint: { ...fingerprint, id: "WWB-SECOND", concept: "Different company" } }))).status, 409);
  const data = await (await route.GET()).json();
  assert.equal(data.fingerprints.length, 1);
  assert.equal(fingerprintStyleKey(data.fingerprints[0]), fingerprintStyleKey(fingerprint));
});

test("saving concurrent prompts atomically reserves an unused style for only one company", async () => {
  const companies = [addLead("first"), addLead("second")];
  const competingFingerprint = { ...fingerprint, id: "WWB-SECOND", concept: "A different company's concept" };
  assert.equal(fingerprintStyleKey(competingFingerprint), fingerprintStyleKey(fingerprint));
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM design_memory").get().n, 0);

  // Neither company calls the separate reservation endpoint before saving.
  const responses = await Promise.all([
    masterPromptsRoute.POST(masterPromptRequest(companies[0].id)),
    masterPromptsRoute.POST(masterPromptRequest(companies[1].id, competingFingerprint)),
  ]);
  const bodies = await Promise.all(responses.map((response) => response.json()));
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409], JSON.stringify(bodies));
  const winnerIndex = responses.findIndex((response) => response.status === 201);
  const winner = companies[winnerIndex];
  assert.equal(bodies[winnerIndex].prompt.leadId, winner.id);
  assert.equal(bodies[winnerIndex].prompt.variant, 1100);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM master_prompts").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM design_memory").get().n, 1);
  assert.equal(sqlite.prepare("SELECT business_id FROM design_memory WHERE style_key = ?").get(fingerprintStyleKey(fingerprint)).business_id, winner.sourceId);

  const repeatedSave = await masterPromptsRoute.POST(masterPromptRequest(winner.id, winnerIndex === 0 ? fingerprint : competingFingerprint));
  assert.equal(repeatedSave.status, 201, await repeatedSave.text());
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM design_memory").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM master_prompts").get().n, 2);
});

test("saving rejects an incomplete fingerprint with 400 before reserving or writing a prompt", async () => {
  const company = addLead("invalid-fingerprint");
  const response = await masterPromptsRoute.POST(masterPromptRequest(company.id, { id: "WWB-BROKEN", seed: 1 }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Design-Fingerabdruck/);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM design_memory").get().n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM master_prompts").get().n, 0);
});
