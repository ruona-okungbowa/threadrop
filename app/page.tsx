import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CuratedDrops } from "@/components/feed/curated-drops";
import { BrandsStrip } from "@/components/feed/brands-strip";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      {/* hero — the magazine cover. Identity and point of view, nothing to browse yet. */}
      <section className="mx-auto max-w-[1400px] px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          Threadrop — independent fashion, dropped in limited runs
        </p>
        <h1 className="max-w-5xl font-serif text-5xl font-light leading-[0.92] tracking-tight text-balance md:text-[5.5rem]">
          Small labels. Smaller runs. When the clock hits zero, it&apos;s gone
          for good.
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-10">
          <Link
            href="/drops"
            className="group inline-flex items-center gap-2 rounded-[var(--radius)] bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
          >
            Shop all drops
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <Link
            href="/brands"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
          >
            Browse the labels
          </Link>
        </div>
      </section>

      {/* curated taste of live drops — never the full feed, never filterable */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <CuratedDrops />
      </section>

      {/* a taste of the labels */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <BrandsStrip limit={4} />
      </section>

      <SiteFooter />
    </main>
  );
}
