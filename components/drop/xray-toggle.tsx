"use client";

import { useXray } from "@/lib/xray-context";

export function XrayToggle() {
  const { on, setOn } = useXray();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Toggle under-the-hood data layer view"
      onClick={() => setOn(!on)}
      className="group inline-flex items-center gap-2.5"
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-200 ${
          on ? "text-accent" : "text-faint group-hover:text-subtle"
        }`}
      >
        Under the hood
      </span>
      <span
        className={`relative inline-flex h-[18px] w-8 items-center rounded-full border transition-colors duration-200 ${
          on ? "border-accent bg-accent/15" : "border-border bg-muted-2"
        }`}
      >
        <span
          className={`absolute h-3 w-3 rounded-full transition-all duration-200 ease-out ${
            on
              ? "left-[15px] bg-accent"
              : "left-[2px] bg-faint group-hover:bg-subtle"
          }`}
        />
      </span>
    </button>
  );
}
