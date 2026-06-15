import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DropsFeed } from "@/components/feed/drops-feed";

export const metadata: Metadata = {
  title: "All Drops — Threadrop",
  description:
    "Browse every live, upcoming, and closed drop from independent labels on Threadrop.",
};

export default function DropsPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-12 md:px-10 md:pt-16">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
          The feed
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-light leading-[0.98] tracking-tight text-balance md:text-6xl">
          Every drop, live and counting.
        </h1>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <DropsFeed />
      </section>

      <SiteFooter />
    </main>
  );
}
