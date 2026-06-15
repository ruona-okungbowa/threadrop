export type StudioStatus = "LIVE" | "SCHEDULED" | "DRAFT" | "ENDED";
export type DropMode = "FCFS" | "RAFFLE";
export type SizeKey = "XS" | "S" | "M" | "L" | "XL";

export const STUDIO_BRAND = "Atelier Nord";

export interface StudioVariant {
  size: SizeKey;
  stock: number;
  sold: number;
  held: number;
}

export interface StudioDrop {
  id: string;
  title: string;
  edition: string;
  status: StudioStatus;
  mode: DropMode;
  category: string;
  audience: "Men" | "Women" | "Unisex";
  pricePence: number;
  currency: string;
  /** ms since epoch */
  startsAt: number;
  endsAt: number;
  runSize: number;
  variants: StudioVariant[];
  tone: string;
  src?: string;
}

const now = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function sold(vs: StudioVariant[]) {
  return vs.reduce((n, v) => n + v.sold, 0);
}

export const studioDrops: StudioDrop[] = [
  {
    id: "northwind-shell",
    title: "Northwind Shell",
    edition: "Heavyweight Hooded Overshirt — Bone",
    status: "LIVE",
    mode: "FCFS",
    category: "Outerwear",
    audience: "Unisex",
    pricePence: 18500,
    currency: "£",
    startsAt: now - 12 * MIN,
    endsAt: now + 1 * HOUR + 26 * MIN,
    runSize: 50,
    tone: "#7c766a",
    src: "/drop/hero.png",
    variants: [
      { size: "XS", stock: 0, sold: 8, held: 0 },
      { size: "S", stock: 4, sold: 12, held: 1 },
      { size: "M", stock: 1, sold: 17, held: 2 },
      { size: "L", stock: 3, sold: 9, held: 1 },
      { size: "XL", stock: 0, sold: 6, held: 0 },
    ],
  },
  {
    id: "field-parka",
    title: "Field Parka",
    edition: "Waxed Cotton Field Parka — Olive",
    status: "SCHEDULED",
    mode: "RAFFLE",
    category: "Outerwear",
    audience: "Men",
    pricePence: 24500,
    currency: "£",
    startsAt: now + 1 * DAY + 6 * HOUR,
    endsAt: now + 3 * DAY,
    runSize: 40,
    tone: "#6e6b58",
    src: "/feed/field-parka.png",
    variants: [
      { size: "S", stock: 10, sold: 0, held: 0 },
      { size: "M", stock: 14, sold: 0, held: 0 },
      { size: "L", stock: 12, sold: 0, held: 0 },
      { size: "XL", stock: 4, sold: 0, held: 0 },
    ],
  },
  {
    id: "alpine-scarf",
    title: "Alpine Scarf",
    edition: "Brushed Lambswool Scarf — Ash",
    status: "DRAFT",
    mode: "FCFS",
    category: "Accessories",
    audience: "Unisex",
    pricePence: 7500,
    currency: "£",
    startsAt: 0,
    endsAt: 0,
    runSize: 60,
    tone: "#84806f",
    variants: [{ size: "M", stock: 60, sold: 0, held: 0 }],
  },
  {
    id: "harbor-overshirt",
    title: "Harbor Overshirt",
    edition: "Cotton Canvas Overshirt — Stone",
    status: "ENDED",
    mode: "FCFS",
    category: "Outerwear",
    audience: "Unisex",
    pricePence: 13500,
    currency: "£",
    startsAt: now - 9 * DAY,
    endsAt: now - 6 * DAY,
    runSize: 50,
    tone: "#7c7461",
    src: "/feed/canvas-overshirt.png",
    variants: [
      { size: "S", stock: 0, sold: 12, held: 0 },
      { size: "M", stock: 0, sold: 18, held: 0 },
      { size: "L", stock: 0, sold: 14, held: 0 },
      { size: "XL", stock: 0, sold: 6, held: 0 },
    ],
  },
  {
    id: "fjord-knit",
    title: "Fjord Knit",
    edition: "Chunky Merino Crew — Oat",
    status: "ENDED",
    mode: "RAFFLE",
    category: "Knitwear",
    audience: "Women",
    pricePence: 16000,
    currency: "£",
    startsAt: now - 16 * DAY,
    endsAt: now - 13 * DAY,
    runSize: 45,
    tone: "#837c6c",
    variants: [
      { size: "XS", stock: 0, sold: 10, held: 0 },
      { size: "S", stock: 0, sold: 14, held: 0 },
      { size: "M", stock: 0, sold: 13, held: 0 },
      { size: "L", stock: 0, sold: 8, held: 0 },
    ],
  },
];

export function dropById(id: string) {
  return studioDrops.find((d) => d.id === id);
}

export function soldCount(d: StudioDrop) {
  return sold(d.variants);
}

export function revenuePence(d: StudioDrop) {
  return soldCount(d) * d.pricePence;
}

export function remainingCount(d: StudioDrop) {
  return d.variants.reduce((n, v) => n + v.stock, 0);
}

export function heldCount(d: StudioDrop) {
  return d.variants.reduce((n, v) => n + v.held, 0);
}

export function formatPrice(pence: number, currency: string) {
  return `${currency}${(pence / 100).toFixed(2)}`;
}

/** Compact money for metric cards: £4,200 not £4200.00 */
export function formatMoneyCompact(pence: number, currency: string) {
  return `${currency}${Math.round(pence / 100).toLocaleString("en-GB")}`;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Fri 18:00" style launch label in mono. */
export function formatLaunch(ts: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${DOW[d.getDay()]} ${d.getDate().toString().padStart(2, "0")} · ${hh}:${mm}`;
}

export const STATUS_ORDER: Record<StudioStatus, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  DRAFT: 2,
  ENDED: 3,
};
