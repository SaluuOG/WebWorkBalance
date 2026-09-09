"use client";

import { type ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, CalendarClock, Check, Euro, List, ListTodo, Plus, Radar, Sparkles, Target, Trophy, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { nextBestActionFor, packageForBusiness, type LeadTask, type PriceSettings, type StoredLead } from "@/lib/webworkbalance";

function formatDay(value: string | null) {
  if (!value) return "Ohne Termin";
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" });
}

export function WorkflowCockpit({
  displayName,
  leads,
  tasks,
  prices,
  dailyGoal,
  onOpenLead,
  onOpenManual,
  onLoadStarter,
  onViewRadar,
  onViewRegional,
  onViewLeads,
  onViewTeam,
  onViewTasks,
  onViewPricing,
  onToggleTask,
}: {
  displayName: string;
  leads: StoredLead[];
  tasks: LeadTask[];
  prices: PriceSettings;
  dailyGoal: number;
  onOpenLead: (lead: StoredLead) => void;
  onOpenManual: () => void;
  onLoadStarter: () => void;
  onViewRadar: () => void;
  onViewRegional: () => void;
  onViewLeads: () => void;
  onViewTeam: () => void;
  onViewTasks: () => void;
  onViewPricing: () => void;
  onToggleTask: (task: LeadTask) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  const activeLeads = leads.filter((lead) => !["Abgelehnt", "Auftrag gewonnen"].includes(lead.status));
  const dueTasks = tasks.filter((task) => !task.completed && (!task.dueAt || task.dueAt.slice(0, 10) <= today));
  const dueFollowUps = activeLeads.filter((lead) => lead.followUpAt && lead.followUpAt.slice(0, 10) <= today);
  const freshToday = leads.filter((lead) => lead.createdAt.startsWith(today)).length;
  const wonLeads = leads.filter((lead) => lead.status === "Auftrag gewonnen");
  const wonValue = wonLeads.reduce((sum, lead) => sum + packageForBusiness(lead, prices).price, 0);
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + packageForBusiness(lead, prices).price, 0);
  const recommended = activeLeads
    .map((lead) => ({ lead, action: nextBestActionFor(lead) }))
    .sort((a, b) => b.action.urgency - a.action.urgency)[0];
  const pipeline = [
    { label: "Neu & interessant", count: leads.filter((lead) => ["Neu", "Interessant", "Recherche läuft"].includes(lead.status)).length, color: "bg-[#6fa8ff]" },
    { label: "Im Kontakt", count: leads.filter((lead) => ["Kontakt vorbereitet", "Kontaktiert", "Rückmeldung erhalten"].includes(lead.status)).length, color: "bg-[#d7b56d]" },
    { label: "Demo & Angebot", count: leads.filter((lead) => ["Demo-Website erstellt", "Angebot gesendet"].includes(lead.status)).length, color: "bg-[#bc86ff]" },
    { label: "Gewonnen", count: wonLeads.length, color: "bg-[#52d6a0]" },
  ];
  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.count));

  return (
    <div className="space-y-5">
      <section className="glass-panel overflow-hidden rounded-[1.9rem] bg-[radial-gradient(circle_at_82%_10%,rgba(215,181,109,.15),transparent_30rem)] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="text-sm font-semibold capitalize text-[#d7b56d]">{todayLabel}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Guten Tag, {displayName}.</h2><p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">Hier siehst du nur, was heute Umsatz und Fortschritt bringt.</p></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[560px]">
            <MiniStat label="Heute fällig" value={dueTasks.length + dueFollowUps.length} accent />
            <MiniStat label="Neue Leads" value={`${freshToday}/${dailyGoal}`} />
            <MiniStat label="Pipeline" value={`${pipelineValue.toLocaleString("de-DE")} €`} />
            <MiniStat label="Gewonnen" value={`${wonValue.toLocaleString("de-DE")} €`} success />
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <div className="space-y-5">
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[.15em] text-[#d7b56d]">Nächster bester Schritt</p><h3 className="mt-1 text-2xl font-semibold">{recommended ? recommended.action.label : "Neue Chancen finden"}</h3></div><div className="flex size-11 items-center justify-center rounded-xl bg-[#d7b56d]/10 text-[#efd28e]"><Sparkles className="size-5" /></div></div>
            {recommended ? <>
              <button type="button" onClick={() => onOpenLead(recommended.lead)} className="mt-5 w-full rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-left transition hover:border-[#d7b56d]/25 hover:bg-white/[.045]"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-lg">{recommended.lead.name}</strong><p className="mt-1 text-sm text-muted-foreground">{recommended.action.reason} · {recommended.lead.category}</p></div><Badge variant="outline" className="border-[#d7b56d]/25 text-[#efd28e]">Score {recommended.lead.score}</Badge></div><div className="mt-4 flex items-center justify-between border-t border-white/[.06] pt-3 text-sm"><span className="text-muted-foreground">{recommended.lead.nextAction}</span><ArrowRight className="size-4 text-[#d7b56d]" /></div></button>
              <Button className="mt-3 w-full" onClick={() => onOpenLead(recommended.lead)}>Lead öffnen &amp; erledigen <ArrowRight className="ml-2 size-4" /></Button>
            </> : <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-7 text-center"><p className="text-sm text-muted-foreground">Aktuell ist kein offener Lead vorhanden.</p><Button className="mt-4" onClick={onViewRadar}><Radar className="mr-2 size-4" /> Radar starten</Button></div>}
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-semibold">Heute-Liste</h3><p className="mt-1 text-sm text-muted-foreground">Aufgaben und Wiedervorlagen an einem Ort.</p></div><Badge variant="outline" className="border-white/10">{dueTasks.length + dueFollowUps.length} offen</Badge></div>
            <div className="mt-4 space-y-2">
              {dueFollowUps.map((lead) => <button type="button" key={`follow-${lead.id}`} onClick={() => onOpenLead(lead)} className="flex w-full items-center gap-3 rounded-xl border border-[#d7b56d]/15 bg-[#d7b56d]/[.045] p-3 text-left transition hover:bg-[#d7b56d]/[.08]"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#d7b56d]/10 text-[#efd28e]"><CalendarClock className="size-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{lead.name} nachfassen</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{formatDay(lead.followUpAt)} · {lead.nextAction}</span></span><ArrowRight className="size-4 text-muted-foreground" /></button>)}
              {dueTasks.map((task) => <button type="button" key={`task-${task.id}`} onClick={() => onToggleTask(task)} className="flex w-full items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left transition hover:bg-white/[.05]"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10"><Check className="size-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{task.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{formatDay(task.dueAt)}</span></span></button>)}
              {!dueTasks.length && !dueFollowUps.length && <div className="rounded-2xl border border-dashed border-white/10 py-9 text-center"><Trophy className="mx-auto size-7 text-[#52d6a0]" /><p className="mt-3 text-sm font-medium">Heute ist alles erledigt.</p><p className="mt-1 text-xs text-muted-foreground">Nutze die freie Zeit für neue Leads.</p></div>}
            </div>
            <Button variant="outline" className="mt-3 w-full border-white/10" onClick={onViewTasks}><ListTodo className="mr-2 size-4" /> Alle Aufgaben öffnen</Button>
          </section>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24">
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><h3 className="text-xl font-semibold">Pipeline-Puls</h3><p className="mt-1 text-sm text-muted-foreground">Wo deine Chancen gerade stehen.</p></div><Target className="size-5 text-[#d7b56d]" /></div>
            <div className="mt-5 space-y-4">{pipeline.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">{item.label}</span><strong>{item.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/[.05]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(item.count ? 8 : 0, (item.count / pipelineMax) * 100)}%` }} /></div></div>)}</div>
            <div className="mt-5 border-t border-white/[.07] pt-4"><div className="flex items-end justify-between"><span className="text-sm text-muted-foreground">Tagesziel Leads</span><strong>{freshToday}/{dailyGoal}</strong></div><Progress value={Math.min(100, (freshToday / Math.max(1, dailyGoal)) * 100)} className="mt-3 h-2 [&_[data-slot=progress-indicator]]:bg-[#52d6a0]" /></div>
          </section>

            <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6"><h3 className="text-xl font-semibold">Schnellzugriff</h3><div className="mt-4 grid grid-cols-2 gap-2"><QuickButton icon={<Radar />} label="Radar" onClick={onViewRadar} /><QuickButton icon={<List />} label="Regional-Liste" onClick={onViewRegional} /><QuickButton icon={<Plus />} label="Lead anlegen" onClick={onOpenManual} /><QuickButton icon={<Sparkles />} label="10 Start-Leads" onClick={onLoadStarter} /><QuickButton icon={<UsersRound />} label="Team-Notizen" onClick={onViewTeam} /><QuickButton icon={<BriefcaseBusiness />} label="Meine Leads" onClick={onViewLeads} /><QuickButton icon={<Euro />} label="Kalkulator" onClick={onViewPricing} /><QuickButton icon={<ListTodo />} label="Aufgaben" onClick={onViewTasks} /></div></section>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent = false, success = false }: { label: string; value: string | number; accent?: boolean; success?: boolean }) {
  return <div className="rounded-xl border border-white/[.07] bg-black/15 p-3"><span className="block text-xs text-muted-foreground">{label}</span><strong className={`mt-1 block truncate text-lg ${accent ? "text-[#efd28e]" : success ? "text-[#75e5b7]" : ""}`}>{value}</strong></div>;
}

function QuickButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left transition hover:border-[#d7b56d]/25 hover:bg-white/[.05]"><span className="text-[#d7b56d] [&_svg]:size-5">{icon}</span><strong className="text-sm">{label}</strong></button>;
}
