import { cn } from "@/lib/utils";
import type { NavHandlers } from "./landing";

export function Masthead({ nav }: { nav: NavHandlers }) {
  const { screen } = nav;

  return (
    <header className="relative z-40">
      <div className="flex items-center justify-between border-b border-ink bg-ink px-5 py-[18px] md:px-10">
        <button
          onClick={nav.goHome}
          className="font-mono text-[14px] uppercase tracking-[0.36em] text-ink-foreground transition-opacity hover:opacity-80"
        >
          Threadrop
        </button>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-[26px] font-mono text-[11px] uppercase tracking-[0.2em] md:flex"
        >
          <button
            onClick={nav.goHome}
            className={cn(
              "transition-colors hover:text-ink-foreground",
              screen === "home" ? "text-ink-foreground" : "text-subtle",
            )}
          >
            The Issue
          </button>
          <button
            onClick={nav.goLookbook}
            className="text-subtle transition-colors hover:text-ink-foreground"
          >
            Lookbook
          </button>
          <button
            onClick={nav.goExpansion}
            className="text-subtle transition-colors hover:text-ink-foreground"
          >
            Labels
          </button>
          <button
            onClick={nav.goExpansion}
            className={cn(
              "transition-colors hover:text-ink-foreground",
              screen === "expansion" ? "text-ink-foreground" : "text-subtle",
            )}
          >
            The Expansion
          </button>
        </nav>

        <div className="flex items-center gap-[18px]">
          <button
            onClick={nav.goDrop}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-[9px] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            <span className="live-dot h-[5px] w-[5px] rounded-full bg-accent-foreground" />
            Live drop
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Bag (0)
          </span>
        </div>
      </div>
    </header>
  );
}
