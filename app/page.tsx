import Link from "next/link";
import { DropsFeed } from "@/components/feed/drops-feed";
import { BrandsStrip } from "@/components/feed/brands-strip";
import { drops, statusOf } from "@/lib/feed-data";

export default function Page() {
  const liveCount = drops.filter((d) => statusOf(d) === "LIVE").length;

  return (
    <main className="min-h-screen bg-background">
      {/* slim identity strip */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur-md md:px-10">
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.3em] text-foreground"
        >
          Threadrop
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle sm:flex"
        >
          <a href="#drops" className="transition-opacity hover:opacity-60">
            Drops
          </a>
          <span aria-hidden className="text-faint">
            —
          </span>
          <a href="#brands" className="transition-opacity hover:opacity-60">
            Brands
          </a>
          <span aria-hidden className="text-faint">
            —
          </span>
          <a href="#about" className="transition-opacity hover:opacity-60">
            About
          </a>
        </nav>

        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
          {liveCount} drops live now
        </span>
      </header>

      {/* editorial intro moment — a sentence of identity, then straight to product */}
      <section
        id="about"
        className="mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24"
      >
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          Threadrop — independent fashion, dropped in limited runs
        </p>
        <h1 className="max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-tight text-balance md:text-7xl">
          Small labels. Smaller runs. When the clock hits zero, it&apos;s gone
          for good.
        </h1>
      </section>

      {/* the feed — the core of the page */}
      <section
        id="drops"
        className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10"
      >
        <DropsFeed />
      </section>

      {/* brands */}
      <section
        id="brands"
        className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10"
      >
        <BrandsStrip />
      </section>

      <footer className="border-t border-border px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2">
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-foreground">
            Threadrop
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Limited drops from independent labels. No restock.
          </p>
        </div>
      </footer>
    </main>
  );
}
