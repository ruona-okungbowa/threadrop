import Link from "next/link";
import { DropCard } from "./drop-card";
import { drops, statusOf, type FeedDrop } from "@/lib/feed-data";

// Curate the homepage: lead with what's live and ending soonest, then fill
// with the nearest upcoming drops. Never the full feed — a taste, not an index.
function curate(limit: number): FeedDrop[] {
  const live = drops
    .filter((d) => statusOf(d) === "LIVE")
    .sort((a, b) => a.endsAt - b.endsAt);
  const upcoming = drops
    .filter((d) => statusOf(d) === "UPCOMING")
    .sort((a, b) => a.startsAt - b.startsAt);
  return [...live, ...upcoming].slice(0, limit);
}

export function CuratedDrops({ limit = 3 }: { limit?: number }) {
  const selection = curate(limit);

  return (
    <section aria-label="Featured drops" className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <h2 className="font-serif text-2xl tracking-tight">Live now</h2>
        <Link
          href="/drops"
          className="group font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
        >
          View all drops{" "}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {selection.map((d, i) => (
          <DropCard key={d.slug} drop={d} index={i} />
        ))}
      </div>
    </section>
  );
}
