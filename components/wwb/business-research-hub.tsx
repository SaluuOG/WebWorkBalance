"use client";

import { useState, type FormEvent } from "react";
import { Copy, ExternalLink, Globe2, Images, Search, Sparkles, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { googleMapsUrl, type Business } from "@/lib/webworkbalance";

type ResearchLink = { label: string; hint: string; url: string };

function google(query: string, mode?: "images" | "news") {
  const params = new URLSearchParams({ q: query });
  if (mode === "images") params.set("tbm", "isch");
  if (mode === "news") params.set("tbm", "nws");
  return `https://www.google.com/search?${params.toString()}`;
}

function researchGroups(business: Business) {
  const identity = `"${business.name}" ${business.address}`;
  const locality = business.address || "Nürnberg";
  const domain = business.website ? (() => { try { return new URL(business.website).hostname; } catch { return business.website; } })() : null;
  const company: ResearchLink[] = [
    { label: "Firma komplett", hint: "Grunddaten und Erwähnungen", url: google(identity) },
    { label: "Ansprechpartner", hint: "Inhaber, Team oder Kontaktperson", url: google(`${identity} Inhaber Geschäftsführer Ansprechpartner Team`) },
    { label: "Leistungen & Preise", hint: "Angebot und Positionierung", url: google(`${identity} Leistungen Angebot Preise`) },
    { label: "Bewertungen", hint: "Stärken, Kritik und Kundensprache", url: google(`${identity} Bewertungen Erfahrungen`) },
    { label: "Social Media", hint: "Instagram, Facebook, LinkedIn", url: google(`site:instagram.com OR site:facebook.com OR site:linkedin.com "${business.name}"`) },
    { label: "Presse & Neuigkeiten", hint: "Lokale Berichte und Entwicklungen", url: google(identity, "news") },
  ];
  if (domain) company.unshift({ label: "Website-Inhalte", hint: "Alle auffindbaren Seiten der Domain", url: google(`site:${domain}`) });

  const market: ResearchLink[] = [
    { label: "Lokale Wettbewerber", hint: "Vergleichbare Anbieter in der Nähe", url: google(`${business.category} ${locality} -"${business.name}"`) },
    { label: "Branchen-Websites", hint: "Aufbau und übliche Angebote", url: google(`beste ${business.category} Website Deutschland`) },
    { label: "Kundenfragen", hint: "Häufige Fragen zur Branche", url: google(`${business.category} häufige Fragen Kunden`) },
    { label: "Suchbegriffe lokal", hint: "Leistung plus Standort", url: google(`${business.category} ${locality}`) },
    { label: "Jobs & Wachstum", hint: "Teamgröße und aktuelle Entwicklung", url: google(`${identity} Jobs Stellenangebote Karriere`) },
    { label: "Branchen-Trends", hint: "Themen für Inhalte und Funktionen", url: google(`${business.category} Trends Deutschland 2026`) },
  ];

  const visuals: ResearchLink[] = [
    { label: "Firmenbilder", hint: "Öffentliche Bildtreffer prüfen", url: google(identity, "images") },
    { label: "Logo & Branding", hint: "Logo, Farben und Beschriftung", url: google(`${identity} Logo`, "images") },
    { label: "Maps-Fotos", hint: "Gebäude, Räume und Produkte", url: googleMapsUrl(business) },
    { label: "Instagram-Bilder", hint: "Vom Unternehmen veröffentlichte Motive", url: google(`site:instagram.com "${business.name}"`, "images") },
    { label: "Branchen-Bildsprache", hint: "Inspiration, nicht ungeprüft übernehmen", url: google(`${business.category} hochwertiges Webdesign Fotografie`, "images") },
    { label: "Freie Bildquellen", hint: "Wikimedia-Commons-Treffer", url: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(`${business.name} ${business.address}`)}&title=Special:MediaSearch&type=image` },
  ];

  const tools: ResearchLink[] = business.website ? [
    { label: "PageSpeed öffnen", hint: "Browserbasierte Google-Messung", url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(business.website)}` },
    { label: "Website-Historie", hint: "Frühere Versionen im Web Archive", url: `https://web.archive.org/web/*/${business.website}` },
    { label: "Domain-Suche", hint: "Technische und öffentliche Domain-Hinweise", url: `https://lookup.icann.org/en/lookup?name=${encodeURIComponent(domain ?? business.website)}` },
  ] : [];
  return { company, market, visuals, tools };
}

export function BusinessResearchHub({ business }: { business: Business }) {
  const [customQuery, setCustomQuery] = useState("");
  const groups = researchGroups(business);

  function openCustom(event: FormEvent) {
    event.preventDefault();
    const query = customQuery.trim();
    if (!query) return;
    window.open(google(`"${business.name}" ${business.address} ${query}`), "_blank", "noopener,noreferrer");
  }

  async function copyChecklist() {
    const lines = [...groups.company, ...groups.market, ...groups.visuals, ...groups.tools].map((item) => `- [ ] ${item.label}: ${item.hint}\n  ${item.url}`);
    await navigator.clipboard.writeText(`RECHERCHE-CHECKLISTE · ${business.name}\n\n${lines.join("\n")}`);
    toast.success("Recherche-Checkliste kopiert");
  }

  return (
    <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="flex items-center gap-2 text-base font-semibold"><Search className="size-4 text-[#d7b56d]" /> Recherche-Kompass</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Gezielte Firmen-, Markt- und Bildrecherche ohne Suchbegriffe immer neu zu bauen.</p></div>
        <Button type="button" size="sm" variant="outline" className="border-white/10" onClick={copyChecklist}><Copy className="mr-2 size-3.5" /> Checkliste</Button>
      </div>

      <form onSubmit={openCustom} className="mt-4 flex gap-2">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Eigene Recherchefrage</span><Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#d7b56d]" /><input value={customQuery} onChange={(event) => setCustomQuery(event.target.value)} placeholder="Eigene Frage, z. B. Hochzeiten oder Speisekarte" className="h-10 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 text-base outline-none focus:border-[#d7b56d]/60 sm:text-sm" /></label>
        <Button type="submit" size="sm" className="h-10" disabled={!customQuery.trim()}>Suchen</Button>
      </form>

      <Tabs defaultValue="company" className="mt-4">
        <TabsList className="grid h-auto w-full grid-cols-3 bg-black/20 p-1"><TabsTrigger value="company" className="text-xs"><Globe2 className="mr-1 size-3.5" /> Firma</TabsTrigger><TabsTrigger value="market" className="text-xs"><UsersRound className="mr-1 size-3.5" /> Markt</TabsTrigger><TabsTrigger value="visuals" className="text-xs"><Images className="mr-1 size-3.5" /> Bilder</TabsTrigger></TabsList>
        <TabsContent value="company" className="mt-3"><ResearchGrid links={groups.company} />{groups.tools.length > 0 && <div className="mt-3 border-t border-white/[.06] pt-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Website-Werkzeuge</p><ResearchGrid links={groups.tools} /></div>}</TabsContent>
        <TabsContent value="market" className="mt-3"><ResearchGrid links={groups.market} /></TabsContent>
        <TabsContent value="visuals" className="mt-3"><ResearchGrid links={groups.visuals} /><p className="mt-3 text-[11px] leading-4 text-muted-foreground">Suchtreffer sind Recherchematerial. Unternehmensbezug und Nutzungsrechte vor Einbau immer bestätigen.</p></TabsContent>
      </Tabs>
    </section>
  );
}

function ResearchGrid({ links }: { links: ResearchLink[] }) {
  return <div className="grid grid-cols-2 gap-2">{links.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/[.08] bg-black/10 px-3 py-3 transition hover:border-[#d7b56d]/20 hover:bg-white/[.04]"><span className="min-w-0"><strong className="block truncate text-xs font-medium">{item.label}</strong><span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-muted-foreground">{item.hint}</span></span><ExternalLink className="size-3.5 shrink-0 text-muted-foreground" /></a>)}</div>;
}
