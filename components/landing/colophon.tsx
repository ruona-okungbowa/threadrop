import type { NavHandlers } from "./landing";

export function Colophon({ nav }: { nav: NavHandlers }) {
  return (
    <footer className="relative z-20 border-t border-ink bg-ink px-5 pb-9 pt-[60px] text-[#a89878] md:px-10">
      <div className="grid grid-cols-2 gap-x-10 gap-y-7 border-b border-[#38301f] pb-10 md:grid-cols-4">
        <div>
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Masthead
          </span>
          <span className="block text-[12px] leading-[1.9] text-[#c2b594]">
            Editorial — Threadrop Lagos
            <br />
            Photography — Contributing studios
            <br />
            Styling — The labels
            <br />
            Words — A. Okelawal
          </span>
        </div>

        <div>
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            This issue
          </span>
          <span className="block text-[12px] leading-[1.9] text-[#c2b594]">
            N° 042 — Winter 2026
            <br />
            Featuring KÓRÁ Studio, NATIVE//FORM, ILÉ Atelier
            <br />
            Lagos · London · New York
          </span>
        </div>

        <div className="flex flex-col gap-[11px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Sections
          </span>
          <button
            onClick={nav.goLookbook}
            className="text-left text-[12px] text-[#c2b594] transition-colors hover:text-ink-foreground"
          >
            The lookbook
          </button>
          <button
            onClick={nav.goExpansion}
            className="text-left text-[12px] text-[#c2b594] transition-colors hover:text-ink-foreground"
          >
            The expansion
          </button>
          <span className="text-[12px] text-[#c2b594]">Archive of issues</span>
          <button
            onClick={nav.goDrop}
            className="text-left text-[12px] text-[#c2b594] transition-colors hover:text-ink-foreground"
          >
            Shop the drops
          </button>
        </div>

        <div>
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Next issue
          </span>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="you@email.com"
              className="h-[42px] min-w-0 flex-1 rounded-[var(--radius)] border border-[#4a3f29] bg-black/20 px-3 font-mono text-[12px] text-ink-foreground outline-none placeholder:text-[#857754] focus:border-gold"
            />
            <button
              type="submit"
              className="h-[42px] rounded-[var(--radius)] bg-accent-bright px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-foreground transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-[22px] text-[11px] tracking-[0.06em] text-[#857754]">
        <span>© 2026 Threadrop. Built in Lagos · pay in NGN, GBP or USD.</span>
        <span className="flex gap-[18px]">
          <span>Instagram</span>
          <span>TikTok</span>
          <span>Terms</span>
        </span>
      </div>
    </footer>
  );
}
