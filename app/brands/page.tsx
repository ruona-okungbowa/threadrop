import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brands, drops, statusOf } from "@/lib/feed-data";

export const metadata: Metadata = {
  title: "The Labels — Threadrop",
  description:
    "The independent labels releasing limited runs on Threadrop. Each with its own world.",
};

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-12 md:px-10 md:pt-16">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          The labels
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-light leading-[0.98] tracking-tight text-balance md:text-6xl">
          A house of independent labels.
        </h1>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius)] bg-border md:grid-cols-2">
          {brands.map((b) => {
            const brandDrops = drops.filter((d) => d.brandSlug === b.slug);
            const live = brandDrops.filter(
              (d) => statusOf(d) === "LIVE",
            ).length;
            return (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="group flex flex-col gap-4 bg-background p-8 transition-colors duration-200 hover:bg-muted md:p-10"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl tracking-tight transition-opacity duration-200 group-hover:opacity-70 md:text-3xl">
                    {b.name}
                  </h2>
                  {live > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                      {live} live
                    </span>
                  )}
                </div>
                <p className="max-w-md font-mono text-[12px] leading-relaxed text-subtle">
                  {b.descriptor}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
                    {brandDrops.length}{" "}
                    {brandDrops.length === 1 ? "drop" : "drops"}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Enter storefront →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
