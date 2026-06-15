"use client";

import { useMemo, useState } from "react";
import { DropCard } from "./drop-card";
import { FilterBar, type Filters } from "./filter-bar";
import { drops, statusOf, type DropStatus, type FeedDrop } from "@/lib/feed-data";

function sortWithin(list: FeedDrop[], status: DropStatus, sort: Filters["sort"]) {
  return [...list].sort((a, b) => {
    if (sort === "ending") {
      const ka = status === "UPCOMING" ? a.startsAt : a.endsAt;
      const kb = status === "UPCOMING" ? b.startsAt : b.endsAt;
      return ka - kb;
    }
    return b.startsAt - a.startsAt;
  });
}

const SECTIONS: {
  status: DropStatus;
  title: string;
  note: string;
  dim?: boolean;
}[] = [
  { status: "LIVE", title: "Live now", note: "Buy before the clock runs out" },
  { status: "UPCOMING", title: "Coming up", note: "Set a reminder — not yet open" },
  {
    status: "SOLD_OUT",
    title: "Recently closed",
    note: "The run is complete",
    dim: true,
  },
];

export function DropsFeed() {
  const [filters, setFilters] = useState<Filters>({
    category: "All",
    audience: "All",
    size: "All",
    sort: "ending",
  });

  const { grouped, count } = useMemo(() => {
    const filtered = drops.filter((d) => {
      if (filters.category !== "All" && d.category !== filters.category)
        return false;
      if (filters.audience !== "All" && d.audience !== filters.audience)
        return false;
      if (filters.size !== "All" && !d.sizes.includes(filters.size))
        return false;
      return true;
    });
    const grouped: Record<DropStatus, FeedDrop[]> = {
      LIVE: [],
      UPCOMING: [],
      SOLD_OUT: [],
    };
    for (const d of filtered) grouped[statusOf(d)].push(d);
    (Object.keys(grouped) as DropStatus[]).forEach((s) => {
      grouped[s] = sortWithin(grouped[s], s, filters.sort);
    });
    return { grouped, count: filtered.length };
  }, [filters]);

  return (
    <div className="flex flex-col gap-14">
      <FilterBar filters={filters} onChange={setFilters} count={count} />

      {count === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-subtle">Nothing here yet.</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Try widening your filters.
          </p>
        </div>
      ) : (
        SECTIONS.map((section) => {
          const items = grouped[section.status];
          if (items.length === 0) return null;
          return (
            <section
              key={section.status}
              aria-label={section.title}
              className="flex flex-col gap-7"
            >
              <div className="flex items-baseline justify-between border-b border-border pb-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="flex items-center gap-2.5 font-serif text-xl tracking-tight">
                    {section.status === "LIVE" && (
                      <span className="live-dot h-2 w-2 rounded-full bg-accent" />
                    )}
                    {section.title}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
                    {items.length}
                  </span>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-subtle sm:inline">
                  {section.note}
                </span>
              </div>

              <div
                className={`grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 ${
                  section.dim ? "opacity-80" : ""
                }`}
              >
                {items.map((d, i) => (
                  <DropCard key={d.slug} drop={d} index={i} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
