"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamChatPanel, useTeamChatUnread } from "./team-chat-panel";
import type { AppUser, TeamChatMessage } from "@/lib/webworkbalance";

export function TeamChatBubble({ currentUser, messages, live, hidden, onSend, onDelete }: {
  currentUser: AppUser;
  messages: TeamChatMessage[];
  live: boolean;
  hidden: boolean;
  onSend: (body: string) => Promise<void>;
  onDelete: (message: TeamChatMessage) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const unread = useTeamChatUnread(currentUser.id, messages);
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const fit = () => {
      if (!sheetRef.current) return;
      sheetRef.current.style.height = `${viewport.height}px`;
      sheetRef.current.style.top = `${viewport.offsetTop}px`;
    };
    const frame = requestAnimationFrame(fit);
    viewport.addEventListener("resize", fit);
    viewport.addEventListener("scroll", fit);
    return () => { cancelAnimationFrame(frame); viewport.removeEventListener("resize", fit); viewport.removeEventListener("scroll", fit); };
  }, [open]);
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <button type="button" className={`wwb-chat-bubble fixed z-40 ${hidden ? "hidden" : "flex"} size-14 items-center justify-center rounded-full border border-[#b4f6d8]/30 bg-[#52d6a0] text-[#07120d] shadow-[0_8px_30px_rgba(0,0,0,.4)] transition hover:bg-[#75e5b7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#75e5b7]`} aria-label={`Team-Chat öffnen${unread ? `, ${unread} ungelesene Nachrichten` : ""}`}>
        <MessageCircle className="size-6" />
        {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#080b0f] bg-[#efd28e] px-1 text-xs font-bold">{unread > 99 ? "99+" : unread}</span>}
      </button>
    </SheetTrigger>
    <SheetContent ref={sheetRef} showCloseButton={false} className="wwb-chat-sheet w-full max-w-full gap-0 border-[#52d6a0]/20 bg-[#10141a] sm:max-w-md" onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus(); }}>
      <SheetHeader className="safe-top shrink-0 border-b border-white/10 p-5 pr-16">
        <SheetTitle ref={titleRef} tabIndex={-1} className="flex items-center gap-2 outline-none"><MessageCircle className="size-5 text-[#75e5b7]" /> Team-Chat</SheetTitle>
        <SheetDescription>{live ? "Mit eurem Team-Chat synchronisiert." : "Verbindung wird geprüft. Nachrichten bleiben erhalten."}</SheetDescription>
      </SheetHeader>
      <SheetClose className="absolute right-3 top-[max(.75rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-xl hover:bg-white/10" aria-label="Team-Chat schließen"><X className="size-5" /></SheetClose>
      <TeamChatPanel currentUser={currentUser} messages={messages} onSend={onSend} onDelete={onDelete} compact draft={draft} onDraftChange={setDraft} />
    </SheetContent>
  </Sheet>;
}
