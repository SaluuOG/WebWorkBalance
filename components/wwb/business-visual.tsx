/* eslint-disable @next/next/no-img-element -- remote business imagery is optional and loaded directly. */
"use client";

import {
  BedDouble,
  BriefcaseBusiness,
  Car,
  Dumbbell,
  HeartPulse,
  Scissors,
  Store,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import type { Business } from "../../lib/webworkbalance";

const visuals = {
  retail: { Icon: Store, from: "#152032", to: "#0c121d" },
  gastro: { Icon: UtensilsCrossed, from: "#342015", to: "#11151b" },
  beauty: { Icon: Scissors, from: "#301c2b", to: "#11151b" },
  craft: { Icon: Wrench, from: "#26261a", to: "#11151b" },
  health: { Icon: HeartPulse, from: "#14302c", to: "#10151a" },
  professional: { Icon: BriefcaseBusiness, from: "#192640", to: "#10141b" },
  fitness: { Icon: Dumbbell, from: "#28203c", to: "#11141b" },
  auto: { Icon: Car, from: "#252b33", to: "#0d1116" },
  hotel: { Icon: BedDouble, from: "#2d2317", to: "#11151b" },
} as const;

export function BusinessVisual({ business, compact = false }: { business: Business; compact?: boolean }) {
  const visual = visuals[business.categoryKey as keyof typeof visuals] ?? visuals.retail;
  const Icon = visual.Icon;
  return (
    <div
      className={`relative overflow-hidden ${compact ? "h-24" : "h-52 sm:h-60"}`}
      style={{ background: `radial-gradient(circle at 78% 12%, rgba(215,181,109,.22), transparent 38%), linear-gradient(145deg, ${visual.from}, ${visual.to})` }}
    >
      {business.imageUrl ? (
        // External OSM image tags are accepted only for Wikimedia-hosted HTTPS assets by the server.
        <img src={business.imageUrl} alt={`Öffentliche Aufnahme zu ${business.name}`} className="h-full w-full object-cover opacity-80" />
      ) : (
        <>
          <div className="absolute -right-10 -top-12 size-48 rounded-full border border-[#d7b56d]/20" />
          <div className="absolute -right-2 top-5 size-28 rounded-full border border-[#d7b56d]/15" />
          <Icon className={`absolute bottom-5 right-6 text-[#f3d99c]/85 ${compact ? "size-10" : "size-16"}`} strokeWidth={1.25} />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold backdrop-blur-md">{business.category}</span>
        {business.isDemo && <span className="rounded-full bg-[#6fa8ff]/20 px-2.5 py-1 text-xs font-bold text-[#9fc1ff]">DEMO</span>}
      </div>
      {business.imageAttribution && <p className="absolute bottom-2 right-3 max-w-[75%] truncate text-[11px] text-white/60">{business.imageAttribution}</p>}
    </div>
  );
}
