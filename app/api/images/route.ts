type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

type ImageRelevance = "company-search" | "industry-inspiration";

function plain(value?: string) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().slice(0, 500);
}

function clean(value: string | null, max = 150) {
  return (value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function inspirationTerms(category: string) {
  const value = category.toLocaleLowerCase("de-DE");
  if (/(restaurant|café|cafe|bar|bäck|gastro|imbiss)/.test(value)) return "Gastronomie Innenraum Speisen Atmosphäre";
  if (/(friseur|barber|beauty|kosmetik|tattoo|spa)/.test(value)) return "Salon Behandlung Interieur Details";
  if (/(handwerk|bau|elektr|sanitär|maler|schreiner|dach)/.test(value)) return "Handwerk Arbeitsprozess Werkzeug Ergebnis";
  if (/(arzt|praxis|gesund|therap|physio|zahn|pflege)/.test(value)) return "Praxis Räume Team Behandlung Vertrauen";
  if (/(fitness|sport|gym|yoga)/.test(value)) return "Training Bewegung Studio Gemeinschaft";
  if (/(auto|kfz|werkstatt|reifen)/.test(value)) return "Werkstatt Fahrzeug Diagnose Handwerk";
  if (/(hotel|pension|unterkunft|ferien)/.test(value)) return "Hotel Zimmer Architektur Gastgeber";
  if (/(shop|handel|laden|mode|boutique)/.test(value)) return "Ladengeschäft Sortiment Beratung Detail";
  if (/(beratung|anwalt|steuer|immobil|architekt|agentur|finanz|büro)/.test(value)) return "Beratung Architektur Arbeitsprozess Expertise";
  return "Unternehmen Arbeitsprozess Team Standort";
}

async function searchCommons(query: string, relevance: ImageRelevance, limit: number) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "720",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: { "User-Agent": "WebWorkBalance/1.0 image research" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Commons HTTP ${response.status}`);
  const data = (await response.json()) as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(data.query?.pages ?? {}).flatMap((page) => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !/^https:\/\//.test(info.thumburl)) return [];
    return [{
      id: String(page.pageid),
      title: page.title.replace(/^File:/, ""),
      thumbnailUrl: info.thumburl,
      sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/?curid=${page.pageid}`,
      artist: plain(info.extmetadata?.Artist?.value) || "Urheber auf Wikimedia Commons",
      license: plain(info.extmetadata?.LicenseShortName?.value) || "Lizenz auf Quellseite prüfen",
      relevance,
      searchQuery: query,
      usageStatus: "Vor Verwendung Zuordnung und Lizenz prüfen",
    }];
  });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fallbackQuery = clean(params.get("q"));
  const company = clean(params.get("company"));
  const category = clean(params.get("category"));
  const location = clean(params.get("location"));
  const primaryQuery = company ? [company, location].filter(Boolean).join(" ") : fallbackQuery;
  if (primaryQuery.length < 2) return Response.json({ images: [] });

  try {
    const primary = await searchCommons(primaryQuery, "company-search", 4);
    const inspirationQuery = [category || fallbackQuery, location, inspirationTerms(category || fallbackQuery)].filter(Boolean).join(" ");
    let inspiration: Awaited<ReturnType<typeof searchCommons>> = [];
    if (category && primary.length < 4) {
      try {
        inspiration = await searchCommons(inspirationQuery, "industry-inspiration", 4);
      } catch {
        // The exact company search remains useful if the inspiration query fails.
      }
    }
    const images = [...primary, ...inspiration]
      .filter((image, index, items) => items.findIndex((item) => item.id === image.id) === index)
      .slice(0, 6);
    return Response.json(
      {
        images,
        verificationRequired: true,
        notice: "Suchtreffer sind visuelle Recherche, kein Nachweis der Unternehmenszugehörigkeit.",
      },
      { headers: { "Cache-Control": "public, max-age=600" } },
    );
  } catch {
    return Response.json({ images: [], error: "Die Bildquellen konnten gerade nicht geprüft werden." }, { status: 503 });
  }
}
