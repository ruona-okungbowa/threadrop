"use client";

import { useCart } from "@/lib/cart-context";

export function CartButton({
  className = "",
}: {
  className?: string;
}) {
  const { count, setOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className={`group relative inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70 ${className}`}
    >
      <span>Cart</span>
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] tabular-nums transition-colors duration-200 ${
          count > 0
            ? "bg-accent text-accent-foreground"
            : "bg-muted-2 text-subtle"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
