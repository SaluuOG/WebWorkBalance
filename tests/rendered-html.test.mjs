import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta = /["']codex-preview["']\s*:\s*["']development["']/i;

test("build includes development preview metadata", async () => {
  // The Worker bundle imports the Cloudflare-only `cloudflare:` protocol and
  // therefore cannot be executed directly by Node. The browser smoke test
  // covers the rendered response; this build test verifies the marker survived
  // compilation without pretending Node is a Workers runtime.
  const workerBundle = await readFile(new URL("../dist/server/index.js", import.meta.url), "utf8");
  assert.match(workerBundle, developmentPreviewMeta);
});

test("keeps the installed mobile app inside a stable device viewport", async () => {
  const [layout, manifest, stylesheet, app] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /maximumScale:\s*1/);
  assert.match(layout, /userScalable:\s*false/);
  assert.match(layout, /interactiveWidget:\s*"resizes-content"/);
  assert.match(manifest, /orientation:\s*"any"/);
  assert.match(stylesheet, /\.wwb-app-shell[\s\S]*?100dvh/);
  assert.match(stylesheet, /\.wwb-bottom-nav[\s\S]*?safe-area-inset-left/);
  assert.match(stylesheet, /font-size:\s*16px\s*!important/);
  assert.match(app, /className="wwb-app-shell text-foreground"/);
  assert.match(app, /className="wwb-bottom-nav fixed/);
});

test("opens the mobile quick menu without forcing the software keyboard or trapping scroll", async () => {
  const [menu, stylesheet] = await Promise.all([
    readFile(new URL("../components/wwb/quick-menu.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(menu, /onOpenAutoFocus/);
  assert.match(menu, /event\.preventDefault\(\)/);
  assert.match(menu, /pointer: coarse/);
  assert.match(menu, /requestAnimationFrame\(\(\) => window\.requestAnimationFrame\(action\)\)/);
  assert.match(menu, /touch-pan-y overscroll-contain/);
  assert.match(stylesheet, /\.wwb-command-dialog[\s\S]*?overflow:\s*hidden\s*!important/);
  assert.match(stylesheet, /overscroll-behavior:\s*contain/);
});

test("surfaces unread team notes when the app starts", async () => {
  const app = await readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8");

  assert.match(app, /TEAM_NOTES_READ_STORAGE_KEY/);
  assert.match(app, /syncTeamNotesState\(noteData\.notes\)/);
  assert.match(app, /Neue Team-Notizen/);
  assert.match(app, /Später erinnern/);
  assert.match(app, /Team öffnen/);
  assert.match(app, /rememberTeamNotes\(teamInboxPendingNotesRef\.current\)/);
});

test("shows live lead ownership and keeps team names recognizable", async () => {
  const [workspace, app, profileRoute] = await Promise.all([
    readFile(new URL("../components/wwb/team-workspace-v2.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(workspace, /Live-Arbeitsboard/);
  assert.match(workspace, /Wer arbeitet gerade woran\?/);
  assert.match(workspace, /Webseite in Arbeit/);
  assert.match(workspace, /Lead gesichert/);
  assert.match(workspace, /Dein Team-Name/);
  assert.match(app, /requestJson<\{ user: AppUser \}>\("\/api\/profile"/);
  assert.match(profileRoute, /claimedByName: name/);
  assert.match(profileRoute, /authorName: name/);
});

test("keeps important notes first and provides a separate durable team chat", async () => {
  const [workspace, app, chatRoute, schema, migration] = await Promise.all([
    readFile(new URL("../components/wwb/team-workspace-v2.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/chat/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0003_bent_princess_powerful.sql", import.meta.url), "utf8"),
  ]);

  assert.ok(workspace.indexOf("Team-Zentrale") < workspace.indexOf("Live-Arbeitsboard"));
  assert.match(workspace, /Wichtige Notiz senden/);
  assert.match(workspace, /Team-Chat/);
  assert.match(workspace, /Chat-Nachricht/);
  assert.match(app, /requestJson<\{ messages: TeamChatMessage\[\] \}>\("\/api\/chat"\)/);
  assert.match(app, /createTeamChatMessage/);
  assert.match(chatRoute, /limit\(150\)/);
  assert.match(chatRoute, /eq\(teamChatMessages\.authorId, user\.id\)/);
  assert.match(schema, /team_chat_messages/);
  assert.match(migration, /CREATE TABLE `team_chat_messages`/);
  assert.match(migration, /idx_team_chat_created_at/);
});

test("provides an editable company-specific masterprompt studio with durable history", async () => {
  const [studio, detail, route, schema, migration, engine] = await Promise.all([
    readFile(new URL("../components/wwb/masterprompt-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/wwb/detail-sheet.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/master-prompts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0004_plain_albert_cleary.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/masterprompt-engine.ts", import.meta.url), "utf8"),
  ]);

  assert.match(detail, /<MasterPromptStudio/);
  assert.match(studio, /Masterprompt Studio/);
  assert.match(studio, /Express Build/);
  assert.match(studio, /Express-Zeitbox/);
  assert.match(studio, /assessExpressReadiness/);
  assert.match(studio, /1–3 Std\./);
  assert.match(studio, /Einstellungen/);
  assert.match(studio, /Kreative Richtung/);
  assert.match(studio, /Bewegung & Erlebnis/);
  assert.match(studio, /Bilder & Umsetzung/);
  assert.match(studio, /copyPrompt\(true\)/);
  assert.match(studio, /\/api\/master-prompts/);
  assert.match(studio, /\/api\/images/);
  assert.match(studio, /Bildrecherche für den Prompt/);
  assert.match(studio, /Quelle & Lizenz prüfen/);
  assert.match(studio, /max-w-full resize-y/);
  assert.match(studio, /generateDistinctMasterPrompt/);
  assert.match(studio, /Eigenständigkeit/);
  assert.match(route, /limit\(30\)/);
  assert.match(route, /eq\(masterPrompts\.authorId, user\.id\)/);
  assert.match(route, /lead\.claimedById !== user\.id/);
  assert.match(schema, /master_prompts/);
  assert.match(migration, /CREATE TABLE `master_prompts`/);
  assert.match(migration, /idx_master_prompts_lead_created/);
  assert.match(engine, /createDesignFingerprint/);
  assert.match(engine, /generateMasterPrompt/);
  assert.match(engine, /## Animationsregie/);
  assert.match(engine, /Reduced Motion:/);
  assert.match(engine, /assessFingerprintOriginality/);
  assert.match(engine, /expressTimebox/);
  assert.match(engine, /WebWorkBalance Express Build/);
});

test("adds a verified official-site quality scan and richer research workflow", async () => {
  const [detail, scanner, research, route, leadRoute, model] = await Promise.all([
    readFile(new URL("../components/wwb/detail-sheet.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/wwb/website-quality-scanner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/wwb/business-research-hub.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/website-quality/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/webworkbalance.ts", import.meta.url), "utf8"),
  ]);

  assert.match(detail, /<WebsiteQualityScanner/);
  assert.match(detail, /<BusinessResearchHub/);
  assert.match(scanner, /Website Quality Scan/);
  assert.match(scanner, /Offizielle Website verifiziert/);
  assert.match(scanner, /Recherche-Dossier/);
  assert.match(research, /Lokale Wettbewerber/);
  assert.match(research, /Firmenbilder/);
  assert.match(research, /Website-Historie/);
  assert.match(route, /websiteHostSafety/);
  assert.match(route, /redirect:\s*"manual"/);
  assert.match(route, /MAX_HTML_BYTES/);
  assert.match(leadRoute, /websiteReport/);
  assert.match(model, /WebsiteQualityReport/);
  const app = await readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8");
  assert.match(app, /Website noch prüfen/);
  assert.match(app, /Schwächste Website zuerst/);
  assert.match(app, /scanSavedLeadWebsites/);
  assert.match(app, /Websites prüfen ·/);
  assert.match(app, /websiteScanQueue\.slice\(0, 8\)/);
});

test("uses the new supplied logo on every active app-icon surface", async () => {
  const [layout, manifest, loading, app, icon512, icon192, icon180, icon64] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/loading.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/webworkbalance-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/wwb-icon-v10-512.png", import.meta.url)),
    readFile(new URL("../public/wwb-icon-v10-192.png", import.meta.url)),
    readFile(new URL("../public/wwb-icon-v10-180.png", import.meta.url)),
    readFile(new URL("../public/wwb-icon-v10-64.png", import.meta.url)),
  ]);

  const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
  assert.deepEqual(pngSize(icon512), { width: 512, height: 512 });
  assert.deepEqual(pngSize(icon192), { width: 192, height: 192 });
  assert.deepEqual(pngSize(icon180), { width: 180, height: 180 });
  assert.deepEqual(pngSize(icon64), { width: 64, height: 64 });
  assert.match(layout, /wwb-icon-v10-64\.png/);
  assert.match(layout, /wwb-icon-v10-180\.png/);
  assert.match(manifest, /wwb-icon-v10-192\.png/);
  assert.match(manifest, /wwb-icon-v10-512\.png/);
  assert.match(loading, /wwb-icon-v10-512\.png/);
  assert.match(app, /wwb-icon-v10-192\.png/);
  assert.match(app, /wwb-icon-v10-512\.png/);
});
