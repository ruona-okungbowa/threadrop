import Link from "next/link";
import { brands, brandThumbnails, drops, statusOf } from "@/lib/feed-data";

export function BrandsStrip({ limit }: { limit?: number }) {
  const shown = typeof limit === "number" ? brands.slice(0, limit) : brands;

  return (
    <section aria-label="Brands on Threadrop" className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <h2 className="font-serif text-2xl tracking-tight">The labels</h2>
        <Link
          href="/brands"
          className="group font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
        >
          All brands{" "}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {/* editorial rows, not a spec table — each label gets its own line of presence */}
      <div className="flex flex-col">
        {shown.map((b, i) => {
          const owned = drops.filter((d) => d.brandSlug === b.slug);
          const live = owned.filter((d) => statusOf(d) === "LIVE").length;
          const thumbs = brandThumbnails(b.slug, 3);
          return (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className={`group grid grid-cols-1 items-center gap-5 py-7 transition-opacity duration-200 hover:opacity-100 md:grid-cols-[1.1fr_auto] md:gap-10 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-4">
                  <h3 className="font-serif text-2xl tracking-tight transition-opacity duration-200 group-hover:opacity-70 md:text-3xl">
                    {b.name}
                  </h3>
                  {live > 0 && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                      {live} live
                    </span>
                  )}
                </div>
                <p className="max-w-md font-mono text-[12px] leading-relaxed text-subtle">
                  {b.descriptor}
                </p>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
                  {b.est} · {b.location} · {owned.length}{" "}
                  {owned.length === 1 ? "drop" : "drops"}
                </span>
              </div>

              {/* a glimpse of the label's pieces */}
              <div className="flex items-center gap-3">
                {thumbs.map((t, ti) => (
                  <span
                    key={ti}
                    className="relative aspect-[4/5] w-16 overflow-hidden rounded-[var(--radius)] sm:w-20"
                    style={{ backgroundColor: t.tone }}
                  >
                    <img
                      src={t.src || "/placeholder.svg"}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </span>
                ))}
                <span className="ml-1 hidden font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground md:inline">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
