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
    readFile(new URL("../components/wwb/team-workspace.tsx", import.meta.url), "utf8"),
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
