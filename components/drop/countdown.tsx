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

  const segments = [
    { v: t ? pad(t.hours) : "--", k: "hrs" },
    { v: t ? pad(t.minutes) : "--", k: "min" },
    { v: t ? pad(t.seconds) : "--", k: "sec" },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
        {label}
      </span>
      <div className="flex items-end gap-3">
        {segments.map((seg, i) => (
          <div key={seg.k} className="flex items-end gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`font-mono text-5xl leading-none tabular-nums tracking-tight ${
                  phase === "ENDED" ? "text-faint" : "text-accent"
                }`}
              >
                {seg.v}
              </span>
              <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                {seg.k}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span
                className={`pb-5 font-mono text-3xl leading-none ${
                  phase === "ENDED" ? "text-faint" : "text-accent"
                }`}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
