import Link from "next/link";
import { statusOf } from "@/lib/feed-data";
import { getFeed } from "@/lib/server/queries";
import { CartButton } from "@/components/cart/cart-button";

export async function SiteHeader() {
  const drops = await getFeed();
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
        <Link href="/about" className="transition-opacity hover:opacity-60">
          About
        </Link>
      </nav>

      <div className="flex items-center gap-5">
        <Link
          href="/drops"
          className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70 md:inline-flex"
        >
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
          {liveCount} drops live now
        </Link>
        <span aria-hidden className="hidden text-faint md:inline">
          —
        </span>
        <CartButton />
      </div>
    </header>
  );
}
