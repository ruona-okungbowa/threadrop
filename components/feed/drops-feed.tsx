"use client";

import { useMemo, useState } from "react";
import { DropCard } from "./drop-card";
import { FilterBar, type Filters } from "./filter-bar";
import { drops, statusOf, type FeedDrop } from "@/lib/feed-data";

const STATUS_RANK: Record<string, number> = {
  LIVE: 0,
  UPCOMING: 1,
  SOLD_OUT: 2,
};

function sortDrops(list: FeedDrop[], sort: Filters["sort"]) {
  return [...list].sort((a, b) => {
    const ra = STATUS_RANK[statusOf(a)];
    const rb = STATUS_RANK[statusOf(b)];
    if (ra !== rb) return ra - rb; // live → upcoming → sold out, always
    if (sort === "ending") {
      // within live: soonest to end first; within upcoming: soonest to start
      const ka = statusOf(a) === "UPCOMING" ? a.startsAt : a.endsAt;
      const kb = statusOf(b) === "UPCOMING" ? b.startsAt : b.endsAt;
      return ka - kb;
    }
    // newest: most recently started/launched first
    return b.startsAt - a.startsAt;
  });
}

export function DropsFeed() {
  const [filters, setFilters] = useState<Filters>({
    category: "All",
    audience: "All",
    size: "All",
    sort: "ending",
  });

  const visible = useMemo(() => {
    const filtered = drops.filter((d) => {
      if (filters.category !== "All" && d.category !== filters.category)
        return false;
      if (filters.audience !== "All" && d.audience !== filters.audience)
        return false;
      if (filters.size !== "All" && !d.sizes.includes(filters.size))
        return false;
      return true;
    });
    return sortDrops(filtered, filters.sort);
  }, [filters]);

  return (
    <div className="flex flex-col gap-10">
      <FilterBar filters={filters} onChange={setFilters} count={visible.length} />

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl text-subtle">Nothing here yet.</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Try widening your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((d, i) => (
            <DropCard key={d.slug} drop={d} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
