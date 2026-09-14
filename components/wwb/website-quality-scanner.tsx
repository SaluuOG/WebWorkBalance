/* eslint-disable @next/next/no-img-element -- official-site research assets use dynamic source URLs. */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { quickAuditFromWebsiteReport, websiteResearchBrief } from "@/lib/website-quality";
import type {
  Business,
  OfficialWebsiteVerification,
  WebsiteAudit,
  WebsiteQualityFindingStatus,
  WebsiteQualityReport,
} from "@/lib/webworkbalance";

type ScanResponse = {
  verification?: OfficialWebsiteVerification;
  report?: WebsiteQualityReport | null;
  error?: string;
  code?: string;
};

const statusLabel: Record<WebsiteQualityFindingStatus, string> = {
  good: "Gut",
  warning: "Prüfen",
  critical: "Problem",
};

function statusClasses(status: WebsiteQualityFindingStatus) {
  if (status === "good") return "border-[#52d6a0]/20 bg-[#52d6a0]/[.055] text-[#75e5b7]";
  if (status === "warning") return "border-[#d7b56d]/20 bg-[#d7b56d]/[.055] text-[#efd28e]";
  return "border-[#ff6677]/20 bg-[#ff6677]/[.055] text-[#ff8290]";
}

function scoreClasses(score: number) {
  if (score >= 80) return "text-[#75e5b7]";
  if (score >= 60) return "text-[#efd28e]";
  return "text-[#ff8290]";
}

export function WebsiteQualityScanner({
  business,
  report,
  currentAudit,
  savingBlocked,
  onReport,
}: {
  business: Business;
  report: WebsiteQualityReport | null;
  currentAudit: WebsiteAudit;
  savingBlocked: boolean;
  onReport: (report: WebsiteQualityReport, audit: WebsiteAudit) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<OfficialWebsiteVerification | null>(report?.official ?? null);
  const [localReport, setActiveReport] = useState<WebsiteQualityReport | null>(report);
  const autoScanKey = useRef<string | null>(null);
  const activeReport = localReport && (!report || localReport.scannedAt >= report.scannedAt) ? localReport : report;

  async function runScan(silent = false) {
    if (!business.website || business.isDemo || loading) return;
    setLoading(true);
    setError(null);
    if (!silent) toast.info("Offizielle Website wird geprüft …");
    try {
      const response = await fetch("/api/website-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: {
            name: business.name,
            address: business.address,
            phone: business.phone,
            email: business.email,
            source: business.source,
            sourceUrl: business.sourceUrl,
            website: business.website,
          },
        }),
      });
      const data = (await response.json()) as ScanResponse;
      if (!response.ok) throw new Error(data.error || "Der Website-Scan ist fehlgeschlagen.");
      setVerification(data.verification ?? null);
      if (!data.report) {
        setActiveReport(null);
        setError(data.verification?.reason ?? "Die Website konnte nicht sicher als offizielle Firmen-Website bestätigt werden.");
        return;
      }
      const nextAudit = quickAuditFromWebsiteReport(data.report, currentAudit);
      setActiveReport(data.report);
      await onReport(data.report, nextAudit);
      toast.success(`Website geprüft: ${data.report.overallScore}/100`);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Der Website-Scan konnte nicht abgeschlossen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const key = `${business.id}|${business.website ?? ""}`;
    if (!business.website || business.isDemo || activeReport || autoScanKey.current === key) return;
    autoScanKey.current = key;
    const timer = window.setTimeout(() => void runScan(true), 250);
    return () => window.clearTimeout(timer);
    // The automatic scan is intentionally keyed to the selected company URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id, business.website]);

  if (!business.website || business.isDemo) return null;

  async function copyResearch() {
    if (!activeReport) return;
    await navigator.clipboard.writeText(websiteResearchBrief(business, activeReport));
    toast.success("Recherche-Dossier kopiert");
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#6fa8ff]/22 bg-gradient-to-br from-[#6fa8ff]/[.08] via-white/[.025] to-[#52d6a0]/[.045] shadow-[0_24px_80px_rgba(0,0,0,.18)]">
      <div className="border-b border-white/[.07] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#9fc1ff]"><Search className="size-4" /> Website Quality Scan</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">Offiziellen Auftritt prüfen</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Zuordnung, Qualität, Relaunch-Chancen und Recherchematerial in einem Durchlauf.</p>
          </div>
          <Badge variant="outline" className="shrink-0 border-[#52d6a0]/20 bg-[#52d6a0]/[.06] text-[#75e5b7]"><ShieldCheck className="mr-1 size-3.5" /> Nur offiziell</Badge>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading && (
          <div className="rounded-2xl border border-white/[.08] bg-black/15 p-5">
            <div className="flex items-center gap-3"><RefreshCw className="size-5 animate-spin text-[#9fc1ff]" /><div><strong className="text-sm">Website wird analysiert</strong><p className="mt-1 text-xs text-muted-foreground">Domain bestätigen · Technik lesen · Inhalte und Bildquellen sammeln</p></div></div>
            <Progress value={68} className="mt-4 bg-white/[.07] [&_[data-slot=progress-indicator]]:bg-[#6fa8ff]" aria-label="Website-Scan läuft" />
          </div>
        )}

        {!loading && error && !activeReport && (
          <div className="rounded-2xl border border-[#d7b56d]/20 bg-[#d7b56d]/[.055] p-4">
            <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-[#efd28e]" /><div className="min-w-0"><strong className="text-sm">Kein automatischer Qualitäts-Score</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">{error}</p>{verification?.evidence.length ? <ul className="mt-3 space-y-1 text-xs text-foreground/75">{verification.evidence.slice(0, 3).map((item) => <li key={item}>• {item}</li>)}</ul> : null}</div></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button type="button" size="sm" variant="outline" className="border-white/10" onClick={() => void runScan()}><RefreshCw className="mr-2 size-3.5" /> Erneut prüfen</Button><a href={business.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-sm">Website öffnen <ExternalLink className="size-3.5" /></a></div>
          </div>
        )}

        {!loading && activeReport && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border border-white/[.08] bg-black/15 p-4">
                <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#52d6a0]/10 text-[#75e5b7]"><ShieldCheck className="size-5" /></span><div className="min-w-0"><strong className="block text-sm">Offizielle Website verifiziert</strong><a href={activeReport.finalUrl} target="_blank" rel="noreferrer" className="mt-1 flex max-w-full items-center gap-1 truncate text-xs text-[#9fc1ff] hover:underline">{activeReport.domain}<ExternalLink className="size-3 shrink-0" /></a><p className="mt-2 text-[11px] leading-4 text-muted-foreground">Zuordnungs-Vertrauen {activeReport.official.confidence}/100 · {activeReport.official.reason}</p></div></div>
              </div>
              <div className="flex min-w-36 items-center justify-between gap-4 rounded-2xl border border-[#d7b56d]/18 bg-[#d7b56d]/[.055] px-4 py-3 sm:block sm:text-right">
                <div><span className="block text-[11px] uppercase tracking-wider text-muted-foreground">Qualität</span><strong className={`mt-1 block text-3xl ${scoreClasses(activeReport.overallScore)}`}>{activeReport.overallScore}</strong></div>
                <div className="sm:mt-1"><span className="block text-xs font-medium">{activeReport.grade}</span><span className="mt-1 block text-[11px] text-muted-foreground">Relaunch-Chance {activeReport.opportunity}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[
                ["Antwort", `${activeReport.metrics.responseMs} ms`],
                ["HTML", `${activeReport.metrics.htmlKb} KB`],
                ["Wörter", activeReport.metrics.wordCount.toLocaleString("de-DE")],
                ["Bilder", activeReport.metrics.imageCount],
                ["Scripte", activeReport.metrics.scriptCount],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.07] bg-white/[.025] p-2.5"><span className="block text-[10px] text-muted-foreground">{label}</span><strong className="mt-1 block truncate text-xs">{value}</strong></div>)}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3"><div><h4 className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4 text-[#efd28e]" /> Wichtigste Chancen</h4><p className="mt-1 text-xs text-muted-foreground">Konkrete Argumente für Analyse und Relaunch-Gespräch.</p></div><Badge variant="outline" className="border-white/10">{activeReport.topIssues.length}</Badge></div>
              <div className="mt-3 space-y-2">
                {activeReport.topIssues.slice(0, 4).map((item) => <article key={`${item.category}-${item.id}`} className={`rounded-xl border p-3 ${statusClasses(item.status)}`}><div className="flex items-center justify-between gap-2"><strong className="text-xs text-foreground">{item.label}</strong><span className="text-[10px] font-semibold uppercase tracking-wider">{statusLabel[item.status]}</span></div><p className="mt-1 text-xs leading-5 text-foreground/75">{item.finding}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Empfehlung: {item.recommendation}</p></article>)}
                {!activeReport.topIssues.length && <div className="flex items-center gap-2 rounded-xl border border-[#52d6a0]/20 bg-[#52d6a0]/[.05] p-3 text-sm text-[#75e5b7]"><CheckCircle2 className="size-4" /> Keine deutlichen Schwachstellen im Schnellscan.</div>}
              </div>
            </div>

            <Accordion type="multiple" className="rounded-2xl border border-white/[.08] bg-black/10 px-3">
              {activeReport.categories.map((item) => <AccordionItem value={item.key} key={item.key} className="border-white/[.07]"><AccordionTrigger className="no-underline hover:no-underline"><span className="flex min-w-0 flex-1 items-center gap-3"><span className={`min-w-12 text-lg font-semibold ${scoreClasses(item.score)}`}>{item.score}</span><span className="min-w-0"><strong className="block truncate text-sm">{item.label}</strong><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{item.summary}</span></span></span></AccordionTrigger><AccordionContent><div className="space-y-2 pb-1">{item.findings.map((entry) => <div key={entry.id} className="rounded-xl border border-white/[.07] bg-white/[.02] p-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs">{entry.label}</strong><Badge variant="outline" className={`h-5 px-2 text-[10px] ${statusClasses(entry.status)}`}>{statusLabel[entry.status]}</Badge></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{entry.finding}</p>{entry.status !== "good" && <p className="mt-1 text-xs leading-5 text-foreground/75">→ {entry.recommendation}</p>}</div>)}</div></AccordionContent></AccordionItem>)}
            </Accordion>

            <div className="rounded-2xl border border-[#d7b56d]/18 bg-[#d7b56d]/[.035] p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-semibold text-[#efd28e]"><Sparkles className="size-4" /> Recherche-Dossier</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Inhalte und Assets direkt aus der verifizierten offiziellen Website.</p></div><Button type="button" size="sm" variant="outline" className="border-white/10" onClick={copyResearch}><Copy className="mr-2 size-3.5" /> Kopieren</Button></div>
              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid h-auto w-full grid-cols-3 bg-black/20 p-1"><TabsTrigger value="info" className="text-xs"><Bot className="mr-1 size-3.5" /> Infos</TabsTrigger><TabsTrigger value="images" className="text-xs"><ImageIcon className="mr-1 size-3.5" /> Bilder</TabsTrigger><TabsTrigger value="sources" className="text-xs"><Globe2 className="mr-1 size-3.5" /> Quellen</TabsTrigger></TabsList>
                <TabsContent value="info" className="mt-3 space-y-3">
                  {activeReport.research.description && <div className="rounded-xl border border-white/[.07] bg-black/10 p-3"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Seitenbeschreibung</span><p className="mt-2 text-xs leading-5 text-foreground/80">{activeReport.research.description}</p></div>}
                  <ResearchList title="Leistungs- und Inhaltshinweise" items={activeReport.research.serviceHints.length ? activeReport.research.serviceHints : activeReport.research.headings.slice(0, 8)} empty="Keine klaren Leistungsüberschriften extrahiert." />
                  <ResearchList title="Kontakthinweise" items={activeReport.research.contactHints} empty="Keine zusätzlichen Kontakthinweise extrahiert." />
                  <div className="grid grid-cols-2 gap-2"><ResearchList title="Technik-Hinweise" items={activeReport.research.technologyHints} empty="Kein System eindeutig erkannt." compact /><div className="rounded-xl border border-white/[.07] bg-black/10 p-3"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Farbhinweise</span><div className="mt-3 flex flex-wrap gap-2">{activeReport.research.brandColors.map((color) => <span key={color} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="size-5 rounded-md border border-white/15" style={{ backgroundColor: color }} />{color}</span>)}{!activeReport.research.brandColors.length && <span className="text-xs text-muted-foreground">Keine extrahiert.</span>}</div></div></div>
                </TabsContent>
                <TabsContent value="images" className="mt-3">
                  {activeReport.research.images.length ? <div className="grid grid-cols-2 gap-2">{activeReport.research.images.slice(0, 8).map((image) => <a key={image.url} href={image.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-white/[.08] bg-black/10"><img src={image.url} alt={image.alt} loading="lazy" className="aspect-video w-full bg-black/20 object-cover" /><div className="p-2"><div className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-medium">{image.alt}</span><ExternalLink className="size-3 shrink-0 text-muted-foreground" /></div><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{image.kind === "logo" ? "Logo-Hinweis" : image.kind === "social-preview" ? "Social Preview" : "Website-Bild"} · Rechte prüfen</p></div></a>)}</div> : <p className="rounded-xl border border-dashed border-white/10 py-7 text-center text-xs text-muted-foreground">Keine geeigneten Bildkandidaten in der Startseite gefunden.</p>}
                  <p className="mt-3 flex gap-2 text-[11px] leading-4 text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#75e5b7]" /> Die Bilder gehören nicht automatisch euch. Vor Übernahme immer Zustimmung, Urheberrecht und Lizenz prüfen.</p>
                </TabsContent>
                <TabsContent value="sources" className="mt-3 space-y-3">
                  <div className="grid gap-2">{activeReport.research.importantPages.map((page) => <a key={page.url} href={page.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-black/10 p-3 text-xs transition hover:border-[#d7b56d]/20"><span className="min-w-0"><strong className="block truncate text-foreground">{page.label}</strong><span className="mt-1 block truncate text-muted-foreground">{page.type} · {page.url}</span></span><ExternalLink className="size-3.5 shrink-0 text-muted-foreground" /></a>)}{!activeReport.research.importantPages.length && <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-muted-foreground">Keine relevanten Unterseiten extrahiert.</p>}</div>
                  <ResearchList title="Social Media" items={activeReport.research.socialLinks} empty="Keine Social-Links auf der Website erkannt." />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1 border-white/10" onClick={() => void runScan()} disabled={loading}><RefreshCw className="mr-2 size-4" /> Neu prüfen</Button>
              <a href={activeReport.finalUrl} target="_blank" rel="noreferrer" className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#6fa8ff] px-4 text-sm font-semibold text-[#07101d]">Website öffnen <ExternalLink className="size-4" /></a>
            </div>
            {savingBlocked && <p className="text-center text-[11px] leading-4 text-muted-foreground">Der Scan ist sichtbar, wird aber nicht im Lead gespeichert, solange dein Teammitglied daran arbeitet.</p>}
            <p className="text-[11px] leading-4 text-muted-foreground">Stand: {new Date(activeReport.scannedAt).toLocaleString("de-DE")} · Automatischer Schnellscan, kein vollständiger Browser-, Lighthouse- oder Rechtscheck.</p>
          </div>
        )}

        {!loading && !error && !activeReport && (
          <Button type="button" className="w-full" onClick={() => void runScan()}><Search className="mr-2 size-4" /> Offizielle Website analysieren</Button>
        )}
      </div>
    </section>
  );
}

function ResearchList({ title, items, empty, compact = false }: { title: string; items: string[]; empty: string; compact?: boolean }) {
  return <div className="rounded-xl border border-white/[.07] bg-black/10 p-3"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</span>{items.length ? <ul className={`mt-2 space-y-1 text-xs leading-5 text-foreground/80 ${compact ? "line-clamp-6" : ""}`}>{items.slice(0, compact ? 6 : 10).map((item) => <li key={item} className="break-words">• {item}</li>)}</ul> : <p className="mt-2 text-xs leading-5 text-muted-foreground">{empty}</p>}</div>;
}
