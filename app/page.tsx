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
      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-10 md:pb-20 md:pt-28">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          Threadrop — independent fashion, dropped in limited runs
        </p>
        <h1 className="max-w-5xl font-serif text-5xl font-light leading-[0.95] tracking-tight text-balance md:text-[5.5rem]">
          Small labels. Smaller runs. When the clock hits zero, it&apos;s gone
          for good.
        </h1>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
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
        <CuratedDrops limit={3} />
      </section>

      {/* a taste of the labels */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <BrandsStrip limit={4} />
      </section>

      {/* about / manifesto */}
      <section
        id="about"
        className="border-t border-border bg-muted/40 px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
            About Threadrop
          </p>
          <p className="max-w-3xl font-serif text-2xl font-light leading-snug text-balance md:text-3xl">
            We work with independent labels to release limited runs — numbered,
            time-boxed, and never restocked. Each drop opens, runs its clock, and
            closes. What you see is the whole run. When it&apos;s gone, it&apos;s
            gone.
          </p>
          <div className="mt-10">
            <Link
              href="/drops"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground"
            >
              See what&apos;s dropping now
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
