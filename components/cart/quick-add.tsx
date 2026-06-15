"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { FeedDrop } from "@/lib/feed-data";

export function QuickAdd({ drop }: { drop: FeedDrop }) {
  const cart = useCart();
  const [picking, setPicking] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const singleSize = drop.sizes.length === 1;

  function addSize(size: FeedDrop["sizes"][number]) {
    cart.add(drop.slug, size);
    setPicking(false);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  if (justAdded) {
    return (
      <div className="flex h-9 items-center justify-center rounded-[var(--radius)] border border-accent/40 bg-accent/10 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        Added to cart
      </div>
    );
  }

  if (picking && !singleSize) {
    return (
      <div className="flex items-center gap-1.5">
        {drop.sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => addSize(s)}
            className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius)] border border-border font-mono text-[11px] tabular-nums text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:scale-95"
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPicking(false)}
          aria-label="Cancel"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] font-mono text-sm text-faint transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (singleSize ? addSize(drop.sizes[0]) : setPicking(true))}
      className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius)] border border-border font-mono text-[10px] uppercase tracking-[0.2em] text-foreground transition-all duration-200 ease-out hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.98]"
    >
      Add to cart
      <span aria-hidden>+</span>
    </button>
  );
}
