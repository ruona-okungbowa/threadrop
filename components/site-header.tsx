import Link from "next/link";
import { drops, statusOf } from "@/lib/feed-data";

export function SiteHeader() {
  const liveCount = drops.filter((d) => statusOf(d) === "LIVE").length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur-md md:px-10">
      <Link
        href="/"
        className="font-mono text-[12px] uppercase tracking-[0.3em] text-foreground transition-opacity hover:opacity-70"
      >
        Threadrop
      </Link>

      <nav
        aria-label="Primary"
        className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle sm:flex"
      >
        <Link href="/drops" className="transition-opacity hover:opacity-60">
          Drops
        </Link>
        <span aria-hidden className="text-faint">
          —
        </span>
        <Link href="/brands" className="transition-opacity hover:opacity-60">
          Brands
        </Link>
        <span aria-hidden className="text-faint">
          —
        </span>
        <Link href="/#about" className="transition-opacity hover:opacity-60">
          About
        </Link>
      </nav>

      <Link
        href="/drops"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70"
      >
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
        {liveCount} drops live now
      </Link>
    </header>
  );
}
