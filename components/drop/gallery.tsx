"use client";

import { useState } from "react";
import type { Drop } from "@/lib/drop-data";

export function Gallery({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const hero = drop.gallery[active] ?? drop.gallery[0];
  // hero is index 0; the 3 smaller shots (detail, on-body, scale) sit below
  const thumbs = drop.gallery.slice(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Full-bleed hero */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)] border border-border"
        style={{ backgroundColor: hero.tone }}
      >
        <span className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
          {hero.label}
        </span>
        <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          {drop.currency === "£" ? "1600 × 2000" : ""}
        </span>
      </div>

      {/* Thumbnails: detail, on-body, scale */}
      <div className="grid grid-cols-3 gap-3">
        {thumbs.map((shot, i) => {
          const idx = i + 1;
          return (
          <button
            key={shot.label}
            type="button"
            onClick={() => setActive(active === idx ? 0 : idx)}
            aria-label={`View ${shot.label} image`}
            aria-pressed={active === idx}
            className={`group relative aspect-square w-full overflow-hidden rounded-[var(--radius)] border transition-all duration-200 ease-out ${
              active === idx
                ? "border-foreground"
                : "border-border hover:border-subtle"
            }`}
            style={{ backgroundColor: shot.tone }}
          >
            <span className="absolute left-2.5 bottom-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle transition-colors duration-200 group-hover:text-foreground">
              {shot.label}
            </span>
          </button>
          );
        })}
      </div>
    </div>
  );
}
