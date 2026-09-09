"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, ExternalLink, Gauge, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  MARKET_PRICE_ITEMS,
  MARKET_PRICE_UPDATED_AT,
  type PriceSettings,
  type ProjectPriceKey,
} from "@/lib/webworkbalance";

type Complexity = "focused" | "individual" | "advanced";

const COMPLEXITY: Record<Complexity, { label: string; factor: number; note: string }> = {
  focused: { label: "Fokussiert", factor: 1, note: "Klarer Umfang, wenige Sonderfälle" },
  individual: { label: "Individuell", factor: 1.25, note: "Eigene UX, Animationen und mehr Abstimmung" },
  advanced: { label: "Komplex", factor: 1.55, note: "Viele Abläufe, Rollen oder Schnittstellen" },
};

const BASE_UNITS: Record<ProjectPriceKey, number> = {
  landing: 1,
  business: 5,
  premium: 10,
  shop: 10,
  portal: 12,
  webapp: 10,
};

const ADD_ONS = [
  { id: "copy", label: "Professionelle Webtexte", price: 900 },
  { id: "brand", label: "Branding / Art Direction", price: 1200 },
  { id: "seo", label: "SEO-Setup & Keyword-Konzept", price: 750 },
  { id: "booking", label: "Buchung / Terminlogik", price: 2200 },
  { id: "language", label: "Weitere Sprache", price: 1200 },
  { id: "migration", label: "Inhalte / Daten migrieren", price: 900 },
  { id: "accessibility", label: "Erweiterte Barrierefreiheit", price: 1200 },
] as const;

const BENCHMARKS = [
  {
    value: "103 €/h",
    label: "Ø Freelancer Deutschland",
    source: "Freelancermap 2026",
    href: "https://www.freelancermap.de/blog/welchen-stundenlohn-kann-man-als-freelancer-verlangen/",
  },
  {
    value: "580 €/Tag",
    label: "Ø erfahrener Webdesigner",
    source: "Malt · letzte 3 Monate",
    href: "https://www.malt.de/t/tarifbarometer/web-grafikdesign/webdesigner",
  },
  {
    value: "80–160 €/h",
    label: "Fullstack-Spanne",
    source: "Marktübersicht 2026",
    href: "https://netzundwerke.de/blog/stundensatz-als-freelancer-berechnen",
  },
] as const;

function euro(value: number) {
  return `${value.toLocaleString("de-DE")} €`;
}

function roundHundred(value: number) {
  return Math.max(100, Math.round(value / 100) * 100);
}

export function PricingStudio({
  prices,
  onPricesChange,
}: {
  prices: PriceSettings;
  onPricesChange: (prices: PriceSettings) => void;
}) {
  const [project, setProject] = useState<ProjectPriceKey>("business");
  const [complexity, setComplexity] = useState<Complexity>("focused");
  const [units, setUnits] = useState(5);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const calculation = useMemo(() => {
    const extraUnits = Math.max(0, units - BASE_UNITS[project]);
    const addOns = ADD_ONS.filter((item) => selectedAddOns.has(item.id)).reduce((sum, item) => sum + item.price, 0);
    const unitWork = extraUnits * prices.hourly * (project === "webapp" || project === "portal" ? 3 : 1.75);
    const recommended = roundHundred((prices[project] + unitWork + addOns) * COMPLEXITY[complexity].factor);
    return {
      recommended,
      low: roundHundred(recommended * 0.85),
      high: roundHundred(recommended * 1.25),
      addOns,
    };
  }, [complexity, prices, project, selectedAddOns, units]);

  const projectItem = MARKET_PRICE_ITEMS.find((item) => item.key === project)!;

  function chooseProject(key: ProjectPriceKey) {
    setProject(key);
    setUnits(BASE_UNITS[key]);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyCalculation() {
    const selected = ADD_ONS.filter((item) => selectedAddOns.has(item.id)).map((item) => item.label);
    const text = `${projectItem.name}\nEmpfohlener Angebotspreis: ${euro(calculation.recommended)} netto\nSicherer Angebotskorridor: ${euro(calculation.low)}–${euro(calculation.high)} netto\nUmfang: ${units} Seiten/Screens · ${COMPLEXITY[complexity].label}${selected.length ? `\nZusatzleistungen: ${selected.join(", ")}` : ""}`;
    await navigator.clipboard.writeText(text);
    toast.success("Kalkulation kopiert");
  }

  return (
    <div className="space-y-5">
      <section className="glass-panel overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#d7b56d]">Marktpreis-Radar Deutschland</p>
              <Badge variant="outline" className="border-[#52d6a0]/25 bg-[#52d6a0]/8 text-[#75e5b7]">
                <span className="mr-1.5 size-1.5 rounded-full bg-[#52d6a0]" /> aktuell
              </Badge>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Professionell verkaufen, nicht unter Wert.</h2>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">Die empfohlenen Startpreise bilden Full-Service-Projekte ab: Strategie, individuelles Design, Entwicklung, mobile Optimierung, Qualitätssicherung und Übergabe.</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-[#d7b56d]/20 bg-[#d7b56d]/8 px-4 py-3">
            <p className="text-sm text-muted-foreground">Datenstand</p>
            <strong className="mt-1 block text-[#efd28e]">{MARKET_PRICE_UPDATED_AT}</strong>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {BENCHMARKS.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/[.08] bg-white/[.025] p-4 transition hover:border-[#d7b56d]/30 hover:bg-white/[.045]">
              <div className="flex items-start justify-between gap-3"><strong className="text-2xl text-[#efd28e]">{item.value}</strong><ExternalLink className="size-4 text-muted-foreground transition group-hover:text-[#efd28e]" /></div>
              <p className="mt-2 text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h3 className="text-2xl font-semibold">Deine professionelle Preisliste</h3><p className="mt-1 text-sm text-muted-foreground">Marktspanne zur Orientierung · dein Startpreis ist direkt bearbeitbar.</p></div>
          <Badge variant="outline" className="border-white/10">Alle Preise netto</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MARKET_PRICE_ITEMS.map((item) => (
            <article key={item.key} className="glass-panel flex min-h-[280px] flex-col rounded-[1.6rem] p-5">
              <div className="flex items-start justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Sparkles className="size-5" /></div><span className="text-right text-xs leading-5 text-muted-foreground">Markt<br /><strong className="font-semibold text-foreground/80">{euro(item.marketMin)}–{euro(item.marketMax)}{item.upperOpen ? "+" : ""}</strong></span></div>
              <h4 className="mt-4 text-lg font-semibold">{item.name}</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <p className="mt-3 text-xs leading-5 text-foreground/70">{item.typicalScope}</p>
              <label className="mt-auto flex items-center justify-between gap-3 border-t border-white/[.07] pt-4 text-sm">
                <span className="font-medium">Dein Startpreis</span>
                <span className="flex items-center rounded-xl border border-[#d7b56d]/20 bg-[#d7b56d]/8 px-3 py-2 text-[#efd28e]"><input aria-label={`Startpreis ${item.name}`} type="number" min={0} step={100} value={prices[item.key]} onChange={(event) => onPricesChange({ ...prices, [item.key]: Number(event.target.value) || 0 })} className="w-24 bg-transparent text-right font-bold outline-none" /><span className="ml-1">€</span></span>
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
        <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Calculator className="size-5" /></div><div><h3 className="text-xl font-semibold">Angebots-Kalkulator</h3><p className="text-sm text-muted-foreground">In Sekunden einen belastbaren Preisrahmen bilden.</p></div></div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">Projektart</span><Select value={project} onValueChange={(value) => chooseProject(value as ProjectPriceKey)}><SelectTrigger className="h-11 w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{MARKET_PRICE_ITEMS.map((item) => <SelectItem value={item.key} key={item.key}>{item.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm"><span className="text-muted-foreground">Komplexität</span><Select value={complexity} onValueChange={(value) => setComplexity(value as Complexity)}><SelectTrigger className="h-11 w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COMPLEXITY).map(([key, item]) => <SelectItem value={key} key={key}>{item.label} · × {item.factor.toLocaleString("de-DE")}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[.07] bg-black/10 p-4">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium">Seiten oder Screens</p><p className="mt-1 text-xs text-muted-foreground">Basis für {projectItem.shortName}: {BASE_UNITS[project]}</p></div><strong className="text-2xl text-[#efd28e]">{units}</strong></div>
            <Slider className="mt-5 [&_[data-slot=slider-range]]:bg-[#d7b56d] [&_[data-slot=slider-thumb]]:border-[#d7b56d]" min={1} max={40} step={1} value={[units]} onValueChange={(value) => setUnits(value[0] ?? 1)} />
          </div>

          <div className="mt-5"><p className="mb-3 text-sm font-medium">Zusatzleistungen</p><div className="grid gap-2 sm:grid-cols-2">{ADD_ONS.map((item) => { const selected = selectedAddOns.has(item.id); return <button type="button" aria-pressed={selected} onClick={() => toggleAddOn(item.id)} key={item.id} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${selected ? "border-[#d7b56d]/35 bg-[#d7b56d]/10" : "border-white/[.07] bg-white/[.025] hover:bg-white/[.05]"}`}><span className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-[#d7b56d] bg-[#d7b56d] text-[#080b0f]" : "border-white/20"}`}>{selected && <Check className="size-3.5" />}</span><span className="min-w-0 flex-1"><strong className="block font-medium">{item.label}</strong><span className="text-xs text-muted-foreground">+ {euro(item.price)}</span></span></button>; })}</div></div>
        </div>

        <aside className="glass-panel overflow-hidden rounded-[1.75rem] xl:sticky xl:top-24">
          <div className="border-b border-white/[.07] bg-[radial-gradient(circle_at_top_right,rgba(215,181,109,.2),transparent_55%)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold uppercase tracking-[.14em] text-[#d7b56d]">Preisempfehlung</p><Gauge className="size-5 text-[#d7b56d]" /></div>
            <strong className="mt-4 block text-4xl tracking-tight sm:text-5xl">{euro(calculation.recommended)}</strong>
            <p className="mt-2 text-sm text-muted-foreground">empfohlener Festpreis · netto</p>
            <div className="mt-5 rounded-2xl border border-white/[.08] bg-black/15 p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Sicherer Angebotskorridor</p><strong className="mt-2 block text-lg text-[#efd28e]">{euro(calculation.low)}–{euro(calculation.high)}</strong></div>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Startpreis</span><strong>{euro(prices[project])}</strong></div>
            <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Zusatzleistungen</span><strong>{euro(calculation.addOns)}</strong></div>
            <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Komplexität</span><strong>{COMPLEXITY[complexity].label}</strong></div>
            <p className="border-t border-white/[.07] pt-3 text-xs leading-5 text-muted-foreground">{COMPLEXITY[complexity].note}. Fremdkosten, Lizenzen, Hosting und laufende Betreuung separat ausweisen.</p>
            <Button className="mt-2 w-full" onClick={copyCalculation}><Copy className="mr-2 size-4" /> Kalkulation kopieren</Button>
          </div>
        </aside>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div><div className="flex items-center gap-2"><RefreshCw className="size-4 text-[#d7b56d]" /><h3 className="font-semibold">Laufende Leistungen</h3></div><p className="mt-2 text-sm text-muted-foreground">Wiederkehrende Umsätze gehören getrennt vom Projektpreis ins Angebot.</p></div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3 lg:max-w-3xl">
            <label className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-sm"><span className="block text-muted-foreground">Dein Stundensatz</span><span className="mt-2 flex items-center"><input type="number" min={0} step={5} value={prices.hourly} onChange={(event) => onPricesChange({ ...prices, hourly: Number(event.target.value) || 0 })} className="w-20 bg-transparent text-xl font-bold text-[#efd28e] outline-none" />€/h</span></label>
            <label className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-sm"><span className="block text-muted-foreground">Wartung ab</span><span className="mt-2 flex items-center"><input type="number" min={0} step={10} value={prices.maintenance} onChange={(event) => onPricesChange({ ...prices, maintenance: Number(event.target.value) || 0 })} className="w-20 bg-transparent text-xl font-bold text-[#efd28e] outline-none" />€/Monat</span></label>
            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-sm"><span className="block text-muted-foreground">SEO-Betreuung</span><strong className="mt-2 block text-xl text-[#efd28e]">390–1.500 €</strong><span className="text-xs text-muted-foreground">pro Monat</span></div>
          </div>
        </div>
        <p className="mt-5 border-t border-white/[.07] pt-4 text-xs leading-5 text-muted-foreground">Die Projektspannen sind eine belastbare Angebotsorientierung aus aktuellen deutschen Freelancer- und Webdesign-Honoraren sowie typischen Full-Service-Aufwänden. Der endgültige Preis richtet sich immer nach Briefing, Inhalt, Funktionen, Haftung und Abnahmeschleifen.</p>
      </section>
    </div>
  );
}
