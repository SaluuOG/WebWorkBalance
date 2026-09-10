import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the catalog's animation and scrolling utilities", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /--tw-enter-opacity/);
  assert.match(css, /scrollbar-width:\s*thin/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /scroll-fade-reveal-b/);
  assert.match(css, /mask-image:/);
  assert.match(css, /tw-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("splits large radar radii into bounded sequential search fields", async () => {
  const { createRadarSearchFields, buildRadarOverpassQuery } = await vite.ssrLoadModule(
    "/lib/radar-client.ts",
  );
  const fields = createRadarSearchFields({
    lat: 49.4521,
    lon: 11.0767,
    radiusKm: 50,
    category: "all",
  });

  assert.equal(fields.length, 7);
  assert.ok(fields.every((field) => field.radiusKm <= 5));
  const query = buildRadarOverpassQuery(fields[0], "all");
  assert.match(query, /\[timeout:7\]/);
  assert.match(query, /nwr\(around:5000/);
  assert.match(query, /out center 140/);
});

test("maps direct OpenStreetMap results into usable leads", async () => {
  const { mapOsmElements } = await vite.ssrLoadModule("/lib/radar-client.ts");
  const businesses = mapOsmElements(
    [
      {
        id: 123,
        type: "node",
        lat: 49.453,
        lon: 11.077,
        tags: {
          name: "Test Café",
          amenity: "cafe",
          phone: "+49 911 123456",
          "addr:street": "Königstraße",
          "addr:housenumber": "1",
          "addr:city": "Nürnberg",
        },
      },
    ],
    { lat: 49.4521, lon: 11.0767, radiusKm: 5, category: "gastro" },
  );

  assert.equal(businesses.length, 1);
  assert.equal(businesses[0].name, "Test Café");
  assert.equal(businesses[0].websiteStatus, "likely_missing");
  assert.equal(businesses[0].categoryKey, "gastro");
});

test("uses the first successful free radar provider without waiting for failed alternatives", async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const memory = new Map();
  globalThis.window = {
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
    },
  };
  globalThis.fetch = async (endpoint) => {
    if (String(endpoint).includes("maps.mail.ru")) {
      return new Response(JSON.stringify({ elements: [{
        id: 991,
        type: "node",
        lat: 49.4522,
        lon: 11.0768,
        tags: { name: "Radar Testbetrieb", shop: "bakery" },
      }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    throw new TypeError("provider unavailable");
  };

  try {
    const { searchOpenStreetMapDirect } = await vite.ssrLoadModule("/lib/radar-client.ts");
    const result = await searchOpenStreetMapDirect({ lat: 49.4521, lon: 11.0767, radiusKm: 2, category: "all" });
    assert.equal(result.provider, "maps.mail.ru");
    assert.equal(result.businesses.length, 1);
    assert.equal(result.businesses[0].name, "Radar Testbetrieb");
    assert.ok(result.diagnostics.length >= 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
