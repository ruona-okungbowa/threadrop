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

  // A quiet, single-line readout — present, but not competing with the title or action.
  return (
    <div className="flex items-center gap-2.5">
      {phase !== "ENDED" && (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
      )}
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular-nums tracking-tight ${
          phase === "ENDED" ? "text-faint" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
