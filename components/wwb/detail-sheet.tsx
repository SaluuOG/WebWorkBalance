/* eslint-disable @next/next/no-img-element -- Wikimedia thumbnails are loaded directly. */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Bot,
  CalendarPlus,
  Check,
  CheckCircle2,
  Circle,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  MapPin,
  NotebookPen,
  Phone,
  Search,
  Send,
  Sparkles,
  UserCheck,
  UsersRound,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AUDIT_ITEMS,
  appleMapsUrl,
  calculateLeadScore,
  emptyWebsiteAudit,
  googleMapsUrl,
  leadStatuses,
  outreachTemplatesFor,
  packageForBusiness,
  siteSectionsFor,
  websitePromptFor,
  websiteAuditScore,
  websiteStatusLabel,
  type AuditKey,
  type AuditStatus,
  type AppUser,
  type Business,
  type LeadActivity,
  type LeadActivityType,
  type LeadStatus,
  type PriceSettings,
  type StoredLead,
  type WebsiteAudit,
  type WebsiteStatus,
} from "../../lib/webworkbalance";
import { BusinessVisual } from "./business-visual";

type CommonsImage = {
  id: string;
  title: string;
  thumbnailUrl: string;
  sourceUrl: string;
  artist: string;
  license: string;
};
type CommonsApiPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

const websiteStatuses: WebsiteStatus[] = ["not_found", "likely_missing", "needs_check", "exists", "unreachable", "outdated"];
const activityTypes: LeadActivityType[] = ["Anruf", "E-Mail", "WhatsApp", "Meeting", "Angebot", "Notiz"];

function plainCommonsValue(value?: string) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().slice(0, 500);
}

async function searchCommonsDirect(query: string): Promise<CommonsImage[]> {
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
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) throw new Error(`Wikimedia HTTP ${response.status}`);
  const data = (await response.json()) as { query?: { pages?: Record<string, CommonsApiPage> } };
  return Object.values(data.query?.pages ?? {}).flatMap((page) => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !/^https:\/\//.test(info.thumburl)) return [];
    return [{
      id: String(page.pageid),
      title: page.title.replace(/^File:/, ""),
      thumbnailUrl: info.thumburl,
      sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/?curid=${page.pageid}`,
      artist: plainCommonsValue(info.extmetadata?.Artist?.value) || "Urheber auf Wikimedia Commons",
      license: plainCommonsValue(info.extmetadata?.LicenseShortName?.value) || "Lizenz auf Quellseite prüfen",
    }];
  });
}

export function DetailSheet({
  open,
  onOpenChange,
  business,
  lead,
  prices,
  currentUser,
  onSaveLead,
  onPatchLead,
  onClaimLead,
  onOpenTeamNote,
  onAddTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business | null;
  lead: StoredLead | null;
  prices: PriceSettings;
  currentUser: AppUser;
  onSaveLead: (business: Business, priority?: boolean) => Promise<void>;
  onPatchLead: (id: string, patch: Partial<Pick<StoredLead, "status" | "priority" | "notes" | "nextAction" | "followUpAt" | "websiteStatus" | "audit" | "activities">>) => Promise<void>;
  onClaimLead: (lead: StoredLead, claim: boolean) => Promise<void>;
  onOpenTeamNote: (business: Business) => void;
  onAddTask: (title: string, leadId?: string | null, dueAt?: string | null) => Promise<void>;
}) {
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("Erstkontakt vorbereiten");
  const [followUpAt, setFollowUpAt] = useState("");
  const [status, setStatus] = useState<LeadStatus>("Neu");
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>("needs_check");
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<CommonsImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [audit, setAudit] = useState<WebsiteAudit>(() => emptyWebsiteAudit());
  const [outreachMode, setOutreachMode] = useState<"email" | "whatsapp" | "call" | "followUp">("email");
  const [activityType, setActivityType] = useState<LeadActivityType>("Anruf");
  const [activityNote, setActivityNote] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setNotes(lead?.notes ?? "");
      setNextAction(lead?.nextAction ?? "Erstkontakt vorbereiten");
      setFollowUpAt(lead?.followUpAt?.slice(0, 10) ?? "");
      setStatus(lead?.status ?? "Neu");
      setWebsiteStatus(lead?.websiteStatus ?? business?.websiteStatus ?? "needs_check");
      setAudit(lead?.audit ?? emptyWebsiteAudit());
      setImages([]);
    }, 0);
    return () => window.clearTimeout(resetTimer);
    // `updatedAt` is the durable lead revision; depending on every deserialized
    // object would reset unsaved fields on each background team refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, lead?.updatedAt]);

  const score = useMemo(() => (business ? calculateLeadScore({ ...business, websiteStatus }) : 0), [business, websiteStatus]);
  const offer = useMemo(() => (business ? packageForBusiness({ ...business, websiteStatus }, prices) : null), [business, websiteStatus, prices]);
  const outreach = useMemo(() => (business ? outreachTemplatesFor({ ...business, websiteStatus }, prices, audit) : null), [audit, business, prices, websiteStatus]);
  const auditScore = websiteAuditScore(audit);
  const outreachText = outreach?.[outreachMode] ?? "";
  const whatsappNumber = business?.phone?.replace(/\D/g, "").replace(/^0/, "49") ?? "";
  const claimedByMe = lead?.claimedById === currentUser.id;
  const claimedByOther = Boolean(lead?.claimedById && !claimedByMe);

  if (!business) return null;
  const researchBusiness = business;

  async function copy(text: string, message: string) {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  }

  async function saveChanges() {
    if (!lead) return;
    if (claimedByOther) return toast.error(`${lead.claimedByName ?? "Dein Partner"} bearbeitet diesen Lead bereits.`);
    setSaving(true);
    await onPatchLead(lead.id, {
      status,
      notes,
      nextAction,
      followUpAt: followUpAt || null,
      websiteStatus,
      audit: { ...audit, updatedAt: new Date().toISOString() },
    });
    setSaving(false);
    toast.success("Lead aktualisiert");
  }

  function cycleAudit(key: AuditKey) {
    const order: AuditStatus[] = ["open", "good", "issue"];
    setAudit((current) => {
      const index = order.indexOf(current.checks[key]);
      return { ...current, checks: { ...current.checks, [key]: order[(index + 1) % order.length] } };
    });
  }

  function setFollowUpDays(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFollowUpAt(date.toISOString().slice(0, 10));
  }

  async function addActivity() {
    if (!lead) return;
    if (claimedByOther) return toast.error(`${lead.claimedByName ?? "Dein Partner"} bearbeitet diesen Lead bereits.`);
    setActivitySaving(true);
    const item: LeadActivity = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      type: activityType,
      note: activityNote.trim() || `${activityType} dokumentiert`,
      createdAt: new Date().toISOString(),
    };
    const activities = [item, ...(lead.activities ?? [])].slice(0, 100);
    const contacted = ["Anruf", "E-Mail", "WhatsApp", "Meeting"].includes(activityType);
    const nextStatus: LeadStatus = contacted && ["Neu", "Interessant", "Recherche läuft", "Kontakt vorbereitet"].includes(status) ? "Kontaktiert" : status;
    await onPatchLead(lead.id, { activities, status: nextStatus });
    setStatus(nextStatus);
    setActivityNote("");
    setActivitySaving(false);
    toast.success("Aktivität gespeichert");
  }

  async function researchImages() {
    setImagesLoading(true);
    try {
      const query = `${researchBusiness.name} ${researchBusiness.address}`;
      let found: CommonsImage[] = [];
      try {
        const response = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as { images?: CommonsImage[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        found = data.images ?? [];
      } catch {
        // Falls der Site-Worker keine externe Verbindung bekommt, nutzt die App
        // die CORS-fähige Commons-API direkt vom Gerät aus.
      }
      if (!found.length) found = await searchCommonsDirect(query);
      setImages(found);
      if (!found.length) toast.info("Keine passenden Commons-Treffer gefunden");
    } catch {
      toast.error("Bildquellen konnten nicht geprüft werden");
    } finally {
      setImagesLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-[#0b0f14] p-0 sm:max-w-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{business.name}</SheetTitle>
          <SheetDescription>Unternehmensdetails, Scout-Analyse und nächste Schritte</SheetDescription>
        </SheetHeader>
        <BusinessVisual business={business} />
        <div className="space-y-6 p-5 sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-[#d7b56d]/25 bg-[#d7b56d]/10 text-[#efd28e]">{business.category}</Badge>
              <Badge variant="outline" className="border-white/10 text-muted-foreground">{business.distanceKm} km</Badge>
              <Badge variant="outline" className="border-white/10 text-muted-foreground">Quelle: {business.source}</Badge>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{business.name}</h2>
            <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin className="mt-1 size-4 shrink-0" />{business.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href={googleMapsUrl(business)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-sm font-medium transition hover:bg-white/[.07]">
              <MapPin className="size-4 text-[#d7b56d]" /> Google Maps
            </a>
            <a href={appleMapsUrl(business)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-sm font-medium transition hover:bg-white/[.07]">
              <Apple className="size-4" /> Apple Karten
            </a>
            {business.phone ? (
              <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-sm font-medium transition hover:bg-white/[.07]"><Phone className="size-4 text-[#52d6a0]" /> Anrufen</a>
            ) : <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 px-3 py-3 text-sm text-muted-foreground"><Phone className="size-4" /> Keine Nummer</div>}
            {business.email ? (
              <button type="button" onClick={() => copy(business.email!, "E-Mail-Adresse kopiert")} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-sm font-medium transition hover:bg-white/[.07]"><Mail className="size-4 text-[#6fa8ff]" /> E-Mail kopieren</button>
            ) : <div className="flex items-center justify-center gap-2 rounded-xl border border-white/5 px-3 py-3 text-sm text-muted-foreground"><Mail className="size-4" /> Keine E-Mail</div>}
          </div>

          {lead && <section className={`rounded-2xl border p-4 ${claimedByOther ? "border-[#6fa8ff]/25 bg-[#6fa8ff]/[.055]" : claimedByMe ? "border-[#52d6a0]/25 bg-[#52d6a0]/[.05]" : "border-white/[.08] bg-white/[.025]"}`}>
            <div className="flex items-start gap-3">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${claimedByOther ? "bg-[#6fa8ff]/10 text-[#9fc1ff]" : claimedByMe ? "bg-[#52d6a0]/10 text-[#75e5b7]" : "bg-white/[.05] text-muted-foreground"}`}><UserCheck className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{claimedByOther ? `${lead.claimedByName ?? "Dein Partner"} arbeitet daran` : claimedByMe ? "Dieser Lead gehört gerade dir" : "Dieser Lead ist noch frei"}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{claimedByOther ? "Änderungen sind geschützt, damit ihr nicht gleichzeitig an derselben Firma arbeitet." : claimedByMe ? "Dein Partner sieht die Zuständigkeit automatisch in seiner App." : "Übernimm die Firma, bevor du mit Recherche oder Kontakt beginnst."}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {claimedByMe ? <Button type="button" variant="outline" className="border-white/10" onClick={() => onClaimLead(lead, false)}>Lead freigeben</Button> : claimedByOther ? <Button type="button" variant="outline" className="border-[#6fa8ff]/20 text-[#9fc1ff]" disabled>Bereits vergeben</Button> : <Button type="button" variant="outline" className="border-[#52d6a0]/20 text-[#75e5b7]" onClick={() => onClaimLead(lead, true)}>Jetzt übernehmen</Button>}
              <Button type="button" variant="outline" className="border-white/10" onClick={() => onOpenTeamNote(business)}><UsersRound className="mr-2 size-4" /> Team-Notiz</Button>
            </div>
          </section>}

          <section className="rounded-2xl border border-[#d7b56d]/18 bg-[#d7b56d]/[.055] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#efd28e]"><Bot className="size-4" /> Scout-Analyse</p>
                <h3 className="mt-2 text-xl font-semibold">{score}/100 · {score >= 75 ? "Starke Chance" : score >= 55 ? "Gute Chance" : "Prüfen"}</h3>
              </div>
              <div className="rounded-xl bg-black/20 px-3 py-2 text-right">
                <span className="block text-xs text-muted-foreground">Empfehlung</span>
                <strong className="text-sm text-[#efd28e]">{offer?.name}</strong>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#52d6a0]" /> {business.website ? "Bestehenden Auftritt gezielt auf Verbesserungen prüfen." : "Kein eindeutiger Website-Eintrag in der Datenquelle."}</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#52d6a0]" /> {business.phone || business.email ? "Direkter geschäftlicher Kontakt ist vorhanden." : "Kontaktdaten zuerst im Karteneintrag verifizieren."}</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[#52d6a0]" /> Vorschlag: {offer?.price.toLocaleString("de-DE")} € für {offer?.name}.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
            <div><h3 className="flex items-center gap-2 text-base font-semibold"><Search className="size-4 text-[#d7b56d]" /> Recherche-Zentrale</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Gezielte Suchen öffnen, ohne jedes Mal neue Suchbegriffe einzutippen.</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Firma prüfen", `${business.name} ${business.address}`],
                ["Bewertungen", `${business.name} ${business.address} Bewertungen`],
                ["Social Media", `site:instagram.com OR site:facebook.com \"${business.name}\"`],
                ["Kontaktperson", `\"${business.name}\" Ansprechpartner Impressum`],
              ].map(([label, query]) => <a key={label} href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 rounded-xl border border-white/[.08] bg-black/10 px-3 py-3 text-sm transition hover:border-[#d7b56d]/20 hover:bg-white/[.04]"><span>{label}</span><ExternalLink className="size-3.5 shrink-0 text-muted-foreground" /></a>)}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-base font-semibold"><Sparkles className="size-4 text-[#d7b56d]" /> Website-Konzept</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {siteSectionsFor({ ...business, websiteStatus }).map((section, index) => (
                <div key={section} className="flex gap-3 rounded-xl border border-white/7 bg-white/[.025] p-3 text-sm"><span className="text-[#d7b56d]">0{index + 1}</span><span>{section}</span></div>
              ))}
            </div>
            <Button type="button" variant="outline" className="mt-3 w-full border-white/10" onClick={() => copy(websitePromptFor({ ...business, websiteStatus }, prices), "Website-Prompt kopiert")}>
              <Copy className="mr-2 size-4" /> Fertigen Website-Prompt kopieren
            </Button>
          </section>

          {lead && (business.website || ["exists", "outdated", "unreachable"].includes(websiteStatus)) && (
            <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
              <div className="flex items-start justify-between gap-4"><div><h3 className="flex items-center gap-2 text-base font-semibold"><CircleAlert className="size-4 text-[#d7b56d]" /> Website Quick-Audit</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Jeden Punkt anklicken: offen → gut → Problem.</p></div><div className="rounded-xl bg-black/20 px-3 py-2 text-right"><span className="block text-[11px] text-muted-foreground">Audit-Score</span><strong className={auditScore === null ? "text-muted-foreground" : auditScore >= 70 ? "text-[#75e5b7]" : "text-[#ff9b78]"}>{auditScore === null ? "–" : `${auditScore}/100`}</strong></div></div>
              <div className="mt-4 space-y-2">{AUDIT_ITEMS.map((item) => { const value = audit.checks[item.key]; return <button type="button" key={item.key} onClick={() => cycleAudit(item.key)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${value === "good" ? "border-[#52d6a0]/20 bg-[#52d6a0]/[.055]" : value === "issue" ? "border-[#ff6677]/20 bg-[#ff6677]/[.055]" : "border-white/[.07] bg-white/[.02] hover:bg-white/[.045]"}`}>{value === "good" ? <CheckCircle2 className="size-5 shrink-0 text-[#52d6a0]" /> : value === "issue" ? <CircleAlert className="size-5 shrink-0 text-[#ff8290]" /> : <Circle className="size-5 shrink-0 text-muted-foreground" />}<span className="min-w-0 flex-1"><strong className="block text-sm font-medium">{item.label}</strong><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.hint}</span></span><span className="text-xs font-medium">{value === "good" ? "Gut" : value === "issue" ? "Problem" : "Offen"}</span></button>; })}</div>
              <textarea value={audit.notes} onChange={(event) => setAudit((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Konkrete Beobachtungen, Ladezeit, fehlende Inhalte …" className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/15 p-3 text-sm outline-none focus:border-[#d7b56d]/60" />
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-semibold"><ImageIcon className="size-4 text-[#d7b56d]" /> Öffentliche Bildquellen</h3>
              <Button type="button" size="sm" variant="outline" className="border-white/10" onClick={researchImages} disabled={imagesLoading}>
                <Search className={`mr-2 size-3.5 ${imagesLoading ? "animate-spin" : ""}`} /> {imagesLoading ? "Suche…" : "Prüfen"}
              </Button>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Treffer stammen aus Wikimedia Commons und müssen manuell dem Unternehmen zugeordnet sowie lizenzrechtlich geprüft werden.</p>
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {images.map((image) => (
                  <a key={image.id} href={image.sourceUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-white/10 bg-white/[.025]">
                    <img src={image.thumbnailUrl} alt={image.title} className="aspect-video w-full object-cover" />
                    <div className="p-2"><p className="truncate text-xs font-medium">{image.title}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{image.artist} · {image.license}</p></div>
                  </a>
                ))}
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${business.name} ${business.address}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">Google Bilder <ExternalLink className="size-3.5" /></a>
              <a href={googleMapsUrl(business)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">Maps-Fotos <ExternalLink className="size-3.5" /></a>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d7b56d]/15 bg-[#d7b56d]/[.035] p-4">
            <div><h3 className="flex items-center gap-2 text-base font-semibold"><Send className="size-4 text-[#d7b56d]" /> Kontakt-Studio</h3><p className="mt-1 text-xs text-muted-foreground">Persönliche Vorlage wählen, prüfen und manuell versenden.</p></div>
            <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-black/20 p-1">{([
              ["email", "E-Mail"], ["whatsapp", "WhatsApp"], ["call", "Anruf"], ["followUp", "Follow-up"],
            ] as const).map(([key, label]) => <button type="button" key={key} onClick={() => setOutreachMode(key)} className={`rounded-lg px-1 py-2 text-xs font-medium transition ${outreachMode === key ? "bg-[#d7b56d] text-[#080b0f]" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>)}</div>
            {outreachMode === "email" && outreach && <div className="mt-3 rounded-xl border border-white/[.07] bg-black/10 px-3 py-2 text-xs"><span className="text-muted-foreground">Betreff:</span> {outreach.subject}</div>}
            <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/[.08] bg-black/15 p-4 text-sm leading-6 text-foreground/85">{outreachText}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="border-white/10" onClick={() => copy(outreachMode === "email" && outreach ? `Betreff: ${outreach.subject}\n\n${outreachText}` : outreachText, "Kontaktvorlage kopiert")}><Copy className="mr-2 size-4" /> Kopieren</Button>
              {outreachMode === "email" && business.email && outreach ? <a href={`mailto:${business.email}?subject=${encodeURIComponent(outreach.subject)}&body=${encodeURIComponent(outreach.email)}`} className="flex items-center justify-center gap-2 rounded-xl bg-[#d7b56d] px-3 text-sm font-semibold text-[#080b0f]"><Mail className="size-4" /> E-Mail öffnen</a> : outreachMode === "whatsapp" && whatsappNumber ? <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(outreachText)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#52d6a0] px-3 text-sm font-semibold text-[#07120d]"><MessageCircle className="size-4" /> WhatsApp</a> : outreachMode === "call" && business.phone ? <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2 rounded-xl bg-[#d7b56d] px-3 text-sm font-semibold text-[#080b0f]"><Phone className="size-4" /> Anrufen</a> : <Button type="button" onClick={() => copy(outreachText, "Vorlage kopiert")}><Send className="mr-2 size-4" /> Bereitstellen</Button>}
            </div>
          </section>

          {lead && (
            <section className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
              <div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-base font-semibold"><NotebookPen className="size-4 text-[#d7b56d]" /> Kontaktverlauf</h3><p className="mt-1 text-xs text-muted-foreground">Anruf, Nachricht und Gespräch in Sekunden dokumentieren.</p></div><Badge variant="outline" className="border-white/10">{lead.activities?.length ?? 0}</Badge></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[145px_1fr_auto]"><Select value={activityType} onValueChange={(value) => setActivityType(value as LeadActivityType)}><SelectTrigger className="h-10 w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{activityTypes.map((type) => <SelectItem value={type} key={type}>{type}</SelectItem>)}</SelectContent></Select><input value={activityNote} onChange={(event) => setActivityNote(event.target.value)} placeholder="Kurze Notiz, Ergebnis oder Vereinbarung" className="h-10 rounded-xl border border-white/10 bg-black/15 px-3 text-sm outline-none focus:border-[#d7b56d]/60" /><Button type="button" size="sm" className="h-10" onClick={addActivity} disabled={activitySaving}>{activitySaving ? "…" : "Eintragen"}</Button></div>
              <div className="mt-4 space-y-2">{lead.activities?.slice(0, 6).map((activity) => <div key={activity.id} className="flex gap-3 border-l border-[#d7b56d]/25 py-1 pl-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#d7b56d]" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{activity.type}</strong><span className="text-[11px] text-muted-foreground">{new Date(activity.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{activity.note}</p></div></div>)}{!lead.activities?.length && <p className="rounded-xl border border-dashed border-white/10 py-5 text-center text-xs text-muted-foreground">Noch kein Kontakt dokumentiert.</p>}</div>
            </section>
          )}

          {lead ? (
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm"><span className="text-muted-foreground">Pipeline-Status</span>
                  <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}><SelectTrigger className="w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{leadStatuses.map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent></Select>
                </label>
                <label className="space-y-2 text-sm"><span className="text-muted-foreground">Website-Status</span>
                  <Select value={websiteStatus} onValueChange={(value) => setWebsiteStatus(value as WebsiteStatus)}><SelectTrigger className="w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{websiteStatuses.map((item) => <SelectItem value={item} key={item}>{websiteStatusLabel[item]}</SelectItem>)}</SelectContent></Select>
                </label>
              </div>
              <label className="block space-y-2 text-sm"><span className="text-muted-foreground">Nächster Schritt</span><input value={nextAction} onChange={(event) => setNextAction(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/60" /></label>
              <label className="block space-y-2 text-sm"><span className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Wiedervorlage</span><span className="flex gap-1">{[[0,"Heute"],[1,"+1"],[3,"+3"],[7,"+7"]].map(([days,label]) => <button type="button" key={label} onClick={() => setFollowUpDays(Number(days))} className="rounded-md bg-white/[.05] px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">{label}</button>)}</span></span><input type="date" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 outline-none focus:border-[#d7b56d]/60" /></label>
              <label className="block space-y-2 text-sm"><span className="text-muted-foreground">Notizen</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-black/15 p-3 outline-none focus:border-[#d7b56d]/60" placeholder="Ansprechpartner, Gespräch, Wünsche…" /></label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="border-white/10" onClick={() => onAddTask(nextAction || `Bei ${business.name} nachfassen`, lead.id, followUpAt || null)}><CalendarPlus className="mr-2 size-4" /> Aufgabe</Button>
                <Button type="button" onClick={saveChanges} disabled={saving || claimedByOther}>{claimedByOther ? `${lead.claimedByName ?? "Partner"} arbeitet daran` : saving ? "Speichert…" : "Änderungen speichern"}</Button>
              </div>
            </section>
          ) : (
            <Button type="button" className="h-12 w-full" onClick={() => onSaveLead(business, score >= 80)}><Sparkles className="mr-2 size-4" /> Als {score >= 80 ? "Top-Lead" : "Lead"} speichern</Button>
          )}

          <div className="flex flex-wrap gap-3 border-t border-white/8 pt-5 text-xs text-muted-foreground">
            {business.website && <a href={business.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><Globe2 className="size-3.5" /> Website öffnen</a>}
            <a href={business.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><ExternalLink className="size-3.5" /> Quelldatensatz</a>
            <span>Geprüft: {new Date(business.fetchedAt).toLocaleDateString("de-DE")}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
