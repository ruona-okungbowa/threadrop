"use client";

import { useEffect, useState } from "react";
import { useCart, SHIPPING_PER_BRAND_PENCE } from "@/lib/cart-context";
import { formatPrice } from "@/lib/feed-data";
import { CartTicket, type CartOrder } from "./cart-ticket";

export function CartDrawer() {
  const cart = useCart();
  const { open, setOpen } = cart;
  const [order, setOrder] = useState<CartOrder | null>(null);
  const [placing, setPlacing] = useState(false);

  // lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // reset the confirmation when reopened with items
  useEffect(() => {
    if (open && cart.count > 0) setOrder(null);
  }, [open, cart.count]);

  if (!open) return null;

  function placeOrder() {
    setPlacing(true);
    // snapshot the order before clearing the cart, so the ticket can render it
    const snapshot: CartOrder = {
      orderNo: 1000 + Math.floor(Math.random() * 8999),
      groups: cart.groups,
      count: cart.count,
      brandCount: cart.brandCount,
      totalPence: cart.totalPence,
      currency: cart.currency,
    };
    window.setTimeout(() => {
      setPlacing(false);
      setOrder(snapshot);
      cart.clear();
    }, 950);
  }

  const empty = cart.count === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => setOpen(false)}
        className="backdrop-in absolute inset-0 cursor-default bg-foreground/55"
      />

      <div className="drawer-panel relative flex h-full w-full flex-col border-l border-border bg-background shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)] sm:max-w-md">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
            {order ? "Order placed" : "Your cart"}
            {!order && !empty && (
              <span className="ml-2 text-subtle">
                {cart.count} {cart.count === 1 ? "piece" : "pieces"} ·{" "}
                {cart.brandCount}{" "}
                {cart.brandCount === 1 ? "label" : "labels"}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint transition-colors hover:text-foreground"
          >
            Close
          </button>
        </div>

        {order ? (
          <CartTicket order={order} onClose={() => setOpen(false)} />
        ) : empty ? (
          <EmptyState onClose={() => setOpen(false)} />
        ) : (
          <>
            {/* items grouped by brand */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-8">
                {cart.groups.map((g) => (
                  <section key={g.brandSlug} className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between border-b border-border pb-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
                        {g.brand}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-subtle">
                        {formatPrice(g.subtotalPence, cart.currency)}
                      </span>
                    </div>

                    {g.items.map((it) => (
                      <div key={it.lineId} className="flex gap-4">
                        <div
                          className="h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius)]"
                          style={{ backgroundColor: it.drop.image.tone }}
                        >
                          <img
                            src={it.drop.image.src || "/placeholder.svg"}
                            alt={`${it.drop.brand} — ${it.drop.title}`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate font-serif text-lg leading-tight">
                              {it.drop.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => cart.remove(it.slug, it.size)}
                              aria-label={`Remove ${it.drop.title}`}
                              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-accent"
                            >
                              Remove
                            </button>
                          </div>
                          <span className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                            Size {it.size}
                          </span>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            <QtyStepper
                              qty={it.qty}
                              onDec={() =>
                                cart.setQty(it.slug, it.size, it.qty - 1)
                              }
                              onInc={() =>
                                cart.setQty(it.slug, it.size, it.qty + 1)
                              }
                            />
                            <span className="font-mono text-sm tabular-nums text-foreground">
                              {formatPrice(it.linePence, cart.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </div>

            {/* totals + checkout */}
            <div className="border-t border-border px-6 py-5">
              <div className="flex flex-col gap-2 font-mono text-sm">
                <Row
                  label="Subtotal"
                  value={formatPrice(cart.subtotalPence, cart.currency)}
                />
                <Row
                  label={`Shipping · ${cart.brandCount} ${
                    cart.brandCount === 1 ? "parcel" : "parcels"
                  }`}
                  value={formatPrice(cart.shippingPence, cart.currency)}
                />
                <div className="my-1 h-px w-full bg-border" />
                <Row
                  label="Total"
                  value={formatPrice(cart.totalPence, cart.currency)}
                  emphasize
                />
              </div>

              <p className="mt-3 font-mono text-[11px] leading-relaxed text-faint">
                Each label ships separately —{" "}
                {formatPrice(SHIPPING_PER_BRAND_PENCE, cart.currency)} per
                parcel. Pieces are reserved while you check out.
              </p>

              <button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="mt-4 w-full rounded-[var(--radius)] bg-accent py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.985] disabled:opacity-70"
              >
                {placing
                  ? "Placing order…"
                  : `Check out — ${formatPrice(cart.totalPence, cart.currency)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QtyStepper({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border">
      <button
        type="button"
        onClick={onDec}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center font-mono text-sm text-subtle transition-colors hover:text-foreground active:scale-90"
      >
        −
      </button>
      <span className="min-w-4 text-center font-mono text-sm tabular-nums text-foreground">
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center font-mono text-sm text-subtle transition-colors hover:text-foreground active:scale-90"
      >
        +
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={`text-[11px] uppercase tracking-[0.14em] ${
          emphasize ? "text-foreground" : "text-subtle"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          emphasize ? "text-base text-foreground" : "text-subtle"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-6 pb-16">
      <h2 className="font-serif text-3xl font-light leading-tight tracking-tight">
        Your cart is empty.
      </h2>
      <p className="mt-4 max-w-xs font-mono text-sm leading-relaxed text-subtle">
        Add pieces from any live drop — mix labels freely, check out once.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-7 rounded-[var(--radius)] bg-foreground px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.985]"
      >
        Browse drops
      </button>
    </div>
  );
}


