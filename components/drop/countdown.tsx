"use client";

import { useCountdown, pad } from "./use-countdown";

type Phase = "PRELAUNCH" | "LIVE" | "ENDED";

export function Countdown({
  startsAt,
  endsAt,
  phase,
}: {
  startsAt: number;
  endsAt: number;
  phase: Phase;
}) {
  const target = phase === "PRELAUNCH" ? startsAt : endsAt;
  const t = useCountdown(target);

  const label =
    phase === "PRELAUNCH"
      ? "Drops in"
      : phase === "LIVE"
        ? "Closes in"
        : "Drop closed";

  const value = t
    ? `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`
    : "--:--:--";

  // A deliberate middle tier: hairline rules set the countdown apart as its own
  // moment — larger and tabular — without reviving the oversized clock.
  return (
    <div className="flex items-center justify-between border-y border-border py-3.5">
      <span className="flex items-center gap-2.5">
        {phase !== "ENDED" && (
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
        )}
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
          {label}
        </span>
      </span>
      <span
        className={`font-mono text-lg tabular-nums tracking-[0.04em] ${
          phase === "ENDED" ? "text-faint" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
