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
