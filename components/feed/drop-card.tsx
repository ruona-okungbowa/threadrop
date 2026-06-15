"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCountdown, pad } from "@/components/drop/use-countdown";
import { QuickAdd } from "@/components/cart/quick-add";
import { formatPrice, statusOf, type FeedDrop } from "@/lib/feed-data";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function dropsAtLabel(startsAt: number) {
  const d = new Date(startsAt);
  return `DROPS ${DAYS[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Variant = "default" | "featured";
type LayoutMode = "stacked" | "row";

export function DropCard({
  drop,
  index = 0,
  variant = "default",
  layout = "stacked",
}: {
  drop: FeedDrop;
  index?: number;
  variant?: Variant;
  layout?: LayoutMode;
}) {
  const status = statusOf(drop);
  const soldOut = status === "SOLD_OUT";
  const featured = variant === "featured";

  // Compact horizontal card — used for "supporting" picks beside a feature.
  if (layout === "row") {
    return (
      <Link
        href={`/drops/${drop.slug}`}
        className="group flex gap-4 fade-rise"
        style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      >
        <figure
          className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[var(--radius)] sm:w-32"
          style={{ backgroundColor: drop.image.tone }}
        >
          <img
            src={drop.image.src || "/placeholder.svg"}
            alt={`${drop.brand} — ${drop.title}`}
            className={`h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.06] ${
              soldOut ? "opacity-55 saturate-[0.6]" : ""
            }`}
          />
          <StateTag status={status} compact />
        </figure>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
            {drop.brand}
          </span>
          <h3
            className={`truncate font-serif text-lg leading-tight tracking-tight transition-opacity duration-200 group-hover:opacity-70 ${
              soldOut ? "text-subtle" : "text-foreground"
            }`}
          >
            {drop.title}
          </h3>
          <span
            className={`font-mono text-sm tabular-nums ${
              soldOut ? "text-faint" : "text-foreground"
            }`}
          >
            {formatPrice(drop.pricePence, drop.currency)}
          </span>
          <div className="mt-1">
            <StatusLine drop={drop} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 fade-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <Link href={`/drops/${drop.slug}`} className="group flex flex-col gap-3">
      {/* image */}
      <figure
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)]"
        style={{ backgroundColor: drop.image.tone }}
      >
        <img
          src={drop.image.src || "/placeholder.svg"}
          alt={`${drop.brand} — ${drop.title}`}
          className={`h-full w-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.06] ${
            soldOut ? "opacity-55 saturate-[0.6]" : ""
          }`}
        />

        <StateTag status={status} />

        {/* hover affordance — a quiet invitation that rises in on hover */}
        {!soldOut && (
          <span className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between rounded-[var(--radius)] bg-background/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            View drop
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        )}
      </figure>

      {/* meta */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
          {drop.brand}
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={`font-serif leading-tight tracking-tight transition-opacity duration-200 group-hover:opacity-70 ${
              featured ? "text-3xl md:text-4xl" : "text-xl"
            } ${soldOut ? "text-subtle" : "text-foreground"}`}
          >
            {drop.title}
          </h3>
          <span
            className={`shrink-0 font-mono tabular-nums ${
              featured ? "text-base" : "text-sm"
            } ${soldOut ? "text-faint" : "text-foreground"}`}
          >
            {formatPrice(drop.pricePence, drop.currency)}
          </span>
        </div>

        {/* status line — the part that differs sharply per state */}
        <div className="mt-1.5">
          <StatusLine drop={drop} />
        </div>
      </div>
      </Link>

      {/* quick add — only when the drop is live and buyable */}
      {status === "LIVE" && (
        <div className="mt-0.5">
          <QuickAdd drop={drop} />
        </div>
      )}
    </div>
  );
}

function StateTag({
  status,
  compact = false,
}: {
  status: ReturnType<typeof statusOf>;
  compact?: boolean;
}) {
  const pos = compact ? "left-2 top-2" : "left-3 top-3";
  return (
    <span className={`absolute ${pos}`}>
      {status === "LIVE" && (
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
          Live
        </span>
      )}
      {status === "UPCOMING" && (
        <span className="inline-flex items-center rounded-[var(--radius)] bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle backdrop-blur-sm">
          Soon
        </span>
      )}
      {status === "SOLD_OUT" && (
        <span className="inline-flex items-center rounded-[var(--radius)] bg-foreground/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-background backdrop-blur-sm">
          Gone
        </span>
      )}
    </span>
  );
}

function StatusLine({ drop }: { drop: FeedDrop }) {
  const status = statusOf(drop);

  if (status === "SOLD_OUT") {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        Gone — {drop.total}/{drop.total}
      </span>
    );
  }

  if (status === "UPCOMING") {
    return <UpcomingLine startsAt={drop.startsAt} />;
  }

  return <LiveLine drop={drop} />;
}

function UpcomingLine({ startsAt }: { startsAt: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
      {mounted ? dropsAtLabel(startsAt) : "Upcoming"}
    </span>
  );
}

function LiveLine({ drop }: { drop: FeedDrop }) {
  const t = useCountdown(drop.endsAt);
  const pct = Math.round((drop.remaining / drop.total) * 100);
  const low = drop.remaining <= 10;

  const clock = t
    ? `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`
    : "--:--:--";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className="text-accent">Ends {clock}</span>
        <span className={low ? "text-accent" : "text-subtle"}>
          {drop.remaining}/{drop.total} left
        </span>
      </div>
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted-2">
        <div
          className="stock-fill h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
