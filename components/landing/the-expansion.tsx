type Phase = {
  num: string;
  region: string;
  status: string;
  statusColor: string;
  numColor: string;
  note: string;
  cities: string[];
};

const PHASES: Phase[] = [
  {
    num: "01",
    region: "Nigeria",
    status: "Now live",
    statusColor: "#1f7a4d",
    numColor: "#a23b27",
    note: "Where it begins. Independent labels across the country, fulfilled from their own workshops — Lagos leading, the rest of Nigeria close behind.",
    cities: ["Lagos", "Abuja", "Enugu", "Port Harcourt", "Ibadan"],
  },
  {
    num: "02",
    region: "West Africa",
    status: "Q3 2026",
    statusColor: "#a23b27",
    numColor: "#15110d",
    note: "The nearest scenes first. Shared language, shared logistics, shared audience — a natural next ring around Lagos.",
    cities: ["Accra", "Dakar", "Abidjan", "Lomé"],
  },
  {
    num: "03",
    region: "Global capitals",
    status: "2027",
    statusColor: "#8c7e5f",
    numColor: "#15110d",
    note: "Fashion capitals on every continent, each with its own fulfilment hub so drops stay fast and local.",
    cities: ["Nairobi", "London", "São Paulo", "Seoul"],
  },
  {
    num: "04",
    region: "The diaspora",
    status: "2027+",
    statusColor: "#8c7e5f",
    numColor: "#15110d",
    note: "Closing the loop with the cities that already buy the most — bringing the line home to communities everywhere.",
    cities: ["New York", "Atlanta", "Toronto", "Paris"],
  },
];

export function TheExpansion({ goHome }: { goHome: () => void }) {
  return (
    <div>
      {/* HERO */}
      <section className="relative z-20 border-b border-border bg-background px-5 pb-16 pt-20 md:px-14">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-dark">
          The expansion · Our map
        </span>
        <h1 className="mt-6 max-w-[16ch] font-serif text-[44px] font-light leading-[0.9] tracking-[-0.03em] text-balance sm:text-[58px] md:text-[92px]">
          Lagos first.{" "}
          <span className="italic text-[#5e5440]">Then everywhere.</span>
        </h1>
        <div className="mt-[30px] flex flex-wrap items-end justify-between gap-10">
          <p className="max-w-[58ch] text-[14px] leading-[1.85] text-[#5e5440]">
            Lagos is the first issue, not the limit. We prove the model where the
            gap is most visible — global demand, independent labels, limited
            production — then open the same fair line, city by city, to the rest
            of the world. Here&apos;s the order, and the dates.
          </p>
          <div className="text-right">
            <span className="block font-serif text-[52px] font-light leading-none text-accent">
              04
            </span>
            <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
              phases to global
            </span>
          </div>
        </div>
      </section>

      {/* WHY LAGOS FIRST */}
      <section className="relative z-20 border-b border-[#c2d2bb] bg-[#dfe7d6] px-5 py-16 text-[#28382c] md:px-14">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#4d7a5b]">
          Why Lagos first
        </span>
        <p className="mt-[22px] max-w-[30ch] font-serif text-[34px] font-light leading-[1.34] tracking-[-0.015em] text-[#28382c] text-pretty">
          It starts in Lagos because the gap is visible here — global demand,
          independent labels, limited production, and buyers everywhere trying to
          reach the same pieces.
        </p>
        <div className="mt-[30px] flex flex-wrap items-center gap-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#4d7a5b]">
            The same line exists in
          </span>
          {["Accra", "London", "São Paulo", "Seoul"].map((c) => (
            <span
              key={c}
              className="rounded-full border border-[#bcccb5] px-[13px] py-1.5 text-[11px] tracking-[0.04em] text-[#3a5a44]"
            >
              {c}
            </span>
          ))}
          <span className="text-[11px] tracking-[0.04em] text-[#4d7a5b]">
            — and beyond.
          </span>
        </div>
      </section>

      {/* THE ROLLOUT */}
      <section className="relative z-20 bg-[#f0e7d5] px-5 py-[72px] text-[#15110d] md:px-14">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          The rollout
        </span>
        <div className="mt-9 flex flex-col">
          {PHASES.map((p) => (
            <div
              key={p.num}
              className="grid items-start gap-6 border-t border-[#d2c4a4] py-[30px] md:grid-cols-[120px_1.1fr_1.4fr_150px] md:gap-8"
            >
              <span
                className="font-serif text-[40px] font-light leading-[0.9]"
                style={{ color: p.numColor }}
              >
                {p.num}
              </span>
              <div>
                <span className="block font-serif text-[24px] tracking-[-0.01em]">
                  {p.region}
                </span>
                <span
                  className="mt-2.5 inline-flex items-center gap-[7px] font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: p.statusColor }}
                >
                  <span
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: p.statusColor }}
                  />
                  {p.status}
                </span>
              </div>
              <p className="text-[13px] leading-[1.75] text-[#5c5240]">{p.note}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-[#d2c4a4] px-[11px] py-[5px] text-[10px] tracking-[0.04em] text-[#5c5240]"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-[#d2c4a4]" />
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-20 border-t border-border bg-background px-5 py-[72px] md:px-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="border-t-2 border-gold-dark pt-5">
            <span className="block font-serif text-[46px] font-light text-foreground">
              24 → 300
            </span>
            <p className="mt-3.5 text-[13px] leading-[1.75] text-[#5e5440]">
              Independent labels onboarded by the end of phase two — every one
              vetted, every drop fulfilled from its own city.
            </p>
          </div>
          <div className="border-t-2 border-border pt-5">
            <span className="block font-serif text-[46px] font-light text-foreground">
              14 cities
            </span>
            <p className="mt-3.5 text-[13px] leading-[1.75] text-[#5e5440]">
              Local fulfilment hubs across continents, so a drop ships from the
              nearest one — tracked, in days not weeks.
            </p>
          </div>
          <div className="border-t-2 border-border pt-5">
            <span className="block font-serif text-[46px] font-light text-foreground">
              0 oversells
            </span>
            <p className="mt-3.5 text-[13px] leading-[1.75] text-[#5e5440]">
              The promise doesn&apos;t change as we scale. One fair line per drop,
              anywhere in the world, no piece sold twice.
            </p>
          </div>
        </div>
      </section>

      {/* FOR LABELS — apply */}
      <section className="relative z-20 bg-accent px-5 py-[72px] text-accent-foreground md:px-14">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#f0d6c0]">
              For labels · Always curated, always independent
            </span>
            <h2 className="mt-4 font-serif text-[46px] font-light leading-[1.04] tracking-[-0.02em] text-balance">
              The world is discovering independent fashion. Bring your next drop
              to the line.
            </h2>
            <p className="mt-[18px] max-w-[46ch] text-[14px] leading-[1.8] text-[#f3ddd0]">
              Join a global movement of independent labels building what&apos;s
              next. We open new cities a few brands at a time — tell us where you
              make your clothes, and we&apos;ll reach out when your city is up.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Label name"
              className="h-[50px] rounded-[var(--radius)] border border-[rgba(240,231,213,0.32)] bg-[rgba(21,17,13,0.18)] px-4 font-mono text-[13px] text-accent-foreground outline-none placeholder:text-[#f0d6c0]/70 focus:border-accent-foreground"
            />
            <input
              type="text"
              placeholder="City — e.g. Accra, Nairobi, London"
              className="h-[50px] rounded-[var(--radius)] border border-[rgba(240,231,213,0.32)] bg-[rgba(21,17,13,0.18)] px-4 font-mono text-[13px] text-accent-foreground outline-none placeholder:text-[#f0d6c0]/70 focus:border-accent-foreground"
            />
            <button
              type="submit"
              className="h-[50px] rounded-[var(--radius)] bg-ink font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-foreground transition-opacity hover:opacity-90"
            >
              Apply as a brand →
            </button>
            <button
              type="button"
              onClick={goHome}
              className="mt-1 self-start font-mono text-[11px] uppercase tracking-[0.16em] text-[#f0d6c0] transition-opacity hover:opacity-80"
            >
              ← Back to the issue
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
