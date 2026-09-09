"use client";

import { LocateFixed, Plane, Radar, Target } from "lucide-react";
import type { Business, SearchCenter } from "../../lib/webworkbalance";

export function RadarPanel({
  center,
  radiusKm,
  businesses,
  onSelect,
}: {
  center: SearchCenter;
  radiusKm: number;
  businesses: Business[];
  onSelect: (business: Business) => void;
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d7b56d]">Live-Radar</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {center.passport ? <Plane className="size-3.5" /> : <LocateFixed className="size-3.5" />}
            <span className="max-w-44 truncate">{center.name}</span>
          </p>
        </div>
        <div className="rounded-xl bg-white/[.04] px-3 py-2 text-right">
          <strong className="block text-sm">{radiusKm} km</strong>
          <span className="text-[11px] text-muted-foreground">Radius</span>
        </div>
      </div>

      <div className="radar-grid radar-sweep relative mx-auto aspect-square w-full max-w-[290px] overflow-hidden rounded-full border border-[#d7b56d]/20 bg-[#0a0e13]">
        <div className="radar-ring inset-[18%]" />
        <div className="radar-ring inset-[35%]" />
        <div className="absolute inset-x-0 top-1/2 border-t border-[#d7b56d]/10" />
        <div className="absolute inset-y-0 left-1/2 border-l border-[#d7b56d]/10" />
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d7b56d] p-2 text-[#080b0f] shadow-[0_0_30px_rgba(215,181,109,.4)]">
          <Radar className="size-4" />
        </div>
        {businesses.slice(0, 9).map((business, index) => {
          const angle = Math.atan2(business.lat - center.lat, business.lon - center.lon);
          const distanceRatio = Math.min(0.88, Math.max(0.18, business.distanceKm / Math.max(radiusKm, 1)));
          const left = 50 + Math.cos(angle) * distanceRatio * 43;
          const top = 50 - Math.sin(angle) * distanceRatio * 43;
          return (
            <button
              type="button"
              key={business.id}
              onClick={() => onSelect(business)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30 ${index === 0 ? "pulse-dot size-3.5 bg-[#52d6a0]" : "size-2.5 bg-[#d7b56d]"}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-label={`${business.name}, ${business.distanceKm} Kilometer entfernt`}
              title={business.name}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/5 bg-white/[.025] p-3">
          <Target className="mb-2 size-4 text-[#52d6a0]" />
          <strong className="block text-xl">{businesses.length}</strong>
          <span className="text-xs text-muted-foreground">im Kartenstapel</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[.025] p-3">
          <span className="mb-2 block size-2 rounded-full bg-[#d7b56d]" />
          <strong className="block text-xl">{businesses.filter((b) => !b.website).length}</strong>
          <span className="text-xs text-muted-foreground">ohne Website-Eintrag</span>
        </div>
      </div>
    </section>
  );
}
