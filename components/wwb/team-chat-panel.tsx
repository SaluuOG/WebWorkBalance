"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowDown, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mergeChatReadIds, parseChatReadIds, unreadChatCount } from "@/lib/team-chat-read";
import type { AppUser, TeamChatMessage } from "@/lib/webworkbalance";

const READ_EVENT = "wwb-chat-read";
const memory = new Map<string, string>();
const storageKey = (userId: string) => `wwb-chat-read-v1:${userId}`;

function readSnapshot(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return window.localStorage.getItem(key) || memory.get(key) || "[]"; }
  catch { return memory.get(key) || "[]"; }
}

function markRead(userId: string, ids: string[]) {
  const key = storageKey(userId);
  const previous = readSnapshot(key);
  const next = JSON.stringify(mergeChatReadIds(parseChatReadIds(previous), ids));
  if (next === previous) return;
  try { window.localStorage.setItem(key, next); memory.delete(key); }
  catch { memory.set(key, next); }
  window.dispatchEvent(new CustomEvent(READ_EVENT, { detail: key }));
}

export function useTeamChatUnread(userId: string, messages: TeamChatMessage[]) {
  const key = storageKey(userId);
  const subscribe = useCallback((notify: () => void) => {
    const onLocal = (event: Event) => { if ((event as CustomEvent<string>).detail === key) notify(); };
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) { memory.delete(key); notify(); } };
    window.addEventListener(READ_EVENT, onLocal);
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener(READ_EVENT, onLocal); window.removeEventListener("storage", onStorage); };
  }, [key]);
  const getSnapshot = useCallback(() => readSnapshot(key), [key]);
  const serialized = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return unreadChatCount(messages, userId, parseChatReadIds(serialized));
}

export function TeamChatPanel({ currentUser, messages, onSend, onDelete, compact = false, draft, onDraftChange }: {
  currentUser: AppUser;
  messages: TeamChatMessage[];
  onSend: (body: string) => Promise<void>;
  onDelete: (message: TeamChatMessage) => Promise<void>;
  compact?: boolean;
  draft?: string;
  onDraftChange?: (value: string) => void;
}) {
  const [localBody, setLocalBody] = useState("");
  const body = draft ?? localBody;
  const setBody = onDraftChange ?? setLocalBody;
  const [saving, setSaving] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef(true);
  const sendingRef = useRef(false);
  const messageIdsRef = useRef<string[]>([]);
  const userIdRef = useRef(currentUser.id);
  const canRead = () => document.visibilityState === "visible" && Boolean(listRef.current?.getClientRects().length) && !listRef.current?.closest('[aria-hidden="true"], [inert]');

  useEffect(() => {
    messageIdsRef.current = messages.map((message) => message.id);
    userIdRef.current = currentUser.id;
    const list = listRef.current;
    if (list && bottomRef.current) list.scrollTop = list.scrollHeight;
    if (list && bottomRef.current && canRead()) markRead(currentUser.id, messageIdsRef.current);
  }, [currentUser.id, messages]);

  useEffect(() => {
    const markVisible = () => {
      if (bottomRef.current && canRead()) markRead(userIdRef.current, messageIdsRef.current);
    };
    document.addEventListener("visibilitychange", markVisible);
    return () => document.removeEventListener("visibilitychange", markVisible);
  }, []);

  function reachBottom() {
    const list = listRef.current;
    if (!list) return;
    const reached = list.scrollHeight - list.scrollTop - list.clientHeight < 36;
    bottomRef.current = reached;
    setAtBottom(reached);
    if (reached && canRead()) markRead(currentUser.id, messages.map((message) => message.id));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSaving(true);
    try {
      await onSend(body.trim());
      setBody("");
      bottomRef.current = true;
      setAtBottom(true);
      requestAnimationFrame(() => { if (listRef.current) { listRef.current.scrollTop = listRef.current.scrollHeight; reachBottom(); } });
    } catch { /* The parent reports the failure; keep the draft for retry. */ }
    finally { sendingRef.current = false; setSaving(false); }
  }

  return <div className={`flex min-h-0 min-w-0 flex-col ${compact ? "flex-1" : ""}`}>
    <div ref={listRef} onScroll={reachBottom} role="log" aria-label="Team-Nachrichten" aria-live="polite" aria-relevant="additions text" className={`min-h-0 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-thin sm:px-5 ${compact ? "flex-1" : "h-[260px] sm:h-[390px]"}`}>
      {messages.map((message) => {
        const mine = message.authorId === currentUser.id;
        return <div key={message.id} className={`flex min-w-0 ${mine ? "justify-end" : "justify-start"}`}>
          <article className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3 ${mine ? "rounded-br-md bg-[#d7b56d] text-[#080b0f]" : "rounded-bl-md border border-white/[.08] bg-white/[.055]"}`}>
            <div className={`flex flex-wrap gap-x-2 gap-y-1 text-xs ${mine ? "text-[#080b0f]/65" : "text-muted-foreground"}`}><strong className="min-w-0 [overflow-wrap:anywhere]">{mine ? "Du" : message.authorName}</strong><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div>
            <p className="mt-1.5 whitespace-pre-wrap text-base leading-6 [overflow-wrap:anywhere]">{message.body}</p>
            {mine && <button type="button" onClick={() => void onDelete(message)} className="mt-1 min-h-8 text-xs underline-offset-2 hover:underline" aria-label="Chat-Nachricht löschen">Löschen</button>}
          </article>
        </div>;
      })}
      {!messages.length && <div className="flex min-h-40 flex-col items-center justify-center px-3 text-center"><MessageCircle className="size-8 text-[#75e5b7]" /><h4 className="mt-3 font-semibold">Startet euren Team-Chat</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">Für kurze Absprachen. Wichtige Arbeitsstände bleiben in den Team-Notizen.</p></div>}
    </div>
    {!atBottom && <button type="button" onClick={() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; reachBottom(); }} className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 py-2 text-sm text-[#75e5b7]"><ArrowDown className="size-4" /> Neueste Nachrichten</button>}
    <form onSubmit={submit} className="flex shrink-0 items-end gap-2 border-t border-white/[.07] bg-white/[.018] p-3">
      <Textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={2} maxLength={2000} disabled={saving} aria-label="Chat-Nachricht" placeholder="Nachricht an das Team …" className="min-h-11 min-w-0 flex-1 resize-none border-white/10 bg-black/15 text-base" />
      <Button type="submit" aria-label={saving ? "Nachricht wird gesendet" : "Nachricht senden"} className="size-11 shrink-0 bg-[#52d6a0] text-[#07120d] hover:bg-[#75e5b7]" disabled={saving || !body.trim()}><Send className="size-4" /></Button>
    </form>
  </div>;
}
