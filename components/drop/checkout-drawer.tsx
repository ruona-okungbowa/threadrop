"use client";

import { useEffect, useState } from "react";
import type { Drop, SizeKey } from "@/lib/drop-data";
import { formatPrice } from "@/lib/drop-data";
import { pad } from "./use-countdown";

export interface CheckoutDrawerProps {
  drop: Drop;
  size: SizeKey;
  /** ms remaining on the hold — ticked by the parent */
  remainingMs: number;
  open: boolean;
  /** close but keep the hold (backdrop / escape) */
  onClose: () => void;
  /** explicitly let the piece go back to the line */
  onRelease: () => void;
  /** payment succeeded */
  onPaid: (email: string) => void;
}

export function CheckoutDrawer({
  drop,
  size,
  remainingMs,
  open,
  onClose,
  onRelease,
  onPaid,
}: CheckoutDrawerProps) {
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);

  const expired = remainingMs <= 0;
  const totalPence = drop.pricePence + drop.shippingPence;

  const mins = Math.floor(remainingMs / 1000 / 60);
  const secs = Math.floor((remainingMs / 1000) % 60);
  const urgent = remainingMs > 0 && remainingMs <= 60_000;

  // lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // escape closes (keeps the hold)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (expired) return;
    setPaying(true);
    // simulated payment latency
    window.setTimeout(() => {
      setPaying(false);
      onPaid(email.trim());
    }, 900);
  }

  const hero = drop.gallery[0];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Checkout — ${drop.title}`}
    >
      {/* dimmed drop page behind */}
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        className="backdrop-in absolute inset-0 cursor-default bg-foreground/55"
      />

      {/* panel: bottom sheet on mobile, right drawer on >= sm */}
      <div className="drawer-panel relative flex h-full w-full flex-col overflow-y-auto border-l border-border bg-background shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)] sm:max-w-md">
        {/* hold timer — pinned, always in view */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {expired ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                Hold released
              </span>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    Held for you · size {size}
                  </span>
                </span>
                <span
                  className={`font-mono text-base tabular-nums text-accent ${
                    urgent ? "timer-urgent" : ""
                  }`}
                >
                  {mins}:{pad(secs)}
                </span>
              </>
            )}
          </div>
        </div>

        {expired ? (
          <ExpiredState onBack={onRelease} />
        ) : (
          <form onSubmit={handlePay} className="flex flex-1 flex-col px-6 pb-8 pt-7">
            <h2 className="font-serif text-3xl font-light leading-none tracking-tight">
              Checkout
            </h2>

            {/* one-line order summary */}
            <div className="mt-7 flex items-center gap-4 border-y border-border py-4">
              <div
                className="h-16 w-14 shrink-0 overflow-hidden rounded-[var(--radius)]"
                style={{ backgroundColor: hero?.tone }}
              >
                {hero?.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero.src || "/placeholder.svg"}
                    alt={drop.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-serif text-lg leading-tight">
                  {drop.title}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                  Size {size} · {formatPrice(drop.pricePence, drop.currency)}
                </span>
              </div>
            </div>

            {/* costs, shown in full before the button */}
            <div className="mt-6 flex flex-col gap-2 font-mono text-sm">
              <CostRow
                label="Piece"
                value={formatPrice(drop.pricePence, drop.currency)}
              />
              <CostRow
                label="Shipping"
                value={formatPrice(drop.shippingPence, drop.currency)}
              />
              <div className="my-1 h-px w-full bg-border" />
              <CostRow
                label="Total"
                value={formatPrice(totalPence, drop.currency)}
                emphasize
              />
            </div>

            {/* guest-first email */}
            <div className="mt-8 flex flex-col gap-2">
              <label
                htmlFor="checkout-email"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle"
              >
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="h-12 rounded-[var(--radius)] border border-border bg-muted px-4 font-mono text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-faint focus:border-foreground"
              />
              <p className="font-mono text-[11px] leading-relaxed text-faint">
                No account needed — we&apos;ll email your confirmation.
              </p>
            </div>

            {/* simulated payment */}
            <div className="mt-7 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="card-number"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle"
                >
                  Card
                </label>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  (simulated for demo)
                </span>
              </div>
              <div className="flex flex-col rounded-[var(--radius)] border border-border bg-muted">
                <input
                  id="card-number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="h-12 rounded-t-[var(--radius)] bg-transparent px-4 font-mono text-sm tabular-nums text-foreground outline-none placeholder:text-faint focus:bg-muted-2/50"
                />
                <div className="flex border-t border-border">
                  <input
                    inputMode="numeric"
                    placeholder="MM / YY"
                    className="h-12 flex-1 bg-transparent px-4 font-mono text-sm tabular-nums text-foreground outline-none placeholder:text-faint focus:bg-muted-2/50"
                  />
                  <input
                    inputMode="numeric"
                    placeholder="CVC"
                    className="h-12 w-24 border-l border-border bg-transparent px-4 font-mono text-sm tabular-nums text-foreground outline-none placeholder:text-faint focus:bg-muted-2/50"
                  />
                </div>
              </div>
            </div>

            {/* primary action */}
            <button
              type="submit"
              disabled={paying}
              className="mt-8 w-full rounded-[var(--radius)] bg-accent py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.985] disabled:opacity-70"
            >
              {paying ? "Taking payment…" : `Pay ${formatPrice(totalPence, drop.currency)}`}
            </button>

            {/* quiet escape */}
            <button
              type="button"
              onClick={onRelease}
              className="mx-auto mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-faint underline-offset-4 transition-colors duration-200 hover:text-subtle hover:underline"
            >
              Release hold
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CostRow({
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

function ExpiredState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 pb-12 pt-10">
      <h2 className="font-serif text-4xl font-light leading-[0.95] tracking-tight text-balance">
        Your hold expired.
      </h2>
      <p className="mt-5 max-w-xs font-mono text-sm leading-relaxed text-subtle">
        The piece went back to the line. Holds are first-come — if stock&apos;s
        left, you can try for it again.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-8 w-fit rounded-[var(--radius)] bg-foreground px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.985]"
      >
        Back to the drop
      </button>
    </div>
  );
}
