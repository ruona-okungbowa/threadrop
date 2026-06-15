"use client";

import { useEffect, useMemo, useState } from "react";
import type { Drop, SizeKey } from "@/lib/drop-data";
import { formatPrice } from "@/lib/drop-data";
import { Countdown } from "./countdown";
import { pad } from "./use-countdown";

type Phase = "PRELAUNCH" | "LIVE" | "ENDED";
const HOLD_MS = 1000 * 60 * 10; // 10 minute hold

export function BuyBox({ drop }: { drop: Drop }) {
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<SizeKey | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [heldSize, setHeldSize] = useState<SizeKey | null>(null);

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

  if (soldOut || phase === "ENDED") {
    return <SoldOut drop={drop} claimed={claimed} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* status pill + countdown */}
      <div className="flex flex-col gap-5">
        <StatusPill phase={phase} />
        <Countdown
          startsAt={drop.startsAt}
          endsAt={drop.endsAt}
          phase={phase}
        />
      </div>

      <div className="h-px w-full bg-border" />

      {/* title block */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
          {drop.brand} — 1 of {drop.initialStock}
        </span>
        <h1 className="font-serif text-5xl font-light leading-[0.95] tracking-tight text-balance md:text-6xl">
          {drop.title}
        </h1>
        <p className="font-mono text-sm leading-relaxed text-subtle">
          {drop.edition}
        </p>
      </div>

      {/* price */}
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl tabular-nums text-foreground">
          {formatPrice(drop.pricePence, drop.currency)}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          incl. VAT
        </span>
      </div>

      {/* stock progress */}
      <StockBar
        remaining={remaining}
        total={drop.initialStock}
        pct={pct}
        low={lowStock}
      />

      {/* size selector */}
      <SizeSelector
        drop={drop}
        selected={selected}
        onSelect={setSelected}
        disabled={isHeld}
      />

      {/* shipping + total, shown before the action */}
      <div className="flex flex-col gap-2 font-mono text-sm">
        <Row label="Piece" value={formatPrice(drop.pricePence, drop.currency)} />
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

      {/* primary action */}
      {isHeld ? (
        <HeldState
          size={heldSize}
          remainingMs={holdRemaining}
          currency={drop.currency}
          totalPence={totalPence}
        />
      ) : (
        <button
          type="button"
          onClick={startHold}
          disabled={!selected}
          className="group relative w-full overflow-hidden rounded-[var(--radius)] bg-foreground py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:bg-muted-2 disabled:text-faint"
        >
          {selected ? `Hold size ${selected}` : "Select a size"}
        </button>
      )}

      <p className="font-mono text-[11px] leading-relaxed text-faint">
        A hold reserves your piece for 10 minutes while you check out. One hold
        per person. When it expires, the line moves.
      </p>

      <Details items={drop.details} />
    </div>
  );
}

function StatusPill({ phase }: { phase: Phase }) {
  if (phase === "PRELAUNCH") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        <span className="h-1.5 w-1.5 rounded-full bg-subtle" />
        Drop scheduled
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
      <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
      Live now
    </span>
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
        <span className={low ? "text-accent" : "text-subtle"}>
          {remaining} of {total} left
        </span>
        <span className="text-faint">{low ? "Going fast" : "In stock"}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
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
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-subtle disabled:hover:border-border"
              }`}
            >
              {size}
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
}: {
  size: SizeKey | null;
  remainingMs: number;
  currency: string;
  totalPence: number;
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
        className="w-full rounded-[var(--radius)] bg-accent py-4 font-mono text-sm font-medium uppercase tracking-[0.18em] text-accent-foreground transition-all duration-200 ease-out hover:opacity-90"
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
              className="h-12 rounded-[var(--radius)] bg-foreground px-6 font-mono text-sm font-medium uppercase tracking-[0.18em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground"
            >
              Join
            </button>
          </div>
        </form>
      )}

      <Details items={drop.details} />
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

function Details({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-6">
      {items.map((d) => (
        <div key={d} className="flex items-start gap-3">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />
          <span className="font-mono text-[12px] leading-relaxed text-subtle">
            {d}
          </span>
        </div>
      ))}
    </div>
  );
}
