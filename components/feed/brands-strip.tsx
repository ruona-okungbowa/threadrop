import Link from "next/link";
import { brands } from "@/lib/feed-data";

export function BrandsStrip({ limit }: { limit?: number }) {
  const shown = typeof limit === "number" ? brands.slice(0, limit) : brands;

  return (
    <section aria-label="Brands on Threadrop" className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <h2 className="font-serif text-2xl tracking-tight">The labels</h2>
        {typeof limit === "number" ? (
          <Link
            href="/brands"
            className="group font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-foreground"
          >
            All brands{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {brands.length} independent brands
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius)] bg-border sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="group flex flex-col gap-3 bg-background p-6 transition-colors duration-200 hover:bg-muted"
          >
            <h3 className="font-serif text-xl tracking-tight transition-opacity duration-200 group-hover:opacity-70">
              {b.name}
            </h3>
            <p className="font-mono text-[11px] leading-relaxed text-subtle">
              {b.descriptor}
            </p>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              View storefront →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
