import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brands, drops, statusOf } from "@/lib/feed-data";

export const metadata: Metadata = {
  title: "About — Threadrop",
  description:
    "Threadrop releases limited runs from independent labels — numbered, time-boxed, and never restocked.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Limited by design",
    body: "Every drop is a fixed run. We never restock, never re-release. What goes live is the entire production — when it sells through, that pattern is retired.",
  },
  {
    n: "02",
    title: "Time-boxed",
    body: "Each drop opens, runs its clock, and closes. The countdown isn't a marketing trick — it's the real window. Miss it and the piece is gone for good.",
  },
  {
    n: "03",
    title: "Independent only",
    body: "We work exclusively with small, independent labels making considered garments in small numbers. No fast fashion, no endless catalogues, no noise.",
  },
];

export default function AboutPage() {
  const liveCount = drops.filter((d) => statusOf(d) === "LIVE").length;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      {/* manifesto hero */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          About Threadrop
        </p>
        <h1 className="max-w-4xl font-serif text-4xl font-light leading-[0.95] tracking-tight text-balance md:text-6xl">
          We release limited runs from independent labels — numbered, time-boxed,
          and never restocked.
        </h1>
        <p className="mt-8 max-w-2xl font-mono text-sm leading-relaxed text-subtle">
          Each drop opens, runs its clock, and closes. What you see is the whole
          run. When it&apos;s gone, it&apos;s gone.
        </p>
      </section>

      {/* principles — three editorial rows, not a uniform card grid */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="grid grid-cols-1 gap-4 border-b border-border py-10 md:grid-cols-[6rem_1fr] md:gap-10 md:py-14"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                {p.n}
              </span>
              <div className="max-w-3xl">
                <h2 className="font-serif text-2xl font-light leading-snug text-balance md:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-4 font-mono text-[13px] leading-relaxed text-subtle">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* by the numbers */}
      <section className="border-b border-border bg-muted/40 px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-x-16 gap-y-8">
          <Stat value={String(brands.length)} label="Independent labels" />
          <Stat value={String(drops.length)} label="Drops to date" />
          <Stat value={`${liveCount}`} label="Live right now" accent />
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <p className="max-w-3xl font-serif text-2xl font-light leading-snug text-balance md:text-3xl">
          The next run is already on the clock.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/drops"
            className="group inline-flex items-center gap-2 rounded-[var(--radius)] bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-background transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
          >
            See what&apos;s dropping
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

      <SiteFooter />
    </main>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`font-serif text-5xl font-light tabular-nums md:text-6xl ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
        {label}
      </span>
    </div>
  );
}
