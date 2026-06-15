"use client";

import { useState } from "react";
import type { BrandGroup } from "@/lib/cart-context";
import { formatPrice } from "@/lib/feed-data";

export interface CartOrder {
  orderNo: number;
  groups: BrandGroup[];
  count: number;
  brandCount: number;
  totalPence: number;
  currency: string;
}

const pad4 = (n: number) => n.toString().padStart(4, "0");

export function CartTicket({
  order,
  onClose,
}: {
  order: CartOrder;
  onClose: () => void;
}) {
  const [shared, setShared] = useState(false);

  // a flat list of every piece in the order, for the stub
  const pieces = order.groups.flatMap((g) =>
    g.items.map((it) => ({
      lineId: it.lineId,
      brand: g.brand,
      title: it.drop.title,
      size: it.size,
      qty: it.qty,
      image: it.drop.image,
    })),
  );

  async function handleShare() {
    const text = `Just took ${order.count} ${
      order.count === 1 ? "piece" : "pieces"
    } across ${order.brandCount} ${
      order.brandCount === 1 ? "label" : "labels"
    } on Threadrop. ORDER #${pad4(order.orderNo)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Threadrop", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* dismissed — no-op */
    }
  }

  return (
    <div className="ticket-in flex flex-1 flex-col overflow-y-auto px-6 py-7">
      {/* the ticket */}
      <div className="relative flex flex-col bg-foreground text-background">
        {/* top stub: the moment */}
        <div className="flex flex-col gap-7 px-7 pb-8 pt-9">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-background/60">
              {order.brandCount} {order.brandCount === 1 ? "label" : "labels"}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Confirmed
              </span>
            </span>
          </div>

          <h1 className="font-serif text-5xl font-light leading-[0.92] tracking-tight text-balance">
            You got the lot.
          </h1>

          {/* the haul — a stacked list of every piece */}
          <div className="flex flex-col gap-4">
            {pieces.map((p) => (
              <div key={p.lineId} className="flex items-center gap-4">
                <div
                  className="h-16 w-14 shrink-0 overflow-hidden rounded-[var(--radius)]"
                  style={{ backgroundColor: p.image.tone }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image.src || "/placeholder.svg"}
                    alt={`${p.brand} — ${p.title}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-serif text-lg leading-tight">
                    {p.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-background/55">
                    {p.brand} · Size {p.size}
                    {p.qty > 1 ? ` · ×${p.qty}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* perforation */}
        <div className="relative" aria-hidden="true">
          <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
          <div className="mx-7 border-t border-dashed border-background/30" />
        </div>

        {/* bottom stub: order IDs */}
        <div className="flex flex-col gap-6 px-7 pb-9 pt-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                Order
              </span>
              <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-background">
                #{pad4(order.orderNo)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                Parcels
              </span>
              <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-background">
                {order.brandCount}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                Paid
              </span>
              <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-accent">
                {formatPrice(order.totalPence, order.currency)}
              </span>
            </div>
          </div>

          <p className="font-mono text-[11px] leading-relaxed text-background/60">
            Each label is preparing its parcel. We&apos;ve emailed a
            confirmation — tracking follows for every shipment as it leaves the
            studio.
          </p>
        </div>
      </div>

      {/* affordances, outside the ticket */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleShare}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground underline-offset-4 transition-opacity duration-200 hover:opacity-60"
        >
          {shared ? "Copied to clipboard" : "Share the haul"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle transition-colors duration-200 hover:text-foreground"
        >
          Keep browsing
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
