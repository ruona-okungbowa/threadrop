import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-5 py-12 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-foreground">
              Threadrop
            </span>
            <p className="max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-faint">
              Limited drops from independent labels. No restock.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle"
          >
            <Link href="/drops" className="transition-opacity hover:opacity-60">
              Drops
            </Link>
            <Link href="/brands" className="transition-opacity hover:opacity-60">
              Brands
            </Link>
            <Link href="/about" className="transition-opacity hover:opacity-60">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
