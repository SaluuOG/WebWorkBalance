import type { GeocodeResult } from "../../../lib/webworkbalance";

type NominatimItem = { place_id: number; display_name: string; lat: string; lon: string; type?: string };

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 120) {
    return Response.json({ error: "Gib mindestens zwei Zeichen ein." }, { status: 400 });
  }
  try {
    const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "6", countrycodes: "de", addressdetails: "0" });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "WebWorkBalance/1.0 private user-triggered geocoding",
        "Accept-Language": "de",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    const data = (await response.json()) as NominatimItem[];
    const results: GeocodeResult[] = data.map((item) => ({
      id: String(item.place_id),
      name: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      type: item.type ?? "Ort",
    }));
    return Response.json({ results }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch {
    return Response.json({ error: "Die Ortssuche ist momentan nicht erreichbar." }, { status: 503 });
  }
}
