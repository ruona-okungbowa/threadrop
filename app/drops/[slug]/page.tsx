import Link from "next/link";
import { Gallery } from "@/components/drop/gallery";
import { BuyBox } from "@/components/drop/buy-box";
import { CartButton } from "@/components/cart/cart-button";
import { XrayProvider } from "@/lib/xray-context";
import { XrayToggle } from "@/components/drop/xray-toggle";
import { XrayPanel } from "@/components/drop/xray-panel";
import { notFound } from "next/navigation";
import { getDropPage } from "@/lib/server/queries";

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drop = await getDropPage(slug);
  if (!drop) notFound();

  return (
    <XrayProvider drop={drop} slug={slug}>
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
            className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-subtle transition-opacity duration-200 hover:opacity-60 sm:inline"
          >
            ← All drops
          </Link>
          <div className="flex items-center gap-5">
            <XrayToggle />
            <span aria-hidden className="hidden text-faint md:inline">
              —
            </span>
            <CartButton />
          </div>
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

        {/* x-ray: the live DynamoDB data layer, revealed on toggle */}
        <XrayPanel />
      </main>
    </XrayProvider>
  );
}
