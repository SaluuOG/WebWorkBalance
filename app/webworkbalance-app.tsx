/* eslint-disable @next/next/no-img-element -- free direct image sources avoid an optimizer dependency. */
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  BellRing,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Euro,
  ExternalLink,
  Globe2,
  Info,
  List,
  ListTodo,
  LayoutDashboard,
  LocateFixed,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu as MenuIcon,
  Navigation,
  Phone,
  Plane,
  Plus,
  Radar,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { BusinessCard, type SwipeAction } from "@/components/wwb/business-card";
import { DetailSheet } from "@/components/wwb/detail-sheet";
import { ManualLeadDialog } ◊M˝Û«!jª-ÆÈ‹j◊ù≠ÍÓü≠Üöw¯+züÌj)_¢∑ÓñZ.∂õ≠-cols-3"><InfoTile title="Freie Live-Endpunkte" text="overpass-api.de ¬∑ private.coffee ¬∑ maps.mail.ru" /><InfoTile title="Ausfallschutz" text="Lernt den schnellsten Anbieter, wechselt automatisch und wiederholt einmal" /><InfoTile title="Doppelter Cache" text="30 Min. auf dem Ger√§t plus gemeinsamer Team-Cache" /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Die Firmensuche l√§uft nach deinem Klick direkt vom Ger√§t zu OpenStreetMap. Dadurch greift nicht mehr die kurze Server-Wartezeit der ver√∂ffentlichten App. Gro√üe Kreise werden als kleine Teilgebiete geladen; sie liefern verl√§ssliche Arbeitsstapel, sind aber keine vollst√§ndige amtliche Firmenliste. F√ºr einen Anbieter mit festem Kontingent l√§sst sich sp√§ter optional Geoapify (kostenloser API-Key) erg√§nzen.</p><div className="mt-4 flex flex-wrap gap-2"><a href="https://www.geoapify.com/pricing/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/[.06] hover:text-foreground"><ExternalLink className="mr-2 size-3.5" /> Geoapify-Free-Tarif</a><a href="https://wiki.openstreetmap.org/wiki/Overpass_API" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-medium text-muted-foreground transition hover:bg-white/[.06] hover:text-foreground"><ExternalLink className="mr-2 size-3.5" /> OSM-Endpunkte</a></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Ein fehlender Website-Eintrag ist ein Signal, kein Beweis. Pr√ºfe den Betrieb vor Kontaktaufnahme. Kartendaten ¬© OpenStreetMap-Mitwirkende, ODbL.</p></section>
          </div>
        </TabsContent>

        <TabsList className="wwb-bottom-nav fixed z-40 h-auto justify-between rounded-[1.4rem] border border-white/10 bg-[#11151b]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl">
          <NavTab value="today" icon={<LayoutDashboard />} label="Heute" />
          <NavTab value="discover" icon={<Radar />} label="Entdecken" />
          <NavTab value="regional" icon={<List />} label="Region" />
          <NavTab value="map" icon={<MapIcon />} label="Karte" />
          <NavTab value="leads" icon={<BriefcaseBusiness />} label="Leads" badge={leads.length} />
          <NavTab value="team" icon={<UsersRound />} label="Team" badge={teamNotes.filter((note) => note.kind === "Blocker").length} />
          <NavTab value="tasks" icon={<ListTodo />} label="Aufgaben" badge={openTasks} />
        </TabsList>
      </Tabs>

      <Dialog open={passportOpen} onOpenChange={setPassportOpen}>
        <DialogContent className="border-white/10 bg-[#10141a] sm:max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="size-5 text-[#d7b56d]" /> Passport-Modus</DialogTitle><DialogDescription>Springe in jede Stadt oder jedes Dorf in Deutschland und starte dort deinen Radar.</DialogDescription></DialogHeader>
          <form onSubmit={searchPassport} className="flex flex-col gap-2 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus value={passportQuery} onChange={(event) => setPassportQuery(event.target.value)} placeholder="Stadt, Dorf oder Postleitzahl" className="h-11 w-full rounded-xl border border-white/10 bg-black/15 pl-10 pr-3 outline-none focus:border-[#d7b56d]/50" /></label><Button type="submit" disabled={passportSearching}>{passportSearching ? "Sucht‚Ä¶" : "Suchen"}</Button></form>
          {!passportResults.length && <div className="flex flex-wrap gap-2">{[
            { name: "N√ºrnberg", lat: 49.4521, lon: 11.0767, passport: true },
            { name: "F√ºrth", lat: 49.4771, lon: 10.9887, passport: true },
            { name: "Erlangen", lat: 49.5897, lon: 11.0119, passport: true },
            { name: "M√ºnchen", lat: 48.1374, lon: 11.5755, passport: true },
          ].map((place) => <Button key={place.name} type="button" variant="outline" size="sm" className="border-white/10" onClick={() => choosePlace(place)}>{place.name}</Button>)}</div>}
          {passportResults.length > 0 && <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-thin">{passportResults.map((result) => <button key={result.id} type="button" onClick={() => choosePlace({ name: result.name.split(",").slice(0, 2).join(","), lat: result.lat, lon: result.lon, passport: true })} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left hover:bg-white/[.055]"><MapPin className="size-4 shrink-0 text-[#d7b56d]" /><span className="min-w-0 flex-1 truncate text-sm">{result.name}</span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div>}
          {recentPlaces.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zuletzt verwendet</p><div className="flex flex-wrap gap-2">{recentPlaces.map((place) => <button type="button" key={`${place.lat}-${place.lon}`} onClick={() => choosePlace(place)} className="rounded-lg bg-white/[.04] px-3 py-2 text-xs hover:bg-white/[.07]">{place.name}</button>)}</div></div>}
          <p className="text-[11px] leading-4 text-muted-foreground">Ortssuche: OpenStreetMap Nominatim. Nur manuell ausgel√∂ste Suchanfragen.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={teamInboxOpen} onOpenChange={(open) => { if (!open) dismissTeamInbox(false); }}>
        <DialogContent className="wwb-team-inbox-dialog border-[#d7b56d]/20 bg-[#10141a] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#d7b56d]/12 text-[#efd28e]"><BellRing className="size-5" /></span><span>Neue Team-Notizen</span></DialogTitle>
            <DialogDescription>{teamInboxCount === 1 ? "Eine neue Notiz wartet auf dich." : `${teamInboxCount} neue Team-Notizen warten auf dich.`} Sie werden automatisch mit eurem gemeinsamen Arbeitsraum abgeglichen.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {teamInboxNotes.map((note) => <article key={note.id} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{note.authorName}</strong><Badge variant="outline" className="h-5 border-white/10 px-2 text-[11px] text-muted-foreground">{note.kind}</Badge>{note.pinned && <Badge className="h-5 bg-[#d7b56d]/15 px-2 text-[11px] text-[#efd28e]">Wichtig</Badge>}<span className="text-[11px] text-muted-foreground">{formatTeamNoteTime(note.updatedAt)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{note.body}</p>{note.leadId && <p className="mt-2 text-xs text-[#d7b56d]">Mit einem Lead verkn√ºpft ¬∑ im Team-Bereich √∂ffnen</p>}</article>)}
          </div>
          {teamInboxCount > teamInboxNotes.length && <p className="text-xs text-muted-foreground">Weitere {teamInboxCount - teamInboxNotes.length} Eintr√§ge findest du im Team-Bereich.</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="border-white/10" onClick={() => dismissTeamInbox(false)}>Sp√§ter erinnern</Button><Button type="button" onClick={openTeamFromInbox}><UsersRound className="mr-2 size-4" /> Team √∂ffnen</Button></div>
        </DialogContent>
      </Dialog>

      <ManualLeadDialog open={manualLeadOpen} onOpenChange={setManualLeadOpen} center={center} onCreate={async (business, priority) => { await saveLead(business, priority); setView("leads"); }} />
      <QuickMenu open={quickMenuOpen} onOpenChange={setQuickMenuOpen} leads={leads} onNavigate={navigate} onNewLead={() => setManualLeadOpen(true)} onLoadStarter={() => void loadStarterLeads()} onPassport={() => setPassportOpen(true)} onOpenLead={openDetails} />
      <DetailSheet open={detailOpen} onOpenChange={setDetailOpen} business={selectedBusiness} lead={selectedLead} prices={prices} currentUser={activeUser} onSaveLead={async (business, priority) => { await saveLead(business, priority); }} onPatchLead={patchLead} onClaimLead={claimLead} onOpenTeamNote={openTeamNote} onAddTask={addTask} />
      <Toaster position="top-center" richColors closeButton />
    </main>
  );
}

function NavTab({ value, icon, label, badge }: { value: AppView; icon: ReactNode; label: string; badge?: number }) {
  return <TabsTrigger value={value} className="relative h-auto min-w-0 flex-col gap-1 rounded-xl px-2 py-2 text-[11px] data-[state=active]:bg-[#d7b56d]/12 data-[state=active]:text-[#efd28e] sm:flex-row sm:px-4 sm:text-sm [&_svg]:size-5">{icon}<span className="max-w-full truncate">{label}</span>{Boolean(badge) && <span className="absolute right-1 top-0 flex min-w-4 items-center justify-center rounded-full bg-[#d7b56d] px-1 text-[10px] font-bold text-[#080b0f] sm:-right-1">{(badge ?? 0) > 99 ? "99+" : badge}</span>}</TabsTrigger>;
}

function StatCard({ label, value, icon, accent = false }: { label: string; value: string | number; icon: ReactNode; accent?: boolean }) {
  return <div className="glass-panel rounded-2xl p-4"><div className={`flex size-8 items-center justify-center rounded-lg ${accent ? "bg-[#d7b56d]/10 text-[#efd28e]" : "bg-white/[.04] text-muted-foreground"}`}>{icon}</div><strong className={`mt-3 block text-xl sm:text-2xl ${accent ? "text-[#efd28e]" : ""}`}>{value}</strong><span className="mt-1 block text-xs text-muted-foreground">{label}</span></div>;
}

function InfoTile({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span></div>;
}

function LeadRow({ lead, currentUserId, prices, onOpen, onStatus }: { lead: StoredLead; currentUserId: string; prices: PriceSettings; onOpen: () => void; onStatus: (status: LeadStatus) => void }) {
  const offer = packageForBusiness(lead, prices);
  const claimedByOther = Boolean(lead.claimedById && lead.claimedById !== currentUserId);
  return <article className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:bg-white/[.045]"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Building2 className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{lead.name}</h3>{lead.priority && <Star className="size-4 fill-[#d7b56d] text-[#d7b56d]" />}{lead.claimedByName && <Badge variant="outline" className="h-5 border-[#6fa8ff]/20 bg-[#6fa8ff]/[.06] px-2 text-[11px] text-[#9fc1ff]"><UserCheck className="mr-1 size-3" /> {lead.claimedByName}</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{lead.category} ¬∑ {lead.address}</p><div className="mt-2 flex flex-wrap gap-2"><span className="text-xs text-[#75e5b7]">Lead {lead.score}</span>{lead.websiteReport && <span className={lead.websiteReport.overallScore >= 75 ? "text-xs text-[#75e5b7]" : lead.websiteReport.overallScore >= 55 ? "text-xs text-[#efd28e]" : "text-xs text-[#ff8290]"}>Website {lead.websiteReport.overallScore}/100</span>}<span className="text-xs text-muted-foreground">{offer.name} ¬∑ {offer.price.toLocaleString("de-DE")} ‚Ç¨</span></div></div></button><div className="flex flex-wrap items-center gap-2 lg:justify-end"><Select value={lead.status} disabled={claimedByOther} onValueChange={(value) => onStatus(value as LeadStatus)}><SelectTrigger className="h-9 w-48 border-white/10 text-xs"><SelectValue /></SelectTrigger><SelectContent>{leadStatuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select>{lead.phone && <a href={`tel:${lead.phone}`} aria-label={`${lead.name} anrufen`} className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><Phone className="size-4" /></a>}{lead.email && <button type="button" onClick={() => { navigator.clipboard.writeText(lead.email!); toast.success("E-Mail kopiert"); }} aria-label="E-Mail kopieren" className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><Mail className="size-4" /></button>}<a href={googleMapsUrl(lead)} target="_blank" rel="noreferrer" aria-label="Google Maps √∂ffnen" className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]"><ExternalLink className="size-4" /></a><button type="button" onClick={onOpen} className="flex size-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/[.06]" aria-label="Lead √∂ffnen"><ChevronRight className="size-4" /></button></div></div>{lead.followUpAt && <div className="mt-3 flex items-center gap-2 border-t border-white/[.06] pt-3 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Wiedervorlage {formatDate(lead.followUpAt)} ¬∑ {lead.nextAction}</div>}</article>;
}
