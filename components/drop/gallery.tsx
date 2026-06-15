"use client";

import { useState } from "react";
import type { Drop } from "@/lib/drop-data";

export function Gallery({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const hero = drop.gallery[active] ?? drop.gallery[0];
  // hero is index 0; the 3 smaller shots (detail, on-body, scale) sit below
  const thumbs = drop.gallery.slice(1);

  return (
    <div className="flex flex-col gap-2">
      {/* Cinematic hero — taller, edge-to-edge, the emotional centerpiece */}
      <figure
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)]"
        style={{ backgroundColor: hero.tone }}
      >
        {/* soft directional light to make the void feel intentional, not empty */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,0.07), transparent 55%)",
          }}
        />
        <figcaption className="absolute bottom-5 left-5 font-mono text-[11px] uppercase tracking-[0.24em] text-faint">
          {hero.label}
        </figcaption>
      </figure>

      {/* Considered gallery strip — quieter, supporting the hero */}
      <div className="grid grid-cols-3 gap-2">
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
              className={`group relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)] transition-all duration-200 ease-out ${
                isActive ? "opacity-100" : "opacity-65 hover:opacity-100"
              }`}
              style={{ backgroundColor: shot.tone }}
            >
              <span className="absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint transition-colors duration-200 group-hover:text-subtle">
                {shot.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
