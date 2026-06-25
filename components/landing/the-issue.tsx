"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCountdown, pad } from "@/components/drop/use-countdown";
import type { NavHandlers } from "./landing";

const COVER_GRADIENT =
  "linear-gradient(180deg,rgba(14,11,7,.18) 0%,rgba(14,11,7,0) 30%,rgba(14,11,7,0) 60%,rgba(14,11,7,.72) 100%)";

type Pillar = { title: string; body: string; icon: ReactNode };

// Hairline circular marks, traced from the design's inline SVGs.
const PILLARS: Pillar[] = [
  {
    title: "No overselling —",
    body: "Brands choose the quantity. We enforce it — never one more.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e5440" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      </svg>
    ),
  },
  {
    title: "Timed holds —",
    body: "Reserve a piece and it's held for you. Miss the window and it returns to the line.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e5440" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="12" x2="12" y2="7.2" />
        <line x1="12" y1="12" x2="15.6" y2="13.4" />
      </svg>
    ),
  },
  {
    title: "Global buyers —",
    body: "One fair line for buyers worldwide. Pay in NGN, GBP or USD.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e5440" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    title: "No restocks —",
    body: "A run is cut once. When it's gone, it's gone — no second cut.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5e5440" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <line x1="8.6" y1="8.6" x2="15.4" y2="15.4" />
        <line x1="15.4" y1="8.6" x2="8.6" y2="15.4" />
      </svg>
    ),
  },
];

export function TheIssue({ nav }: { nav: NavHandlers }) {
  // Cover drop closes 38 minutes out — fixed once so the clock counts down cleanly.
  const [end] = useState(() => Date.now() + 38 * 60 * 1000);
  const t = useCountdown(end);
  const closesIn = t
    ? `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`
    : "00:38:00";

  // "now reading" ticker — stable on first paint, then drifts client-side.
  const [watchers, setWatchers] = useState(217);
  useEffect(() => {
    const id = setInterval(
      () => setWatchers(208 + Math.floor(Math.random() * 26)),
      4200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* COVER — editorial text left, cover image right */}
      <section className="relative z-10 grid min-h-[86vh] border-b border-border bg-muted md:grid-cols-[0.82fr_1.18fr]">
        <div className="relative flex flex-col justify-between bg-ink px-5 pb-12 pt-9 md:px-12">
          <div>
            <span className="mb-[18px] block font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
              Limited drops · Global audience
            </span>
            <h1 className="font-serif text-[44px] font-light leading-[0.92] tracking-[-0.03em] text-ink-foreground sm:text-[54px] md:text-[78px]">
              Drops for the brands the world is discovering.
            </h1>
            <p className="mt-[26px] max-w-[42ch] text-[13px] leading-[1.85] text-[#c2b594]">
              From Lagos to London to New York, Threadrop helps independent
              labels run fair limited-edition drops for a global audience.
            </p>
            <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <button
                onClick={nav.goLookbook}
                className="w-full rounded-[var(--radius)] bg-accent px-7 py-[15px] text-center font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                Explore drops
              </button>
              <button
                onClick={nav.goExpansion}
                className="w-full rounded-[var(--radius)] border border-[#4a3f29] px-7 py-[15px] text-center font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-foreground transition-colors hover:border-gold sm:w-auto"
              >
                Apply as a brand
              </button>
            </div>
            <span className="mt-[18px] block font-mono text-[11px] uppercase tracking-[0.16em] text-[#857754]">
              Read the issue · Enter the drop · Reserve your piece
            </span>
          </div>
        </div>

        <div className="relative min-h-[60vh] overflow-hidden md:min-h-0">
          {/* Placeholder photography — swap in the Lagos cover shot at /public/landing */}
          <img
            src="/drop/on-body.png"
            alt="The cover — KÓRÁ Studio, Surulere"
            className="hero-img absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: COVER_GRADIENT }}
          />
          <span className="absolute right-[18px] top-[34px] text-[10px] uppercase tracking-[0.2em] text-[rgba(240,231,213,0.7)] [writing-mode:vertical-rl]">
            The cover — KÓRÁ Studio, Surulere
          </span>
          <div className="absolute bottom-[30px] right-[34px] text-right">
            <span className="block text-[12px] uppercase tracking-[0.16em] text-ink-foreground">
              Lagos, Nigeria
            </span>
            <span className="mt-1.5 block text-[10px] uppercase tracking-[0.1em] text-[rgba(240,231,213,0.66)]">
              Photo — KÓRÁ Studio
            </span>
            <span className="block text-[10px] uppercase tracking-[0.1em] text-[rgba(240,231,213,0.66)]">
              Surulere, Lagos
            </span>
          </div>
        </div>
      </section>

      {/* PLATFORM STATEMENT */}
      <section className="relative z-20 border-b border-border bg-background px-5 py-11 md:px-12">
        <div className="grid items-start gap-10 md:grid-cols-[200px_1fr]">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
            What is Threadrop
          </span>
          <p className="max-w-[62ch] font-serif text-[26px] font-light leading-[1.38] tracking-[-0.01em] text-foreground text-pretty">
            Threadrop is a global fashion-drop platform for independent labels.
            Brands choose the quantity. We enforce the line. Buyers reserve
            pieces fairly, and no piece is ever sold twice.
          </p>
        </div>
      </section>

      {/* WHY BRANDS USE THREADROP */}
      <section className="relative z-20 border-b border-border bg-background px-5 pb-12 pt-9 md:px-12">
        <span className="mb-[26px] block font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
          Fair drops · No bot advantage
        </span>
        <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2 md:grid-cols-4">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className={`border-t border-border px-0 pb-1.5 pt-[22px] md:border-t-0 md:px-7 md:border-l ${
                i === 0 ? "md:border-l-0 md:pl-0" : ""
              }`}
            >
              <span className="mb-3.5 block">{p.icon}</span>
              <span className="mb-2 block font-serif text-[19px] text-foreground">
                {p.title}
              </span>
              <p className="text-[12px] leading-[1.7] text-subtle">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOOKBOOK */}
      <section id="tr-lookbook" className="relative z-20 bg-background">
        <div className="flex flex-col items-start justify-between gap-4 px-5 pb-10 pt-16 md:flex-row md:items-end md:px-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
              01 — The lookbook · p.02
            </span>
            <h2 className="mt-3.5 font-serif text-[46px] font-light leading-[0.98] tracking-[-0.025em] md:text-[54px]">
              The new Lagos uniform.
            </h2>
          </div>
          <span className="max-w-[30ch] text-[11px] leading-[1.7] text-subtle md:text-right">
            Three pieces from three labels, shot across the city. Each one an
            edition of fifty.
          </span>
        </div>

        <div className="grid border-t border-border md:grid-cols-[1.35fr_0.65fr]">
          <img
            src="/feed/canvas-overshirt.png"
            alt="Look 01 — Harmattan Overshirt by KÓRÁ Studio"
            className="h-[62vh] w-full object-cover md:h-[84vh]"
          />
          <div className="flex flex-col justify-between gap-10 border-t border-border px-5 py-14 md:border-l md:border-t-0 md:px-11">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
              Look 01 / 03
            </span>
            <div>
              <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                KÓRÁ Studio
              </span>
              <h3 className="font-serif text-[40px] font-light leading-none tracking-[-0.02em]">
                Harmattan Overshirt
              </h3>
              <p className="mt-[18px] text-[13px] leading-[1.8] text-[#5e5440]">
                16oz undyed cotton, cut and numbered by hand. Worn here over the
                Loopback Crew.
              </p>
              <span className="mt-[22px] block font-serif text-[22px] text-foreground">
                £185
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-[12px] text-subtle">
                <span>Edition of 50</span>
                <span className="text-accent">17 remain</span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-border">
                <div className="h-full w-[34%] bg-accent" />
              </div>
              <button
                onClick={nav.goDrop}
                className="mt-3.5 rounded-[var(--radius)] bg-accent py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-foreground transition-opacity hover:opacity-90"
              >
                Enter the drop →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL BAND — the cast & the cloth */}
      <section className="relative z-20 border-t border-border bg-muted">
        <div className="flex flex-wrap items-end justify-between gap-3.5 px-5 pb-[22px] pt-10 md:px-12">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
            Contact sheet — the cast &amp; the cloth
          </span>
          <span className="text-[11px] tracking-[0.04em] text-subtle">
            Shot across Surulere, Yaba &amp; Ikoyi — Winter 2026
          </span>
        </div>
        <img
          src="/drop/hero.png"
          alt="Contact sheet — Winter 2026 across Lagos"
          className="h-[46vh] w-full object-cover"
        />
      </section>

      {/* EDITOR'S NOTE */}
      <section
        id="tr-editor-note"
        className="relative z-20 border-t border-ink bg-ink px-5 py-[72px] text-ink-foreground md:px-12"
      >
        <span className="mb-9 block font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
          02 — Editor&apos;s note · p.06
        </span>
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h2 className="font-serif text-[46px] font-light leading-[0.98] tracking-[-0.025em] text-ink-foreground">
              Limited, and no more.
            </h2>
            <p className="mt-[22px] max-w-[42ch] text-[13px] leading-[1.9] text-faint">
              That&apos;s the whole idea. A label cuts a small, numbered run of
              fifty, and when it&apos;s gone there is no second cut.
            </p>
          </div>
          <blockquote className="border-l-[3px] border-accent-bright pl-6">
            <p className="font-serif text-[23px] font-light italic leading-[1.42] tracking-[-0.005em] text-ink-foreground text-pretty">
              We didn&apos;t invent scarcity — Lagos has always made things this
              way, by hand, in small numbers, with the maker&apos;s mark on them.
              We built the line that lets the rest of the world stand in it,
              fairly.
            </p>
          </blockquote>
          <div>
            <p className="text-[13px] leading-[1.9] text-[#c2b594]">
              Read this issue like a magazine. When a piece stops you, the drop
              is one tap away — but the drop is not the point. The point is that
              a generation of independent labels is making some of the best
              clothes in the world, and you should see them the way they deserve
              to be seen.
            </p>
            <p className="mt-5 font-serif text-[15px] italic text-ink-foreground">
              — The Editors, Lagos
            </p>
          </div>
        </div>
      </section>

      {/* THE DROP */}
      <section
        id="tr-drop"
        className="relative z-20 border-t border-ink bg-background px-5 py-[72px] md:px-12"
      >
        <div className="grid items-end gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
              04 — The drop · p.09
            </span>
            <h2 className="mt-4 max-w-[20ch] font-serif text-[46px] font-light leading-[1.04] tracking-[-0.02em]">
              Every piece in this issue is a limited drop.
            </h2>
            <p className="mt-[18px] max-w-[54ch] text-[13px] leading-[1.85] text-[#5e5440]">
              One fair line, no oversell — two people can never buy the same
              piece. The cover drop closes in{" "}
              <span className="tabular-nums text-foreground">{closesIn}</span>.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <button
              onClick={nav.goDrop}
              className="whitespace-nowrap rounded-[var(--radius)] bg-accent px-10 py-[18px] font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-opacity hover:opacity-90"
            >
              Enter the drop →
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
              {watchers} reading · 17 of 50 left
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
