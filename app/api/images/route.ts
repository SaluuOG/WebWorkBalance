type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

function plain(value?: string) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().slice(0, 500);
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 150) return Response.json({ images: [] });
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "4",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "720",
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
      headers: { "User-Agent": "WebWorkBalance/1.0 image research" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Commons unavailable");
    const data = (await response.json()) as { query?: { pages?: Record<string, CommonsPage> } };
    const images = Object.values(data.query?.pages ?? {}).flatMap((page) => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl || !/^https:\/\//.test(info.thumburl)) return [];
      return [{
        id: String(page.pageid),
        title: page.title.replace(/^File:/, ""),
        thumbnailUrl: info.thumburl,
        sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/?curid=${page.pageid}`,
        artist: plain(info.extmetadata?.Artist?.value) || "Urheber auf Wikimedia Commons",
        license: plain(info.extmetadata?.LicenseShortName?.value) || "Lizenz auf Quellseite prüfen",
      }];
    });
    return Response.json({ images, verificationRequired: true });
  } catch {
    return Response.json({ images: [], error: "Die Bildquellen konnten gerade nicht geprüft werden." }, { status: 503 });
  }
}
