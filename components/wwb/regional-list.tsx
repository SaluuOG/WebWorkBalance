"use client";

import { useMemo, useState } from "react";
import { Building2, ExternalLink, Globe2, List, Mail, MapPin, Phone, RefreshCw, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { googleMapsUrl, type Business } from "@/lib/webworkbalance";

type WebsiteFilter = "all" | "missing" | "existing";
type SortMode = "name" | "distance" | "contact";

export function RegionalList({
  businesses,
  loading,
  error,
  notice,
  scope,
  leadIds,
  onLoad,
  onOpen,
  onSave,
}: {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  notice: string | null;
  scope: string;
  leadIds: Set<string>;
  onLoad: () => void;
  onOpen: (business: Business) => void;
  onSave: (business: Business) => void;
}) {
  const [query, setQuery] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = businesses.filter((business) => {
      if (websiteFilter === "missing" && business.website) return false;
      if (websiteFilter === "existing" && !business.website) return false;
      if (!normalized) return true;
      return `${business.name} ${business.category} ${business.address} ${business.phone ?? ""}`.toLowerCase().includes(normalized);
    });
    return [...filtered].sort((a, b) => {
      if (sortMode === "distance") return a.distanceKm - b.distanceKm || a.name.localeCompare(b.name, "de");
      if (sortMode === "contact") return Number(Boolean(b.phone || b.email)) - Number(Boolean(a.phone || a.email)) || a.name.localeCompare(b.name, "de");
      return a.name.localeCompare(b.name, "de");
    });
  }, [businesses, query, websiteFilter, sortMode]);

  const missingCount = businesses.filter((business) => !business.website).length;

  return (
    <div className="space-y-5">
      <section className="glass-panel overflow-hidden rounded-[1.9rem] bg-[radial-gradient(circle_at_85%_8%,rgba(82,214,160,.1),transparent_28rem)] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[.15em] text-[#d7b56d]"><List className="size-4" /> Regional-Liste</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Nürnberg & Landkreis</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Alle gefundenen Firmen in der Region – unabhängig vom eingestellten Radar-Umkreis. Suche, filtere und speichere Chancen direkt als Lead.</p>
          </div>
          <Button onClick={onLoad} disabled={loading} className="shrink-0"><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Regional-Liste lädt…" : "Liste aktualisieren"}</Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline" className="border-[#52d6a0]/20 bg-[#52d6a0]/[.06] text-[#75e5b7]">{scope || "Nürnberg & Region"}</Badge><span>·</span><span>{businesses.length ? `${businesses.length}${missingCount ? ` · ${missingCount} ohne Website-Hinweis` : ""}` : "Noch nicht geladen"}</span><span>·</span><span>OSM-Direktmodus · Team-Cache aktiv</span></div>
      </section>

      {(error || notice) && <div className="rounded-2xl border border-[#d7b56d]/20 bg-[#d7b56d]/[.06] p-4 text-sm leading-6"><strong className="block text-[#efd28e]">Regional-Status</strong><span className="text-muted-foreground">{error || notice}</span></div>}

      <section className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Firma, Branche, Ort oder Telefonnummer suchen" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 outline-none focus:border-[#d7b56d]/50" /></label>
          <Select value={websiteFilter} onValueChange={(value) => setWebsiteFilter(value as WebsiteFilter)}><SelectTrigger className="h-11 w-full border-white/10 lg:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Websites</SelectItem><SelectItem value="missing">Website-Chancen</SelectItem><SelectItem value="existing">Website vorhanden</SelectItem></SelectContent></Select>
          <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}><SelectTrigger className="h-11 w-full border-white/10 lg:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Nach Name</SelectItem><SelectItem value="distance">Von Nürnberg aus</SelectItem><SelectItem value="contact">Kontakt zuerst</SelectItem></SelectContent></Select>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{visible.length} Treffer sichtbar</span><span>Einträge anklicken für Recherche &amp; Lead-Aktionen</span></div>

        {loading && !businesses.length ? <div className="grid gap-3 py-10 sm:grid-cols-2"><LoadingRow /><LoadingRow /><LoadingRow /><LoadingRow /></div> : visible.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((business) => {
          const saved = leadIds.has(business.id);
          return <article key={business.id} className="group rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:border-[#d7b56d]/25 hover:bg-white/[.045]">
            <button type="button" onClick={() => onOpen(business)} className="w-full text-left">
              <div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Building2 className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="line-clamp-2 font-semibold leading-5">{business.name}</h3><span className={`mt-1 size-2 shrink-0 rounded-full ${business.website ? "bg-[#6fa8ff]" : "bg-[#52d6a0]"}`} title={business.website ? "Website vorhanden" : "Website nicht im Karteneintrag"} /></div><p className="mt-1 text-xs text-muted-foreground">{business.category} · {business.distanceKm} km</p></div></div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0 text-[#d7b56d]" />{business.address}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">{business.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{business.phone}</span>}{business.email && <span className="flex max-w-full items-center gap-1 truncate"><Mail className="size-3" />{business.email}</span>}{business.website ? <span className="flex items-center gap-1 text-[#9fc1ff]"><Globe2 className="size-3" />Website</span> : <span className="flex items-center gap-1 text-[#75e5b7]"><Sparkles className="size-3" />Chance prüfen</span>}</div>
            </button>
            <div className="mt-4 flex gap-2 border-t border-white/[.06] pt-3"><Button type="button" size="sm" variant={saved ? "secondary" : "default"} className="min-w-0 flex-1" disabled={saved} onClick={() => onSave(business)}>{saved ? "Als Lead gespeichert" : "Lead speichern"}</Button><a href={googleMapsUrl(business)} target="_blank" rel="noreferrer" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:bg-white/[.06]" aria-label={`${business.name} in Google Maps öffnen`}><ExternalLink className="size-4" /></a></div>
          </article>;
        })}</div> : <div className="py-16 text-center"><Building2 className="mx-auto size-9 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Noch keine passenden Einträge</h3><p className="mt-1 text-sm text-muted-foreground">Lade die Regional-Liste oder ändere deinen Filter.</p><Button className="mt-4" onClick={onLoad} disabled={loading}><RefreshCw className="mr-2 size-4" /> Regional-Liste laden</Button></div>}
      </section>
      <p className="px-2 text-xs leading-5 text-muted-foreground">Hinweis: OpenStreetMap ist eine öffentliche, gemeinschaftlich gepflegte Datenquelle. Ein fehlender Website-Eintrag ist ein Recherche-Signal, kein Beweis. Prüfe Firmendaten vor jeder Kontaktaufnahme.</p>
    </div>
  );
}

function LoadingRow() {
  return <div className="h-48 animate-pulse rounded-2xl border border-white/[.05] bg-white/[.025]" />;
}
