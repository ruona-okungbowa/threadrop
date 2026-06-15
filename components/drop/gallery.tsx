"use client";

import { useState } from "react";
import type { Drop } from "@/lib/drop-data";

export function Gallery({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const hero = drop.gallery[active] ?? drop.gallery[0];
  // hero is index 0; the 3 smaller shots (detail, on-body, scale) sit below
  const thumbs = drop.gallery.slice(1);

  return (
    <div className="flex flex-col gap-5">
      {/* Cinematic hero — taller, edge-to-edge, the emotional centerpiece.
          Hover invites inspection: crosshair cursor + a slow, weighty zoom. */}
      <figure
        className="group relative aspect-[4/5] w-full cursor-crosshair overflow-hidden rounded-[var(--radius)]"
        style={{ backgroundColor: hero.tone }}
      >
        <img
          src={hero.src || "/placeholder.svg"}
          alt={`${drop.title} — ${hero.label}`}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.12]"
        />
        <figcaption className="pointer-events-none absolute bottom-4 left-4 rounded-[var(--radius)] bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle backdrop-blur-sm">
          {hero.label}
        </figcaption>
      </figure>

      {/* Considered gallery strip — its own intentional row with real breathing room */}
      <div className="grid grid-cols-3 gap-3">
        {thumbs.map((shot, i) => {
          const idx = i + 1;
          const isActive = active === idx;
          return (
            <button
              key={shot.label}
              type="button"
              onClick={() => setActive(isActive ? 0 : idx)}
              aria-label={`View ${shot.label} image`}
              aria-pressed={isActive}
              className={`group relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)] ring-1 transition-all duration-200 ease-out ${
                isActive
                  ? "opacity-100 ring-foreground"
                  : "opacity-70 ring-transparent hover:opacity-100"
              }`}
              style={{ backgroundColor: shot.tone }}
            >
              <img
                src={shot.src || "/placeholder.svg"}
                alt={`${drop.title} — ${shot.label}`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 rounded-[var(--radius)] bg-background/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-subtle backdrop-blur-sm">
                {shot.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
