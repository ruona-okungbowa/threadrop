"use client";

import { useState } from "react";
import Link from "next/link";
import type { Drop, SizeKey } from "@/lib/drop-data";
import { formatPrice } from "@/lib/drop-data";

export interface Claim {
  dropNo: number;
  claimId: number;
  /** which numbered piece of the run this is */
  pieceNo: number;
  size: SizeKey;
  email: string;
}

const pad4 = (n: number) => n.toString().padStart(4, "0");

export function OrderTicket({ drop, claim }: { drop: Drop; claim: Claim }) {
  const [shared, setShared] = useState(false);
  const totalPence = drop.pricePence + drop.shippingPence;
  const hero = drop.gallery[0];

  async function handleShare() {
    const text = `Claimed ${drop.title} — 1 of ${drop.initialStock}. DROP #${pad4(
      claim.dropNo,
    )} · CLAIM ${claim.claimId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Threadrop", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* dismissed — no-op */
    }
  }

  return (
    <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-background px-5 py-12">
      <div className="ticket-in w-full max-w-sm">
        {/* the ticket */}
        <div className="relative flex flex-col bg-foreground text-background">
          {/* top stub: the claim */}
          <div className="flex flex-col gap-7 px-7 pb-8 pt-9">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-background/60">
                {drop.brand}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  Claimed
                </span>
              </span>
            </div>

            <h1 className="font-serif text-5xl font-light leading-[0.92] tracking-tight text-balance">
              You got it.
            </h1>

            {/* the piece */}
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius)]"
                style={{ backgroundColor: hero?.tone }}
              >
                {hero?.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero.src || "/placeholder.svg"}
                    alt={drop.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-serif text-xl leading-tight">
                  {drop.title}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-background/60">
                  Size {claim.size} · {formatPrice(totalPence, drop.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* perforation */}
          <div className="relative" aria-hidden="true">
            {/* notches */}
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
            <div className="mx-7 border-t border-dashed border-background/30" />
          </div>

          {/* bottom stub: the collectible IDs */}
          <div className="flex flex-col gap-6 px-7 pb-9 pt-8">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                  Claim
                </span>
                <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-background">
                  DROP #{pad4(claim.dropNo)} · {claim.claimId}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                  Edition
                </span>
                <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-accent">
                  {claim.pieceNo} of {drop.initialStock}
                </span>
              </div>
            </div>

            <p className="font-mono text-[11px] leading-relaxed text-background/60">
              Confirmation&apos;s on its way to{" "}
              <span className="text-background">{claim.email || "your inbox"}</span>.
              Ships within 5 working days — we&apos;ll send tracking when it
              leaves the studio.
            </p>
          </div>
        </div>

        {/* affordances, outside the ticket */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground underline-offset-4 transition-opacity duration-200 hover:opacity-60"
          >
            {shared ? "Copied to clipboard" : "Share the claim"}
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle transition-colors duration-200 hover:text-foreground"
          >
            See what {drop.brand} drops next
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
