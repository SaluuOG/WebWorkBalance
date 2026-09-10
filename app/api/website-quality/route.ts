import { analyzeWebsiteDocument, normalizeOfficialWebsiteUrl, websiteHostSafety } from "@/lib/website-quality";
import type { Business } from "@/lib/webworkbalance";

const MAX_HTML_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 12_000;

class WebsiteFetchError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status = 502) {
    super(message);
    this.name = "WebsiteFetchError";
    this.code = code;
    this.status = status;
  }
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function optionalText(value: unknown, maxLength: number) {
  const result = text(value, maxLength);
  return result || null;
}

function sanitizeBusiness(value: unknown): Pick<Business, "name" | "address" | "phone" | "email" | "source" | "sourceUrl" | "website"> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Partial<Business>;
  const name = text(input.name, 240);
  const website = optionalText(input.website, 1_000);
  if (!name) return null;
  return {
    name,
    address: text(input.address, 500),
    phone: optionalText(input.phone, 100),
    email: optionalText(input.email, 320),
    source: input.source === "OpenStreetMap" || input.source === "Demo" || input.source === "Manuell" ? input.source : "Manuell",
    sourceUrl: text(input.sourceUrl, 1_000),
    website,
  };
}

async function readHtmlLimited(response: Response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;
    length += value.byteLength;
    if (length > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new WebsiteFetchError("Die Startseite ist für den sicheren Schnellscan zu groß.", "WEBSITE_TOO_LARGE", 413);
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

async function fetchOfficialHomepage(initialUrl: URL) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let current = initialUrl;
  const startedAt = Date.now();
  try {
    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
      const safety = websiteHostSafety(current);
      if (!safety.safe) throw new WebsiteFetchError(safety.reason || "Diese Website-Adresse kann nicht geprüft werden.", "UNSAFE_WEBSITE", 422);
      let response: Response;
      try {
        response = await fetch(current, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
            "User-Agent": "WebWorkBalance-QualityScan/1.0",
          },
        });
      } catch (error) {
        if (controller.signal.aborted) throw new WebsiteFetchError("Die offizielle Website hat nicht innerhalb von 12 Sekunden geantwortet.", "WEBSITE_TIMEOUT", 504);
        throw new WebsiteFetchError(error instanceof Error ? `Website nicht erreichbar: ${error.message.slice(0, 160)}` : "Die Website ist nicht erreichbar.", "WEBSITE_UNREACHABLE");
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new WebsiteFetchError("Die Website leitet weiter, nennt aber kein Ziel.", "INVALID_REDIRECT");
        current = new URL(location, current);
        if (redirect === MAX_REDIRECTS) throw new WebsiteFetchError("Die Website leitet zu häufig weiter.", "TOO_MANY_REDIRECTS");
        continue;
      }
      if (!response.ok) {
        const message = response.status === 401 || response.status === 403
          ? "Die offizielle Website blockiert automatische Qualitätsprüfungen. Öffne sie für eine manuelle Prüfung."
          : `Die Website antwortet mit HTTP ${response.status}.`;
        throw new WebsiteFetchError(message, response.status === 401 || response.status === 403 ? "SCAN_BLOCKED" : "WEBSITE_HTTP_ERROR", 502);
      }
      const contentType = response.headers.get("content-type") ?? "";
      const html = await readHtmlLimited(response);
      if (!/html|xhtml/i.test(contentType) && !/^\s*<!doctype html|^\s*<html/i.test(html)) {
        throw new WebsiteFetchError("Die hinterlegte URL liefert keine HTML-Website.", "NOT_HTML", 422);
      }
      return {
        html,
        finalUrl: current.toString(),
        responseMs: Date.now() - startedAt,
        status: response.status,
        headers: {
          cacheControl: response.headers.get("cache-control"),
          contentType,
        },
      };
    }
    throw new WebsiteFetchError("Die Website konnte nach den Weiterleitungen nicht geladen werden.", "INVALID_REDIRECT");
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { business?: unknown };
    const business = sanitizeBusiness(payload.business);
    if (!business) return Response.json({ error: "Die Firmendaten sind unvollständig.", code: "INVALID_BUSINESS" }, { status: 400 });
    if (!business.website) {
      return Response.json({ error: "Für diese Firma ist keine offizielle Website hinterlegt. Der Qualitäts-Scan wurde nicht gestartet.", code: "NO_OFFICIAL_WEBSITE" }, { status: 400 });
    }
    const websiteUrl = normalizeOfficialWebsiteUrl(business.website);
    if (!websiteUrl) return Response.json({ error: "Die hinterlegte Website-Adresse ist ungültig.", code: "INVALID_WEBSITE" }, { status: 400 });
    const safety = websiteHostSafety(websiteUrl);
    if (!safety.safe) return Response.json({ error: safety.reason, code: "NOT_OFFICIAL_WEBSITE" }, { status: 422 });

    let fetched;
    try {
      fetched = await fetchOfficialHomepage(websiteUrl);
    } catch (error) {
      if (error instanceof WebsiteFetchError && error.code === "WEBSITE_UNREACHABLE" && websiteUrl.protocol === "https:") {
        const httpFallback = new URL(websiteUrl);
        httpFallback.protocol = "http:";
        fetched = await fetchOfficialHomepage(httpFallback);
      } else {
        throw error;
      }
    }
    const analysis = analyzeWebsiteDocument({
      business,
      requestedUrl: websiteUrl.toString(),
      ...fetched,
    });
    return Response.json(analysis, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof WebsiteFetchError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return Response.json({ error: "Der Website-Scan konnte nicht abgeschlossen werden.", code: "SCAN_FAILED" }, { status: 500 });
  }
}
