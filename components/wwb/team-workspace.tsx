"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
  Laptop2,
  Lightbulb,
  MessageSquareText,
  Pin,
  Plus,
  RefreshCw,
  SearchCheck,
  Trash2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppUser, StoredLead, TeamNote, TeamNoteKind } from "@/lib/webworkbalance";

const noteKinds: Array<{ value: TeamNoteKind; icon: typeof MessageSquareText; color: string }> = [
  { value: "Notiz", icon: MessageSquareText, color: "text-[#9fc1ff]" },
  { value: "Recherche", icon: SearchCheck, color: "text-[#75e5b7]" },
  { value: "Idee", icon: Lightbulb, color: "text-[#efd28e]" },
  { value: "Blocker", icon: AlertTriangle, color: "text-[#ff9ca7]" },
];

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 45) return "gerade eben";
  if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
  if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`;
  return new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function workStage(status: StoredLead["status"]) {
  if (status === "Auftrag gewonnen") return { label: "Webseite in Arbeit", tone: "border-[#52d6a0]/25 bg-[#52d6a0]/10 text-[#75e5b7]" };
  if (status === "Demo-Website erstellt") return { label: "Demo-Webseite erstellt", tone: "border-[#bc86ff]/25 bg-[#bc86ff]/10 text-[#d4b4ff]" };
  if (status === "Angebot gesendet") return { label: "Angebot offen", tone: "border-[#d7b56d]/25 bg-[#d7b56d]/10 text-[#efd28e]" };
  if (status === "Recherche läuft") return { label: "Recherche läuft", tone: "border-[#6fa8ff]/25 bg-[#6fa8ff]/10 text-[#9fc1ff]" };
  if (status === "Kontakt vorbereitet") return { label: "Kontakt vorbereiten", tone: "border-[#ff9c67]/25 bg-[#ff9c67]/10 text-[#ffbe96]" };
  if (status === "Kontaktiert" || status === "Rückmeldung erhalten") return { label: "Kontakt läuft", tone: "border-[#6fa8ff]/25 bg-[#6fa8ff]/10 text-[#9fc1ff]" };
  if (status === "Später kontaktieren") return { label: "Pausiert", tone: "border-white/10 bg-white/[.04] text-muted-foreground" };
  if (status === "Interessant") return { label: "Top-Lead gesichert", tone: "border-[#d7b56d]/25 bg-[#d7b56d]/10 text-[#efd28e]" };
  return { label: "Lead gesichert", tone: "border-white/10 bg-white/[.04] text-foreground/80" };
}

export function TeamWorkspace({
  currentUser,
  notes,
  leads,
  live,
  onUpdateName,
  focusLeadId,
  onFocusLeadChange,
  onCreateNote,
  onTogglePin,
  onDeleteNote,
  onClaimLead,
  onOpenLead,
  onRefresh,
}: {
  currentUser: AppUser;
  notes: TeamNote[];
  leads: StoredLead[];
  live: boolean;
  onUpdateName: (name: string) => Promise<void>;
  focusLeadId: string | null;
  onFocusLeadChange: (leadId: string | null) => void;
  onCreateNote: (body: string, kind: TeamNoteKind, leadId: string | null) => Promise<void>;
  onTogglePin: (note: TeamNote) => Promise<void>;
  onDeleteNote: (note: TeamNote) => Promise<void>;
  onClaimLead: (lead: StoredLead, claim: boolean) => Promise<void>;
  onOpenLead: (lead: StoredLead) => void;
  onRefresh: () => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<TeamNoteKind>("Notiz");
  const [leadId, setLeadId] = useState<string>(focusLeadId ?? "none");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | TeamNoteKind>("all");
  const [teamName, setTeamName] = useState(currentUser.name);
  const [nameSaving, setNameSaving] = useState(false);

  const openLeads = leads.filter((lead) => !["Auftrag gewonnen", "Abgelehnt"].includes(lead.status));
  const assignedLeads = leads.filter((lead) => lead.claimedById && lead.status !== "Abgelehnt");
  const selectedLeadId = focusLeadId ?? leadId;
  const myLeads = assignedLeads.filter((lead) => lead.claimedById === currentUser.id);
  const teamLeads = assignedLeads.filter((lead) => lead.claimedById && lead.claimedById !== currentUser.id);
  const freeSuggestions = openLeads.filter((lead) => !lead.claimedById).sort((a, b) => b.score - a.score).slice(0, 4);
  const visibleNotes = useMemo(() => notes.filter((note) => filter === "all" || note.kind === filter), [filter, notes]);
  const leadMap = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);
  const assignments = useMemo(() => {
    const groups = new Map<string, { id: string; name: string; leads: StoredLead[] }>();
    leads.forEach((lead) => {
      if (!lead.claimedById || lead.status === "Abgelehnt") return;
      const existing = groups.get(lead.claimedById) ?? { id: lead.claimedById, name: lead.claimedByName || "Teammitglied", leads: [] };
      existing.name = lead.claimedByName || existing.name;
      existing.leads.push(lead);
      groups.set(existing.id, existing);
    });
    return [...groups.values()]
      .map((group) => ({ ...group, leads: group.leads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }))
      .sort((a, b) => Number(b.id === currentUser.id) - Number(a.id === currentUser.id) || a.name.localeCompare(b.name, "de"));
  }, [currentUser.id, leads]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    try {
      await onCreateNote(body.trim(), kind, selectedLeadId === "none" ? null : selectedLeadId);
      setBody("");
      setKind("Notiz");
      setLeadId("none");
      onFocusLeadChange(null);
    } finally {
      setSaving(false);
    }
  }

  async function submitTeamName(event: FormEvent) {
    event.preventDefault();
    const nextName = teamName.trim();
    if (nextName.length < 2 || nextName === currentUser.name) return;
    setNameSaving(true);
    try {
      await onUpdateName(nextName);
    } finally {
      setNameSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="glass-panel overflow-hidden rounded-[1.9rem] bg-[radial-gradient(circle_at_85%_5%,rgba(82,214,160,.12),transparent_28rem)] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold uppercase tracking-[.15em] text-[#d7b56d]">Gemeinsamer Arbeitsraum</p><Badge variant="outline" className={live ? "border-[#52d6a0]/25 bg-[#52d6a0]/10 text-[#75e5b7]" : "border-[#ff6677]/25 text-[#ff9ca7]"}><span className={`mr-1.5 size-1.5 rounded-full ${live ? "bg-[#52d6a0]" : "bg-[#ff6677]"}`} />{live ? "Live-Abgleich" : "Verbindung prüfen"}</Badge></div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Team &amp; Notizen</h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">Sieh sofort, wer einen Lead gesichert hat und wie weit Recherche, Kontakt oder Webseitenarbeit ist.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[430px]">
            <TeamStat label="Bei dir" value={myLeads.length} color="text-[#efd28e]" />
            <TeamStat label="Beim Partner" value={teamLeads.length} color="text-[#9fc1ff]" />
            <TeamStat label="Freie Leads" value={openLeads.filter((lead) => !lead.claimedById).length} color="text-[#75e5b7]" />
          </div>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_8%_0%,rgba(215,181,109,.1),transparent_26rem)] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#d7b56d]">Live-Arbeitsboard</p>
              <Badge variant="outline" className="border-white/10 bg-white/[.035] text-foreground/75">{assignedLeads.length} zugeordnet</Badge>
            </div>
            <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold"><Globe2 className="size-5 shrink-0 text-[#75e5b7]" /> Wer arbeitet gerade woran?</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Lead-Sicherung, Recherche, Kontakt und Webseitenarbeit – für euch beide live und übersichtlich.</p>
          </div>
          <Button type="button" variant="outline" className="shrink-0 border-white/10" onClick={() => void onRefresh()}><RefreshCw className="mr-2 size-4" /> Aktualisieren</Button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {assignments.map((group) => {
            const mine = group.id === currentUser.id;
            return <article key={group.id} className={`min-w-0 rounded-2xl border p-3 sm:p-4 ${mine ? "border-[#d7b56d]/20 bg-[#d7b56d]/[.035]" : "border-[#6fa8ff]/18 bg-[#6fa8ff]/[.035]"}`}>
              <div className="flex items-center gap-3 px-1 pb-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-semibold ${mine ? "bg-[#d7b56d]/12 text-[#efd28e]" : "bg-[#6fa8ff]/12 text-[#9fc1ff]"}`}>{group.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><strong className="truncate text-sm sm:text-base">{group.name}</strong><Badge variant="outline" className={`h-5 px-2 text-[10px] ${mine ? "border-[#d7b56d]/20 text-[#efd28e]" : "border-[#6fa8ff]/20 text-[#9fc1ff]"}`}>{mine ? "Du" : "Team"}</Badge></div>
                  <span className="text-xs text-muted-foreground">{group.leads.length} {group.leads.length === 1 ? "aktiver Lead" : "aktive Leads"}</span>
                </div>
              </div>
              <div className="space-y-2">
                {group.leads.map((lead) => {
                  const stage = workStage(lead.status);
                  return <button key={lead.id} type="button" onClick={() => onOpenLead(lead)} className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-white/[.07] bg-black/15 p-3 text-left transition hover:border-white/[.14] hover:bg-white/[.045]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[.045] text-[#efd28e]"><Laptop2 className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm">{lead.name}</strong>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{lead.category} · {lead.nextAction}</span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      <Badge variant="outline" className={`whitespace-nowrap ${stage.tone}`}>{stage.label}</Badge>
                      <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground"><Clock3 className="size-3" /> {relativeTime(lead.updatedAt)}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                  </button>;
                })}
              </div>
            </article>;
          })}
          {!assignments.length && <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center lg:col-span-2"><UsersRound className="mx-auto size-7 text-muted-foreground" /><h4 className="mt-3 font-semibold">Noch ist kein Lead zugeordnet</h4><p className="mt-1 text-sm text-muted-foreground">Sobald jemand einen Lead übernimmt, erscheint er hier mit Arbeitsphase und letztem Stand.</p></div>}
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(360px,.78fr)_minmax(0,1.22fr)]">
        <div className="space-y-5 xl:sticky xl:top-24">
          <form onSubmit={submit} className="glass-panel rounded-[1.75rem] p-5">
            <div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-xl font-semibold"><Plus className="size-5 text-[#d7b56d]" /> Notiz teilen</h3><p className="mt-1 text-sm text-muted-foreground">Erscheint automatisch bei euch beiden.</p></div><span className="flex size-9 items-center justify-center rounded-full bg-[#d7b56d]/10 font-semibold text-[#efd28e]">{currentUser.name.slice(0, 1).toUpperCase()}</span></div>
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={6000} placeholder="Was soll dein Partner wissen? Recherche-Ergebnis, Idee oder Blocker …" className="mt-4 resize-none border-white/10 bg-black/15" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Select value={kind} onValueChange={(value) => setKind(value as TeamNoteKind)}><SelectTrigger className="w-full border-white/10"><SelectValue /></SelectTrigger><SelectContent>{noteKinds.map((item) => <SelectItem key={item.value} value={item.value}>{item.value}</SelectItem>)}</SelectContent></Select>
              <Select value={selectedLeadId} onValueChange={setLeadId}><SelectTrigger className="w-full border-white/10"><SelectValue placeholder="Allgemeine Notiz" /></SelectTrigger><SelectContent><SelectItem value="none">Allgemeine Notiz</SelectItem>{openLeads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <Button type="submit" className="mt-3 w-full" disabled={saving || !body.trim()}>{saving ? "Wird geteilt …" : "Mit dem Team teilen"}</Button>
          </form>

          <form onSubmit={submitTeamName} className="glass-panel rounded-[1.75rem] p-5">
            <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6fa8ff]/10 text-[#9fc1ff]"><UserRoundCog className="size-5" /></span><div><h3 className="text-lg font-semibold">Dein Team-Name</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">Dieser Name steht an deinen gesicherten Leads und Notizen – zum Beispiel Salu oder Sula.</p></div></div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
              <input value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={40} autoComplete="nickname" aria-label="Dein Team-Name" className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-black/15 px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#d7b56d]/45" placeholder="Dein Name" />
              <Button type="submit" variant="outline" className="border-[#d7b56d]/20 text-[#efd28e]" disabled={nameSaving || teamName.trim().length < 2 || teamName.trim() === currentUser.name}><Check className="mr-2 size-4" /> {nameSaving ? "Speichert …" : "Speichern"}</Button>
            </div>
          </form>

          {freeSuggestions.length > 0 && <section className="glass-panel rounded-[1.75rem] p-5"><h3 className="text-lg font-semibold">Gute freie Leads</h3><p className="mt-1 text-sm text-muted-foreground">Noch von niemandem in Bearbeitung.</p><div className="mt-4 space-y-2">{freeSuggestions.map((lead) => <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#52d6a0]/10 text-[#75e5b7]"><BriefcaseBusiness className="size-4" /></span><button type="button" onClick={() => onOpenLead(lead)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm">{lead.name}</strong><span className="text-xs text-muted-foreground">Score {lead.score} · {lead.category}</span></button><Button size="sm" variant="outline" className="border-[#52d6a0]/20 text-[#75e5b7]" onClick={() => void onClaimLead(lead, true)}>Übernehmen</Button></div>)}</div></section>}
        </div>

        <section className="glass-panel min-h-[660px] rounded-[1.75rem] p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-xl font-semibold">Gemeinsame Pinnwand</h3><p className="mt-1 text-sm text-muted-foreground">Neueste Einträge erscheinen oben.</p></div><div className="flex flex-wrap gap-1.5"><FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Alle</FilterButton>{noteKinds.map((item) => <FilterButton key={item.value} active={filter === item.value} onClick={() => setFilter(item.value)}>{item.value}</FilterButton>)}</div></div>
          <div className="mt-5 space-y-3">
            {visibleNotes.map((note) => {
              const definition = noteKinds.find((item) => item.value === note.kind) ?? noteKinds[0];
              const Icon = definition.icon;
              const linkedLead = note.leadId ? leadMap.get(note.leadId) : null;
              const mine = note.authorId === currentUser.id;
              return <article key={note.id} className={`rounded-2xl border p-4 sm:p-5 ${note.pinned ? "border-[#d7b56d]/25 bg-[#d7b56d]/[.045]" : "border-white/[.07] bg-white/[.025]"}`}>
                <div className="flex items-start gap-3"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[.04] ${definition.color}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{note.authorName}</strong><Badge variant="outline" className="h-5 border-white/10 px-2 text-[11px] text-muted-foreground">{note.kind}</Badge>{note.pinned && <Badge className="h-5 bg-[#d7b56d]/15 px-2 text-[11px] text-[#efd28e]"><Pin className="mr-1 size-3" /> Wichtig</Badge>}<span className="text-xs text-muted-foreground">{relativeTime(note.updatedAt)}</span></div><p className="mt-3 whitespace-pre-wrap text-[15px] leading-6 text-foreground/90">{note.body}</p>{linkedLead && <button type="button" onClick={() => onOpenLead(linkedLead)} className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[.07] bg-black/10 px-3 py-2 text-left text-sm transition hover:bg-white/[.04]"><span className="min-w-0 truncate"><BriefcaseBusiness className="mr-2 inline size-4 text-[#d7b56d]" />{linkedLead.name}</span><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></button>}</div><div className="flex shrink-0 flex-col gap-1"><button type="button" onClick={() => void onTogglePin(note)} className={`flex size-8 items-center justify-center rounded-lg transition hover:bg-white/[.06] ${note.pinned ? "text-[#efd28e]" : "text-muted-foreground"}`} aria-label={note.pinned ? "Notiz lösen" : "Notiz anheften"}><Pin className="size-4" /></button>{mine && <button type="button" onClick={() => void onDeleteNote(note)} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-[#ff6677]/10 hover:text-[#ff9ca7]" aria-label="Notiz löschen"><Trash2 className="size-4" /></button>}</div></div>
              </article>;
            })}
            {!visibleNotes.length && <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center"><CheckCircle2 className="size-9 text-[#52d6a0]" /><h4 className="mt-4 text-lg font-semibold">Noch keine Einträge</h4><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Teile die erste Notiz, damit ihr eure Recherche und nächsten Schritte an einem Ort habt.</p></div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function TeamStat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-xl border border-white/[.07] bg-black/15 p-3"><span className="block text-xs text-muted-foreground">{label}</span><strong className={`mt-1 block text-2xl ${color}`}>{value}</strong></div>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" onClick={onClick} className={`rounded-lg px-2.5 py-1.5 text-xs transition ${active ? "bg-[#d7b56d] font-semibold text-[#080b0f]" : "bg-white/[.04] text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}
