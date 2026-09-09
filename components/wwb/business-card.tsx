"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUp, Bookmark, ChevronRight, Globe2, Mail, MapPin, Phone, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateLeadScore,
  packageForBusiness,
  websiteStatusLabel,
  type Business,
  type PriceSettings,
} from "../../lib/webworkbalance";
import { BusinessVisual } from "./business-visual";

export type SwipeAction = "save" | "skip" | "priority";

export function BusinessCard({
  business,
  prices,
  onDetails,
  onDecision,
}: {
  business: Business;
  prices: PriceSettings;
  onDetails: () => void;
  onDecision: (action: SwipeAction) => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const score = calculateLeadScore(business);
  const offer = packageForBusiness(business, prices);
  const missing = business.websiteStatus !== "exists";

  function pointerDown(event: ReactPointerEvent<HTMLElement>) {
    // Buttons and links must keep their native click behavior. Capturing their
    // pointer stream on the swipe surface can otherwise swallow mouse/touch
    // actions before the button's onClick handler runs.
    if (event.target instanceof Element && event.target.closest("button,a,input,textarea,select")) return;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  }

  function pointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!start.current) return;
    setDrag({ x: event.clientX - start.current.x, y: Math.min(0, event.clientY - start.current.y), active: true });
  }

  function pointerUp() {
    const { x, y } = drag;
    start.current = null;
    setDrag({ x: 0, y: 0, active: false });
    if (y < -90 && Math.abs(y) > Math.abs(x)) return onDecision("priority");
    if (x > 90) return onDecision("save");
    if (x < -90) return onDecision("skip");
  }

  return (
    <article
      className={`business-card glass-panel relative w-full max-w-[530px] overflow-hidden rounded-[2rem] ${drag.active ? "is-dragging" : ""}`}
      style={{ "--drag-x": `${drag.x}px`, "--drag-y": `${drag.y}px` } as CSSProperties}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      <BusinessVisual business={business} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight">{business.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{business.address}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-[#d7b56d]/20 bg-[#d7b56d]/10 px-3 py-2 text-center">
            <strong className="block text-xl text-[#efd28e]">{score}</strong>
            <span className="text-[11px] uppercase tracking-wider text-[#d7b56d]/70">Score</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className={missing ? "border-[#52d6a0]/25 bg-[#52d6a0]/10 text-[#75e5b7]" : "border-[#6fa8ff]/25 bg-[#6fa8ff]/10 text-[#9fc1ff]"} variant="outline">
            <Globe2 className="mr-1 size-3.5" /> {websiteStatusLabel[business.websiteStatus]}
          </Badge>
          <Badge variant="outline" className="border-white/10 bg-white/[.04] text-foreground/80">{business.distanceKm.toLocaleString("de-DE")} km</Badge>
          <Badge variant="outline" className="border-white/10 bg-white/[.04] text-foreground/80">{offer.name} · {offer.price.toLocaleString("de-DE")} €</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <div className={`flex items-center gap-2 rounded-xl border p-3 ${business.phone ? "border-white/10 bg-white/[.035]" : "border-white/5 text-muted-foreground"}`}>
            <Phone className="size-4" /> <span className="truncate">{business.phone ?? "Keine Nummer"}</span>
          </div>
          <div className={`flex items-center gap-2 rounded-xl border p-3 ${business.email ? "border-white/10 bg-white/[.035]" : "border-white/5 text-muted-foreground"}`}>
            <Mail className="size-4" /> <span className="truncate">{business.email ?? "Keine E-Mail"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onDetails}
          className="mt-4 flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-sm text-muted-foreground transition hover:text-foreground"
        >
          <span>Details, Recherche und Website-Konzept</span><ChevronRight className="size-4" />
        </button>

        <div className="mt-2 flex items-center justify-center gap-3" aria-label="Unternehmen bewerten">
          <Button type="button" variant="outline" size="icon" className="size-13 rounded-full border-[#ff6677]/25 bg-[#ff6677]/8 text-[#ff8290] hover:bg-[#ff6677]/15" onClick={() => onDecision("skip")} aria-label="Überspringen">
            <X className="size-6" />
          </Button>
          <Button type="button" variant="outline" size="icon" className="size-11 rounded-full border-[#6fa8ff]/20 bg-[#6fa8ff]/8 text-[#8db8ff] hover:bg-[#6fa8ff]/15" onClick={() => onDecision("priority")} aria-label="Als Top-Lead speichern">
            <ArrowUp className="size-5" />
          </Button>
          <Button type="button" size="icon" className="size-13 rounded-full bg-[#d7b56d] text-[#080b0f] shadow-[0_0_35px_rgba(215,181,109,.22)] hover:bg-[#e6c77f]" onClick={() => onDecision("save")} aria-label="Als Lead speichern">
            <Bookmark className="size-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
