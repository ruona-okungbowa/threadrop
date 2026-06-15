"use client";

import { useEffect, useState } from "react";

export interface TimeParts {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diff(target: number): TimeParts {
  const total = Math.max(0, target - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / 1000 / 60 / 60);
  return { total, hours, minutes, seconds };
}

/** Ticks every second toward a target epoch ms. Returns null until mounted (avoids hydration drift). */
export function useCountdown(target: number): TimeParts | null {
  const [parts, setParts] = useState<TimeParts | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}

export const pad = (n: number) => n.toString().padStart(2, "0");
