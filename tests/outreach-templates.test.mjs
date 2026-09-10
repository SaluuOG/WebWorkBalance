import assert from "node:assert/strict";
import test from "node:test";
import { outreachTemplatesFor } from "../lib/webworkbalance.ts";

const prices = {
  landing: 1900,
  business: 3900,
  premium: 6900,
  shop: 9900,
  portal: 14900,
  webapp: 24900,
  hourly: 110,
  maintenance: 199,
};

function business(overrides = {}) {
  return {
    id: "osm-wwb-1",
    sourceId: "node-wwb-1",
    source: "OpenStreetMap",
    sourceUrl: "https://www.openstreetmap.org/node/1",
    name: "Muster Elektrotechnik GmbH",
    category: "Elektrofachbetrieb",
    categoryKey: "craft",
    lat: 49.4521,
    lon: 11.0767,
    address: "Königstraße 12, 90402 Nürnberg",
    phone: "+49 911 1234567",
    email: "info@muster-elektro.de",
    website: null,
    websiteStatus: "not_found",
    openingHours: null,
    socialUrl: null,
    imageUrl: null,
    imageAttribution: null,
    distanceKm: 1.2,
    fetchedAt: "2026-09-10T08:00:00.000Z",
    ...overrides,
  };
}

test("creates benefit-led first contact copy with the WWB team sign-off", () => {
  const outreach = outreachTemplatesFor(business(), prices);

  assert.match(outreach.subject, /digitalen Sichtbarkeit/);
  assert.match(outreach.email, /Der Grund meiner Nachricht:/);
  assert.match(outreach.email, /3-Punkte-Einschätzung/);
  assert.match(outreach.email, /Anfragen besser vorqualifiziert/);
  for (const text of [outreach.email, outreach.whatsapp, outreach.call, outreach.followUp]) {
    assert.match(text, /Grüße vom WWB Team \(WebWorkBalance\)/i);
    assert.doesNotMatch(text, /\d[\d.]*\s?€\s?netto/);
  }
  assert.match(outreach.strategy.internalOffer, /3\.900 € netto/);
});

test("uses verified observations from the audit instead of a generic pitch", () => {
  const outreach = outreachTemplatesFor(
    business({ website: "https://muster-elektro.de", websiteStatus: "outdated" }),
    prices,
    {
      checks: { mobile: "issue", speed: "good", cta: "issue", seo: "good", trust: "open", content: "open", legal: "open" },
      notes: "",
      updatedAt: "2026-09-10T08:30:00.000Z",
    },
  );

  assert.match(outreach.strategy.signal, /Mobile Darstellung und Klarer nächster Schritt/);
  assert.match(outreach.email, /konkrete, nachvollziehbare Verbesserungsmöglichkeiten/);
  assert.match(outreach.call, /entscheiden danach selbst/);
  assert.match(outreach.call, /Keine Zeit/);
  assert.match(outreach.call, /Kein Interesse/);
});

test("shows channel-specific guardrails for compliant manual outreach", () => {
  const outreach = outreachTemplatesFor(business(), prices);

  assert.match(outreach.channelNotes.email, /ausdrücklicher Einwilligung/);
  assert.match(outreach.channelNotes.whatsapp, /ausdrücklicher Einwilligung/);
  assert.match(outreach.channelNotes.call, /mutmaßliche Einwilligung/);
  assert.match(outreach.channelNotes.followUp, /Nach einem Nein/);
});
