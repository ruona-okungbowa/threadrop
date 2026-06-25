import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

export const metadata: Metadata = {
  title: "Threadrop — Drops for the brands the world is discovering",
  description:
    "A global fashion-drop platform for independent labels. Limited, numbered runs. One fair line, no oversell — no piece is ever sold twice.",
};

export default function Page() {
  return <Landing />;
}
