import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DropCard } from "@/components/feed/drop-card";
import { statusOf, type DropStatus, type FeedDrop } from "@/lib/feed-data";
import { getBrand, listBrandDrops } from "@/lib/server/queries";

const SECTIONS: { status: DropStatus; title: string; dim?: boolean }[] = [
  { status: "LIVE", title: "Live now" },
  { status: "UPCOMING", title: "Coming up" },
  { status: "SOLD_OUT", title: "Past drops", dim: true },
];

function group(list: FeedDrop[]) {
  const g: Record<DropStatus, FeedDrop[]> = {
    LIVE: [],
    UPCOMING: [],
    SOLD_OUT: [],
  };
  for (const d of list) g[statusOf(d)].push(d);
  g.LIVE.sort((a, b) => a.endsAt - b.endsAt);
  g.UPCOMING.sort((a, b) => a.startsAt - b.startsAt);
  g.SOLD_OUT.sort((a, b) => b.endsAt - a.endsAt);
  return g;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found — Threadrop" };
  return {
    title: `${brand.name} — Threadrop`,
    description: brand.descriptor,
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const owned = await listBrandDrops(slug);
  const grouped = group(owned);
  const live = grouped.LIVE.length;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      {/* atmospheric masthead — the label's own world, not an empty title */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src={brand.heroImage || "/placeholder.svg"}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
          {/* scrim so type stays legible over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Link
            href="/brands"
            className="group mb-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>
            All labels
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
                {brand.est} · {brand.location}
              </span>
              <h1 className="mt-4 max-w-3xl font-serif text-5xl font-light leading-[0.92] tracking-tight text-balance md:text-7xl">
                {brand.name}
              </h1>
              <div className="mt-6 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.18em]">
                <span className="text-foreground">
                  {owned.length} {owned.length === 1 ? "drop" : "drops"}
                </span>
                {live > 0 && (
                  <span className="inline-flex items-center gap-2 text-accent">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                    {live} live now
                  </span>
                )}
              </div>
            </div>

            <p className="max-w-md font-mono text-[13px] leading-relaxed text-subtle lg:pb-2">
              {brand.story}
            </p>
          </div>
        </div>
      </section>

      {/* the label's drops, grouped by state */}
      <section className="mx-auto flex max-w-[1400px] flex-col gap-14 px-5 py-16 md:px-10 md:py-20">
        {owned.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-subtle">
              No drops scheduled.
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              Check back soon.
            </p>
          </div>
        ) : (
          SECTIONS.map((section) => {
            const items = grouped[section.status];
            if (items.length === 0) return null;
            return (
              <div
                key={section.status}
                className="flex flex-col gap-7"
                aria-label={section.title}
              >
                <div className="flex items-baseline gap-3 border-b border-border pb-3">
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
                <div
                  className={`grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 ${
                    section.dim ? "opacity-80" : ""
                  }`}
                >
                  {items.map((d, i) => (
                    <DropCard key={d.slug} drop={d} index={i} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
