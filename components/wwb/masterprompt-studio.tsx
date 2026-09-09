/* eslint-disable @next/next/no-img-element -- Wikimedia research thumbnails come from dynamic source URLs. */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
  Images,
  LoaderCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  MASTER_PROMPT_MODES,
  MASTER_PROMPT_OPTIONS,
  assessFingerprintOriginality,
  generateMasterPrompt,
  generateDistinctMasterPrompt,
  recommendMasterPromptMode,
  recommendMasterPromptSettings,
  type FingerprintOriginality,
  type MasterPromptMode,
  type MasterPromptResearch,
  type MasterPromptResult,
  type MasterPromptSettings,
  type SavedMasterPrompt,
} from "@/lib/masterprompt-engine";
import type { AppUser, Business, PriceSettings, StoredLead } from "@/lib/webworkbalance";

type SettingsKey = Exclude<keyof MasterPromptSettings, "customInstructions">;
type SettingDefinition = { key: SettingsKey; label: string; hint: string };
type ResearchImage = {
  id: string;
  title: string;
  thumbnailUrl: string;
  sourceUrl: string;
  artist: string;
  license: string;
  relevance: "company-search" | "industry-inspiration";
  searchQuery: string;
  usageStatus: string;
};

const SETTING_GROUPS: Array<{ value: string; label: string; description: string; fields: SettingDefinition[] }> = [
  {
    value: "creative",
    label: "Kreative Richtung",
    description: "Stil, Tiefe und Aufbau",
    fields: [
      { key: "creativity", label: "Kreativität", hint: "Wie weit darf die Leitidee vom Gewohnten abweichen?" },
      { key: "complexity", label: "Komplexität", hint: "Bestimmt Umfang und technische Tiefe." },
      { key: "layout", label: "Layout", hint: "Grundrichtung der visuellen Komposition." },
      { key: "promptDepth", label: "Prompt-Tiefe", hint: "Vom kompakten Konzept bis zum Produktionsbriefing." },
    ],
  },
  {
    value: "motion",
    label: "Bewegung & Erlebnis",
    description: "Animation, Scroll und 3D",
    fields: [
      { key: "animation", label: "Animationen", hint: "Intensität der Bewegungen und Inszenierung." },
      { key: "scrollMotion", label: "Scroll-Animation", hint: "Wie stark Scrollen die Geschichte steuert." },
      { key: "spatialEffects", label: "3D / WebGL", hint: "Von keinem Effekt bis zum räumlichen Erlebnis." },
      { key: "transitions", label: "Übergänge", hint: "Charakter der Seiten- und Szenenwechsel." },
      { key: "mobilePriority", label: "Mobile Priorität", hint: "Geschwindigkeit gegen maximale Effektstärke abwägen." },
    ],
  },
  {
    value: "delivery",
    label: "Bilder & Umsetzung",
    description: "Ziel, Technik und Budget",
    fields: [
      { key: "imagery", label: "Bildstrategie", hint: "Welche Bildquellen eingeplant werden sollen." },
      { key: "conversionGoal", label: "Hauptziel", hint: "Worauf die Website Besucher führen soll." },
      { key: "technology", label: "Technik", hint: "Gewünschter technischer Rahmen der Umsetzung." },
      { key: "budget", label: "Budgetniveau", hint: "Hält Konzept und Produktionsaufwand realistisch." },
    ],
  },
];

function requestHeaders(user: AppUser) {
  return {
    "Content-Type": "application/json",
    "x-wwb-device-id": user.id,
    "x-wwb-device-name": user.name,
  };
}

async function responseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Die Anfrage ist fehlgeschlagen.");
  return data;
}

function effortFor(settings: MasterPromptSettings) {
  const complexity = { simple: 0, professional: 1, complex: 2, "high-end": 3 }[settings.complexity];
  const animation = { none: 0, subtle: 0, dynamic: 1, cinematic: 2 }[settings.animation];
  const spatial = { off: 0, accent: 1, hero: 2, experience: 3 }[settings.spatialEffects];
  const total = complexity + animation + spatial;
  if (total >= 7) return { label: "Sehr hoch", color: "text-[#ff9b78]", note: "Premium-Produktion mit strenger Performance-Planung" };
  if (total >= 4) return { label: "Hoch", color: "text-[#efd28e]", note: "Individuelle Entwicklung und aufwendige Medien" };
  if (total >= 2) return { label: "Mittel", color: "text-[#9fc1ff]", note: "Solider individueller Firmenauftritt" };
  return { label: "Kompakt", color: "text-[#75e5b7]", note: "Schnelle, fokussierte Umsetzung" };
}

function formatSavedTime(value: string) {
  return new Date(value).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function researchForPrompt(business: Business | StoredLead, images: ResearchImage[], selectedIds: string[]): MasterPromptResearch {
  const selected = new Set(selectedIds);
  const evidence: NonNullable<MasterPromptResearch["evidence"]> = [];
  if (business.imageUrl) {
    evidence.push({
      label: "Bild aus dem Firmeneintrag",
      value: business.imageAttribution || "Öffentlich gemeldetes Unternehmensbild",
      sourceLabel: business.source,
      sourceUrl: business.imageUrl,
      confidence: "source-reported",
      usage: "visual-reference",
      license: "Nutzungsrecht vor Veröffentlichung prüfen",
    });
  }
  for (const image of images) {
    if (!selected.has(image.id)) continue;
    evidence.push({
      label: image.relevance === "company-search" ? "Treffer der Firmensuche" : "Branchen-Inspiration",
      value: image.title,
      sourceLabel: `Wikimedia Commons · ${image.artist}`,
      sourceUrl: image.sourceUrl,
      confidence: "unverified",
      usage: "inspiration",
      license: image.license,
    });
  }
  return {
    summary: evidence.length
      ? `${evidence.length} visuelle Quelle${evidence.length === 1 ? "" : "n"} ausgewählt; Unternehmensbezug und Rechte bleiben vor Nutzung zu prüfen.`
      : "Noch keine bestätigten Bildquellen; der Bildplan arbeitet mit konkreten Rechercheaufträgen und Platzhaltern.",
    evidence,
  };
}

export function MasterPromptStudio({
  business,
  lead,
  prices,
  currentUser,
  savingBlocked,
}: {
  business: Business | StoredLead;
  lead: StoredLead | null;
  prices: PriceSettings;
  currentUser: AppUser;
  savingBlocked: boolean;
}) {
  const initialMode = recommendMasterPromptMode(business);
  const initialSettings = recommendMasterPromptSettings(business).settings;
  const initialResult = generateMasterPrompt({ business, prices, mode: initialMode, settings: initialSettings });
  const [activeTab, setActiveTab] = useState("prompt");
  const [mode, setMode] = useState<MasterPromptMode>(initialMode);
  const [settings, setSettings] = useState<MasterPromptSettings>(initialSettings);
  const [variant, setVariant] = useState(0);
  const [result, setResult] = useState<MasterPromptResult>(initialResult);
  const [promptText, setPromptText] = useState(initialResult.prompt);
  const [history, setHistory] = useState<SavedMasterPrompt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(Boolean(lead));
  const [saving, setSaving] = useState(false);
  const [researchImages, setResearchImages] = useState<ResearchImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [researchLoading, setResearchLoading] = useState(true);
  const [researchNotice, setResearchNotice] = useState("Öffentliche Bildquellen werden automatisch recherchiert …");
  const [researchRevision, setResearchRevision] = useState(0);
  const [appliedResearchRevision, setAppliedResearchRevision] = useState(0);
  const [originality, setOriginality] = useState<FingerprintOriginality>(() => assessFingerprintOriginality(initialResult.fingerprint, []));
  const userTouchedRef = useRef(false);
  const researchSequenceRef = useRef(0);
  const businessRef = useRef(business);
  const pricesRef = useRef(prices);
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const variantRef = useRef(variant);
  const initialResultRef = useRef(initialResult);
  const leadId = lead?.id ?? null;
  const effort = useMemo(() => effortFor(settings), [settings]);
  const researchKey = `${business.name}|${business.category}|${business.address}`;
  const dirty = mode !== result.mode || JSON.stringify(settings) !== JSON.stringify(result.settings) || researchRevision !== appliedResearchRevision;

  useEffect(() => {
    if (!leadId) return;
    const controller = new AbortController();
    fetch(`/api/master-prompts?leadId=${encodeURIComponent(leadId)}`, { signal: controller.signal })
      .then((response) => responseJson<{ prompts: SavedMasterPrompt[] }>(response))
      .then((data) => {
        setHistory(data.prompts);
        setOriginality(assessFingerprintOriginality(initialResultRef.current.fingerprint, data.prompts.map((item) => item.fingerprint)));
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
    return () => controller.abort();
  }, [leadId]);

  useEffect(() => {
    const controller = new AbortController();
    const currentBusiness = businessRef.current;
    const params = new URLSearchParams({ company: currentBusiness.name, category: currentBusiness.category, location: currentBusiness.address });
    fetch(`/api/images?${params.toString()}`, { signal: controller.signal })
      .then((response) => responseJson<{ images: ResearchImage[]; notice?: string }>(response))
      .then((data) => {
        const ids = data.images.map((image) => image.id);
        const revision = ++researchSequenceRef.current;
        setResearchImages(data.images);
        setSelectedImageIds(ids);
        setResearchRevision(revision);
        setResearchNotice(data.notice || (data.images.length ? "Quellen gefunden – Zuordnung und Lizenz vor Nutzung prüfen." : "Keine passenden freien Bilder gefunden. Der Masterprompt enthält konkrete Suchaufträge."));
        if (!userTouchedRef.current) {
          const generated = generateMasterPrompt({
            business: businessRef.current,
            prices: pricesRef.current,
            mode: modeRef.current,
            settings: settingsRef.current,
            variant: variantRef.current,
            research: researchForPrompt(businessRef.current, data.images, ids),
          });
          setResult(generated);
          setPromptText(generated.prompt);
          setAppliedResearchRevision(revision);
          setOriginality(assessFingerprintOriginality(generated.fingerprint, []));
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResearchNotice("Die freie Bildsuche antwortet gerade nicht. Der individuelle Bildplan und die Suchbegriffe bleiben verfügbar.");
        }
      })
      .finally(() => setResearchLoading(false));
    return () => controller.abort();
  }, [researchKey]);

  function markManualChange() {
    userTouchedRef.current = true;
  }

  function updateSetting(key: SettingsKey, value: string) {
    markManualChange();
    setSettings((current) => ({ ...current, [key]: value } as MasterPromptSettings));
  }

  function applyGeneration(nextMode = mode, nextSettings = settings, nextVariant = variant) {
    markManualChange();
    const generated = generateMasterPrompt({ business, prices, mode: nextMode, settings: nextSettings, variant: nextVariant, research: researchForPrompt(business, researchImages, selectedImageIds) });
    setResult(generated);
    setPromptText(generated.prompt);
    setAppliedResearchRevision(researchRevision);
    setOriginality(assessFingerprintOriginality(generated.fingerprint, history.map((item) => item.fingerprint)));
    setActiveTab("prompt");
  }

  function useRecommendation() {
    const nextMode = recommendMasterPromptMode(business);
    const nextSettings = recommendMasterPromptSettings(business).settings;
    setMode(nextMode);
    setSettings(nextSettings);
    setVariant(0);
    applyGeneration(nextMode, nextSettings, 0);
    toast.success("Branchenempfehlung angewendet");
  }

  function createAlternative() {
    markManualChange();
    const distinct = generateDistinctMasterPrompt(
      { business, prices, mode, settings, variant: variant + 1, research: researchForPrompt(business, researchImages, selectedImageIds) },
      [result.fingerprint, ...history.map((item) => item.fingerprint)],
    );
    setVariant(distinct.variant);
    setResult(distinct.result);
    setPromptText(distinct.result.prompt);
    setAppliedResearchRevision(researchRevision);
    setOriginality(distinct.originality);
    setActiveTab("prompt");
    toast.success(`Kreative Alternative mit ${distinct.originality.score} % Eigenständigkeit erstellt`);
  }

  async function copyPrompt(openChatGPT = false) {
    await navigator.clipboard.writeText(promptText);
    toast.success(openChatGPT ? "Masterprompt kopiert – in ChatGPT einfügen" : "Masterprompt kopiert");
    if (openChatGPT) window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
  }

  async function savePrompt() {
    if (!lead) return toast.info("Speichere die Firma zuerst als Lead.");
    if (savingBlocked) return toast.error(`${lead.claimedByName ?? "Dein Partner"} arbeitet an diesem Lead.`);
    if (dirty) return toast.info("Wende zuerst deine geänderten Einstellungen an.");
    setSaving(true);
    try {
      const response = await fetch("/api/master-prompts", {
        method: "POST",
        headers: requestHeaders(currentUser),
        body: JSON.stringify({ leadId: lead.id, mode: result.mode, variant, settings: result.settings, fingerprint: result.fingerprint, prompt: promptText }),
      });
      const data = await responseJson<{ prompt: SavedMasterPrompt }>(response);
      setHistory((current) => [data.prompt, ...current].slice(0, 30));
      toast.success("Masterprompt im Lead gespeichert");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Masterprompt konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  function loadSaved(saved: SavedMasterPrompt) {
    markManualChange();
    const generated = generateMasterPrompt({ business, prices, mode: saved.mode, settings: saved.settings, variant: saved.variant, research: researchForPrompt(business, researchImages, selectedImageIds) });
    setMode(saved.mode);
    setSettings(saved.settings);
    setVariant(saved.variant);
    setResult({ ...generated, fingerprint: saved.fingerprint, prompt: saved.prompt });
    setPromptText(saved.prompt);
    setAppliedResearchRevision(researchRevision);
    setOriginality(assessFingerprintOriginality(saved.fingerprint, history.filter((item) => item.id !== saved.id).map((item) => item.fingerprint)));
    setActiveTab("prompt");
    toast.success("Gespeicherten Masterprompt geöffnet");
  }

  function toggleResearchImage(imageId: string) {
    markManualChange();
    setSelectedImageIds((current) => current.includes(imageId) ? current.filter((id) => id !== imageId) : [...current, imageId]);
    researchSequenceRef.current += 1;
    setResearchRevision(researchSequenceRef.current);
  }

  async function deleteSaved(saved: SavedMasterPrompt) {
    try {
      const response = await fetch(`/api/master-prompts?id=${encodeURIComponent(saved.id)}`, { method: "DELETE", headers: requestHeaders(currentUser) });
      await responseJson<{ ok: true }>(response);
      setHistory((current) => current.filter((item) => item.id !== saved.id));
      toast.success("Masterprompt gelöscht");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Masterprompt konnte nicht gelöscht werden.");
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d7b56d]/25 bg-gradient-to-br from-[#d7b56d]/[.09] via-white/[.025] to-[#6fa8ff]/[.055] shadow-[0_24px_80px_rgba(0,0,0,.25)]">
      <div className="border-b border-white/[.07] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#efd28e]"><Sparkles className="size-4" /> Masterprompt Studio</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">Individuell für {business.name}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">Automatisch vorgeschlagen und vollständig anpassbar.</p>
          </div>
          <Badge variant="outline" className="shrink-0 border-[#d7b56d]/25 bg-black/20 font-mono text-[11px] text-[#efd28e]">{result.fingerprint.id}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/[.07] bg-black/15 p-3 sm:grid-cols-5">
          <div><span className="block text-[11px] text-muted-foreground">Leitidee</span><strong className="mt-1 block truncate text-xs">{result.fingerprint.concept}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Animation</span><strong className="mt-1 block text-xs capitalize">{settings.animation}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Aufwand</span><strong className={`mt-1 block text-xs ${effort.color}`}>{effort.label}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Variante</span><strong className="mt-1 block text-xs">#{variant + 1}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Eigenständigkeit</span><strong className={`mt-1 block text-xs ${originality.score >= 45 ? "text-[#75e5b7]" : "text-[#efd28e]"}`}>{originality.score} %</strong></div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
        <TabsList className="grid h-12 w-full grid-cols-3 rounded-none border-b border-white/[.07] bg-black/15 p-1">
          <TabsTrigger value="settings" className="min-w-0 text-xs sm:text-sm"><SlidersHorizontal className="size-4" /> Einstellungen</TabsTrigger>
          <TabsTrigger value="prompt" className="min-w-0 text-xs sm:text-sm"><Sparkles className="size-4" /> Masterprompt</TabsTrigger>
          <TabsTrigger value="history" className="min-w-0 text-xs sm:text-sm"><History className="size-4" /> Verlauf {history.length ? `(${history.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="m-0 p-4 sm:p-5">
          <div>
            <span className="text-sm font-medium">Prompt-Art</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {MASTER_PROMPT_MODES.map((item) => (
                <button key={item.value} type="button" onClick={() => { markManualChange(); setMode(item.value); }} className={`rounded-xl border p-3 text-left transition ${mode === item.value ? "border-[#d7b56d]/45 bg-[#d7b56d]/10" : "border-white/[.07] bg-black/10 hover:bg-white/[.04]"}`}>
                  <strong className="block text-sm">{item.label}</strong><span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["creative", "motion"]} className="mt-4 rounded-2xl border border-white/[.07] bg-black/10 px-3">
            {SETTING_GROUPS.map((group) => (
              <AccordionItem key={group.value} value={group.value} className="border-white/[.07]">
                <AccordionTrigger className="hover:no-underline"><span><span className="block">{group.label}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{group.description}</span></span></AccordionTrigger>
                <AccordionContent className="grid gap-3 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <label key={field.key} className="space-y-1.5">
                      <span className="text-sm font-medium">{field.label}</span>
                      <Select value={settings[field.key]} onValueChange={(value) => updateSetting(field.key, value)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/15"><SelectValue /></SelectTrigger>
                        <SelectContent>{MASTER_PROMPT_OPTIONS[field.key].map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="block text-[11px] leading-4 text-muted-foreground">{field.hint}</span>
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-4 rounded-2xl border border-white/[.07] bg-black/10 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium"><Images className="size-4 text-[#efd28e]" /> Bildrecherche für den Prompt</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Kostenlose Quellen werden als Inspiration eingebunden, niemals ungeprüft als Firmenbild.</p>
              </div>
              <Badge variant="outline" className="shrink-0 border-white/10">{selectedImageIds.length + (business.imageUrl ? 1 : 0)} aktiv</Badge>
            </div>

            {researchLoading ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[.06] bg-black/15 p-3 text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Freie Bildquellen werden geprüft …</div>
            ) : researchImages.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {researchImages.map((image) => {
                  const selected = selectedImageIds.includes(image.id);
                  return (
                    <div key={image.id} className={`overflow-hidden rounded-xl border transition ${selected ? "border-[#75e5b7]/40 bg-[#75e5b7]/[.06]" : "border-white/[.07] bg-black/15 opacity-65"}`}>
                      <button type="button" aria-pressed={selected} onClick={() => toggleResearchImage(image.id)} className="block w-full text-left">
                        <span className="relative block aspect-[4/3] overflow-hidden bg-black/30">
                          <img src={image.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
                          <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${selected ? "bg-[#75e5b7] text-[#07110d]" : "bg-black/75 text-white"}`}>{selected ? "Im Prompt" : "Aus"}</span>
                        </span>
                        <span className="block p-2.5">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#efd28e]">{image.relevance === "company-search" ? "Firmensuche · ungeprüft" : "Branchen-Inspiration"}</span>
                          <strong className="mt-1 block line-clamp-2 text-xs leading-4">{image.title}</strong>
                        </span>
                      </button>
                      <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 border-t border-white/[.06] px-2.5 py-2 text-[10px] text-muted-foreground hover:text-foreground"><ExternalLink className="size-3" /> Quelle & Lizenz prüfen</a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <a href={`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(`${business.name} ${business.category}`)}&title=Special:MediaSearch&type=image`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-4 text-xs text-[#efd28e]"><ExternalLink className="size-4" /> Freie Bilder manuell suchen</a>
            )}
            <p className="mt-3 flex gap-2 text-[11px] leading-4 text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#75e5b7]" /> {researchNotice}</p>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium">Eigene Wünsche</span>
            <Textarea value={settings.customInstructions} onChange={(event) => { markManualChange(); setSettings((current) => ({ ...current, customInstructions: event.target.value })); }} maxLength={4000} rows={4} className="field-sizing-fixed resize-y border-white/10 bg-black/15" placeholder="Beispiel: Die Navigation soll sich wie ein Architekturplan entfalten. Keine verspielten Farben." />
          </label>

          <div className="mt-4 rounded-xl border border-white/[.07] bg-black/15 p-3">
            <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Geschätzter Aufwand</span><strong className={effort.color}>{effort.label}</strong></div>
            <p className="mt-1 text-xs text-muted-foreground">{effort.note}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="border-white/10" onClick={useRecommendation}><RefreshCw className="mr-2 size-4" /> Automatisch</Button>
            <Button type="button" onClick={() => applyGeneration()}><Sparkles className="mr-2 size-4" /> Anwenden</Button>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="m-0 p-4 sm:p-5">
          {dirty && <div className="mb-3 rounded-xl border border-[#efd28e]/20 bg-[#efd28e]/[.06] p-3 text-xs leading-5 text-[#efd28e]">Einstellungen wurden geändert. Mit „Prompt aktualisieren“ übernimmst du sie.</div>}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/10">{MASTER_PROMPT_MODES.find((item) => item.value === result.mode)?.label}</Badge>
            <Badge variant="outline" className="border-white/10">{result.prompt.length.toLocaleString("de-DE")} Zeichen</Badge>
            <Badge variant="outline" className="border-white/10">{result.missingFacts.length} Recherchepunkte</Badge>
            <Badge variant="outline" className="border-white/10">{selectedImageIds.length + (business.imageUrl ? 1 : 0)} Bildreferenzen</Badge>
            <Badge variant="outline" className="border-white/10">{result.motionPlan.scenes.length} Animationsszenen</Badge>
          </div>
          <Textarea aria-label="Individueller Masterprompt" value={promptText} onChange={(event) => { markManualChange(); setPromptText(event.target.value); }} className="mt-3 field-sizing-fixed h-[430px] max-w-full resize-y border-white/10 bg-black/20 font-mono text-sm leading-6" />
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[.07] bg-black/10 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#75e5b7]" />
            <span><strong className="text-foreground">{originality.score} % Eigenständigkeit</strong>{originality.comparedWith ? ` gegenüber dem ähnlichsten gespeicherten Fingerabdruck ${originality.comparedWith}.` : ". Noch kein Vergleich im Verlauf nötig."} Alternativen werden automatisch auf eine andere kreative Richtung geprüft.</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="border-white/10" onClick={() => copyPrompt()}><Copy className="mr-2 size-4" /> Kopieren</Button>
            <Button type="button" variant="outline" className="border-white/10" onClick={() => copyPrompt(true)}><ExternalLink className="mr-2 size-4" /> ChatGPT</Button>
            <Button type="button" variant="outline" className="border-white/10" onClick={createAlternative}><RefreshCw className="mr-2 size-4" /> Alternative</Button>
            <Button type="button" onClick={dirty ? () => applyGeneration() : savePrompt} disabled={saving || (savingBlocked && !dirty)}>{dirty ? <><Sparkles className="mr-2 size-4" /> Aktualisieren</> : <><Save className="mr-2 size-4" /> {saving ? "Speichert…" : "Speichern"}</>}</Button>
          </div>
          {!lead && <p className="mt-3 text-center text-xs text-muted-foreground">Als Lead speichern, damit der Masterprompt dauerhaft im Verlauf bleibt.</p>}
          {lead && savingBlocked && <p className="mt-3 text-center text-xs text-[#9fc1ff]">{lead.claimedByName ?? "Dein Partner"} bearbeitet diesen Lead. Erstellen und kopieren bleibt möglich; Speichern ist geschützt.</p>}
          {result.warnings.length > 0 && <div className="mt-4 rounded-xl border border-white/[.07] bg-black/10 p-3"><p className="text-xs font-medium">Vor der Umsetzung klären</p><ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">{result.warnings.slice(0, 5).map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}
        </TabsContent>

        <TabsContent value="history" className="m-0 p-4 sm:p-5">
          {historyLoading ? <div className="rounded-xl border border-white/[.07] py-10 text-center text-sm text-muted-foreground">Verlauf wird geladen…</div> : history.length ? (
            <div className="space-y-2">
              {history.map((saved) => (
                <div key={saved.id} className="rounded-xl border border-white/[.07] bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => loadSaved(saved)} className="min-w-0 flex-1 text-left">
                      <span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{MASTER_PROMPT_MODES.find((item) => item.value === saved.mode)?.label}</strong><Badge variant="outline" className="border-white/10 font-mono text-[10px]">{saved.fingerprint.id}</Badge></span>
                      <span className="mt-1 block text-xs text-muted-foreground">{saved.authorName} · {formatSavedTime(saved.createdAt)} · Variante {saved.variant + 1}</span>
                    </button>
                    {saved.authorId === currentUser.id && <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground hover:text-[#ff8290]" onClick={() => deleteSaved(saved)} aria-label="Gespeicherten Masterprompt löschen"><Trash2 className="size-4" /></Button>}
                  </div>
                  <button type="button" onClick={() => loadSaved(saved)} className="mt-3 flex w-full items-center gap-2 border-t border-white/[.06] pt-3 text-left text-xs text-[#efd28e]"><CheckCircle2 className="size-4" /> Öffnen und weiterbearbeiten</button>
                </div>
              ))}
            </div>
          ) : <div className="rounded-xl border border-dashed border-white/10 py-10 text-center"><History className="mx-auto size-6 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Noch kein Masterprompt für diesen Lead gespeichert.</p></div>}
        </TabsContent>
      </Tabs>
    </section>
  );
}
