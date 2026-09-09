"use client";

import { useEffect } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  CirclePlus,
  LayoutDashboard,
  ListTodo,
  List,
  Map,
  Plane,
  Radar,
  Settings2,
  UsersRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { AppView, StoredLead } from "@/lib/webworkbalance";

export function QuickMenu({
  open,
  onOpenChange,
  leads,
  onNavigate,
  onNewLead,
  onLoadStarter,
  onPassport,
  onOpenLead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: StoredLead[];
  onNavigate: (view: AppView) => void;
  onNewLead: () => void;
  onLoadStarter: () => void;
  onPassport: () => void;
  onOpenLead: (lead: StoredLead) => void;
}) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onOpenChange, open]);

  function run(action: () => void) {
    action();
    onOpenChange(false);
  }

  const activeLeads = leads.filter((lead) => !["Auftrag gewonnen", "Abgelehnt"].includes(lead.status)).slice(0, 10);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="WebWorkBalance Menü"
      description="Funktionen und Leads schnell öffnen"
      className="wwb-command-dialog border-white/10 bg-[#10141a] sm:max-w-2xl"
    >
      <CommandInput placeholder="Funktion oder Firma suchen …" />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>Keine passende Funktion oder Firma gefunden.</CommandEmpty>
        <CommandGroup heading="Direkt loslegen">
          <CommandItem onSelect={() => run(onNewLead)}><CirclePlus className="text-[#d7b56d]" /><span>Neuen Lead anlegen</span><CommandShortcut>N</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(onLoadStarter)}><BriefcaseBusiness className="text-[#75e5b7]" /><span>10 echte Start-Leads laden</span></CommandItem>
          <CommandItem onSelect={() => run(onPassport)}><Plane className="text-[#6fa8ff]" /><span>Passport-Ort auswählen</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("discover"))}><Radar className="text-[#52d6a0]" /><span>Firmen-Radar starten</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("regional"))}><List className="text-[#6fa8ff]" /><span>Regional-Liste Nürnberg öffnen</span></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Alle Bereiche">
          <CommandItem onSelect={() => run(() => onNavigate("today"))}><LayoutDashboard /><span>Heute &amp; nächste Schritte</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("discover"))}><Radar /><span>Entdecken &amp; Recherche</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("regional"))}><List /><span>Regional-Liste Nürnberg &amp; Landkreis</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("map"))}><Map /><span>Kartenansicht</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("leads"))}><BriefcaseBusiness /><span>Lead-Pipeline</span><CommandShortcut>{leads.length}</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("team"))}><UsersRound /><span>Team-Notizen &amp; Zuständigkeiten</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("tasks"))}><ListTodo /><span>Aufgaben</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("pricing"))}><Calculator /><span>Preisliste &amp; Kalkulator</span></CommandItem>
          <CommandItem onSelect={() => run(() => onNavigate("settings"))}><Settings2 /><span>Einstellungen</span></CommandItem>
        </CommandGroup>
        {activeLeads.length > 0 && <>
          <CommandSeparator />
          <CommandGroup heading="Leads direkt öffnen">
            {activeLeads.map((lead) => (
              <CommandItem key={lead.id} value={`${lead.name} ${lead.category} ${lead.address}`} onSelect={() => run(() => onOpenLead(lead))}>
                <Building2 />
                <span className="min-w-0 flex-1"><strong className="block truncate font-medium">{lead.name}</strong><span className="block truncate text-xs text-muted-foreground">{lead.category} · {lead.status}</span></span>
                {lead.claimedByName && <CommandShortcut>{lead.claimedByName}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        </>}
      </CommandList>
    </CommandDialog>
  );
}
