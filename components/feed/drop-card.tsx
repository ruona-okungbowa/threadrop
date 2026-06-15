"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCountdown, pad } from "@/components/drop/use-countdown";
import { formatPrice, statusOf, type FeedDrop } from "@/lib/feed-data";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function dropsAtLabel(startsAt: number) {
  const d = new Date(startsAt);
  return `DROPS ${DAYS[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DropCard({ drop, index = 0 }: { drop: FeedDrop; index?: number }) {
  const status = statusOf(drop);
  const soldOut = status === "SOLD_OUT";

  return (
    <Link
      href={`/drops/${drop.slug}`}
      className="group flex flex-col gap-3 fade-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      {/* image */}
      <figure
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)]"
        style={{ backgroundColor: drop.image.tone }}
      >
        <img
          src={drop.image.src || "/placeholder.svg"}
          alt={`${drop.brand} — ${drop.title}`}
          className={`h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.05] ${
            soldOut ? "opacity-55 saturate-[0.6]" : ""
          }`}
        />

        {/* state tag, top-left */}
        <span className="absolute left-3 top-3">
          {status === "LIVE" && (
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Live
            </span>
          )}
          {status === "UPCOMING" && (
            <span className="inline-flex items-center rounded-[var(--radius)] bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle backdrop-blur-sm">
              Upcoming
            </span>
          )}
          {soldOut && (
            <span className="inline-flex items-center rounded-[var(--radius)] bg-foreground/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-background backdrop-blur-sm">
              Gone
            </span>
          )}
        </span>
      </figure>

      {/* meta */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
          {drop.brand}
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={`font-serif text-xl leading-tight tracking-tight transition-opacity duration-200 group-hover:opacity-70 ${
              soldOut ? "text-subtle" : "text-foreground"
            }`}
          >
            {drop.title}
          </h3>
          <span
            className={`shrink-0 font-mono text-sm tabular-nums ${
              soldOut ? "text-faint" : "text-foreground"
            }`}
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
