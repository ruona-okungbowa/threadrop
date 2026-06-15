import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DropCard } from "@/components/feed/drop-card";
import { brands, drops, statusOf, type FeedDrop } from "@/lib/feed-data";

const STATUS_RANK: Record<string, number> = {
  LIVE: 0,
  UPCOMING: 1,
  SOLD_OUT: 2,
};

function sortForStorefront(list: FeedDrop[]) {
  return [...list].sort((a, b) => {
    const ra = STATUS_RANK[statusOf(a)];
    const rb = STATUS_RANK[statusOf(b)];
    if (ra !== rb) return ra - rb;
    return a.endsAt - b.endsAt;
  });
}

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = brands.find((b) => b.slug === slug);
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
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  const brandDrops = sortForStorefront(
    drops.filter((d) => d.brandSlug === brand.slug),
  );
  const live = brandDrops.filter((d) => statusOf(d) === "LIVE").length;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      {/* brand masthead — the label's own world */}
      <section className="border-b border-border px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/brands"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>
            All labels
          </Link>
          <h1 className="max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-tight text-balance md:text-7xl">
            {brand.name}
          </h1>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-subtle">
            {brand.descriptor}
          </p>
          <div className="mt-8 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="text-foreground">
              {brandDrops.length} {brandDrops.length === 1 ? "drop" : "drops"}
            </span>
            {live > 0 && (
              <span className="inline-flex items-center gap-2 text-accent">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                {live} live now
              </span>
            )}
          </div>
        </div>
      </section>

      {/* the label's drops */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
        {brandDrops.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-subtle">
              No drops scheduled.
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {brandDrops.map((d, i) => (
              <DropCard key={d.slug} drop={d} index={i} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
