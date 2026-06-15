import Link from "next/link";
import { Gallery } from "@/components/drop/gallery";
import { BuyBox } from "@/components/drop/buy-box";
import { drop } from "@/lib/drop-data";

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Full buyer experience currently lives for the featured drop; other slugs
  // fall back to it so the feed always links somewhere real.
  await params;

  return (
    <main className="min-h-screen bg-background">
      {/* slim editorial header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.28em] text-foreground transition-opacity duration-200 hover:opacity-60"
        >
          Threadrop
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-opacity duration-200 hover:opacity-60"
        >
          ← All drops
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          {drop.initialStock} made
        </span>
      </header>

      {/* two-column drop layout: gallery ~55%, buy box ~45% */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-10 md:px-10 md:py-14 lg:grid-cols-[55fr_45fr] lg:gap-16">
        <section aria-label="Product imagery">
          <Gallery drop={drop} />
        </section>
        <section
          aria-label="Drop details and checkout"
          className="lg:sticky lg:top-10 lg:self-start"
        >
          <BuyBox drop={drop} />
        </section>
      </div>

      <footer className="border-t border-border px-5 py-6 md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          One drop. {drop.initialStock} pieces. No restock.
        </p>
      </footer>
    </main>
  );
}
