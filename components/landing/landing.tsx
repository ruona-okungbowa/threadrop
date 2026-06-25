"use client";

import { useState } from "react";
import { Masthead } from "./masthead";
import { Colophon } from "./colophon";
import { TheIssue } from "./the-issue";
import { TheExpansion } from "./the-expansion";

export type Screen = "home" | "expansion";

/** Nav actions shared by the masthead, colophon and in-page CTAs. */
export type NavHandlers = {
  screen: Screen;
  goHome: () => void;
  goExpansion: () => void;
  goLookbook: () => void;
  goDrop: () => void;
};

// Fractal-noise film grain, lifted from the design. Sits fixed over everything.
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Landing() {
  const [screen, setScreen] = useState<Screen>("home");

  const scrollToEl = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const y = el.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: y, behavior: "smooth" });
    return true;
  };

  const goHome = () => {
    setScreen("home");
    window.scrollTo(0, 0);
  };
  const goExpansion = () => {
    setScreen("expansion");
    window.scrollTo(0, 0);
  };

  // Lookbook / drop nav targets an in-page anchor. If we're already on the home
  // screen the element is there now; otherwise switch screens and poll a few
  // frames until the home screen has committed, then smooth-scroll.
  const scrollToId = (id: string) => {
    if (scrollToEl(id)) return;
    setScreen("home");
    let tries = 0;
    const tick = () => {
      if (scrollToEl(id) || tries++ > 20) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const nav: NavHandlers = {
    screen,
    goHome,
    goExpansion,
    goLookbook: () => scrollToId("tr-lookbook"),
    goDrop: () => scrollToId("tr-drop"),
  };

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")` }}
      />

      <Masthead nav={nav} />

      {screen === "home" ? <TheIssue nav={nav} /> : <TheExpansion goHome={goHome} />}

      <Colophon nav={nav} />
    </div>
  );
}
