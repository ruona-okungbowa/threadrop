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

export function CuratedDrops() {
  const selection = curate(3);
  const [feature, ...supporting] = selection;

  if (!feature) return null;

  return (
    <section aria-label="Curated drops" className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <div className="flex items-baseline gap-4">
          <h2 className="font-serif text-2xl tracking-tight">Live now</h2>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-faint sm:inline">
            Hand-picked
          </span>
        </div>
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

      {/* asymmetric editorial arrangement: one feature, supporting picks beside it */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <DropCard drop={feature} index={0} variant="featured" />

        <div className="flex flex-col gap-6 lg:pt-2">
          {supporting.map((d, i) => (
            <div
              key={d.slug}
              className={i > 0 ? "border-t border-border pt-6" : ""}
            >
              <DropCard drop={d} index={i + 1} layout="row" />
            </div>
          ))}
          <Link
            href="/drops"
            className="group mt-1 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground"
          >
            See the full feed
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
