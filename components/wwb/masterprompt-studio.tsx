/* eslint-disable @next/next/no-img-element -- Wikimedia research thumbnails come from dynamic source URLs. */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Gauge,
  History,
  Images,
  LoaderCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Zap,
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
  MAX_MASTER_PROMPT_LENGTH,
  REFERENCE_METHOD_VERSION,
  VIDEO_STYLE_STANDARDS,
  MASTER_PROMPT_OPTIONS,
  EXPRESS_TIMEBOX_OPTIONS,
  EXPRESS_SCOPE_OPTIONS,
  RESEARCH_DEPTH_OPTIONS,
  AUTONOMY_LEVEL_OPTIONS,
  assessExpressReadiness,
  assessFingerprintOriginality,
  generateMasterPrompt,
  generateDistinctMasterPrompt,
  normalizeMasterPromptSettings,
  recommendMasterPromptMode,
  recommendMasterPromptSettings,
  type FingerprintOriginality,
  type DesignFingerprint,
  type ExpressTimebox,
  type ExpressScope,
  type ResearchDepth,
  type AutonomyLevel,
  type MasterPromptMode,
  type MasterPromptResearch,
  type MasterPromptResult,
  type MasterPromptSettings,
  type ProductionTrack,
  type SavedMasterPrompt,
} from "@/lib/masterprompt-engine";
import type { AppUser, Business, PriceSettings, StoredLead } from "@/lib/webworkbalance";
import type { ExpressResearchResult } from "@/lib/express-research";

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
      { key: "experienceArchetype", label: "Erlebnis-Archetyp", hint: "Welche Referenzfamilie die kreative Richtung bevorzugt." },
      { key: "storyStructure", label: "Dramaturgie", hint: "Wie sich die Website als Geschichte oder Katalog entfaltet." },
      { key: "brandTone", label: "Markenton", hint: "Die emotionale und sprachliche Grundhaltung." },
      { key: "referenceStyle", label: "Referenz-Stilwelt", hint: "Qualitätsprinzip aus den Videos; wird auf diese Firma übertragen." },
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
      { key: "interactionDensity", label: "Interaktionsdichte", hint: "Wie viele sichtbare, bedienbare Ebenen die Seite erhält." },
      { key: "typographyMotion", label: "Typografie-Bewegung", hint: "Ob und wie Text selbst Teil der Choreografie wird." },
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
      { key: "assetDirection", label: "Asset-Richtung", hint: "Wie Foto, 3D, KI-Konzept und vorhandene Bilder zusammenspielen." },
      { key: "websiteGame", label: "Spiel auf der Website", hint: "Optionales individuelles Spiel im Kundenwebsite-Prompt. Standardmäßig aus." },
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
  if (settings.productionTrack === "express") {
    const timebox = EXPRESS_TIMEBOX_OPTIONS.find((item) => item.value === settings.expressTimebox) ?? EXPRESS_TIMEBOX_OPTIONS[1];
    return {
      label: `Express · ${timebox.label}`,
      color: "text-[#75e5b7]",
      note: `${timebox.hint}; ${timebox.capacity}. Scope bleibt bewusst begrenzt.`,
    };
  }
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
  const websiteReport = business.websiteReport;
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
  if (websiteReport) {
    evidence.push({
      label: "Verifizierte offizielle Website",
      value: `${websiteReport.domain} · Qualitäts-Score ${websiteReport.overallScore}/100`,
      sourceLabel: "WebWorkBalance Website Quality Scan",
      sourceUrl: websiteReport.finalUrl,
      confidence: "verified",
      usage: "fact",
    });
    if (websiteReport.research.description) {
      evidence.push({
        label: "Selbstdarstellung der offiziellen Website",
        value: websiteReport.research.description,
        sourceLabel: websiteReport.domain,
        sourceUrl: websiteReport.finalUrl,
        confidence: "source-reported",
        usage: "fact",
      });
    }
    if (websiteReport.topIssues.length) {
      evidence.push({
        label: "Beobachtete Relaunch-Prioritäten",
        value: websiteReport.topIssues.slice(0, 5).map((item) => `${item.category} / ${item.label}: ${item.finding} Empfehlung: ${item.recommendation}`).join(" | "),
        sourceLabel: "WebWorkBalance Website Quality Scan",
        sourceUrl: websiteReport.finalUrl,
        confidence: "verified",
        usage: "fact",
      });
    }
    if (websiteReport.research.brandColors.length || websiteReport.research.technologyHints.length) {
      evidence.push({
        label: "Technik- und Markenhinweise des Bestands",
        value: [`Farben: ${websiteReport.research.brandColors.join(", ") || "nicht eindeutig"}`, `Technik: ${websiteReport.research.technologyHints.join(", ") || "nicht eindeutig"}`].join(" · "),
        sourceLabel: websiteReport.domain,
        sourceUrl: websiteReport.finalUrl,
        confidence: "source-reported",
        usage: "inspiration",
      });
    }
    for (const page of websiteReport.research.importantPages.slice(0, 5)) {
      evidence.push({
        label: `Offizielle Unterseite · ${page.type}`,
        value: page.label,
        sourceLabel: websiteReport.domain,
        sourceUrl: page.url,
        confidence: "source-reported",
        usage: "fact",
      });
    }
    for (const image of websiteReport.research.images.slice(0, 4)) {
      evidence.push({
        label: image.kind === "logo" ? "Logo-Hinweis der offiziellen Website" : "Bild der offiziellen Website",
        value: image.alt,
        sourceLabel: websiteReport.domain,
        sourceUrl: image.url,
        confidence: "source-reported",
        usage: "inspiration",
        license: image.rightsNote,
      });
    }
  }
  const scanSummary = websiteReport
    ? `Offizielle Website verifiziert und mit ${websiteReport.overallScore}/100 bewertet. Prioritäten: ${websiteReport.topIssues.slice(0, 4).map((item) => item.label).join(", ") || "keine akuten Schwächen"}.`
    : null;
  return {
    summary: [scanSummary, evidence.length
      ? `${evidence.length} Recherchequelle${evidence.length === 1 ? "" : "n"} eingebunden; Aussagen und Bildrechte bleiben vor Veröffentlichung zu prüfen.`
      : "Noch keine bestätigten Bildquellen; der Bildplan arbeitet mit konkreten Rechercheaufträgen und Platzhaltern."].filter(Boolean).join(" "),
    businessDescription: websiteReport?.research.description,
    services: websiteReport?.research.serviceHints ?? [],
    evidence,
  };
}

function mergePromptResearch(base: MasterPromptResearch, extra?: MasterPromptResearch | null): MasterPromptResearch {
  if (!extra) return base;
  const evidence = [...(base.evidence ?? []), ...(extra.evidence ?? [])];
  return {
    summary: [base.summary, extra.summary].filter(Boolean).join(" "),
    businessDescription: extra.businessDescription ?? base.businessDescription,
    services: [...new Set([...(base.services ?? []), ...(extra.services ?? [])])],
    targetAudiences: [...new Set([...(base.targetAudiences ?? []), ...(extra.targetAudiences ?? [])])],
    differentiators: [...new Set([...(base.differentiators ?? []), ...(extra.differentiators ?? [])])],
    contactPerson: extra.contactPerson ?? base.contactPerson,
    evidence: [...new Map(evidence.map((item) => [`${item.label}|${item.sourceUrl ?? item.value}`, item])).values()],
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
  const initialResult = generateMasterPrompt({ business, prices, mode: initialMode, settings: initialSettings, research: researchForPrompt(business, [], []) });
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
  const [expressResearch, setExpressResearch] = useState<ExpressResearchResult | null>(null);
  const [expressResearchLoading, setExpressResearchLoading] = useState(false);
  const [originality, setOriginality] = useState<FingerprintOriginality>(() => assessFingerprintOriginality(initialResult.fingerprint, []));
  const [designMemoryStatus, setDesignMemoryStatus] = useState("Team-Entwürfe werden verglichen …");
  const [designMemoryReady, setDesignMemoryReady] = useState(false);
  const [designConflict, setDesignConflict] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [historicalText, setHistoricalText] = useState(false);
  const comparisonRef = useRef<DesignFingerprint[]>([]);
  const latestResearchRef = useRef(researchForPrompt(business, [], []));
  const generationEpochRef = useRef(0);
  const expressRequestRef = useRef(0);
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
  const expressReadiness = useMemo(() => assessExpressReadiness(result, business), [result, business]);
  const expressTimebox = useMemo(() => EXPRESS_TIMEBOX_OPTIONS.find((item) => item.value === settings.expressTimebox) ?? EXPRESS_TIMEBOX_OPTIONS[1], [settings.expressTimebox]);
  const researchKey = `${business.name}|${business.category}|${business.address}|${business.websiteReport?.scannedAt ?? "unscanned"}`;
  const dirty = mode !== result.mode || JSON.stringify(settings) !== JSON.stringify(result.settings) || researchRevision !== appliedResearchRevision;
  const legacyPrompt = !promptText.includes(REFERENCE_METHOD_VERSION);

  function currentResearch(images = researchImages, ids = selectedImageIds, extra = expressResearch) {
    return mergePromptResearch(researchForPrompt(businessRef.current, images, ids), extra?.promptResearch);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/design-memory", { signal: controller.signal })
      .then((response) => responseJson<{ fingerprints: DesignFingerprint[] }>(response))
      .then((data) => {
        comparisonRef.current = data.fingerprints;
        setDesignMemoryStatus(`${data.fingerprints.length} bisherige Team-Entwürfe im Vergleich.`);
        if (!userTouchedRef.current) {
          const distinct = generateDistinctMasterPrompt({ business: businessRef.current, prices: pricesRef.current, mode: modeRef.current, settings: settingsRef.current, variant: variantRef.current, research: latestResearchRef.current }, data.fingerprints);
          variantRef.current = distinct.variant;
          setVariant(distinct.variant);
          setHistoricalText(false);
          setResult(distinct.result);
          setPromptText(distinct.result.prompt);
          setOriginality(distinct.originality);
          setAppliedResearchRevision(researchSequenceRef.current);
        }
      })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setDesignMemoryStatus("Team-Vergleich momentan nicht erreichbar. Der Entwurf wird lokal erzeugt."); })
      .finally(() => { if (!controller.signal.aborted) setDesignMemoryReady(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!designMemoryReady || historicalText || dirty) return;
    const controller = new AbortController();
    fetch("/api/design-memory", { method: "POST", headers: requestHeaders(currentUser), signal: controller.signal, body: JSON.stringify({ businessId: business.sourceId || business.id, fingerprint: result.fingerprint }) })
      .then(async (response) => {
        const data = await response.json() as { fingerprint?: DesignFingerprint; error?: string };
        if (controller.signal.aborted) return;
        setDesignConflict(false);
        if (response.status === 409) {
          if (data.fingerprint) comparisonRef.current = [...comparisonRef.current, data.fingerprint];
          setDesignConflict(true);
          setDesignMemoryStatus(data.error || "Stil bereits verwendet. Bitte eine Alternative erzeugen.");
        } else if (!response.ok) {
          setDesignMemoryStatus("Entwurf ist erstellt; das gemeinsame Designgedächtnis ist gerade nicht erreichbar.");
        } else {
          comparisonRef.current = [result.fingerprint, ...comparisonRef.current.filter((item) => item.id !== result.fingerprint.id)].slice(0, 200);
          setDesignMemoryStatus("Designrichtung im Team-Gedächtnis gesichert; neue Entwürfe werden damit verglichen.");
        }
      })
      .catch((error: unknown) => { if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) { setDesignConflict(false); setDesignMemoryStatus("Designgedächtnis nicht erreichbar; aktueller Prompt bleibt erhalten."); } })
      .finally(() => { if (!controller.signal.aborted) setReservationId(result.fingerprint.id); });
    return () => controller.abort();
  }, [business.id, business.sourceId, currentUser, designMemoryReady, dirty, historicalText, result.fingerprint]);

  useEffect(() => {
    businessRef.current = business;
    pricesRef.current = prices;
  }, [business, prices]);

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
        latestResearchRef.current = researchForPrompt(businessRef.current, data.images, ids);
        if (!userTouchedRef.current) {
          const distinct = generateDistinctMasterPrompt({
            business: businessRef.current,
            prices: pricesRef.current,
            mode: modeRef.current,
            settings: settingsRef.current,
            variant: variantRef.current,
            research: researchForPrompt(businessRef.current, data.images, ids),
          }, comparisonRef.current);
          const generated = distinct.result;
          setVariant(distinct.variant);
          variantRef.current = distinct.variant;
          setHistoricalText(false);
          setResult(generated);
          setPromptText(generated.prompt);
          setAppliedResearchRevision(revision);
          setOriginality(assessFingerprintOriginality(generated.fingerprint, comparisonRef.current));
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
    generationEpochRef.current += 1;
  }

  function updateSetting(key: SettingsKey, value: string) {
    markManualChange();
    setSettings((current) => ({ ...current, [key]: value } as MasterPromptSettings));
  }

  async function runExpressResearch(nextSettings = settings) {
    markManualChange();
    const requestId = ++expressRequestRef.current;
    const epoch = generationEpochRef.current;
    setExpressResearchLoading(true);
    try {
      const response = await fetch("/api/express-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, depth: nextSettings.researchDepth }),
      });
      const data = await responseJson<ExpressResearchResult>(response);
      if (requestId !== expressRequestRef.current) return;
      setExpressResearch(data);
      const revision = ++researchSequenceRef.current;
      setResearchRevision(revision);
      latestResearchRef.current = mergePromptResearch(researchForPrompt(business, researchImages, selectedImageIds), data.promptResearch);
      if (epoch !== generationEpochRef.current) { toast.info("Recherche bereit. Deine neueren Änderungen bleiben erhalten; über Aktualisieren übernehmen."); return; }
      const distinct = generateDistinctMasterPrompt({
        business,
        prices,
        mode,
        settings: nextSettings,
        variant,
        research: mergePromptResearch(researchForPrompt(business, researchImages, selectedImageIds), data.promptResearch),
      }, comparisonRef.current);
      const generated = distinct.result;
      setVariant(distinct.variant);
      variantRef.current = distinct.variant;
      setHistoricalText(false);
      setResult(generated);
      setPromptText(generated.prompt);
      setAppliedResearchRevision(revision);
      setOriginality(assessFingerprintOriginality(generated.fingerprint, comparisonRef.current));
      setActiveTab("prompt");
      toast.success(`Autopilot-Dossier: ${data.metrics.officialPages} Seiten und ${data.metrics.imageCandidates} Bildkandidaten`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Express-Recherche konnte nicht abgeschlossen werden.");
    } finally {
      if (requestId === expressRequestRef.current) setExpressResearchLoading(false);
    }
  }

  function selectProductionTrack(track: ProductionTrack) {
    const nextSettings = { ...settings, productionTrack: track };
    setSettings(nextSettings);
    if (track === "express" && nextSettings.autonomyLevel === "autopilot") void runExpressResearch(nextSettings);
    else applyGeneration(mode, nextSettings, variant);
  }

  function selectExpressTimebox(timebox: ExpressTimebox) {
    const nextSettings = { ...settings, productionTrack: "express" as const, expressTimebox: timebox };
    setSettings(nextSettings);
    applyGeneration(mode, nextSettings, variant);
  }

  function selectExpressScope(expressScope: ExpressScope) {
    const nextSettings = { ...settings, productionTrack: "express" as const, expressScope };
    setSettings(nextSettings);
    applyGeneration(mode, nextSettings, variant);
  }

  function selectResearchDepth(researchDepth: ResearchDepth) {
    const nextSettings = { ...settings, productionTrack: "express" as const, researchDepth };
    setSettings(nextSettings);
    if (nextSettings.autonomyLevel === "autopilot") void runExpressResearch(nextSettings);
    else applyGeneration(mode, nextSettings, variant);
  }

  function selectAutonomyLevel(autonomyLevel: AutonomyLevel) {
    const nextSettings = { ...settings, productionTrack: "express" as const, autonomyLevel };
    setSettings(nextSettings);
    if (autonomyLevel === "autopilot") void runExpressResearch(nextSettings);
    else applyGeneration(mode, nextSettings, variant);
  }

  function applyGeneration(nextMode = mode, nextSettings = settings, nextVariant = variant) {
    markManualChange();
    const distinct = generateDistinctMasterPrompt({ business, prices, mode: nextMode, settings: nextSettings, variant: nextVariant, research: currentResearch() }, comparisonRef.current);
    const generated = distinct.result;
    setVariant(distinct.variant);
    variantRef.current = distinct.variant;
    settingsRef.current = nextSettings;
    modeRef.current = nextMode;
    setHistoricalText(false);
    setResult(generated);
    setPromptText(generated.prompt);
    setAppliedResearchRevision(researchRevision);
    setOriginality(assessFingerprintOriginality(generated.fingerprint, comparisonRef.current));
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

  function applyQualityPreset(spatial: boolean) {
    const nextSettings: MasterPromptSettings = {
      ...settings, creativity: "extraordinary", complexity: "high-end", promptDepth: "production", budget: "premium",
      animation: spatial ? "cinematic" : "dynamic", spatialEffects: spatial ? "hero" : "off",
      scrollMotion: spatial ? "immersive" : "storytelling", technology: "automatic",
      experienceArchetype: spatial ? "spatial" : "editorial", storyStructure: spatial ? "journey" : "chaptered",
      assetDirection: spatial ? "three-dimensional" : "art-direction", mobilePriority: "balanced",
    };
    setSettings(nextSettings);
    applyGeneration(mode, nextSettings, variant);
    toast.success(spatial ? "High-End mit 3D-Bauplan erstellt" : "High-End mit Editorial-Dramaturgie erstellt");
  }

  function createAlternative() {
    markManualChange();
    const distinct = generateDistinctMasterPrompt(
      { business, prices, mode, settings, variant: variant + 1, research: currentResearch() },
      [result.fingerprint, ...comparisonRef.current, ...history.map((item) => item.fingerprint)],
    );
    setVariant(distinct.variant);
    setHistoricalText(false);
    setResult(distinct.result);
    setPromptText(distinct.result.prompt);
    setAppliedResearchRevision(researchRevision);
    setOriginality(distinct.originality);
    setActiveTab("prompt");
    toast.success(`Kreative Alternative mit ${distinct.originality.score} % Konzept-Abstand erstellt`);
  }

  async function copyPrompt(openChatGPT = false) {
    if (!historicalText && designConflict) return toast.error("Diese Stil-Kombination ist schon vergeben. Erzeuge zuerst eine Alternative.");
    if (!historicalText && (!designMemoryReady || reservationId !== result.fingerprint.id)) return toast.info("Der Team-Vergleich lädt noch kurz.");
    await navigator.clipboard.writeText(promptText);
    const promptLabel = settings.productionTrack === "express" ? "Express-Prompt" : "Masterprompt";
    toast.success(openChatGPT ? `${promptLabel} kopiert – in ChatGPT einfügen` : `${promptLabel} kopiert`);
    if (openChatGPT) window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
  }

  async function savePrompt() {
    if (!lead) return toast.info("Speichere die Firma zuerst als Lead.");
    if (savingBlocked) return toast.error(`${lead.claimedByName ?? "Dein Partner"} arbeitet an diesem Lead.`);
    if (dirty) return toast.info("Wende zuerst deine geänderten Einstellungen an.");
    if (!historicalText && (designConflict || reservationId !== result.fingerprint.id)) return toast.info(designConflict ? "Erzeuge zuerst eine andere Designrichtung." : "Der Team-Vergleich läuft noch.");
    setSaving(true);
    try {
      const response = await fetch("/api/master-prompts", {
        method: "POST",
        headers: requestHeaders(currentUser),
        body: JSON.stringify({ leadId: lead.id, mode: result.mode, variant, settings: result.settings, fingerprint: result.fingerprint, prompt: promptText }),
      });
      const data = await responseJson<{ prompt: SavedMasterPrompt }>(response);
      setHistory((current) => [data.prompt, ...current].slice(0, 30));
      toast.success(`${settings.productionTrack === "express" ? "Express-Prompt" : "Masterprompt"} im Lead gespeichert`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Masterprompt konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  function loadSaved(saved: SavedMasterPrompt) {
    markManualChange();
    const savedSettings = normalizeMasterPromptSettings(business, saved.settings);
    const generated = generateMasterPrompt({ business, prices, mode: saved.mode, settings: savedSettings, variant: saved.variant, research: currentResearch() });
    setMode(saved.mode);
    setSettings(savedSettings);
    setVariant(saved.variant);
    setHistoricalText(true);
    setDesignConflict(false);
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
        <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Produktionsmodus">
          <button type="button" aria-pressed={settings.productionTrack === "express"} onClick={() => selectProductionTrack("express")} className={`rounded-2xl border p-3 text-left transition ${settings.productionTrack === "express" ? "border-[#75e5b7]/45 bg-[#75e5b7]/[.09]" : "border-white/[.07] bg-black/10 hover:bg-white/[.04]"}`}>
            <span className="flex items-center justify-between gap-2"><strong className="flex items-center gap-2 text-sm"><Zap className="size-4 text-[#75e5b7]" /> Express Build</strong><Badge variant="outline" className="border-[#75e5b7]/25 text-[10px] text-[#75e5b7]">1–3 Std.</Badge></span>
            <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">Eine fokussierte High-End-Seite mit klarer Zeitbox, automatischem Scope und QA.</span>
          </button>
          <button type="button" aria-pressed={settings.productionTrack === "master"} onClick={() => selectProductionTrack("master")} className={`rounded-2xl border p-3 text-left transition ${settings.productionTrack === "master" ? "border-[#d7b56d]/45 bg-[#d7b56d]/10" : "border-white/[.07] bg-black/10 hover:bg-white/[.04]"}`}>
            <span className="flex items-center justify-between gap-2"><strong className="flex items-center gap-2 text-sm"><Sparkles className="size-4 text-[#efd28e]" /> Normaler Masterprompt</strong><Badge variant="outline" className="border-[#d7b56d]/25 text-[10px] text-[#efd28e]">Tiefe</Badge></span>
            <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">Vollständige Konzept- und Produktionsplanung für komplexe oder mehrseitige Auftritte.</span>
          </button>
        </div>
        {settings.productionTrack === "express" && (
          <div className="mt-3 rounded-2xl border border-[#75e5b7]/20 bg-[#75e5b7]/[.045] p-3 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#75e5b7]"><Clock3 className="size-3.5" /> Express-Zeitbox</p>
                <p className="mt-1 text-sm font-medium">{expressTimebox.hint}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${expressReadiness.tone === "ready" ? "text-[#75e5b7]" : expressReadiness.tone === "warning" ? "text-[#efd28e]" : "text-[#ff9b78]"}`}><Gauge className="size-4" /> {expressReadiness.label} · {expressReadiness.score}%</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {EXPRESS_TIMEBOX_OPTIONS.map((item) => <button key={item.value} type="button" aria-pressed={settings.expressTimebox === item.value} onClick={() => selectExpressTimebox(item.value)} className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition ${settings.expressTimebox === item.value ? "border-[#75e5b7]/45 bg-[#75e5b7]/15 text-[#75e5b7]" : "border-white/[.07] bg-black/10 text-muted-foreground hover:bg-white/[.04]"}`}>{item.label}</button>)}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <label className="space-y-1"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Projektgröße</span><Select value={settings.expressScope} onValueChange={(value) => selectExpressScope(value as ExpressScope)}><SelectTrigger className="w-full border-white/10 bg-black/20"><SelectValue /></SelectTrigger><SelectContent>{EXPRESS_SCOPE_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-1"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recherche</span><Select value={settings.researchDepth} onValueChange={(value) => selectResearchDepth(value as ResearchDepth)}><SelectTrigger className="w-full border-white/10 bg-black/20"><SelectValue /></SelectTrigger><SelectContent>{RESEARCH_DEPTH_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-1"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Autonomie</span><Select value={settings.autonomyLevel} onValueChange={(value) => selectAutonomyLevel(value as AutonomyLevel)}><SelectTrigger className="w-full border-white/10 bg-black/20"><SelectValue /></SelectTrigger><SelectContent>{AUTONOMY_LEVEL_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{expressTimebox.capacity}. {settings.expressScope === "focused" ? "Ziel: kompletter Auftritt in der Zeitbox." : "Bei großen Websites ist die Zeitbox ein autonomer Produktionssprint mit skalierbaren Kernrouten."} {expressReadiness.openItems.length ? `Offen: ${expressReadiness.openItems.join(" · ")}.` : "Die wichtigsten Fakten sind vorbereitet."}</p>
            <Button type="button" className="mt-3 w-full bg-[#75e5b7] text-[#07110d] hover:bg-[#8aebc4]" onClick={() => void runExpressResearch()} disabled={expressResearchLoading}>
              {expressResearchLoading ? <><LoaderCircle className="mr-2 size-4 animate-spin" /> Recherche läuft …</> : <><Zap className="mr-2 size-4" /> Express Autopilot starten</>}
            </Button>
            {expressResearch && <div className="mt-3 rounded-xl border border-white/[.08] bg-black/20 p-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px]"><Badge variant="outline" className="border-white/10">{expressResearch.metrics.officialPages} offizielle Seiten</Badge><Badge variant="outline" className="border-white/10">{expressResearch.metrics.imageCandidates} Bildkandidaten</Badge><Badge variant="outline" className="border-white/10">{expressResearch.metrics.sources} Prüfquellen</Badge></div>
              <div className="mt-2 grid grid-cols-2 gap-2"><a href={expressResearch.mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs text-[#efd28e]"><ExternalLink className="size-3.5" /> Google Maps öffnen</a><button type="button" onClick={() => { void navigator.clipboard.writeText(expressResearch.dossier); toast.success("Recherche-Dossier kopiert"); }} className="flex items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs text-[#75e5b7]"><Copy className="size-3.5" /> Dossier kopieren</button></div>
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground">Maps wird zur manuellen Verifizierung geöffnet. Fotos, Bewertungen und fremde Inhalte werden nicht gescrapt; jeder Bildkandidat enthält Quelle und Rechtehinweis.</p>
            </div>}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/[.07] bg-black/15 p-3 sm:grid-cols-5">
          <div><span className="block text-[11px] text-muted-foreground">Leitidee</span><strong className="mt-1 block truncate text-xs">{result.fingerprint.concept}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Animation</span><strong className="mt-1 block text-xs capitalize">{settings.animation}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Aufwand</span><strong className={`mt-1 block text-xs ${effort.color}`}>{effort.label}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Variante</span><strong className="mt-1 block text-xs">#{variant + 1}</strong></div>
          <div><span className="block text-[11px] text-muted-foreground">Konzept-Abstand</span><strong className={`mt-1 block text-xs ${originality.score >= 45 ? "text-[#75e5b7]" : "text-[#efd28e]"}`}>{originality.comparedWith ? `${originality.score} %` : "Noch kein Vergleich"}</strong></div>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-[#d7b56d]/20 bg-[radial-gradient(circle_at_top_right,rgba(111,168,255,.13),transparent_42%),rgba(0,0,0,.16)] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#efd28e]"><Sparkles className="size-3.5" /> Kreativ-DNA</p>
            <Badge variant="outline" className="border-white/10 bg-black/20 font-mono text-[10px]">{result.creativeBlueprint.id}</Badge>
          </div>
          <p className="mt-2 text-sm font-semibold leading-5">{result.creativeBlueprint.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{result.creativeBlueprint.visualMetaphor}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.creativeBlueprint.techniques.map((technique) => <Badge key={technique.id} variant="outline" className="border-[#6fa8ff]/20 bg-[#6fa8ff]/[.06] text-[10px] font-medium text-[#bfd5ff]">{technique.name}</Badge>)}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
        <TabsList className="grid h-12 w-full grid-cols-3 rounded-none border-b border-white/[.07] bg-black/15 p-1">
          <TabsTrigger value="settings" className="min-w-0 text-xs sm:text-sm"><SlidersHorizontal className="size-4" /> Einstellungen</TabsTrigger>
          <TabsTrigger value="prompt" className="min-w-0 text-xs sm:text-sm"><Sparkles className="size-4" /> {settings.productionTrack === "express" ? "Express-Prompt" : "Masterprompt"}</TabsTrigger>
          <TabsTrigger value="history" className="min-w-0 text-xs sm:text-sm"><History className="size-4" /> Verlauf {history.length ? `(${history.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="m-0 p-4 sm:p-5">
          <div className="mb-4 rounded-xl border border-[#d7b56d]/25 bg-[#d7b56d]/[.06] p-3">
            <p className="text-sm font-semibold">High-End als Ausgangspunkt</p>
            <p className="mt-1 text-sm text-muted-foreground">Wähle eine Inszenierung. Danach kannst du jeden Regler einzeln anpassen.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => applyQualityPreset(true)}>Cinematic & 3D</Button>
              <Button type="button" variant="outline" onClick={() => applyQualityPreset(false)}>Editorial & Motion</Button>
            </div>
          </div>
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
          {(legacyPrompt || historicalText) && <div className="mb-3 rounded-xl border border-[#efd28e]/20 p-3 text-sm">Dieser gespeicherte Text bleibt unverändert; die Vorschau zeigt keine nachträglich berechneten Szenen dazu. <button type="button" className="underline underline-offset-4" onClick={() => applyGeneration()}>Mit aktuellen Einstellungen neu erzeugen</button> – eigene Textänderungen werden dabei ersetzt.</div>}
          {dirty && <div className="mb-3 rounded-xl border border-[#efd28e]/20 bg-[#efd28e]/[.06] p-3 text-xs leading-5 text-[#efd28e]">Einstellungen wurden geändert. Mit „Prompt aktualisieren“ übernimmst du sie.</div>}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={settings.productionTrack === "express" ? "border-[#75e5b7]/25 text-[#75e5b7]" : "border-white/10"}>{settings.productionTrack === "express" ? "Express Build" : MASTER_PROMPT_MODES.find((item) => item.value === result.mode)?.label}</Badge>
            {settings.productionTrack === "express" && <Badge variant="outline" className="border-white/10"><Clock3 className="mr-1 size-3" /> {expressTimebox.label}</Badge>}
            <Badge variant="outline" className="border-white/10">{promptText.length.toLocaleString("de-DE")} Zeichen</Badge>
            <Badge variant="outline" className="border-white/10">{result.missingFacts.length} Recherchepunkte</Badge>
            <Badge variant="outline" className="border-white/10">{selectedImageIds.length + (business.imageUrl ? 1 : 0)} Bildreferenzen</Badge>
            <Badge variant="outline" className="border-white/10">{result.motionPlan.scenes.length} Animationsszenen</Badge>
            <Badge variant="outline" className="border-[#d7b56d]/20 text-[#efd28e]">{result.creativeBlueprint.techniques.length} Kreativtechniken</Badge>
            <Badge variant="outline" className="border-white/10">{result.implementationPlan.methodCount} gespeicherte Methoden</Badge>
          </div>
          <p role="status" className={`mt-3 text-sm ${designConflict ? "text-[#ff9b78]" : "text-muted-foreground"}`}>{designMemoryStatus}</p>
          {!legacyPrompt && !historicalText && <Accordion type="single" collapsible className="mt-3 rounded-xl border border-[#d7b56d]/20 bg-black/15 px-3">
            <AccordionItem value="build-plan" className="border-0">
              <AccordionTrigger className="text-sm">Seitenaufbau & verbindlicher Szenenplan · {result.implementationPlan.scenes.length} Szenen</AccordionTrigger>
              <AccordionContent>
                <p className="text-base font-semibold">{result.implementationPlan.pageStructure.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{VIDEO_STYLE_STANDARDS.length} dokumentierte Video-Studien ergänzen die bisherigen Referenzmethoden. Die Stilwelt wird auf diese Firma übertragen.</p>
                <ul className="mt-2 space-y-2 text-sm">{result.implementationPlan.referenceStandards.slice(0, 2).map((rule) => <li key={rule}>{rule}</li>)}</ul>
                <p className="mt-1 text-sm text-muted-foreground">{result.implementationPlan.companyFocus}</p>
                <p className="mt-2 text-sm text-muted-foreground">{result.implementationPlan.evidenceStatus}</p>
                <ol className="mt-3 list-inside list-decimal space-y-1 text-sm">{result.implementationPlan.pageStructure.sections.map((section) => <li key={section}>{section}</li>)}</ol>
                <div className="mt-4 space-y-3">{result.implementationPlan.scenes.map((scene) => <div key={scene.id} className="rounded-lg border border-white/10 p-3">
                  <div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{scene.id} · {scene.name}</strong><Badge variant="outline">{scene.renderer === "webgl" ? "Echte 3D-Szene" : scene.renderer === "static" ? "Statische Adaption" : "Animation / Interaktion"}</Badge></div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{scene.timeline}</p>
                  <p className="mt-2 text-sm leading-6">{scene.acceptance}</p>
                </div>)}</div>
                {result.implementationPlan.game && <div className="mt-3 rounded-lg border border-[#75e5b7]/25 p-3 text-sm"><strong>Website-Spiel: {result.implementationPlan.game.name}</strong><p className="mt-1">{result.implementationPlan.game.brief}</p><p className="mt-2 text-muted-foreground">{result.implementationPlan.game.rules}</p></div>}
                <p className="mt-3 text-sm text-muted-foreground">Der Plan legt die Umsetzung fest. Er bestätigt noch keine fertig gebaute oder getestete Kundenwebsite. Bei Änderungen am Prompttext gilt dein bearbeiteter Text.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>}
          <Textarea aria-label={settings.productionTrack === "express" ? "Express-Build-Prompt" : "Individueller Masterprompt"} value={promptText} maxLength={MAX_MASTER_PROMPT_LENGTH} onChange={(event) => { markManualChange(); setPromptText(event.target.value); }} className="mt-3 field-sizing-fixed h-[430px] max-w-full resize-y border-white/10 bg-black/20 font-mono text-sm leading-6" />
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[.07] bg-black/10 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#75e5b7]" />
            <span><strong className="text-foreground">{originality.comparedWith ? `${originality.score} % Abstand zum gespeicherten Konzept` : "Noch kein gespeichertes Vergleichskonzept"}</strong>{originality.comparedWith ? ` ${originality.comparedWith}.` : "."} Der Textvergleich der Fingerabdrücke ist kein Qualitätsurteil über eine fertige Website.</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="border-white/10" onClick={() => copyPrompt()}><Copy className="mr-2 size-4" /> {settings.productionTrack === "express" ? "Express kopieren" : "Kopieren"}</Button>
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
                      <span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{saved.settings.productionTrack === "express" ? "Express Build" : MASTER_PROMPT_MODES.find((item) => item.value === saved.mode)?.label}</strong>{saved.settings.productionTrack === "express" && <Badge variant="outline" className="border-[#75e5b7]/25 text-[10px] text-[#75e5b7]">{EXPRESS_TIMEBOX_OPTIONS.find((item) => item.value === saved.settings.expressTimebox)?.label ?? "Express"}</Badge>}<Badge variant="outline" className="border-white/10 font-mono text-[10px]">{saved.fingerprint.id}</Badge></span>
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
