"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={
        !mounted
          ? "Toggle theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border text-subtle transition-colors duration-200 hover:border-foreground hover:text-foreground"
    >
      {/* keep markup stable until mounted to avoid hydration mismatch */}
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" strokeWidth={1.6} />
        ) : (
          <Moon className="h-4 w-4" strokeWidth={1.6} />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
