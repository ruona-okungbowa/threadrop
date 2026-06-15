"use client";

import { useEffect, useMemo, useState } from "react";
import type { Drop, SizeKey } from "@/lib/drop-data";
import { formatPrice } from "@/lib/drop-data";
import { Countdown } from "./countdown";
import { pad } from "./use-countdown";
import { CheckoutDrawer } from "./checkout-drawer";
import { OrderTicket, type Claim } from "./order-ticket";

type Phase = "PRELAUNCH" | "LIVE" | "ENDED";
const HOLD_MS = 1000 * 60 * 10; // 10 minute hold

export function BuyBox({ drop }: { drop: Drop }) {
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<SizeKey | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [heldSize, setHeldSize] = useState<SizeKey | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);

  // global one-second tick so derived phase + hold timer stay live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = useMemo(
    () => drop.sizes.reduce((sum, s) => sum + s.stock, 0),
    [drop.sizes],
  );

  const phase: Phase =
    now < drop.startsAt ? "PRELAUNCH" : now < drop.endsAt ? "LIVE" : "ENDED";

  const soldOut = remaining === 0;
  const claimed = drop.initialStock - remaining;
  const pct = Math.round((remaining / drop.initialStock) * 100);
  const lowStock = remaining > 0 && remaining <= drop.initialStock * 0.3;

  const holdRemaining =
    holdExpiresAt != null ? Math.max(0, holdExpiresAt - now) : 0;
  const isHeld = holdExpiresAt != null && holdRemaining > 0;

  // release the hold once it expires
  useEffect(() => {
    if (holdExpiresAt != null && now >= holdExpiresAt) {
      setHoldExpiresAt(null);
      setHeldSize(null);
    }
  }, [now, holdExpiresAt]);

  const totalPence = drop.pricePence + drop.shippingPence;

  function startHold() {
    if (!selected) return;
    setHeldSize(selected);
    setHoldExpiresAt(Date.now() + HOLD_MS);
  }

  function releaseHold() {
    setHoldExpiresAt(null);
    setHeldSize(null);
    setCheckoutOpen(false);
  }

  function handlePaid(email: string) {
    setCheckoutOpen(false);
    setClaim({
      dropNo: 42,
      claimId: 7000 + Math.floor(Math.random() * 2999),
      pieceNo: claimed + 1,
      size: heldSize ?? selected ?? "M",
      email,
    });
  }

  // the reward replaces the page entirely
  if (claim) {
    return <OrderTicket drop={drop} claim={claim} />;
  }

  if (soldOut || phase === "ENDED") {
    return <SoldOut drop={drop} claimed={claimed} />;
  }

  return (
    <div className="flex flex-col">
      {/* ── HERO ZONE: the title wins. Brand eyebrow, dominant display serif,
          edition + a quiet status/countdown line in support. ── */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          {drop.brand} — 1 of {drop.initialStock}
        </span>
        <h1 className="font-serif text-[3.75rem] font-light leading-[0.9] tracking-[-0.02em] text-balance md:text-7xl">
          {drop.title}
        </h1>
        <p className="font-mono text-sm leading-relaxed text-subtle">
          {drop.edition}
        </p>
        <div className="mt-1">
          <Countdown
            startsAt={drop.startsAt}
            endsAt={drop.endsAt}
            phase={phase}
          />
        </div>
      </div>

      {/* ── PRICE + SCARCITY: one tight unit, set off by a generous void ── */}
      <div className="mt-14 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-2xl tabular-nums text-foreground">
            {formatPrice(drop.pricePence, drop.currency)}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            incl. VAT
          </span>
        </div>
        <StockBar
          remaining={remaining}
          total={drop.initialStock}
          pct={pct}
          low={lowStock}
        />
      </div>

      {/* ── CHOICE + COST: size row and breakdown belong together ── */}
      <div className="mt-14 flex flex-col gap-6">
        <SizeSelector
          drop={drop}
          selected={selected}
          onSelect={setSelected}
          disabled={isHeld}
        />
        <div className="flex flex-col gap-2 font-mono text-sm">
          <Row
            label="Piece"
            value={formatPrice(drop.pricePence, drop.currency)}
          />
          <Row
            label="Shipping"
            value={formatPrice(drop.shippingPence, drop.currency)}
          />
          <div className="my-1 h-px w-full bg-border" />
          <Row
            label="Total today"
            value={formatPrice(totalPence, drop.currency)}
            emphasize
          />
        </div>
      </div>

      {/* ── THE ACTION: the one clear move on the page ── */}
      <div className="mt-6 flex flex-col gap-3">
        {isHeld ? (
          <HeldState
            size={heldSize}
            remainingMs={holdRemaining}
            currency={drop.currency}
            totalPence={totalPence}
            onCheckout={() => setCheckoutOpen(true)}
          />
        ) : (
          <button
            type="button"
            onClick={startHold}
            disabled={!selected}
            className="group relative w-full overflow-hidden rounded-[var(--radius)] bg-foreground py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-muted-2 disabled:text-faint disabled:active:scale-100"
          >
            {selected ? `Hold size ${selected}` : "Select a size"}
          </button>
        )}
        <p className="font-mono text-[11px] leading-relaxed text-faint">
          A hold reserves your piece for 10 minutes while you check out. One hold
          per person. When it expires, the line moves.
        </p>
      </div>

      <div className="mt-14">
        <Specs items={drop.specs} />
      </div>

      {heldSize && (
        <CheckoutDrawer
          drop={drop}
          size={heldSize}
          remainingMs={holdRemaining}
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onRelease={releaseHold}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}

function StockBar({
  remaining,
  total,
  pct,
  low,
}: {
  remaining: number;
  total: number;
  pct: number;
  low: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className={low ? "text-accent" : "text-foreground"}>
          {remaining} of {total} left
        </span>
        <span className="tabular-nums text-faint">{total - remaining} claimed</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted-2">
        <div
          className={`stock-fill h-full rounded-full ${
            low ? "bg-accent" : "bg-foreground"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SizeSelector({
  drop,
  selected,
  onSelect,
  disabled,
}: {
  drop: Drop;
  selected: SizeKey | null;
  onSelect: (s: SizeKey) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
          Size
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Unisex
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {drop.sizes.map(({ size, stock }) => {
          const out = stock === 0;
          const isSel = selected === size;
          return (
            <button
              key={size}
              type="button"
              disabled={out || disabled}
              aria-pressed={isSel}
              onClick={() => onSelect(size)}
              className={`relative flex h-12 items-center justify-center rounded-[var(--radius)] border font-mono text-sm tabular-nums transition-all duration-200 ease-out ${
                out
                  ? "cursor-not-allowed border-border text-faint line-through decoration-faint"
                  : isSel
                    ? "size-selected z-10 -translate-y-0.5 border-foreground bg-foreground font-medium text-background shadow-[0_6px_16px_-6px_rgba(26,25,22,0.5)]"
                    : "border-border text-foreground hover:-translate-y-0.5 hover:border-foreground active:translate-y-0 active:scale-95 disabled:hover:translate-y-0 disabled:hover:border-border"
              }`}
            >
              {size}
              {isSel && (
                <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeldState({
  size,
  remainingMs,
  currency,
  totalPence,
  onCheckout,
}: {
  size: SizeKey | null;
  remainingMs: number;
  currency: string;
  totalPence: number;
  onCheckout: () => void;
}) {
  const mins = Math.floor(remainingMs / 1000 / 60);
  const secs = Math.floor((remainingMs / 1000) % 60);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-[var(--radius)] border border-accent/40 bg-accent/10 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          Held for you — size {size}
        </span>
        <span className="font-mono text-sm tabular-nums text-accent">
          {mins}:{pad(secs)}
        </span>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        className="w-full rounded-[var(--radius)] bg-accent py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.985]"
      >
        Check out — {formatPrice(totalPence, currency)}
      </button>
    </div>
  );
}

function SoldOut({ drop, claimed }: { drop: Drop; claimed: number }) {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState("");
  const queuePos = 27;

  return (
    <div className="flex flex-col gap-8">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        <span className="h-1.5 w-1.5 rounded-full bg-faint" />
        Drop closed
      </span>

      <div className="flex flex-col gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
          {drop.brand}
        </span>
        <h1 className="font-serif text-6xl font-light leading-[0.9] tracking-tight text-balance">
          Gone.
        </h1>
        <p className="max-w-sm font-mono text-sm leading-relaxed text-subtle">
          {claimed}/{drop.initialStock} claimed. Holds expire — if one does, the
          line moves and the next person in gets the call.
        </p>
      </div>

      <div className="h-px w-full bg-border" />

      {joined ? (
        <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-accent/40 bg-accent/10 p-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            You&apos;re in the line
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl tabular-nums text-accent">
              #{pad(queuePos)}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              in the queue
            </span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-subtle">
            We&apos;ll email {email || "you"} the moment a hold drops. No promises
            — that&apos;s the point.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setJoined(true);
          }}
          className="flex flex-col gap-3"
        >
          <label
            htmlFor="join-line"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle"
          >
            Join the line
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="join-line"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-[var(--radius)] border border-border bg-muted px-4 font-mono text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-faint focus:border-foreground"
            />
            <button
              type="submit"
              className="h-12 rounded-[var(--radius)] bg-foreground px-6 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.97]"
            >
              Join
            </button>
          </div>
        </form>
      )}

      <Specs items={drop.specs} />
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
        className={`uppercase tracking-[0.14em] ${
          emphasize ? "text-foreground" : "text-subtle"
        } text-[11px]`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${emphasize ? "text-foreground" : "text-subtle"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Specs({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col border-t border-border">
      {items.map((s) => (
        <div
          key={s.label}
          className="grid grid-cols-[5.5rem_1fr] items-baseline gap-4 border-b border-border/60 py-3"
        >
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {s.label}
          </dt>
          <dd className="font-mono text-[12px] leading-relaxed text-subtle">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
